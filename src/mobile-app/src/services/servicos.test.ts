import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fixtures, type NomeFixture } from './fixtures';
import {
  consultaMock,
  criarConsultaApi,
  definirFixtureMock,
  definirLatenciaMock,
  definirProvedorToken,
} from './consulta';
import { contaMock, criarContaApi, definirLatenciaContaMock } from './conta';
import { ErroServico } from './erros';
import { decodificar } from './geometria';
import { pontosExemplo } from '@/components/mapa/pontosExemplo';

const entrada = {
  origem: { lat: -23.001, lon: -46.002 },
  destino: { lat: -23.003, lon: -46.004 },
  saida: '2026-11-13T23:00:00-03:00',
  sentido: 'volta' as const,
};
const EMAIL = 'pessoa@exemplo.com';
const URL_BASE = 'https://api.exemplo.test';

const espioes: { mock: { calls: unknown[][] }; mockRestore: () => void }[] = [];
const fetchMock = jest.fn<typeof fetch>();

function resposta(status: number, corpo?: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (corpo === undefined) throw new Error('sem corpo');
      return corpo;
    },
  } as unknown as Response;
}

beforeEach(() => {
  definirLatenciaMock(0);
  definirLatenciaContaMock(0);
  definirFixtureMock('conclusivo');
  definirProvedorToken(() => 'tok-123');
  fetchMock.mockReset();
  (globalThis as unknown as { fetch: unknown }).fetch = fetchMock;
  espioes.push(
    jest.spyOn(console, 'log').mockImplementation(() => {}),
    jest.spyOn(console, 'info').mockImplementation(() => {}),
    jest.spyOn(console, 'warn').mockImplementation(() => {}),
    jest.spyOn(console, 'error').mockImplementation(() => {}),
    jest.spyOn(console, 'debug').mockImplementation(() => {}),
  );
});

afterEach(() => {
  const chamadas = JSON.stringify(espioes.flatMap((e) => e.mock.calls));
  const restantes = espioes.splice(0);
  restantes.forEach((e) => e.mockRestore());
  expect(chamadas).not.toMatch(/-23\.00|-46\.00|pessoa@/);
});

describe('consulta mock', () => {
  it.each(Object.keys(fixtures) as NomeFixture[])(
    'devolve a fixture %s com exemplo: true',
    async (nome) => {
      definirFixtureMock(nome);
      const r = await consultaMock.consultarRotas(entrada);
      expect(r.exemplo).toBe(true);
      expect({ ...r, rotas: r.rotas.map(({ geometria: _geometria, trechos, ...rota }) => ({
        ...rota,
        trechos: trechos.map(({ geometria: _trechoGeometria, ...trecho }) => trecho),
      })) }).toEqual({
        ...fixtures[nome],
        rotas: fixtures[nome].rotas.map(({ geometria: _geometria, trechos, ...rota }) => ({
          ...rota,
          trechos: trechos.map(({ geometria: _trechoGeometria, ...trecho }) => trecho),
        })),
      });
      for (const rota of r.rotas) {
        const pontos = decodificar(rota.geometria);
        expect(pontos[0]).toMatchObject(entrada.origem);
        expect(pontos[pontos.length - 1]).toMatchObject(entrada.destino);
        for (const trecho of rota.trechos) expect(decodificar(trecho.geometria).length).toBeGreaterThanOrEqual(2);
      }
    },
  );

  it('ajusta pontos distantes sem modificar a fixture entre chamadas', async () => {
    const original = JSON.stringify(fixtures.conclusivo);
    const primeira = await consultaMock.consultarRotas(entrada);
    primeira.rotas[0].trechos[0].geometria = 'alterada';
    const exemplo = { ...entrada, origem: pontosExemplo.origem, destino: pontosExemplo.destino };
    const segunda = await consultaMock.consultarRotas(exemplo);
    expect(segunda.rotas[0].trechos[0].geometria).toBe(fixtures.conclusivo.rotas[0].trechos[0].geometria);
    expect(JSON.stringify(fixtures.conclusivo)).toBe(original);
  });

  it('padrão é conclusivo', async () => {
    expect((await consultaMock.consultarRotas(entrada)).caso).toBe('CONCLUSIVO');
  });
});

describe('consulta api', () => {
  const api = criarConsultaApi(URL_BASE);

  it('monta o pedido e devolve a resposta como veio', async () => {
    fetchMock.mockResolvedValue(resposta(200, fixtures.conclusivo));
    const r = await api.consultarRotas(entrada);
    expect(r).toEqual(fixtures.conclusivo);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${URL_BASE}/api/consultas`);
    expect(init?.method).toBe('POST');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer tok-123');
    expect(JSON.parse(init?.body as string)).toEqual(entrada);
  });

  it.each([
    [400, 'VALIDACAO'],
    [401, 'NAO_AUTORIZADO'],
    [422, 'FORA_DA_AREA'],
    [503, 'INDISPONIVEL'],
    [504, 'INDISPONIVEL'],
  ])('mapeia %i para %s', async (status, tipo) => {
    fetchMock.mockResolvedValue(resposta(status, { erro: 'X' }));
    await expect(api.consultarRotas(entrada)).rejects.toMatchObject({ tipo });
  });

  it('mapeia falha de rede para SEM_REDE', async () => {
    fetchMock.mockRejectedValue(new TypeError('falhou'));
    const e = await api.consultarRotas(entrada).catch((x) => x);
    expect(e).toBeInstanceOf(ErroServico);
    expect(e.tipo).toBe('SEM_REDE');
    expect(e.message).not.toMatch(/-23|-46/);
  });
});

describe('conta mock', () => {
  it('cadastra e entra com e-mail válido e senha não vazia', async () => {
    const s = await contaMock.cadastrar({ email: EMAIL, senha: 'x', aceiteAviso: true });
    expect(s).toMatchObject({ email: EMAIL });
    expect(typeof s.token).toBe('string');
    expect(typeof s.expiraEm).toBe('string');
    expect((await contaMock.entrar({ email: EMAIL, senha: 'x' })).email).toBe(EMAIL);
  });

  it.each([
    ['e-mail inválido', 'sem-arroba', 'x'],
    ['senha vazia', EMAIL, ''],
  ])('recusa %s com VALIDACAO', async (_n, email, senha) => {
    await expect(contaMock.entrar({ email, senha })).rejects.toMatchObject({ tipo: 'VALIDACAO' });
    await expect(contaMock.cadastrar({ email, senha, aceiteAviso: true })).rejects.toMatchObject({
      tipo: 'VALIDACAO',
    });
  });

  it('recusa cadastro sem aceite', async () => {
    await expect(
      contaMock.cadastrar({ email: EMAIL, senha: 'x', aceiteAviso: false }),
    ).rejects.toMatchObject({ tipo: 'VALIDACAO' });
  });

  it('exclui a conta', async () => {
    await expect(contaMock.excluirConta()).resolves.toBeUndefined();
  });
});

describe('conta api', () => {
  const api = criarContaApi(URL_BASE);

  it('cadastra: POST /api/conta com aceite e versão', async () => {
    fetchMock.mockResolvedValue(resposta(201, { token: 't', expiraEm: '2026-12-01T00:00:00Z' }));
    const s = await api.cadastrar({ email: EMAIL, senha: 's', aceiteAviso: true });
    expect(s).toEqual({ token: 't', expiraEm: '2026-12-01T00:00:00Z', email: EMAIL });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${URL_BASE}/api/conta`);
    expect(JSON.parse(init?.body as string)).toEqual({
      email: EMAIL,
      senha: 's',
      aceiteAviso: true,
      versaoAviso: 'minuta-2026-11',
    });
  });

  it('entra: POST /api/sessao; 401 vira NAO_AUTORIZADO', async () => {
    fetchMock.mockResolvedValueOnce(resposta(200, { token: 't', expiraEm: 'e' }));
    await api.entrar({ email: EMAIL, senha: 's' });
    expect(fetchMock.mock.calls[0][0]).toBe(`${URL_BASE}/api/sessao`);
    fetchMock.mockResolvedValueOnce(resposta(401, { erro: 'CREDENCIAIS' }));
    await expect(api.entrar({ email: EMAIL, senha: 's' })).rejects.toMatchObject({
      tipo: 'NAO_AUTORIZADO',
      codigo: 'CREDENCIAIS',
    });
  });

  it('cadastro: 409 e 422 viram VALIDACAO', async () => {
    fetchMock.mockResolvedValueOnce(resposta(409, { erro: 'EMAIL_EXISTENTE' }));
    await expect(
      api.cadastrar({ email: EMAIL, senha: 's', aceiteAviso: true }),
    ).rejects.toMatchObject({ tipo: 'VALIDACAO', codigo: 'EMAIL_EXISTENTE' });
    fetchMock.mockResolvedValueOnce(resposta(422, { erro: 'VALIDACAO' }));
    await expect(
      api.cadastrar({ email: EMAIL, senha: 's', aceiteAviso: true }),
    ).rejects.toMatchObject({ tipo: 'VALIDACAO' });
  });

  it('exclui: DELETE com token; rede e 503 falham sem dar como excluído', async () => {
    fetchMock.mockResolvedValueOnce(resposta(204));
    await expect(api.excluirConta()).resolves.toBeUndefined();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${URL_BASE}/api/conta`);
    expect(init?.method).toBe('DELETE');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer tok-123');
    fetchMock.mockRejectedValueOnce(new TypeError('x'));
    await expect(api.excluirConta()).rejects.toMatchObject({ tipo: 'SEM_REDE' });
    fetchMock.mockResolvedValueOnce(resposta(503));
    await expect(api.excluirConta()).rejects.toMatchObject({ tipo: 'INDISPONIVEL' });
  });
});
