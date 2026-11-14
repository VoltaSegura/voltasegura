import type { Ponto } from '@/consulta';

/** Local salvo no aparelho (FN-13, D-29). Coordenadas ficam só no aparelho e nunca vão a log nem ao servidor. */
export type LocalSalvo = {
  id: string;
  nome: string;
  ponto: Ponto;
  /** Tipo escolhido na hora de salvar; define o ícone e a imagem do cartão. */
  tipo: TipoLocal;
};

export type TipoLocal = 'casa' | 'trabalho' | 'estudo' | 'outro';

export const MAX_LOCAIS = 10;
export const MAX_NOME = 30;
