/**
 * Regressões achadas ao percorrer o app no navegador (14/11/2026):
 * erro de origem/destino que não some, "◆" duplicado, "A pé A pé", quilometragem sem unidade.
 */
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import DetalhesRota from '@/app/(app)/resultado/[rotaId]';
import Planejar from '@/app/(app)/planejar';
import { RotuloFoco, SequenciaModos } from '@/components/resultado';
import { useConsulta, type Consulta, type ValorConsulta } from '@/consulta';
import { conclusivo } from '@/services/fixtures';
import { textos } from '@/textos';

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  Redirect: () => null,
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ rotaId: 'rota_1' }),
}));
jest.mock('@/locais', () => jest.requireActual<typeof import('@/test-utils/locais')>('@/test-utils/locais').moduloLocais);
jest.mock('@/consulta', () => ({
  ...jest.requireActual<typeof import('@/consulta')>('@/consulta'),
  useConsulta: jest.fn(),
}));
jest.mock('@/components/mapa', () => ({ MapaResultado: () => null }));

const consultaMock = jest.mocked(useConsulta);
const ponto = { lat: -23.5, lon: -46.6 };
const base: Consulta = { origem: null, destino: null, saida: '2026-11-14T23:00:00-03:00', sentido: 'ida' };

function estado(consulta: Consulta) {
  consultaMock.mockReturnValue({
    estado: { consulta, busca: { status: 'ocioso' }, rotaSelecionadaId: null },
    resposta: conclusivo,
    definirOrigem: jest.fn(),
    definirDestino: jest.fn(),
    definirSentido: jest.fn(),
    definirSaida: jest.fn(),
    buscar: jest.fn(),
    planejarVolta: jest.fn(),
  } as unknown as ValorConsulta);
}

afterEach(() => { jest.clearAllMocks(); });

describe('TL-04: o aviso de origem e destino some quando o ponto é escolhido', () => {
  it('mostra o erro sem pontos e o remove quando a consulta passa a ter origem e destino', async () => {
    estado(base);
    const tela = await render(<Planejar />);
    await fireEvent.press(screen.getByRole('button', { name: textos.planejar.verAlternativas }));
    expect(screen.getByText(textos.planejar.erroOrigem)).toBeTruthy();
    expect(screen.getByText(textos.planejar.erroDestino)).toBeTruthy();

    estado({ ...base, origem: ponto, destino: { lat: -23.6, lon: -46.7 } });
    await tela.rerender(<Planejar />);

    expect(screen.queryByText(textos.planejar.erroOrigem)).toBeNull();
    expect(screen.queryByText(textos.planejar.erroDestino)).toBeNull();
  });
});

describe('RotuloFoco: um só "◆" no destaque', () => {
  it('não duplica o losango quando o texto do catálogo já o traz', async () => {
    await render(<RotuloFoco foco="MENOR_EXPOSICAO" rotulo={textos.modos.foco.menorExposicao} />);
    expect(screen.getAllByText('◆')).toHaveLength(1);
    expect(screen.getByText('Menor exposição estimada')).toBeTruthy();
  });

  it('continua mostrando um "◆" quando o texto vem sem ele', async () => {
    await render(<RotuloFoco foco="MENOR_EXPOSICAO" rotulo={textos.modos.foco.menorExposicaoCompleto} />);
    expect(screen.getAllByText('◆')).toHaveLength(1);
  });

  it('foco comum não ganha losango', async () => {
    await render(<RotuloFoco foco="MENOR_TEMPO" rotulo={textos.modos.foco.menorTempo} />);
    expect(screen.queryByText('◆')).toBeNull();
  });
});

describe('SequenciaModos: "A pé" aparece uma vez por trecho a pé', () => {
  it('mostra só "A pé 35 min" no trecho a pé', async () => {
    const trechos = conclusivo.rotas[0].trechos;
    await render(
      <SequenciaModos
        trechos={trechos}
        rotulos={{ A_PE: textos.modos.modo.aPe, ONIBUS: textos.modos.modo.onibus, METRO: textos.modos.modo.metro, TREM: textos.modos.modo.trem }}
        rotuloAPe={(min) => `${textos.modos.modo.aPe} ${min} min`}
        rotuloLinha={(t) => t.linha ?? ''}
        rotuloAcessivel="sequência"
      />,
    );
    expect(screen.queryByText('A pé')).toBeNull();
    expect(screen.getByText('A pé 35 min')).toBeTruthy();
    expect(screen.getByText(textos.modos.modo.onibus)).toBeTruthy();
  });
});

describe('TL-08: a quilometragem a pé leva a unidade', () => {
  it('mostra "1 km a pé" (ou "m a pé") no resumo, e nunca só o número', async () => {
    estado(base);
    await render(<DetalhesRota />);
    expect(screen.getByText(/40 min · .*(km|m) a pé · /)).toBeTruthy();
  });

  it('mostra o período no mesmo formato da TL-07', async () => {
    estado(base);
    await render(<DetalhesRota />);
    expect(screen.getAllByText(/jan-set\/2026/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/2026-01/)).toBeNull();
  });
});
