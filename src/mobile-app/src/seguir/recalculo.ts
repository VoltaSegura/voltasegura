import { decodificarPolyline, type Coordenada } from '@/components/mapa/polyline';
import { chegouAoDestino } from '@/compartilhamento/chegada';
import type { Rota } from '@/services';

/** Intervalo mínimo (ms) entre dois recálculos automáticos. Evita uma consulta a cada leitura de GPS fora do trajeto. */
export const DEBOUNCE_RECALCULO_MS = 60_000;

/**
 * Falhas seguidas a partir das quais o app para de recalcular sozinho. A pessoa ainda pode tocar em
 * "Tentar de novo", que é uma ação dela e não passa pelo limite.
 */
export const MAXIMO_FALHAS_RECALCULO = 3;

const sequenciaDeModos = (rota: Rota) =>
  [...rota.trechos]
    .sort((a, b) => a.ordem - b.ordem)
    .map((trecho) => trecho.modo)
    .join('>');

/** Fim da rota: último ponto do último trecho que tem traço. */
export function pontoFinal(rota: Rota): Coordenada | null {
  const trechos = [...rota.trechos].sort((a, b) => a.ordem - b.ordem);
  for (let i = trechos.length - 1; i >= 0; i--) {
    const pontos = decodificarPolyline(trechos[i].geometria);
    if (pontos.length > 0) return pontos[pontos.length - 1];
  }
  return null;
}

/**
 * "Leva para o mesmo lugar": o fim da nova rota fica a até 100 m do fim da rota que estava sendo seguida
 * (raio de chegada, D-34 item 7).
 */
export function levaAoMesmoDestino(candidata: Rota, anterior: Rota): boolean {
  const fimAnterior = pontoFinal(anterior);
  const fimCandidata = pontoFinal(candidata);
  if (!fimAnterior || !fimCandidata) return false;
  return chegouAoDestino(
    { lat: fimCandidata.latitude, lon: fimCandidata.longitude },
    { lat: fimAnterior.latitude, lon: fimAnterior.longitude },
  );
}

/**
 * Escolhe, entre as rotas do novo cálculo, a que continua a viagem seguida. Só entram candidatas com a
 * mesma sequência de modos (a pé, ônibus, metrô, trem) e que levem ao mesmo lugar (D-34, decisões de 18/11/2026).
 * Entre elas, vence a com mais focos em comum; empate fica com a primeira da ordem da API (D-23).
 * Devolve `null` se nenhuma cumprir as duas regras: o recálculo então falha e a rota anterior é mantida.
 */
export function escolherRotaEquivalente(candidatas: Rota[], anterior: Rota): Rota | null {
  const modosAnteriores = sequenciaDeModos(anterior);
  let melhor: Rota | null = null;
  let melhorFocos = -1;
  for (const candidata of candidatas) {
    if (sequenciaDeModos(candidata) !== modosAnteriores) continue;
    if (!levaAoMesmoDestino(candidata, anterior)) continue;
    const focosEmComum = candidata.focos.filter((foco) => anterior.focos.includes(foco)).length;
    if (focosEmComum > melhorFocos) {
      melhor = candidata;
      melhorFocos = focosEmComum;
    }
  }
  return melhor;
}
