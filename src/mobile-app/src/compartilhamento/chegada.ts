import { RAIO_CHEGADA_M } from './prazo';

type Ponto = { lat: number; lon: number };

/** Distância em metros (haversine). */
export function distanciaM(a: Ponto, b: Ponto): number {
  const R = 6_371_000;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** PL-22 [HIPÓTESE]: posição a até 100 m do destino encerra a sessão. */
export function chegouAoDestino(posicao: Ponto, destino: Ponto, raioM = RAIO_CHEGADA_M): boolean {
  return distanciaM(posicao, destino) <= raioM;
}
