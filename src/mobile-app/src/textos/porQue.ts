// Fonte: docs/app-map/08_microcopy.md (TL-09 · Por que esta rota?, incl. Indicativos)
export const porQue = {
  titulo: 'Por que esta rota?',
  trecho: (p: { i: number; distancia: string }) => `Trecho ${p.i} · a pé · ${p.distancia}`,
  conta:
    'Os trechos a pé entram na contagem de registros; os trechos em ônibus, metrô ou trem, não.',
  faixa: (faixa: string) => `Faixa do dia deste trecho: ${faixa}`,
  nestaRota: 'Nesta rota (todos os trechos a pé)',
  registros: 'Registros considerados',
  km: 'Km a pé',
  porKm: 'Registros por km a pé',
  cobertura: 'Cobertura dos dados',
  naoAplicavel: 'não aplicável',
  semOrdenar: '(sem ordenar as opções)',
  limitacao: 'Zero ou poucos registros não querem dizer que nada aconteceu.',
  linkSobre: 'Sobre os dados',
  linkConsiderados: 'Dados considerados',
  indicativo: {
    conclusivoComFoco:
      'Menor exposição estimada entre as alternativas avaliadas: nos registros considerados, esta opção teve menos furtos e roubos perto dos trechos a pé.',
    conclusivoSemFoco: (focoLink: string) =>
      `Entre as opções avaliadas, outra teve menor exposição estimada: ${focoLink}`,
    semDiferenca: 'Os registros não mostram diferença clara entre as opções.',
    insuficiente: (motivo: string) =>
      `Dados insuficientes para comparar as opções. Motivo: ${motivo}`,
    naoAplicavel:
      'Uma das opções não tem trecho a pé, então os registros não foram comparados desta vez.',
    semComparacao: 'Só uma opção neste horário: não há comparação.',
    indisponivel: 'A comparação de registros não está disponível para esta consulta.',
  },
  motivo: {
    amostra: 'poucos registros no total.',
    cobertura: 'os dados desta região têm cobertura baixa.',
    largura: 'o resultado muda conforme a área considerada em volta do caminho.',
  },
} as const;
