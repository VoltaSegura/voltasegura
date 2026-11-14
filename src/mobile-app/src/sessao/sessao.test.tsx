import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { apagarSessao, gravarSessao, lerSessao } from './armazenamento';
import { SessaoProvider, useSessao } from './SessaoContext';
import type { Sessao } from './tipos';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const store = jest.mocked(SecureStore);

const futura = (): Sessao => ({
  token: 't',
  email: 'a@b.c',
  expiraEm: new Date(Date.now() + 3600_000).toISOString(),
});

const ref: { ctx?: ReturnType<typeof useSessao> } = {};
function Sonda() {
  const ctx = useSessao();
  useEffect(() => {
    ref.ctx = ctx;
  });
  return <Text>{ctx.logado ? 'logado' : 'deslogado'}</Text>;
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe('armazenamento', () => {
  it('grava e relê', async () => {
    let guardado: string | null = null;
    store.setItemAsync.mockImplementation(async (_k, v) => {
      guardado = v;
    });
    store.getItemAsync.mockImplementation(async () => guardado);
    const s = futura();
    await gravarSessao(s);
    expect(await lerSessao()).toEqual(s);
  });

  it('JSON corrompido vira sem sessão', async () => {
    store.getItemAsync.mockResolvedValue('{quebrado');
    expect(await lerSessao()).toBeNull();
  });

  it('falha de leitura vira sem sessão', async () => {
    store.getItemAsync.mockRejectedValue(new Error('x'));
    expect(await lerSessao()).toBeNull();
  });

  it('apagarSessao chama deleteItemAsync', async () => {
    store.deleteItemAsync.mockResolvedValue();
    await apagarSessao();
    expect(store.deleteItemAsync).toHaveBeenCalledTimes(1);
  });
});

describe('SessaoProvider', () => {
  it('carrega sessão válida', async () => {
    store.getItemAsync.mockResolvedValue(JSON.stringify(futura()));
    await render(
      <SessaoProvider>
        <Sonda />
      </SessaoProvider>,
    );
    await waitFor(() => expect(screen.getByText('logado')).toBeTruthy());
  });

  it('descarta sessão expirada e apaga', async () => {
    store.getItemAsync.mockResolvedValue(
      JSON.stringify({ ...futura(), expiraEm: new Date(Date.now() - 1000).toISOString() }),
    );
    store.deleteItemAsync.mockResolvedValue();
    await render(
      <SessaoProvider>
        <Sonda />
      </SessaoProvider>,
    );
    await waitFor(() => expect(screen.getByText('deslogado')).toBeTruthy());
    expect(store.deleteItemAsync).toHaveBeenCalled();
  });

  it('encerrarSessao apaga do armazenamento', async () => {
    store.getItemAsync.mockResolvedValue(JSON.stringify(futura()));
    store.deleteItemAsync.mockResolvedValue();
    await render(
      <SessaoProvider>
        <Sonda />
      </SessaoProvider>,
    );
    await waitFor(() => expect(screen.getByText('logado')).toBeTruthy());
    await act(async () => {
      await ref.ctx?.encerrarSessao();
    });
    expect(store.deleteItemAsync).toHaveBeenCalled();
    expect(screen.getByText('deslogado')).toBeTruthy();
  });

  it('não renderiza filhos enquanto carrega', async () => {
    store.getItemAsync.mockReturnValue(new Promise(() => {}));
    await render(
      <SessaoProvider>
        <Sonda />
      </SessaoProvider>,
    );
    expect(screen.queryByText('deslogado')).toBeNull();
    expect(screen.queryByText('logado')).toBeNull();
  });
});
