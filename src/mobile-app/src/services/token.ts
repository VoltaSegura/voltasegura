/** Provedor injetável do token da sessão (o armazenamento seguro fica fora desta camada). */
let provedor: () => string | null = () => null;

export function definirProvedorToken(fn: () => string | null): void {
  provedor = fn;
}

export function obterToken(): string | null {
  return provedor();
}
