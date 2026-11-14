import type { Consulta } from './tipos';

/** FL-08 / FN-06: inverte origem e destino e marca o sentido como volta. Não muta a entrada. */
export function planejarVolta(consulta: Consulta): Consulta {
  return { ...consulta, origem: consulta.destino, destino: consulta.origem, sentido: 'volta' };
}
