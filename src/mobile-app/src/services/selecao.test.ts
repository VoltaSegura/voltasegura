import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

const CHAVES = [
  'EXPO_PUBLIC_API_MODE',
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_OTP2_URL',
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

  it('a consulta continua seguindo o API_MODE, independente do Neon Auth', () => {
    process.env.EXPO_PUBLIC_NEON_AUTH_URL = 'https://auth.exemplo.invalid/neondb/auth';
    const { servicos } = jest.requireActual<typeof import('./index')>('./index');
    const { consultaMock } = jest.requireActual<typeof import('./consulta')>('./consulta');
    expect(servicos.consulta).toBe(consultaMock);
  });
});

const entrada = {
  origem: { lat: -23.5, lon: -46.6 },
  destino: { lat: -23.51, lon: -46.61 },
  saida: '2026-11-17T23:00:00-03:00',
  sentido: 'volta' as const,
};

describe('lerModo (EXPO_PUBLIC_API_MODE)', () => {
  it.each([
    [undefined, 'mock'],
    ['', 'mock'],
    ['mock', 'mock'],
    ['api', 'api'],
    ['otp2', 'otp2'],
    [' OTP2 ', 'otp2'],
    ['otp', 'invalido'],
    ['real', 'invalido'],
  ])('%p vira %p', (valor, esperado) => {
    const { lerModo } = jest.requireActual<typeof import('@/config/ambiente')>('@/config/ambiente');
    expect(lerModo(valor)).toBe(esperado);
  });
});

describe('lerCoberturaExposicao (EXPO_PUBLIC_EXPOSICAO_COBERTURA)', () => {
  it.each([
    [undefined, 'poligono'],
    ['', 'poligono'],
    ['poligono', 'poligono'],
    ['proxy_pontos', 'proxy_pontos'],
    [' PROXY_PONTOS ', 'proxy_pontos'],
    ['qualquer', 'poligono'],
  ])('%p vira %p', (valor, esperado) => {
    const { lerCoberturaExposicao } = jest.requireActual<typeof import('@/config/ambiente')>('@/config/ambiente');
    expect(lerCoberturaExposicao(valor)).toBe(esperado);
  });
});

describe('seleção da fonte da consulta (B-04)', () => {
  const fetchMock = jest.fn<typeof fetch>();
  let fetchOriginal: typeof fetch;

  beforeEach(() => {
    fetchOriginal = globalThis.fetch;
    fetchMock.mockReset();
    fetchMock.mockRejectedValue(new TypeError('sem rede no teste'));
    (globalThis as unknown as { fetch: unknown }).fetch = fetchMock;
  });

  afterEach(() => {
    (globalThis as unknown as { fetch: unknown }).fetch = fetchOriginal;
  });

  const carregar = () => jest.requireActual<typeof import('./selecao')>('./selecao');

  it('mock devolve as fixtures de exemplo', () => {
    const { selecionarConsulta } = carregar();
    const { consultaMock } = jest.requireActual<typeof import('./consulta')>('./consulta');
    expect(selecionarConsulta({ modoApi: 'mock', urlApi: '', urlOtp2: '' })).toBe(consultaMock);
  });

  it('api chama POST /api/consultas na URL configurada', async () => {
    const { selecionarConsulta } = carregar();
    await selecionarConsulta({ modoApi: 'api', urlApi: 'http://api.exemplo.test', urlOtp2: '' })
      .consultarRotas(entrada).catch(() => {});
    expect(fetchMock.mock.calls[0][0]).toBe('http://api.exemplo.test/api/consultas');
  });

  it('otp2 chama POST /otp/gtfs/v1 na URL configurada', async () => {
    const { selecionarConsulta } = carregar();
    await selecionarConsulta({ modoApi: 'otp2', urlApi: '', urlOtp2: 'http://otp.exemplo.test:8080' })
      .consultarRotas(entrada).catch(() => {});
    expect(fetchMock.mock.calls[0][0]).toBe('http://otp.exemplo.test:8080/otp/gtfs/v1');
    expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');
  });

  it('otp2 com Data API e Neon Auth configurados envolve o roteamento (B-30); sem uma delas, é só o roteamento', async () => {
    const { selecionarConsulta } = carregar();
    const so = selecionarConsulta({ modoApi: 'otp2', urlApi: '', urlOtp2: 'http://otp.exemplo.test:8080', urlDataApi: 'https://dados.exemplo.test' });
    await so.consultarRotas(entrada).catch(() => {});
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('/otp/gtfs/v1');
    const com = selecionarConsulta({
      modoApi: 'otp2', urlApi: '', urlOtp2: 'http://otp.exemplo.test:8080',
      urlDataApi: 'https://dados.exemplo.test', urlNeonAuth: 'https://auth.exemplo.test', exposicaoCobertura: 'poligono',
    });
    expect(com).not.toBe(so);
  });

  it.each([
    ['api sem URL', { modoApi: 'api' as const, urlApi: '', urlOtp2: 'http://otp.exemplo.test' }],
    ['otp2 sem URL', { modoApi: 'otp2' as const, urlApi: 'http://api.exemplo.test', urlOtp2: '' }],
    ['modo inválido', { modoApi: 'invalido' as const, urlApi: 'http://api.exemplo.test', urlOtp2: 'http://otp.exemplo.test' }],
  ])('%s: erro de configuração, sem chamar a rede e sem devolver fixture', async (_nome, config) => {
    const { selecionarConsulta, CODIGO_CONFIGURACAO } = carregar();
    const { consultaMock } = jest.requireActual<typeof import('./consulta')>('./consulta');
    const servico = selecionarConsulta(config);
    expect(servico).not.toBe(consultaMock);
    await expect(servico.consultarRotas(entrada)).rejects.toMatchObject({
      tipo: 'INDISPONIVEL',
      codigo: CODIGO_CONFIGURACAO,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('pelas variáveis: otp2 com barra final na URL usa /otp/gtfs/v1', async () => {
    process.env.EXPO_PUBLIC_API_MODE = 'otp2';
    process.env.EXPO_PUBLIC_OTP2_URL = 'http://192.168.0.10:8080//';
    const { servicos } = jest.requireActual<typeof import('./index')>('./index');
    await servicos.consulta.consultarRotas(entrada).catch(() => {});
    expect(fetchMock.mock.calls[0][0]).toBe('http://192.168.0.10:8080/otp/gtfs/v1');
  });

  it('pelas variáveis: modo com erro de digitação não cai no mock', async () => {
    process.env.EXPO_PUBLIC_API_MODE = 'otp';
    process.env.EXPO_PUBLIC_OTP2_URL = 'http://192.168.0.10:8080';
    const { servicos } = jest.requireActual<typeof import('./index')>('./index');
    await expect(servicos.consulta.consultarRotas(entrada)).rejects.toMatchObject({ tipo: 'INDISPONIVEL' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('pelas variáveis: sem API_MODE continua mock (padrão)', () => {
    const { servicos } = jest.requireActual<typeof import('./index')>('./index');
    const { consultaMock } = jest.requireActual<typeof import('./consulta')>('./consulta');
    expect(servicos.consulta).toBe(consultaMock);
  });
});
