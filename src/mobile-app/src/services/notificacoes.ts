/**
 * Carrega o `expo-notifications` só quando existe no aparelho.
 * No Expo Go, ou em um build sem o módulo nativo, o import do pacote lança na hora de carregar e
 * derrubava o app inteiro. Aqui a falha vira `null`: lembretes ficam indisponíveis, o resto do app abre.
 */
export type ModuloNotificacoes = typeof import('expo-notifications');

let carregado: ModuloNotificacoes | null | undefined;

export function carregarNotificacoes(): ModuloNotificacoes | null {
  if (carregado !== undefined) return carregado;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    carregado = require('expo-notifications') as ModuloNotificacoes;
  } catch {
    carregado = null;
  }
  return carregado;
}

/** Só para testes: esquece o resultado em cache. */
export function reiniciarNotificacoesParaTeste(): void {
  carregado = undefined;
}
