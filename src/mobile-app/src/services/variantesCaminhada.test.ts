import type { ServicoConsulta } from './consulta';
import { codificar, decodificar, type PontoGeometria } from './geometria';
import type { RespostaConsulta, Rota, Trecho } from './tipos';
import {
  acrescentarVariantes, comprimentoKm, comVariantes, deslocarIso, desviarTrecho, distanciaM, gerarVariante,
  MAX_ALTERNATIVAS_COMPARADAS, montarVariante, pegadaCaminhada, pontoDeDesvio, sobreposicao, type Caminhar,
} from './variantesCaminhada';

// Coordenadas SINTÉTICAS (inventadas), região central de SP só para a escala ficar realista.
const ponto = (lat: number, lon: number): PontoGeometria => ({ lat, lon });
const O = ponto(-23.55, -46.64);
const P = ponto(-23.55, -46.634); // ~610 m a leste de O
const Q = ponto(-23.55, -46.62); // ponto de desembarque, ~1,4 km depois
const D = ponto(-23.555, -46.62); // ~550 m ao sul de Q

/** Linha reta com vértices intermediários (como uma rua). */
function reta(de: PontoGeometria, ate: PontoGeometria, n = 12): PontoGeometria[] {
  return Array.from({ length: n + 1 }, (_, i) => ponto(de.lat + ((ate.lat - de.lat) * i) / n, de.lon + ((ate.lon - de.lon) * i) / n));
}

/** OTP2 falso: caminha em linha reta (com vértices) entre os pontos pedidos. */
const caminharReto: Caminhar = async (de, ate) => reta(de, ate);

function trecho(id: string, ordem: number, modo: Trecho['modo'], de: PontoGeometria, ate: PontoGeometria, partida: string, duracaoMin: number): Trecho {
  const pontos = reta(de, ate);
  return {
    id, ordem, modo, linha: modo === 'A_PE' ? null : '875C-10', embarque: null, desembarque: null,
    partidaPrevista: partida, duracaoMin,
    distanciaKm: Math.round(comprimentoKm(pontos) * 100) / 100,
    faixaDoDia: modo === 'A_PE' ? 'NOITE' : null,
    geometria: codificar(pontos),
  };
}

/** a pé O→P (8 min) · ônibus P→Q (10 min) · a pé Q→D (7 min), saída 22:00. */
function rotaBase(id = 'r1', duracaoMin = 25): Rota {
  const trechos = [
    trecho(`${id}-t1`, 1, 'A_PE', O, P, '2026-11-17T22:00:00-03:00', 8),
    trecho(`${id}-t2`, 2, 'ONIBUS', P, Q, '2026-11-17T22:08:00-03:00', 10),
    trecho(`${id}-t3`, 3, 'A_PE', Q, D, '2026-11-17T22:18:00-03:00', 7),
  ];
  const caminhadaKm = trechos[0].distanciaKm + trechos[2].distanciaKm;
  return {
    id, focos: ['MENOR_TEMPO'], duracaoMin, caminhadaKm, trocas: 0,
    saidaPrevista: '2026-11-17T22:00:00-03:00', chegadaPrevista: '2026-11-17T22:25:00-03:00',
    geometria: codificar([...reta(O, P), ...reta(P, Q).slice(1), ...reta(Q, D).slice(1)]),
    trechos,
    exposicao: { registros: null, kmAPe: caminhadaKm, registrosPorKm: null, cobertura: null },
    categorias: {
      furto: { total: null, outros: null, carga: null, veiculo: null },
      roubo: { total: null, outros: null, carga: null, veiculo: null, latrocinio: null },
      transito: { total: null },
    },
  };
}

describe('geometria das variações', () => {
  it('ponto de desvio: um de cada lado, a ~35% do comprimento da reta a partir do meio', () => {
    const esq = pontoDeDesvio(O, P, 'esquerda', 0.35);
    const dir = pontoDeDesvio(O, P, 'direita', 0.35);
    const meio = ponto((O.lat + P.lat) / 2, (O.lon + P.lon) / 2);
    const l = distanciaM(O, P);
    expect(distanciaM(meio, esq)).toBeCloseTo(0.35 * l, -1);
    expect(distanciaM(meio, dir)).toBeCloseTo(0.35 * l, -1);
    // indo para leste, a esquerda é o norte (latitude maior)
    expect(esq.lat).toBeGreaterThan(meio.lat);
    expect(dir.lat).toBeLessThan(meio.lat);
  });

  it('sobreposição: 1 para a mesma linha, 0 para uma linha distante', () => {
    expect(sobreposicao(reta(O, P), reta(O, P))).toBe(1);
    expect(sobreposicao(reta(ponto(-23.56, -46.64), ponto(-23.56, -46.634)), reta(O, P))).toBe(0);
  });

  it('desloca o horário mantendo o fuso escrito, inclusive virando a meia-noite', () => {
    expect(deslocarIso('2026-11-17T23:50:00-03:00', 15)).toBe('2026-11-18T00:05:00-03:00');
    expect(deslocarIso('2026-11-17T22:00:00-03:00', -4)).toBe('2026-11-17T21:56:00-03:00');
  });
});

describe('desviarTrecho', () => {
  const t1 = rotaBase().trechos[0];

  it('aceita outro caminho com até +30% de comprimento', async () => {
    const d = (await desviarTrecho(t1, 'esquerda', caminharReto))!;
    expect(d).not.toBeNull();
    expect(d.km).toBeLessThanOrEqual(t1.distanciaKm * 1.3);
    expect(d.km).toBeGreaterThan(t1.distanciaKm);
    expect(sobreposicao(d.pontos, decodificar(t1.geometria))).toBeLessThan(0.7);
  });

  it('recusa caminho mais de 30% mais longo', async () => {
    // OTP2 falso que dá uma volta enorme a cada perna
    const longe: Caminhar = async (de, ate) => [de, ponto(de.lat + 0.01, de.lon), ponto(ate.lat + 0.01, ate.lon), ate];
    expect(await desviarTrecho(t1, 'esquerda', longe)).toBeNull();
  });

  it('recusa quando o "desvio" volta pelo mesmo caminho', async () => {
    const mesmo: Caminhar = async () => reta(O, P);
    expect(await desviarTrecho(t1, 'direita', mesmo)).toBeNull();
  });

  it('trecho a pé curto (< 250 m) não varia; OTP2 sem caminho também não', async () => {
    const curto = trecho('c', 1, 'A_PE', O, ponto(-23.55, -46.6385), '2026-11-17T22:00:00-03:00', 2);
    expect(await desviarTrecho(curto, 'esquerda', caminharReto)).toBeNull();
    expect(await desviarTrecho(t1, 'esquerda', async () => null)).toBeNull();
  });
});

describe('montarVariante (horários)', () => {
  it('antes do embarque a saída antecipa; depois do desembarque a chegada atrasa; o ônibus não muda', async () => {
    const base = rotaBase();
    const v = (await gerarVariante(base, 'esquerda', caminharReto))!;
    expect(v.id).toBe('r1-ve');
    expect(v.variante).toEqual({ deRotaId: 'r1' });
    expect(v.focos).toEqual([]);
    const [pe1, bus, pe2] = v.trechos;
    const d1 = pe1.duracaoMin - base.trechos[0].duracaoMin;
    const d2 = pe2.duracaoMin - base.trechos[2].duracaoMin;
    expect(d1).toBeGreaterThan(0);
    expect(bus.partidaPrevista).toBe(base.trechos[1].partidaPrevista);
    expect(Date.parse(v.saidaPrevista)).toBe(Date.parse(base.saidaPrevista) - d1 * 60_000);
    expect(Date.parse(v.chegadaPrevista)).toBe(Date.parse(base.chegadaPrevista) + d2 * 60_000);
    expect(v.duracaoMin).toBe(base.duracaoMin + d1 + d2);
    expect(v.caminhadaKm).toBeGreaterThan(base.caminhadaKm);
    // exposição desconhecida até a comparação
    expect(v.exposicao.registros).toBeNull();
  });

  it('baldeação: descarta a variação se a caminhada nova faz perder a próxima condução', () => {
    const base = rotaBase();
    // ônibus → a pé (10 min, sem folga) → ônibus
    const trechos: Trecho[] = [
      trecho('b-t1', 1, 'ONIBUS', O, P, '2026-11-17T22:00:00-03:00', 10),
      trecho('b-t2', 2, 'A_PE', P, Q, '2026-11-17T22:10:00-03:00', 10),
      trecho('b-t3', 3, 'ONIBUS', Q, D, '2026-11-17T22:20:00-03:00', 10),
    ];
    const r = { ...base, id: 'b', trechos };
    const desvio = { pontos: reta(P, Q), km: trechos[1].distanciaKm * 1.25 };
    expect(montarVariante(r, 'direita', new Map([['b-t2', desvio]]))).toBeNull();
  });
});

describe('acrescentarVariantes', () => {
  it('acrescenta até 2 variações por base, depois das bases, sem caminhadas repetidas', async () => {
    const rotas = await acrescentarVariantes([rotaBase()], caminharReto);
    expect(rotas.map((r) => r.id)).toEqual(['r1', 'r1-ve', 'r1-vd']);
    expect(new Set(rotas.map(pegadaCaminhada)).size).toBe(3);
  });

  it('respeita o limite de alternativas distintas comparadas', async () => {
    const bases = [rotaBase('r1', 25), rotaBase('r2', 26), rotaBase('r3', 27), rotaBase('r4', 28)]
      .map((r, i) => ({ ...r, trechos: r.trechos.map((t) => (t.modo === 'A_PE' && t.ordem === 1
        ? { ...t, geometria: codificar(reta(ponto(O.lat - 0.002 * i, O.lon), P)) } : t)) }));
    const rotas = await acrescentarVariantes(bases, caminharReto);
    expect(new Set(rotas.map(pegadaCaminhada)).size).toBeLessThanOrEqual(MAX_ALTERNATIVAS_COMPARADAS);
    expect(rotas.filter((r) => r.variante)).toHaveLength(1);
    expect(rotas.find((r) => r.variante)!.variante!.deRotaId).toBe('r1');
  });
});

describe('comVariantes', () => {
  const resposta = (roteamento: 'otp2' | 'exemplo'): RespostaConsulta => ({
    exemplo: roteamento === 'exemplo',
    fontes: { roteamento, exposicao: roteamento === 'exemplo' ? 'exemplo' : 'indisponivel' },
    caso: roteamento === 'exemplo' ? 'MISTOS' : 'INDISPONIVEL', motivo: null, rotas: [rotaBase()],
    sobreOsDados: { fonte: 'OTP2', periodo: { inicio: '', fim: '', meses: 0 }, atualizacao: { ssp: '', gtfs: '' } },
    panoramaMunicipal: { periodo: { inicio: '', fim: '' }, homicidioDoloso: null, tentativaHomicidio: null, estupro: null, estuproVulneravel: null },
  });
  const roteamento = (r: RespostaConsulta): ServicoConsulta => ({ consultarRotas: async () => r });
  const entrada = { origem: O, destino: D, saida: '2026-11-17T22:00:00-03:00', sentido: 'ida' as const };
  /** OTP2 HTTP falso que caminha em linha reta. */
  const otpReto = (async (_url: string, init: RequestInit) => {
    const { origem, destino } = JSON.parse(String(init.body)).variables;
    const pontos = reta(ponto(origem.latitude, origem.longitude), ponto(destino.latitude, destino.longitude));
    return { ok: true, json: async () => ({ data: { planConnection: { edges: [{ node: { legs: [{ legGeometry: { points: codificar(pontos) } }] } }] } } }) };
  }) as unknown as typeof fetch;

  it('com OTP2: as bases vêm intactas e as variações entram depois, validadas', async () => {
    const r = await comVariantes(roteamento(resposta('otp2')), { urlOtp2: 'http://otp.test', fetchImpl: otpReto }).consultarRotas(entrada);
    expect(r.rotas[0]).toEqual(rotaBase());
    expect(r.rotas.slice(1).every((x) => x.variante?.deRotaId === 'r1')).toBe(true);
    expect(r.rotas.length).toBeGreaterThan(1);
  });

  it('falha do OTP2 nas variações devolve só as bases; fixture de exemplo não ganha variação', async () => {
    const quebrado = (async () => { throw new TypeError('rede'); }) as unknown as typeof fetch;
    const base = resposta('otp2');
    expect(await comVariantes(roteamento(base), { urlOtp2: 'http://otp.test', fetchImpl: quebrado }).consultarRotas(entrada)).toBe(base);
    const exemplo = resposta('exemplo');
    expect(await comVariantes(roteamento(exemplo), { urlOtp2: 'http://otp.test', fetchImpl: otpReto }).consultarRotas(entrada)).toBe(exemplo);
  });
});
