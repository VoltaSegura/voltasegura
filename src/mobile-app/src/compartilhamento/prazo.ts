/**
 * Prazos da sessão de compartilhamento (PL-20, PL-21, PL-22: todos [HIPÓTESE] até a revisão do Lucas).
 * Funções puras: o tempo entra como parâmetro.
 */

const MIN = 60_000;

/** Tempo máximo: chegada prevista + 30 min (PL-20). */
export const MARGEM_APOS_CHEGADA_MIN = 30;
/** Aviso "termina em N min" com "Estender 30 min" (PL-20). */
export const AVISO_ANTES_DO_FIM_MIN = 10;
export const ESTENDER_MIN = 30;
/** Envio de posição a cada 30 s ou 50 m (PL-21). */
export const INTERVALO_POSICAO_S = 30;
export const DISTANCIA_POSICAO_M = 50;
/** Chegada: a até 100 m do destino (PL-22). */
export const RAIO_CHEGADA_M = 100;

/**
 * Os horários da consulta de exemplo ficam no passado. Quando a chegada prevista já passou,
 * o protótipo refaz a conta a partir de agora, com a duração da rota (continua EXEMPLO).
 */
export function chegadaParaSessao(chegadaPrevista: string, duracaoMin: number, agora: number): string {
  const t = Date.parse(chegadaPrevista);
  if (!Number.isNaN(t) && t > agora) return new Date(t).toISOString();
  return new Date(agora + duracaoMin * MIN).toISOString();
}

/** Fim máximo da sessão: chegada + 30 min. */
export function fimMaximo(chegadaIso: string): string {
  return new Date(Date.parse(chegadaIso) + MARGEM_APOS_CHEGADA_MIN * MIN).toISOString();
}

/** Minutos que faltam para o fim, arredondados para cima; nunca negativo. */
export function minutosRestantes(expiraEmIso: string, agora: number): number {
  const falta = Date.parse(expiraEmIso) - agora;
  if (Number.isNaN(falta) || falta <= 0) return 0;
  return Math.ceil(falta / MIN);
}

export function pertoDoFim(expiraEmIso: string, agora: number): boolean {
  const falta = Date.parse(expiraEmIso) - agora;
  return falta > 0 && falta <= AVISO_ANTES_DO_FIM_MIN * MIN;
}

export function expirou(expiraEmIso: string, agora: number): boolean {
  return Date.parse(expiraEmIso) <= agora;
}

/** "Estender 30 min": soma 30 min ao fim atual. */
export function estenderFim(expiraEmIso: string): string {
  return new Date(Date.parse(expiraEmIso) + ESTENDER_MIN * MIN).toISOString();
}
