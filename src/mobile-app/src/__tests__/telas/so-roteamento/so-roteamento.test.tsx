import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import DadosConsiderados from '@/app/(app)/dados-considerados';
import PorQueEstaRota from '@/app/(app)/por-que/[rotaId]/[trechoId]';
import Resultado from '@/app/(app)/resultado';
import DetalhesRota from '@/app/(app)/resultado/[rotaId]';
import SobreOsDados from '@/app/(app)/sobre-os-dados';
import { focosVisiveis, selosExemplo, soRoteamento } from '@/components/resultado';
import { useConsulta, type ValorConsulta } from '@/consulta';
import type { RespostaConsulta } from '@/services';
import { conclusivo, so_roteamento } from '@/services/fixtures';
import { textos } from '@/textos';
import { hipotesesResultado } from '@/textos/hipotesesResultado';

let mockParams: { rotaId?: string; trechoId?: string } = {};
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  Redirect: () => null,
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/consulta', () => ({ useConsulta: jest.fn() }));
jest.mock('@/components/mapa', () => ({ MapaResultado: () => null }));
jest.mock('react-native-maps', () => ({ __esModule: true, default: () => null, Polyline: () => null, Marker: () => null }));
const consulta = jest.mocked(useConsulta);

function preparar(resposta: RespostaConsulta) {
  mockParams = { rotaId: resposta.rotas[0].id, trechoId: resposta.rotas[0].trechos.find(t => t.modo === 'A_PE')?.id };
  consulta.mockReturnValue({
    resposta,
    estado: { consulta: { sentido: 'ida', saida: '2026-11-13T23:00:00-03:00' } },
    rotaSelecionadaId: resposta.rotas[0].id,
    selecionarRota: jest.fn(), planejarVolta: jest.fn(), inverterPontos: jest.fn(), definirSentido: jest.fn(),
  } as unknown as ValorConsulta);
}
afterEach(() => { jest.clearAllMocks(); });

const foco = textos.modos.foco;
const semNumeros = () => {
  expect(screen.queryByText(textos.dadosConsiderados.insuficiente)).toBeNull();
  expect(screen.queryByText(textos.porQue.registros)).toBeNull();
  expect(screen.queryByText(foco.menorExposicao)).toBeNull();
  expect(screen.queryByText(foco.menorExposicaoCompleto)).toBeNull();
  expect(screen.queryByText('◆')).toBeNull();
};

describe('B-08 · só roteamento (fixture so_roteamento)', () => {
  it('a fixture satisfaz o contrato: campos null, INDISPONIVEL, sem foco de exposição', () => {
    expect(so_roteamento.caso).toBe('INDISPONIVEL');
    expect(so_roteamento.fontes.exposicao).toBe('indisponivel');
    expect(so_roteamento.rotas.length).toBeGreaterThan(0);
    for (const rota of so_roteamento.rotas) {
      expect(rota.exposicao.registros).toBeNull();
      expect(rota.focos).not.toContain('MENOR_EXPOSICAO');
    }
  });

  it('soRoteamento reconhece cada sinal isolado', () => {
    expect(soRoteamento(so_roteamento)).toBe(true);
    expect(soRoteamento({ ...conclusivo, fontes: { roteamento: 'exemplo', exposicao: 'indisponivel' } })).toBe(true);
    expect(soRoteamento({ ...conclusivo, caso: 'INDISPONIVEL' })).toBe(true);
    expect(soRoteamento(conclusivo)).toBe(false);
  });

  it('selo EXEMPLO segue fontes.* por bloco, não o booleano exemplo', () => {
    expect(selosExemplo(conclusivo)).toEqual({ roteamento: true, exposicao: true });
    expect(selosExemplo(so_roteamento)).toEqual({ roteamento: true, exposicao: false });
    expect(selosExemplo({ ...conclusivo, fontes: { roteamento: 'otp2', exposicao: 'exemplo' } })).toEqual({ roteamento: false, exposicao: true });
    expect(selosExemplo({ ...conclusivo, fontes: { roteamento: 'otp2', exposicao: 'ssp' } })).toEqual({ roteamento: false, exposicao: false });
  });

  it('focosVisiveis descarta o foco de exposição sem exposição', () => {
    expect(focosVisiveis(['MENOR_EXPOSICAO', 'MENOR_TEMPO'], so_roteamento)).toEqual(['MENOR_TEMPO']);
    expect(focosVisiveis(['MENOR_EXPOSICAO'], conclusivo)).toEqual(['MENOR_EXPOSICAO']);
  });

  it('resultado: aviso "Só roteamento", sem foco de exposição nem ordem por exposição', async () => {
    preparar(so_roteamento);
    await render(<Resultado />);
    expect(screen.getByTestId('aviso-so-roteamento')).toBeTruthy();
    expect(screen.getByText(textos.soRoteamento.linhaDados)).toBeTruthy();
    expect(screen.queryByText(hipotesesResultado.exposicaoPrimeiro)).toBeNull();
    semNumeros();
  });

  it('resultado: foco de exposição residual na resposta não aparece', async () => {
    const residual: RespostaConsulta = { ...so_roteamento, rotas: so_roteamento.rotas.map((r, i) => i === 0 ? { ...r, focos: [...r.focos, 'MENOR_EXPOSICAO' as const] } : r) };
    preparar(residual);
    await render(<Resultado />);
    semNumeros();
    expect(screen.queryByText(hipotesesResultado.exposicaoPrimeiro)).toBeNull();
  });

  it('resultado: o selo EXEMPLO continua pelo bloco de roteamento (fixtures de exemplo)', async () => {
    preparar(so_roteamento);
    await render(<Resultado />);
    expect(screen.getAllByText(textos.comuns.exemplo)).toHaveLength(so_roteamento.rotas.length);
  });

  it('resultado: roteamento real sem exposição não mostra selo EXEMPLO', async () => {
    preparar({ ...so_roteamento, exemplo: false, fontes: { roteamento: 'otp2', exposicao: 'indisponivel' } });
    await render(<Resultado />);
    expect(screen.queryByText(textos.comuns.exemplo)).toBeNull();
    expect(screen.getByTestId('aviso-so-roteamento')).toBeTruthy();
  });

  it('resultado: roteamento real com exposição de exemplo só marca EXEMPLO onde há foco de exposição', async () => {
    preparar({ ...conclusivo, exemplo: true, fontes: { roteamento: 'otp2', exposicao: 'exemplo' } });
    await render(<Resultado />);
    const comFoco = conclusivo.rotas.filter(r => r.focos.includes('MENOR_EXPOSICAO')).length;
    expect(screen.getAllByText(textos.comuns.exemplo)).toHaveLength(comFoco);
  });

  it('detalhes: sem foco, sem "Por que esta rota?" e sem link de dados considerados', async () => {
    preparar(so_roteamento);
    await render(<DetalhesRota />);
    expect(screen.getByTestId('aviso-so-roteamento')).toBeTruthy();
    expect(screen.queryByText(textos.porQue.linkConsiderados)).toBeNull();
    expect(screen.queryByText(textos.resultado.detalhes.semTrechoAPe)).toBeNull();
    semNumeros();
  });

  it('por que esta rota (acesso direto): só o aviso, sem tabelas, cobertura ou zero', async () => {
    preparar(so_roteamento);
    await render(<PorQueEstaRota />);
    expect(screen.getByText(textos.soRoteamento.porQue)).toBeTruthy();
    expect(screen.queryByText(textos.porQue.cobertura)).toBeNull();
    expect(screen.queryByText(textos.porQue.km)).toBeNull();
    semNumeros();
  });

  it('dados considerados: aviso no lugar de totais, sem "Dados insuficientes" nem zero', async () => {
    preparar(so_roteamento);
    await render(<DadosConsiderados />);
    expect(screen.getByText(textos.soRoteamento.dadosConsiderados)).toBeTruthy();
    expect(screen.queryByText(textos.dadosConsiderados.furto)).toBeNull();
    expect(screen.queryByText(textos.dadosConsiderados.panoramaLink)).toBeNull();
    expect(screen.queryByText(textos.comuns.exemplo)).toBeNull();
    semNumeros();
  });

  it('sobre os dados: exposição indisponível, sem período, sem cobertura, selo só do roteamento', async () => {
    preparar(so_roteamento);
    await render(<SobreOsDados />);
    expect(screen.getByText(textos.soRoteamento.sobreExplica)).toBeTruthy();
    expect(screen.queryByText(textos.sobre.coberturaTitulo)).toBeNull();
    expect(screen.queryByText(textos.sobre.situacaoTitulo)).toBeNull();
    expect(screen.getAllByText(textos.comuns.exemplo)).toHaveLength(1);
    semNumeros();
  });

  it('sobre os dados: exposição real e roteamento de exemplo põem o selo só no roteamento', async () => {
    preparar({ ...conclusivo, fontes: { roteamento: 'exemplo', exposicao: 'ssp' } });
    await render(<SobreOsDados />);
    expect(screen.getAllByText(textos.comuns.exemplo)).toHaveLength(1);
    expect(screen.getByText(textos.sobre.coberturaTitulo)).toBeTruthy();
  });

  it('sobre os dados: ambos de exemplo mostram um selo só', async () => {
    preparar(conclusivo);
    await render(<SobreOsDados />);
    expect(screen.getAllByText(textos.comuns.exemplo)).toHaveLength(1);
  });
});
