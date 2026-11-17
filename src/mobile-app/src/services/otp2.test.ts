import { codificar, decodificar } from './geometria';
import {
  CODIGO_TEMPO_ESGOTADO,
  CONSULTA_OTP2,
  TEMPO_LIMITE_OTP2_MS,
  criarConsultaOtp2,
  faixaDoDia,
  mapearOtp2,
  type RespostaOtp2,
} from './otp2';

// Fixture SINTÉTICA (não é resposta real do OTP2): coordenadas inventadas, formato conforme consultar_teste.py.
const A = { lat: -23.5, lon: -46.6 };
const B = { lat: -23.501, lon: -46.601 };
const C = { lat: -23.505, lon: -46.61 };
const pe = (de: typeof A, ate: typeof A, inicio: string, fim: string, dist: number, dur: number) => ({
  mode: 'WALK', distance: dist, duration: dur,
  start: { scheduledTime: inicio }, end: { scheduledTime: fim },
  from: { name: 'Origem' }, to: { name: 'Parada' }, route: null,
  legGeometry: { points: codificar([de, ate]) },
});
const onibus = {
  mode: 'BUS', distance: 4000, duration: 900,
  start: { scheduledTime: '2026-11-17T23:10:00-03:00' }, end: { scheduledTime: '2026-11-17T23:25:00-03:00' },
  from: { name: 'Parada X' }, to: { name: 'Parada Y' }, route: { shortName: '875C-10', longName: 'Linha' },
  legGeometry: { points: codificar([B, C]) },
};
const no = (dur: number, walk: number, legs: object[]) => ({
  node: { start: '2026-11-17T23:00:00-03:00', end: '2026-11-17T23:40:00-03:00', duration: dur, walkDistance: walk, numberOfTransfers: 0, legs },
});

function resposta(): RespostaOtp2 {
  return { data: { planConnection: { edges: [
    no(2400, 1200, [pe(A, B, '2026-11-17T23:00:00-03:00', '2026-11-17T23:10:00-03:00', 700, 600), onibus]),
    no(2100, 1500, [pe(A, B, '2026-11-18T00:30:00-03:00', '2026-11-18T00:40:00-03:00', 1500, 900), onibus]),
    no(3000, 300, [pe(A, B, '2026-11-17T23:00:00-03:00', '2026-11-17T23:05:00-03:00', 300, 300), onibus]),
  ] } } };
}

const so1 = (): RespostaOtp2 => ({ data: { planConnection: { edges: [resposta().data!.planConnection!.edges![0]] } } });

describe('faixaDoDia', () => {
  it('usa o horário de São Paulo, também com outro fuso na string', () => {
    expect(faixaDoDia('2026-11-17T23:00:00-03:00')).toBe('NOITE');
    expect(faixaDoDia('2026-11-18T00:30:00-03:00')).toBe('MADRUGADA');
    expect(faixaDoDia('2026-11-18T09:00:00Z')).toBe('MANHA');
    expect(faixaDoDia('2026-11-18T12:00:00-03:00')).toBe('TARDE');
    expect(faixaDoDia(undefined)).toBeNull();
    expect(faixaDoDia('lixo')).toBeNull();
  });
});

describe('mapearOtp2', () => {
  it('converte unidades, modos, linha e faixa do trecho a pé', () => {
    const r = mapearOtp2(so1());
    const rota = r.rotas[0];
    expect(rota.duracaoMin).toBe(40);
    expect(rota.caminhadaKm).toBe(0.7);
    const [a, b] = rota.trechos;
    expect(a).toMatchObject({ modo: 'A_PE', linha: null, embarque: null, faixaDoDia: 'NOITE', distanciaKm: 0.7, duracaoMin: 10 });
    expect(b).toMatchObject({ modo: 'ONIBUS', linha: '875C-10', embarque: 'Parada X', desembarque: 'Parada Y', faixaDoDia: null });
  });

  it('une a geometria sem repetir o vértice de conexão', () => {
    const rota = mapearOtp2(so1()).rotas[0];
    expect(decodificar(rota.geometria)).toHaveLength(3);
  });

  it('elege menor tempo e menos caminhada entre todas as candidatas', () => {
    const r = mapearOtp2(resposta());
    expect(r.rotas.find((x) => x.focos.includes('MENOR_TEMPO'))!.id).toBe('r2');
    expect(r.rotas.find((x) => x.focos.includes('MENOS_CAMINHADA'))!.id).toBe('r3');
    expect(r.rotas.every((x) => !x.focos.includes('MENOR_EXPOSICAO'))).toBe(true);
  });

  it('adiciona OUTRA_OPCAO quando uma só rota vence os dois focos', () => {
    const rs = resposta();
    rs.data!.planConnection!.edges![1] = no(2100, 200, [pe(A, B, '2026-11-17T23:00:00-03:00', '2026-11-17T23:03:00-03:00', 200, 180), onibus]);
    const r = mapearOtp2(rs);
    expect(r.rotas[0].focos).toEqual(['MENOR_TEMPO', 'MENOS_CAMINHADA']);
    expect(r.rotas.some((x) => x.focos.includes('OUTRA_OPCAO'))).toBe(true);
  });

  it('nunca inventa exposição: tudo null e caso INDISPONIVEL', () => {
    const r = mapearOtp2(resposta());
    expect(r.exemplo).toBe(false);
    expect(r.caso).toBe('INDISPONIVEL');
    const rota = r.rotas[0];
    expect(rota.exposicao).toMatchObject({ registros: null, registrosPorKm: null, cobertura: null });
    expect(rota.categorias.furto.total).toBeNull();
    expect(r.panoramaMunicipal.homicidioDoloso).toBeNull();
  });

  it('descarta candidata com modo desconhecido ou sem geometria', () => {
    const rs = resposta();
    rs.data!.planConnection!.edges![0] = no(2400, 0, [{ mode: 'FERRY', legGeometry: { points: 'x' } }]);
    rs.data!.planConnection!.edges![1] = no(2400, 0, [{ mode: 'WALK', legGeometry: null }]);
    expect(mapearOtp2(rs).rotas.map((x) => x.id)).toEqual(['r3']);
  });

  it.each([
    ['erros do OTP2', { errors: [{}] }],
    ['sem dados', {}],
    ['planConnection nulo', { data: { planConnection: null } }],
    ['nenhuma candidata utilizável', { data: { planConnection: { edges: [no(60, 0, [{ mode: 'FERRY', legGeometry: { points: 'x' } }])] } } }],
  ])('falha com INDISPONIVEL: %s', (_n, corpo) => {
    expect(() => mapearOtp2(corpo as RespostaOtp2)).toThrow(expect.objectContaining({ tipo: 'INDISPONIVEL' }));
  });

  it('declara a origem por bloco: roteamento otp2, exposição indisponível', () => {
    const r = mapearOtp2(resposta());
    expect(r.fontes).toEqual({ roteamento: 'otp2', exposicao: 'indisponivel' });
    expect(r.sobreOsDados.atualizacao).toEqual({ ssp: '', gtfs: '' }); // nunca a data de hoje como se fosse do GTFS
  });

  it('trólebus vira ônibus', () => {
    const rs = so1();
    rs.data!.planConnection!.edges![0]!.node!.legs![1] = { ...onibus, mode: 'TROLLEYBUS' };
    expect(mapearOtp2(rs).rotas[0].trechos[1].modo).toBe('ONIBUS');
  });

  it('descarta candidata com geometria ilegível', () => {
    const rs = resposta();
    rs.data!.planConnection!.edges![0]!.node!.legs![1] = { ...onibus, legGeometry: { points: '~~~' } };
    expect(mapearOtp2(rs).rotas.map((x) => x.id)).not.toContain('r1');
  });

  it('descarta candidata com horário sem fuso (validação do contrato)', () => {
    const rs = so1();
    rs.data!.planConnection!.edges![0]!.node!.start = '2026-11-17T23:00:00';
    expect(() => mapearOtp2(rs)).toThrow(expect.objectContaining({ tipo: 'INDISPONIVEL' }));
  });

  it.each([
    ['lista vazia', { edges: [], routingErrors: [] }],
    ['sem conexão de transporte', { edges: [], routingErrors: [{ code: 'NO_TRANSIT_CONNECTION' }] }],
    ['fora do período do GTFS', { edges: [], routingErrors: [{ code: 'OUTSIDE_SERVICE_PERIOD' }] }],
    ['arestas nulas', { edges: [null, { node: null }], routingErrors: null }],
  ])('sem itinerário (%s): zero rotas, sem fixture e sem exposição', (_n, plano) => {
    const r = mapearOtp2({ data: { planConnection: plano } } as RespostaOtp2);
    expect(r.rotas).toEqual([]);
    expect(r).toMatchObject({ exemplo: false, caso: 'INDISPONIVEL', fontes: { roteamento: 'otp2', exposicao: 'indisponivel' } });
  });

  it('fora dos limites do grafo vira FORA_DA_AREA', () => {
    const corpo = { data: { planConnection: { edges: [], routingErrors: [{ code: 'OUTSIDE_BOUNDS' }] } } };
    expect(() => mapearOtp2(corpo)).toThrow(expect.objectContaining({ tipo: 'FORA_DA_AREA' }));
  });

  it('pede routingErrors na consulta GraphQL', () => {
    expect(CONSULTA_OTP2).toMatch(/routingErrors\s*\{\s*code\s*\}/);
  });
});

describe('criarConsultaOtp2', () => {
  const entrada = { origem: A, destino: C, saida: '2026-11-17T23:00:00-03:00', sentido: 'ida' as const };
  const original = global.fetch;
  afterEach(() => { global.fetch = original; });

  it('envia coordenadas, saída e 5 candidatas ao endpoint GraphQL', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => resposta() });
    global.fetch = fetchMock as unknown as typeof fetch;
    const r = await criarConsultaOtp2('http://192.0.2.1:8080').consultarRotas(entrada);
    expect(r.rotas.length).toBeGreaterThan(0);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://192.0.2.1:8080/otp/gtfs/v1');
    const corpo = JSON.parse(init.body);
    expect(corpo.variables).toEqual({
      origem: { latitude: A.lat, longitude: A.lon },
      destino: { latitude: C.lat, longitude: C.lon },
      saida: entrada.saida,
      n: 5,
    });
  });

  it('rede caindo vira SEM_REDE; HTTP de erro vira INDISPONIVEL; cancelamento propaga', async () => {
    const svc = criarConsultaOtp2('http://x');
    global.fetch = jest.fn().mockRejectedValue(new TypeError('net')) as unknown as typeof fetch;
    await expect(svc.consultarRotas(entrada)).rejects.toMatchObject({ tipo: 'SEM_REDE' });
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 }) as unknown as typeof fetch;
    await expect(svc.consultarRotas(entrada)).rejects.toMatchObject({ tipo: 'INDISPONIVEL' });
    global.fetch = jest.fn().mockRejectedValue(Object.assign(new Error('a'), { name: 'AbortError' })) as unknown as typeof fetch;
    await expect(svc.consultarRotas(entrada)).rejects.toMatchObject({ name: 'AbortError' });
  });
});


describe('criarConsultaOtp2: tempo limite, cancelamento e erros (B-05)', () => {
  const entrada = { origem: A, destino: C, saida: '2026-11-17T23:00:00-03:00', sentido: 'volta' as const };
  const original = global.fetch;
  let espioes: jest.SpyInstance[] = [];

  /** fetch que só termina quando o sinal é abortado (servidor que não responde). */
  const fetchPendurado = () => jest.fn((_url: string, init?: RequestInit) => new Promise<Response>((_ok, falhar) => {
    init?.signal?.addEventListener('abort', () => falhar(Object.assign(new Error('abortado'), { name: 'AbortError' })));
  }));

  beforeEach(() => {
    espioes = (['log', 'info', 'warn', 'error', 'debug'] as const).map((m) => jest.spyOn(console, m).mockImplementation(() => {}));
  });

  afterEach(() => {
    const chamadas = JSON.stringify(espioes.flatMap((e) => e.mock.calls));
    espioes.forEach((e) => e.mockRestore());
    global.fetch = original;
    jest.useRealTimers();
    expect(chamadas).not.toMatch(/-23\.5|-46\.6/); // US-19 AC2: coordenadas nunca em log
  });

  it('tempo padrão é 45 s [HIPÓTESE, B-50]', () => {
    expect(TEMPO_LIMITE_OTP2_MS).toBe(45_000);
  });

  it('servidor sem resposta: tempo esgotado vira INDISPONIVEL 504 (sem fixture)', async () => {
    jest.useFakeTimers();
    global.fetch = fetchPendurado() as unknown as typeof fetch;
    const pendente = criarConsultaOtp2('http://x', { tempoLimiteMs: 1000 }).consultarRotas(entrada);
    const verificacao = expect(pendente).rejects.toMatchObject({ tipo: 'INDISPONIVEL', status: 504, codigo: CODIGO_TEMPO_ESGOTADO });
    jest.advanceTimersByTime(1000);
    await verificacao;
  });

  it('o sinal enviado ao fetch é abortado quando quem chamou cancela', async () => {
    const fetchMock = fetchPendurado();
    global.fetch = fetchMock as unknown as typeof fetch;
    const controlador = new AbortController();
    const pendente = criarConsultaOtp2('http://x').consultarRotas(entrada, { signal: controlador.signal });
    controlador.abort();
    await expect(pendente).rejects.toMatchObject({ name: 'AbortError' });
    expect((fetchMock.mock.calls[0][1] as RequestInit).signal?.aborted).toBe(true);
  });

  it('já cancelado antes de começar: nem chama a rede', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    const controlador = new AbortController();
    controlador.abort();
    await expect(criarConsultaOtp2('http://x').consultarRotas(entrada, { signal: controlador.signal }))
      .rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('cancelado enquanto lia o corpo: AbortError, não resultado', async () => {
    const controlador = new AbortController();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => { controlador.abort(); return resposta(); },
    }) as unknown as typeof fetch;
    await expect(criarConsultaOtp2('http://x').consultarRotas(entrada, { signal: controlador.signal }))
      .rejects.toMatchObject({ name: 'AbortError' });
  });

  it('a resposta chegou: o relógio é desligado (não aborta depois)', async () => {
    jest.useFakeTimers();
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => resposta() });
    global.fetch = fetchMock as unknown as typeof fetch;
    const r = await criarConsultaOtp2('http://x', { tempoLimiteMs: 1000 }).consultarRotas(entrada);
    expect(r.rotas.length).toBeGreaterThan(0);
    expect(jest.getTimerCount()).toBe(0);
  });

  it.each([500, 502, 503, 400])('HTTP %i vira INDISPONIVEL com o status', async (status) => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status }) as unknown as typeof fetch;
    await expect(criarConsultaOtp2('http://x').consultarRotas(entrada)).rejects.toMatchObject({ tipo: 'INDISPONIVEL', status });
  });

  it('corpo que não é JSON vira INDISPONIVEL', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => { throw new SyntaxError('Unexpected token <'); },
    }) as unknown as typeof fetch;
    await expect(criarConsultaOtp2('http://x').consultarRotas(entrada)).rejects.toMatchObject({ tipo: 'INDISPONIVEL' });
  });

  it('resposta vazia do OTP2 (sem itinerário): zero rotas, sem cair no mock', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => ({ data: { planConnection: { edges: [], routingErrors: [{ code: 'NO_TRANSIT_CONNECTION' }] } } }),
    }) as unknown as typeof fetch;
    const r = await criarConsultaOtp2('http://x').consultarRotas(entrada);
    expect(r.rotas).toEqual([]);
    expect(r.exemplo).toBe(false);
  });

  it('erro de rede vira SEM_REDE sem coordenadas na mensagem', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed')) as unknown as typeof fetch;
    const e = await criarConsultaOtp2('http://x').consultarRotas(entrada).catch((x) => x);
    expect(e).toMatchObject({ tipo: 'SEM_REDE' });
    expect(String(e.message)).not.toMatch(/-23|-46/);
  });
});
