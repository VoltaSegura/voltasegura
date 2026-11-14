// Fonte: docs/app-map/08_microcopy.md (TL-06 · Buscando e avisos)
// As mensagens de erro globais (erro.*) ficam em comuns.ts.
export const buscando = {
  resumo: (p: { sentido: string; hora: string }) => `${p.sentido} · saída ${p.hora}`,
  texto: 'Buscando alternativas…',
  privacidade: 'Origem e destino são usados só para este cálculo.',
  semTransporte: 'Não há alternativa de transporte público neste horário.',
  mudarHorario: 'Mudar o horário',
} as const;
