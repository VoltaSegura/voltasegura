import { describe, expect, it, jest } from '@jest/globals';

import { ehErroServico } from './erros';
import { criarContaNeonAuth } from './contaNeonAuth';

const BASE = 'https://auth.exemplo.invalid/neondb/auth';
const ORIGEM = 'http://localhost:8081';
const COOKIE = '__Secure-neon-auth.session_token=abc123.assinatura%2Fxyz%3D';

type Resp = { status: number; corpo?: unknown; setCookie?: string | null };

function resposta({ status, corpo, setCookie }: Resp): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (n: string) => (n.toLowerCase() === 'set-cookie' ? (setCookie ?? null) : null) },
    json: async () => {
      if (corpo === undefined) throw new Error('sem corpo');
      return corpo;
    },
  } as unknown as Response;
}

function servico(...respostas: (Resp | Error)[]) {
  const fila = [...respostas];
  const fetchImpl = jest.fn(async (_url: string, _init?: RequestInit) => {
    const r = fila.shift();
    if (r === undefined) throw new Error('chamada inesperada');
    if (r instanceof Error) throw r;
    return resposta(r);
  });
  const s = criarContaNeonAuth({
    urlBase: `${BASE}/`,
    origem: ORIGEM,
    fetchImpl: fetchImpl as unknown as typeof fetch,
  });
  return { s, fetchImpl };
}

const cookieSet = (idade = 604800) =>
  `${COOKIE}; Max-Age=${idade}; Path=/; HttpOnly; Secure; SameSite=None; Partitioned`;

const dadosCadastro = { email: 'pessoa@exemplo.invalid', senha: 'Senha-Valida-1', aceiteAviso: true };

describe('contaNeonAuth', () => {
  it('cadastrar: envia Origin, sem cookie e sem jar nativo; devolve o cookie como token', async () => {
    const { s, fetchImpl } = servico({ status: 200, corpo: { token: 'x' }, setCookie: cookieSet() });
    const antes = Date.now();
    const sessao = await s.cadastrar(dadosCadastro);

    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe(`${BASE}/sign-up/email`);
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('omit');
    const headers = init?.headers as Record<string, string>;
    expect(headers.Origin).toBe(ORIGEM);
    expect(headers.Cookie).toBeUndefined();
    const corpo = JSON.parse(String(init?.body));
    expect(corpo).toEqual({ email: dadosCadastro.email, password: dadosCadastro.senha, name: 'Pessoa usuária' });

    expect(sessao.token).toBe(COOKIE);
    expect(sessao.email).toBe(dadosCadastro.email);
    const expira = Date.parse(sessao.expiraEm);
    expect(expira).toBeGreaterThanOrEqual(antes + 604800 * 1000 - 1000);
  });

  it('entrar: usa o Max-Age do cookie e a validade padrão quando ele falta', async () => {
    const a = servico({ status: 200, corpo: {}, setCookie: cookieSet(3600) });
    const sa = await a.s.entrar({ email: dadosCadastro.email, senha: 'x' });
    expect(Date.parse(sa.expiraEm) - Date.now()).toBeLessThanOrEqual(3600 * 1000);

    const b = servico({ status: 200, corpo: {}, setCookie: COOKIE });
    const sb = await b.s.entrar({ email: dadosCadastro.email, senha: 'x' });
    expect(Date.parse(sb.expiraEm) - Date.now()).toBeGreaterThan(23 * 3600 * 1000);
  });

  it('entrar: cookie de outra chave no mesmo Set-Cookie não confunde a leitura', async () => {
    const { s } = servico({
      status: 200,
      corpo: {},
      setCookie: `outro=1; Max-Age=10, ${cookieSet(7200)}`,
    });
    const sessao = await s.entrar({ email: dadosCadastro.email, senha: 'x' });
    expect(sessao.token).toBe(COOKIE);
    expect(Date.parse(sessao.expiraEm) - Date.now()).toBeLessThanOrEqual(7200 * 1000);
  });

  it.each([
    [401, 'INVALID_EMAIL_OR_PASSWORD', 'NAO_AUTORIZADO', 'CREDENCIAIS'],
  ])('entrar: %i %s vira %s/%s (mensagem genérica, FN-02 AC2)', async (status, code, tipo, codigo) => {
    const { s } = servico({ status, corpo: { code } });
    await expect(s.entrar({ email: dadosCadastro.email, senha: 'errada' })).rejects.toMatchObject({
      tipo,
      codigo,
      status,
    });
  });

  it.each([
    [422, 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL', 'VALIDACAO', 'EMAIL_EXISTENTE'],
    [400, 'PASSWORD_TOO_SHORT', 'VALIDACAO', 'SENHA_CURTA'],
    [400, 'PASSWORD_TOO_LONG', 'VALIDACAO', 'SENHA_LONGA'],
    [400, 'VALIDATION_ERROR', 'VALIDACAO', 'FORMATO'],
    [400, 'MISSING_ORIGIN', 'INDISPONIVEL', 'ORIGEM'],
    [403, 'MISSING_OR_NULL_ORIGIN', 'INDISPONIVEL', 'ORIGEM'],
    [429, 'RATE_LIMIT', 'INDISPONIVEL', null],
    [500, 'ERRO', 'INDISPONIVEL', null],
  ])('cadastrar: %i %s vira %s/%s', async (status, code, tipo, codigo) => {
    const { s } = servico({ status, corpo: { code } });
    await expect(s.cadastrar(dadosCadastro)).rejects.toMatchObject({ tipo, codigo, status });
  });

  it('falha de rede vira SEM_REDE; corpo inválido não quebra o mapeamento', async () => {
    const a = servico(new Error('rede'));
    await expect(a.s.entrar({ email: dadosCadastro.email, senha: 'x' })).rejects.toMatchObject({
      tipo: 'SEM_REDE',
    });
    const b = servico({ status: 500 });
    await expect(b.s.entrar({ email: dadosCadastro.email, senha: 'x' })).rejects.toMatchObject({
      tipo: 'INDISPONIVEL',
    });
  });

  it('resposta 200 sem cookie de sessão é erro (não inventa sessão)', async () => {
    const { s } = servico({ status: 200, corpo: { token: 'so-no-corpo' }, setCookie: null });
    await expect(s.entrar({ email: dadosCadastro.email, senha: 'x' })).rejects.toMatchObject({
      tipo: 'INDISPONIVEL',
      codigo: 'SEM_COOKIE',
    });
  });

  it('valida antes de chamar a rede: e-mail inválido, senha vazia e falta de aceite', async () => {
    const { s, fetchImpl } = servico();
    await expect(s.cadastrar({ ...dadosCadastro, email: 'sem-arroba' })).rejects.toMatchObject({ tipo: 'VALIDACAO' });
    await expect(s.cadastrar({ ...dadosCadastro, senha: '' })).rejects.toMatchObject({ tipo: 'VALIDACAO' });
    await expect(s.cadastrar({ ...dadosCadastro, aceiteAviso: false })).rejects.toMatchObject({
      tipo: 'VALIDACAO',
      codigo: 'ACEITE',
    });
    await expect(s.entrar({ email: 'x', senha: 'y' })).rejects.toMatchObject({ tipo: 'VALIDACAO' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('excluirConta falha de forma explícita (o Neon Auth gerenciado não exclui), sem chamar a rede', async () => {
    const { s, fetchImpl } = servico();
    await expect(s.excluirConta()).rejects.toMatchObject({
      tipo: 'INDISPONIVEL',
      codigo: 'EXCLUSAO_NAO_SUPORTADA',
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('encerrarSessaoRemota envia o cookie e o Origin', async () => {
    const { s, fetchImpl } = servico({ status: 200, corpo: { success: true } });
    await s.encerrarSessaoRemota(COOKIE);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe(`${BASE}/sign-out`);
    const headers = init?.headers as Record<string, string>;
    expect(headers.Cookie).toBe(COOKIE);
    expect(headers.Origin).toBe(ORIGEM);
    const falha = servico({ status: 500 });
    await expect(falha.s.encerrarSessaoRemota(COOKIE)).rejects.toMatchObject({ tipo: 'INDISPONIVEL' });
  });

  it('nunca loga e nunca põe e-mail, senha ou token na mensagem de erro', async () => {
    const espioes = (['log', 'info', 'warn', 'error', 'debug'] as const).map((m) =>
      jest.spyOn(console, m).mockImplementation(() => {}),
    );
    const { s } = servico(
      { status: 422, corpo: { code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' } },
      { status: 401, corpo: { code: 'INVALID_EMAIL_OR_PASSWORD' } },
    );
    const erros: unknown[] = [];
    await s.cadastrar(dadosCadastro).catch((e) => erros.push(e));
    await s.entrar({ email: dadosCadastro.email, senha: dadosCadastro.senha }).catch((e) => erros.push(e));
    for (const e of erros) {
      expect(ehErroServico(e)).toBe(true);
      const texto = JSON.stringify([(e as Error).message, (e as Error).name, e]);
      expect(texto).not.toContain(dadosCadastro.email);
      expect(texto).not.toContain(dadosCadastro.senha);
    }
    for (const e of espioes) {
      expect(e).not.toHaveBeenCalled();
      e.mockRestore();
    }
  });
});
