import type { LatLng } from 'react-native-maps';

import type { Rota } from '@/services';
import { decodificarPolyline } from './polyline';

export type TrechoNoMapa = { id: string; aPe: boolean; pontos: LatLng[] };

/**
 * Traços por trecho da rota, na ordem do itinerário. Trecho sem geometria válida (menos de dois
 * pontos) é descartado; sem nenhum trecho válido devolve [] e o mapa cai no traço da rota inteira.
 * Nada é inventado nem ligado entre trechos: o traço é o que o roteamento devolveu.
 */
export function trechosDaRota(rota: Rota): TrechoNoMapa[] {
  return [...rota.trechos]
    .sort((a, b) => a.ordem - b.ordem)
    .map(trecho => ({ id: trecho.id, aPe: trecho.modo === 'A_PE', pontos: decodificarPolyline(trecho.geometria) }))
    .filter(trecho => trecho.pontos.length >= 2);
}
