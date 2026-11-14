import type { ImageSourcePropType } from 'react-native';

/**
 * Registro das imagens do app (D-29). Cada chave é um espaço reservado: enquanto o valor for
 * `null`, o app mostra um degradê com ícone (placeholder). Para usar uma foto, coloque o arquivo
 * em `assets/imagens/` e troque o `null` por `require('../../assets/imagens/arquivo.jpg')`.
 * Tamanhos sugeridos e o que cada imagem deve mostrar: `assets/imagens/LEIA-ME.md`.
 */
export type ChaveImagem =
  | 'heroAbertura'
  | 'heroEntrar'
  | 'heroCriarConta'
  | 'heroPlanejar'
  | 'localCasa'
  | 'localTrabalho'
  | 'localEstudo'
  | 'localOutro'
  | 'vazioLocais';

export const imagens: Record<ChaveImagem, ImageSourcePropType | null> = {
  heroAbertura: null,
  heroEntrar: null,
  heroCriarConta: null,
  heroPlanejar: null,
  localCasa: null,
  localTrabalho: null,
  localEstudo: null,
  localOutro: null,
  vazioLocais: null,
};
