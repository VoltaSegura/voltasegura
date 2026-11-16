import { rotina as t } from '@/textos/rotina';

/** Texto dos dias: "Todos os dias", "Dias úteis", "Fim de semana" ou a lista curta (1 = domingo ... 7 = sábado). */
export function resumoDias(dias: number[]): string {
  const ordenados = [...dias].sort((a, b) => a - b);
  const chave = ordenados.join('');
  if (chave === '1234567') return t.todosOsDias;
  if (chave === '23456') return t.diasUteis;
  if (chave === '17') return t.fimDeSemana;
  return ordenados.map((d) => t.diasCurtos[d - 1]).join(', ');
}
