import * as Location from 'expo-location';
import type { Ponto } from '@/consulta';

/** [DECISÃO] D-30: o sistema consulta o endereço; o app não registra as coordenadas em logs. */
export async function enderecoDoPonto(ponto: Ponto, opcoes: { signal?: AbortSignal; timeoutMs?: number } = {}): Promise<string | null> {
  if (opcoes.signal?.aborted) return null;
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  let aoAbortar: (() => void) | undefined;
  try {
    const cancelamento = new Promise<null>((resolve) => {
      temporizador = setTimeout(() => resolve(null), opcoes.timeoutMs ?? 6000);
      if (opcoes.signal) {
        aoAbortar = () => resolve(null);
        opcoes.signal.addEventListener('abort', aoAbortar, { once: true });
      }
    });
    const consulta = Location.reverseGeocodeAsync({ latitude: ponto.lat, longitude: ponto.lon })
      .then(([item]) => {
        if (!item) return null;
        const rua = item.street ? [item.street, item.streetNumber].filter(Boolean).join(', ') : '';
        const endereco = [rua || item.name, item.district].filter(Boolean).join(' - ').trim();
        return endereco ? endereco.slice(0, 140) : null;
      }).catch(() => null);
    return await Promise.race([consulta, cancelamento]);
  } catch {
    return null;
  } finally {
    if (temporizador) clearTimeout(temporizador);
    if (opcoes.signal && aoAbortar) opcoes.signal.removeEventListener('abort', aoAbortar);
  }
}
