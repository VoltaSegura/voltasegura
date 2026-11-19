/**
 * Contato de confiança (TL-27, D-36). Só o nome, guardado no aparelho.
 * Sem telefone, e-mail ou conta: a lista não envia nada sozinha.
 */
export type Contato = {
  id: string;
  nome: string;
};

export const MAX_CONTATOS = 10;
export const MAX_NOME_CONTATO = 30;

export function normalizarNomeContato(nome: string): string {
  return nome.replace(/\s+/g, ' ').trim().slice(0, MAX_NOME_CONTATO);
}
