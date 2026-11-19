import { ErroServico } from './erros';
import { decodificar } from './geometria';
import type {
  CasoConsulta,
  CategoriasRota,
  ExposicaoRota,
  FaixaDoDia,
  FontesConsulta,
  FocoRota,
  ModoTrecho,
  MotivoInsuficiencia,
  RespostaConsulta,
  Rota,
  TotaisCategoria,
  Trecho,
} from './tipos';

/**
 * Validação em tempo de execução do JSON da consulta (B-01, `docs/dados-reais/04_plano_implementacao.md`).
 *
 * Regra: o app nunca inventa número. Duas camadas:
 * - **Roteamento** (rotas, trechos, horários, geometria) e **origem dos dados** (`sobreOsDados`): se o
 *   formato falhar, a consulta inteira vira `ErroServico('INDISPONIVEL', 'FORMATO')` (a tela mostra
 *   "Tentar de novo"); não se desenha trajeto pela metade.
 * - **Exposição** (`caso`, `motivo`, `exposicao`, `categorias`, `panoramaMunicipal`): se o formato falhar,
 *   ou se `fontes.exposicao` for `indisponivel`, as rotas seguem, mas todos os números de exposição viram
 *   `null`, `caso` vira `INDISPONIVEL`, `fontes.exposicao` vira `indisponivel` e o foco `MENOR_EXPOSICAO`
 *   sai (sem exposição validada não há "menor exposição").
 * - **Origem** (`exemplo`, `fontes`): `exemplo` tem de bater com `fontes` (é `true` se algum bloco for de
 *   exemplo). Origem incoerente é falha de formato: o app não decide sozinho o que é real.
 *
 * Devolve um objeto novo só com os campos conhecidos. Não escreve em log nem põe valores na mensagem
 * do erro (US-19 AC2).
 */

export const CODIGO_FORMATO = 'FORMATO';

const CASOS: readonly CasoConsulta[] = [
  'CONCLUSIVO', 'SEM_DIFERENCA', 'MISTOS', 'INSUFICIENTE', 'NAO_APLICAVEL', 'SEM_COMPARACAO', 'INDISPONIVEL',
];
const MOTIVOS: readonly MotivoInsuficiencia[] = ['AMOSTRA', 'COBERTURA', 'LARGURA'];
const MODOS: readonly ModoTrecho[] = ['A_PE', 'ONIBUS', 'METRO', 'TREM'];
const FAIXAS: readonly FaixaDoDia[] = ['MADRUGADA', 'MANHA', 'TARDE', 'NOITE'];
const FOCOS: readonly FocoRota[] = ['MENOR_TEMPO', 'MENOS_CAMINHADA', 'MENOR_EXPOSICAO', 'OUTRA_OPCAO'];
const FONTES_ROTEAMENTO: readonly FontesConsulta['roteamento'][] = ['otp2', 'exemplo'];
const FONTES_EXPOSICAO: readonly FontesConsulta['exposicao'][] = ['ssp', 'exemplo', 'indisponivel'];

/** `exemplo` derivado da origem por bloco. */
export function ehExemplo(fontes: FontesConsulta): boolean {
  return fontes.roteamento === 'exemplo' || fontes.exposicao === 'exemplo';
}

/** Falha interna de formato; nunca sai deste módulo. */
class Formato extends Error {}

type Objeto = Record<string, unknown>;

function objeto(v: unknown): Objeto {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) throw new Formato();
  return v as Objeto;
}

function lista(v: unknown): unknown[] {
  if (!Array.isArray(v)) throw new Formato();
  return v;
}

function texto(v: unknown): string {
  if (typeof v !== 'string') throw new Formato();
  return v;
}

function textoNaoVazio(v: unknown): string {
  const s = texto(v);
  if (!s.trim()) throw new Formato();
  return s;
}

function textoOuNulo(v: unknown): string | null {
  return v === null ? null : texto(v);
}

function numero(v: unknown): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) throw new Formato();
  return v;
}

function inteiro(v: unknown, minimo = 0): number {
  const n = numero(v);
  if (!Number.isInteger(n) || n < minimo) throw new Formato();
  return n;
}

function numeroOuNulo(v: unknown): number | null {
  return v === null ? null : numero(v);
}

function inteiroOuNulo(v: unknown): number | null {
  return v === null ? null : inteiro(v);
}

function umDe<T extends string>(v: unknown, opcoes: readonly T[]): T {
  if (typeof v !== 'string' || !(opcoes as readonly string[]).includes(v)) throw new Formato();
  return v as T;
}

const ISO_COM_FUSO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

/** Horário ISO-8601 **com fuso** (o app formata no fuso do aparelho; sem fuso a hora sairia errada). */
function horario(v: unknown): string {
  const s = texto(v);
  if (!ISO_COM_FUSO.test(s) || Number.isNaN(Date.parse(s))) throw new Formato();
  return s;
}

const DATA = /^\d{4}-\d{2}-\d{2}$/;

/** Data "AAAA-MM-DD" ou vazia (desconhecida). */
function dataOuVazia(v: unknown): string {
  const s = texto(v);
  if (s !== '' && (!DATA.test(s) || Number.isNaN(Date.parse(s)))) throw new Formato();
  return s;
}

/** Polyline 5 com pelo menos dois pontos válidos. */
function geometria(v: unknown): string {
  const s = textoNaoVazio(v);
  if (decodificar(s).length < 2) throw new Formato();
  return s;
}

// ---------- roteamento ----------

function validarTrecho(v: unknown): Trecho {
  const t = objeto(v);
  return {
    id: textoNaoVazio(t.id),
    ordem: inteiro(t.ordem, 1),
    modo: umDe(t.modo, MODOS),
    linha: textoOuNulo(t.linha),
    embarque: textoOuNulo(t.embarque),
    desembarque: textoOuNulo(t.desembarque),
    partidaPrevista: t.partidaPrevista === null ? null : horario(t.partidaPrevista),
    duracaoMin: numero(t.duracaoMin),
    distanciaKm: numero(t.distanciaKm),
    faixaDoDia: t.faixaDoDia === null ? null : umDe(t.faixaDoDia, FAIXAS),
    geometria: geometria(t.geometria),
  };
}

type RotaSemExposicao = Omit<Rota, 'exposicao' | 'categorias'>;

function validarRoteamento(v: unknown): RotaSemExposicao {
  const r = objeto(v);
  const trechos = lista(r.trechos).map(validarTrecho);
  if (!trechos.length) throw new Formato();
  if (new Set(trechos.map((t) => t.id)).size !== trechos.length) throw new Formato();
  const focos = lista(r.focos).map((f) => umDe(f, FOCOS));
  const rota: RotaSemExposicao = {
    id: textoNaoVazio(r.id),
    focos: [...new Set(focos)],
    duracaoMin: numero(r.duracaoMin),
    caminhadaKm: numero(r.caminhadaKm),
    trocas: inteiro(r.trocas),
    saidaPrevista: horario(r.saidaPrevista),
    chegadaPrevista: horario(r.chegadaPrevista),
    geometria: geometria(r.geometria),
    trechos,
  };
  // B-58: variação de caminhada gerada pelo app; só aparece quando veio no JSON
  if (r.variante !== undefined) {
    const v = objeto(r.variante);
    rota.variante = { deRotaId: textoNaoVazio(v.deRotaId) };
    if (v.origem !== undefined) rota.variante.origem = umDe(v.origem, ['dados'] as const);
  }
  return rota;
}

function validarSobreOsDados(v: unknown): RespostaConsulta['sobreOsDados'] {
  const s = objeto(v);
  const periodo = objeto(s.periodo);
  const atualizacao = objeto(s.atualizacao);
  return {
    fonte: textoNaoVazio(s.fonte),
    periodo: {
      inicio: dataOuVazia(periodo.inicio),
      fim: dataOuVazia(periodo.fim),
      meses: inteiro(periodo.meses),
    },
    atualizacao: { ssp: dataOuVazia(atualizacao.ssp), gtfs: dataOuVazia(atualizacao.gtfs) },
  };
}

// ---------- exposição ----------

function validarTotais(v: unknown, comLatrocinio: boolean): TotaisCategoria {
  const c = objeto(v);
  const totais: TotaisCategoria = {
    total: inteiroOuNulo(c.total),
    outros: inteiroOuNulo(c.outros),
    carga: inteiroOuNulo(c.carga),
    veiculo: inteiroOuNulo(c.veiculo),
  };
  if (comLatrocinio && c.latrocinio !== undefined) totais.latrocinio = inteiroOuNulo(c.latrocinio);
  return totais;
}

function validarCategorias(v: unknown): CategoriasRota {
  const c = objeto(v);
  return {
    furto: validarTotais(c.furto, false),
    roubo: validarTotais(c.roubo, true),
    transito: { total: inteiroOuNulo(objeto(c.transito).total) },
  };
}

function validarExposicao(v: unknown): ExposicaoRota {
  const e = objeto(v);
  const cobertura = numeroOuNulo(e.cobertura);
  if (cobertura !== null && cobertura > 1) throw new Formato();
  return {
    registros: inteiroOuNulo(e.registros),
    kmAPe: numero(e.kmAPe),
    registrosPorKm: numeroOuNulo(e.registrosPorKm),
    cobertura,
  };
}

function validarPanorama(v: unknown): RespostaConsulta['panoramaMunicipal'] {
  const p = objeto(v);
  const periodo = objeto(p.periodo);
  return {
    periodo: { inicio: dataOuVazia(periodo.inicio), fim: dataOuVazia(periodo.fim) },
    homicidioDoloso: inteiroOuNulo(p.homicidioDoloso),
    tentativaHomicidio: inteiroOuNulo(p.tentativaHomicidio),
    estupro: inteiroOuNulo(p.estupro),
    estuproVulneravel: inteiroOuNulo(p.estuproVulneravel),
  };
}

interface BlocoExposicao {
  caso: CasoConsulta;
  motivo: MotivoInsuficiencia | null;
  porRota: { exposicao: ExposicaoRota; categorias: CategoriasRota }[];
  panoramaMunicipal: RespostaConsulta['panoramaMunicipal'];
}

function validarBlocoExposicao(r: Objeto, rotasBrutas: unknown[]): BlocoExposicao {
  return {
    caso: umDe(r.caso, CASOS),
    motivo: r.motivo === null ? null : umDe(r.motivo, MOTIVOS),
    porRota: rotasBrutas.map((v) => {
      const rota = objeto(v);
      return { exposicao: validarExposicao(rota.exposicao), categorias: validarCategorias(rota.categorias) };
    }),
    panoramaMunicipal: validarPanorama(r.panoramaMunicipal),
  };
}

const totaisNulos = (): TotaisCategoria => ({ total: null, outros: null, carga: null, veiculo: null });

/** Exposição indisponível: sem número, sem zero. `kmAPe` vem do roteamento (é distância, não ocorrência). */
function exposicaoIndisponivel(rota: RotaSemExposicao): Pick<Rota, 'exposicao' | 'categorias'> {
  return {
    exposicao: { registros: null, kmAPe: rota.caminhadaKm, registrosPorKm: null, cobertura: null },
    categorias: {
      furto: totaisNulos(),
      roubo: { ...totaisNulos(), latrocinio: null },
      transito: { total: null },
    },
  };
}

const panoramaIndisponivel = (): RespostaConsulta['panoramaMunicipal'] => ({
  periodo: { inicio: '', fim: '' },
  homicidioDoloso: null,
  tentativaHomicidio: null,
  estupro: null,
  estuproVulneravel: null,
});

// ---------- entrada ----------

/**
 * Confere o JSON recebido e devolve um `RespostaConsulta` limpo.
 * Lança `ErroServico('INDISPONIVEL', 'FORMATO')` se o roteamento ou a origem dos dados não fecharem.
 */
export function validarRespostaConsulta(bruto: unknown): RespostaConsulta {
  let r: Objeto;
  let rotasBrutas: unknown[];
  let rotas: RotaSemExposicao[];
  let fontes: FontesConsulta;
  let sobreOsDados: RespostaConsulta['sobreOsDados'];
  try {
    r = objeto(bruto);
    const f = objeto(r.fontes);
    fontes = { roteamento: umDe(f.roteamento, FONTES_ROTEAMENTO), exposicao: umDe(f.exposicao, FONTES_EXPOSICAO) };
    if (typeof r.exemplo !== 'boolean' || r.exemplo !== ehExemplo(fontes)) throw new Formato();
    rotasBrutas = lista(r.rotas);
    rotas = rotasBrutas.map(validarRoteamento);
    if (new Set(rotas.map((x) => x.id)).size !== rotas.length) throw new Formato();
    sobreOsDados = validarSobreOsDados(r.sobreOsDados);
  } catch (e) {
    if (e instanceof Formato) throw new ErroServico('INDISPONIVEL', CODIGO_FORMATO);
    throw e;
  }

  let bloco: BlocoExposicao | null = null;
  if (fontes.exposicao !== 'indisponivel') {
    try {
      bloco = validarBlocoExposicao(r, rotasBrutas);
    } catch (e) {
      if (!(e instanceof Formato)) throw e;
    }
  }

  if (!bloco) {
    const fontesSemExposicao: FontesConsulta = { ...fontes, exposicao: 'indisponivel' };
    return {
      exemplo: ehExemplo(fontesSemExposicao),
      fontes: fontesSemExposicao,
      caso: 'INDISPONIVEL',
      motivo: null,
      rotas: rotas.map((rota) => ({
        ...rota,
        focos: rota.focos.filter((f) => f !== 'MENOR_EXPOSICAO'),
        ...exposicaoIndisponivel(rota),
      })),
      sobreOsDados,
      panoramaMunicipal: panoramaIndisponivel(),
    };
  }

  const { porRota, caso, motivo, panoramaMunicipal } = bloco;
  return {
    exemplo: ehExemplo(fontes),
    fontes,
    caso,
    motivo,
    rotas: rotas.map((rota, i) => {
      const focos = caso === 'INDISPONIVEL' ? rota.focos.filter((f) => f !== 'MENOR_EXPOSICAO') : rota.focos;
      const validada: Rota = { ...rota, focos, ...porRota[i] };
      // B-59: a confiança só existe junto com o destaque de exposição; formato desconhecido = sem confiança
      const d = (rotasBrutas[i] as Objeto).destaqueExposicao;
      const confianca = d !== null && typeof d === 'object' ? (d as Objeto).confianca : undefined;
      if (focos.includes('MENOR_EXPOSICAO') && (confianca === 'clara' || confianca === 'pequena')) {
        validada.destaqueExposicao = { confianca };
      }
      return validada;
    }),
    sobreOsDados,
    panoramaMunicipal,
  };
}
