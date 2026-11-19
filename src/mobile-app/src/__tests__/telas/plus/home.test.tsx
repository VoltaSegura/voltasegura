import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import PlusHome from '@/app/(app)/plus/home';
import { AssinaturaProvider } from '@/plus';
import { textos } from '@/textos';

jest.mock('expo-secure-store', () => {
  let guardado: string | null = null;
  return {
    getItemAsync: jest.fn(async () => guardado),
    setItemAsync: jest.fn(async (_k: string, v: string) => { guardado = v; }),
    deleteItemAsync: jest.fn(async () => { guardado = null; }),
  };
});

const mockRotinas: { lista: unknown[] } = { lista: [] };
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true },
  useLocalSearchParams: () => ({}),
}));
jest.mock('@/rotina', () => ({
  ...jest.requireActual<typeof import('@/rotina')>('@/rotina'),
  useRotinas: () => ({ rotinas: mockRotinas.lista, carregado: true }),
}));

const margens = { top: 0, bottom: 0, left: 0, right: 0 };
const ponto = (rotulo: string, lat: number) => ({ ponto: { lat, lon: -46.6 }, rotulo });

describe('home do VoltaSegura+ lista todas as rotinas (item 11 do T25-B)', () => {
  it('mostra um cartão por rotina, não só uma', async () => {
    mockRotinas.lista = [
      { id: 'r1', origem: ponto('Casa', -23.5), destino: ponto('Trabalho', -23.6), dias: [2, 3, 4, 5, 6], hora: '07:45', antecedencia: 15, ativa: true },
      { id: 'r2', origem: ponto('Trabalho', -23.6), destino: ponto('Casa', -23.5), dias: [7], hora: '18:30', antecedencia: 30, ativa: true },
    ];
    await render(
      <SafeAreaInsetsContext.Provider value={margens}>
        <AssinaturaProvider>
          <PlusHome />
        </AssinaturaProvider>
      </SafeAreaInsetsContext.Provider>,
    );
    expect(screen.getByTestId('plus-rotina-r1')).toBeTruthy();
    expect(screen.getByTestId('plus-rotina-r2')).toBeTruthy();
    expect(screen.getByText(textos.plus.gerenciarRotinas)).toBeTruthy();
    expect(screen.getByText(textos.plus.selo)).toBeTruthy();
  });

  it('sem rotina, convida a cadastrar uma', async () => {
    mockRotinas.lista = [];
    await render(
      <SafeAreaInsetsContext.Provider value={margens}>
        <AssinaturaProvider>
          <PlusHome />
        </AssinaturaProvider>
      </SafeAreaInsetsContext.Provider>,
    );
    expect(screen.getByText(textos.plus.semRotina)).toBeTruthy();
    expect(screen.getByText(textos.plus.cadastrarRotina)).toBeTruthy();
  });
});
