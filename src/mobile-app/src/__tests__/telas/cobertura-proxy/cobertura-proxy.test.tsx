import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import DadosConsiderados from '@/app/(app)/dados-considerados';
import PorQueEstaRota from '@/app/(app)/por-que/[rotaId]/[trechoId]';
import Resultado from '@/app/(app)/resultado';
import SobreOsDados from '@/app/(app)/sobre-os-dados';
import { coberturaPorProxy, textoCaso } from '@/components/resultado';
import { useConsulta, type ValorConsulta } from '@/consulta';
import type { RespostaConsulta } from '@/services';
import { conclusivo, insuficiente_amostra, mistos, nao_aplicavel, sem_diferenca, so_roteamento, uma_rota } from '@/services/fixtures';
import { textos } from '@/textos';

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

const ssp = (r: RespostaConsulta): RespostaConsulta => ({ ...r, fontes: { roteamento: 'otp2', exposicao: 'ssp' } });
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
const aviso = textos.coberturaProxy.aviso;

describe('B-53 · aviso de cobertura por proxy', () => {
  it('coberturaPorProxy só vale com exposição real (ssp) e fora de só roteamento', () => {
    expect(coberturaPorProxy(ssp(conclusivo))).toBe(true);
    expect(coberturaPorProxy(conclusivo)).toBe(false);
    expect(coberturaPorProxy(so_roteamento)).toBe(false);
    expect(coberturaPorProxy({ ...ssp(conclusivo), caso: 'INDISPONIVEL' })).toBe(false);
  });

  it('o texto é neutro e diz que está em validação', () => {
    expect(aviso).toMatch(/estimada pelos pontos dos boletins/);
    expect(aviso).toMatch(/Recurso em validação/);
  });

  const telas = [['Sobre os dados', SobreOsDados], ['Dados considerados', DadosConsiderados], ['Por que esta rota?', PorQueEstaRota]] as const;

  it.each(telas)('aparece em %s com fonte ssp', async (_nome, Tela) => {
    preparar(ssp(conclusivo));
    await render(<Tela />);
    expect(screen.getByText(aviso)).toBeTruthy();
  });

  it.each(telas)('não aparece em %s com fonte exemplo', async (_nome, Tela) => {
    preparar(conclusivo);
    await render(<Tela />);
    expect(screen.queryByText(aviso)).toBeNull();
  });

  it.each(telas)('não aparece em %s em só roteamento', async (_nome, Tela) => {
    preparar(so_roteamento);
    await render(<Tela />);
    expect(screen.queryByText(aviso)).toBeNull();
  });
});

describe('B-53 · texto próprio por caso no resultado', () => {
  const casos = [
    [sem_diferenca, textos.casosResultado.semDiferenca],
    [mistos, textos.casosResultado.mistos],
    [insuficiente_amostra, textos.casosResultado.insuficiente],
    [nao_aplicavel, textos.casosResultado.naoAplicavel],
  ] as const;

  it.each(casos)('mostra o texto do caso %#', async (resposta, texto) => {
    expect(resposta.rotas.length).toBeGreaterThan(1);
    preparar(ssp(resposta)); await render(<Resultado />);
    expect(screen.getByText(texto)).toBeTruthy();
  });

  it('SEM_DIFERENCA usa a frase honesta e não destaca rota', async () => {
    expect(textos.casosResultado.semDiferenca).toBe('Com os dados registrados, não há diferença clara de exposição estimada entre as opções.');
    expect(textoCaso(sem_diferenca)).toBe(textos.casosResultado.semDiferenca);
  });

  it('sem texto de caso em CONCLUSIVO, opção única e só roteamento', () => {
    expect(textoCaso(conclusivo)).toBeNull();
    expect(textoCaso(uma_rota)).toBeNull();
    expect(textoCaso(so_roteamento)).toBeNull();
  });

  it('os textos novos não usam termos proibidos', () => {
    const todos = [aviso, ...Object.values(textos.casosResultado)].join(' ');
    expect(todos).not.toMatch(/seguran|perigos|risco|zona vermelha|nota/i);
  });
});
