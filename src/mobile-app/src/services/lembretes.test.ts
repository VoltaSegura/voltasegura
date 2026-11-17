import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Platform } from 'react-native';

import { agendarLembretes, cancelarLembretes, corpoDoLembrete, gatilhosDaRotina, pedirPermissaoLembretes } from './lembretes';

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { WEEKLY: 'weekly' },
  AndroidImportance: { DEFAULT: 3 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(async () => 'id'),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  cancelAllScheduledNotificationsAsync: jest.fn(),
}));

type Mock = jest.Mock<(...args: any[]) => Promise<any>>;
const N = jest.requireMock<Record<string, Mock>>('expo-notifications');
const base = { id: 'abc', dias: [2, 4], hora: '18:30', antecedencia: 15 };

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
});

describe('lembretes da rotina (FN-17, D-31)', () => {
  it('calcula o gatilho N minutos antes, um por dia', () => {
    expect(gatilhosDaRotina(base)).toEqual([
      { identificador: 'rotina-abc-2', weekday: 2, hour: 18, minute: 15, diaSaida: 2 },
      { identificador: 'rotina-abc-4', weekday: 4, hour: 18, minute: 15, diaSaida: 4 },
    ]);
  });

  it('passa para o dia anterior quando o aviso cai antes da meia-noite', () => {
    const g = gatilhosDaRotina({ ...base, dias: [1, 2], hora: '00:05' });
    expect(g.map((x) => [x.weekday, x.hour, x.minute, x.diaSaida])).toEqual([[7, 23, 50, 1], [1, 23, 50, 2]]);
  });

  it('usa texto neutro, com dia e hora, sem prometer segurança', () => {
    const texto = corpoDoLembrete(2, '18:30');
    expect(texto).toBe('Hora de sair: sua rotina de segunda-feira às 18:30. Compare os caminhos antes de sair.');
    expect(texto.toLowerCase()).not.toMatch(/segur|rota|pre[cç]o/);
  });

  it('agenda um lembrete semanal por dia, sem coordenadas no conteúdo', async () => {
    await agendarLembretes({ ...base, ativa: true, origem: { ponto: { lat: -23.5, lon: -46.6 }, rotulo: 'Casa' }, destino: { ponto: { lat: -23.6, lon: -46.7 }, rotulo: 'Trabalho' } });
    expect(N.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
    const chamada = N.scheduleNotificationAsync.mock.calls[0][0];
    expect(chamada.trigger).toMatchObject({ type: 'weekly', weekday: 2, hour: 18, minute: 15 });
    expect(chamada.content.data).toEqual({ rotinaId: 'abc' });
    expect(JSON.stringify(chamada)).not.toContain('-23.5');
  });

  it('cancela só os lembretes da rotina', async () => {
    N.getAllScheduledNotificationsAsync.mockResolvedValueOnce([{ identifier: 'rotina-abc-2' }, { identifier: 'rotina-outra-2' }]);
    await cancelarLembretes('abc');
    expect(N.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
    expect(N.cancelScheduledNotificationAsync).toHaveBeenCalledWith('rotina-abc-2');
  });

  it('permissão: concedida, pedida uma vez, negada e sem nova chance', async () => {
    N.getPermissionsAsync.mockResolvedValueOnce({ granted: true });
    expect(await pedirPermissaoLembretes()).toBe('concedida');
    expect(N.requestPermissionsAsync).not.toHaveBeenCalled();

    N.getPermissionsAsync.mockResolvedValueOnce({ granted: false, canAskAgain: true });
    N.requestPermissionsAsync.mockResolvedValueOnce({ granted: false });
    expect(await pedirPermissaoLembretes()).toBe('negada');
    expect(N.requestPermissionsAsync).toHaveBeenCalledTimes(1);

    N.getPermissionsAsync.mockResolvedValueOnce({ granted: false, canAskAgain: false });
    expect(await pedirPermissaoLembretes()).toBe('negada');
    expect(N.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('na web não agenda nem pede permissão', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    expect(await pedirPermissaoLembretes()).toBe('negada');
    await agendarLembretes({ ...base, ativa: true, origem: { ponto: { lat: 1, lon: 1 }, rotulo: 'A' }, destino: { ponto: { lat: 2, lon: 2 }, rotulo: 'B' } });
    expect(N.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
