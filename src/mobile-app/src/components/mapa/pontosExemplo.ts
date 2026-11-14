import type { Ponto } from '@/consulta';

/** Coordenadas fictícias para a demonstração; não representam endereços. */
export const pontosExemplo: Readonly<Record<'origem' | 'destino', Ponto>> = {
  origem: { lat: -23.5505, lon: -46.6333 },
  destino: { lat: -23.5612, lon: -46.6552 },
};
