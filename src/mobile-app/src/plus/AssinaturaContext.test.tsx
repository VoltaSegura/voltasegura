import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

import { AssinaturaProvider, gravarAssinatura, lerAssinatura, useAssinatura } from './AssinaturaContext';

jest.mock('expo-secure-store', () => {
  let guardado: string | null = null;
  return {
    getItemAsync: jest.fn(async () => guardado),
    setItemAsync: jest.fn(async (_k: string, v: string) => { guardado = v; }),
    deleteItemAsync: jest.fn(async () => { guardado = null; }),
  };
});

const CHAVE = 'voltasegura.plus';

function envolver({ children }: { children: React.ReactNode }) {
  return <AssinaturaProvider>{children}</AssinaturaProvider>;
}

describe('assinatura simulada (D-36)', () => {
  beforeEach(async () => {
    await SecureStore.deleteItemAsync(CHAVE);
    jest.mocked(SecureStore.setItemAsync).mockClear();
  });

  it('começa sem assinatura quando nada foi gravado', async () => {
    const { result } = await renderHook(() => useAssinatura(), { wrapper: envolver });
    await act(async () => {});
    expect(result.current.carregado).toBe(true);
    expect(result.current.assinante).toBe(false);
    expect(result.current.plano).toBeNull();
    expect(result.current.inicio).toBeNull();
  });

  it('assinar grava só o plano e a data de início, e cancelar apaga o registro', async () => {
    const { result } = await renderHook(() => useAssinatura(), { wrapper: envolver });
    await act(async () => {});
    await act(async () => { await result.current.assinar('anual'); });
    expect(result.current.assinante).toBe(true);
    expect(result.current.plano).toBe('anual');
    expect(result.current.inicio).toBeInstanceOf(Date);

    const gravado = String(jest.mocked(SecureStore.setItemAsync).mock.calls.at(-1)?.[1]);
    expect(gravado).not.toMatch(/R\$|cart|cpf/i);
    expect(JSON.parse(gravado)).toEqual({ plano: 'anual', inicio: expect.any(String) });

    await act(async () => { await result.current.cancelar(); });
    expect(result.current.assinante).toBe(false);
    expect(await lerAssinatura()).toBeNull();
  });

  it('lê uma assinatura gravada numa sessão anterior', async () => {
    const inicio = '2026-11-18T12:00:00.000Z';
    await gravarAssinatura({ plano: 'mensal', inicio });
    const { result } = await renderHook(() => useAssinatura(), { wrapper: envolver });
    await act(async () => {});
    expect(result.current.assinante).toBe(true);
    expect(result.current.plano).toBe('mensal');
    expect(result.current.inicio?.toISOString()).toBe(inicio);
  });

  it('descarta registro inválido sem quebrar', async () => {
    await SecureStore.setItemAsync(CHAVE, JSON.stringify({ plano: 'vitalicio', inicio: 'não é data' }));
    expect(await lerAssinatura()).toBeNull();
  });

  it('exige o provider', async () => {
    const erro = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(() => useAssinatura())).rejects.toThrow('AssinaturaProvider');
    erro.mockRestore();
  });
});
