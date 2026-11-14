import * as Location from 'expo-location';

import type { Ponto } from '@/consulta';

export type ResultadoBusca =
  | { tipo: 'achou'; ponto: Ponto }
  | { tipo: 'nao_achou' }
  | { tipo: 'indisponivel' };

/**
 * Busca de endereço por texto (D-29, revê a D-02 por pedido do Lucas).
 * Usa o geocodificador do sistema operacional (expo-location): o app NÃO tem servidor nem chave
 * de busca próprios. O texto digitado sai do aparelho para o serviço do sistema (no Android, o
 * do Google), e só quando a pessoa toca em "Buscar", nunca a cada tecla.
 * Nada do texto nem do resultado é gravado ou registrado em log (US-19 AC2).
 * A busca é limitada ao município de São Paulo acrescentando-o ao texto.
 */
export async function buscarEndereco(texto: string): Promise<ResultadoBusca> {
  const limpo = texto.trim();
  if (limpo.length < 3) return { tipo: 'nao_achou' };
  try {
    const consulta = /são paulo|sao paulo/i.test(limpo) ? limpo : `${limpo}, São Paulo, SP, Brasil`;
    const achados = await Location.geocodeAsync(consulta);
    const primeiro = achados[0];
    if (!primeiro) return { tipo: 'nao_achou' };
    return { tipo: 'achou', ponto: { lat: primeiro.latitude, lon: primeiro.longitude } };
  } catch {
    return { tipo: 'indisponivel' };
  }
}
