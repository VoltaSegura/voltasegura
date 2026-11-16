import type { Ponto } from '@/consulta';

/** Ponto da rotina: coordenadas e o nome mostrado (de um lugar salvo). Só no aparelho, nunca em log nem no servidor (D-31, DT-08). */
export type PontoRotina = { ponto: Ponto; rotulo: string };

/**
 * Rotina da semana (FN-17, D-31): trajeto fixo com dias e horário de saída.
 * Dias seguem a convenção do expo-notifications: 1 = domingo ... 7 = sábado.
 */
export type Rotina = {
  id: string;
  origem: PontoRotina;
  destino: PontoRotina;
  dias: number[];
  /** Horário de saída local, "HH:MM". */
  hora: string;
  /** Minutos antes da saída em que o lembrete toca. */
  antecedencia: number;
  ativa: boolean;
};

export type DadosRotina = Omit<Rotina, 'id'>;

export const MAX_ROTINAS = 5;
export const MAX_ROTULO = 40;
export const ANTECEDENCIA_PADRAO = 15;
export const ANTECEDENCIAS: readonly number[] = [5, 10, 15, 30];

export type ProblemaRotina = 'SEM_ORIGEM' | 'SEM_DESTINO' | 'MESMO_LUGAR' | 'SEM_DIAS' | 'HORA_INVALIDA';

const HORA = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/** Converte "H:MM" ou "HH:MM" em "HH:MM"; devolve null se inválida. */
export function normalizarHora(hora: string): string | null {
  const partes = HORA.exec(hora.trim());
  return partes ? `${partes[1].padStart(2, '0')}:${partes[2]}` : null;
}

export function validarRotina(dados: { origem: PontoRotina | null; destino: PontoRotina | null; dias: number[]; hora: string }): ProblemaRotina[] {
  const problemas: ProblemaRotina[] = [];
  if (!dados.origem) problemas.push('SEM_ORIGEM');
  if (!dados.destino) problemas.push('SEM_DESTINO');
  if (dados.origem && dados.destino && dados.origem.ponto.lat === dados.destino.ponto.lat && dados.origem.ponto.lon === dados.destino.ponto.lon) problemas.push('MESMO_LUGAR');
  if (dados.dias.length === 0) problemas.push('SEM_DIAS');
  if (!normalizarHora(dados.hora)) problemas.push('HORA_INVALIDA');
  return problemas;
}
