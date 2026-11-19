import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import Assinatura from '@/app/(app)/plus/assinatura';
import Confirmacao from '@/app/(app)/plus/confirmacao';
import Plus from '@/app/(app)/(abas)/plus';
import Radar from '@/app/(app)/plus/radar';
import Contatos from '@/app/(app)/(abas)/contatos';
import { lerContatos } from '@/contatos';
import { AssinaturaProvider, gravarAssinatura, lerAssinatura } from '@/plus';
import { textos } from '@/textos';

jest.mock('expo-secure-store', () => {
  let guardado: string | null = null;
  return {
    getItemAsync: jest.fn(async () => guardado),
    setItemAsync: jest.fn(async (_k: string, v: string) => { guardado = v; }),
    deleteItemAsync: jest.fn(async () => { guardado = null; }),
  };
});

let mockParams: { plano?: string } = {};
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
jest.mock('@/rotina', () => ({
  ...jest.requireActual<typeof import('@/rotina')>('@/rotina'),
  useRotinas: () => ({ rotinas: [], carregado: true }),
}));

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  router: {
    push: (...a: unknown[]) => mockPush(...a),
    replace: (...a: unknown[]) => mockReplace(...a),
    back: () => mockBack(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => mockParams,
}));

const margens = { top: 0, bottom: 0, left: 0, right: 0 };

function comAssinatura(tela: React.ReactElement) {
  return <SafeAreaInsetsContext.Provider value={margens}><AssinaturaProvider>{tela}</AssinaturaProvider></SafeAreaInsetsContext.Provider>;
}

describe('VoltaSegura+ em simulação (D-36)', () => {
  const escritas = jest.mocked(SecureStore.setItemAsync);
  const apagadas = jest.mocked(SecureStore.deleteItemAsync);

  beforeEach(async () => {
    mockParams = {};
    mockPush.mockClear();
    mockReplace.mockClear();
    mockBack.mockClear();
    escritas.mockClear();
    apagadas.mockClear();
    await SecureStore.deleteItemAsync('voltasegura.plus');
    apagadas.mockClear();
  });

  it('mostra o selo de demonstração nos planos e leva o plano escolhido à confirmação', async () => {
    await render(comAssinatura(<Plus />));
    expect(screen.getByText(textos.plus.selo)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('plano-anual'));
    await fireEvent.press(screen.getByText(textos.plus.testar));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/plus/confirmacao', params: { plano: 'anual' } });
    expect(escritas).not.toHaveBeenCalled();
  });

  it('a aba Plus mostra a home (e não os planos) quando há assinatura simulada', async () => {
    await gravarAssinatura({ plano: 'mensal', inicio: new Date().toISOString() });
    await render(comAssinatura(<Plus />));
    await waitFor(() => expect(screen.getByText(textos.plus.gerenciar)).toBeTruthy());
    expect(screen.queryByText(textos.plus.testar)).toBeNull();
  });

  it('confirmação grava só o plano e a data de início (sem valor) e segue para a home', async () => {
    mockParams = { plano: 'anual' };
    await render(comAssinatura(<Confirmacao />));
    expect(screen.getByText(textos.plus.planoAnual.valorMes)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('confirmar-teste'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/plus/home'));
    expect(escritas).toHaveBeenCalledWith('voltasegura.plus', expect.any(String));
    const gravado = String(escritas.mock.calls[0][1]);
    expect(gravado).not.toMatch(/R\$/);
    expect(JSON.parse(gravado)).toEqual({ plano: 'anual', inicio: expect.any(String) });
  });

  it('cancelar a assinatura apaga o registro e volta à aba Plus', async () => {
    await gravarAssinatura({ plano: 'mensal', inicio: new Date().toISOString() });
    await render(comAssinatura(<Assinatura />));
    await waitFor(() => expect(screen.getByText(textos.plus.cancelarPlano)).toBeTruthy());
    await fireEvent.press(screen.getByText(textos.plus.cancelarPlano));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/plus'));
    expect(apagadas).toHaveBeenCalledWith('voltasegura.plus');
    expect(await lerAssinatura()).toBeNull();
  });

  it('radar mostra a alternativa como exemplo e "manter" só volta', async () => {
    await render(<SafeAreaInsetsContext.Provider value={margens}><Radar /></SafeAreaInsetsContext.Provider>);
    await fireEvent.press(screen.getByText(textos.plus.verAlternativa));
    expect(screen.getByText(textos.plus.alternativaExemplo)).toBeTruthy();
    await fireEvent.press(screen.getByText(textos.plus.manterRota));
    expect(mockBack).toHaveBeenCalled();
  });
});

describe('aba Contatos (só nomes, no aparelho)', () => {
  beforeEach(async () => {
    await SecureStore.deleteItemAsync('voltasegura.contatos');
  });

  it('salva um nome no aparelho e recusa nome vazio', async () => {
    await render(<SafeAreaInsetsContext.Provider value={margens}><Contatos /></SafeAreaInsetsContext.Provider>);
    await fireEvent.press(screen.getByText(textos.abas.contatos.salvar));
    expect(screen.getByText(textos.abas.contatos.nomeVazio)).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('contato-nome'), 'Mãe');
    await fireEvent.press(screen.getByText(textos.abas.contatos.salvar));
    expect(await lerContatos()).toEqual([expect.objectContaining({ nome: 'Mãe' })]);
    expect((await lerContatos())[0]).not.toHaveProperty('telefone');
  });
});
