// B-53 · Cobertura por proxy e texto próprio por caso da comparação. Linguagem conforme docs/05:
// exposição estimada, sem destacar rota, sem promessa, sem rotular território.
export const coberturaProxy = {
  /** [HIPÓTESE] Sem polígonos oficiais das circunscrições, a cobertura é estimada pelos pontos dos boletins. */
  aviso: 'A cobertura dos dados é estimada pelos pontos dos boletins, não por mapas oficiais das áreas. Recurso em validação.',
} as const;

export const casosResultado = {
  semDiferenca: 'Com os dados registrados, não há diferença clara de exposição estimada entre as opções.',
  mistos: 'Os dados registrados apontam sinais diferentes conforme o trecho a pé: não há uma ordem única de exposição estimada entre as opções.',
  insuficiente: 'Os dados registrados não bastam para comparar a exposição estimada entre as opções, então elas aparecem sem ordenar por exposição.',
  naoAplicavel: 'Uma das opções não tem trecho a pé, então a exposição estimada não foi comparada desta vez.',
  semComparacao: 'Só uma opção neste horário: não há comparação.',
} as const;
