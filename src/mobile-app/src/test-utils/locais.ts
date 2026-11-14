import { jest } from '@jest/globals';

/** Mock de `@/locais` para os testes de tela: lista em memória controlada pelo teste. */
export const locaisMock = {
  locais: [] as { id: string; nome: string; tipo: 'casa' | 'trabalho' | 'estudo' | 'outro'; ponto: { lat: number; lon: number } }[],
  carregado: true,
  salvar: jest.fn<(nome: string, ponto: { lat: number; lon: number }, tipo: string) => Promise<string>>().mockResolvedValue('ok'),
  renomear: jest.fn(),
  apagar: jest.fn(),
  apagarTodos: jest.fn(),
};

export const moduloLocais = {
  LocaisProvider: ({ children }: { children: React.ReactNode }) => children,
  useLocais: () => locaisMock,
  MAX_LOCAIS: 10,
  MAX_NOME: 30,
};
