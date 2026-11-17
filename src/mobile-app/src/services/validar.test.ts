import { describe, expect, it } from '@jest/globals';
import { ErroServico } from './erros';
import { fixtures, type NomeFixture } from './fixtures';
import type { RespostaConsulta } from './tipos';
import { CODIGO_FORMATO, validarRespostaConsulta } from './validar';

const copia = (nome: NomeFixture = 'conclusivo'): Record<string, any> =>
  JSON.parse(JSON.stringify(fixtures[nome]));

function erroDe(bruto: unknown): ErroServico {
  try {
    validarRespostaConsulta(bruto);
  } catch (e) {
    return e as ErroServico;
  }
  throw new Error('deveria ter falhado');
}

function semNumerosDeExposicao(r: RespostaConsulta) {
  expect(r.caso).toBe('INDISPONIVEL');
  expect(r.motivo).toBeNull();
  for (const rota of r.rotas) {
    expect(rota.exposicao.registros).toBeNull();
    expect(rota.exposicao.registrosPorKm).toBeNull();
    expect(rota.exposicao.cobertura).toBeNull();
    expect(rota.exposicao.kmAPe).toBe(rota.caminhadaKm);
    expect(Object.values(rota.categorias.furto).every((v) => v === null)).toBe(true);
    expect(Object.values(rota.categorias.roubo).every((v) => v === null)).toBe(true);
    expect(rota.categorias.transito.total).toBeNull();
    expect(rota.focos).not.toContain('MENOR_EXPOSICAO');
  }
  const { periodo: _periodo, ...panorama } = r.panoramaMunicipal;
  expect(Object.values(panorama).every((v) => v === null)).toBe(true);
}

describe('validarRespostaConsulta: formato correto', () => {
  it.each(Object.keys(fixtures) as NomeFixture[])('aceita a fixture %s sem alterar nada', (nome) => {
    expect(validarRespostaConsulta(copia(nome))).toEqual(fixtures[nome]);
  });

  it('descarta campos desconhecidos', () => {
    const bruto = copia();
    bruto.extra = 'x';
    bruto.rotas[0].extra = 1;
    bruto.rotas[0].trechos[0].extra = true;
    const r = validarRespostaConsulta(bruto) as unknown as Record<string, any>;
    expect(r.extra).toBeUndefined();
    expect(r.rotas[0].extra).toBeUndefined();
    expect(r.rotas[0].trechos[0].extra).toBeUndefined();
  });

  it('aceita nulos onde o contrato permite (sem virar zero)', () => {
    const bruto = copia();
    bruto.rotas[0].exposicao.registros = null;
    bruto.rotas[0].categorias.furto.total = null;
    bruto.panoramaMunicipal.estupro = null;
    const r = validarRespostaConsulta(bruto);
    expect(r.rotas[0].exposicao.registros).toBeNull();
    expect(r.rotas[0].categorias.furto.total).toBeNull();
    expect(r.panoramaMunicipal.estupro).toBeNull();
    expect(r.caso).toBe('CONCLUSIVO');
  });

  it('com caso INDISPONIVEL não mantém o foco de menor exposição', () => {
    const bruto = copia();
    bruto.caso = 'INDISPONIVEL';
    const r = validarRespostaConsulta(bruto);
    expect(r.rotas.flatMap((x) => x.focos)).not.toContain('MENOR_EXPOSICAO');
  });
});

describe('validarRespostaConsulta: roteamento inválido vira INDISPONIVEL', () => {
  const casos: [string, (b: Record<string, any>) => unknown][] = [
    ['nulo (resposta 204)', () => null],
    ['texto em vez de objeto', () => '{"exemplo": tr'],
    ['lista em vez de objeto', () => []],
    ['JSON truncado: sem rotas', (b) => { delete b.rotas; return b; }],
    ['JSON truncado: sem sobreOsDados', (b) => { delete b.sobreOsDados; return b; }],
    ['exemplo ausente', (b) => { delete b.exemplo; return b; }],
    ['exemplo como texto', (b) => { b.exemplo = 'true'; return b; }],
    ['duração como texto', (b) => { b.rotas[0].duracaoMin = '40'; return b; }],
    ['duração negativa', (b) => { b.rotas[0].duracaoMin = -1; return b; }],
    ['duração NaN', (b) => { b.rotas[0].duracaoMin = Number.NaN; return b; }],
    ['trocas fracionárias', (b) => { b.rotas[0].trocas = 0.5; return b; }],
    ['horário sem fuso', (b) => { b.rotas[0].saidaPrevista = '2026-11-13T23:00:00'; return b; }],
    ['horário inválido', (b) => { b.rotas[0].chegadaPrevista = 'amanhã'; return b; }],
    ['geometria vazia', (b) => { b.rotas[0].geometria = ''; return b; }],
    ['geometria corrompida', (b) => { b.rotas[0].trechos[0].geometria = '~~~~'; return b; }],
    ['rota sem trechos', (b) => { b.rotas[0].trechos = []; return b; }],
    ['modo desconhecido', (b) => { b.rotas[0].trechos[0].modo = 'BICICLETA'; return b; }],
    ['foco desconhecido', (b) => { b.rotas[0].focos = ['MAIS_BONITA']; return b; }],
    ['ids de rota repetidos', (b) => { b.rotas[1].id = b.rotas[0].id; return b; }],
    ['ids de trecho repetidos', (b) => { b.rotas[0].trechos[1].id = b.rotas[0].trechos[0].id; return b; }],
    ['fonte vazia', (b) => { b.sobreOsDados.fonte = ' '; return b; }],
    ['data em formato errado', (b) => { b.sobreOsDados.atualizacao.ssp = '01/11/2026'; return b; }],
  ];

  it.each(casos)('%s', (_nome, estragar) => {
    const e = erroDe(estragar(copia()));
    expect(e).toBeInstanceOf(ErroServico);
    expect(e.tipo).toBe('INDISPONIVEL');
    expect(e.codigo).toBe(CODIGO_FORMATO);
  });

  it('a mensagem do erro não carrega valores recebidos', () => {
    const bruto = copia();
    bruto.rotas[0].saidaPrevista = '-23.55,-46.63 pessoa@exemplo.com';
    const e = erroDe(bruto);
    expect(`${e.message} ${e.codigo}`).not.toMatch(/-23|-46|@/);
  });
});

describe('validarRespostaConsulta: exposição inválida mantém as rotas e anula os números', () => {
  const casos: [string, (b: Record<string, any>) => void][] = [
    ['caso desconhecido', (b) => { b.caso = 'SEGURA'; }],
    ['motivo desconhecido', (b) => { b.motivo = 'OUTRO'; }],
    ['registros como texto', (b) => { b.rotas[0].exposicao.registros = '4'; }],
    ['registros negativos', (b) => { b.rotas[1].exposicao.registros = -2; }],
    ['registros fracionários', (b) => { b.rotas[0].exposicao.registros = 1.5; }],
    ['cobertura acima de 1', (b) => { b.rotas[0].exposicao.cobertura = 90; }],
    ['exposição ausente em uma rota', (b) => { delete b.rotas[1].exposicao; }],
    ['categoria ausente', (b) => { delete b.rotas[0].categorias.roubo; }],
    ['panorama truncado', (b) => { delete b.panoramaMunicipal.periodo; }],
    ['panorama com tipo errado', (b) => { b.panoramaMunicipal.homicidioDoloso = 'muitos'; }],
  ];

  it.each(casos)('%s', (_nome, estragar) => {
    const bruto = copia();
    estragar(bruto);
    const r = validarRespostaConsulta(bruto);
    expect(r.rotas.map((x) => x.id)).toEqual(fixtures.conclusivo.rotas.map((x) => x.id));
    expect(r.rotas[0].trechos).toEqual(fixtures.conclusivo.rotas[0].trechos);
    expect(r.sobreOsDados).toEqual(fixtures.conclusivo.sobreOsDados);
    semNumerosDeExposicao(r);
  });
});

describe('validarRespostaConsulta: origem dos dados (fontes)', () => {
  it.each([
    ['fontes ausente', (b: Record<string, any>) => { delete b.fontes; }],
    ['roteamento desconhecido', (b: Record<string, any>) => { b.fontes.roteamento = 'google'; }],
    ['exposição desconhecida', (b: Record<string, any>) => { b.fontes.exposicao = 'chute'; }],
    ['exemplo: false com bloco de exemplo', (b: Record<string, any>) => { b.exemplo = false; }],
    ['exemplo: true com tudo real', (b: Record<string, any>) => { b.fontes = { roteamento: 'otp2', exposicao: 'ssp' }; }],
  ])('%s vira INDISPONIVEL', (_nome, estragar) => {
    const bruto = copia();
    estragar(bruto);
    expect(erroDe(bruto)).toMatchObject({ tipo: 'INDISPONIVEL', codigo: CODIGO_FORMATO });
  });

  it('tudo real passa com exemplo: false', () => {
    const bruto = copia();
    bruto.exemplo = false;
    bruto.fontes = { roteamento: 'otp2', exposicao: 'ssp' };
    const r = validarRespostaConsulta(bruto);
    expect(r).toMatchObject({ exemplo: false, fontes: { roteamento: 'otp2', exposicao: 'ssp' }, caso: 'CONCLUSIVO' });
    expect(r.rotas[0].exposicao.registros).toBe(fixtures.conclusivo.rotas[0].exposicao.registros);
  });

  it('exposição indisponível anula números que tenham vindo mesmo assim', () => {
    const bruto = copia();
    bruto.exemplo = false;
    bruto.fontes = { roteamento: 'otp2', exposicao: 'indisponivel' };
    const r = validarRespostaConsulta(bruto);
    expect(r.exemplo).toBe(false);
    expect(r.fontes.exposicao).toBe('indisponivel');
    semNumerosDeExposicao(r);
  });

  it('exposição real com formato inválido: vira indisponível e deixa de ser "real"', () => {
    const bruto = copia();
    bruto.exemplo = false;
    bruto.fontes = { roteamento: 'otp2', exposicao: 'ssp' };
    bruto.rotas[0].exposicao.registros = 'x';
    const r = validarRespostaConsulta(bruto);
    expect(r).toMatchObject({ exemplo: false, fontes: { roteamento: 'otp2', exposicao: 'indisponivel' } });
    semNumerosDeExposicao(r);
  });

  it('roteamento de exemplo com exposição inválida continua exemplo', () => {
    const bruto = copia();
    bruto.caso = '???';
    const r = validarRespostaConsulta(bruto);
    expect(r).toMatchObject({ exemplo: true, fontes: { roteamento: 'exemplo', exposicao: 'indisponivel' } });
  });
});
