import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import Resultado from '@/app/(app)/resultado';
import DetalhesRota from '@/app/(app)/resultado/[rotaId]';
import { useConsulta, type ValorConsulta } from '@/consulta';
import type { RespostaConsulta } from '@/services';
import { conclusivo, mistos } from '@/services/fixtures';
import { textos } from '@/textos';
import { hipotesesResultado } from '@/textos/hipotesesResultado';

let mockParams: { rotaId?: string } = {};
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

/**
 * B-58: a vencedora do CONCLUSIVO é uma variação de caminhada gerada pelo app a partir da outra opção.
 * Dados da fixture `conclusivo` (EXEMPLO); só se marca a 1ª rota como variante da 2ª.
 */
const comVariante = (r: RespostaConsulta): RespostaConsulta => ({
  ...r,
  rotas: r.rotas.map((rota, i) => (i === 0 ? { ...rota, variante: { deRotaId: r.rotas[1].id } } : rota)),
});

function preparar(resposta: RespostaConsulta) {
  mockParams = { rotaId: resposta.rotas[0].id };
  consulta.mockReturnValue({
    resposta,
    estado: { consulta: { sentido: 'volta', saida: '2026-11-13T23:00:00-03:00' } },
    rotaSelecionadaId: resposta.rotas[0].id,
    selecionarRota: jest.fn(), planejarVolta: jest.fn(), inverterPontos: jest.fn(), definirSentido: jest.fn(),
  } as unknown as ValorConsulta);
}
afterEach(() => { jest.clearAllMocks(); });

describe('B-58 · variação de caminhada no resultado', () => {
  it('CONCLUSIVO numa variação: ela vem primeiro, selecionada, com o destaque e o rótulo de variação', async () => {
    const resposta = comVariante(conclusivo);
    preparar(resposta);
    await render(<Resultado />);
    expect(resposta.rotas[0].focos).toContain('MENOR_EXPOSICAO');
    expect(screen.getAllByTestId('rotulo-variante')).toHaveLength(1);
    expect(screen.getByText(hipotesesResultado.varianteCaminhada)).toBeTruthy();
    expect(screen.getByLabelText(textos.modos.foco.menorExposicao)).toBeTruthy();
    // o rótulo acessível do card anuncia que é uma variação
    expect(screen.getByLabelText(new RegExp(`^${hipotesesResultado.varianteCaminhada}\\. Opção 1 de`))).toBeTruthy();
  });

  it('o detalhe da variação mostra o rótulo; rota comum não mostra', async () => {
    preparar(comVariante(conclusivo));
    await render(<DetalhesRota />);
    expect(screen.getByTestId('detalhe-variante')).toBeTruthy();
    preparar(mistos);
    await render(<DetalhesRota />);
    expect(screen.queryByTestId('detalhe-variante')).toBeNull();
  });

  it('o texto da variação é neutro (docs/05): não fala em segurança nem em perigo', () => {
    expect(hipotesesResultado.varianteCaminhada).not.toMatch(/segur|perig|risco|evit/i);
  });
});
