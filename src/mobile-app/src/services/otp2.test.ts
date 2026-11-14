import { codificar, decodificar } from './geometria';
import { faixaDoDia, mapearOtp2, criarConsultaOtp2, type RespostaOtp2 } from './otp2';

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
    ['lista vazia', { data: { planConnection: { edges: [] } } }],
  ])('falha com INDISPONIVEL: %s', (_n, corpo) => {
    expect(() => mapearOtp2(corpo as RespostaOtp2)).toThrow(expect.objectContaining({ tipo: 'INDISPONIVEL' }));
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

