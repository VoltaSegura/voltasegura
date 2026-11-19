import type { AvaliarCaminhos, MedidaCaminho } from './exposicao';
import { codificar, decodificar, type PontoGeometria } from './geometria';
import {
  aplicarPrioridadeDosDados, candidatosDoTrecho, comLimite, comRotasDosDados, desenharPelosDados, escolherPelosDados,
  PONTOS_DE_BUSCA,
} from './rotaDosDados';
import type { RespostaConsulta, Rota, Trecho } from './tipos';
import { comprimentoKm, semVaiEVolta, type Caminhar } from './variantesCaminhada';

// Coordenadas SINTÉTICAS (inventadas), só para a escala ficar realista.
const ponto = (lat: number, lon: number): PontoGeometria => ({ lat, lon });
const O = ponto(-23.55, -46.64);
const P = ponto(-23.55, -46.634);
const Q = ponto(-23.55, -46.62);
const D = ponto(-23.555, -46.62);
const reta = (de: PontoGeometria, ate: PontoGeometria, n = 12) =>
  Array.from({ length: n + 1 }, (_, i) => ponto(de.lat + ((ate.lat - de.lat) * i) / n, de.lon + ((ate.lon - de.lon) * i) / n));
const caminharReto: Caminhar = async (de, ate) => reta(de, ate);

function trecho(id: string, ordem: number, modo: Trecho['modo'], de: PontoGeometria, ate: PontoGeometria, partida: string, duracaoMin: number): Trecho {
  const pontos = reta(de, ate);
  return {
    id, ordem, modo, linha: modo === 'A_PE' ? null : '875C-10', embarque: null, desembarque: null, partidaPrevista: partida, duracaoMin,
    distanciaKm: Math.round(comprimentoKm(pontos) * 100) / 100, faixaDoDia: modo === 'A_PE' ? 'NOITE' : null, geometria: codificar(pontos),
  };
}
const exposicao = (registros: number | null, kmAPe: number, cobertura: number | null) =>
  ({ registros, kmAPe, registrosPorKm: registros === null ? null : registros / kmAPe, cobertura });
const categorias = {
  furto: { total: null, outros: null, carga: null, veiculo: null },
  roubo: { total: null, outros: null, carga: null, veiculo: null, latrocinio: null },
  transito: { total: null },
};
function rota(id: string, duracaoMin: number, deslocamento = 0): Rota {
  const o = ponto(O.lat - deslocamento, O.lon);
  const trechos = [
    trecho(`${id}-t1`, 1, 'A_PE', o, P, '2026-11-17T22:00:00-03:00', 8),
    trecho(`${id}-t2`, 2, 'ONIBUS', P, Q, '2026-11-17T22:08:00-03:00', 10),
    trecho(`${id}-t3`, 3, 'A_PE', Q, D, '2026-11-17T22:18:00-03:00', 7),
  ];
  const caminhadaKm = trechos[0].distanciaKm + trechos[2].distanciaKm;
  return {
    id, focos: [], duracaoMin, caminhadaKm, trocas: 0, saidaPrevista: '2026-11-17T22:00:00-03:00', chegadaPrevista: '2026-11-17T22:25:00-03:00',
    geometria: codificar([...reta(o, P), ...reta(P, Q).slice(1), ...reta(Q, D).slice(1)]), trechos,
    exposicao: exposicao(null, caminhadaKm, null), categorias,
  };
}
const resposta = (rotas: Rota[], caso: RespostaConsulta['caso'] = 'MISTOS'): RespostaConsulta => ({
  exemplo: false, fontes: { roteamento: 'otp2', exposicao: 'ssp' }, caso, motivo: null, rotas,
  sobreOsDados: { fonte: 'OTP2 + SSP', periodo: { inicio: '2026-01-01', fim: '2026-09-30', meses: 9 }, atualizacao: { ssp: '', gtfs: '' } },
  panoramaMunicipal: { periodo: { inicio: '', fim: '' }, homicidioDoloso: null, tentativaHomicidio: null, estupro: null, estuproVulneravel: null },
});
const med = (registros: number | null, cobertura: number | null = 0.9, kmAPe = 1): MedidaCaminho => ({ registros, cobertura, kmAPe });

describe('escolherPelosDados (um trecho)', () => {
  const desvio = (km: number) => ({ pontos: reta(O, P), km });

  it('fica com o candidato de menos registros entre os que têm cobertura ≥ 80%', () => {
    const a = desvio(0.7);
    const b = desvio(0.75);
    expect(escolherPelosDados(med(100), [{ desvio: a, medida: med(80) }, { desvio: b, medida: med(60) }])).toBe(b);
  });

  it('cobertura baixa não ganha por ter menos registros (docs/05: ausência ≠ seguro)', () => {
    const a = desvio(0.7);
    expect(escolherPelosDados(med(100), [{ desvio: a, medida: med(5, 0.5) }])).toBeNull();
    expect(escolherPelosDados(med(100), [{ desvio: a, medida: med(5, null) }])).toBeNull();
  });

  it('sem melhora estrita, ou sem base confiável no original, mantém o caminho do roteador', () => {
    const a = desvio(0.7);
    expect(escolherPelosDados(med(100), [{ desvio: a, medida: med(100) }])).toBeNull();
    expect(escolherPelosDados(med(100, 0.6), [{ desvio: a, medida: med(10) }])).toBeNull();
    expect(escolherPelosDados(undefined, [{ desvio: a, medida: med(10) }])).toBeNull();
  });
});

describe('candidatos e vai e volta', () => {
  it('gera até um candidato por ponto de busca, todos dentro de +30%', async () => {
    const t = rota('r1', 25).trechos[0];
    const cands = await candidatosDoTrecho(t, caminharReto);
    expect(cands.length).toBeGreaterThan(0);
    expect(cands.length).toBeLessThanOrEqual(PONTOS_DE_BUSCA.length);
    expect(cands.every((c) => c.km <= t.distanciaKm * 1.3)).toBe(true);
  });

  it('tira o trecho em que o caminho vai até um ponto e volta pela mesma rua', () => {
    const ida = reta(O, P, 6);
    const espora = [P, ponto(P.lat + 0.001, P.lon), P];
    const limpo = semVaiEVolta([...ida, ...espora.slice(1), ...reta(P, Q, 6).slice(1)]);
    expect(limpo.some((p) => p.lat > P.lat + 0.0005)).toBe(false);
  });

  it('limita as consultas simultâneas ao OTP2', async () => {
    let ativos = 0;
    let pico = 0;
    const lento: Caminhar = async (de, ate) => { ativos += 1; pico = Math.max(pico, ativos); await new Promise((r) => setTimeout(r, 5)); ativos -= 1; return reta(de, ate); };
    const limitado = comLimite(lento, 3);
    await Promise.all(Array.from({ length: 10 }, () => limitado(O, P, '2026-11-17T22:00:00-03:00')));
    expect(pico).toBeLessThanOrEqual(3);
  });
});

describe('desenharPelosDados', () => {
  /** Avaliador falso: registros = 100 para os caminhos originais e menos para candidatos ao norte da reta. */
  const avaliarNorte: AvaliarCaminhos = async (candidatos) => new Map(candidatos.map((c) => {
    const pontos = decodificar(c.trechos_a_pe[0].geometria);
    const norte = Math.max(...pontos.map((p) => p.lat)) > -23.5495;
    return [c.id, med(c.id.endsWith('o') ? 100 : norte ? 40 : 120)];
  }));

  it('desenha uma rota nova com os trechos de menos registros, marcada como escolhida pelos dados', async () => {
    const novas = await desenharPelosDados([rota('r1', 25)], caminharReto, avaliarNorte);
    expect(novas).toHaveLength(1);
    expect(novas[0].variante).toEqual({ deRotaId: 'r1', origem: 'dados' });
    expect(novas[0].id).toBe('r1-vx');
    // o 1º trecho (leste) foi para o norte
    const t1 = decodificar(novas[0].trechos[0].geometria);
    expect(Math.max(...t1.map((p) => p.lat))).toBeGreaterThan(-23.5495);
  });

  it('se nenhum candidato tem menos registros, não cria rota', async () => {
    const igual: AvaliarCaminhos = async (c) => new Map(c.map((x) => [x.id, med(100)]));
    expect(await desenharPelosDados([rota('r1', 25)], caminharReto, igual)).toEqual([]);
  });

  it('só as 2 alternativas mais rápidas ganham rota dos dados', async () => {
    const rotas = [rota('r1', 30, 0), rota('r2', 25, 0.002), rota('r3', 40, 0.004)];
    const novas = await desenharPelosDados(rotas, caminharReto, avaliarNorte);
    expect(novas.map((r) => r.variante?.deRotaId).sort()).toEqual(['r1', 'r2']);
  });
});

describe('aplicarPrioridadeDosDados', () => {
  const com = (r: Rota, registros: number | null, cobertura: number | null = 0.9): Rota => ({ ...r, exposicao: exposicao(registros, r.caminhadaKm, cobertura) });

  it('sem diferença estatística: a rota de menos registros vem primeiro, com destaque e confiança pequena', () => {
    const r = aplicarPrioridadeDosDados(resposta([com(rota('r1', 25), 120), com(rota('r1-vx', 28, 0.001), 80)]));
    expect(r.rotas[0].id).toBe('r1-vx');
    expect(r.rotas[0].focos).toContain('MENOR_EXPOSICAO');
    expect(r.rotas[0].destaqueExposicao).toEqual({ confianca: 'pequena' });
    expect(r.rotas[1].focos).not.toContain('MENOR_EXPOSICAO');
    expect(r.rotas[1].destaqueExposicao).toBeUndefined();
  });

  it('CONCLUSIVO: mantém a vencedora da comparação, com confiança clara', () => {
    const vencedora = { ...com(rota('r2', 30, 0.001), 50), focos: ['MENOR_EXPOSICAO' as const] };
    const r = aplicarPrioridadeDosDados(resposta([vencedora, com(rota('r1', 25), 120)], 'CONCLUSIVO'));
    expect(r.rotas[0].id).toBe('r2');
    expect(r.rotas[0].destaqueExposicao).toEqual({ confianca: 'clara' });
  });

  it('cobertura abaixo de 80% não recebe destaque, mesmo com menos registros; sem rival confiável, ninguém recebe', () => {
    const r = aplicarPrioridadeDosDados(resposta([com(rota('r1', 25), 120), com(rota('r2', 28, 0.001), 10, 0.6)]));
    expect(r.rotas.some((x) => x.focos.includes('MENOR_EXPOSICAO') || x.destaqueExposicao)).toBe(false);
    // com um rival de cobertura boa, a de cobertura baixa continua fora e a melhor elegível ganha
    const r3 = aplicarPrioridadeDosDados(resposta([com(rota('r1', 25), 120), com(rota('r2', 28, 0.001), 10, 0.6), com(rota('r3', 30, 0.002), 90)]));
    expect(r3.rotas[0].id).toBe('r3');
    expect(r3.rotas.find((x) => x.id === 'r2')!.focos).not.toContain('MENOR_EXPOSICAO');
  });

  it('empate, gêmeas, só roteamento ou rota sem caminhada: sem destaque', () => {
    expect(aplicarPrioridadeDosDados(resposta([com(rota('r1', 25), 100), com(rota('r2', 28, 0.001), 100)])).rotas.some((x) => x.destaqueExposicao)).toBe(false);
    const gemea = { ...com(rota('r1', 25), 100), id: 'r9' };
    expect(aplicarPrioridadeDosDados(resposta([com(rota('r1', 25), 100), gemea])).rotas.some((x) => x.destaqueExposicao)).toBe(false);
    const so = { ...resposta([com(rota('r1', 25), 120), com(rota('r2', 28, 0.001), 80)]), fontes: { roteamento: 'otp2' as const, exposicao: 'indisponivel' as const } };
    expect(aplicarPrioridadeDosDados(so)).toBe(so);
    const semPe = { ...com(rota('r2', 28, 0.001), 0), exposicao: exposicao(0, 0, 0.9) };
    expect(aplicarPrioridadeDosDados(resposta([com(rota('r1', 25), 120), semPe])).rotas.some((x) => x.destaqueExposicao)).toBe(false);
  });
});

describe('comRotasDosDados', () => {
  const base = resposta([rota('r1', 25)], 'INDISPONIVEL');
  const soRoteamento = { ...base, fontes: { roteamento: 'otp2' as const, exposicao: 'indisponivel' as const } };
  const entrada = { origem: O, destino: D, saida: '2026-11-17T22:00:00-03:00', sentido: 'ida' as const };

  it('sem sessão do Neon Auth, devolve as rotas do roteador sem chamar nada', async () => {
    const fetchImpl = jest.fn() as unknown as typeof fetch;
    const servico = comRotasDosDados({ consultarRotas: async () => soRoteamento }, {
      urlOtp2: 'http://otp.test', urlDataApi: 'https://dados.test/rest/v1', urlNeonAuth: 'https://auth.test', origemNeonAuth: 'http://localhost:8081',
      fetchImpl, obterSessao: () => null,
    });
    expect(await servico.consultarRotas(entrada)).toBe(soRoteamento);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('falha no meio do motor devolve as rotas do roteador', async () => {
    const quebrado = (async () => { throw new TypeError('rede'); }) as unknown as typeof fetch;
    const servico = comRotasDosDados({ consultarRotas: async () => soRoteamento }, {
      urlOtp2: 'http://otp.test', urlDataApi: 'https://dados.test/rest/v1', urlNeonAuth: 'https://auth.test', origemNeonAuth: 'http://localhost:8081',
      fetchImpl: quebrado, obterSessao: () => '__Secure-neon-auth.session_token=abc',
    });
    expect(await servico.consultarRotas(entrada)).toBe(soRoteamento);
  });
});
