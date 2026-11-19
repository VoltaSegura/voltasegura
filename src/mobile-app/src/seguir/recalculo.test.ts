import { describe, expect, it } from '@jest/globals';

import type { FocoRota, ModoTrecho, Rota } from '@/services';
import { escolherRotaEquivalente, levaAoMesmoDestino } from './recalculo';

// Polilinhas de teste (polyline 5): começam em (-23.55, -46.63) e terminam no destino indicado.
const MESMO_DESTINO = 'nrvnCnlr{G?o}@'; // fim em (-23.55, -46.62)
const DESTINO_A_44M = 'nrvnCnlr{GnAo}@'; // fim a ~44 m do primeiro
const OUTRO_DESTINO = 'nrvnCnlr{GnwHntL'; // fim em (-23.60, -46.70), a vários km

const rota = (id: string, modos: ModoTrecho[], focos: FocoRota[] = ['MENOR_TEMPO'], fim = MESMO_DESTINO) =>
  ({
    id,
    focos,
    trechos: modos.map((modo, i) => ({
      id: `${id}-${i}`,
      ordem: i + 1,
      modo,
      geometria: i === modos.length - 1 ? fim : MESMO_DESTINO,
    })),
  }) as unknown as Rota;

describe('levaAoMesmoDestino', () => {
  it('aceita fim a até 100 m do fim anterior', () => {
    expect(levaAoMesmoDestino(rota('p', ['A_PE'], undefined, DESTINO_A_44M), rota('a', ['A_PE']))).toBe(true);
  });

  it('recusa fim a vários quilômetros do fim anterior', () => {
    expect(levaAoMesmoDestino(rota('o', ['A_PE'], undefined, OUTRO_DESTINO), rota('a', ['A_PE']))).toBe(false);
  });
});

describe('escolherRotaEquivalente', () => {
  it('devolve null quando não há candidatas', () => {
    expect(escolherRotaEquivalente([], rota('a', ['A_PE']))).toBeNull();
  });

  it('devolve null quando nenhuma tem a mesma sequência de modos, mesmo com o mesmo destino', () => {
    const anterior = rota('antiga', ['A_PE', 'ONIBUS']);
    const candidatas = [rota('x', ['A_PE']), rota('y', ['A_PE', 'METRO'])];
    expect(escolherRotaEquivalente(candidatas, anterior)).toBeNull();
  });

  it('devolve null quando a de mesma sequência leva a outro lugar', () => {
    const anterior = rota('antiga', ['A_PE', 'ONIBUS']);
    const candidatas = [rota('longe', ['A_PE', 'ONIBUS'], undefined, OUTRO_DESTINO)];
    expect(escolherRotaEquivalente(candidatas, anterior)).toBeNull();
  });

  it('entre as que levam ao mesmo lugar, ignora outras sequências e escolhe a de mesma sequência', () => {
    const anterior = rota('antiga', ['A_PE', 'ONIBUS']);
    const candidatas = [rota('y', ['A_PE', 'METRO']), rota('z', ['A_PE', 'ONIBUS'])];
    expect(escolherRotaEquivalente(candidatas, anterior)?.id).toBe('z');
  });

  it('aceita a rota de mesma sequência que chega a até 100 m do destino', () => {
    const anterior = rota('antiga', ['A_PE']);
    const candidatas = [rota('perto', ['A_PE'], undefined, DESTINO_A_44M)];
    expect(escolherRotaEquivalente(candidatas, anterior)?.id).toBe('perto');
  });

  it('entre as válidas, prefere a com mais focos em comum', () => {
    const anterior = rota('antiga', ['A_PE', 'ONIBUS'], ['MENOR_TEMPO', 'MENOS_CAMINHADA']);
    const candidatas = [
      rota('a', ['A_PE', 'ONIBUS'], ['OUTRA_OPCAO']),
      rota('b', ['A_PE', 'ONIBUS'], ['MENOR_TEMPO', 'MENOS_CAMINHADA']),
    ];
    expect(escolherRotaEquivalente(candidatas, anterior)?.id).toBe('b');
  });

  it('empate fica com a primeira na ordem da API (D-23)', () => {
    const anterior = rota('antiga', ['A_PE']);
    const candidatas = [rota('primeira', ['A_PE']), rota('segunda', ['A_PE'])];
    expect(escolherRotaEquivalente(candidatas, anterior)?.id).toBe('primeira');
  });
});
