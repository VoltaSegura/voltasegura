import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

const CHAVES = [
  'EXPO_PUBLIC_API_MODE',
  'EXPO_PUBLIC_NEON_AUTH_URL',
  'EXPO_PUBLIC_NEON_AUTH_ORIGIN',
] as const;

const guardado: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of CHAVES) guardado[k] = process.env[k];
  for (const k of CHAVES) delete process.env[k];
  jest.resetModules();
});

afterEach(() => {
  for (const k of CHAVES) {
    if (guardado[k] === undefined) delete process.env[k];
    else process.env[k] = guardado[k];
  }
  jest.resetModules();
});

const ehNeon = (conta: object) => 'encerrarSessaoRemota' in conta;

describe('seleção do serviço de conta por variável de ambiente', () => {
  it('sem EXPO_PUBLIC_NEON_AUTH_URL: mock (padrão)', () => {
    const { servicos } = jest.requireActual<typeof import('./index')>('./index');
    expect(ehNeon(servicos.conta)).toBe(false);
  });

  it('com a URL do Neon Auth: usa o Neon Auth mesmo em modo mock', () => {
    process.env.EXPO_PUBLIC_NEON_AUTH_URL = 'https://auth.exemplo.invalid/neondb/auth/';
    const { servicos } = jest.requireActual<typeof import('./index')>('./index');
    expect(ehNeon(servicos.conta)).toBe(true);
  });

  it('a barra final da URL é removida e a origem padrão é localhost:8081', () => {
    process.env.EXPO_PUBLIC_NEON_AUTH_URL = 'https://auth.exemplo.invalid/neondb/auth///';
    const { ambiente } = jest.requireActual<typeof import('@/config/ambiente')>('@/config/ambiente');
    expect(ambiente.urlNeonAuth).toBe('https://auth.exemplo.invalid/neondb/auth');
    expect(ambiente.origemNeonAuth).toBe('http://localhost:8081');
  });

  it('a consulta continua seguindo mock|api, independente do Neon Auth', () => {
    process.env.EXPO_PUBLIC_NEON_AUTH_URL = 'https://auth.exemplo.invalid/neondb/auth';
    const { servicos } = jest.requireActual<typeof import('./index')>('./index');
    const { consultaMock } = jest.requireActual<typeof import('./consulta')>('./consulta');
    expect(servicos.consulta).toBe(consultaMock);
  });
});
