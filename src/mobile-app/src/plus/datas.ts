/** Datas da simulação do VoltaSegura+ em pt-BR, sem depender de Intl (Hermes). */
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const;
const DIAS_TESTE = 7;

/** "25 nov" */
export function dataCurta(d: Date): string {
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

/** Fim do teste de 7 dias contado a partir de `inicio`. Não é guardado: a simulação recalcula. */
export function fimDoTeste(inicio: Date = new Date()): Date {
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + DIAS_TESTE);
  return fim;
}

/** "HH:MM" a partir de uma data local. */
export function horaLocal(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** ISO de hoje na hora "HH:MM" informada (para o SeletorHorario, que trabalha com ISO). */
export function isoDeHoraHoje(hora: string, agora: Date = new Date()): string {
  const [h, m] = hora.split(':').map(Number);
  const d = new Date(agora);
  d.setHours(Number.isFinite(h) ? h : 18, Number.isFinite(m) ? m : 0, 0, 0);
  return d.toISOString();
}
