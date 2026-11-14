import { describe, expect, it } from '@jest/globals';

import { ErroServico } from '@/services/erros';
import type { RespostaConsulta } from '@/services';
import { planejarVolta } from './planejarVolta';
import { consultaInicial, estadoInicial, reducerConsulta } from './reducer';
import type { Consulta, EstadoConsulta } from './tipos';
import { validarConsulta } from './validacao';

const A = { lat: 1, lon: 2 };
const B = { lat: 3, lon: 4 };
const SAIDA = '2026-11-13T23:00:00-03:00';

const valida = (): Consulta => ({ origem: A, destino: B, saida: SAIDA, sentido: 'ida' });

function resposta(...ids: string[]): RespostaConsulta {
  return { rotas: ids.map((id) => ({ id })) } as unknown as RespostaConsulta;
}

describe('reducer', () => {
  it('estado inicial: sem pontos, sentido ida, horário = agora', () => {
    const agora = new Date('2026-11-13T20:00:00Z');
    const c = consultaInicial(agora);
    expect(c).toEqual({ origem: null, destino: null, saida: agora.toISOString(), sentido: 'ida' });
    expect(estadoInicial(agora).busca).toEqual({ status: 'ocioso' });
  });

  it('define origem, destino, horário e sentido', () => {
    let s = estadoInicial();
    s = reducerConsulta(s, { tipo: 'definirOrigem', ponto: A });
    s = reducerConsulta(s, { tipo: 'definirDestino', ponto: B });
    s = reducerConsulta(s, { tipo: 'definirSaida', saida: SAIDA });
    s = reducerConsulta(s, { tipo: 'definirSentido', sentido: 'volta' });
    expect(s.consulta).toEqual({ origem: A, destino: B, saida: SAIDA, sentido: 'volta' });
  });

  it('sucesso seleciona a primeira rota, sem reordenar', () => {
    let s = reducerConsulta(estadoInicial(), { tipo: 'iniciarBusca' });
    expect(s.busca.status).toBe('buscando');
    s = reducerConsulta(s, { tipo: 'sucesso', resposta: resposta('r2', 'r1', 'r3') });
    expect(s.rotaSelecionadaId).toBe('r2');
    if (s.busca.status !== 'sucesso') throw new Error('esperava sucesso');
    expect(s.busca.resposta.rotas.map((r) => r.id)).toEqual(['r2', 'r1', 'r3']);
  });

  it('sucesso com lista vazia não seleciona nada', () => {
    const s = reducerConsulta(estadoInicial(), { tipo: 'sucesso', resposta: resposta() });
    expect(s.rotaSelecionadaId).toBeNull();
  });

  it('seleciona rota por id e ignora id inexistente', () => {
    let s = reducerConsulta(estadoInicial(), { tipo: 'sucesso', resposta: resposta('a', 'b') });
    s = reducerConsulta(s, { tipo: 'selecionarRota', id: 'b' });
    expect(s.rotaSelecionadaId).toBe('b');
    const igual = reducerConsulta(s, { tipo: 'selecionarRota', id: 'zzz' });
    expect(igual).toBe(s);
  });

  it('selecionar rota sem resposta é ignorado', () => {
    const s = estadoInicial();
    expect(reducerConsulta(s, { tipo: 'selecionarRota', id: 'a' })).toBe(s);
  });

  it('iniciar nova consulta descarta a resposta e a rota selecionada', () => {
    let s = reducerConsulta(estadoInicial(), { tipo: 'sucesso', resposta: resposta('a') });
    s = reducerConsulta(s, { tipo: 'iniciarBusca' });
    expect(s.busca).toEqual({ status: 'buscando' });
    expect(s.rotaSelecionadaId).toBeNull();
  });

  it('erro guarda o ErroServico e os problemas, e descarta a rota', () => {
    const erro = new ErroServico('SEM_REDE');
    let s = reducerConsulta(estadoInicial(), { tipo: 'sucesso', resposta: resposta('a') });
    s = reducerConsulta(s, { tipo: 'erro', erro, problemas: ['DESTINO_AUSENTE'] });
    expect(s.busca).toEqual({ status: 'erro', erro, problemas: ['DESTINO_AUSENTE'] });
    expect(s.rotaSelecionadaId).toBeNull();
  });

  it('limpar descarta tudo (consulta, resposta e seleção)', () => {
    let s: EstadoConsulta = reducerConsulta(estadoInicial(), {
      tipo: 'definirOrigem',
      ponto: A,
    });
    s = reducerConsulta(s, { tipo: 'sucesso', resposta: resposta('a') });
    s = reducerConsulta(s, { tipo: 'limpar' });
    expect(s.consulta.origem).toBeNull();
    expect(s.busca).toEqual({ status: 'ocioso' });
    expect(s.rotaSelecionadaId).toBeNull();
  });

  it('planejarVolta inverte os pontos e descarta a resposta da ida', () => {
    let s = reducerConsulta(estadoInicial(), { tipo: 'definirOrigem', ponto: A });
    s = reducerConsulta(s, { tipo: 'definirDestino', ponto: B });
    s = reducerConsulta(s, { tipo: 'sucesso', resposta: resposta('a') });
    s = reducerConsulta(s, { tipo: 'planejarVolta' });
    expect(s.consulta).toMatchObject({ origem: B, destino: A, sentido: 'volta' });
    expect(s.busca).toEqual({ status: 'ocioso' });
    expect(s.rotaSelecionadaId).toBeNull();
  });
});

describe('validarConsulta', () => {
  it('consulta válida não tem problemas', () => {
    expect(validarConsulta(valida())).toEqual([]);
  });

  it('ORIGEM_AUSENTE', () => {
    expect(validarConsulta({ ...valida(), origem: null })).toEqual(['ORIGEM_AUSENTE']);
  });

  it('DESTINO_AUSENTE', () => {
    expect(validarConsulta({ ...valida(), destino: null })).toEqual(['DESTINO_AUSENTE']);
  });

  it('ponto com coordenada não numérica conta como ausente', () => {
    expect(validarConsulta({ ...valida(), origem: { lat: NaN, lon: 1 } })).toEqual([
      'ORIGEM_AUSENTE',
    ]);
  });

  it('ORIGEM_IGUAL_DESTINO', () => {
    expect(validarConsulta({ ...valida(), destino: { ...A } })).toEqual(['ORIGEM_IGUAL_DESTINO']);
  });

  it('SAIDA_INVALIDA: texto qualquer, data inexistente e ISO sem fuso', () => {
    for (const saida of ['', 'amanhã', '2026-13-45T25:00:00-03:00', '2026-11-13T23:00:00']) {
      expect(validarConsulta({ ...valida(), saida })).toEqual(['SAIDA_INVALIDA']);
    }
  });

  it('aceita saída em UTC (Z)', () => {
    expect(validarConsulta({ ...valida(), saida: '2026-11-13T23:00:00Z' })).toEqual([]);
  });

  it('padrão do ponto de extensão aceita qualquer ponto', () => {
    expect(validarConsulta({ ...valida(), origem: { lat: 80, lon: 170 } })).toEqual([]);
  });

  it('FORA_DA_AREA vem da função injetada, para origem ou destino', () => {
    const dentroDoMunicipio = (p: { lat: number }) => p.lat !== 3;
    expect(validarConsulta(valida(), { dentroDoMunicipio })).toEqual(['FORA_DA_AREA']);
    expect(
      validarConsulta({ ...valida(), destino: { lat: 5, lon: 6 } }, { dentroDoMunicipio }),
    ).toEqual([]);
  });

  it('acumula problemas e não lança exceção com função injetada defeituosa', () => {
    const c: Consulta = { origem: null, destino: null, saida: 'x', sentido: 'ida' };
    expect(validarConsulta(c)).toEqual(['ORIGEM_AUSENTE', 'DESTINO_AUSENTE', 'SAIDA_INVALIDA']);
    const quebrada = () => {
      throw new Error('falha');
    };
    expect(() => validarConsulta(valida(), { dentroDoMunicipio: quebrada })).not.toThrow();
  });
});

describe('planejarVolta', () => {
  it('inverte origem e destino, troca o sentido e mantém o resto', () => {
    const entrada = valida();
    const v = planejarVolta(entrada);
    expect(v).toEqual({ origem: B, destino: A, saida: SAIDA, sentido: 'volta' });
  });

  it('não muta a entrada', () => {
    const entrada = Object.freeze(valida());
    planejarVolta(entrada);
    expect(entrada).toEqual(valida());
  });

  it('com pontos ausentes inverte os vazios', () => {
    const v = planejarVolta({ origem: A, destino: null, saida: SAIDA, sentido: 'ida' });
    expect(v.origem).toBeNull();
    expect(v.destino).toEqual(A);
  });
});
