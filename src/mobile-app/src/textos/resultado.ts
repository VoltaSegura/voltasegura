// Fonte: docs/app-map/08_microcopy.md (TL-07 · Resultado e TL-08 · Detalhes)
export const resultado = {
  kmAPe: (km: string) => `${km} a pé`,
  trocas: (n: number) => (n === 0 ? 'Sem troca' : n === 1 ? '1 troca' : `${n} trocas`),
  cabecalhoIda: 'Sua ida',
  cabecalhoVolta: 'Sua volta',
  cabecalhoSubtitulo: (hora: string) => `Saída às ${hora}`,
  linhaMetroTrem: (p: { numero: string; nome: string; metroOuTrem: string }) =>
    `Linha ${p.numero}-${p.nome} do ${p.metroOuTrem}`,
  linhaOnibus: (numero: string) => `Ônibus ${numero}`,
  saidaPrevista: (hora: string) => `Sai às ${hora} (previsto)`,
  soUma: 'Só uma opção neste horário: não há comparação.',
  planejarVolta: 'Planejar a volta',
  planejarIda: 'Planejar a ida',
  expandir: 'Expandir lista',
  selecionada: 'selecionada',
  rotuloCard: (p: {
    i: number;
    n: number;
    focos: string;
    duracao: string;
    km: string;
    trocas: string;
    modos: string;
  }) =>
    `Opção ${p.i} de ${p.n}. ${p.focos}. ${p.duracao}, ${p.km} a pé, ${p.trocas}. ${p.modos}. Toque duas vezes para ver os detalhes.`,
  detalhes: {
    trecho: (p: { modo: string; distancia: string; duracao: string }) =>
      `${p.modo} · ${p.distancia} · ${p.duracao}`,
    embarque: (hora: string) => `Embarque ${hora} (previsto)`,
    daOrigem: 'Da origem até o ponto',
    ateDestino: 'Até o destino',
    semTrechoAPe: 'Esta opção não tem trecho a pé.',
    porQue: 'Por que esta rota?',
  },
} as const;
