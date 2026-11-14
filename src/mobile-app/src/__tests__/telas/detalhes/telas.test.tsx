import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import DetalhesRota from '@/app/(app)/resultado/[rotaId]';
import PorQueEstaRota from '@/app/(app)/por-que/[rotaId]/[trechoId]';
import { useConsulta, type ValorConsulta } from '@/consulta';
import type { RespostaConsulta } from '@/services';
import { conclusivo, insuficiente_amostra, insuficiente_cobertura, insuficiente_largura, mistos, nao_aplicavel, sem_diferenca } from '@/services/fixtures';
import { textos } from '@/textos';
import { hipotesesDetalhes as h } from '@/textos/hipotesesDetalhes';

let mockParams: { rotaId?: string; trechoId?: string } = {};
let mockRedirect = '';
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  Redirect: ({ href }: { href: string }) => { mockRedirect = href; return null; },
  router: { push: (...args: unknown[]) => mockPush(...args), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/consulta', () => ({ useConsulta: jest.fn() }));
jest.mock('@/components/mapa', () => ({ MapaResultado: () => null }));
const consulta = jest.mocked(useConsulta);

function preparar(resposta: RespostaConsulta | null = conclusivo, rotaId = 'rota_1', trechoId = 'trecho_1_1') {
  mockParams = { rotaId, trechoId };
  consulta.mockReturnValue({
    resposta,
    estado: { consulta: { sentido: 'ida' } },
    planejarVolta: jest.fn(),
  } as unknown as ValorConsulta);
}

afterEach(() => { jest.clearAllMocks(); mockRedirect = ''; });

describe('TL-08 Detalhes da rota', () => {
  it('ordena trechos e mostra embarque, desembarque e selo de exemplo', async () => {
    const rota = conclusivo.rotas[0];
    preparar({ ...conclusivo, rotas: [{ ...rota, trechos: [...rota.trechos].reverse() }] });
    await render(<DetalhesRota />);
    expect(screen.getByText(textos.comuns.exemplo)).toBeTruthy();
    const resumos = screen.getAllByRole('button', { name: /^Trecho \d de 2/ });
    expect(resumos[0].props.accessibilityLabel).toMatch(/^Trecho 1 de 2/);
    expect(resumos[1].props.accessibilityLabel).toMatch(/^Trecho 2 de 2/);
    expect(screen.getByText(/Parada Exemplo A/)).toBeTruthy();
    expect(screen.getByText('Desembarque · Parada Exemplo B')).toBeTruthy();
  });

  it('abre TL-09 só para trechos a pé com os ids reais', async () => {
    preparar();
    await render(<DetalhesRota />);
    expect(screen.getAllByRole('button', { name: h.porQueAcessivel(1) })).toHaveLength(1);
    await fireEvent.press(screen.getByRole('button', { name: h.porQueAcessivel(1) }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/por-que/[rotaId]/[trechoId]', params: { rotaId: 'rota_1', trechoId: 'trecho_1_1' } });
  });

  it('marca o trecho selecionado na lista, sem depender do mapa', async () => {
    preparar();
    await render(<DetalhesRota />);
    const trecho = screen.getByRole('button', { name: /^Trecho 1 de 2/ });
    await fireEvent.press(trecho);
    expect(trecho.props.accessibilityState.selected).toBe(true);
    expect(screen.getByText(h.trechoNumerado(1, 2))).toBeTruthy();
  });

  it('não oferece explicação quando L é zero; oferece dados e não compartilhamento', async () => {
    preparar(nao_aplicavel, 'rota_2');
    await render(<DetalhesRota />);
    expect(screen.queryByRole('button', { name: /Por que esta rota\?/ })).toBeNull();
    expect(screen.getByText(textos.resultado.detalhes.semTrechoAPe)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: /Dados: / }));
    expect(mockPush).toHaveBeenCalledWith('/sobre-os-dados');
    await fireEvent.press(screen.getByRole('button', { name: textos.porQue.linkConsiderados }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/dados-considerados', params: { rotaId: 'rota_2' } });
    expect(screen.queryByText(textos.compartilhar.titulo)).toBeNull();
  });

  it('redireciona sem resposta ou rota válida', async () => {
    preparar(null);
    await render(<DetalhesRota />);
    expect(mockRedirect).toBe('/planejar');
    preparar(conclusivo, 'ausente');
    await render(<DetalhesRota />);
    expect(mockRedirect).toBe('/planejar');
  });
});

describe('TL-09 Por que esta rota?', () => {
  it.each([
    [conclusivo, textos.porQue.indicativo.conclusivoComFoco],
    [sem_diferenca, textos.porQue.indicativo.semDiferenca],
    [mistos, textos.porQue.indicativo.semDiferenca],
    [insuficiente_amostra, textos.porQue.indicativo.insuficiente(textos.porQue.motivo.amostra)],
    [insuficiente_cobertura, textos.porQue.indicativo.insuficiente(textos.porQue.motivo.cobertura)],
    [insuficiente_largura, textos.porQue.indicativo.insuficiente(textos.porQue.motivo.largura)],
    [nao_aplicavel, textos.porQue.indicativo.naoAplicavel],
  ])('mostra o indicativo recebido', async (resposta, esperado) => {
    preparar(resposta);
    await render(<PorQueEstaRota />);
    expect(screen.getByLabelText(esperado)).toBeTruthy();
  });

  it('explica o trecho e mostra números da alternativa inteira, faixa e exemplo', async () => {
    preparar();
    await render(<PorQueEstaRota />);
    expect(screen.getByText(textos.porQue.conta)).toBeTruthy();
    expect(screen.getByText(textos.porQue.faixa(textos.modos.faixa.noite))).toBeTruthy();
    expect(screen.getByLabelText(`${textos.porQue.registros}: 4`)).toBeTruthy();
    expect(screen.getByLabelText(`${textos.porQue.km}: 1`)).toBeTruthy();
    expect(screen.getByLabelText(`${textos.porQue.porKm}: 4`)).toBeTruthy();
    expect(screen.getByText(textos.comuns.exemplo)).toBeTruthy();
    await fireEvent.press(screen.getByRole('link', { name: textos.porQue.linkSobre }));
    await fireEvent.press(screen.getByRole('link', { name: textos.porQue.linkConsiderados }));
    expect(mockPush).toHaveBeenCalledWith('/sobre-os-dados');
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/dados-considerados', params: { rotaId: 'rota_1' } });
  });

  it('não converte nulo em zero e mostra outra opção conclusiva', async () => {
    const rota = conclusivo.rotas[0];
    preparar({ ...conclusivo, rotas: [{ ...rota, exposicao: { ...rota.exposicao, registros: null, registrosPorKm: null, cobertura: null } }, conclusivo.rotas[1]] });
    await render(<PorQueEstaRota />);
    expect(screen.getByLabelText(`${textos.porQue.registros}: ${textos.dadosConsiderados.insuficiente}`)).toBeTruthy();
    expect(screen.queryByLabelText(`${textos.porQue.registros}: 0`)).toBeNull();
    preparar(conclusivo, 'rota_2', 'trecho_2_1');
    await render(<PorQueEstaRota />);
    expect(screen.getByText(textos.porQue.indicativo.conclusivoSemFoco(textos.modos.foco.menorExposicaoCompleto))).toBeTruthy();
  });

  it('separa cobertura dos números, explica faixa ausente e permite fechar o modal', async () => {
    const rota = conclusivo.rotas[0];
    preparar({ ...conclusivo, rotas: [{ ...rota, trechos: rota.trechos.map((trecho) => ({ ...trecho, faixaDoDia: null })), exposicao: { ...rota.exposicao, cobertura: null } }, conclusivo.rotas[1]] });
    await render(<PorQueEstaRota />);
    expect(screen.getByText(h.faixaAusente)).toBeTruthy();
    expect(screen.getByText(h.qualidadeDados)).toBeTruthy();
    expect(screen.getByLabelText(`${textos.porQue.cobertura}: ${textos.dadosConsiderados.insuficiente}`)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: h.fecharExplicacao }));
    expect(jest.requireMock<{ router: { back: ReturnType<typeof jest.fn> } }>('expo-router').router.back).toHaveBeenCalledTimes(1);
  });

  it('redireciona sem resposta, rota ou trecho a pé válido', async () => {
    preparar(null);
    await render(<PorQueEstaRota />);
    expect(mockRedirect).toBe('/planejar');
    preparar(conclusivo, 'ausente');
    await render(<PorQueEstaRota />);
    expect(mockRedirect).toBe('/planejar');
    preparar(conclusivo, 'rota_1', 'trecho_1_2');
    await render(<PorQueEstaRota />);
    expect(mockRedirect).toBe('/planejar');
  });
});
