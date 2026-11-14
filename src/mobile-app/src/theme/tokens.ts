/**
 * Tokens de design do VoltaSegura.
 * Fonte: docs/app-map/07_design/tokens.md (contrastes WCAG calculados lá) e DESIGN.md (identidade premium, D-28).
 * Marca v10 é [HIPÓTESE] até a aprovação formal do grupo (D-06, T15).
 *
 * Regras que valem para qualquer uso destes tokens:
 * - Sem semântica de segurança na cor: nada de verde "seguro" ou vermelho "perigoso".
 * - A cor nunca carrega um significado sozinha: sempre há texto ou ícone junto.
 * - `erro` só para erro de formulário e de sistema, nunca para rota, trecho ou ocorrência.
 * - `luz` (dourado) marca seleção e ação, nunca "melhor" ou "seguro".
 */

export type Cores = {
  fundo: string;
  superficie: string;
  superficie2: string;
  texto: string;
  texto2: string;
  /** Preenchimento do botão primário. No tema claro, não usar como cor de texto. */
  acao: string;
  acaoTexto: string;
  /** Links de ação (texto). No escuro é o próprio dourado; no claro, dourado escuro. */
  acaoLink: string;
  /** Informação sobre os dados: linha "Sobre os dados", links de dados, ícone ⓘ. */
  dado: string;
  erro: string;
  borda: string;
  rotaSelecionada: string;
  rotaOutra: string;
  /** Separação decorativa; não é o único sinal de limite de um controle. */
  divisoria: string;
  /** Topo do degradê de fundo (premium); o degradê termina em `fundo`. Decorativo. */
  fundoTopo: string;
  /** Cor do brilho (fio, botão principal). Decorativa: o significado vem do texto. */
  luz: string;
};

export const coresEscuro: Cores = {
  fundo: '#0D1B2A',
  superficie: '#15263A',
  superficie2: '#1E3350',
  texto: '#F8F9FA',
  texto2: '#B8C2CC',
  acao: '#FFC53D',
  acaoTexto: '#0D1B2A',
  acaoLink: '#FFC53D',
  dado: '#4ECDC4',
  erro: '#FF9B8F',
  borda: '#5A7393',
  rotaSelecionada: '#FFC53D',
  rotaOutra: '#8FA3B8',
  divisoria: '#24384F',
  fundoTopo: '#183450',
  luz: '#FFC53D',
};

export const coresClaro: Cores = {
  fundo: '#F8F9FA',
  superficie: '#FFFFFF',
  superficie2: '#EEF1F4',
  texto: '#0D1B2A',
  texto2: '#4A5A6A',
  acao: '#FFC53D',
  acaoTexto: '#0D1B2A',
  acaoLink: '#8A5A00',
  dado: '#0B6E69',
  erro: '#B3261E',
  borda: '#8796A6',
  rotaSelecionada: '#0D1B2A',
  rotaOutra: '#6B7E93',
  divisoria: '#DDE3E9',
  fundoTopo: '#FFFFFF',
  luz: '#FFC53D',
};

/**
 * Famílias carregadas com expo-font (`theme/fontes.ts`). Cada peso é uma família própria:
 * não combinar com `fontWeight`, para não haver negrito sintético no Android.
 * Se a fonte não carregar, o sistema usa a fonte padrão e o app segue legível.
 */
export const fonte = {
  display: 'Sora_800ExtraBold',
  displayMedio: 'Sora_600SemiBold',
  texto: 'AtkinsonHyperlegibleNext_400Regular',
  textoMedio: 'AtkinsonHyperlegibleNext_600SemiBold',
  textoForte: 'AtkinsonHyperlegibleNext_700Bold',
} as const;

/** Tamanhos em pontos; escalam com a fonte do sistema (RNF-07). Nenhum texto abaixo de 13. */
export const tipo = {
  titulo: { fontFamily: fonte.displayMedio, fontSize: 28, lineHeight: 36 },
  secao: { fontFamily: fonte.displayMedio, fontSize: 20, lineHeight: 28 },
  destaque: { fontFamily: fonte.textoMedio, fontSize: 18, lineHeight: 26 },
  corpo: { fontFamily: fonte.texto, fontSize: 16, lineHeight: 24 },
  corpoForte: { fontFamily: fonte.textoForte, fontSize: 16, lineHeight: 24 },
  apoio: { fontFamily: fonte.texto, fontSize: 14, lineHeight: 20 },
  rotulo: { fontFamily: fonte.textoMedio, fontSize: 13, lineHeight: 18 },
  cabecalho: { fontFamily: fonte.displayMedio, fontSize: 17, lineHeight: 24 },
  selo: { fontFamily: fonte.textoMedio, fontSize: 13, lineHeight: 18 },
  duracao: { fontFamily: fonte.display, fontSize: 30, lineHeight: 36, fontVariant: ['tabular-nums'] },
  marca: { fontFamily: fonte.display, fontSize: 40, lineHeight: 46 },
  /** O número herói da tela (ex.: duração da opção selecionada). Um por tela. */
  numero: { fontFamily: fonte.display, fontSize: 64, lineHeight: 68, fontVariant: ['tabular-nums'] },
} as const;

export const esp = { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 } as const;

export const raio = { pequeno: 6, medio: 12, grande: 20, botao: 18, pilula: 999, painel: 28 } as const;

export const toque = { minimo: 48, espaco: 8 } as const;

/**
 * Movimento: só `transform` e `opacity`. Tudo some com "reduzir movimento" (hook `useReducedMotion`).
 * `mola` alimenta `withSpring` do Reanimated.
 */
export const movimento = {
  toqueMs: 160,
  selecaoMs: 200,
  escalaPressionada: 0.97,
  opacidadePressionada: 0.9,
  mola: { damping: 14, stiffness: 240, mass: 0.7 },
  entradaMs: 360,
  escalonamentoMs: 70,
  entradaDeslocamento: 14,
  contagemMs: 700,
} as const;

/** Brilho dourado suave (iOS e web). No Android a sombra não aceita cor: o brilho vem do degradê. */
export function brilho(cor: string, intensidade = 0.35) {
  return { shadowColor: cor, shadowOpacity: intensidade, shadowRadius: 18, shadowOffset: { width: 0, height: 6 } } as const;
}
