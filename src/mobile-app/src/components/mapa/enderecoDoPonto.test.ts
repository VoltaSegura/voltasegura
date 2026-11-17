import { beforeEach, expect, it, jest } from '@jest/globals';
import { enderecoDoPonto } from './enderecoDoPonto';

jest.mock('expo-location', () => ({ reverseGeocodeAsync: jest.fn() }));
const localizacao = jest.requireMock<{ reverseGeocodeAsync: jest.Mock<(coordenadas?: unknown) => Promise<unknown>> }>('expo-location');
const ponto = { lat: -23.55, lon: -46.63 };

beforeEach(() => { jest.clearAllMocks(); });

it('formata rua, número e bairro e limita o comprimento', async () => {
  localizacao.reverseGeocodeAsync.mockResolvedValue([{ street: 'Rua Exemplo', streetNumber: '123', district: 'Centro' }]);
  expect(await enderecoDoPonto(ponto)).toBe('Rua Exemplo, 123 - Centro');
  expect(localizacao.reverseGeocodeAsync).toHaveBeenCalledWith({ latitude: ponto.lat, longitude: ponto.lon });
  localizacao.reverseGeocodeAsync.mockResolvedValue([{ street: 'A'.repeat(200) }]);
  expect((await enderecoDoPonto(ponto))?.length).toBe(140);
});

it('usa name como fallback e devolve null sem informação útil', async () => {
  localizacao.reverseGeocodeAsync.mockResolvedValueOnce([{ name: 'Praça Central' }]).mockResolvedValueOnce([{}]);
  expect(await enderecoDoPonto(ponto)).toBe('Praça Central');
  expect(await enderecoDoPonto(ponto)).toBeNull();
});

it('devolve null em erro sem registrar em console', async () => {
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  const erro = jest.spyOn(console, 'error').mockImplementation(() => {});
  localizacao.reverseGeocodeAsync.mockRejectedValue(new Error('sem serviço'));
  expect(await enderecoDoPonto(ponto)).toBeNull();
  expect(log).not.toHaveBeenCalled();
  expect(erro).not.toHaveBeenCalled();
  log.mockRestore(); erro.mockRestore();
});

it('aplica timeout e ignora resposta tardia', async () => {
  jest.useFakeTimers();
  try {
    let resolver!: (valor: unknown) => void;
    localizacao.reverseGeocodeAsync.mockReturnValue(new Promise((resolve) => { resolver = resolve; }));
    const resultado = enderecoDoPonto(ponto, { timeoutMs: 10 });
    jest.advanceTimersByTime(10);
    expect(await resultado).toBeNull();
    resolver([{ street: 'Rua Tardia' }]);
  } finally { jest.useRealTimers(); }
});
