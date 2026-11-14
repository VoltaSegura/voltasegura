import { codificar, decodificar, type PontoGeometria } from './geometria';
import { ErroServico } from './erros';
import type { EntradaConsulta, ServicoConsulta } from './consulta';
import type { FaixaDoDia, FocoRota, ModoTrecho, RespostaConsulta, Rota, Trecho } from './tipos';

/**
 * Adaptador OpenTripPlanner 2 (GraphQL, `scripts/otp2/consultar_teste.py`) para o contrato do app.
 * [HIPÓTESE] Só roteamento: exposição, categorias e panorama NÃO vêm do OTP2 e saem como
 * indisponíveis (`null`), nunca como zero nem como número inventado. Não escreve em log.
 */

export const CONSULTA_OTP2 = `
query ($origem: PlanCoordinateInput!, $destino: PlanCoordinateInput!, $saida: OffsetDateTime!, $n: Int) {
  planConnection(
    origin: { location: { coordinate: $origem } }
    destination: { location: { coordinate: $destino } }
    dateTime: { earliestDeparture: $saida }
    first: $n
  ) {
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
  data?: { planConnection?: { edges?: { node?: NoOtp2 }[] } | null } | null;
  errors?: unknown[];
}

const MODOS: Record<string, ModoTrecho> = {
  WALK: 'A_PE',
  BUS: 'ONIBUS',
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
  // Modo desconhecido ou sem geometria: a rota inteira vira inválida (não se desenha trajeto pela metade).
  if (!modo || !geometria) return null;
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
function unirGeometrias(trechos: Trecho[]): string {
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
      furto: { total: null, outros: null, carga: null, veiculo: null, latrocinio: null },
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

/** Pura: resposta do OTP2 → contrato do app. Lança INDISPONIVEL se não houver nenhuma rota utilizável. */
export function mapearOtp2(resposta: RespostaOtp2): RespostaConsulta {
  if (resposta?.errors?.length) throw new ErroServico('INDISPONIVEL');
  const nos = resposta?.data?.planConnection?.edges ?? [];
  const candidatas = nos
    .map((e, i) => (e?.node ? mapearNo(e.node, i) : null))
    .filter((r): r is Rota => r !== null);
  if (!candidatas.length) throw new ErroServico('INDISPONIVEL');
  const hoje = new Date().toISOString().slice(0, 10);
  return {
    exemplo: false,
    caso: 'INDISPONIVEL',
    motivo: null,
    rotas: atribuirFocos(candidatas),
    sobreOsDados: {
      fonte: 'GTFS SPTrans (ônibus, Metrô e CPTM) e OpenStreetMap, via OpenTripPlanner. Horários programados, sem tempo real.',
      periodo: { inicio: '', fim: '', meses: 0 },
      atualizacao: { ssp: '', gtfs: hoje },
    },
    panoramaMunicipal: { periodo: { inicio: '', fim: '' }, homicidioDoloso: null, tentativaHomicidio: null, estupro: null, estuproVulneravel: null },
  };
}

export function criarConsultaOtp2(urlBase: string): ServicoConsulta {
  return {
    async consultarRotas(entrada: EntradaConsulta, opcoes) {
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
          signal: opcoes?.signal,
        });
      } catch (e) {
        if ((e as { name?: string })?.name === 'AbortError') throw e;
        throw new ErroServico('SEM_REDE');
      }
      if (!resposta.ok) throw new ErroServico('INDISPONIVEL', null, resposta.status);
      let json: RespostaOtp2;
      try {
        json = (await resposta.json()) as RespostaOtp2;
      } catch {
        throw new ErroServico('INDISPONIVEL', null, resposta.status);
      }
      return mapearOtp2(json);
    },
  };
}
