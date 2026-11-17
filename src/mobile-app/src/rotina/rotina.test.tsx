import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { lerRotinas } from './armazenamento';
import { saidaDeHoje } from './AberturaPorLembrete';
import { resumoDias } from './dias';
import { RotinaProvider, useRotinas } from './RotinaContext';
import { MAX_ROTINAS, normalizarHora, validarRotina, type DadosRotina } from './tipos';

jest.mock('expo-secure-store', () => {
  let guardado: string | null = null;
  return {
    getItemAsync: jest.fn(async () => guardado),
    setItemAsync: jest.fn(async (_k: string, v: string) => { guardado = v; }),
    deleteItemAsync: jest.fn(async () => { guardado = null; }),
  };
});
jest.mock('@/services/lembretes', () => ({
  configurarLembretes: jest.fn(async () => undefined),
  pedirPermissaoLembretes: jest.fn(),
  agendarLembretes: jest.fn(async () => undefined),
  cancelarLembretes: jest.fn(async () => undefined),
  cancelarTodosLembretes: jest.fn(async () => undefined),
}));

type Mock = jest.Mock<(...args: any[]) => Promise<any>>;
const L = jest.requireMock<Record<string, Mock>>('@/services/lembretes');
const SecureStore = jest.requireMock<Record<string, Mock>>('expo-secure-store');
const envolver = ({ children }: { children: React.ReactNode }) => <RotinaProvider>{children}</RotinaProvider>;

const dados: DadosRotina = {
  origem: { ponto: { lat: -23.55, lon: -46.63 }, rotulo: 'Casa' },
  destino: { ponto: { lat: -23.56, lon: -46.65 }, rotulo: 'Trabalho' },
  dias: [2, 3, 4, 5, 6],
  hora: '7:45',
  antecedencia: 15,
  ativa: true,
};

async function montar() {
  const r = await renderHook(() => useRotinas(), { wrapper: envolver });
  await waitFor(() => expect(r.result.current.carregado).toBe(true));
  return r;
}

beforeEach(async () => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
  const { result } = await montar();
  await act(async () => { await result.current.apagarTodas(); });
  jest.clearAllMocks();
  L.pedirPermissaoLembretes.mockResolvedValue('concedida');
});

describe('rotina da semana (FN-17, D-31)', () => {
  it('valida e normaliza hora, dias e pontos', () => {
    expect(normalizarHora('7:45')).toBe('07:45');
    expect(normalizarHora('24:00')).toBeNull();
    expect(validarRotina({ origem: null, destino: null, dias: [], hora: 'x' })).toEqual(['SEM_ORIGEM', 'SEM_DESTINO', 'SEM_DIAS', 'HORA_INVALIDA']);
    expect(validarRotina({ ...dados, destino: dados.origem })).toEqual(['MESMO_LUGAR']);
    expect(resumoDias([6, 2, 5, 4, 3])).toBe('Dias úteis');
    expect(resumoDias([2, 4])).toBe('Seg, Qua');
  });

  it('salva só no aparelho, programa o lembrete e relê do armazenamento (AC1, AC2)', async () => {
    const { result } = await montar();
    let resultado = '';
    await act(async () => { resultado = await result.current.salvar(dados); });
    expect(resultado).toBe('ok');
    expect(result.current.rotinas[0].hora).toBe('07:45');
    expect(L.pedirPermissaoLembretes).toHaveBeenCalledTimes(1);
    expect(L.agendarLembretes).toHaveBeenCalledTimes(1);
    expect((await lerRotinas())[0].origem.rotulo).toBe('Casa');
  });

  it('permissão negada: avisa, mantém a rotina salva e não programa (AC4)', async () => {
    L.pedirPermissaoLembretes.mockResolvedValue('negada');
    const { result } = await montar();
    let resultado = '';
    await act(async () => { resultado = await result.current.salvar(dados); });
    expect(resultado).toBe('sem_permissao');
    expect(result.current.rotinas).toHaveLength(1);
    expect(L.agendarLembretes).not.toHaveBeenCalled();
  });

  it('rotina desativada não pede permissão nem programa', async () => {
    const { result } = await montar();
    await act(async () => { await result.current.salvar({ ...dados, ativa: false }); });
    expect(L.pedirPermissaoLembretes).not.toHaveBeenCalled();
    expect(L.agendarLembretes).not.toHaveBeenCalled();
  });

  it('edita, desativa e apaga, cancelando os lembretes (AC3)', async () => {
    const { result } = await montar();
    await act(async () => { await result.current.salvar(dados); });
    const id = result.current.rotinas[0].id;
    await act(async () => { await result.current.salvar({ ...dados, hora: '08:10' }, id); });
    expect(result.current.rotinas).toHaveLength(1);
    expect(result.current.rotinas[0].hora).toBe('08:10');
    await act(async () => { await result.current.alternar(id, false); });
    expect(result.current.rotinas[0].ativa).toBe(false);
    expect(L.cancelarLembretes).toHaveBeenCalledWith(id);
    await act(async () => { await result.current.apagar(id); });
    expect(result.current.rotinas).toHaveLength(0);
    expect(L.cancelarLembretes).toHaveBeenLastCalledWith(id);
  });

  it('rejeita dados inválidos e respeita o limite', async () => {
    const { result } = await montar();
    let r = '';
    await act(async () => { r = await result.current.salvar({ ...dados, dias: [] }); });
    expect(r).toBe('invalida');
    for (let i = 0; i < MAX_ROTINAS; i++) await act(async () => { await result.current.salvar(dados); });
    await act(async () => { r = await result.current.salvar(dados); });
    expect(r).toBe('limite');
    expect(result.current.rotinas).toHaveLength(MAX_ROTINAS);
  });

  it('descarta registros corrompidos ao ler', async () => {
    await SecureStore.setItemAsync('voltasegura.rotinas', JSON.stringify([{ id: 'x' }, { id: 'ok', ...dados, hora: '9:05', dias: [3, 3, 9], antecedencia: 7 }]));
    const lidas = await lerRotinas();
    expect(lidas).toHaveLength(1);
    expect(lidas[0]).toMatchObject({ id: 'ok', hora: '09:05', dias: [3], antecedencia: 15 });
  });

  it('monta a saída de hoje no horário da rotina', () => {
    const d = new Date(saidaDeHoje('18:30', new Date(2026, 10, 16, 9, 0)));
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 10, 16, 18, 30]);
  });
});
