// B-08 · "Só roteamento": a rota existe, a exposição estimada não está disponível nesta consulta.
// Linguagem conforme docs/05: sem número de ocorrências, sem zero, sem avaliação de local.
export const soRoteamento = {
  selo: 'Só roteamento',
  aviso: 'Só roteamento: mostramos os trajetos e os horários. A exposição estimada não está disponível nesta consulta, então não há comparação de registros.',
  linhaDados: 'Só roteamento · exposição estimada indisponível',
  porQue: 'Sem exposição estimada para esta consulta, não há o que explicar sobre registros neste trecho.',
  dadosConsiderados: 'Sem exposição estimada nesta consulta: nenhum registro foi considerado e não há totais para mostrar.',
  sobreTitulo: 'Exposição estimada',
  sobreExplica: 'Indisponível nesta consulta. Os registros da SSP-SP não foram consultados, então nenhuma opção tem número de registros ou cobertura.',
  roteamentoTitulo: 'Trajetos e horários',
  roteamentoExemplo: 'Trajetos de exemplo.',
  roteamentoReal: 'Trajetos e horários do roteamento do projeto (GTFS e OpenStreetMap).',
} as const;
