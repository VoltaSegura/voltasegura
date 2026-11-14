import { ErroServico } from './erros';
import type { EntradaCadastro, EntradaLogin, ServicoConta, Sessao } from './conta';

/**
 * Conta e sessão pelo Neon Auth (Better Auth gerenciado). O app fala só com a
 * URL pública do Auth (`EXPO_PUBLIC_NEON_AUTH_URL`); nenhuma credencial de banco
 * entra no app. Limites verificados na branch `dev` (14/11/2026):
 *
 * - A sessão vem em COOKIE assinado (`...session_token`). O token do corpo e o
 *   `Authorization: Bearer` NÃO funcionam como credencial. Por isso `Sessao.token`
 *   guarda o par `nome=valor` do cookie, que o app reenvia no cabeçalho `Cookie`.
 * - O servidor recusa POST sem `Origin` (MISSING_ORIGIN) e o React Native não
 *   envia esse cabeçalho sozinho: enviamos `origem`, que precisa estar entre os
 *   domínios confiáveis do Neon (`neon neon-auth domain add`; localhost já vale).
 * - O Neon Auth gerenciado não oferece exclusão de conta (POST /delete-user: 404),
 *   então `excluirConta` falha de forma explícita (FN-03/US-03 seguem em aberto).
 * - Não guarda o aceite do aviso de privacidade (US-01 AC2): ele só é exigido
 *   aqui, antes de chamar o servidor.
 *
 * Nunca registra e-mail, senha ou token em log, nem os coloca em mensagens de erro.
 */

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** O Better Auth exige um nome; um valor fixo evita guardar dado a mais (US-01 AC1). */
const NOME_PADRAO = 'Pessoa usuária';
const VALIDADE_PADRAO_S = 24 * 60 * 60;

export interface OpcoesNeonAuth {
  /** URL base do Neon Auth da branch (sem barra final). */
  urlBase: string;
  /** Origem enviada no cabeçalho `Origin` (precisa ser um domínio confiável). */
  origem: string;
  fetchImpl?: typeof fetch;
}

export interface ServicoContaNeonAuth extends ServicoConta {
  /** Encerra a sessão no servidor (POST /sign-out). O chamador também apaga a sessão local. */
  encerrarSessaoRemota(token: string): Promise<void>;
}

function extrairCookieSessao(
  res: Response,
): { cookie: string; maxAgeS: number | null } | null {
  const bruto = res.headers.get('set-cookie');
  if (!bruto) return null;
  const par = /([\w.-]*session_token=[^;,\s]+)/.exec(bruto);
  if (!par) return null;
  const idade = /Max-Age=(\d+)/i.exec(bruto.slice(bruto.indexOf(par[1])));
  return { cookie: par[1], maxAgeS: idade ? Number(idade[1]) : null };
}

function erroDeResposta(status: number, codigo: string | null): ErroServico {
  if (status === 401) return new ErroServico('NAO_AUTORIZADO', 'CREDENCIAIS', status);
  if (status === 422 && codigo?.startsWith('USER_ALREADY_EXISTS')) {
    return new ErroServico('VALIDACAO', 'EMAIL_EXISTENTE', status);
  }
  if (status === 400 || status === 422) {
    if (codigo === 'PASSWORD_TOO_SHORT') return new ErroServico('VALIDACAO', 'SENHA_CURTA', status);
    if (codigo === 'PASSWORD_TOO_LONG') return new ErroServico('VALIDACAO', 'SENHA_LONGA', status);
    if (codigo === 'MISSING_ORIGIN') return new ErroServico('INDISPONIVEL', 'ORIGEM', status);
    return new ErroServico('VALIDACAO', 'FORMATO', status);
  }
  if (status === 403) return new ErroServico('INDISPONIVEL', 'ORIGEM', status);
  return new ErroServico('INDISPONIVEL', null, status);
}

export function criarContaNeonAuth(opcoes: OpcoesNeonAuth): ServicoContaNeonAuth {
  const base = opcoes.urlBase.replace(/\/+$/, '');
  const chamar = opcoes.fetchImpl ?? fetch;

  async function postar(caminho: string, corpo: unknown, cookie?: string): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Origin: opcoes.origem,
    };
    if (cookie) headers.Cookie = cookie;
    try {
      // credentials 'omit': o app controla o cookie; o jar nativo não participa.
      return await chamar(base + caminho, {
        method: 'POST',
        headers,
        body: JSON.stringify(corpo),
        credentials: 'omit',
      });
    } catch {
      throw new ErroServico('SEM_REDE');
    }
  }

  async function sessaoDe(res: Response, email: string): Promise<Sessao> {
    if (!res.ok) {
      let codigo: string | null = null;
      try {
        const json = (await res.json()) as { code?: unknown };
        if (typeof json?.code === 'string') codigo = json.code;
      } catch {
        // corpo ausente ou inválido: segue só com o status
      }
      throw erroDeResposta(res.status, codigo);
    }
    const dados = extrairCookieSessao(res);
    if (!dados) throw new ErroServico('INDISPONIVEL', 'SEM_COOKIE', res.status);
    const segundos = dados.maxAgeS ?? VALIDADE_PADRAO_S;
    return {
      token: dados.cookie,
      expiraEm: new Date(Date.now() + segundos * 1000).toISOString(),
      email,
    };
  }

  function validar(email: string, senha: string): void {
    if (!FORMATO_EMAIL.test(email) || senha.length === 0) {
      throw new ErroServico('VALIDACAO', 'VALIDACAO');
    }
  }

  return {
    async cadastrar({ email, senha, aceiteAviso }: EntradaCadastro) {
      validar(email, senha);
      if (!aceiteAviso) throw new ErroServico('VALIDACAO', 'ACEITE');
      const res = await postar('/sign-up/email', { email, password: senha, name: NOME_PADRAO });
      return sessaoDe(res, email);
    },
    async entrar({ email, senha }: EntradaLogin) {
      validar(email, senha);
      const res = await postar('/sign-in/email', { email, password: senha });
      return sessaoDe(res, email);
    },
    async excluirConta() {
      // POST /delete-user responde 404 no Neon Auth gerenciado. Nada é dado como excluído.
      throw new ErroServico('INDISPONIVEL', 'EXCLUSAO_NAO_SUPORTADA');
    },
    async encerrarSessaoRemota(token: string) {
      const res = await postar('/sign-out', {}, token);
      if (!res.ok) throw erroDeResposta(res.status, null);
    },
  };
}
