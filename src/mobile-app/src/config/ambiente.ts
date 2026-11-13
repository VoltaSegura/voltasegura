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
} as const;
