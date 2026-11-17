/**
 * Configuração lida das variáveis EXPO_PUBLIC_* (ver .env.example).
 * Essas variáveis vão para o bundle do app: nunca guardar segredos nelas.
 */

/** mock = fixtures EXEMPLO · api = backend `POST /api/consultas` · otp2 = OpenTripPlanner 2 do projeto (só roteamento). */
export type ModoApi = 'mock' | 'api' | 'otp2';

const MODOS: readonly ModoApi[] = ['mock', 'api', 'otp2'];

/**
 * Sem valor = `mock` (padrão). Valor desconhecido (ex.: erro de digitação) = `invalido`: a consulta
 * falha com erro tratado em vez de cair sozinha no mock (B-04, sem queda silenciosa para EXEMPLO).
 */
export function lerModo(valor: string | undefined): ModoApi | 'invalido' {
  const v = (valor ?? '').trim().toLowerCase();
  if (!v) return 'mock';
  return (MODOS as readonly string[]).includes(v) ? (v as ModoApi) : 'invalido';
}

/** `poligono` (padrão) ou `proxy_pontos` [HIPÓTESE, decisão pendente]. Valor desconhecido = `poligono`. */
export function lerCoberturaExposicao(valor: string | undefined): 'poligono' | 'proxy_pontos' {
  return (valor ?? '').trim().toLowerCase() === 'proxy_pontos' ? 'proxy_pontos' : 'poligono';
}

const semBarraFinal = (url: string | undefined) => (url ?? '').trim().replace(/\/+$/, '');

export const ambiente = {
  modoApi: lerModo(process.env.EXPO_PUBLIC_API_MODE),
  urlApi: semBarraFinal(process.env.EXPO_PUBLIC_API_URL),
  /** Base do OTP2 (sem `/otp/...`), ex.: http://192.168.0.10:8080. Usada só com API_MODE=otp2. */
  urlOtp2: semBarraFinal(process.env.EXPO_PUBLIC_OTP2_URL),
  /** URL pública do Neon Auth da branch (sem segredo). Se definida, contas e login usam o Neon Auth. */
  urlNeonAuth: semBarraFinal(process.env.EXPO_PUBLIC_NEON_AUTH_URL),
  /** Base da Data API do Neon (sem barra final). Com `otp2`, habilita a exposição estimada real (B-30). */
  urlDataApi: semBarraFinal(process.env.EXPO_PUBLIC_DATA_API_URL),
  /** Modo de cobertura enviado à função de exposição. */
  exposicaoCobertura: lerCoberturaExposicao(process.env.EXPO_PUBLIC_EXPOSICAO_COBERTURA),
  /** Origem enviada ao Neon Auth (o app nativo não tem Origin); precisa ser um domínio confiável. */
  origemNeonAuth: process.env.EXPO_PUBLIC_NEON_AUTH_ORIGIN ?? 'http://localhost:8081',
} as const;
