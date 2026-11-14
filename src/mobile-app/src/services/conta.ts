import { ambiente } from '@/config/ambiente';
import { ErroServico } from './erros';
import { atraso, chamar } from './http';
import { obterToken } from './token';

export interface Sessao {
  token: string;
  /** ISO-8601. */
  expiraEm: string;
  email: string;
}

export interface EntradaCadastro {
  email: string;
  senha: string;
  aceiteAviso: boolean;
  versaoAviso?: string;
}

export interface EntradaLogin {
  email: string;
  senha: string;
}

export interface ServicoConta {
  cadastrar(entrada: EntradaCadastro): Promise<Sessao>;
  entrar(entrada: EntradaLogin): Promise<Sessao>;
  excluirConta(): Promise<void>;
}

/** Versão do aviso de privacidade enviada no cadastro [HIPÓTESE, minuta]. */
export const VERSAO_AVISO_PADRAO = 'minuta-2026-11';

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(email: string, senha: string): void {
  if (!FORMATO_EMAIL.test(email) || senha.length === 0) {
    throw new ErroServico('VALIDACAO', 'VALIDACAO');
  }
}

let latenciaMs = 400;
export function definirLatenciaContaMock(ms: number): void {
  latenciaMs = ms;
}

function sessaoMock(email: string): Sessao {
  return {
    token: 'token-exemplo',
    expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    email,
  };
}

export const contaMock: ServicoConta = {
  async cadastrar({ email, senha, aceiteAviso }) {
    await atraso(latenciaMs);
    validar(email, senha);
    if (!aceiteAviso) throw new ErroServico('VALIDACAO', 'ACEITE');
    return sessaoMock(email);
  },
  async entrar({ email, senha }) {
    await atraso(latenciaMs);
    validar(email, senha);
    return sessaoMock(email);
  },
  async excluirConta() {
    await atraso(latenciaMs);
  },
};

interface RespostaSessao {
  token: string;
  expiraEm: string;
}

/** FN-01 POST /api/conta · FN-02 POST /api/sessao · FN-03 DELETE /api/conta [HIPÓTESE, PL-18]. */
export function criarContaApi(urlBase: string): ServicoConta {
  return {
    async cadastrar({ email, senha, aceiteAviso, versaoAviso }) {
      const r = await chamar<RespostaSessao>(`${urlBase}/api/conta`, 'POST', {
        corpo: { email, senha, aceiteAviso, versaoAviso: versaoAviso ?? VERSAO_AVISO_PADRAO },
        contexto: 'conta',
      });
      return { token: r!.token, expiraEm: r!.expiraEm, email };
    },
    async entrar({ email, senha }) {
      const r = await chamar<RespostaSessao>(`${urlBase}/api/sessao`, 'POST', {
        corpo: { email, senha },
        contexto: 'conta',
      });
      return { token: r!.token, expiraEm: r!.expiraEm, email };
    },
    async excluirConta() {
      // erro de rede: lança SEM_REDE, nada é dado como excluído
      await chamar<never>(`${urlBase}/api/conta`, 'DELETE', {
        token: obterToken(),
        contexto: 'conta',
      });
    },
  };
}

export const contaApi = criarContaApi(ambiente.urlApi);

export const conta: ServicoConta = ambiente.modoApi === 'api' ? contaApi : contaMock;
