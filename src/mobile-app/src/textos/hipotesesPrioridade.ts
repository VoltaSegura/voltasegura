// [HIPÓTESE] D-33 (17/11/2026, B-59): textos do destaque com confiança e da rota desenhada pelos dados.
// Sem revisão editorial nem teste com usuárias. Linguagem conferida contra o docs/05: nada de "segura",
// "perigoso" ou rótulo de área; a confiança vem sempre junto do destaque.
export const hipotesesPrioridade = {
  /** Linha de apoio no card e no detalhe da rota cujo caminho a pé foi escolhido pelos registros. */
  rotaDosDados: 'Caminho a pé escolhido pelos registros da SSP-SP',
  /** Marca de confiança ao lado do destaque "menor exposição estimada". */
  confianca: {
    clara: 'Diferença clara nos registros',
    pequena: 'Diferença pequena nos registros',
  },
  /** Frase acima dos cards quando o destaque tem confiança pequena. */
  casoPequena:
    'A opção em destaque tem menos registros de ocorrência perto dos trechos a pé. A diferença para as outras é pequena: compare também tempo e caminhada.',
  /** "Por que esta rota?" e "Sobre os dados". */
  indicativoComFocoPequena:
    'Esta opção tem menos registros de ocorrência perto dos trechos a pé entre as alternativas avaliadas, mas a diferença é pequena.',
  indicativoSemFocoPequena: (opcao: string) =>
    `${opcao} tem menos registros de ocorrência perto dos trechos a pé, com diferença pequena.`,
} as const;
