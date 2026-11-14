// Fonte: docs/app-map/08_microcopy.md (Comuns, Modos e faixas, Focos, erros de TL-06)
export const comuns = {
  voltar: 'Voltar',
  fechar: 'Fechar',
  cancelar: 'Cancelar',
  confirmar: 'Confirmar',
  tentarDeNovo: 'Tentar de novo',
  carregando: 'Carregando…',
  exemplo: 'EXEMPLO',
  previsto: 'previsto',
  horariosPrevistos: 'Horários previstos (GTFS)',
  linhaDados: (p: { fonte: string; periodo: string }) => `Dados: ${p.fonte}, ${p.periodo}`,
  linhaDadosIndisponivel: 'Comparação de registros indisponível',
  ordenadasPorTempo: (n: number) => `${n} opções, ordenadas por tempo`,
  exposicaoPrimeiro: (n: number) =>
    `${n} opções, com a de menor exposição estimada primeiro`,
  umaOpcao: '1 opção encontrada',
  erro: {
    semRede: 'Sem conexão. Nada foi enviado.',
    tempoEsgotado: 'O servidor demorou para responder.',
    servidor: 'Não foi possível concluir agora.',
    voltarPlanejamento: 'Voltar ao planejamento',
  },
} as const;
