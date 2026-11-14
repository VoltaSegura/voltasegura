/**
 * Período curto da linha fixa "Sobre os dados": "jan-set/2026" (mesmo formato na TL-07 e na TL-08).
 * Recebe datas ISO (AAAA-MM-DD) como vêm da resposta.
 */
export function formatarPeriodo(inicio: string, fim: string): string {
  const mes = (data: string) =>
    new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' })
      .format(new Date(`${data}T12:00:00Z`))
      .replace('.', '');
  return `${mes(inicio)}-${mes(fim)}/${fim.slice(0, 4)}`;
}
