import { describe, expect, it } from '@jest/globals';
import { formatarHora, formatarPeriodo } from './formatos';

describe('formatarHora: fuso do aparelho', () => {
  it('converte fusos diferentes do mesmo instante para a mesma hora local da home', () => {
    const utc = '2026-11-15T08:11:00.000Z';
    const local = '2026-11-15T05:11:00-03:00';
    const esperado = new Date(utc).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    expect(formatarHora(utc)).toBe(esperado);
    expect(formatarHora(local)).toBe(esperado);
    expect(formatarHora('2026-11-15T13:41:00+05:30')).toBe(esperado);
  });
  it.each(['inválido', '', '2026-99-99T99:99:00Z'])('usa marcador para ISO inválido: %s', iso => {
    expect(formatarHora(iso)).toBe('--:--');
  });
});

describe('formatarPeriodo', () => {
  it('formata o período da fixture como na TL-07', () => {
    expect(formatarPeriodo('2026-01-01', '2026-09-30')).toBe('jan-set/2026');
  });
  it('período vazio (só roteamento) não quebra e sai vazio', () => {
    expect(formatarPeriodo('', '')).toBe('');
  });
  it('usa o ano do fim do período', () => {
    expect(formatarPeriodo('2025-11-01', '2026-02-28')).toBe('nov-fev/2026');
  });
});
