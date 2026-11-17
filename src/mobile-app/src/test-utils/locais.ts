import { jest } from '@jest/globals';
import type { LocalSalvo } from '@/locais/tipos';

/** Mock de `@/locais` para os testes de tela: lista em memória controlada pelo teste. */
export const locaisMock = {
  locais: [] as { id: string; nome: string; tipo: 'casa' | 'trabalho' | 'estudo' | 'outro'; ponto: { lat: number; lon: number }; endereco?: string }[],
  carregado: true,
  salvar: jest.fn<(nome: string, ponto: { lat: number; lon: number }, tipo: string, endereco?: string) => Promise<string>>().mockResolvedValue('ok'),
  renomear: jest.fn(),
  atualizarEndereco: jest.fn(),
  restaurar: jest.fn<(local: LocalSalvo, posicao: number) => Promise<string>>().mockResolvedValue('ok'),
  apagar: jest.fn(),
  apagarTodos: jest.fn(),
};

export const moduloLocais = {
  LocaisProvider: ({ children }: { children: React.ReactNode }) => children,
  useLocais: () => locaisMock,
  MAX_LOCAIS: 10,
  MAX_NOME: 30,
};
