import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { LocaisProvider, useLocais } from './LocaisContext';
import { buscarEndereco } from '@/services/geocodificacao';
import { normalizarNome } from './armazenamento';
import { MAX_LOCAIS } from './tipos';

jest.mock('expo-secure-store', () => {
  let guardado: string | null = null;
  return {
    getItemAsync: jest.fn(async () => guardado),
    setItemAsync: jest.fn(async (_k: string, v: string) => { guardado = v; }),
    deleteItemAsync: jest.fn(async () => { guardado = null; }),
  };
});
jest.mock('expo-location', () => ({ geocodeAsync: jest.fn() }));

const SecureStore = jest.requireMock<{ setItemAsync: jest.Mock; deleteItemAsync: jest.Mock }>('expo-secure-store');
const Location = jest.requireMock<{ geocodeAsync: jest.Mock<(t: string) => Promise<unknown>> }>('expo-location');
const envolver = ({ children }: { children: React.ReactNode }) => <LocaisProvider>{children}</LocaisProvider>;
const ponto = { lat: -23.55, lon: -46.63 };

beforeEach(async () => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
  const { result } = await renderHook(() => useLocais(), { wrapper: envolver });
  await waitFor(() => expect(result.current.carregado).toBe(true));
  await act(async () => { await result.current.apagarTodos(); });
  jest.clearAllMocks();
});

describe('locais salvos (FN-13, D-29)', () => {
  it('salva, persiste no armazenamento cifrado e relê ao reabrir', async () => {
    const { result } = await renderHook(() => useLocais(), { wrapper: envolver });
    await waitFor(() => expect(result.current.carregado).toBe(true));
    let r = '';
    await act(async () => { r = await result.current.salvar('  Casa  ', ponto, 'casa'); });
    expect(r).toBe('ok');
    expect(result.current.locais).toHaveLength(1);
    expect(result.current.locais[0]).toMatchObject({ nome: 'Casa', tipo: 'casa', ponto });
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
    const outra = await renderHook(() => useLocais(), { wrapper: envolver });
    await waitFor(() => expect(outra.result.current.locais).toHaveLength(1));
  });

  it('recusa nome vazio e passa do limite', async () => {
    const { result } = await renderHook(() => useLocais(), { wrapper: envolver });
    await waitFor(() => expect(result.current.carregado).toBe(true));
    let r = '';
    await act(async () => { r = await result.current.salvar('   ', ponto, 'outro'); });
    expect(r).toBe('nome_vazio');
    for (let i = 0; i < MAX_LOCAIS; i += 1) {
      await act(async () => { await result.current.salvar(`Lugar ${i}`, ponto, 'outro'); });
    }
    expect(result.current.locais).toHaveLength(MAX_LOCAIS);
    await act(async () => { r = await result.current.salvar('Extra', ponto, 'outro'); });
    expect(r).toBe('limite');
  });

  it('renomeia e apaga um lugar', async () => {
    const { result } = await renderHook(() => useLocais(), { wrapper: envolver });
    await waitFor(() => expect(result.current.carregado).toBe(true));
    await act(async () => { await result.current.salvar('Casa', ponto, 'casa'); });
    const id = result.current.locais[0].id;
    await act(async () => { await result.current.renomear(id, 'Casa da vó'); });
    expect(result.current.locais[0].nome).toBe('Casa da vó');
    await act(async () => { await result.current.apagar(id); });
    expect(result.current.locais).toHaveLength(0);
  });

  it('nunca escreve coordenadas no console', async () => {
    const espioes = (['log', 'warn', 'error', 'info'] as const).map((m) => jest.spyOn(console, m).mockImplementation(() => {}));
    const { result } = await renderHook(() => useLocais(), { wrapper: envolver });
    await waitFor(() => expect(result.current.carregado).toBe(true));
    await act(async () => { await result.current.salvar('Casa', ponto, 'casa'); });
    espioes.forEach((e) => { expect(e).not.toHaveBeenCalled(); e.mockRestore(); });
  });

  it('limita o tamanho do nome', () => {
    expect(normalizarNome('a'.repeat(80))).toHaveLength(30);
    expect(normalizarNome('  a   b ')).toBe('a b');
  });
});

describe('buscarEndereco (D-29)', () => {
  it('acrescenta São Paulo ao texto e devolve só o primeiro resultado', async () => {
    Location.geocodeAsync.mockResolvedValue([{ latitude: -23.5, longitude: -46.6 }, { latitude: 1, longitude: 1 }]);
    const r = await buscarEndereco('Rua Augusta, 100');
    expect(Location.geocodeAsync).toHaveBeenCalledWith('Rua Augusta, 100, São Paulo, SP, Brasil');
    expect(r).toEqual({ tipo: 'achou', ponto: { lat: -23.5, lon: -46.6 } });
  });

  it('trata texto curto, sem resultado e falha do geocodificador', async () => {
    expect(await buscarEndereco('ab')).toEqual({ tipo: 'nao_achou' });
    expect(Location.geocodeAsync).not.toHaveBeenCalled();
    Location.geocodeAsync.mockResolvedValueOnce([]);
    expect(await buscarEndereco('lugar nenhum')).toEqual({ tipo: 'nao_achou' });
    Location.geocodeAsync.mockRejectedValueOnce(new Error('x'));
    expect(await buscarEndereco('lugar nenhum')).toEqual({ tipo: 'indisponivel' });
  });
});
