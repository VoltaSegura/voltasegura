import { describe, expect, it, jest } from '@jest/globals';

jest.mock('expo-notifications', () => {
  throw new Error("Cannot find native module 'ExpoApplication'");
});

describe('notificações sem módulo nativo (Expo Go)', () => {
  it('não derruba o app: lembretes ficam indisponíveis e as funções não lançam', async () => {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { carregarNotificacoes } = require('./notificacoes') as typeof import('./notificacoes');
    const lembretes = require('./lembretes') as typeof import('./lembretes');
    /* eslint-enable @typescript-eslint/no-require-imports */
    expect(carregarNotificacoes()).toBeNull();
    expect(lembretes.lembretesDisponiveis()).toBe(false);
    await expect(lembretes.configurarLembretes()).resolves.toBeUndefined();
    await expect(lembretes.pedirPermissaoLembretes()).resolves.toBe('negada');
    await expect(lembretes.cancelarTodosLembretes()).resolves.toBeUndefined();
  });
});
