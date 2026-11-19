import type { EntradaConsulta, ServicoConsulta } from './consulta';
import {
  comExposicao, criarAvaliadorCaminhos, type AvaliarCaminhos, type EntradaRpcRota, type MedidaCaminho, type OpcoesExposicao,
} from './exposicao';
import { codificar, decodificar, semPontosRepetidos } from './geometria';
import { faixaDoDia } from './otp2';
import type { FocoRota, RespostaConsulta, Rota, Trecho } from './tipos';
import { validarRespostaConsulta } from './validar';
import {
  comprimentoKm, criarCaminharOtp2, distanciaM, montarVariante, pegadaCaminhada, pontoDeDesvio, semVaiEVolta, sobreposicao,
  TOLERANCIA_COMPRIMENTO, TRECHO_MINIMO_KM, type Caminhar, type Desvio, type Lado,
} from './variantesCaminhada';

/**
 * Rota desenhada pelos dados (B-59, decisão do Lucas de 17/11/2026, D-33).
 *
 * O diferencial do VoltaSegura: os registros da SSP-SP escolhem o caminho a pé. Para cada trecho a pé das
 * alternativas mais rápidas do roteador, o app gera vários caminhos candidatos pelo OTP2 (desvios em
 * posições e distâncias diferentes, dos dois lados), a função `comparar_exposicao` do Neon mede os
 * registros perto de cada um e fica o de MENOS registros, desde que:
 * - a cobertura dos dados no caminho seja de pelo menos 80% (docs/08; ausência de registro por falta de
 *   cobertura não pode "ganhar", docs/05);
 * - o caminho tenha no máximo +30% do comprimento do trecho original (D-32);
 * - tenha estritamente menos registros que o caminho original do trecho.
 *
 * Depois da comparação oficial (`comExposicao`), `aplicarPrioridadeDosDados` dá o destaque "menor exposição
 * estimada" à rota com menos registros e cobertura suficiente, em primeiro e já selecionada, sempre com a
 * confiança ao lado: `clara` (CONCLUSIVO, docs/08) ou `pequena` (menos registros, sem diferença estatística).
 *
 * Nunca rotula rua, trecho ou área; nada é registrado em log; qualquer falha devolve as rotas do roteador.
 */

export const COBERTURA_MINIMA = 0.8;
/** Alternativas do roteador (as mais rápidas) que ganham uma rota desenhada pelos dados. */
export const MAX_BASES_BUSCADAS = 2;
export const TEMPO_LIMITE_MOTOR_MS = 20_000;
const CONCORRENCIA_OTP2 = 6;
const SOBREPOSICAO_MAXIMA = 0.7;
const EPS = 1e-9;

/** Onde procurar caminhos: lado, distância da reta (fração do comprimento) e posição ao longo dela. */
export const PONTOS_DE_BUSCA: readonly { lado: Lado; fator: number; posicao: number }[] = [
  ...(['esquerda', 'direita'] as const).flatMap((lado) => [0.15, 0.3, 0.45].map((fator) => ({ lado, fator, posicao: 0.5 }))),
  ...(['esquerda', 'direita'] as const).flatMap((lado) => [0.3, 0.7].map((posicao) => ({ lado, fator: 0.3, posicao }))),
];

/** Limita quantas consultas ao OTP2 correm ao mesmo tempo (o servidor é local e pequeno). */
export function comLimite(caminhar: Caminhar, limite = CONCORRENCIA_OTP2): Caminhar {
  let ativos = 0;
  const fila: (() => void)[] = [];
  const liberar = () => { ativos -= 1; fila.shift()?.(); };
  return async (de, ate, saida) => {
    if (ativos >= limite) await new Promise<void>((ok) => fila.push(ok));
    ativos += 1;
    try { return await caminhar(de, ate, saida); } finally { liberar(); }
  };
}

/** Caminhos candidatos para um trecho a pé (sem o original); vazio se o trecho for curto ou não houver. */
export async function candidatosDoTrecho(trecho: Trecho, caminhar: Caminhar): Promise<Desvio[]> {
  const original = semPontosRepetidos(decodificar(trecho.geometria));
  if (original.length < 2) return [];
  const kmOriginal = trecho.distanciaKm > 0 ? trecho.distanciaKm : comprimentoKm(original);
  if (kmOriginal < TRECHO_MINIMO_KM) return [];
  const de = original[0];
  const ate = original[original.length - 1];
  if (distanciaM(de, ate) < 1) return [];
  const saida = trecho.partidaPrevista ?? new Date().toISOString();
  const achados = await Promise.all(PONTOS_DE_BUSCA.map(async ({ lado, fator, posicao }) => {
    const via = pontoDeDesvio(de, ate, lado, fator, posicao);
    const [ida, volta] = await Promise.all([caminhar(de, via, saida), caminhar(via, ate, saida)]);
    if (!ida || !volta) return null;
    const pontos = semPontosRepetidos(semVaiEVolta([...ida, ...volta]));
    if (pontos.length < 2) return null;
    const km = comprimentoKm(pontos);
    if (km > kmOriginal * TOLERANCIA_COMPRIMENTO) return null;
    if (sobreposicao(pontos, original) >= SOBREPOSICAO_MAXIMA) return null;
    return { pontos, km };
  }));
  const unicos = new Map<string, Desvio>();
  for (const d of achados) if (d) unicos.set(codificar(d.pontos), d);
  return [...unicos.values()];
}

const coberturaBoa = (m: MedidaCaminho | undefined): m is MedidaCaminho & { registros: number } =>
  !!m && m.registros !== null && m.cobertura !== null && m.cobertura >= COBERTURA_MINIMA - EPS;

/**
 * Escolhe, entre o original e os candidatos de um trecho, o de menos registros com cobertura suficiente.
 * Devolve o desvio escolhido ou `null` se o original continua sendo o melhor (ou não dá para saber).
 */
export function escolherPelosDados(
  original: MedidaCaminho | undefined,
  candidatos: { desvio: Desvio; medida: MedidaCaminho | undefined }[],
): Desvio | null {
  if (!coberturaBoa(original)) return null; // sem base confiável para comparar: não troca o caminho
  let melhor: { desvio: Desvio; registros: number } | null = null;
  for (const { desvio, medida } of candidatos) {
    if (!coberturaBoa(medida)) continue;
    if (medida.registros >= original.registros) continue;
    if (!melhor || medida.registros < melhor.registros || (medida.registros === melhor.registros && desvio.km < melhor.desvio.km)) {
      melhor = { desvio, registros: medida.registros };
    }
  }
  return melhor?.desvio ?? null;
}

const faixaDe = (t: Trecho) => t.faixaDoDia ?? faixaDoDia(t.partidaPrevista ?? undefined);

/**
 * Para as alternativas mais rápidas do roteador, desenha a rota cujo caminho a pé tem menos registros.
 * Devolve só as rotas novas (as que de fato mudaram algum trecho).
 */
export async function desenharPelosDados(rotas: Rota[], caminhar: Caminhar, avaliar: AvaliarCaminhos, sinal?: AbortSignal): Promise<Rota[]> {
  const bases = [...rotas].filter((r) => !r.variante).sort((a, b) => a.duracaoMin - b.duracaoMin).slice(0, MAX_BASES_BUSCADAS);
  // 1. candidatos de cada trecho a pé elegível
  type Item = { base: Rota; trecho: Trecho; faixa: NonNullable<Trecho['faixaDoDia']>; candidatos: Desvio[] };
  const itens: Item[] = [];
  await Promise.all(bases.flatMap((base) => base.trechos.filter((t) => t.modo === 'A_PE').map(async (trecho) => {
    const faixa = faixaDe(trecho);
    if (!faixa) return;
    const candidatos = await candidatosDoTrecho(trecho, caminhar);
    if (candidatos.length) itens.push({ base, trecho, faixa, candidatos });
  })));
  if (!itens.length) return [];

  // 2. uma medição só para todos (original + candidatos de cada trecho)
  const entrada: EntradaRpcRota[] = [];
  const idOriginal = (i: number) => `t${i}o`;
  const idCandidato = (i: number, k: number) => `t${i}c${k}`;
  itens.forEach((item, i) => {
    const geometriaOriginal = codificar(semPontosRepetidos(decodificar(item.trecho.geometria)));
    entrada.push({ id: idOriginal(i), trechos_a_pe: [{ geometria: geometriaOriginal, faixa: item.faixa }] });
    item.candidatos.forEach((d, k) => entrada.push({ id: idCandidato(i, k), trechos_a_pe: [{ geometria: codificar(d.pontos), faixa: item.faixa }] }));
  });
  const medidas = await avaliar(entrada, sinal);

  // 3. por trecho, o caminho de menos registros; por base, a rota com os trechos escolhidos
  const desviosPorBase = new Map<string, Map<string, Desvio>>();
  itens.forEach((item, i) => {
    const escolhido = escolherPelosDados(
      medidas.get(idOriginal(i)),
      item.candidatos.map((desvio, k) => ({ desvio, medida: medidas.get(idCandidato(i, k)) })),
    );
    if (!escolhido) return;
    const mapa = desviosPorBase.get(item.base.id) ?? new Map<string, Desvio>();
    mapa.set(item.trecho.id, escolhido);
    desviosPorBase.set(item.base.id, mapa);
  });
  const novas: Rota[] = [];
  const pegadas = new Set(rotas.map(pegadaCaminhada));
  for (const base of bases) {
    const desvios = desviosPorBase.get(base.id);
    if (!desvios) continue;
    const rota = montarVariante(base, 'dados', desvios);
    if (!rota || pegadas.has(pegadaCaminhada(rota))) continue;
    pegadas.add(pegadaCaminhada(rota));
    novas.push(rota);
  }
  return novas;
}

export interface OpcoesRotaDosDados extends OpcoesExposicao {
  urlOtp2: string;
  tempoLimiteMotorMs?: number;
}

/** Envolve o roteamento OTP2: as rotas do roteador sempre vêm; a rota dos dados entra se tudo der certo a tempo. */
export function comRotasDosDados(roteamento: ServicoConsulta, opcoes: OpcoesRotaDosDados): ServicoConsulta {
  return {
    async consultarRotas(entrada: EntradaConsulta, op) {
      const base: RespostaConsulta = await roteamento.consultarRotas(entrada, op);
      if (base.fontes.roteamento !== 'otp2' || !base.rotas.length) return base;
      const avaliar = criarAvaliadorCaminhos(opcoes);
      if (!avaliar) return base; // sem sessão ou sem Data API: o app segue só com o roteador
      const controle = new AbortController();
      const aoCancelar = () => controle.abort();
      op?.signal?.addEventListener('abort', aoCancelar);
      const relogio = setTimeout(() => controle.abort(), opcoes.tempoLimiteMotorMs ?? TEMPO_LIMITE_MOTOR_MS);
      try {
        const caminhar = comLimite(criarCaminharOtp2(opcoes.urlOtp2, opcoes.fetchImpl ?? fetch, controle.signal));
        const novas = await desenharPelosDados(base.rotas, caminhar, avaliar, controle.signal);
        if (!novas.length) return base;
        return validarRespostaConsulta({ ...base, rotas: [...base.rotas, ...novas] });
      } catch {
        if (op?.signal?.aborted) throw Object.assign(new Error('Consulta cancelada'), { name: 'AbortError' });
        return base;
      } finally {
        clearTimeout(relogio);
        op?.signal?.removeEventListener('abort', aoCancelar);
      }
    },
  };
}

/**
 * Pura: dá prioridade à rota com menos registros perto dos trechos a pé (D-33).
 * - Só com exposição real (`ssp`), 2+ rotas e todas com caminhada (uma rota sem trecho a pé é NAO_APLICAVEL, D-12).
 * - Elegível = registros conhecidos, cobertura ≥ 80% e caminhada > 0. A vencedora precisa ter estritamente
 *   menos registros que todas as outras elegíveis com caminhada diferente (gêmeas não contam).
 * - CONCLUSIVO: mantém a vencedora da comparação estatística, com confiança `clara`.
 * - Senão: confiança `pequena`. A vencedora vai para o topo (a tela seleciona a primeira, D-23).
 */
export function aplicarPrioridadeDosDados(resposta: RespostaConsulta): RespostaConsulta {
  if (resposta.fontes.exposicao !== 'ssp' || resposta.rotas.length < 2) return resposta;
  if (resposta.rotas.some((r) => r.exposicao.kmAPe <= 0)) return resposta;

  const conclusiva = resposta.caso === 'CONCLUSIVO' ? resposta.rotas.find((r) => r.focos.includes('MENOR_EXPOSICAO')) : undefined;
  let vencedora = conclusiva;
  if (!vencedora) {
    const elegiveis = resposta.rotas.filter((r) => coberturaBoa(r.exposicao) && r.exposicao.kmAPe > 0);
    if (!elegiveis.length) return resposta;
    const chave = (r: Rota) => [r.exposicao.registros ?? Infinity, r.exposicao.registrosPorKm ?? Infinity, r.duracaoMin];
    const melhor = elegiveis.reduce((a, b) => {
      const [ka, kb] = [chave(a), chave(b)];
      for (let i = 0; i < ka.length; i += 1) if (kb[i] !== ka[i]) return kb[i] < ka[i] ? b : a;
      return a;
    });
    const pegada = pegadaCaminhada(melhor);
    const rivais = elegiveis.filter((r) => pegadaCaminhada(r) !== pegada);
    if (!rivais.length || rivais.some((r) => (r.exposicao.registros as number) <= (melhor.exposicao.registros as number))) return resposta;
    vencedora = melhor;
  }
  const confianca = conclusiva ? 'clara' : 'pequena';
  const idVencedora = vencedora.id;
  const rotas = resposta.rotas.map((r) => {
    const semFoco = r.focos.filter((f) => f !== 'MENOR_EXPOSICAO');
    if (r.id !== idVencedora) {
      const { destaqueExposicao: _descartado, ...resto } = r;
      return { ...resto, focos: semFoco };
    }
    const focos: FocoRota[] = [...semFoco.filter((f) => f !== 'OUTRA_OPCAO'), 'MENOR_EXPOSICAO'];
    return { ...r, focos, destaqueExposicao: { confianca } as const };
  });
  rotas.sort((a, b) => Number(b.id === idVencedora) - Number(a.id === idVencedora));
  return { ...resposta, rotas };
}

/** Pipeline completo do modo `otp2` com exposição real: rota dos dados → comparação → prioridade. */
export function comPrioridadeDosDados(roteamento: ServicoConsulta, opcoes: OpcoesRotaDosDados): ServicoConsulta {
  const comparado = comExposicao(comRotasDosDados(roteamento, opcoes), opcoes);
  return {
    async consultarRotas(entrada, op) {
      return aplicarPrioridadeDosDados(await comparado.consultarRotas(entrada, op));
    },
  };
}

