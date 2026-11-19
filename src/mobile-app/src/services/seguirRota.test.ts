import { describe, expect, it } from '@jest/globals';

import { decodificarPolyline, type Coordenada } from '@/components/mapa/polyline';

import type { Rota, Trecho } from './tipos';
import {
  avaliarPosicao,
  distanciaParaTexto,
  ESTADO_INICIAL,
  instrucaoDoTrecho,
  LEITURAS_PARA_DESVIO,
  prepararTrechos,
  projetarNoTrecho,
  type EstadoSeguir,
} from './seguirRota';

/** Codificador polyline 5 (o inverso de `decodificarPolyline`), só para montar fixtures. */
function codificar(pontos: Coordenada[]): string {
  let saida = '';
  let anteriorLat = 0;
  let anteriorLon = 0;
  const numero = (valor: number) => {
    let n = valor < 0 ? ~(valor << 1) : valor << 1;
    while (n >= 0x20) {
      saida += String.fromCharCode((0x20 | (n & 0x1f)) + 63);
      n >>= 5;
    }
    saida += String.fromCharCode(n + 63);
  };
  for (const p of pontos) {
    const lat = Math.round(p.latitude * 1e5);
    const lon = Math.round(p.longitude * 1e5);
    numero(lat - anteriorLat);
    numero(lon - anteriorLon);
    anteriorLat = lat;
    anteriorLon = lon;
  }
  return saida;
}

// Trajeto de teste em São Paulo: A (a pé, leste) -> B (ônibus, norte). Destino = fim de B.
const INICIO: Coordenada = { latitude: -23.55, longitude: -46.63 };
const CANTO: Coordenada = { latitude: -23.55, longitude: -46.62 };
const DESTINO: Coordenada = { latitude: -23.54, longitude: -46.62 };

function trecho(sobrescrever: Partial<Trecho> & Pick<Trecho, 'id' | 'ordem' | 'modo'>, pontos: Coordenada[]): Trecho {
  return {
    linha: null,
    embarque: null,
    desembarque: null,
    partidaPrevista: null,
    duracaoMin: 5,
    distanciaKm: 1,
    faixaDoDia: null,
    geometria: codificar(pontos),
    ...sobrescrever,
  };
}

const TRECHO_A = trecho({ id: 'A', ordem: 1, modo: 'A_PE', duracaoMin: 8 }, [INICIO, CANTO]);
const TRECHO_B = trecho(
  {
    id: 'B',
    ordem: 2,
    modo: 'ONIBUS',
    linha: '477A',
    embarque: 'Ponto Sé',
    desembarque: 'Terminal X',
    partidaPrevista: '2026-11-18T22:10:00-03:00',
    duracaoMin: 12,
  },
  [CANTO, DESTINO],
);

function rotaDeTeste(trechos: Trecho[]): Rota {
  return { id: 'r1', geometria: '', trechos } as unknown as Rota;
}

const TRECHOS = prepararTrechos(rotaDeTeste([TRECHO_B, TRECHO_A]));
const TOTAL_M = TRECHOS.reduce((soma, t) => soma + t.comprimentoM, 0);

/** Aplica as leituras em sequência, guardando o estado entre elas, e devolve a última avaliação. */
function percorrer(posicoes: Coordenada[], inicial: EstadoSeguir = ESTADO_INICIAL) {
  let estado = inicial;
  let ultima: ReturnType<typeof avaliarPosicao> | null = null;
  for (const p of posicoes) {
    ultima = avaliarPosicao(TRECHOS, p, estado);
    estado = ultima.estado;
  }
  if (!ultima) throw new Error('sem posições');
  return ultima;
}

describe('prepararTrechos', () => {
  it('ordena pelo campo ordem e descarta trecho sem traço válido', () => {
    const semTraco = trecho({ id: 'X', ordem: 3, modo: 'A_PE' }, []);
    const trechos = prepararTrechos(rotaDeTeste([TRECHO_B, semTraco, TRECHO_A]));
    expect(trechos.map((t) => t.id)).toEqual(['A', 'B']);
  });

  it('mede o comprimento do traço sobre a geometria (A tem cerca de 1 km)', () => {
    expect(TRECHOS[0].comprimentoM).toBeGreaterThan(1000);
    expect(TRECHOS[0].comprimentoM).toBeLessThan(1040);
  });

  it('a codificação de teste round-trip com o decodificador do app', () => {
    expect(decodificarPolyline(TRECHO_A.geometria)).toHaveLength(2);
  });
});

describe('projetarNoTrecho', () => {
  it('ponto sobre o trajeto tem distância zero e percorrido na metade do trecho', () => {
    const meio = { latitude: -23.55, longitude: -46.625 };
    const p = projetarNoTrecho(TRECHOS[0].pontos, meio);
    expect(p.distanciaM).toBeLessThan(1);
    expect(Math.abs(p.percorridoM - TRECHOS[0].comprimentoM / 2)).toBeLessThan(5);
  });
});

describe('avaliarPosicao', () => {
  it('no início: trecho A, sem desvio, restante é o total da rota', () => {
    const av = avaliarPosicao(TRECHOS, INICIO, ESTADO_INICIAL);
    expect(av.trechoAtual?.id).toBe('A');
    expect(av.proximo?.id).toBe('B');
    expect(av.foraDoTrajeto).toBe(false);
    expect(av.estado.chegou).toBe(false);
    expect(av.restanteM).toBeCloseTo(TOTAL_M, -1);
    expect(av.restanteMin).toBe(20);
  });

  it('avança para o trecho B quando a posição passa do canto', () => {
    const av = percorrer([{ latitude: -23.545, longitude: -46.62 }]);
    expect(av.trechoAtual?.id).toBe('B');
    expect(av.proximo).toBeNull();
    expect(av.restanteNoTrechoM).toBeCloseTo(TRECHOS[1].comprimentoM / 2, -1);
  });

  it('não volta ao trecho anterior mesmo com uma leitura sobre ele', () => {
    const estadoEmB = percorrer([{ latitude: -23.545, longitude: -46.62 }]).estado;
    expect(estadoEmB.indice).toBe(1);
    const av = avaliarPosicao(TRECHOS, { latitude: -23.5501, longitude: -46.6250 }, estadoEmB);
    expect(av.estado.indice).toBe(1);
  });

  it('chega ao destino dentro de 100 m e fica chegado', () => {
    const perto = { latitude: -23.5401, longitude: -46.62 };
    const av = percorrer([perto]);
    expect(av.estado.chegou).toBe(true);
    expect(av.restanteM).toBe(0);
    const depois = avaliarPosicao(TRECHOS, INICIO, av.estado);
    expect(depois.estado.chegou).toBe(true);
  });

  it('um ponto ruim isolado não confirma desvio', () => {
    const longe = { latitude: -23.55, longitude: -46.64 };
    const av = percorrer([longe]);
    expect(av.estado.leiturasFora).toBe(1);
    expect(av.foraDoTrajeto).toBe(false);
  });

  it(`desvio é confirmado após ${LEITURAS_PARA_DESVIO} leituras seguidas fora`, () => {
    const longe = { latitude: -23.55, longitude: -46.64 };
    const av = percorrer(Array(LEITURAS_PARA_DESVIO).fill(longe));
    expect(av.foraDoTrajeto).toBe(true);
  });

  it('uma leitura de volta ao trajeto zera o contador de desvio', () => {
    const longe = { latitude: -23.55, longitude: -46.64 };
    const estadoFora = percorrer([longe, longe]).estado;
    const volta = avaliarPosicao(TRECHOS, INICIO, estadoFora);
    expect(volta.estado.leiturasFora).toBe(0);
    expect(volta.foraDoTrajeto).toBe(false);
  });

  it('lista de trechos vazia não quebra e não declara nada', () => {
    const av = avaliarPosicao([], INICIO, ESTADO_INICIAL);
    expect(av.trechoAtual).toBeNull();
    expect(av.foraDoTrajeto).toBe(false);
  });
});

describe('instrucaoDoTrecho', () => {
  it('a pé: diz para onde caminhar, com o embarque do próximo trecho', () => {
    const av = avaliarPosicao(TRECHOS, INICIO, ESTADO_INICIAL);
    const texto = instrucaoDoTrecho(av);
    expect(texto).toMatch(/^Caminhe .+ até Ponto Sé$/);
  });

  it('no começo do trecho de transporte: diz onde embarcar e a linha', () => {
    const av = percorrer([{ latitude: -23.55, longitude: -46.62 }]);
    const texto = instrucaoDoTrecho(av);
    expect(texto).toContain('Embarque em Ponto Sé');
    expect(texto).toContain('477A');
    expect(texto).toContain('previsto para');
  });

  it('no meio do transporte: diz com que linha seguir e até onde', () => {
    const av = percorrer([{ latitude: -23.545, longitude: -46.62 }]);
    expect(instrucaoDoTrecho(av)).toBe('Siga com 477A até Terminal X');
  });

  it('chegado: não há instrução de passo', () => {
    const av = percorrer([{ latitude: -23.5401, longitude: -46.62 }]);
    expect(instrucaoDoTrecho(av)).toBeNull();
  });
});

describe('distanciaParaTexto', () => {
  it('usa metros abaixo de 1 km e km acima', () => {
    expect(distanciaParaTexto(320)).toBe('320 m');
    expect(distanciaParaTexto(1500)).toMatch(/^1,5 km$/);
  });
});
