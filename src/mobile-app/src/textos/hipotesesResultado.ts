// [HIPÓTESE] Instruções de interação da TL-07, ainda sem validação com usuárias.
export const hipotesesResultado = {
  dicaExpandir: 'A lista ocupará mais espaço',
  dicaRecolher: 'A lista será recolhida',
  dicaSelecao: 'Toque na opção para vê-la no mapa; › abre os detalhes.',
  rotuloSelecao: 'Toque duas vezes para selecionar.',
  detalhes: (indice: number) => `Ver detalhes da opção ${indice}`,
} as const;
// [HIPÓTESE] Redações da TL-07 pendentes de revisão editorial.
export const hipotesesEstadosResultado = {
  recolher: 'Recolher lista',
  semAlternativas: 'Nenhuma opção disponível',
  semServico: 'Não há trajetos disponíveis neste horário.',
  comparacaoIndisponivel: 'Comparação de registros indisponível nesta consulta.',
  trajetoIndisponivel: 'Trajeto no mapa indisponível. Consulte os trechos da opção.',
  mapaWeb: 'Mapa disponível no celular. Compare as opções abaixo.',
  rotaNoMapa: (indice: number) => `Opção ${indice} selecionada no mapa`,
} as const;
