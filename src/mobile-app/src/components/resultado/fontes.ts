import type { FocoRota, RespostaConsulta } from '@/services';
import { textos } from '@/textos';
import { hipotesesPrioridade } from '@/textos/hipotesesPrioridade';

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

/** B-53: exposição real (SSP) cuja cobertura é estimada por proxy; não vale em "só roteamento". */
export function coberturaPorProxy(resposta: Pick<RespostaConsulta, 'fontes' | 'caso'>): boolean {
  return resposta.fontes.exposicao === 'ssp' && !soRoteamento(resposta);
}

/** Texto próprio de cada caso da comparação (B-53); `null` quando o caso não pede texto (CONCLUSIVO, só roteamento, sem rotas, opção única). */
export function textoCaso(resposta: Pick<RespostaConsulta, 'fontes' | 'caso' | 'rotas'>): string | null {
  if (soRoteamento(resposta) || resposta.rotas.length < 2 || resposta.caso === 'SEM_COMPARACAO') return null; // opção única: `soUma`
  // B-59 (D-33): há destaque com diferença pequena: a frase acompanha o destaque em vez de negar a comparação
  if (resposta.rotas.some((r) => r.destaqueExposicao?.confianca === 'pequena')) return hipotesesPrioridade.casoPequena;
  switch (resposta.caso) {
    case 'SEM_DIFERENCA': return textos.casosResultado.semDiferenca;
    case 'MISTOS': return textos.casosResultado.mistos;
    case 'INSUFICIENTE': return textos.casosResultado.insuficiente;
    case 'NAO_APLICAVEL': return textos.casosResultado.naoAplicavel;
    default: return null;
  }
}

/**
 * Foco de exposição só existe com exposição disponível; em "só roteamento" ele é descartado.
 * Com uma única rota (B-51) não há o que comparar: nenhum foco comparativo é exibido.
 */
export function focosVisiveis(focos: FocoRota[], resposta: Pick<RespostaConsulta, 'fontes' | 'caso'> & { rotas?: unknown[] }): FocoRota[] {
  if (resposta.rotas?.length === 1) return [];
  return soRoteamento(resposta) ? focos.filter(foco => foco !== 'MENOR_EXPOSICAO') : focos;
}
