/**
 * Medidas estruturais dos componentes. A escala compartilhada fica em theme/tokens.ts.
 */
export const medidas = {
  /** Opacidade de elemento desabilitado (componentes.md: "opacidade 0,5"). */
  opacidadeDesabilitado: 0.5,
  /** Espessuras de borda. */
  borda: 1,
  bordaFoco: 2,
  /** Filete lateral do Aviso de erro. */
  filete: 3,
  /** Lado da caixa de seleção e do interruptor (a trilha). */
  caixa: 24,
  interruptorLargura: 48,
  interruptorAltura: 28,
  interruptorPino: 20,
  /** Largura máxima de leitura do conteúdo. */
  larguraMaxima: 640,
  /** A área de foco usa a borda informativa do tema, não apenas cor de seleção. */
  recuoFoco: 2,
} as const;
