import type { EntradaConsulta, ServicoConsulta } from './consulta';
import {
  agruparPorCaminhada, comExposicao, ehCookieSessaoNeonAuth, mesclarExposicao, montarEntradaRpc, TEMPO_LIMITE_EXPOSICAO_MS, ultimoMotivoExposicao,
  type MotivoExposicao,
} from './exposicao';
import { codificar } from './geometria';
import { mapearOtp2, type RespostaOtp2 } from './otp2';
import type { RespostaConsulta } from './tipos';

// Fixture SINTÉTICA (coordenadas inventadas), no mesmo formato do OTP2 usado em otp2.test.ts.
const A = { lat: -23.5, lon: -46.6 };
const B = { lat: -23.501, lon: -46.601 };
const C = { lat: -23.505, lon: -46.61 };
/** Outro ponto de embarque: a 2ª rota caminha por outro lugar (rotas com a mesma caminhada são agrupadas, B-58). */
const B2 = { lat: -23.5015, lon: -46.6003 };
const pe = (de: typeof A, ate: typeof A, inicio: string) => ({
  mode: 'WALK', distance: 700, duration: 600,
  start: { scheduledTime: inicio }, end: { scheduledTime: inicio },
  from: { name: 'Origem' }, to: { name: 'Parada' }, route: null,
  legGeometry: { points: codificar([de, ate]) },
});
const onibus = {
  mode: 'BUS', distance: 4000, duration: 900,
  start: { scheduledTime: '2026-11-17T23:10:00-03:00' }, end: { scheduledTime: '2026-11-17T23:25:00-03:00' },
  from: { name: 'Parada X' }, to: { name: 'Parada Y' }, route: { shortName: '875C-10', longName: 'Linha' },
  legGeometry: { points: codificar([B, C]) },
};
const no = (dur: number, legs: object[]) => ({
  node: { start: '2026-11-17T23:00:00-03:00', end: '2026-11-17T23:40:00-03:00', duration: dur, walkDistance: 700, numberOfTransfers: 0, legs },
});
const otp: RespostaOtp2 = { data: { planConnection: { edges: [
  no(2400, [pe(A, B, '2026-11-17T23:00:00-03:00'), onibus]),
  no(2100, [pe(A, B2, '2026-11-18T00:30:00-03:00'), onibus]),
] } } };

const COOKIE = '__Secure-neon-auth.session_token=abc123.assinatura%2Fxyz%3D';
const entrada: EntradaConsulta = { origem: A, destino: C, saida: '2026-11-17T23:00:00-03:00', sentido: 'ida' };
const categorias = {
  furto: { total: 6, outros: 4, carga: 1, veiculo: 1 },
  roubo: { total: 3, outros: 2, carga: 0, veiculo: 0, latrocinio: 1 },
  transito: { total: 2 },
};
const exposicaoDe = (registros: number | null) => ({ registros, kmAPe: 0.7, registrosPorKm: registros === null ? null : registros / 0.7, cobertura: 0.9 });

function respostaRpc(base: RespostaConsulta, caso: string, vencedora: string | null, extra: Record<string, unknown> = {}) {
  return {
    caso,
    motivo: caso === 'INSUFICIENTE' ? 'AMOSTRA' : null,
    periodo: { inicio: '2025-01-01', fim: '2025-09-30', meses: 9 },
    atualizacao_ssp: '2025-10-15',
    rotas: base.rotas.map((r) => ({
      id: r.id, menorExposicao: r.id === vencedora, exposicao: exposicaoDe(r.id === vencedora ? 2 : 8), categorias,
    })),
    panoramaMunicipal: { homicidioDoloso: 10, tentativaHomicidio: 20, estupro: 30, estuproVulneravel: 40 },
    ...extra,
  };
}

const base = mapearOtp2(otp);
const roteamento: ServicoConsulta = { consultarRotas: async () => base };
const resp = (ok: boolean, status: number, corpo: unknown) => ({
  ok, status, json: async () => { if (corpo === 'INVALIDO') throw new SyntaxError('x'); return corpo; },
});

type Chamada = { url: string; init: RequestInit };
function criar(opcoes: { token?: unknown; rpc?: unknown; sessao?: string | null } = {}) {
  const chamadas: Chamada[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    chamadas.push({ url, init });
    if (url.endsWith('/token')) return opcoes.token ?? resp(true, 200, { token: 'jwt-de-teste' });
    return opcoes.rpc ?? resp(true, 200, respostaRpc(base, 'CONCLUSIVO', base.rotas[0].id));
  }) as unknown as typeof fetch;
  const servico = comExposicao(roteamento, {
    urlDataApi: 'https://dados.exemplo.test/rest/v1',
    urlNeonAuth: 'https://auth.exemplo.test',
    origemNeonAuth: 'http://localhost:8081',
    fetchImpl,
    obterSessao: () => (opcoes.sessao === undefined ? COOKIE : opcoes.sessao),
  });
  return { servico, chamadas };
}

const soRoteamento = (r: RespostaConsulta) => {
  expect(r).toEqual(base);
  expect(r.fontes.exposicao).toBe('indisponivel');
  expect(r.caso).toBe('INDISPONIVEL');
  expect(r.rotas.every((x) => !x.focos.includes('MENOR_EXPOSICAO'))).toBe(true);
};

describe('montarEntradaRpc', () => {
  it('envia só trechos a pé (polyline canônica) e a faixa, nada mais', () => {
    const e = montarEntradaRpc(base.rotas)!;
    expect(e).toHaveLength(2);
    for (const r of e) {
      expect(Object.keys(r).sort()).toEqual(['id', 'trechos_a_pe']);
      expect(r.trechos_a_pe).toHaveLength(1);
      expect(Object.keys(r.trechos_a_pe[0]).sort()).toEqual(['faixa', 'geometria']);
    }
    expect(e.find((r) => r.id === 'r1')!.trechos_a_pe[0]).toEqual({ geometria: codificar([A, B]), faixa: 'NOITE' });
    expect(e.find((r) => r.id === 'r2')!.trechos_a_pe[0].faixa).toBe('MADRUGADA');
  });

  it('rota sem trecho a pé vai com lista vazia; mais de 5 rotas não é enviado', () => {
    const semPe = { ...base.rotas[0], trechos: base.rotas[0].trechos.filter((t) => t.modo !== 'A_PE') };
    expect(montarEntradaRpc([semPe])![0].trechos_a_pe).toEqual([]);
    expect(montarEntradaRpc(Array(6).fill(base.rotas[0]))).toBeNull();
  });

  it('B-57: remove vértices repetidos do OTP2 (o PostGIS os descarta e a polyline deixaria de ser canônica)', () => {
    const comRepetido = { ...base.rotas[0], trechos: base.rotas[0].trechos.map((t) =>
      t.modo === 'A_PE' ? { ...t, geometria: codificar([A, B, B, C]) } : t) };
    expect(montarEntradaRpc([comRepetido])![0].trechos_a_pe[0].geometria).toBe(codificar([A, B, C]));
  });

  it('B-57: trecho a pé de comprimento zero fica de fora; geometria ilegível continua barrando o envio', () => {
    const parado = { ...base.rotas[0], trechos: base.rotas[0].trechos.map((t) =>
      t.modo === 'A_PE' ? { ...t, geometria: codificar([A, A]) } : t) };
    expect(montarEntradaRpc([parado])![0].trechos_a_pe).toEqual([]);
    const ilegivel = { ...base.rotas[0], trechos: base.rotas[0].trechos.map((t) =>
      t.modo === 'A_PE' ? { ...t, geometria: '' } : t) };
    expect(montarEntradaRpc([ilegivel])).toBeNull();
  });
});

describe('B-58: rotas com a mesma caminhada (gêmeas) e ordem da D-23', () => {
  // r3: mesma caminhada da r1 (muda só a condução), mais lenta
  const gemea = (de: RespostaConsulta['rotas'][number], id: string, duracaoMin: number) => ({
    ...de, id, duracaoMin, focos: [] as RespostaConsulta['rotas'][number]['focos'],
    trechos: de.trechos.map((t) => ({ ...t, id: t.id.replace(de.id, id) })),
  });
  const r1 = () => base.rotas.find((r) => r.id === 'r1')!;
  const com3 = (r3Duracao: number): RespostaConsulta => ({ ...base, rotas: [...base.rotas, gemea(r1(), 'r3', r3Duracao)] });

  it('agrupa gêmeas e usa a mais rápida como representante', () => {
    const lenta = agruparPorCaminhada(com3(r1().duracaoMin + 10).rotas);
    expect(lenta.representantes.map((r) => r.id).sort()).toEqual(['r1', 'r2']);
    expect(lenta.representanteDe.get('r3')).toBe('r1');
    const rapida = agruparPorCaminhada(com3(r1().duracaoMin - 10).rotas);
    expect(rapida.representantes.map((r) => r.id).sort()).toEqual(['r2', 'r3']);
    expect(rapida.representanteDe.get('r1')).toBe('r3');
  });

  function servicoCom(resposta: RespostaConsulta, vencedora: string) {
    const chamadas: string[] = [];
    const fetchImpl = (async (url: string, init: RequestInit) => {
      if (url.endsWith('/token')) return resp(true, 200, { token: 'jwt' });
      chamadas.push(String(init.body));
      const enviados = (JSON.parse(String(init.body)).p_rotas as { id: string }[]).map((r) => r.id);
      const reps = resposta.rotas.filter((r) => enviados.includes(r.id));
      return resp(true, 200, respostaRpc({ ...resposta, rotas: reps }, 'CONCLUSIVO', vencedora));
    }) as unknown as typeof fetch;
    const servico = comExposicao({ consultarRotas: async () => resposta }, {
      urlDataApi: 'https://dados.exemplo.test/rest/v1', urlNeonAuth: 'https://auth.exemplo.test',
      origemNeonAuth: 'http://localhost:8081', fetchImpl, obterSessao: () => COOKIE,
    });
    return { servico, chamadas };
  }

  it('envia cada caminhada uma vez e copia a exposição do representante para a gêmea', async () => {
    const { servico, chamadas } = servicoCom(com3(r1().duracaoMin + 10), 'r2');
    const r = await servico.consultarRotas(entrada);
    expect(JSON.parse(chamadas[0]).p_rotas).toHaveLength(2);
    const porId = (id: string) => r.rotas.find((x) => x.id === id)!;
    expect(porId('r3').exposicao).toEqual(porId('r1').exposicao);
    expect(porId('r3').exposicao.registros).not.toBeNull();
  });

  it('CONCLUSIVO: a vencedora vem primeiro (D-23) e só ela tem o foco', async () => {
    const { servico } = servicoCom(com3(r1().duracaoMin + 10), 'r2');
    const r = await servico.consultarRotas(entrada);
    expect(r.caso).toBe('CONCLUSIVO');
    expect(r.rotas[0].id).toBe('r2');
    expect(r.rotas.filter((x) => x.focos.includes('MENOR_EXPOSICAO')).map((x) => x.id)).toEqual(['r2']);
  });

  it('CONCLUSIVO do grupo gêmeo: o destaque vai só para a mais rápida do grupo; a outra fica sem selo', async () => {
    const { servico } = servicoCom(com3(r1().duracaoMin + 10), 'r1');
    const r = await servico.consultarRotas(entrada);
    expect(r.rotas[0].id).toBe('r1');
    expect(r.rotas.find((x) => x.id === 'r3')!.focos).not.toContain('MENOR_EXPOSICAO');
    expect(r.rotas.filter((x) => x.focos.includes('MENOR_EXPOSICAO'))).toHaveLength(1);
  });
});

describe('comExposicao', () => {
  it('CONCLUSIVO: mescla exposição, categorias, panorama e põe o foco só na rota destacada', async () => {
    const { servico, chamadas } = criar();
    const r = await servico.consultarRotas(entrada);
    expect(r.fontes).toEqual({ roteamento: 'otp2', exposicao: 'ssp' });
    expect(r.exemplo).toBe(false);
    expect(r.caso).toBe('CONCLUSIVO');
    const [vencedora, outra] = [r.rotas.find((x) => x.id === base.rotas[0].id)!, r.rotas.find((x) => x.id !== base.rotas[0].id)!];
    expect(vencedora.focos).toContain('MENOR_EXPOSICAO');
    expect(outra.focos).not.toContain('MENOR_EXPOSICAO');
    expect(vencedora.exposicao.registros).toBe(2);
    expect(vencedora.categorias.furto.total).toBe(6);
    expect(r.panoramaMunicipal).toMatchObject({ homicidioDoloso: 10, estuproVulneravel: 40 });
    expect(r.sobreOsDados.periodo).toEqual({ inicio: '2025-01-01', fim: '2025-09-30', meses: 9 });
    expect(r.sobreOsDados.atualizacao.ssp).toBe('2025-10-15');
    expect(r.rotas.map((x) => x.geometria)).toEqual(base.rotas.map((x) => x.geometria));

    expect(chamadas).toHaveLength(2);
    expect(chamadas[0].url).toBe('https://auth.exemplo.test/token');
    expect((chamadas[0].init.headers as Record<string, string>).Cookie).toBe(COOKIE);
    const rpc = chamadas[1];
    expect(rpc.url).toBe('https://dados.exemplo.test/rest/v1/rpc/comparar_exposicao');
    const h = rpc.init.headers as Record<string, string>;
    expect(h.Authorization).toBe('Bearer jwt-de-teste');
    expect(h['Content-Profile']).toBe('mobile_api');
    expect(h.Cookie).toBeUndefined();
    const corpo = JSON.parse(rpc.init.body as string);
    expect(Object.keys(corpo).sort()).toEqual(['p_modo_cobertura', 'p_rotas']);
    expect(corpo.p_modo_cobertura).toBe('poligono');
    // nada de origem, destino ou horário exato no corpo
    expect(rpc.init.body as string).not.toMatch(/-23\.5|-46\.6|2026-11|latitude|lat\b|lon\b/);
  });

  it('INSUFICIENTE: mantém os números, mas não destaca rota nem põe foco, mesmo que o servidor mande menorExposicao', async () => {
    const rpc = respostaRpc(base, 'INSUFICIENTE', base.rotas[0].id);
    const { servico } = criar({ rpc: resp(true, 200, rpc) });
    const r = await servico.consultarRotas(entrada);
    expect(r.caso).toBe('INSUFICIENTE');
    expect(r.motivo).toBe('AMOSTRA');
    expect(r.fontes.exposicao).toBe('ssp');
    expect(r.rotas.every((x) => !x.focos.includes('MENOR_EXPOSICAO'))).toBe(true);
  });

  it.each(['SEM_DIFERENCA', 'MISTOS', 'NAO_APLICAVEL', 'SEM_COMPARACAO'])('%s: sem destaque', async (caso) => {
    const { servico } = criar({ rpc: resp(true, 200, respostaRpc(base, caso, base.rotas[1].id)) });
    const r = await servico.consultarRotas(entrada);
    expect(r.caso).toBe(caso);
    expect(r.rotas.every((x) => !x.focos.includes('MENOR_EXPOSICAO'))).toBe(true);
  });

  it('CONCLUSIVO sem exatamente uma rota destacada é fora do contrato: Só roteamento', async () => {
    const { servico } = criar({ rpc: resp(true, 200, respostaRpc(base, 'CONCLUSIVO', null)) });
    soRoteamento(await servico.consultarRotas(entrada));
  });

  it('cobertura enviada vem da configuração', async () => {
    const chamadas: Chamada[] = [];
    const fetchImpl = (async (url: string, init: RequestInit) => {
      chamadas.push({ url, init });
      return url.endsWith('/token') ? resp(true, 200, { token: 'j' }) : resp(true, 200, respostaRpc(base, 'MISTOS', null));
    }) as unknown as typeof fetch;
    await comExposicao(roteamento, {
      urlDataApi: 'https://d.test', urlNeonAuth: 'https://a.test', origemNeonAuth: 'o', modoCobertura: 'proxy_pontos',
      fetchImpl, obterSessao: () => COOKIE,
    }).consultarRotas(entrada);
    expect(JSON.parse(chamadas[1].init.body as string).p_modo_cobertura).toBe('proxy_pontos');
  });

  it.each([
    ['RPC 401', { rpc: resp(false, 401, { message: 'x' }) }],
    ['RPC 403', { rpc: resp(false, 403, {}) }],
    ['RPC 500', { rpc: resp(false, 500, {}) }],
    ['token 401', { token: resp(false, 401, {}) }],
    ['token sem campo token', { token: resp(true, 200, {}) }],
    ['JSON inválido da RPC', { rpc: resp(true, 200, 'INVALIDO') }],
    ['JSON inválido do token', { token: resp(true, 200, 'INVALIDO') }],
    ['RPC devolve INDISPONIVEL', { rpc: resp(true, 200, respostaRpc(base, 'INDISPONIVEL', null)) }],
    ['RPC com forma errada', { rpc: resp(true, 200, { caso: 'CONCLUSIVO', rotas: 'x' }) }],
    ['RPC com rota desconhecida', { rpc: resp(true, 200, { ...respostaRpc(base, 'MISTOS', null), rotas: [{ id: 'x' }, { id: 'y' }] }) }],
    ['cobertura acima de 1', { rpc: resp(true, 200, (() => { const j = respostaRpc(base, 'MISTOS', null); j.rotas[0].exposicao.cobertura = 1.5; return j; })()) }],
  ])('%s: mantém exatamente o Só roteamento', async (_nome, opcoes) => {
    const { servico } = criar(opcoes);
    soRoteamento(await servico.consultarRotas(entrada));
  });

  it('sem sessão ou sem URL: nem chama a rede', async () => {
    const { servico, chamadas } = criar({ sessao: null });
    soRoteamento(await servico.consultarRotas(entrada));
    expect(chamadas).toHaveLength(0);
  });

  it('erro de rede: Só roteamento, sem lançar', async () => {
    const servico = comExposicao(roteamento, {
      urlDataApi: 'https://d.test', urlNeonAuth: 'https://a.test', origemNeonAuth: 'o',
      fetchImpl: (async () => { throw new TypeError('Network request failed'); }) as unknown as typeof fetch,
      obterSessao: () => COOKIE,
    });
    soRoteamento(await servico.consultarRotas(entrada));
  });

  it('tempo esgotado (10 s): Só roteamento', async () => {
    jest.useFakeTimers();
    try {
      const fetchImpl = ((_url: string, init: RequestInit) => new Promise((_ok, rejeitar) => {
        init.signal?.addEventListener('abort', () => rejeitar(Object.assign(new Error('abortado'), { name: 'AbortError' })));
      })) as unknown as typeof fetch;
      const servico = comExposicao(roteamento, {
        urlDataApi: 'https://d.test', urlNeonAuth: 'https://a.test', origemNeonAuth: 'o', fetchImpl, obterSessao: () => COOKIE,
      });
      const pendente = servico.consultarRotas(entrada);
      await jest.advanceTimersByTimeAsync(TEMPO_LIMITE_EXPOSICAO_MS - 1);
      let resolveu = false;
      void pendente.then(() => { resolveu = true; });
      await Promise.resolve();
      expect(resolveu).toBe(false);
      await jest.advanceTimersByTimeAsync(1);
      soRoteamento(await pendente);
    } finally {
      jest.useRealTimers();
    }
  });

  it('cancelamento de quem chamou durante a exposição vira AbortError', async () => {
    const controle = new AbortController();
    const fetchImpl = ((_url: string, init: RequestInit) => new Promise((_ok, rejeitar) => {
      init.signal?.addEventListener('abort', () => rejeitar(new Error('abortado')));
      controle.abort();
    })) as unknown as typeof fetch;
    const servico = comExposicao(roteamento, {
      urlDataApi: 'https://d.test', urlNeonAuth: 'https://a.test', origemNeonAuth: 'o', fetchImpl, obterSessao: () => COOKIE,
    });
    await expect(servico.consultarRotas(entrada, { signal: controle.signal })).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('não registra nada no console', async () => {
    const espioes = (['log', 'warn', 'error', 'info', 'debug'] as const).map((m) => jest.spyOn(console, m).mockImplementation(() => {}));
    try {
      await criar().servico.consultarRotas(entrada);
      await criar({ rpc: resp(false, 401, {}) }).servico.consultarRotas(entrada);
      for (const e of espioes) expect(e).not.toHaveBeenCalled();
    } finally {
      espioes.forEach((e) => e.mockRestore());
    }
  });

  it('não altera a resposta do roteamento recebida', async () => {
    const copia = JSON.parse(JSON.stringify(base));
    await criar().servico.consultarRotas(entrada);
    expect(base).toEqual(copia);
  });

  it('sem rotas ou sem fonte otp2: devolve como veio', async () => {
    const vazia: RespostaConsulta = { ...base, rotas: [] };
    const s = comExposicao({ consultarRotas: async () => vazia }, {
      urlDataApi: 'https://d.test', urlNeonAuth: 'https://a.test', origemNeonAuth: 'o',
      fetchImpl: (async () => { throw new Error('não deveria chamar'); }) as unknown as typeof fetch, obterSessao: () => COOKIE,
    });
    expect(await s.consultarRotas(entrada)).toBe(vazia);
  });
});

describe('mesclarExposicao', () => {
  it('JSON que não é objeto nunca vira exposição', () => {
    for (const ruim of [null, 'x', 3, [], { caso: 'CONCLUSIVO' }]) expect(mesclarExposicao(base, ruim)).toBeNull();
  });
});

describe('motivo da falha (B-55)', () => {
  const motivo = async (opcoes: Parameters<typeof criar>[0]): Promise<MotivoExposicao | null> => {
    await criar(opcoes).servico.consultarRotas(entrada);
    return ultimoMotivoExposicao();
  };

  it('ok quando a exposição entra', async () => {
    expect(await motivo({})).toBe('ok');
  });

  it.each([
    ['sem sessão', { sessao: null }, 'sem_sessao'],
    ['sessão do mock (token-exemplo) não vale', { sessao: 'token-exemplo' }, 'sem_sessao'],
    ['sessão provisória não vale', { sessao: 'token-provisorio' }, 'sem_sessao'],
    ['token 401', { token: resp(false, 401, {}) }, 'token_http_401'],
    ['token 500', { token: resp(false, 500, {}) }, 'token_http_500'],
    ['token com JSON inválido', { token: resp(true, 200, 'INVALIDO') }, 'token_invalido'],
    ['token sem campo token', { token: resp(true, 200, {}) }, 'token_invalido'],
    ['RPC 401', { rpc: resp(false, 401, {}) }, 'rpc_http_401'],
    ['RPC 404', { rpc: resp(false, 404, {}) }, 'rpc_http_404'],
    ['RPC com JSON inválido', { rpc: resp(true, 200, 'INVALIDO') }, 'resposta_invalida'],
    ['RPC INDISPONIVEL', { rpc: resp(true, 200, respostaRpc(base, 'INDISPONIVEL', null)) }, 'resposta_invalida'],
    ['RPC com forma errada', { rpc: resp(true, 200, { caso: 'MISTOS', rotas: [] }) }, 'resposta_invalida'],
  ] as [string, Parameters<typeof criar>[0], MotivoExposicao][])('%s -> %s', async (_n, opcoes, esperado) => {
    expect(await motivo(opcoes)).toBe(esperado);
  });

  it('sem_config quando falta a URL da Data API ou do Neon Auth', async () => {
    for (const falta of ['urlDataApi', 'urlNeonAuth'] as const) {
      const s = comExposicao(roteamento, {
        urlDataApi: 'https://d.test', urlNeonAuth: 'https://a.test', origemNeonAuth: 'o', [falta]: '',
        fetchImpl: (async () => { throw new Error('não deveria chamar'); }) as unknown as typeof fetch, obterSessao: () => COOKIE,
      });
      await s.consultarRotas(entrada);
      expect(ultimoMotivoExposicao()).toBe('sem_config');
    }
  });

  it('entrada_invalida quando a rota não pode ser enviada (trecho a pé sem faixa)', async () => {
    const semFaixa: RespostaConsulta = {
      ...base,
      rotas: base.rotas.map((r) => ({ ...r, trechos: r.trechos.map((t) => (t.modo === 'A_PE' ? { ...t, faixaDoDia: null, partidaPrevista: null } : t)) })),
    };
    const s = comExposicao({ consultarRotas: async () => semFaixa }, {
      urlDataApi: 'https://d.test', urlNeonAuth: 'https://a.test', origemNeonAuth: 'o',
      fetchImpl: (async () => { throw new Error('não deveria chamar'); }) as unknown as typeof fetch, obterSessao: () => COOKIE,
    });
    await s.consultarRotas(entrada);
    expect(ultimoMotivoExposicao()).toBe('entrada_invalida');
  });

  it('erro_rede quando o fetch falha', async () => {
    const s = comExposicao(roteamento, {
      urlDataApi: 'https://d.test', urlNeonAuth: 'https://a.test', origemNeonAuth: 'o',
      fetchImpl: (async () => { throw new TypeError('Network request failed'); }) as unknown as typeof fetch, obterSessao: () => COOKIE,
    });
    await s.consultarRotas(entrada);
    expect(ultimoMotivoExposicao()).toBe('erro_rede');
  });

  it('tempo_esgotado quando passa dos 10 s', async () => {
    jest.useFakeTimers();
    try {
      const fetchImpl = ((_u: string, init: RequestInit) => new Promise((_ok, rej) => {
        init.signal?.addEventListener('abort', () => rej(Object.assign(new Error('x'), { name: 'AbortError' })));
      })) as unknown as typeof fetch;
      const p = comExposicao(roteamento, { urlDataApi: 'https://d.test', urlNeonAuth: 'https://a.test', origemNeonAuth: 'o', fetchImpl, obterSessao: () => COOKIE })
        .consultarRotas(entrada);
      await jest.advanceTimersByTimeAsync(TEMPO_LIMITE_EXPOSICAO_MS);
      await p;
      expect(ultimoMotivoExposicao()).toBe('tempo_esgotado');
    } finally {
      jest.useRealTimers();
    }
  });

  it('cancelado quando quem chamou cancela', async () => {
    const controle = new AbortController();
    const fetchImpl = ((_u: string, init: RequestInit) => new Promise((_ok, rej) => {
      init.signal?.addEventListener('abort', () => rej(new Error('x')));
      controle.abort();
    })) as unknown as typeof fetch;
    const s = comExposicao(roteamento, { urlDataApi: 'https://d.test', urlNeonAuth: 'https://a.test', origemNeonAuth: 'o', fetchImpl, obterSessao: () => COOKIE });
    await expect(s.consultarRotas(entrada, { signal: controle.signal })).rejects.toMatchObject({ name: 'AbortError' });
    expect(ultimoMotivoExposicao()).toBe('cancelado');
  });
});

describe('diagnóstico no console (EXPO_PUBLIC_EXPOSICAO_DIAG)', () => {
  const original = process.env.EXPO_PUBLIC_EXPOSICAO_DIAG;
  afterEach(() => {
    if (original === undefined) delete process.env.EXPO_PUBLIC_EXPOSICAO_DIAG;
    else process.env.EXPO_PUBLIC_EXPOSICAO_DIAG = original;
  });

  it('desligado (padrão): não imprime nada', async () => {
    delete process.env.EXPO_PUBLIC_EXPOSICAO_DIAG;
    const w = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await criar({ rpc: resp(false, 401, {}) }).servico.consultarRotas(entrada);
    expect(w).not.toHaveBeenCalled();
    w.mockRestore();
  });

  it('com a flag "1": imprime só "[exposicao] <motivo>", sem token, cookie, URL nem geometria', async () => {
    process.env.EXPO_PUBLIC_EXPOSICAO_DIAG = '1';
    const w = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await criar({ rpc: resp(false, 401, {}) }).servico.consultarRotas(entrada);
    await criar({ sessao: 'token-exemplo' }).servico.consultarRotas(entrada);
    expect(w.mock.calls).toEqual([['[exposicao] rpc_http_401'], ['[exposicao] sem_sessao']]);
    w.mockRestore();
  });

  it('só o valor "1" liga', async () => {
    process.env.EXPO_PUBLIC_EXPOSICAO_DIAG = 'true';
    const w = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await criar({ sessao: null }).servico.consultarRotas(entrada);
    expect(w).not.toHaveBeenCalled();
    w.mockRestore();
  });
});

describe('ehCookieSessaoNeonAuth', () => {
  it.each([
    ['__Secure-neon-auth.session_token=abc123.assinatura%2Fxyz%3D', true],
    ['neon-auth.session_token=abc', true],
    ['token-exemplo', false],
    ['token-provisorio', false],
    ['', false],
    [null, false],
    ['a=b; session_token=x', false],
  ])('%p -> %p', (valor, esperado) => {
    expect(ehCookieSessaoNeonAuth(valor)).toBe(esperado);
  });
});
