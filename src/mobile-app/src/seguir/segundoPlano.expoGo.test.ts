import { describe, expect, it, jest } from '@jest/globals';

// Expo Go: o módulo nativo do expo-task-manager não existe e o import lança na carga.
jest.mock('expo-task-manager', () => {
  throw new Error("Cannot find native module 'ExpoTaskManager'");
});

const mockStart = jest.fn<() => Promise<void>>();
const mockPermissao = jest.fn<() => Promise<{ status: string }>>();

jest.mock('expo-location', () => ({
  Accuracy: { High: 5 },
  ActivityType: { OtherNavigation: 4 },
  getBackgroundPermissionsAsync: () => mockPermissao(),
  requestBackgroundPermissionsAsync: () => mockPermissao(),
  startLocationUpdatesAsync: () => mockStart(),
  stopLocationUpdatesAsync: async () => {},
  hasStartedLocationUpdatesAsync: async () => false,
}));

/* eslint-disable @typescript-eslint/no-require-imports */
const segundo = require('./segundoPlano') as typeof import('./segundoPlano');
/* eslint-enable @typescript-eslint/no-require-imports */

describe('segundo plano sem módulo nativo (Expo Go)', () => {
  it('não derruba o app e fica no primeiro plano, sem pedir permissão de segundo plano', async () => {
    expect(segundo.registrarTarefaSegundoPlano()).toBe(false);

    const confirmar = jest.fn<() => Promise<boolean>>().mockResolvedValue(true);
    const aoLeitura = jest.fn<(l: unknown) => void>();
    const modo = await segundo.iniciarAcompanhamento({ aoLeitura, confirmarPermissao: confirmar });

    expect(modo).toBe('primeiroPlano');
    expect(confirmar).not.toHaveBeenCalled();
    expect(mockPermissao).not.toHaveBeenCalled();
    expect(mockStart).not.toHaveBeenCalled();
    await expect(segundo.pararAcompanhamento()).resolves.toBeUndefined();
  });
});
