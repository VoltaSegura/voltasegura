import { codificar, decodificar, type PontoGeometria } from './geometria';
import { ErroServico } from './erros';
import { CODIGO_FORMATO, validarRespostaConsulta } from './validar';
import type { EntradaConsulta, ServicoConsulta } from './consulta';
import type { FaixaDoDia, FocoRota, ModoTrecho, RespostaConsulta, Rota, Trecho } from './tipos';

/**
 * Adaptador OpenTripPlanner 2 (GraphQL, `scripts/otp2/consultar_teste.py`) para o contrato do app.
 * Só roteamento: exposição, categorias e panorama NÃO vêm do OTP2 e saem como indisponíveis
 * (`null`, `fontes.exposicao = 'indisponivel'`), nunca como zero nem como número inventado.
 * Campos da consulta conferidos no schema GraphQL do OTP2 v2.10.0 (`planConnection.routingErrors`,
 * `RoutingErrorCode`, `Mode`) em 15/11/2026. Não escreve em log.
 */

/**
 * Tempo máximo de espera pelo OTP2. [HIPÓTESE] 45 s (B-50): em aparelho, uma consulta longa
 * (Butantã → Pirituba, madrugada) levou ~16 s e outra estourou os 20 s anteriores.
 */
export const TEMPO_LIMITE_OTP2_MS = 45_000;
export const CODIGO_TEMPO_ESGOTADO = 'TEMPO_ESGOTADO';

export const CONSULTA_OTP2 = `
query ($origem: PlanCoordinateInput!, $destino: PlanCoordinateInput!, $saida: OffsetDateTime!, $n: Int) {
  planConnection(
    origin: { location: { coordinate: $origem } }
    destination: { location: { coordinate: $destino } }
    dateTime: { earliestDeparture: $saida }
    first: $n
  ) {
    routingErrors { code }
    edges { node {
      start end duration walkDistance numberOfTransfers
      legs {
        mode distance duration
        start { scheduledTime } end { scheduledTime }
        from { name } to { name }
        route { shortName longName }
        legGeometry { points }
      }
    } }
  }
}`;

interface LegOtp2 {
  mode?: string;
  distance?: number;
  duration?: number;
  start?: { scheduledTime?: string };
  end?: { scheduledTime?: string };
  from?: { name?: string | null };
  to?: { name?: string | null };
  route?: { shortName?: string | null; longName?: string | null } | null;
  legGeometry?: { points?: string } | null;
}

interface NoOtp2 {
  start?: string;
  end?: string;
  duration?: number;
  numberOfTransfers?: number;
  legs?: LegOtp2[];
}

export interface RespostaOtp2 {
  data?: {
    planConnection?: {
      routingErrors?: ({ code?: string } | null)[] | null;
      edges?: ({ node?: NoOtp2 | null } | null)[] | null;
    } | null;
  } | null;
  errors?: unknown[];
}

const MODOS: Record<string, ModoTrecho> = {
  WALK: 'A_PE',
  BUS: 'ONIBUS',
  TROLLEYBUS: 'ONIBUS', // trólebus da SPTrans: para a pessoa, é ônibus
  SUBWAY: 'METRO',
  RAIL: 'TREM',
};

/** Faixas da SSP (docs/08): madrugada 0-5, manhã 6-11, tarde 12-17, noite 18-23, em horário de São Paulo (UTC-3). */
export function faixaDoDia(iso: string | undefined): FaixaDoDia | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const hora = new Date(t - 3 * 3600_000).getUTCHours();
  if (hora < 6) return 'MADRUGADA';
  if (hora < 12) return 'MANHA';
  if (hora < 18) return 'TARDE';
  return 'NOITE';
}

const minutos = (s: number | undefined) => Math.max(0, Math.round((s ?? 0) / 60));
const km = (m: number | undefined) => Math.round(((m ?? 0) / 1000) * 100) / 100;

function mapearTrecho(leg: LegOtp2, rotaId: string, ordem: number): Trecho | null {
  const modo = MODOS[leg.mode ?? ''];
  const geometria = leg.legGeometry?.points;
  // Modo desconhecido ou geometria ausente/ilegível: a rota inteira vira inválida (não se desenha trajeto pela metade).
  if (!modo || !geometria || decodificar(geometria).length < 2) return null;
  const aPe = modo === 'A_PE';
  const linha = leg.route?.shortName || leg.route?.longName || null;
  return {
    id: `${rotaId}-t${ordem}`,
    ordem,
    modo,
    linha: aPe ? null : linha,
    embarque: aPe ? null : (leg.from?.name ?? null),
    desembarque: aPe ? null : (leg.to?.name ?? null),
    partidaPrevista: leg.start?.scheduledTime ?? null,
    duracaoMin: minutos(leg.duration),
    distanciaKm: km(leg.distance),
    faixaDoDia: aPe ? faixaDoDia(leg.start?.scheduledTime) : null,
    geometria,
  };
}

/** Une as geometrias dos trechos sem repetir o vértice de conexão. */
export function unirGeometrias(trechos: Trecho[]): string {
  const pontos: PontoGeometria[] = [];
  for (const t of trechos) {
    const seg = decodificar(t.geometria);
    const inicio = pontos.length && seg.length && pontos[pontos.length - 1].lat === seg[0].lat
      && pontos[pontos.length - 1].lon === seg[0].lon ? 1 : 0;
    pontos.push(...seg.slice(inicio));
  }
  return codificar(pontos);
}

function mapearNo(no: NoOtp2, indice: number): Rota | null {
  const legs = no.legs ?? [];
  if (!legs.length || !no.start || !no.end) return null;
  const id = `r${indice + 1}`;
  const trechos: Trecho[] = [];
  for (const leg of legs) {
    const t = mapearTrecho(leg, id, trechos.length + 1);
    if (!t) return null;
    trechos.push(t);
  }
  const caminhadaKm = Math.round(trechos.filter((t) => t.modo === 'A_PE')
    .reduce((s, t) => s + t.distanciaKm, 0) * 100) / 100;
  const embarques = trechos.filter((t) => t.modo !== 'A_PE').length;
  return {
    id,
    focos: [],
    duracaoMin: minutos(no.duration),
    caminhadaKm,
    trocas: no.numberOfTransfers ?? Math.max(0, embarques - 1),
    saidaPrevista: no.start,
    chegadaPrevista: no.end,
    geometria: unirGeometrias(trechos),
    trechos,
    // exposição desconhecida: sem número, sem zero
    exposicao: { registros: null, kmAPe: caminhadaKm, registrosPorKm: null, cobertura: null },
    categorias: {
      furto: { total: null, outros: null, carga: null, veiculo: null },
      roubo: { total: null, outros: null, carga: null, veiculo: null, latrocinio: null },
      transito: { total: null },
    },
  };
}

/** Menor tempo e menos caminhada entre TODAS as candidatas (empate: a primeira). Só roteamento: sem foco de exposição. */
function atribuirFocos(rotas: Rota[]): Rota[] {
  if (!rotas.length) return [];
  const menor = (chave: (r: Rota) => number) => rotas.reduce((a, b) => (chave(b) < chave(a) ? b : a));
  const rapida = menor((r) => r.duracaoMin);
  const curta = menor((r) => r.caminhadaKm);
  rapida.focos.push('MENOR_TEMPO');
  curta.focos.push('MENOS_CAMINHADA');
  if (rapida === curta && rotas.length > 1) {
    const segunda = rotas.filter((r) => r !== rapida).reduce((a, b) => (b.duracaoMin < a.duracaoMin ? b : a));
    segunda.focos.push('OUTRA_OPCAO' satisfies FocoRota);
  }
  return rotas.filter((r) => r.focos.length > 0).sort((a, b) => a.duracaoMin - b.duracaoMin);
}

function respostaSoRoteamento(rotas: Rota[]): RespostaConsulta {
  return {
    exemplo: false,
    fontes: { roteamento: 'otp2', exposicao: 'indisponivel' },
    caso: 'INDISPONIVEL',
    motivo: null,
    rotas,
    sobreOsDados: {
      fonte: 'GTFS SPTrans (ônibus, Metrô e CPTM) e OpenStreetMap, via OpenTripPlanner. Horários programados, sem tempo real.',
      periodo: { inicio: '', fim: '', meses: 0 },
      // a data do GTFS carregado no OTP2 o app ainda não conhece: vazio, nunca a data de hoje [EM ABERTO]
      atualizacao: { ssp: '', gtfs: '' },
    },
    panoramaMunicipal: {
      periodo: { inicio: '', fim: '' },
      homicidioDoloso: null,
      tentativaHomicidio: null,
      estupro: null,
      estuproVulneravel: null,
    },
  };
}

/**
 * Pura: resposta do OTP2 → contrato do app.
 * - `errors` do GraphQL ou formato sem `planConnection`: `INDISPONIVEL`.
 * - Nenhum itinerário e `OUTSIDE_BOUNDS`: `FORA_DA_AREA`.
 * - Nenhum itinerário por outro motivo (sem linha no horário, fora do período do GTFS, sem parada
 *   perto, caminhar é melhor...): resposta válida com zero rotas; a tela de busca diz que não há
 *   alternativa de transporte público e oferece mudar o horário.
 * - Itinerários vieram, mas nenhum utilizável (modo desconhecido, sem geometria): `INDISPONIVEL`.
 */
export function mapearOtp2(resposta: RespostaOtp2): RespostaConsulta {
  if (resposta?.errors?.length) throw new ErroServico('INDISPONIVEL');
  const plano = resposta?.data?.planConnection;
  if (!plano || typeof plano !== 'object') throw new ErroServico('INDISPONIVEL', CODIGO_FORMATO);
  const nos = (Array.isArray(plano.edges) ? plano.edges : [])
    .map((e) => e?.node)
    .filter((n): n is NoOtp2 => !!n && typeof n === 'object');
  if (!nos.length) {
    const codigos = (Array.isArray(plano.routingErrors) ? plano.routingErrors : []).map((e) => e?.code);
    if (codigos.includes('OUTSIDE_BOUNDS')) throw new ErroServico('FORA_DA_AREA');
    return respostaSoRoteamento([]);
  }
  const candidatas = nos
    .map((n, i) => mapearNo(n, i))
    .filter((r): r is Rota => r !== null);
  if (!candidatas.length) throw new ErroServico('INDISPONIVEL');
  // mesma régua do modo api: o que sai daqui fecha o contrato (horário com fuso, geometria, ids)
  return validarRespostaConsulta(respostaSoRoteamento(atribuirFocos(candidatas)));
}

/** Junta o cancelamento de quem chamou com o tempo limite, sem depender de `AbortSignal.any`. */
function combinarSinais(externo: AbortSignal | undefined, tempoMs: number) {
  const controlador = new AbortController();
  let esgotou = false;
  const aoCancelar = () => controlador.abort();
  externo?.addEventListener('abort', aoCancelar);
  const relogio = setTimeout(() => {
    esgotou = true;
    controlador.abort();
  }, tempoMs);
  return {
    signal: controlador.signal,
    esgotou: () => esgotou,
    limpar: () => {
      clearTimeout(relogio);
      externo?.removeEventListener('abort', aoCancelar);
    },
  };
}

/**
 * Rastro no terminal do Metro (só em desenvolvimento e fora dos testes): URL, tempo e desfecho.
 * Nunca registra origem, destino ou horário da pessoa (regras de PII/LGPD).
 */
function registrarOtp2(mensagem: string): void {
  if (typeof __DEV__ !== 'undefined' && __DEV__ && process.env.NODE_ENV !== 'test') console.log(`[otp2] ${mensagem}`);
}

const erroCancelado = () => Object.assign(new Error('Consulta cancelada'), { name: 'AbortError' });

/**
 * `POST {urlBase}/otp/gtfs/v1`. Erros: rede = `SEM_REDE`; tempo esgotado = `INDISPONIVEL` com status 504
 * (a tela já mostra "O servidor demorou para responder"); HTTP de erro ou JSON ilegível = `INDISPONIVEL`;
 * cancelamento de quem chamou = `AbortError` (a busca descarta). Nunca devolve fixture.
 */
export function criarConsultaOtp2(
  urlBase: string,
  config: { tempoLimiteMs?: number } = {},
): ServicoConsulta {
  const tempoLimiteMs = config.tempoLimiteMs ?? TEMPO_LIMITE_OTP2_MS;
  return {
    async consultarRotas(entrada: EntradaConsulta, opcoes) {
      if (opcoes?.signal?.aborted) throw erroCancelado();
      const sinais = combinarSinais(opcoes?.signal, tempoLimiteMs);
      const inicio = Date.now();
      const decorrido = () => `${((Date.now() - inicio) / 1000).toFixed(1)} s`;
      registrarOtp2(`POST ${urlBase}/otp/gtfs/v1 (limite ${tempoLimiteMs / 1000} s)`);
      /** Traduz a falha de `fetch` ou de `json()`; quem cancelou ou o relógio têm prioridade. */
      const falha = (e: unknown, status: number | null): never => {
        registrarOtp2(
          sinais.esgotou()
            ? `tempo esgotado após ${decorrido()}: o celular alcança ${urlBase}? (abra ${urlBase}/graphiql no navegador dele)`
            : `falhou após ${decorrido()}: ${(e as { message?: string })?.message ?? String(e)}`,
        );
        if (sinais.esgotou()) throw new ErroServico('INDISPONIVEL', CODIGO_TEMPO_ESGOTADO, 504);
        if (opcoes?.signal?.aborted || (e as { name?: string })?.name === 'AbortError') throw erroCancelado();
        throw status === null
          ? new ErroServico('SEM_REDE')
          : new ErroServico('INDISPONIVEL', CODIGO_FORMATO, status);
      };
      try {
        let resposta: Response;
        try {
          resposta = await fetch(`${urlBase}/otp/gtfs/v1`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              query: CONSULTA_OTP2,
              variables: {
                origem: { latitude: entrada.origem.lat, longitude: entrada.origem.lon },
                destino: { latitude: entrada.destino.lat, longitude: entrada.destino.lon },
                saida: entrada.saida,
                n: 5,
              },
            }),
            signal: sinais.signal,
          });
        } catch (e) {
          return falha(e, null);
        }
        registrarOtp2(`HTTP ${resposta.status} em ${decorrido()}`);
        if (!resposta.ok) throw new ErroServico('INDISPONIVEL', null, resposta.status);
        let json: RespostaOtp2;
        try {
          json = (await resposta.json()) as RespostaOtp2;
        } catch (e) {
          return falha(e, resposta.status);
        }
        if (opcoes?.signal?.aborted) throw erroCancelado();
        const itinerarios = json?.data?.planConnection?.edges?.length ?? 0;
        registrarOtp2(`${itinerarios} itinerário(s) recebido(s) em ${decorrido()}`);
        return mapearOtp2(json);
      } finally {
        sinais.limpar();
      }
    },
  };
}
