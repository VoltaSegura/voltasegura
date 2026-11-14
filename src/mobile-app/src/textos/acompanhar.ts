// Fonte: docs/app-map/08_microcopy.md (TL-15 · Acompanhar viagem; Depende do tempo)
export const acompanhar = {
  titulo: 'Acompanhando uma viagem',
  emAndamento: 'Em andamento',
  chegada: (hora: string) => `Chegada estimada ${hora}`,
  atualizacao: (p: { hora: string; min: number }) =>
    `Última atualização ${p.hora} (há ${p.min} min)`,
  soTrajeto:
    'Esta viagem foi compartilhada sem a posição ao vivo: você vê o trajeto e a chegada estimada.',
  chegou: (hora: string) => `Chegou ao destino às ${hora}. O acompanhamento terminou.`,
  encerrado: 'O compartilhamento foi encerrado.',
  terminou: 'Este compartilhamento terminou.',
  instalar: 'Para acompanhar esta viagem, instale o VoltaSegura.',
} as const;
