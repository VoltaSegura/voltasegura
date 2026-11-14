// Fonte: docs/app-map/08_microcopy.md (TL-10 · Sobre os dados)
export const sobre = {
  titulo: 'Sobre os dados',
  fonteTitulo: 'Fonte e período',
  fonte: (p: { fonte: string; periodo: string; meses: number }) =>
    `${p.fonte}, boletins de ocorrência de ${p.periodo} (${p.meses} meses).`,
  atualizacaoSsp: (data: string) => `Base SSP-SP atualizada em ${data}.`,
  atualizacaoGtfs: (data: string) => `Horários: SPTrans (GTFS), atualizado em ${data}.`,
  coberturaTitulo: 'Cobertura de cada opção',
  coberturaExplica: 'Parte dos registros com local e horário nas regiões dos trechos a pé.',
  situacaoTitulo: 'Situação desta comparação',
  limitacoesTitulo: 'Limitações',
  limSubnotificacao:
    'Nem toda ocorrência vira boletim: zero registro não quer dizer que nada aconteceu.',
  limCoordenadas: 'O local de um boletim pode ser um ponto de referência.',
  limTiposLocal: 'Conta todos os tipos de local.',
  limNaturezas: 'Só furtos e roubos do tipo "outros" entram.',
  limHorarios: 'Horários são programados e podem não refletir mudanças recentes.',
  creditosTitulo: 'Créditos',
  creditos: 'SSP-SP (CC-BY 4.0) · SPTrans (GTFS) · © OpenStreetMap contributors (ODbL)',
} as const;
