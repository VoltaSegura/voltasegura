import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { formatarHora } from '@/components/resultado/formatos';
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
  it('mostra dica apenas na primeira visita da sessão e mantém hora local da home', async () => {
    consulta(conclusivo);
    const tela = await render(<Resultado />);
    expect(screen.getByText(hipotesesResultado.dicaSelecao)).toBeTruthy();
    const horaHome = new Date('2026-11-13T23:00:00-03:00').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    expect(screen.getByText(hipotesesResultado.saida(horaHome))).toBeTruthy();
    // Item 6 (T25-B): o horário de saída saiu do cartão; a hora fica só no cabeçalho da folha.
    expect(screen.queryAllByText(textos.resultado.saidaPrevista(formatarHora(conclusivo.rotas[0].saidaPrevista)))).toHaveLength(0);
    await tela.unmount();
    await render(<Resultado />);
    expect(screen.queryByText(hipotesesResultado.dicaSelecao)).toBeNull();
  });
  it('conclusivo preserva ordem e foco da resposta, com três exemplos', async () => {
    consulta(conclusivo); await render(<Resultado />);
    expect(screen.getByText(hipotesesResultado.opcoes(3))).toBeTruthy();
    expect(screen.getAllByText(textos.comuns.exemplo)).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Opção 1 de 3/ }).props.accessibilityState.selected).toBe(true);
    expect(screen.getByText('Menor exposição estimada')).toBeTruthy();
    expect(screen.getByText(hipotesesResultado.exposicaoPrimeiro)).toBeTruthy();
    expect(screen.queryByText(textos.porQue.indicativo.conclusivoComFoco)).toBeNull();
  });
  it('mostra tempo, trocas, caminhada e foco só com a folha recolhida e acompanha a seleção', async () => {
    consulta(conclusivo);
    const tela = await render(<Resultado />);
    // Item 6: a folha abre no nível médio, então o resumo só aparece depois de recolher (nível 0).
    expect(screen.queryByTestId('resumo-recolhido')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: textos.resultado.expandir }));
    await fireEvent.press(screen.getByRole('button', { name: hipotesesEstadosResultado.recolher }));
    const resumo = screen.getByTestId('resumo-recolhido');
    expect(resumo.props.children).toBe('40 min · 1 troca · 1,0 km a pé · Menor exposição estimada');
    expect(resumo.props.accessibilityLabel).toBe(resumo.props.children);
    mockConsulta.mockReturnValue({ ...(mockConsulta.mock.results[0].value as ValorConsulta), rotaSelecionadaId: conclusivo.rotas[1].id } as ValorConsulta);
    await tela.rerender(<Resultado />);
    expect(screen.getByTestId('resumo-recolhido').props.children).toContain('Menor tempo');
    // Nível 0 → 1 (meia) → 2 (cheia, rótulo "Recolher lista") → 0: o resumo só volta no nível 0.
    await fireEvent.press(screen.getByRole('button', { name: textos.resultado.expandir }));
    expect(screen.queryByTestId('resumo-recolhido')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: textos.resultado.expandir }));
    await fireEvent.press(screen.getByRole('button', { name: hipotesesEstadosResultado.recolher }));
    expect(screen.queryByTestId('resumo-recolhido')).not.toBeNull();
  });
  it.each([sem_diferenca, mistos])('sem diferença e mistos não criam foco de exposição', async resposta => {
    consulta(resposta); await render(<Resultado />);
    expect(screen.getByText(hipotesesResultado.opcoes(resposta.rotas.length))).toBeTruthy();
    expect(screen.queryByText('Menor exposição estimada')).toBeNull();
    expect(screen.queryByText(hipotesesResultado.exposicaoPrimeiro)).toBeNull();
    expect(screen.queryByText(textos.porQue.indicativo.semDiferenca)).toBeNull();
  });
  it.each([insuficiente_amostra, insuficiente_cobertura, insuficiente_largura])('insuficiente mantém dados acessíveis sem foco', async resposta => {
    consulta(resposta); await render(<Resultado />);
    expect(screen.queryByText('Menor exposição estimada')).toBeNull();
    expect(screen.queryByText(hipotesesResultado.exposicaoPrimeiro)).toBeNull();
    expect(screen.getByRole('button', { name: textos.sobre.titulo })).toBeTruthy();
  });
  it('não aplicável não converte nulo em vantagem', async () => {
    consulta(nao_aplicavel); await render(<Resultado />);
    expect(screen.queryByText('Menor exposição estimada')).toBeNull();
    expect(screen.queryByText(hipotesesResultado.exposicaoPrimeiro)).toBeNull();
    expect(screen.queryByText(textos.porQue.indicativo.naoAplicavel)).toBeNull();
  });
  it('uma rota não mostra dica de troca', async () => {
    consulta(uma_rota); await render(<Resultado />);
    expect(screen.getByText(hipotesesResultado.opcoes(1))).toBeTruthy();
    expect(screen.getByText(textos.resultado.soUma)).toBeTruthy();
    expect(screen.queryByText(hipotesesResultado.dicaSelecao)).toBeNull();
  });
  it('B-51: uma rota não mostra chips de foco comparativos, só o texto de opção única', async () => {
    consulta(uma_rota); await render(<Resultado />);
    for (const f of Object.values(textos.modos.foco)) expect(screen.queryByText(f)).toBeNull();
    expect(screen.queryByText(hipotesesResultado.exposicaoPrimeiro)).toBeNull();
    expect(screen.getByRole('button', { name: /^Opção 1 de 1\. \d/ })).toBeTruthy();
    expect(screen.getByText(textos.resultado.soUma)).toBeTruthy();
  });
  it('B-51: com 2+ opções os chips de foco continuam', async () => {
    consulta(conclusivo); await render(<Resultado />);
    expect(screen.getAllByText(textos.modos.foco.menorTempo).length).toBeGreaterThan(0);
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
  it('alça abre na meia altura, alterna meia, cheia e recolhida, com rótulos acessíveis', async () => {
    consulta(conclusivo); await render(<Resultado />);
    const lista = screen.getByTestId('lista-resultado');
    const altura = () => StyleSheet.flatten(screen.getByTestId('painel-resultado').props.style).height;
    const textoAlca = () => screen.getByTestId('alca-resultado').props.accessibilityValue.text;
    expect(within(lista).getByRole('button', { name: /Opção 1 de 3/ })).toBeTruthy();
    expect(within(lista).queryByRole('button', { name: textos.sobre.titulo })).toBeNull();
    // Item 6: planejar a volta saiu do resultado.
    expect(within(lista).queryByRole('button', { name: textos.resultado.planejarVolta })).toBeNull();
    // Item 6: a folha começa no nível médio (alturas[1]).
    expect(textoAlca()).toBe(hipotesesResultado.alturas[1]);
    const meia = altura();
    await fireEvent.press(screen.getByRole('button', { name: textos.resultado.expandir }));
    const cheia = altura();
    expect(cheia).toBeGreaterThan(meia);
    expect(textoAlca()).toBe(hipotesesResultado.alturas[2]);
    await fireEvent.press(screen.getByRole('button', { name: hipotesesEstadosResultado.recolher }));
    expect(altura()).toBeLessThan(meia);
    expect(textoAlca()).toBe(hipotesesResultado.alturas[0]);
  });
  it('abre os dados e não oferece planejar a volta no resultado', async () => {
    consulta(conclusivo); await render(<Resultado />);
    await fireEvent.press(screen.getByRole('button', { name: textos.sobre.titulo }));
    expect(mockPush).toHaveBeenCalledWith('/sobre-os-dados');
    expect(screen.queryByRole('button', { name: textos.resultado.planejarVolta })).toBeNull();
    expect(planejarVolta).not.toHaveBeenCalled();
  });
  it('não oferece planejar a ida no resultado de volta', async () => {
    consulta(conclusivo, 'volta'); await render(<Resultado />);
    expect(screen.queryByRole('button', { name: textos.resultado.planejarIda })).toBeNull();
    expect(inverterPontos).not.toHaveBeenCalled();
    expect(definirSentido).not.toHaveBeenCalled();
  });
  it('sem resposta redireciona', async () => {
    consulta(null); await render(<Resultado />);
    expect(mockRedirect).toBe('/planejar');
  });
});
