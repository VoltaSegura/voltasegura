import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';

import type { Rota } from '@/services';
import { pararAcompanhamento, registrarLeitura } from './segundoPlano';
import { useSeguirRota } from './useSeguirRota';

const mockPermissao = jest.fn<() => Promise<{ status: string }>>();
const mockRemover = jest.fn();
let aoLer: ((leitura: unknown) => void) | null = null;
const mockWatch = jest.fn(async (_opcoes: unknown, cb: (leitura: unknown) => void) => {
  aoLer = cb;
  return { remove: mockRemover };
});
const mockRegistrar = jest.fn<(p: unknown) => Promise<void>>(async () => {});
let mockFase = 'inativa';
const mockConsultar = jest.fn<(entrada: unknown, opcoes?: unknown) => Promise<unknown>>();
const mockAtualizarResposta = jest.fn<(resposta: unknown, rotaId: string) => void>();
const mockAtivarTelaLigada = jest.fn<(tag?: string) => Promise<void>>(async () => {});
const mockDesativarTelaLigada = jest.fn<(tag?: string) => Promise<void>>(async () => {});

const mockPermissaoSegundo = jest.fn<() => Promise<{ status: string }>>();
const mockPedirSegundo = jest.fn<() => Promise<{ status: string }>>();
const mockStartTarefa = jest.fn<(nome: string, opcoes: unknown) => Promise<void>>(async () => {});
const mockStopTarefa = jest.fn<(nome: string) => Promise<void>>(async () => {});
const mockTarefaAtiva = jest.fn<(nome: string) => Promise<boolean>>(async () => false);

jest.mock('expo-location', () => ({
  Accuracy: { High: 5 },
  ActivityType: { OtherNavigation: 4 },
  requestForegroundPermissionsAsync: () => mockPermissao(),
  watchPositionAsync: (opcoes: unknown, cb: (leitura: unknown) => void) => mockWatch(opcoes, cb),
  getBackgroundPermissionsAsync: () => mockPermissaoSegundo(),
  requestBackgroundPermissionsAsync: () => mockPedirSegundo(),
  startLocationUpdatesAsync: (nome: string, opcoes: unknown) => mockStartTarefa(nome, opcoes),
  stopLocationUpdatesAsync: (nome: string) => mockStopTarefa(nome),
  hasStartedLocationUpdatesAsync: (nome: string) => mockTarefaAtiva(nome),
}));

// Módulo de tarefa disponível (o build tem o nativo). A própria tarefa é simulada chamando `registrarLeitura`.
jest.mock('expo-task-manager', () => ({
  isTaskDefined: () => false,
  defineTask: () => {},
}));

jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: (tag?: string) => mockAtivarTelaLigada(tag),
  deactivateKeepAwake: (tag?: string) => mockDesativarTelaLigada(tag),
}));

jest.mock('@/compartilhamento', () => ({
  useCompartilhamento: () => ({ fase: mockFase, registrarPosicao: mockRegistrar }),
}));

jest.mock('@/consulta', () => ({
  useConsulta: () => ({
    estado: { consulta: { origem: null, destino: mockDestino, sentido: 'ida', saida: '2026-11-18T22:00:00-03:00' } },
    atualizarResposta: mockAtualizarResposta,
  }),
}));

jest.mock('@/services/selecao', () => ({
  consultarRotas: (entrada: unknown, opcoes?: unknown) => mockConsultar(entrada, opcoes),
}));

// Trajeto de uma rota só, a pé, de (0,0) a (0, 0.01) (~1 km), com geometria codificada em polyline 5.
// Codificação gerada pelo algoritmo polyline 5 para: (-23.55,-46.63) -> (-23.55,-46.62).
const GEOMETRIA = 'nrvnCnlr{G?o}@';
const mockDestino = { lat: -23.55, lon: -46.62 };

const trecho = (id: string, modo: 'A_PE' | 'ONIBUS' = 'A_PE') => ({
  id,
  ordem: 1,
  modo,
  linha: modo === 'ONIBUS' ? '6464' : null,
  embarque: null,
  desembarque: null,
  partidaPrevista: null,
  duracaoMin: 12,
  distanciaKm: 1,
  faixaDoDia: null,
  geometria: GEOMETRIA,
});

const rota = {
  id: 'r1',
  focos: ['MENOR_TEMPO'],
  chegadaPrevista: '2026-11-18T22:30:00-03:00',
  trechos: [trecho('A')],
} as unknown as Rota;

const rotaNova = {
  id: 'r2',
  focos: ['MENOR_TEMPO'],
  chegadaPrevista: '2026-11-18T22:40:00-03:00',
  trechos: [trecho('B')],
} as unknown as Rota;

const respostaCom = (...rotas: Rota[]) => ({ rotas });

const leitura = (latitude: number, longitude: number) => ({ coords: { latitude, longitude }, timestamp: Date.now() });

// Ponto a ~5 km do trajeto: cada leitura assim conta como fora do trajeto.
const FORA = { lat: -23.6, lon: -46.63 };
const DENTRO = { lat: -23.55, lon: -46.63 };

let mockAlerta: jest.SpiedFunction<typeof Alert.alert>;

beforeEach(() => {
  mockPermissao.mockReset();
  mockWatch.mockClear();
  mockRemover.mockClear();
  mockRegistrar.mockClear();
  mockFase = 'inativa';
  aoLer = null;
  mockConsultar.mockReset();
  mockConsultar.mockResolvedValue(respostaCom(rotaNova));
  mockAtualizarResposta.mockClear();
  mockAtivarTelaLigada.mockClear();
  mockDesativarTelaLigada.mockClear();
  // Por padrão, a pessoa recusa o segundo plano: os testes antigos seguem no primeiro plano.
  mockPermissaoSegundo.mockReset();
  mockPermissaoSegundo.mockResolvedValue({ status: 'denied' });
  mockPedirSegundo.mockReset();
  mockPedirSegundo.mockResolvedValue({ status: 'denied' });
  mockStartTarefa.mockClear();
  mockStopTarefa.mockClear();
  mockTarefaAtiva.mockReset();
  mockTarefaAtiva.mockResolvedValue(false);
  // Alerta do pedido de segundo plano: responde automaticamente ("Agora não" por padrão).
  mockAlerta = jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, botoes) => {
    (botoes as { text: string; onPress?: () => void }[])[0].onPress?.();
  });
});

afterEach(async () => {
  mockAlerta.mockRestore();
  await pararAcompanhamento();
});

/** Começa o acompanhamento com permissão concedida e uma leitura dentro do trajeto. */
async function iniciarNoTrajeto(r: Rota = rota) {
  mockPermissao.mockResolvedValue({ status: 'granted' });
  const hook = await renderHook(() => useSeguirRota(r));
  await act(async () => {
    await hook.result.current.comecar();
  });
  await act(() => aoLer?.(leitura(DENTRO.lat, DENTRO.lon)));
  return hook;
}

/** Três leituras seguidas fora do trajeto: confirma o desvio e dispara o recálculo. */
async function sairDoTrajeto() {
  for (let i = 0; i < 3; i++) {
    await act(() => aoLer?.(leitura(FORA.lat, FORA.lon)));
  }
}

describe('useSeguirRota', () => {
  it('começa em "pronto" e não pede localização antes de a pessoa tocar em começar', async () => {
    const { result } = await renderHook(() => useSeguirRota(rota));
    expect(result.current.status).toBe('pronto');
    expect(mockPermissao).not.toHaveBeenCalled();
  });

  it('sem permissão: fica em "semPermissao" e não liga o GPS', async () => {
    mockPermissao.mockResolvedValue({ status: 'denied' });
    const { result } = await renderHook(() => useSeguirRota(rota));
    await act(async () => {
      await result.current.comecar();
    });
    expect(result.current.status).toBe('semPermissao');
    expect(mockWatch).not.toHaveBeenCalled();
  });

  it('com permissão: liga a leitura e passa a seguir a posição', async () => {
    mockPermissao.mockResolvedValue({ status: 'granted' });
    const { result } = await renderHook(() => useSeguirRota(rota));
    await act(async () => {
      await result.current.comecar();
    });
    expect(mockWatch).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('buscandoGps');

    await act(() => aoLer?.(leitura(-23.55, -46.63)));
    expect(result.current.status).toBe('seguindo');
    expect(result.current.avaliacao?.trechoAtual?.id).toBe('A');
    expect(result.current.posicao).toEqual({ latitude: -23.55, longitude: -46.63 });
  });

  it('chegar ao destino encerra a leitura', async () => {
    mockPermissao.mockResolvedValue({ status: 'granted' });
    const { result } = await renderHook(() => useSeguirRota(rota));
    await act(async () => {
      await result.current.comecar();
    });
    await act(() => aoLer?.(leitura(-23.55, -46.6199)));
    expect(result.current.status).toBe('chegou');
    expect(mockRemover).toHaveBeenCalled();
  });

  it('encerrar para a leitura e marca "encerrado"', async () => {
    mockPermissao.mockResolvedValue({ status: 'granted' });
    const { result } = await renderHook(() => useSeguirRota(rota));
    await act(async () => {
      await result.current.comecar();
    });
    await act(() => result.current.encerrar());
    expect(mockRemover).toHaveBeenCalled();
    expect(result.current.status).toBe('encerrado');
  });

  it('com sessão de compartilhamento ativa, envia a posição ao registrarPosicao', async () => {
    mockFase = 'ativa';
    mockPermissao.mockResolvedValue({ status: 'granted' });
    const { result } = await renderHook(() => useSeguirRota(rota));
    await act(async () => {
      await result.current.comecar();
    });
    await act(() => aoLer?.(leitura(-23.55, -46.63)));
    expect(mockRegistrar).toHaveBeenCalledWith(expect.objectContaining({ lat: -23.55, lon: -46.63 }));
  });

  it('sem sessão de compartilhamento, não envia nada', async () => {
    mockPermissao.mockResolvedValue({ status: 'granted' });
    const { result } = await renderHook(() => useSeguirRota(rota));
    await act(async () => {
      await result.current.comecar();
    });
    await act(() => aoLer?.(leitura(-23.55, -46.63)));
    expect(mockRegistrar).not.toHaveBeenCalled();
  });

  it('rota sem traço válido: fica em "semTrajeto" sem pedir localização', async () => {
    const semTraco = { ...rota, trechos: [] } as unknown as Rota;
    const { result } = await renderHook(() => useSeguirRota(semTraco));
    expect(result.current.status).toBe('semTrajeto');
    expect(mockPermissao).not.toHaveBeenCalled();
  });

  describe('recálculo ao desviar (Fase 2)', () => {
    it('não recalcula enquanto o desvio não está confirmado (menos de 3 leituras fora)', async () => {
      const { result } = await iniciarNoTrajeto();
      await act(() => aoLer?.(leitura(FORA.lat, FORA.lon)));
      await act(() => aoLer?.(leitura(FORA.lat, FORA.lon)));
      expect(mockConsultar).not.toHaveBeenCalled();
      expect(result.current.rota.id).toBe('r1');
    });

    it('ao confirmar o desvio, consulta a partir da posição atual, com o mesmo destino e sentido', async () => {
      await iniciarNoTrajeto();
      await sairDoTrajeto();
      expect(mockConsultar).toHaveBeenCalledTimes(1);
      expect(mockConsultar).toHaveBeenCalledWith(
        expect.objectContaining({ origem: { lat: FORA.lat, lon: FORA.lon }, destino: mockDestino, sentido: 'ida' }),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });

    it('troca a rota pela equivalente, publica no useConsulta e mantém o acompanhamento ativo', async () => {
      const { result } = await iniciarNoTrajeto();
      await sairDoTrajeto();
      expect(mockAtualizarResposta).toHaveBeenCalledWith(respostaCom(rotaNova), 'r2');
      expect(result.current.rota.id).toBe('r2');
      expect(result.current.recalculo).toBe('ocioso');
      expect(result.current.status).toBe('seguindo');
      expect(result.current.avaliacao?.foraDoTrajeto).toBe(false);
      expect(mockRemover).not.toHaveBeenCalled();
    });

    it('em erro, mantém a rota antiga e marca "falhou" para a tela oferecer tentar de novo', async () => {
      mockConsultar.mockRejectedValueOnce(new Error('rede'));
      const { result } = await iniciarNoTrajeto();
      await sairDoTrajeto();
      expect(result.current.recalculo).toBe('falhou');
      expect(result.current.rota.id).toBe('r1');
      expect(mockAtualizarResposta).not.toHaveBeenCalled();
    });

    it('"tentar de novo" recalcula na hora e, se der certo, limpa a falha', async () => {
      mockConsultar.mockRejectedValueOnce(new Error('rede'));
      const { result } = await iniciarNoTrajeto();
      await sairDoTrajeto();
      expect(result.current.recalculo).toBe('falhou');
      await act(() => result.current.tentarRecalculo());
      expect(mockConsultar).toHaveBeenCalledTimes(2);
      expect(result.current.rota.id).toBe('r2');
      expect(result.current.recalculo).toBe('ocioso');
    });

    it('debounce de 60 s: um novo desvio dentro desse intervalo não consulta de novo', async () => {
      const agora = 1_800_000_000_000;
      const relogio = jest.spyOn(Date, 'now').mockReturnValue(agora);
      try {
        const { result } = await iniciarNoTrajeto();
        await sairDoTrajeto();
        expect(mockConsultar).toHaveBeenCalledTimes(1);

        // Volta ao trajeto novo e sai de novo 10 s depois: ainda dentro do debounce.
        relogio.mockReturnValue(agora + 10_000);
        await act(() => aoLer?.(leitura(FORA.lat, FORA.lon)));
        await act(() => aoLer?.(leitura(FORA.lat, FORA.lon)));
        await act(() => aoLer?.(leitura(FORA.lat, FORA.lon)));
        expect(mockConsultar).toHaveBeenCalledTimes(1);

        // Passados 60 s desde o último recálculo, a próxima leitura fora do trajeto volta a consultar.
        relogio.mockReturnValue(agora + 61_000);
        await act(() => aoLer?.(leitura(FORA.lat, FORA.lon)));
        expect(mockConsultar).toHaveBeenCalledTimes(2);
        expect(result.current.rota.id).toBe('r2');
      } finally {
        relogio.mockRestore();
      }
    });

    it('depois de 3 falhas seguidas, para de recalcular sozinho; "tentar de novo" ainda funciona', async () => {
      const agora = 1_800_000_000_000;
      const relogio = jest.spyOn(Date, 'now').mockReturnValue(agora);
      mockConsultar.mockRejectedValue(new Error('rede'));
      try {
        const { result } = await iniciarNoTrajeto();
        await sairDoTrajeto(); // falha 1
        relogio.mockReturnValue(agora + 61_000);
        await act(() => aoLer?.(leitura(FORA.lat, FORA.lon))); // falha 2
        relogio.mockReturnValue(agora + 122_000);
        await act(() => aoLer?.(leitura(FORA.lat, FORA.lon))); // falha 3
        expect(mockConsultar).toHaveBeenCalledTimes(3);

        relogio.mockReturnValue(agora + 183_000);
        await act(() => aoLer?.(leitura(FORA.lat, FORA.lon)));
        expect(mockConsultar).toHaveBeenCalledTimes(3);
        expect(result.current.recalculo).toBe('falhou');

        mockConsultar.mockResolvedValue(respostaCom(rotaNova));
        await act(() => result.current.tentarRecalculo());
        expect(mockConsultar).toHaveBeenCalledTimes(4);
        expect(result.current.rota.id).toBe('r2');
      } finally {
        relogio.mockRestore();
      }
    });

    it('resposta que chega depois de "encerrar" é descartada', async () => {
      let resolver: (valor: unknown) => void = () => {};
      mockConsultar.mockReturnValueOnce(new Promise((r) => { resolver = r; }));
      const { result } = await iniciarNoTrajeto();
      await sairDoTrajeto();
      await act(() => result.current.encerrar());
      await act(async () => {
        resolver(respostaCom(rotaNova));
      });
      expect(mockAtualizarResposta).not.toHaveBeenCalled();
      expect(result.current.status).toBe('encerrado');
    });

    it('lista sem rota de traço válido não troca a rota: vira falha', async () => {
      mockConsultar.mockResolvedValueOnce(respostaCom({ ...rotaNova, trechos: [] } as unknown as Rota));
      const { result } = await iniciarNoTrajeto();
      await sairDoTrajeto();
      expect(mockAtualizarResposta).not.toHaveBeenCalled();
      expect(result.current.recalculo).toBe('falhou');
      expect(result.current.rota.id).toBe('r1');
    });
  });

  describe('tela ligada durante o acompanhamento', () => {
    it('liga ao começar a seguir e desliga ao encerrar', async () => {
      const { result } = await iniciarNoTrajeto();
      expect(mockAtivarTelaLigada).toHaveBeenCalledWith('voltasegura-seguir-rota');
      await act(() => result.current.encerrar());
      expect(mockDesativarTelaLigada).toHaveBeenCalledWith('voltasegura-seguir-rota');
    });

    it('sem permissão, não liga a tela', async () => {
      mockPermissao.mockResolvedValue({ status: 'denied' });
      const { result } = await renderHook(() => useSeguirRota(rota));
      await act(async () => {
        await result.current.comecar();
      });
      expect(mockAtivarTelaLigada).not.toHaveBeenCalled();
    });
  });

  describe('segundo plano (tarefa de localização)', () => {
    type Leitura = Parameters<typeof registrarLeitura>[0];
    /** Leitura que a tarefa entregaria: passa pelo mesmo caminho de `registrarLeitura`. */
    const daTarefa = (latitude: number, longitude: number) => registrarLeitura(leitura(latitude, longitude) as unknown as Leitura);

    /** Começa com a pessoa aceitando o segundo plano no alerta. */
    async function iniciarEmSegundoPlano(r: Rota = rota) {
      mockPermissaoSegundo.mockResolvedValue({ status: 'undetermined' });
      mockPedirSegundo.mockResolvedValue({ status: 'granted' });
      mockPermissao.mockResolvedValue({ status: 'granted' });
      mockAlerta.mockImplementation((_t, _m, botoes) => {
        (botoes as { onPress?: () => void }[])[1].onPress?.();
      });
      const hook = await renderHook(() => useSeguirRota(r));
      await act(async () => {
        await hook.result.current.comecar();
      });
      return hook;
    }

    it('pede a permissão de segundo plano só ao começar, com o alerta, e inicia a tarefa sem o watch', async () => {
      expect(mockPedirSegundo).not.toHaveBeenCalled();
      const { result } = await iniciarEmSegundoPlano();
      expect(mockAlerta).toHaveBeenCalledTimes(1);
      expect(mockPedirSegundo).toHaveBeenCalledTimes(1);
      expect(mockStartTarefa).toHaveBeenCalledWith('voltasegura-seguir-rota', expect.any(Object));
      expect(mockWatch).not.toHaveBeenCalled();
      expect(result.current.status).toBe('buscandoGps');
    });

    it('recusando o segundo plano no alerta, segue no primeiro plano sem iniciar a tarefa', async () => {
      mockPermissaoSegundo.mockResolvedValue({ status: 'undetermined' });
      mockPermissao.mockResolvedValue({ status: 'granted' });
      const { result } = await renderHook(() => useSeguirRota(rota));
      await act(async () => {
        await result.current.comecar();
      });
      expect(mockPedirSegundo).not.toHaveBeenCalled();
      expect(mockStartTarefa).not.toHaveBeenCalled();
      expect(mockWatch).toHaveBeenCalledTimes(1);
    });

    it('as leituras da tarefa alimentam a posição e o recálculo, sem leitura duplicada', async () => {
      const { result } = await iniciarEmSegundoPlano();
      await act(() => daTarefa(DENTRO.lat, DENTRO.lon));
      expect(result.current.status).toBe('seguindo');
      expect(result.current.avaliacao?.trechoAtual?.id).toBe('A');

      for (let i = 0; i < 3; i++) {
        await act(() => daTarefa(FORA.lat, FORA.lon));
      }
      expect(mockConsultar).toHaveBeenCalledTimes(1);
      expect(result.current.rota.id).toBe('r2');
      expect(mockWatch).not.toHaveBeenCalled();
    });

    it('chegar ao destino para a tarefa', async () => {
      mockTarefaAtiva.mockResolvedValue(true);
      const { result } = await iniciarEmSegundoPlano();
      await act(() => daTarefa(-23.55, -46.6199));
      expect(result.current.status).toBe('chegou');
      expect(mockStopTarefa).toHaveBeenCalledWith('voltasegura-seguir-rota');
    });

    it('tocar em Encerrar para a tarefa e não aceita mais leituras', async () => {
      mockTarefaAtiva.mockResolvedValue(true);
      const { result } = await iniciarEmSegundoPlano();
      await act(() => result.current.encerrar());
      expect(mockStopTarefa).toHaveBeenCalledWith('voltasegura-seguir-rota');
      await act(() => daTarefa(DENTRO.lat, DENTRO.lon));
      expect(result.current.status).toBe('encerrado');
    });

  });
});
