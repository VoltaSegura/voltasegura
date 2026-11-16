import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { fixtures } from '@/services/fixtures';
import type { Rota, Trecho } from '@/services';
import { textos } from '@/textos';
import { hipotesesResultado } from '@/textos/hipotesesResultado';
import { coresClaro, coresEscuro, toque } from '@/theme/tokens';

import { formatarHora } from './formatos';
import { BotaoPorQue, CardRota, Indicativo, ItemTrecho, LinhaCategoria, LinhaSobreOsDados, PainelResultado, RotuloFoco, SeloLinha, SequenciaModos, TabelaNumeros, type RotulosResultado, type RotulosTrecho } from './index';

let mockEsquema: 'light' | 'dark' = 'dark';
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => mockEsquema }));
afterEach(() => { mockEsquema = 'dark'; });

const t = (trecho: Trecho) => trecho.linha ?? textos.modos.modo.aPe;
const rotulos: RotulosResultado = {
  focos: {
    MENOR_TEMPO: textos.modos.foco.menorTempo,
    MENOS_CAMINHADA: textos.modos.foco.menosCaminhada,
    MENOR_EXPOSICAO: textos.modos.foco.menorExposicao,
    OUTRA_OPCAO: textos.modos.foco.outraOpcao,
  },
  modos: { A_PE: textos.modos.modo.aPe, ONIBUS: textos.modos.modo.onibus, METRO: textos.modos.modo.metro, TREM: textos.modos.modo.trem },
  duracao: n => `${n} min`, caminhada: n => textos.resultado.kmAPe(String(n)),
  trocas: textos.resultado.trocas, saida: s => textos.resultado.saidaPrevista(formatarHora(s)),
  trechoAPe: n => `${textos.modos.modo.aPe} ${n} min`, linha: t,
  card: (rota: Rota, i, n, modos) => textos.resultado.rotuloCard({ i, n, focos: rota.focos.map(f => rotulos.focos[f]).join(', '), duracao: rotulos.duracao(rota.duracaoMin), km: String(rota.caminhadaKm), trocas: rotulos.trocas(rota.trocas), modos }),
  selecionada: textos.resultado.selecionada, dadosInsuficientes: 'Dados insuficientes',
};
const trechoRotulos: RotulosTrecho & { modos: RotulosResultado['modos'] } = {
  modos: rotulos.modos,
  resumo: (trecho, total, modo) => `Trecho ${trecho.ordem} de ${total}, ${modo}`,
  detalhe: (trecho, modo) => textos.resultado.detalhes.trecho({ modo, distancia: String(trecho.distanciaKm), duracao: `${trecho.duracaoMin} min` }),
  embarque: trecho => trecho.embarque,
  desembarque: trecho => trecho.desembarque,
};
const estilo = (value: Parameters<typeof StyleSheet.flatten>[0]) => StyleSheet.flatten(value) ?? {};

describe('resultado', () => {
  it.each([['dark', coresEscuro], ['light', coresClaro]] as const)('foco de exposição é o único preenchido no tema %s', async (tema, cores) => {
    mockEsquema = tema;
    await render(<><RotuloFoco foco="MENOR_EXPOSICAO" rotulo={rotulos.focos.MENOR_EXPOSICAO} /><RotuloFoco foco="MENOR_TEMPO" rotulo={rotulos.focos.MENOR_TEMPO} /></>);
    expect(estilo(screen.getByLabelText(rotulos.focos.MENOR_EXPOSICAO).props.style).backgroundColor).toBe(cores.acao);
    expect(estilo(screen.getByLabelText(rotulos.focos.MENOR_TEMPO).props.style).backgroundColor).toBe('transparent');
    expect(screen.getByText('Menor exposição estimada')).toBeTruthy();
    expect(screen.getAllByText('◆')).toHaveLength(1);
  });

  it('card mostra duração, caminhada, trocas e modos; seleção é texto e estado', async () => {
    const onPress = jest.fn();
    const onAbrirDetalhes = jest.fn();
    const rota = fixtures.conclusivo.rotas[0];
    await render(<CardRota rota={rota} indice={1} total={3} selecionada exemplo rotulos={rotulos} onPress={onPress} onAbrirDetalhes={onAbrirDetalhes} />);
    expect(screen.getByText('40 min')).toBeTruthy();
    expect(screen.getByText(rotulos.caminhada(1))).toBeTruthy();
    expect(screen.getByText(rotulos.trocas(1))).toBeTruthy();
    expect(screen.getByText(rotulos.selecionada)).toBeTruthy();
    const card = screen.getByRole('button', { name: /Opção 1 de 3/ });
    expect(card.props.accessibilityState.selected).toBe(true);
    expect(estilo(card.props.style).minHeight).toBeGreaterThanOrEqual(toque.minimo);
    await fireEvent.press(card);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onAbrirDetalhes).not.toHaveBeenCalled();
    const detalhes = screen.getByRole('button', { name: hipotesesResultado.detalhes(1) });
    expect(estilo(detalhes.props.style).width).toBeGreaterThanOrEqual(toque.minimo);
    await fireEvent.press(detalhes);
    expect(onAbrirDetalhes).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('selo e sequência têm nomes textuais nos dados da fixture', async () => {
    const trechos = fixtures.conclusivo.rotas[0].trechos;
    await render(<><SeloLinha trecho={trechos[1]} rotulo={t(trechos[1])} />
      <SequenciaModos trechos={trechos} rotulos={rotulos.modos} rotuloAPe={rotulos.trechoAPe} rotuloLinha={t} rotuloAcessivel="A pé, ônibus" /></>);
    expect(screen.getAllByLabelText(t(trechos[1])).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('A pé, ônibus')).toBeTruthy();
  });

  it('botão explicativo só aparece no trecho a pé e recebe o toque', async () => {
    const onPress = jest.fn();
    const trechos = fixtures.conclusivo.rotas[0].trechos;
    await render(<><BotaoPorQue trecho={trechos[0]} rotulo={textos.resultado.detalhes.porQue} rotuloAcessivel="Trecho 1, a pé" onPress={onPress} />
      <BotaoPorQue trecho={trechos[1]} rotulo={textos.resultado.detalhes.porQue} rotuloAcessivel="Trecho 2, ônibus" onPress={onPress} /></>);
    const botao = screen.getByRole('button');
    expect(estilo(botao.props.style).minHeight).toBeGreaterThanOrEqual(toque.minimo);
    await fireEvent.press(botao);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('item de trecho mostra modo e embarque sem inserir botão no transporte', async () => {
    const trecho = fixtures.nao_aplicavel.rotas[1].trechos[0];
    await render(<ItemTrecho trecho={trecho} total={1} rotulos={trechoRotulos} rotuloLinha={t} botaoPorQue={{ rotulo: textos.resultado.detalhes.porQue, rotuloAcessivel: 'Trecho 1', onPress: () => {} }} />);
    expect(screen.getByLabelText('Trecho 1 de 1, Ônibus')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('valor null usa texto de dados insuficientes e zero permanece zero', async () => {
    await render(<TabelaNumeros dadosInsuficientes={rotulos.dadosInsuficientes} linhas={[{ rotulo: 'Registros por km', valor: fixtures.nao_aplicavel.rotas[1].exposicao.registrosPorKm }, { rotulo: 'Registros', valor: fixtures.nao_aplicavel.rotas[1].exposicao.registros }]} />);
    expect(screen.getByLabelText('Registros por km: Dados insuficientes')).toBeTruthy();
    expect(screen.getByLabelText('Registros: 0')).toBeTruthy();
  });

  it('indicativo e linha de dados são legíveis, linha dispara onPress e tem alvo', async () => {
    const onPress = jest.fn();
    await render(<><Indicativo texto="Sem diferença clara" /><LinhaSobreOsDados texto="Dados: SSP-SP" rotuloAcessivel="Abrir Sobre os dados" onPress={onPress} /></>);
    expect(screen.getByLabelText('Sem diferença clara')).toBeTruthy();
    const linha = screen.getByRole('button');
    expect(estilo(linha.props.style).minHeight).toBeGreaterThanOrEqual(toque.minimo);
    await fireEvent.press(linha);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('linha de categoria informa parcela e estado expandido', async () => {
    const onPress = jest.fn();
    await render(<LinhaCategoria rotulo="Furto" valor="7 registros" textoParcela="3 entram na comparação" expandida onPress={onPress} detalhes={<></>} />);
    const linha = screen.getByRole('button', { name: 'Furto, 7 registros' });
    expect(linha.props.accessibilityState.expanded).toBe(true);
    expect(screen.getByText('3 entram na comparação')).toBeTruthy();
    expect(estilo(linha.props.style).minHeight).toBeGreaterThanOrEqual(toque.minimo);
    await fireEvent.press(linha);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('painel preserva a ordem da resposta e mantém a linha de dados depois da lista', async () => {
    const onSelecionar = jest.fn();
    await render(<PainelResultado resposta={fixtures.outra_opcao} rotaSelecionadaId={fixtures.outra_opcao.rotas[0].id} rotulos={rotulos} tituloLista="Opções" rotuloExpandir="Expandir lista" onExpandir={() => {}} onSelecionar={onSelecionar} onAbrirDetalhes={() => {}} linhaDados={{ texto: 'Dados: SSP-SP', rotuloAcessivel: 'Abrir Sobre os dados', onPress: () => {} }} />);
    expect(screen.getByRole('header', { name: 'Opções' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Abrir Sobre os dados' })).toBeTruthy();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(2);
    expect(screen.getByText(hipotesesResultado.dicaSelecao)).toBeTruthy();
  });

  it('folha reserva a margem segura inferior no paddingBottom', async () => {
    const resposta = fixtures.conclusivo;
    await render(
      <SafeAreaInsetsContext.Provider value={{ top: 0, bottom: 34, left: 0, right: 0 }}>
        <PainelResultado resposta={resposta} rotulos={rotulos} tituloLista="3 opções" rotuloExpandir="Expandir lista" rotaSelecionadaId={resposta.rotas[0].id}
          onExpandir={() => {}} onSelecionar={() => {}} onAbrirDetalhes={() => {}} alturaFolha={300}
          linhaDados={{ texto: 'Dados: SSP-SP', rotuloAcessivel: 'Abrir Sobre os dados', onPress: () => {} }} />
      </SafeAreaInsetsContext.Provider>,
    );
    expect(StyleSheet.flatten(screen.getByTestId('painel-resultado').props.style).paddingBottom).toBe(34);
  });

  it('resumo recolhido usa a opção selecionada, plural e rótulo de foco completo para acessibilidade', async () => {
    const resposta = fixtures.conclusivo;
    const props = { resposta, rotulos, tituloLista: '3 opções', rotuloExpandir: 'Expandir lista',
      onExpandir: () => {}, onSelecionar: () => {}, onAbrirDetalhes: () => {},
      linhaDados: { texto: 'Dados: SSP-SP', rotuloAcessivel: 'Abrir Sobre os dados', onPress: () => {} } };
    const tela = await render(<PainelResultado {...props} rotaSelecionadaId={resposta.rotas[0].id} nivel={0} />);
    const resumo = screen.getByTestId('resumo-recolhido');
    expect(resumo.props.children).toBe('40 min · 1 troca · 1 a pé · Menor exposição estimada');
    expect(resumo.props.accessibilityLabel).toBe(resumo.props.children);
    expect(resumo.props.numberOfLines).toBe(2);
    expect(resumo.props.ellipsizeMode).toBe('tail');
    expect(resumo.props.children).not.toMatch(/segura/i);
    await tela.rerender(<PainelResultado {...props} rotaSelecionadaId={resposta.rotas[1].id} nivel={0} />);
    expect(screen.getByTestId('resumo-recolhido').props.children).toContain('Menor tempo');
    await tela.rerender(<PainelResultado {...props} rotaSelecionadaId={resposta.rotas[1].id} nivel={1} />);
    expect(screen.queryByTestId('resumo-recolhido')).toBeNull();
    await tela.rerender(<PainelResultado {...props} rotaSelecionadaId={resposta.rotas[1].id} nivel={2} />);
    expect(screen.queryByTestId('resumo-recolhido')).toBeNull();
    expect(hipotesesResultado.resumoRecolhido('40 min', rotulos.trocas(0).toLowerCase(), '1,0 km a pé', [])).toBe('40 min · sem troca · 1,0 km a pé');
    expect(hipotesesResultado.resumoRecolhido('40 min', rotulos.trocas(2), '1,0 km a pé', [])).toBe('40 min · 2 trocas · 1,0 km a pé');
  });

  it.each(['dark', 'light'] as const)('conjunto de apresentação renderiza no tema %s', async tema => {
    mockEsquema = tema;
    const rota = fixtures.conclusivo.rotas[0];
    await render(<><CardRota rota={rota} indice={1} total={3} selecionada={false} rotulos={rotulos} onPress={() => {}} onAbrirDetalhes={() => {}} />
      <ItemTrecho trecho={rota.trechos[0]} total={rota.trechos.length} rotulos={trechoRotulos} rotuloLinha={t} />
      <LinhaSobreOsDados texto="Dados: SSP-SP" rotuloAcessivel="Abrir Sobre os dados" onPress={() => {}} />
      <Indicativo texto="Dados considerados" /></>);
    expect(screen.getByText('40 min')).toBeTruthy();
    expect(screen.getByLabelText('Abrir Sobre os dados')).toBeTruthy();
  });
});
