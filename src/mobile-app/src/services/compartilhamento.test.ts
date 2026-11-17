import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  compartilhamentoMock,
  criarCompartilhamentoApi,
  definirLatenciaCompartilhamentoMock,
  limparCompartilhamentoMock,
} from './compartilhamento';
import { sessaoExemplo, tokensExemplo, trajetoExemplo, visaoExemplo } from './fixtures/compartilhamento';
import { ErroServico } from './erros';

const MIN = 60_000;

beforeEach(() => {
  definirLatenciaCompartilhamentoMock(0);
  limparCompartilhamentoMock();
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe('fixtures de sessão (PL-20)', () => {
  it('cobrem ativo, chegou, encerrado e expirado', () => {
    const agora = Date.now();
    expect(visaoExemplo('ATIVO', agora)).toMatchObject({ estado: 'ATIVO', aoVivo: true });
    expect(visaoExemplo('ATIVO', agora).posicao).not.toBeNull();
    expect(visaoExemplo('CHEGOU', agora).encerradoEm).not.toBeNull();
    expect(visaoExemplo('ENCERRADO', agora).estado).toBe('ENCERRADO');
    expect(visaoExemplo('EXPIRADO', agora)).toMatchObject({ trajeto: null, posicao: null });
  });

  it('o contato não recebe nada que identifique a conta nem a comparação (US-21 AC8)', () => {
    const texto = JSON.stringify(visaoExemplo('ATIVO', Date.now()));
    expect(texto).not.toMatch(/email|e-mail|exposicao|registros|categorias/i);
  });

  it('a sessão dura até a chegada prevista + 30 min', () => {
    const agora = Date.now();
    const s = sessaoExemplo('ATIVO', agora);
    expect(Date.parse(s.expiraEm) - Date.parse(s.trajeto.chegadaPrevista)).toBe(30 * MIN);
    expect(Date.parse(sessaoExemplo('EXPIRADO', agora).expiraEm)).toBeLessThan(agora);
  });
});

describe('compartilhamentoMock (sem servidor nem GPS)', () => {
  const trajeto = () => trajetoExemplo(Date.now() + 20 * MIN);

  it('inicia com link do app, estado ativo e fim em chegada + 30 min', async () => {
    const t = trajeto();
    const s = await compartilhamentoMock.iniciar({ trajeto: t, aoVivo: true });
    expect(s.estado).toBe('ATIVO');
    expect(s.link).toBe(`voltasegura://acompanhar/${s.token}`);
    expect(Date.parse(s.expiraEm)).toBe(Date.parse(t.chegadaPrevista) + 30 * MIN);
  });

  it('o contato vê trajeto e a última posição; ao parar, o link mostra só o fim e os dados somem', async () => {
    const s = await compartilhamentoMock.iniciar({ trajeto: trajeto(), aoVivo: true });
    const pos = { lat: -23.56, lon: -46.65, em: new Date().toISOString() };
    await compartilhamentoMock.enviarPosicao(s.id, pos);
    const durante = await compartilhamentoMock.acompanhar(s.token);
    expect(durante).toMatchObject({ estado: 'ATIVO', aoVivo: true, posicao: pos });
    expect(durante.trajeto).not.toBeNull();

    await compartilhamentoMock.encerrar(s.id, 'PAROU');
    const depois = await compartilhamentoMock.acompanhar(s.token);
    expect(depois).toMatchObject({ estado: 'ENCERRADO', trajeto: null, posicao: null });
    await expect(compartilhamentoMock.enviarPosicao(s.id, pos)).rejects.toMatchObject({ status: 410 });
  });

  it('só o trajeto: a posição enviada não aparece para o contato', async () => {
    const s = await compartilhamentoMock.iniciar({ trajeto: trajeto(), aoVivo: false });
    await compartilhamentoMock.enviarPosicao(s.id, { lat: 1, lon: 2, em: new Date().toISOString() });
    expect((await compartilhamentoMock.acompanhar(s.token)).posicao).toBeNull();
  });

  it('chegada mostra "chegou"; estender adia o tempo máximo', async () => {
    const s = await compartilhamentoMock.iniciar({ trajeto: trajeto(), aoVivo: true });
    const novo = new Date(Date.parse(s.expiraEm) + 30 * MIN).toISOString();
    await compartilhamentoMock.estender(s.id, novo);
    await compartilhamentoMock.encerrar(s.id, 'CHEGOU');
    expect((await compartilhamentoMock.acompanhar(s.token)).estado).toBe('CHEGOU');
  });

  it('link vencido ou desconhecido mostra "terminou", sem dados', async () => {
    const vencida = await compartilhamentoMock.iniciar({ trajeto: trajetoExemplo(Date.now() - 40 * MIN), aoVivo: true });
    expect(await compartilhamentoMock.acompanhar(vencida.token)).toMatchObject({ estado: 'EXPIRADO', trajeto: null });
    expect((await compartilhamentoMock.acompanhar('token-que-nao-existe')).estado).toBe('EXPIRADO');
  });

  it('tokens de exemplo abrem cada estado', async () => {
    for (const estado of ['ATIVO', 'CHEGOU', 'ENCERRADO', 'EXPIRADO'] as const) {
      expect((await compartilhamentoMock.acompanhar(tokensExemplo[estado])).estado).toBe(estado);
    }
  });
});

describe('compartilhamentoApi [HIPÓTESE, PL-18]', () => {
  const api = criarCompartilhamentoApi('https://api.exemplo.invalid');
  const resposta = (status: number, corpo?: unknown) =>
    ({ ok: status < 400, status, json: async () => corpo }) as unknown as Response;

  it('usa os métodos e caminhos do contrato', async () => {
    const f = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(resposta(201, { id: 'x1', link: 'https://app/a/tok123456', expiraEm: '2026-11-15T23:00:00Z' }))
      .mockResolvedValue(resposta(204));
    const s = await api.iniciar({ trajeto: trajetoExemplo(Date.now()), aoVivo: true });
    expect(s).toMatchObject({ id: 'x1', token: 'tok123456', estado: 'ATIVO' });
    await api.enviarPosicao('x1', { lat: 1, lon: 2, em: 'e' });
    await api.estender('x1', 'fim');
    await api.encerrar('x1', 'CHEGOU');
    const chamadas = f.mock.calls.map(([url, init]) => `${(init as RequestInit).method} ${String(url).replace('https://api.exemplo.invalid', '')}`);
    expect(chamadas).toEqual([
      'POST /api/compartilhamentos',
      'PUT /api/compartilhamentos/x1/posicao',
      'PATCH /api/compartilhamentos/x1',
      'DELETE /api/compartilhamentos/x1',
    ]);
    expect(JSON.parse((f.mock.calls[3][1] as RequestInit).body as string)).toEqual({ motivo: 'CHEGOU' });
  });

  it('410 ao acompanhar vira "expirado" sem dados; sem rede continua erro', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(resposta(410)).mockRejectedValueOnce(new Error('offline'));
    expect(await api.acompanhar('abcdef')).toMatchObject({ estado: 'EXPIRADO', trajeto: null });
    await expect(api.acompanhar('abcdef')).rejects.toBeInstanceOf(ErroServico);
  });
});
