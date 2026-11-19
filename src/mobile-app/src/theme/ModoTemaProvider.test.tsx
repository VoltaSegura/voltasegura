import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

import { ModoTemaProvider, lerModoTema, useModoTema } from './ModoTemaProvider';
import { useTema } from './useTema';
import { coresClaro, coresEscuro } from './tokens';

jest.mock('expo-secure-store', () => {
  let guardado: string | null = null;
  return {
    getItemAsync: jest.fn(async () => guardado),
    setItemAsync: jest.fn(async (_k: string, v: string) => { guardado = v; }),
    deleteItemAsync: jest.fn(async () => { guardado = null; }),
  };
});

function envolver({ children }: { children: React.ReactNode }) {
  return <ModoTemaProvider>{children}</ModoTemaProvider>;
}

describe('tema claro/escuro escolhido no Perfil (item 3 do T25-B)', () => {
  beforeEach(async () => {
    await SecureStore.deleteItemAsync('voltasegura.tema');
  });

  it('começa em sistema quando nada foi escolhido', async () => {
    const { result } = await renderHook(() => useModoTema(), { wrapper: envolver });
    await act(async () => {});
    expect(result.current.modo).toBe('sistema');
    expect(await lerModoTema()).toBe('sistema');
  });

  it('grava a escolha no aparelho e a lê de volta', async () => {
    const { result } = await renderHook(() => useModoTema(), { wrapper: envolver });
    await act(async () => {});
    await act(async () => { await result.current.definirModo('claro'); });
    expect(result.current.modo).toBe('claro');
    expect(await lerModoTema()).toBe('claro');
  });

  it('descarta valor desconhecido gravado no aparelho', async () => {
    await SecureStore.setItemAsync('voltasegura.tema', 'roxo');
    expect(await lerModoTema()).toBe('sistema');
  });

  it('a escolha manda no tema: escuro e claro valem independentemente do sistema', async () => {
    const { result } = await renderHook(() => ({ modo: useModoTema(), tema: useTema() }), { wrapper: envolver });
    await act(async () => {});
    await act(async () => { await result.current.modo.definirModo('escuro'); });
    expect(result.current.tema.escuro).toBe(true);
    expect(result.current.tema.cores).toBe(coresEscuro);
    await act(async () => { await result.current.modo.definirModo('claro'); });
    expect(result.current.tema.escuro).toBe(false);
    expect(result.current.tema.cores).toBe(coresClaro);
  });

  it('sem provider, o tema segue o sistema e não quebra', async () => {
    const { result } = await renderHook(() => useTema());
    expect([coresClaro.fundo, coresEscuro.fundo]).toContain(result.current.cores.fundo);
  });
});
