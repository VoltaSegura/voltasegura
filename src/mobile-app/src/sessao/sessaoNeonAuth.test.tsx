import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { Text } from 'react-native';

import { SessaoProvider, useSessao } from './SessaoContext';
import type { Sessao } from './tipos';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
// Neon Auth configurado: só sessão com cookie do Neon Auth vale.
jest.mock('@/config/ambiente', () => ({ ambiente: { urlNeonAuth: 'https://auth.exemplo.invalid' } }));

const store = jest.mocked(SecureStore);
const sessao = (token: string): Sessao => ({ token, email: 'a@b.c', expiraEm: new Date(Date.now() + 3600_000).toISOString() });

function Sonda() {
  return <Text>{useSessao().logado ? 'logado' : 'deslogado'}</Text>;
}

beforeEach(() => {
  jest.resetAllMocks();
  store.deleteItemAsync.mockResolvedValue();
});

describe('SessaoProvider com Neon Auth configurado', () => {
  it.each(['token-provisorio', 'token-exemplo'])('descarta a sessão antiga do modo de teste (%s)', async (token) => {
    store.getItemAsync.mockResolvedValue(JSON.stringify(sessao(token)));
    await render(<SessaoProvider><Sonda /></SessaoProvider>);
    await waitFor(() => expect(screen.getByText('deslogado')).toBeTruthy());
    expect(store.deleteItemAsync).toHaveBeenCalledTimes(1);
  });

  it('mantém a sessão com cookie do Neon Auth', async () => {
    store.getItemAsync.mockResolvedValue(JSON.stringify(sessao('__Secure-neon-auth.session_token=abc123')));
    await render(<SessaoProvider><Sonda /></SessaoProvider>);
    await waitFor(() => expect(screen.getByText('logado')).toBeTruthy());
    expect(store.deleteItemAsync).not.toHaveBeenCalled();
  });
});
