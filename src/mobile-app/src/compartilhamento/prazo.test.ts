import { describe, expect, it } from '@jest/globals';

import { chegouAoDestino, distanciaM } from './chegada';
import { tokenDoLink } from './link';
import { chegadaParaSessao, estenderFim, expirou, fimMaximo, minutosRestantes, pertoDoFim } from './prazo';

const MIN = 60_000;
const T0 = Date.parse('2026-11-15T22:00:00Z');

describe('prazos da sessão (PL-20)', () => {
  it('o tempo máximo é a chegada prevista + 30 min', () => {
    expect(fimMaximo('2026-11-15T22:36:00Z')).toBe('2026-11-15T23:06:00.000Z');
  });

  it('usa a chegada prevista se ainda não passou; senão refaz a conta a partir de agora', () => {
    expect(chegadaParaSessao('2026-11-15T22:36:00Z', 20, T0)).toBe('2026-11-15T22:36:00.000Z');
    expect(chegadaParaSessao('2026-11-13T23:36:00-03:00', 20, T0)).toBe(new Date(T0 + 20 * MIN).toISOString());
    expect(chegadaParaSessao('inválido', 15, T0)).toBe(new Date(T0 + 15 * MIN).toISOString());
  });

  it('avisa nos últimos 10 min e expira no fim', () => {
    const fim = new Date(T0 + 10 * MIN).toISOString();
    expect(pertoDoFim(fim, T0)).toBe(true);
    expect(pertoDoFim(fim, T0 - 1)).toBe(false);
    expect(pertoDoFim(fim, T0 + 10 * MIN)).toBe(false);
    expect(expirou(fim, T0 + 10 * MIN)).toBe(true);
    expect(expirou(fim, T0 + 10 * MIN - 1)).toBe(false);
    expect(minutosRestantes(fim, T0 + MIN / 2)).toBe(10);
    expect(minutosRestantes(fim, T0 + 20 * MIN)).toBe(0);
  });

  it('"Estender 30 min" soma 30 min ao fim atual', () => {
    expect(estenderFim('2026-11-15T23:06:00.000Z')).toBe('2026-11-15T23:36:00.000Z');
  });
});

describe('chegada (PL-22)', () => {
  const destino = { lat: -23.5615, lon: -46.6559 };
  it('chega a até 100 m do destino', () => {
    expect(distanciaM(destino, destino)).toBe(0);
    expect(chegouAoDestino({ lat: destino.lat + 0.0005, lon: destino.lon }, destino)).toBe(true); // ~55 m
    expect(chegouAoDestino({ lat: destino.lat + 0.002, lon: destino.lon }, destino)).toBe(false); // ~220 m
  });
});

describe('link do acompanhamento (D-21)', () => {
  it('extrai o token de voltasegura://acompanhar/<token> e de caminhos internos', () => {
    expect(tokenDoLink('voltasegura://acompanhar/abc123XYZ')).toBe('abc123XYZ');
    expect(tokenDoLink('/acompanhar/exemplo-ativo?x=1')).toBe('exemplo-ativo');
    expect(tokenDoLink('exp://192.168.0.2:8081/--/acompanhar/abc_123')).toBe('abc_123');
  });
  it('ignora o que não é link de acompanhar', () => {
    expect(tokenDoLink('voltasegura://planejar')).toBeNull();
    expect(tokenDoLink('voltasegura://acompanhar/')).toBeNull();
    expect(tokenDoLink('voltasegura://acompanhar/curto')).toBeNull();
    expect(tokenDoLink(null)).toBeNull();
  });
});
