// Fonte: docs/app-map/08_microcopy.md (TL-11 · Dados considerados)
export const dadosConsiderados = {
  titulo: 'Dados considerados',
  contexto: (p: { fonte: string; periodo: string; faixa: string }) =>
    `Registros perto dos trechos a pé desta opção · ${p.fonte}, ${p.periodo}, ${p.faixa}`,
  furto: 'Furto',
  roubo: 'Roubo',
  transito: 'Ocorrências de trânsito',
  furtoOutros: 'Furto – outros',
  furtoCarga: 'Furto de carga',
  furtoVeiculo: 'Furto de veículo',
  rouboOutros: 'Roubo – outros',
  rouboCarga: 'Roubo de carga',
  rouboVeiculo: 'Roubo de veículo',
  latrocinio: 'Latrocínio',
  entraComparacao: 'entra na comparação',
  avisoRecorte:
    'Só "furto – outros" e "roubo – outros" entram na comparação. Os totais acima incluem outros tipos.',
  panoramaLink: 'Outras ocorrências contra a pessoa (município)',
  panoramaTitulo: 'Outras ocorrências contra a pessoa',
  panoramaAviso: (periodo: string) =>
    `Total do município de São Paulo, ${periodo}. Não descreve a rua nem o trajeto consultado.`,
  homicidio: 'Homicídio doloso',
  tentativa: 'Tentativa de homicídio',
  estupro: 'Estupro',
  estuproVulneravel: 'Estupro de vulnerável',
  insuficiente: 'dados insuficientes',
  indisponivel: 'indisponível',
} as const;
