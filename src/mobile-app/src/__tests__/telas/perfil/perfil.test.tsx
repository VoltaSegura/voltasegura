import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import Perfil from '@/app/(app)/(abas)/perfil';
import { AssinaturaProvider, gravarAssinatura } from '@/plus';
import { useSessao } from '@/sessao/SessaoContext';
import { ModoTemaProvider } from '@/theme/ModoTemaProvider';
import { abas } from '@/textos/abas';

jest.mock('expo-secure-store', () => {
  let guardado: string | null = null;
  return {
    getItemAsync: jest.fn(async () => guardado),
    setItemAsync: jest.fn(async (_k: string, v: string) => { guardado = v; }),
    deleteItemAsync: jest.fn(async () => { guardado = null; }),
  };
});

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  router: { push: (...a: unknown[]) => mockPush(...a), replace: (...a: unknown[]) => mockReplace(...a), back: jest.fn(), canGoBack: () => true },
  useLocalSearchParams: () => ({}),
}));
jest.mock('@/sessao/SessaoContext', () => ({ useSessao: jest.fn() }));
jest.mock('@/services', () => ({ servicos: { conta: { encerrarSessaoRemota: jest.fn() } } }));

const margens = { top: 0, bottom: 0, left: 0, right: 0 };

function renderPerfil() {
  return render(
    <SafeAreaInsetsContext.Provider value={margens}>
      <ModoTemaProvider>
        <AssinaturaProvider>
          <Perfil />
        </AssinaturaProvider>
      </ModoTemaProvider>
    </SafeAreaInsetsContext.Provider>,
  );
}

describe('aba Perfil (itens 1, 3, 5 e 12 do T25-B)', () => {
  beforeEach(async () => {
    await SecureStore.deleteItemAsync('voltasegura.plus');
    await SecureStore.deleteItemAsync('voltasegura.tema');
    jest.mocked(SecureStore.setItemAsync).mockClear();
    mockPush.mockClear();
    jest.mocked(useSessao).mockReturnValue({
      sessao: { email: 'exemplo@exemplo.invalid', token: 'token-exemplo', expiraEm: '2099-01-01' },
      encerrarSessao: jest.fn(async () => {}),
      logado: true,
    } as unknown as ReturnType<typeof useSessao>);
  });

  it('mostra o plano gratuito quando não há assinatura simulada', async () => {
    await renderPerfil();
    await waitFor(() => expect(screen.getByText(abas.perfil.planoGratuito)).toBeTruthy());
  });

  it('mostra o status da assinatura simulada com a data do teste', async () => {
    await gravarAssinatura({ plano: 'mensal', inicio: new Date().toISOString() });
    await renderPerfil();
    await waitFor(() => expect(screen.getByText(/Assinante mensal · teste até/)).toBeTruthy());
  });

  it('a escolha de tema é gravada no aparelho e a rotina tem atalho', async () => {
    await renderPerfil();
    await fireEvent.press(screen.getByText(abas.perfil.temaEscuro));
    await waitFor(() => expect(jest.mocked(SecureStore.setItemAsync)).toHaveBeenCalledWith('voltasegura.tema', 'escuro'));
    await fireEvent.press(screen.getByTestId('perfil-rotina'));
    expect(mockPush).toHaveBeenCalledWith('/rotina');
  });
});
