import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Sessão PROVISÓRIA, só em memória, para a navegação do esqueleto funcionar.
 * A versão definitiva guarda o token no expo-secure-store e usa os endpoints
 * de conta do backend (D-03, FN-01 a FN-03; contrato a conciliar em PL-18).
 */
type Sessao = {
  logado: boolean;
  entrar: () => void;
  sair: () => void;
};

const SessaoContext = createContext<Sessao | null>(null);

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [logado, setLogado] = useState(false);

  const valor = useMemo<Sessao>(
    () => ({
      logado,
      entrar: () => setLogado(true),
      sair: () => setLogado(false),
    }),
    [logado],
  );

  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>;
}

export function useSessao(): Sessao {
  const sessao = useContext(SessaoContext);
  if (!sessao) {
    throw new Error('useSessao precisa estar dentro de <SessaoProvider>.');
  }
  return sessao;
}
