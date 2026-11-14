/**
 * Textos que o catálogo (`docs/app-map/08_microcopy.md`) só descreve por regra, não por frase pronta.
 * Ficam FORA do objeto `textos` de propósito: são `[HIPÓTESE]` até o Lucas confirmar, e este arquivo
 * é o único lugar para ajustar quando isso acontecer.
 */

export interface ParteDaSequencia {
  /** Nome do modo já pronto, vindo de `textos.modos` (ex.: "A pé", "Metrô"). */
  modo: string;
  /** Detalhe pronto (ex.: "9 minutos", "linha 4-Amarela"). */
  detalhe?: string;
}

function minuscula(texto: string): string {
  return texto.charAt(0).toLocaleLowerCase('pt-BR') + texto.slice(1);
}

/**
 * `resultado.sequencia_leitura`: "{modo} {detalhe}, …".
 * Exemplo do catálogo: "A pé 9 minutos, metrô linha 4-Amarela, a pé 8 minutos".
 * `[HIPÓTESE]` A regra de caixa (só o primeiro item com inicial maiúscula) vem desse exemplo único.
 */
export function sequenciaLeitura(partes: ParteDaSequencia[]): string {
  return partes
    .map(({ modo, detalhe }, i) => {
      const item = detalhe ? `${modo} ${detalhe}` : modo;
      return i === 0 ? item : minuscula(item);
    })
    .join(', ');
}
