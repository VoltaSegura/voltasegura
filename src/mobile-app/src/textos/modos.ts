// Fonte: docs/app-map/08_microcopy.md (Modos e faixas, Focos)
export const modos = {
  modo: {
    aPe: 'A pé',
    onibus: 'Ônibus',
    metro: 'Metrô',
    trem: 'Trem',
  },
  faixa: {
    madrugada: 'madrugada (0h–5h)',
    manha: 'manhã (6h–11h)',
    tarde: 'tarde (12h–17h)',
    noite: 'noite (18h–23h)',
  },
  foco: {
    menorTempo: 'Menor tempo',
    menosCaminhada: 'Menos caminhada',
    menorExposicao: '◆ Menor exposição estimada',
    menorExposicaoCompleto: 'Menor exposição estimada entre as alternativas avaliadas',
    outraOpcao: 'Outra opção',
  },
} as const;
