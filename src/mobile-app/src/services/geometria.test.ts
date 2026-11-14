import { describe, expect, it } from '@jest/globals';
import { pontosExemplo } from '@/components/mapa/pontosExemplo';
import { fixtures } from './fixtures';
import { ajustarAosPontos, codificar, decodificar, type PontoGeometria } from './geometria';

const origem = pontosExemplo.origem;
const destino = pontosExemplo.destino;

function perto(a: PontoGeometria, b: PontoGeometria): void {
  expect(Math.abs(a.lat - b.lat)).toBeLessThanOrEqual(1e-5);
  expect(Math.abs(a.lon - b.lon)).toBeLessThanOrEqual(1e-5);
}

function distancia(a: PontoGeometria, b: PontoGeometria, cos: number): number {
  return Math.hypot(a.lat - b.lat, (a.lon - b.lon) * cos);
}

describe('polyline 5', () => {
  it('codifica e decodifica com precisão de cinco casas', () => {
    const pontos = [origem, { lat: -23.55327, lon: -46.64014 }, destino];
    const resultado = decodificar(codificar(pontos));
    expect(resultado).toHaveLength(pontos.length);
    resultado.forEach((ponto, indice) => perto(ponto, pontos[indice]));
  });

  it.each(['', 'abc', '~~~~', '!', '_p~iF~ps|U_ulLnnqC_'])('rejeita entrada inválida sem lançar: %s', (texto) => {
    expect(decodificar(texto)).toEqual([]);
  });

  it('ajusta extremos e mantém a forma em escala e rotação', () => {
    const meio = { lat: -23.5524, lon: -46.6431 };
    const base = [origem, meio, destino];
    const novaOrigem = { lat: -22.91, lon: -43.19 };
    const novoDestino = { lat: -22.92, lon: -43.23 };
    const ajustados = decodificar(ajustarAosPontos(codificar(base), origem, destino, novaOrigem, novoDestino));
    perto(ajustados[0], novaOrigem);
    perto(ajustados[2], novoDestino);
    const cosBase = Math.cos(((origem.lat + destino.lat) / 2) * Math.PI / 180);
    const cosNovo = Math.cos(((novaOrigem.lat + novoDestino.lat) / 2) * Math.PI / 180);
    const razaoBase = distancia(base[0], base[1], cosBase) / distancia(base[0], base[2], cosBase);
    const razaoNova = distancia(ajustados[0], ajustados[1], cosNovo) / distancia(ajustados[0], ajustados[2], cosNovo);
    expect(Math.abs(razaoNova - razaoBase)).toBeLessThan(1e-3);
  });
});

describe('traçados de exemplo', () => {
  it.each(Object.entries(fixtures))('%s tem rotas completas e trechos encadeados', (_nome, resposta) => {
    expect(new Set(resposta.rotas.map((rota) => rota.geometria)).size).toBe(resposta.rotas.length);
    for (const rota of resposta.rotas) {
      const pontosRota = decodificar(rota.geometria);
      expect(pontosRota.length).toBeGreaterThanOrEqual(2);
      perto(pontosRota[0], origem);
      perto(pontosRota[pontosRota.length - 1], destino);
      const trechos = rota.trechos.map((trecho) => decodificar(trecho.geometria));
      for (const pontos of trechos) expect(pontos.length).toBeGreaterThanOrEqual(2);
      trechos.forEach((pontos, i) => {
        if (i > 0) perto(trechos[i - 1][trechos[i - 1].length - 1], pontos[0]);
      });
      const concatenados = trechos.flatMap((pontos, i) => i === 0 ? pontos : pontos.slice(1));
      expect(concatenados).toEqual(pontosRota);
      if (rota.caminhadaKm === 0) expect(rota.trechos.some((trecho) => trecho.modo === 'A_PE')).toBe(false);
    }
  });
});
