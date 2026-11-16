/** Horário local do aparelho para qualquer ISO com fuso; inválidos ficam explícitos. */
export function formatarHora(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '--:--';
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Período curto da linha fixa "Sobre os dados": "jan-set/2026" (mesmo formato na TL-07 e na TL-08).
 * Recebe datas ISO (AAAA-MM-DD) como vêm da resposta.
 */
export function formatarPeriodo(inicio: string, fim: string): string {
  // "Só roteamento" (B-08) manda período vazio: sem datas válidas não há período a mostrar.
  if (Number.isNaN(new Date(`${inicio}T12:00:00Z`).getTime()) || Number.isNaN(new Date(`${fim}T12:00:00Z`).getTime())) return '';
  const mes = (data: string) =>
    new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' })
      .format(new Date(`${data}T12:00:00Z`))
      .replace('.', '');
  return `${mes(inicio)}-${mes(fim)}/${fim.slice(0, 4)}`;
}
