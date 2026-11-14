/**
 * Configuração lida das variáveis EXPO_PUBLIC_* (ver .env.example).
 * Essas variáveis vão para o bundle do app: nunca guardar segredos nelas.
 */

export type ModoApi = 'mock' | 'api';

function lerModo(valor: string | undefined): ModoApi {
  return valor === 'api' ? 'api' : 'mock';
}

export const ambiente = {
  /** mock = fixtures locais rotuladas como EXEMPLO (RNF-08); api = backend real. */
  modoApi: lerModo(process.env.EXPO_PUBLIC_API_MODE),
  urlApi: process.env.EXPO_PUBLIC_API_URL ?? '',
  /** URL pública do Neon Auth da branch (sem segredo). Se definida, contas e login usam o Neon Auth. */
  urlNeonAuth: (process.env.EXPO_PUBLIC_NEON_AUTH_URL ?? '').replace(/\/+$/, ''),
  /** Origem enviada ao Neon Auth (o app nativo não tem Origin); precisa ser um domínio confiável. */
  origemNeonAuth: process.env.EXPO_PUBLIC_NEON_AUTH_ORIGIN ?? 'http://localhost:8081',
} as const;
