import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Alert } from 'react-native';

const mockPermissaoSegundoPlano = jest.fn<() => Promise<{ status: string }>>();
const mockPedirSegundoPlano = jest.fn<() => Promise<{ status: string }>>();
const mockStart = jest.fn<(nome: string, opcoes: unknown) => Promise<void>>();
const mockStop = jest.fn<(nome: string) => Promise<void>>();
const mockHasStarted = jest.fn<(nome: string) => Promise<boolean>>();
const mockIsTaskDefined = jest.fn<(nome: string) => boolean>(() => false);
const mockDefineTask = jest.fn<(nome: string, executor: (body: unknown) => unknown) => void>();

jest.mock('expo-location', () => ({
  Accuracy: { High: 5 },
  ActivityType: { OtherNavigation: 4 },
  getBackgroundPermissionsAsync: () => mockPermissaoSegundoPlano(),
  requestBackgroundPermissionsAsync: () => mockPedirSegundoPlano(),
  startLocationUpdatesAsync: (nome: string, opcoes: unknown) => mockStart(nome, opcoes),
  stopLocationUpdatesAsync: (nome: string) => mockStop(nome),
  hasStartedLocationUpdatesAsync: (nome: string) => mockHasStarted(nome),
}));

jest.mock('expo-task-manager', () => ({
  isTaskDefined: (nome: string) => mockIsTaskDefined(nome),
  defineTask: (nome: string, executor: (body: unknown) => unknown) => mockDefineTask(nome, executor),
}));

// Carregado depois dos mocks: o módulo chama `defineTask` já na carga.
/* eslint-disable @typescript-eslint/no-require-imports */
const segundo = require('./segundoPlano') as typeof import('./segundoPlano');
/* eslint-enable @typescript-eslint/no-require-imports */

const { NOME_TAREFA_SEGUIR_ROTA } = segundo;

const leitura = (latitude = -23.55, longitude = -46.63) =>
  ({ coords: { latitude, longitude }, timestamp: Date.now() }) as unknown as import('./segundoPlano').LeituraGps;

describe('decidirModo', () => {
  it('usa segundo plano só com a tarefa disponível e a permissão concedida', () => {
    expect(segundo.decidirModo({ tarefasDisponiveis: true, permissaoSegundoPlano: 'granted' })).toBe('segundoPlano');
  });

  it('cai no primeiro plano sem a tarefa (Expo Go ou build sem o módulo)', () => {
    expect(segundo.decidirModo({ tarefasDisponiveis: false, permissaoSegundoPlano: 'granted' })).toBe('primeiroPlano');
  });

  it('cai no primeiro plano quando a permissão de segundo plano foi negada ou ainda não foi decidida', () => {
    expect(segundo.decidirModo({ tarefasDisponiveis: true, permissaoSegundoPlano: 'denied' })).toBe('primeiroPlano');
    expect(segundo.decidirModo({ tarefasDisponiveis: true, permissaoSegundoPlano: 'undetermined' })).toBe('primeiroPlano');
  });
});

describe('ultimaLeitura', () => {
  it('fica com a última leitura do lote', () => {
    const primeira = leitura(1, 1);
    const ultima = leitura(2, 2);
    expect(segundo.ultimaLeitura({ locations: [primeira, ultima] })).toBe(ultima);
  });

  it('devolve null sem lote, com lote vazio ou sem coordenadas numéricas', () => {
    expect(segundo.ultimaLeitura(null)).toBeNull();
    expect(segundo.ultimaLeitura({})).toBeNull();
    expect(segundo.ultimaLeitura({ locations: [] })).toBeNull();
    expect(segundo.ultimaLeitura({ locations: [{ coords: { latitude: 'x', longitude: 1 } }] })).toBeNull();
    expect(segundo.ultimaLeitura({ locations: [null] })).toBeNull();
  });
});

describe('registro da tarefa', () => {
  it('é definida na carga do módulo, com o nome fixo', () => {
    expect(mockDefineTask).toHaveBeenCalledWith(NOME_TAREFA_SEGUIR_ROTA, expect.any(Function));
  });

  it('repassa a última leitura do lote ao acompanhamento, e ignora lote com erro', async () => {
    const aoLeitura = jest.fn<(l: unknown) => void>();
    mockPermissaoSegundoPlano.mockResolvedValue({ status: 'granted' });
    mockStart.mockResolvedValue(undefined);
    await segundo.iniciarAcompanhamento({ aoLeitura, confirmarPermissao: async () => true });

    const executor = mockDefineTask.mock.calls[0][1];
    const ultima = leitura(3, 3);
    executor({ data: { locations: [leitura(1, 1), ultima] }, error: null, executionInfo: { eventId: 'e', taskName: NOME_TAREFA_SEGUIR_ROTA } });
    executor({ data: { locations: [leitura(9, 9)] }, error: { code: 1, message: 'falhou' }, executionInfo: { eventId: 'f', taskName: NOME_TAREFA_SEGUIR_ROTA } });

    expect(aoLeitura).toHaveBeenCalledTimes(1);
    expect(aoLeitura).toHaveBeenCalledWith(ultima);
    await segundo.pararAcompanhamento();
  });
});

describe('iniciarAcompanhamento', () => {
  let agora: number;
  let spyAgora: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    mockPermissaoSegundoPlano.mockReset();
    mockPedirSegundoPlano.mockReset();
    mockStart.mockReset();
    mockStop.mockReset();
    mockHasStarted.mockReset();
    mockStop.mockResolvedValue(undefined);
    mockHasStarted.mockResolvedValue(false);
    mockIsTaskDefined.mockReturnValue(true);
    agora = Date.now();
    spyAgora = jest.spyOn(Date, 'now').mockReturnValue(agora);
  });

  afterEach(async () => {
    spyAgora.mockRestore();
    await segundo.pararAcompanhamento();
  });

  it('não pede a permissão de segundo plano antes de iniciar', () => {
    expect(mockPermissaoSegundoPlano).not.toHaveBeenCalled();
    expect(mockPedirSegundoPlano).not.toHaveBeenCalled();
  });

  it('com a permissão concedida, inicia a tarefa com foreground service e indicador do iOS', async () => {
    mockPermissaoSegundoPlano.mockResolvedValue({ status: 'granted' });
    mockStart.mockResolvedValue(undefined);
    const confirmar = jest.fn<() => Promise<boolean>>().mockResolvedValue(true);

    const modo = await segundo.iniciarAcompanhamento({ aoLeitura: () => {}, confirmarPermissao: confirmar });

    expect(modo).toBe('segundoPlano');
    expect(confirmar).not.toHaveBeenCalled();
    expect(mockStart).toHaveBeenCalledWith(
      NOME_TAREFA_SEGUIR_ROTA,
      expect.objectContaining({
        showsBackgroundLocationIndicator: true,
        foregroundService: expect.objectContaining({ notificationTitle: expect.any(String), notificationBody: expect.any(String) }),
      }),
    );
  });

  it('pede a permissão de segundo plano com o texto de confirmação antes do pedido do sistema', async () => {
    mockPermissaoSegundoPlano.mockResolvedValue({ status: 'undetermined' });
    mockPedirSegundoPlano.mockResolvedValue({ status: 'granted' });
    mockStart.mockResolvedValue(undefined);
    const ordem: string[] = [];
    const confirmar = jest.fn<() => Promise<boolean>>(async () => {
      ordem.push('confirmar');
      return true;
    });
    mockPedirSegundoPlano.mockImplementation(async () => {
      ordem.push('sistema');
      return { status: 'granted' };
    });

    const modo = await segundo.iniciarAcompanhamento({ aoLeitura: () => {}, confirmarPermissao: confirmar });

    expect(modo).toBe('segundoPlano');
    expect(ordem).toEqual(['confirmar', 'sistema']);
  });

  it('sem a permissão de segundo plano, cai no primeiro plano e não inicia a tarefa', async () => {
    mockPermissaoSegundoPlano.mockResolvedValue({ status: 'undetermined' });
    mockPedirSegundoPlano.mockResolvedValue({ status: 'denied' });

    const modo = await segundo.iniciarAcompanhamento({ aoLeitura: () => {}, confirmarPermissao: async () => true });

    expect(modo).toBe('primeiroPlano');
    expect(mockStart).not.toHaveBeenCalled();
  });

  it('se a pessoa recusar o texto de confirmação, não abre o pedido do sistema', async () => {
    mockPermissaoSegundoPlano.mockResolvedValue({ status: 'undetermined' });

    const modo = await segundo.iniciarAcompanhamento({ aoLeitura: () => {}, confirmarPermissao: async () => false });

    expect(modo).toBe('primeiroPlano');
    expect(mockPedirSegundoPlano).not.toHaveBeenCalled();
  });

  it('se o início da tarefa falhar, cai no primeiro plano', async () => {
    mockPermissaoSegundoPlano.mockResolvedValue({ status: 'granted' });
    mockStart.mockRejectedValue(new Error('app em segundo plano'));

    const modo = await segundo.iniciarAcompanhamento({ aoLeitura: () => {}, confirmarPermissao: async () => true });

    expect(modo).toBe('primeiroPlano');
  });

  it('repassa leituras do primeiro plano e descarta quando não há sessão', async () => {
    mockPermissaoSegundoPlano.mockResolvedValue({ status: 'denied' });
    const aoLeitura = jest.fn<(l: unknown) => void>();
    await segundo.iniciarAcompanhamento({ aoLeitura, confirmarPermissao: async () => false });

    segundo.registrarLeitura(leitura(1, 1));
    expect(aoLeitura).toHaveBeenCalledTimes(1);

    await segundo.pararAcompanhamento();
    segundo.registrarLeitura(leitura(2, 2));
    expect(aoLeitura).toHaveBeenCalledTimes(1);
  });

  it('pararAcompanhamento para a tarefa só se ela estiver rodando, e pode ser chamada de novo', async () => {
    mockPermissaoSegundoPlano.mockResolvedValue({ status: 'granted' });
    mockStart.mockResolvedValue(undefined);
    mockHasStarted.mockResolvedValue(true);
    await segundo.iniciarAcompanhamento({ aoLeitura: () => {}, confirmarPermissao: async () => true });

    await segundo.pararAcompanhamento();
    await segundo.pararAcompanhamento();

    expect(mockStop).toHaveBeenCalledTimes(1);
    expect(mockStop).toHaveBeenCalledWith(NOME_TAREFA_SEGUIR_ROTA);
  });

  it('não lança quando o módulo nativo para a tarefa com erro', async () => {
    mockPermissaoSegundoPlano.mockResolvedValue({ status: 'granted' });
    mockStart.mockResolvedValue(undefined);
    mockHasStarted.mockRejectedValue(new Error('sem tarefa'));
    await segundo.iniciarAcompanhamento({ aoLeitura: () => {}, confirmarPermissao: async () => true });

    await expect(segundo.pararAcompanhamento()).resolves.toBeUndefined();
  });
});

describe('confirmarPermissaoComAlerta', () => {
  it('resolve verdadeiro ao tocar em "Permitir" e falso em "Agora não" ou ao fechar', async () => {
    const alerta = jest.spyOn(Alert, 'alert');

    const aceito = segundo.confirmarPermissaoComAlerta();
    const botoesAceite = alerta.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    botoesAceite[1].onPress?.();
    await expect(aceito).resolves.toBe(true);

    const recusado = segundo.confirmarPermissaoComAlerta();
    const botoesRecusa = alerta.mock.calls[1][2] as { text: string; onPress?: () => void }[];
    botoesRecusa[0].onPress?.();
    await expect(recusado).resolves.toBe(false);

    const fechado = segundo.confirmarPermissaoComAlerta();
    const opcoes = alerta.mock.calls[2][3] as { onDismiss?: () => void };
    opcoes.onDismiss?.();
    await expect(fechado).resolves.toBe(false);

    alerta.mockRestore();
  });
});
