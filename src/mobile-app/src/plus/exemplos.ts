/**
 * Dados de exemplo das telas 13 e 14 (e números fixos da 10 e 12). Sem backend e sem cálculo real:
 * toda tela que usa estes valores mostra o selo EXEMPLO (TL-21 a TL-24; D-36).
 */
export const RESUMO_EXEMPLO = {
  voltas: 9,
  tempoAPe: '2 h 40 min',
  horarioMaisUsado: '18h30',
  /** Seg a Sex. */
  porDia: [2, 1, 2, 2, 2] as const,
};

export const VOLTA_EXEMPLO = {
  duracao: '40 min',
  trajetoAPe: '1,0 km a pé · 1 troca',
};
