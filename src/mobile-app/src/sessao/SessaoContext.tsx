import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { apagarSessao, gravarSessao, lerSessao } from './armazenamento';
import type { Sessao } from './tipos';

type SessaoCtx = {
  logado: boolean;
  sessao: Sessao | null;
  abrirSessao: (sessao: Sessao) => Promise<void>;
  encerrarSessao: () => Promise<void>;
  /** Compatibilidade com as telas atuais: abre uma sessão provisória de exemplo. */
  entrar: () => void;
  /** Compatibilidade com as telas atuais: alias de encerrarSessao. */
  sair: () => void;
};

const SessaoContext = createContext<SessaoCtx | null>(null);

function expirada(sessao: Sessao): boolean {
  const t = Date.parse(sessao.expiraEm);
  return Number.isNaN(t) || t <= Date.now();
}

/**
 * Provisório: usado pelos botões "(provisório)" das telas de auth.
 * Será trocado pelos serviços de conta (I-08), que devolverão a sessão real.
 */
function sessaoProvisoria(): Sessao {
  return {
    token: 'token-provisorio',
    expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    email: 'provisorio@exemplo.invalid',
  };
}

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    (async () => {
      const salva = await lerSessao();
      if (!ativo) return;
      if (salva && !expirada(salva)) {
        setSessao(salva);
      } else if (salva) {
        await apagarSessao();
      }
      if (ativo) setCarregando(false);
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const abrirSessao = useCallback(async (nova: Sessao) => {
    await gravarSessao(nova);
    setSessao(nova);
  }, []);

  const encerrarSessao = useCallback(async () => {
    setSessao(null);
    await apagarSessao();
  }, []);

  const valor = useMemo<SessaoCtx>(
    () => ({
      logado: sessao !== null,
      sessao,
      abrirSessao,
      encerrarSessao,
      entrar: () => {
        void abrirSessao(sessaoProvisoria()).catch(() => {});
      },
      sair: () => {
        void encerrarSessao();
      },
    }),
    [sessao, abrirSessao, encerrarSessao],
  );

  if (carregando) return null;

  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>;
}

export function useSessao(): SessaoCtx {
  const ctx = useContext(SessaoContext);
  if (!ctx) {
    throw new Error('useSessao precisa estar dentro de <SessaoProvider>.');
  }
  return ctx;
}
