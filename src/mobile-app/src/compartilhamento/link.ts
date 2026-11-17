/**
 * Link temporário que só abre no app (D-21): voltasegura://acompanhar/<token>.
 * A guarda de sessão (PL-23) guarda o token até a pessoa entrar.
 */

const PADRAO = /(?:^|\/)acompanhar\/([A-Za-z0-9_-]{6,128})(?:[/?#]|$)/;

/** Extrai o token de um link de acompanhar; qualquer outra coisa devolve `null`. */
export function tokenDoLink(url: string | null | undefined): string | null {
  if (!url) return null;
  return PADRAO.exec(url)?.[1] ?? null;
}

type Ouvinte = () => void;

let pendente: string | null = null;
let logado = false;
const ouvintes = new Set<Ouvinte>();

function avisar() {
  ouvintes.forEach((o) => o());
}

export const linkPendente = {
  obter: () => pendente,
  definir(token: string | null) {
    pendente = token;
    avisar();
  },
  /** O layout raiz informa se há sessão: com sessão o link abre direto; sem, espera o login. */
  definirLogado(valor: boolean) {
    logado = valor;
  },
  estaLogado: () => logado,
  assinar(o: Ouvinte) {
    ouvintes.add(o);
    return () => {
      ouvintes.delete(o);
    };
  },
};
