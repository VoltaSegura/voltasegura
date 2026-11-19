// [HIPÓTESE] Instruções de interação da TL-07, ainda sem validação com usuárias.
export const hipotesesResultado = {
  opcoes: (quantidade: number) => quantidade === 1 ? '1 opção' : `${quantidade} opções`,
  exposicaoPrimeiro: 'Menor exposição estimada primeiro',
  saida: (hora: string) => `Saída às ${hora}`,
  resumoRecolhido: (duracao: string, trocas: string, caminhada: string, focos: string[]) =>
    [duracao, trocas, caminhada, ...focos].join(' · '),
  alturas: ['Lista recolhida', 'Lista em meia altura', 'Lista em altura cheia'],
  alternarAltura: 'Toque para mudar a altura da lista',
  dicaExpandir: 'A lista ocupará mais espaço',
  dicaRecolher: 'A lista será recolhida',
  dicaSelecao: 'Toque na opção para vê-la no mapa; › abre os detalhes.',
  rotuloSelecao: 'Toque duas vezes para selecionar.',
  detalhes: (indice: number) => `Ver detalhes da opção ${indice}`,
  /** B-58 / D-32: rota gerada pelo app a partir de outra (mesma condução, trechos a pé por outro caminho). */
  varianteCaminhada: 'Mesma condução, caminhada por outro caminho',
} as const;
// [HIPÓTESE] Redações da TL-07 pendentes de revisão editorial.
export const hipotesesEstadosResultado = {
  recolher: 'Recolher lista',
  semAlternativas: 'Nenhuma opção disponível',
  semServico: 'Não há trajetos disponíveis neste horário.',
  comparacaoIndisponivel: 'Comparação de registros indisponível nesta consulta.',
  trajetoIndisponivel: 'Trajeto no mapa indisponível. Consulte os trechos da opção.',
  trajetoDeExemplo: 'Trajeto de exemplo: o mapa mostra só origem e destino escolhidos, sem o caminho real.',
  mapaWeb: 'Mapa disponível no celular. Compare as opções abaixo.',
  rotaNoMapa: (indice: number) => `Opção ${indice} selecionada no mapa`,
  /** Cartão "Dados insuficientes" (mockup 04, TL-07). O corpo é `textos.casosResultado.insuficiente`. */
  cartaoInsuficiente: {
    titulo: 'Dados insuficientes',
    entender: 'Entender o resultado',
    outroHorario: 'Outro horário',
  },
} as const;
