import { coresClaro, coresEscuro, movimento, raio, toque } from './tokens';

function luminancia(hex: string) {
  const canais = hex.slice(1).match(/../g)!.map((par) => {
    const c = parseInt(par, 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}

function contraste(a: string, b: string) {
  const [maior, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (maior + 0.05) / (menor + 0.05);
}

describe('tokens transversais', () => {
  it.each([coresClaro, coresEscuro])('mantém contraste dos pares de texto ativos', (cores) => {
    expect(contraste(cores.texto, cores.fundo)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(cores.texto2, cores.superficie2)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(cores.acaoTexto, cores.acao)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(cores.acaoLink, cores.fundo)).toBeGreaterThanOrEqual(4.5);
  });

  it('preserva medidas de toque e movimento curto', () => {
    expect(toque.minimo).toBeGreaterThanOrEqual(48);
    expect(raio.botao).toBe(18);
    expect(movimento.toqueMs).toBeLessThanOrEqual(250);
  });
});
