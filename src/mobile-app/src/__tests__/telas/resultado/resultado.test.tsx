import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import Resultado from '@/app/(app)/resultado';
import { useConsulta, type ValorConsulta } from '@/consulta';
import type { RespostaConsulta } from '@/services';
import { conclusivo, sem_diferenca, mistos, insuficiente_amostra, insuficiente_cobertura, insuficiente_largura, nao_aplicavel, uma_rota, outra_opcao, sem_servico, indisponivel } from '@/services/fixtures';
import { textos } from '@/textos';
import { hipotesesEstadosResultado, hipotesesResultado } from '@/textos/hipotesesResultado';

let mockRedirect = '';
const mockPush = jest.fn();
jest.mock('expo-router', () => ({ Stack: { Screen: () => null }, Redirect: ({ href }: { href: string }) => { mockRedirect = href; return null; }, router: { push: (...args: unknown[]) => mockPush(...args) } }));
jest.mock('@/consulta', () => ({ useConsulta: jest.fn() }));
jest.mock('react-native-maps', () => ({ __esModule: true, default: () => null, Polyline: () => null, Marker: () => null }));
const mockConsulta = jest.mocked(useConsulta);
const selecionarRota = jest.fn();
const planejarVolta = jest.fn();
const inverterPontos = jest.fn();
const definirSentido = jest.fn();
function consulta(resposta: RespostaConsulta | null, sentido: 'ida' | 'volta' = 'ida') {
  mockConsulta.mockReturnValue({ estado: { consulta: { sentido, saida: '2026-11-13T23:00:00-03:00' } }, resposta,
    rotaSelecionadaId: resposta?.rotas[0]?.id ?? null, selecionarRota, planejarVolta, inverterPontos, definirSentido } as unknown as ValorConsulta);
}
afterEach(() => { jest.clearAllMocks(); mockRedirect = ''; });

describe('TL-07 Resultado', () => {
  it('conclusivo preserva ordem e foco da resposta, com três exemplos', async () => {
    consulta(conclusivo); await render(<Resultado />);
    expect(screen.getByText(textos.comuns.exposicaoPrimeiro(3))).toBeTruthy();
    expect(screen.getAllByText(textos.comuns.exemplo)).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Opção 1 de 3/ }).props.accessibilityState.selected).toBe(true);
    expect(screen.getByText('Menor exposição estimada')).toBeTruthy();
    expect(screen.queryByText(textos.porQue.indicativo.conclusivoComFoco)).toBeNull();
  });
  it.each([sem_diferenca, mistos])('sem diferença e mistos não criam foco de exposição', async resposta => {
    consulta(resposta); await render(<Resultado />);
    expect(screen.getByText(textos.comuns.ordenadasPorTempo(resposta.rotas.length))).toBeTruthy();
    expect(screen.queryByText('Menor exposição estimada')).toBeNull();
    expect(screen.queryByText(textos.porQue.indicativo.semDiferenca)).toBeNull();
  });
  it.each([insuficiente_amostra, insuficiente_cobertura, insuficiente_largura])('insuficiente mantém dados acessíveis sem foco', async resposta => {
    consulta(resposta); await render(<Resultado />);
    expect(screen.queryByText('Menor exposição estimada')).toBeNull();
    expect(screen.getByRole('button', { name: textos.sobre.titulo })).toBeTruthy();
  });
  it('não aplicável não converte nulo em vantagem', async () => {
    consulta(nao_aplicavel); await render(<Resultado />);
    expect(screen.queryByText('Menor exposição estimada')).toBeNull();
    expect(screen.queryByText(textos.porQue.indicativo.naoAplicavel)).toBeNull();
  });
  it('uma rota não mostra dica de troca', async () => {
    consulta(uma_rota); await render(<Resultado />);
    expect(screen.getByText(textos.comuns.umaOpcao)).toBeTruthy();
    expect(screen.getByText(textos.resultado.soUma)).toBeTruthy();
    expect(screen.queryByText(hipotesesResultado.dicaSelecao)).toBeNull();
  });
  it('outra opção aparece sem duplicar card', async () => {
    consulta(outra_opcao); await render(<Resultado />);
    expect(screen.getByText(textos.modos.foco.outraOpcao)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /Opção \d de 2/ })).toHaveLength(2);
  });
  it.each([[sem_servico, hipotesesEstadosResultado.semServico], [indisponivel, hipotesesEstadosResultado.comparacaoIndisponivel]] as const)('zero rotas não cria mapa ou comparação fictícia', async (resposta, aviso) => {
    consulta(resposta); await render(<Resultado />);
    expect(screen.getByText(aviso)).toBeTruthy();
    expect(screen.queryByTestId('mapa-resultado')).toBeNull();
  });
  it('seleção por card não abre detalhes; botão separado abre', async () => {
    consulta(conclusivo); await render(<Resultado />);
    await fireEvent.press(screen.getByRole('button', { name: /Opção 2 de 3/ }));
    expect(selecionarRota).toHaveBeenCalledWith(conclusivo.rotas[1].id);
    expect(mockPush).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: hipotesesResultado.detalhes(2) }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/resultado/[rotaId]', params: { rotaId: conclusivo.rotas[1].id } });
  });
  it('expansão mantém conteúdo na lista e rodapé fora dela', async () => {
    consulta(conclusivo); await render(<Resultado />);
    const lista = screen.getByTestId('lista-resultado');
    const alturaAntes = StyleSheet.flatten(screen.getByTestId('moldura-mapa-resultado').props.style).height;
    expect(within(lista).getByRole('button', { name: /Opção 1 de 3/ })).toBeTruthy();
    expect(within(lista).queryByRole('button', { name: textos.sobre.titulo })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: textos.resultado.expandir }));
    expect(screen.getByRole('button', { name: hipotesesEstadosResultado.recolher })).toBeTruthy();
    const alturaDepois = StyleSheet.flatten(screen.getByTestId('moldura-mapa-resultado').props.style).height;
    expect(alturaDepois).toBeLessThan(alturaAntes);
    expect(StyleSheet.flatten(screen.getByTestId('painel-resultado').props.style).flexBasis).toBe(0);
    expect(screen.getByRole('button', { name: textos.sobre.titulo })).toBeTruthy();
  });
  it('abre dados e planeja a volta a partir da ida', async () => {
    consulta(conclusivo); await render(<Resultado />);
    await fireEvent.press(screen.getByRole('button', { name: textos.sobre.titulo }));
    expect(mockPush).toHaveBeenCalledWith('/sobre-os-dados');
    await fireEvent.press(screen.getByRole('button', { name: textos.resultado.planejarVolta }));
    expect(planejarVolta).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/planejar?sentido=volta');
  });
  it('planejar a ida usa sentido ida', async () => {
    consulta(conclusivo, 'volta'); await render(<Resultado />);
    await fireEvent.press(screen.getByRole('button', { name: textos.resultado.planejarIda }));
    expect(mockPush).toHaveBeenCalledWith('/planejar?sentido=ida');
    expect(inverterPontos).toHaveBeenCalledTimes(1);
    expect(definirSentido).toHaveBeenCalledWith('ida');
  });
  it('sem resposta redireciona', async () => {
    consulta(null); await render(<Resultado />);
    expect(mockRedirect).toBe('/planejar');
  });
});
