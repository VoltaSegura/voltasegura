import type { EntradaConsulta, ServicoConsulta } from './consulta';
import { codificar, decodificar, semPontosRepetidos, type PontoGeometria } from './geometria';
import { faixaDoDia, unirGeometrias } from './otp2';
import type { RespostaConsulta, Rota, Trecho } from './tipos';
import { validarRespostaConsulta } from './validar';

/**
 * Variações de caminhada (B-58, decisão do Lucas de 17/11/2026, D-32).
 *
 * O OTP2 devolve alternativas otimizadas por tempo: quase sempre com a MESMA caminhada (muda só a linha)
 * ou com caminhadas de tamanhos muito diferentes. Nos dois casos a regra do docs/08 (N e D menores,
 * p < 0,05, estável nas três larguras) não consegue apontar uma rota (0 de 30 trajetos reais em 17/11).
 * Aqui o app gera, para cada alternativa-base, até duas variações em que TODOS os trechos a pé elegíveis
 * passam por outro caminho (um desvio por um ponto à esquerda ou à direita da reta do trecho), com no
 * máximo +30% de comprimento. A comparação continua sendo só "entre as alternativas avaliadas".
 *
 * Regras:
 * - Só trechos a pé com pelo menos 250 m variam (baldeações curtas ficam como estão).
 * - A variação precisa ser outro caminho de fato: menos de 70% dos vértices a até 30 m do trecho original.
 * - Horários: a duração da caminhada nova usa a velocidade do trecho original. Antes do primeiro embarque,
 *   a saída é antecipada; numa baldeação, a variação só vale se ainda der tempo de pegar a próxima condução;
 *   depois do último desembarque, a chegada atrasa.
 * - Qualquer falha (OTP2 fora, tempo esgotado, resposta estranha) devolve as rotas-base intactas.
 * - Nada é registrado em log (as geometrias são deslocamentos da pessoa).
 */

export const TOLERANCIA_COMPRIMENTO = 1.3;
export const TRECHO_MINIMO_KM = 0.25;
export const FATORES_DESVIO: readonly number[] = [0.35, 0.2];
/** Limite de alternativas distintas comparadas pela função de exposição (mesmo `MAX_ROTAS` de exposicao.ts). */
export const MAX_ALTERNATIVAS_COMPARADAS = 5;
export const TEMPO_LIMITE_VARIANTES_MS = 15_000;
const SOBREPOSICAO_MAXIMA = 0.7;
const RAIO_SOBREPOSICAO_M = 30;
/** Velocidade padrão de caminhada (4,8 km/h) quando o trecho original não permite calcular a sua. */
const VELOCIDADE_PADRAO_KM_MIN = 0.08;

export type Lado = 'esquerda' | 'direita';
/** `dados` = caminho escolhido pelos registros da SSP-SP (B-59, `rotaDosDados.ts`). */
export type OrigemVariante = Lado | 'dados';
const SUFIXO: Record<OrigemVariante, string> = { esquerda: 've', direita: 'vd', dados: 'vx' };

// ---------- geometria plana local (metros) ----------

const M_POR_GRAU_LAT = 110_540;
const mPorGrauLon = (lat: number) => 111_320 * Math.cos((lat * Math.PI) / 180);

function paraMetros(p: PontoGeometria, ref: PontoGeometria) {
  return { x: (p.lon - ref.lon) * mPorGrauLon(ref.lat), y: (p.lat - ref.lat) * M_POR_GRAU_LAT };
}

export function distanciaM(a: PontoGeometria, b: PontoGeometria): number {
  const { x, y } = paraMetros(b, a);
  return Math.hypot(x, y);
}

export function comprimentoKm(pontos: readonly PontoGeometria[]): number {
  let total = 0;
  for (let i = 1; i < pontos.length; i += 1) total += distanciaM(pontos[i - 1], pontos[i]);
  return total / 1000;
}

/**
 * Ponto da reta `de`→`ate` na `posicao` (0 a 1; padrão 0,5 = meio), deslocado perpendicularmente em
 * `fator` × o comprimento da reta.
 */
export function pontoDeDesvio(de: PontoGeometria, ate: PontoGeometria, lado: Lado, fator: number, posicao = 0.5): PontoGeometria {
  const { x, y } = paraMetros(ate, de);
  const sinal = lado === 'esquerda' ? 1 : -1;
  // perpendicular à esquerda de (x, y) é (-y, x)
  const mx = x * posicao + sinal * -y * fator;
  const my = y * posicao + sinal * x * fator;
  return { lat: de.lat + my / M_POR_GRAU_LAT, lon: de.lon + mx / mPorGrauLon(de.lat) };
}

function distanciaPontoSegmentoM(p: PontoGeometria, a: PontoGeometria, b: PontoGeometria): number {
  const pa = paraMetros(p, a);
  const ba = paraMetros(b, a);
  const l2 = ba.x * ba.x + ba.y * ba.y;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, (pa.x * ba.x + pa.y * ba.y) / l2));
  return Math.hypot(pa.x - t * ba.x, pa.y - t * ba.y);
}

/**
 * Tira os "vai e volta": quando o caminho chega a um ponto e retorna pela mesma rua (o ponto de desvio caiu
 * no meio da quadra), o trecho repetido é removido. Compara cada vértice novo com o penúltimo guardado.
 */
export function semVaiEVolta(pontos: readonly PontoGeometria[], toleranciaM = 3): PontoGeometria[] {
  const pilha: PontoGeometria[] = [];
  for (const p of pontos) {
    if (pilha.length >= 2 && distanciaM(pilha[pilha.length - 2], p) <= toleranciaM) { pilha.pop(); continue; }
    if (pilha.length >= 1 && distanciaM(pilha[pilha.length - 1], p) <= toleranciaM / 3) continue;
    pilha.push(p);
  }
  return pilha;
}

/** Fração dos vértices de `a` que ficam a até `raioM` da linha `b`. */
export function sobreposicao(a: readonly PontoGeometria[], b: readonly PontoGeometria[], raioM = RAIO_SOBREPOSICAO_M): number {
  if (!a.length || b.length < 2) return 0;
  let perto = 0;
  for (const p of a) {
    for (let i = 1; i < b.length; i += 1) {
      if (distanciaPontoSegmentoM(p, b[i - 1], b[i]) <= raioM) { perto += 1; break; }
    }
  }
  return perto / a.length;
}

// ---------- horários ----------

/** Desloca um horário ISO-8601 em `minutos`, mantendo o fuso escrito no texto. */
export function deslocarIso(iso: string, minutos: number): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const fuso = /([+-])(\d{2}):(\d{2})$/.exec(iso);
  const novo = t + minutos * 60_000;
  if (!fuso) return new Date(novo).toISOString();
  const deslocamento = (fuso[1] === '-' ? -1 : 1) * (Number(fuso[2]) * 60 + Number(fuso[3]));
  return new Date(novo + deslocamento * 60_000).toISOString().slice(0, 19) + fuso[0];
}

// ---------- caminhada pelo OTP2 ----------

export const CONSULTA_CAMINHADA = `
query ($origem: PlanCoordinateInput!, $destino: PlanCoordinateInput!, $saida: OffsetDateTime!) {
  planConnection(
    origin: { location: { coordinate: $origem } }
    destination: { location: { coordinate: $destino } }
    dateTime: { earliestDeparture: $saida }
    modes: { directOnly: true, direct: [WALK] }
    first: 1
  ) { edges { node { legs { legGeometry { points } } } } }
}`;

export type Caminhar = (de: PontoGeometria, ate: PontoGeometria, saida: string) => Promise<PontoGeometria[] | null>;

/** Caminhada a pé entre dois pontos pelo OTP2 (só a geometria). `null` se não houver caminho. */
export function criarCaminharOtp2(urlOtp2: string, fetchImpl: typeof fetch = fetch, sinal?: AbortSignal): Caminhar {
  return async (de, ate, saida) => {
    const res = await fetchImpl(`${urlOtp2}/otp/gtfs/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        query: CONSULTA_CAMINHADA,
        variables: {
          origem: { latitude: de.lat, longitude: de.lon },
          destino: { latitude: ate.lat, longitude: ate.lon },
          saida,
        },
      }),
      signal: sinal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { planConnection?: { edges?: { node?: { legs?: { legGeometry?: { points?: string } | null }[] } | null }[] | null } | null } | null;
    };
    const legs = json?.data?.planConnection?.edges?.[0]?.node?.legs;
    if (!Array.isArray(legs) || !legs.length) return null;
    const pontos = legs.flatMap((l) => decodificar(l?.legGeometry?.points ?? ''));
    return pontos.length >= 2 ? pontos : null;
  };
}

// ---------- variação de um trecho e de uma rota ----------

export interface Desvio { pontos: PontoGeometria[]; km: number }

/** Outro caminho a pé para o trecho, pelo lado pedido; `null` se não houver um aceitável. */
export async function desviarTrecho(trecho: Trecho, lado: Lado, caminhar: Caminhar): Promise<Desvio | null> {
  const original = semPontosRepetidos(decodificar(trecho.geometria));
  if (original.length < 2) return null;
  const kmOriginal = trecho.distanciaKm > 0 ? trecho.distanciaKm : comprimentoKm(original);
  if (kmOriginal < TRECHO_MINIMO_KM) return null;
  const de = original[0];
  const ate = original[original.length - 1];
  if (distanciaM(de, ate) < 1) return null;
  const saida = trecho.partidaPrevista ?? new Date().toISOString();
  for (const fator of FATORES_DESVIO) {
    const via = pontoDeDesvio(de, ate, lado, fator);
    const [ida, volta] = await Promise.all([caminhar(de, via, saida), caminhar(via, ate, saida)]);
    if (!ida || !volta) continue;
    const pontos = semPontosRepetidos(semVaiEVolta([...ida, ...volta]));
    if (pontos.length < 2) continue;
    const km = comprimentoKm(pontos);
    if (km > kmOriginal * TOLERANCIA_COMPRIMENTO) continue;
    if (sobreposicao(pontos, original) >= SOBREPOSICAO_MAXIMA) continue;
    return { pontos, km };
  }
  return null;
}

const arred2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Pura: monta a rota variante a partir da base e dos desvios por id de trecho. `null` se algum desvio
 * numa baldeação fizer perder a próxima condução, ou se nada mudou.
 */
export function montarVariante(base: Rota, lado: OrigemVariante, desvios: ReadonlyMap<string, Desvio>): Rota | null {
  if (!desvios.size) return null;
  const n = base.trechos.length;
  const transporte = base.trechos.map((t, i) => (t.modo !== 'A_PE' ? i : -1)).filter((i) => i >= 0);
  // sem transporte (só a pé): nada vem "antes", tudo conta como "depois" (a chegada atrasa)
  const primeiro = transporte.length ? transporte[0] : 0;
  const ultimo = transporte.length ? transporte[transporte.length - 1] : -1;

  // duração nova e diferença (min) de cada trecho
  const duracao: number[] = [];
  const delta: number[] = [];
  for (const t of base.trechos) {
    const d = desvios.get(t.id);
    if (!d) { duracao.push(t.duracaoMin); delta.push(0); continue; }
    const velocidade = t.duracaoMin > 0 && t.distanciaKm > 0 ? t.distanciaKm / t.duracaoMin : VELOCIDADE_PADRAO_KM_MIN;
    const nova = Math.max(1, Math.round(d.km / velocidade));
    duracao.push(nova);
    delta.push(nova - t.duracaoMin);
  }

  // baldeação: a caminhada nova precisa terminar antes da próxima condução partir
  for (let i = 0; i < n; i += 1) {
    if (!delta[i] || i <= primeiro || i >= ultimo) continue;
    const t = base.trechos[i];
    const proximo = base.trechos.slice(i + 1).find((x) => x.modo !== 'A_PE');
    if (!t.partidaPrevista || !proximo?.partidaPrevista) return null;
    const fim = Date.parse(t.partidaPrevista) + duracao[i] * 60_000;
    if (fim > Date.parse(proximo.partidaPrevista)) return null;
  }

  const antes = delta.slice(0, primeiro).reduce((s, x) => s + x, 0);
  const depois = delta.slice(ultimo + 1).reduce((s, x) => s + x, 0);
  const id = `${base.id}-${SUFIXO[lado]}`;
  const trechos: Trecho[] = base.trechos.map((t, i) => {
    // antes do 1º embarque: o trecho começa mais cedo pela soma dos acréscimos dele e dos seguintes até o embarque
    // depois do último desembarque: começa mais tarde pela soma dos acréscimos anteriores (após o desembarque)
    const desloca = i < primeiro ? -delta.slice(i, primeiro).reduce((s, x) => s + x, 0)
      : i > ultimo ? delta.slice(ultimo + 1, i).reduce((s, x) => s + x, 0)
        : 0;
    const partidaPrevista = t.partidaPrevista && desloca ? deslocarIso(t.partidaPrevista, desloca) : t.partidaPrevista;
    const d = desvios.get(t.id);
    return {
      ...t,
      id: `${id}-t${t.ordem}`,
      partidaPrevista,
      duracaoMin: duracao[i],
      distanciaKm: d ? arred2(d.km) : t.distanciaKm,
      faixaDoDia: t.modo === 'A_PE' ? faixaDoDia(partidaPrevista ?? undefined) : t.faixaDoDia,
      geometria: d ? codificar(d.pontos) : t.geometria,
    };
  });
  const caminhadaKm = arred2(trechos.filter((t) => t.modo === 'A_PE').reduce((s, t) => s + t.distanciaKm, 0));
  return {
    ...base,
    id,
    focos: [],
    variante: lado === 'dados' ? { deRotaId: base.id, origem: 'dados' } : { deRotaId: base.id },
    duracaoMin: base.duracaoMin + antes + depois,
    caminhadaKm,
    saidaPrevista: antes ? deslocarIso(base.saidaPrevista, -antes) : base.saidaPrevista,
    chegadaPrevista: depois ? deslocarIso(base.chegadaPrevista, depois) : base.chegadaPrevista,
    geometria: unirGeometrias(trechos),
    trechos,
    exposicao: { ...base.exposicao, registros: null, registrosPorKm: null, cobertura: null, kmAPe: caminhadaKm },
  };
}

/** Variação da rota pelo lado pedido: todos os trechos a pé elegíveis desviam. */
export async function gerarVariante(base: Rota, lado: Lado, caminhar: Caminhar): Promise<Rota | null> {
  const aPe = base.trechos.filter((t) => t.modo === 'A_PE');
  const resultados = await Promise.all(aPe.map(async (t) => [t.id, await desviarTrecho(t, lado, caminhar)] as const));
  const desvios = new Map<string, Desvio>();
  for (const [id, d] of resultados) if (d) desvios.set(id, d);
  return montarVariante(base, lado, desvios);
}

/** Chave da caminhada de uma rota: as geometrias canônicas dos trechos a pé, em ordem. */
export function pegadaCaminhada(rota: Rota): string {
  return rota.trechos
    .filter((t) => t.modo === 'A_PE')
    .map((t) => semPontosRepetidos(decodificar(t.geometria)))
    .filter((p) => p.length >= 2)
    .map((p) => codificar(p))
    .join('|');
}

/**
 * Acrescenta variações às rotas-base, por ordem de tempo, até o limite de alternativas distintas
 * comparadas. As bases vêm primeiro, na ordem recebida; as variações, depois.
 */
export async function acrescentarVariantes(rotas: Rota[], caminhar: Caminhar): Promise<Rota[]> {
  const pegadas = new Set(rotas.map(pegadaCaminhada));
  let vagas = MAX_ALTERNATIVAS_COMPARADAS - pegadas.size;
  const novas: Rota[] = [];
  const porTempo = [...rotas].filter((r) => !r.variante).sort((a, b) => a.duracaoMin - b.duracaoMin);
  for (const base of porTempo) {
    if (vagas <= 0) break;
    const candidatas = await Promise.all((['esquerda', 'direita'] as const).map((lado) => gerarVariante(base, lado, caminhar)));
    for (const v of candidatas) {
      if (!v || vagas <= 0) continue;
      const p = pegadaCaminhada(v);
      if (pegadas.has(p)) continue;
      pegadas.add(p);
      novas.push(v);
      vagas -= 1;
    }
  }
  return [...rotas, ...novas];
}

export interface OpcoesVariantes {
  urlOtp2: string;
  tempoLimiteMs?: number;
  fetchImpl?: typeof fetch;
}

/** Envolve o roteamento OTP2: as rotas-base sempre vêm; as variações só se tudo der certo a tempo. */
export function comVariantes(roteamento: ServicoConsulta, opcoes: OpcoesVariantes): ServicoConsulta {
  return {
    async consultarRotas(entrada: EntradaConsulta, op) {
      const base: RespostaConsulta = await roteamento.consultarRotas(entrada, op);
      if (base.fontes.roteamento !== 'otp2' || !base.rotas.length) return base;
      const controle = new AbortController();
      const aoCancelar = () => controle.abort();
      op?.signal?.addEventListener('abort', aoCancelar);
      const relogio = setTimeout(() => controle.abort(), opcoes.tempoLimiteMs ?? TEMPO_LIMITE_VARIANTES_MS);
      try {
        const caminhar = criarCaminharOtp2(opcoes.urlOtp2, opcoes.fetchImpl ?? fetch, controle.signal);
        const rotas = await acrescentarVariantes(base.rotas, caminhar);
        if (rotas.length === base.rotas.length) return base;
        return validarRespostaConsulta({ ...base, rotas });
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
