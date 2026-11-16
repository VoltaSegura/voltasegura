import { linkPendente, tokenDoLink } from '@/compartilhamento/link';

/**
 * Link de acompanhar (D-21): voltasegura://acompanhar/<token>.
 * Com sessão, a rota abre direto. Sem sessão, o token fica guardado e o app abre na entrada;
 * depois do login o layout raiz leva à tela de acompanhar (PL-23 [HIPÓTESE]).
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  const token = tokenDoLink(path);
  if (!token) return path;
  if (linkPendente.estaLogado()) return `/acompanhar/${token}`;
  linkPendente.definir(token);
  return '/';
}
