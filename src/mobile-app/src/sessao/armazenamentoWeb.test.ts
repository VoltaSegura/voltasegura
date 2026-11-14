import { afterEach, describe, expect, it, jest } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { apagarSessao, gravarSessao, lerSessao } from './armazenamento';
import type { Sessao } from './tipos';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const store = jest.mocked(SecureStore);

const sessao: Sessao = {
  token: 'token-web',
  expiraEm: '2099-01-01T00:00:00.000Z',
  email: 'pessoa@exemplo.invalid',
};

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('armazenamento na web (fallback em memória)', () => {
  it('grava, lê e apaga sem tocar no SecureStore (que é vazio na web)', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');

    await gravarSessao(sessao);
    expect(await lerSessao()).toEqual(sessao);

    await apagarSessao();
    expect(await lerSessao()).toBeNull();

    expect(store.setItemAsync).not.toHaveBeenCalled();
    expect(store.getItemAsync).not.toHaveBeenCalled();
    expect(store.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('não usa localStorage nem sessionStorage', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const espiao = jest.fn();
    const antigo = (globalThis as { localStorage?: unknown }).localStorage;
    (globalThis as { localStorage?: unknown }).localStorage = { setItem: espiao, getItem: espiao };

    await gravarSessao(sessao);
    await lerSessao();

    expect(espiao).not.toHaveBeenCalled();
    (globalThis as { localStorage?: unknown }).localStorage = antigo;
    await apagarSessao();
  });

  it('no celular continua usando o SecureStore', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    store.setItemAsync.mockResolvedValueOnce(undefined);

    await gravarSessao(sessao);

    expect(store.setItemAsync).toHaveBeenCalledTimes(1);
  });
});
