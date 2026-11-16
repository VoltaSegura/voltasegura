import type { FocoRota, RespostaConsulta } from '@/services';

/**
 * "Só roteamento" (B-08): rotas reais ou de exemplo SEM exposição validada. Vale quando QUALQUER
 * sinal diz que a exposição não existe: `fontes.exposicao = 'indisponivel'` ou `caso = 'INDISPONIVEL'`.
 * Nesse modo a tela não mostra selo de exposição, foco de menor exposição, número de ocorrências nem zero.
 */
export function soRoteamento(resposta: Pick<RespostaConsulta, 'fontes' | 'caso'>): boolean {
  return resposta.fontes.exposicao === 'indisponivel' || resposta.caso === 'INDISPONIVEL';
}

/** Selo EXEMPLO por bloco: segue `fontes.*`, não o booleano global `exemplo`. */
export function selosExemplo(resposta: Pick<RespostaConsulta, 'fontes' | 'caso'>): { roteamento: boolean; exposicao: boolean } {
  return {
    roteamento: resposta.fontes.roteamento === 'exemplo',
    exposicao: resposta.fontes.exposicao === 'exemplo' && !soRoteamento(resposta),
  };
}

/** Foco de exposição só existe com exposição disponível; em "só roteamento" ele é descartado. */
export function focosVisiveis(focos: FocoRota[], resposta: Pick<RespostaConsulta, 'fontes' | 'caso'>): FocoRota[] {
  return soRoteamento(resposta) ? focos.filter(foco => foco !== 'MENOR_EXPOSICAO') : focos;
}
