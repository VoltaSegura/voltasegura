import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import PorQueEstaRota from '@/app/(app)/por-que/[rotaId]/[trechoId]';
import Resultado from '@/app/(app)/resultado';
import SobreOsDados from '@/app/(app)/sobre-os-dados';
import { useConsulta, type ValorConsulta } from '@/consulta';
import type { RespostaConsulta } from '@/services';
import { conclusivo, mistos } from '@/services/fixtures';
import { textos } from '@/textos';
import { hipotesesPrioridade } from '@/textos/hipotesesPrioridade';

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

/**
 * B-59 (D-33): caso MISTOS (sem diferença estatística) em que a 1ª rota foi desenhada pelos dados e tem
 * menos registros: destaque com confiança pequena. Dados da fixture `mistos` (EXEMPLO).
 */
const pequena: RespostaConsulta = {
  ...mistos,
  rotas: mistos.rotas.map((rota, i) => (i === 0
    ? { ...rota, focos: [...rota.focos.filter((f) => f !== 'OUTRA_OPCAO'), 'MENOR_EXPOSICAO'], destaqueExposicao: { confianca: 'pequena' }, variante: { deRotaId: mistos.rotas[1].id, origem: 'dados' } }
    : rota)),
};
const clara: RespostaConsulta = {
  ...conclusivo,
  rotas: conclusivo.rotas.map((rota, i) => (i === 0 ? { ...rota, destaqueExposicao: { confianca: 'clara' } } : rota)),
};

function preparar(resposta: RespostaConsulta, rotaIndice = 0) {
  const rota = resposta.rotas[rotaIndice];
  mockParams = { rotaId: rota.id, trechoId: rota.trechos.find((t) => t.modo === 'A_PE')?.id };
  consulta.mockReturnValue({
    resposta,
    estado: { consulta: { sentido: 'volta', saida: '2026-11-13T23:00:00-03:00' } },
    rotaSelecionadaId: resposta.rotas[0].id,
    selecionarRota: jest.fn(), planejarVolta: jest.fn(), inverterPontos: jest.fn(), definirSentido: jest.fn(),
  } as unknown as ValorConsulta);
}
afterEach(() => { jest.clearAllMocks(); });

describe('B-59 · prioridade dos dados com confiança', () => {
  it('resultado: destaque + "diferença pequena" + caminho escolhido pelos registros, e a frase não nega a comparação', async () => {
    preparar(pequena);
    await render(<Resultado />);
    expect(screen.getByLabelText(textos.modos.foco.menorExposicao)).toBeTruthy();
    expect(screen.getByTestId('confianca-destaque')).toBeTruthy();
    expect(screen.getByText(hipotesesPrioridade.confianca.pequena)).toBeTruthy();
    expect(screen.getByText(hipotesesPrioridade.rotaDosDados)).toBeTruthy();
    expect(screen.getByTestId('texto-caso')).toHaveTextContent(hipotesesPrioridade.casoPequena);
    expect(screen.queryByText(textos.casosResultado.mistos)).toBeNull();
  });

  it('resultado: CONCLUSIVO mostra "diferença clara"', async () => {
    preparar(clara);
    await render(<Resultado />);
    expect(screen.getByText(hipotesesPrioridade.confianca.clara)).toBeTruthy();
  });

  it('por que esta rota: a destacada explica a diferença pequena; a outra aponta para ela', async () => {
    preparar(pequena, 0);
    await render(<PorQueEstaRota />);
    expect(screen.getByLabelText(hipotesesPrioridade.indicativoComFocoPequena)).toBeTruthy();
    preparar(pequena, 1);
    await render(<PorQueEstaRota />);
    expect(screen.getByLabelText(hipotesesPrioridade.indicativoSemFocoPequena('Opção 1'))).toBeTruthy();
  });

  it('sobre os dados: situação com diferença pequena', async () => {
    preparar(pequena);
    await render(<SobreOsDados />);
    expect(screen.getByText(`Opção 1: ${hipotesesPrioridade.indicativoComFocoPequena}`)).toBeTruthy();
  });

  it('textos neutros (docs/05)', () => {
    const todos = JSON.stringify(hipotesesPrioridade) + hipotesesPrioridade.indicativoSemFocoPequena('Opção 2');
    expect(todos).not.toMatch(/segur|perig|risco|evit/i);
  });
});
