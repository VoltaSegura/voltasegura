/**
 * Tokens de design do VoltaSegura.
 * Fonte: docs/app-map/07_design/tokens.md (contrastes WCAG calculados lá).
 * Marca v10 é [HIPÓTESE] até a aprovação formal do grupo (D-06, T15).
 *
 * Regras que valem para qualquer uso destes tokens:
 * - Sem semântica de segurança na cor: nada de verde "seguro" ou vermelho "perigoso".
 * - A cor nunca carrega um significado sozinha: sempre há texto ou ícone junto.
 * - `erro` só para erro de formulário e de sistema, nunca para rota, trecho ou ocorrência.
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
};

/** Tamanhos em pontos; escalam com a fonte do sistema (RNF-07). Nenhum texto abaixo de 13. */
export const tipo = {
  titulo: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  secao: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  destaque: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  corpo: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  corpoForte: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  apoio: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  rotulo: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
} as const;

export const esp = { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 } as const;

export const raio = { pequeno: 6, medio: 12, grande: 20 } as const;

export const toque = { minimo: 48, espaco: 8 } as const;
