import type { EntradaConsulta, ServicoConsulta } from './consulta';
import { codificar, decodificar } from './geometria';
import { faixaDoDia } from './otp2';
import type { FaixaDoDia, FocoRota, RespostaConsulta, Rota } from './tipos';
import { obterToken } from './token';
import { validarRespostaConsulta } from './validar';

/**
 * Exposição estimada real (B-30): no modo `otp2`, depois do roteamento, chama a função
 * `mobile_api.comparar_exposicao` da Data API do Neon e mescla o resultado.
 *
 * Regras:
 * - Só envia geometrias dos trechos a pé (polyline 5 canônica) e a faixa do dia de cada um. Nenhum
 *   outro dado (origem, destino, e-mail, horário exato) entra na chamada.
 * - Nada é registrado em log: nem geometria, nem token, nem resposta.
 * - QUALQUER falha (sem sessão, sem JWT, 401/403, tempo esgotado, JSON inválido, formato fora do
 *   contrato, caso INDISPONIVEL, erro) devolve a resposta do roteamento intacta ("Só roteamento").
 *   Nunca derruba as rotas e nunca inventa exposição.
 * - Só o caso CONCLUSIVO coloca o foco `MENOR_EXPOSICAO` (na única rota com `menorExposicao`).
 * - O cookie da sessão do Neon Auth NÃO serve como Bearer: troca-se por um JWT em `GET /token`.
 */

export const TEMPO_LIMITE_EXPOSICAO_MS = 10_000;
export type ModoCobertura = 'poligono' | 'proxy_pontos';
const CASOS_COM_EXPOSICAO: readonly string[] = ['CONCLUSIVO', 'SEM_DIFERENCA', 'MISTOS', 'INSUFICIENTE', 'NAO_APLICAVEL', 'SEM_COMPARACAO'];

/**
 * Motivo (conjunto fechado) de a exposição não ter entrado na resposta. Nunca carrega geometria, token,
 * cookie, URL nem corpo: só a causa e, nos erros HTTP, o status.
 */
export type MotivoExposicao =
  | 'ok'
  | 'sem_sessao'
  | 'sem_config'
  | 'entrada_invalida'
  | `token_http_${number}`
  | 'token_invalido'
  | `rpc_http_${number}`
  | 'resposta_invalida'
  | 'tempo_esgotado'
  | 'erro_rede'
  | 'cancelado';

let motivoAtual: MotivoExposicao | null = null;

/** Motivo da última tentativa (`ok` se a exposição entrou); `null` se ainda não houve tentativa. */
export function ultimoMotivoExposicao(): MotivoExposicao | null {
  return motivoAtual;
}

function registrarMotivo(motivo: MotivoExposicao): void {
  motivoAtual = motivo;
  // Só com EXPO_PUBLIC_EXPOSICAO_DIAG=1 (padrão desligado) e só o motivo: nada de dados da pessoa.
  if (process.env.EXPO_PUBLIC_EXPOSICAO_DIAG === '1') console.warn(`[exposicao] ${motivo}`);
}

class FalhaExposicao extends Error {
  constructor(readonly motivo: MotivoExposicao) {
    super(motivo);
  }
}

const statusSeguro = (status: number) => (Number.isInteger(status) && status >= 100 && status <= 599 ? status : 0);

/**
 * Cookie de sessão do Neon Auth: um par `nome=valor` cujo nome termina em `session_token`
 * (ex.: `__Secure-neon-auth.session_token=…`). Sessões do mock ou provisórias (`token-exemplo`,
 * `token-provisorio`) não têm esse formato e não valem como sessão do Neon Auth.
 */
export function ehCookieSessaoNeonAuth(token: string | null | undefined): token is string {
  return typeof token === 'string' && /^[\w.-]*session_token=[^;,\s]+$/.test(token);
}

export interface EntradaRpcRota {
  id: string;
  trechos_a_pe: { geometria: string; faixa: FaixaDoDia }[];
}

const MAX_ROTAS = 5;
const MAX_TRECHOS_A_PE = 50;

/** Só geometrias e faixas. `null` se algo não puder ser enviado com segurança (aí fica "Só roteamento"). */
export function montarEntradaRpc(rotas: Rota[]): EntradaRpcRota[] | null {
  if (rotas.length < 1 || rotas.length > MAX_ROTAS) return null;
  const entrada: EntradaRpcRota[] = [];
  for (const rota of rotas) {
    const trechosAPe: EntradaRpcRota['trechos_a_pe'] = [];
    for (const t of rota.trechos) {
      if (t.modo !== 'A_PE') continue;
      const pontos = decodificar(t.geometria);
      const faixa = t.faixaDoDia ?? faixaDoDia(t.partidaPrevista ?? undefined);
      if (pontos.length < 2 || !faixa) return null;
      trechosAPe.push({ geometria: codificar(pontos), faixa });
    }
    if (trechosAPe.length > MAX_TRECHOS_A_PE) return null;
    entrada.push({ id: rota.id, trechos_a_pe: trechosAPe });
  }
  if (new Set(entrada.map((r) => r.id)).size !== entrada.length) return null;
  return entrada;
}

const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

const FONTE_SSP = ' Exposição estimada: boletins de ocorrência da SSP-SP registrados perto dos trechos a pé, sujeitos a subnotificação.';

/**
 * Pura: resposta do roteamento + JSON da RPC → resposta com exposição, ou `null` se o JSON não
 * fechar o contrato (o chamador mantém "Só roteamento"). Passa pela mesma validação do modo `api`.
 */
export function mesclarExposicao(base: RespostaConsulta, bruto: unknown): RespostaConsulta | null {
  if (!ehObjeto(bruto) || !Array.isArray(bruto.rotas)) return null;
  const caso = bruto.caso;
  if (typeof caso !== 'string' || !CASOS_COM_EXPOSICAO.includes(caso)) return null;
  if (bruto.rotas.length !== base.rotas.length) return null;
  const porId = new Map<string, Record<string, unknown>>();
  for (const r of bruto.rotas) {
    if (!ehObjeto(r) || typeof r.id !== 'string') return null;
    porId.set(r.id, r);
  }
  if (porId.size !== base.rotas.length || base.rotas.some((r) => !porId.has(r.id))) return null;

  // só CONCLUSIVO destaca, e destaca exatamente uma rota; em outros casos o destaque é ignorado
  let vencedora: string | null = null;
  if (caso === 'CONCLUSIVO') {
    const destacadas = base.rotas.filter((r) => porId.get(r.id)?.menorExposicao === true);
    if (destacadas.length !== 1) return null;
    vencedora = destacadas[0].id;
  }

  const periodo = ehObjeto(bruto.periodo) ? bruto.periodo : {};
  const montado = {
    ...base,
    exemplo: false,
    fontes: { roteamento: base.fontes.roteamento, exposicao: 'ssp' },
    caso,
    motivo: bruto.motivo ?? null,
    rotas: base.rotas.map((rota) => {
      const r = porId.get(rota.id) as Record<string, unknown>;
      const semDestaque = rota.focos.filter((f) => f !== 'MENOR_EXPOSICAO');
      const focos: FocoRota[] = rota.id === vencedora
        ? [...semDestaque.filter((f) => f !== 'OUTRA_OPCAO'), 'MENOR_EXPOSICAO']
        : semDestaque;
      return { ...rota, focos, exposicao: r.exposicao, categorias: r.categorias };
    }),
    sobreOsDados: {
      ...base.sobreOsDados,
      fonte: base.sobreOsDados.fonte.includes('SSP') ? base.sobreOsDados.fonte : base.sobreOsDados.fonte + FONTE_SSP,
      periodo: { inicio: periodo.inicio, fim: periodo.fim, meses: periodo.meses },
      atualizacao: { ...base.sobreOsDados.atualizacao, ssp: bruto.atualizacao_ssp ?? '' },
    },
    panoramaMunicipal: {
      ...(ehObjeto(bruto.panoramaMunicipal) ? bruto.panoramaMunicipal : {}),
      periodo: { inicio: periodo.inicio, fim: periodo.fim },
    },
  };
  try {
    const validada = validarRespostaConsulta(montado);
    // a validação rebaixa para "Só roteamento" se o bloco de exposição não fechar: aqui isso é falha
    return validada.fontes.exposicao === 'ssp' && validada.caso === caso ? validada : null;
  } catch {
    return null;
  }
}

export interface OpcoesExposicao {
  /** Base da Data API (sem barra final), ex.: https://…/rest/v1. */
  urlDataApi: string;
  /** URL pública do Neon Auth (sem barra final), de onde sai o JWT (`GET /token`). */
  urlNeonAuth: string;
  /** Origem enviada ao Neon Auth (o app nativo não tem `Origin`). */
  origemNeonAuth: string;
  /** `proxy_pontos` é `[HIPÓTESE]` (decisão pendente); o padrão é `poligono`. */
  modoCobertura?: ModoCobertura;
  tempoLimiteMs?: number;
  fetchImpl?: typeof fetch;
  /** Cookie da sessão do Neon Auth; por padrão, o token injetado por `definirProvedorToken`. */
  obterSessao?: () => string | null;
}

async function obterJwt(opcoes: OpcoesExposicao, cookie: string, sinal: AbortSignal): Promise<string> {
  const chamar = opcoes.fetchImpl ?? fetch;
  const res = await chamar(`${opcoes.urlNeonAuth}/token`, {
    method: 'GET',
    headers: { Accept: 'application/json', Cookie: cookie, Origin: opcoes.origemNeonAuth },
    credentials: 'omit',
    signal: sinal,
  });
  if (!res.ok) throw new FalhaExposicao(`token_http_${statusSeguro(res.status)}`);
  let json: unknown;
  try {
    json = await res.json();
  } catch (e) {
    if (sinal.aborted) throw e;
    throw new FalhaExposicao('token_invalido');
  }
  if (!ehObjeto(json) || typeof json.token !== 'string' || !json.token) throw new FalhaExposicao('token_invalido');
  return json.token;
}

/** Devolve a resposta com exposição, ou `null` em qualquer falha (o motivo fica em `ultimoMotivoExposicao`). */
async function buscarExposicao(base: RespostaConsulta, opcoes: OpcoesExposicao, externo?: AbortSignal): Promise<RespostaConsulta | null> {
  if (!opcoes.urlDataApi || !opcoes.urlNeonAuth) { registrarMotivo('sem_config'); return null; }
  const cookie = (opcoes.obterSessao ?? obterToken)();
  if (!ehCookieSessaoNeonAuth(cookie)) { registrarMotivo('sem_sessao'); return null; }
  const entrada = montarEntradaRpc(base.rotas);
  if (!entrada) { registrarMotivo('entrada_invalida'); return null; }

  const controle = new AbortController();
  let esgotou = false;
  const relogio = setTimeout(() => { esgotou = true; controle.abort(); }, opcoes.tempoLimiteMs ?? TEMPO_LIMITE_EXPOSICAO_MS);
  const aoCancelar = () => controle.abort();
  externo?.addEventListener('abort', aoCancelar);
  try {
    const jwt = await obterJwt(opcoes, cookie, controle.signal);
    const chamar = opcoes.fetchImpl ?? fetch;
    const res = await chamar(`${opcoes.urlDataApi}/rpc/comparar_exposicao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${jwt}`,
        'Content-Profile': 'mobile_api',
      },
      body: JSON.stringify({ p_rotas: entrada, p_modo_cobertura: opcoes.modoCobertura ?? 'poligono' }),
      credentials: 'omit',
      signal: controle.signal,
    });
    if (!res.ok) throw new FalhaExposicao(`rpc_http_${statusSeguro(res.status)}`);
    let json: unknown;
    try {
      json = await res.json();
    } catch (e) {
      if (controle.signal.aborted) throw e;
      throw new FalhaExposicao('resposta_invalida');
    }
    const mesclada = mesclarExposicao(base, json);
    if (!mesclada) throw new FalhaExposicao('resposta_invalida');
    registrarMotivo('ok');
    return mesclada;
  } catch (e) {
    registrarMotivo(e instanceof FalhaExposicao ? e.motivo
      : esgotou ? 'tempo_esgotado'
      : externo?.aborted ? 'cancelado'
      : 'erro_rede');
    return null;
  } finally {
    clearTimeout(relogio);
    externo?.removeEventListener('abort', aoCancelar);
  }
}

/** Envolve o serviço de roteamento (otp2): as rotas sempre vêm; a exposição só entra se tudo fechar. */
export function comExposicao(roteamento: ServicoConsulta, opcoes: OpcoesExposicao): ServicoConsulta {
  return {
    async consultarRotas(entrada: EntradaConsulta, op) {
      const base = await roteamento.consultarRotas(entrada, op);
      if (!base.rotas.length || base.fontes.roteamento !== 'otp2') return base;
      const com = await buscarExposicao(base, opcoes, op?.signal);
      if (op?.signal?.aborted) throw Object.assign(new Error('Consulta cancelada'), { name: 'AbortError' });
      return com ?? base;
    },
  };
}
