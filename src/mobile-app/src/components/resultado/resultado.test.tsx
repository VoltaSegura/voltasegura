import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { fixtures } from '@/services/fixtures';
import type { Rota, Trecho } from '@/services';
import { textos } from '@/textos';
import { hipotesesResultado } from '@/textos/hipotesesResultado';
import { coresClaro, coresEscuro, toque } from '@/theme/tokens';

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
  trocas: textos.resultado.trocas, saida: s => textos.resultado.saidaPrevista(s.slice(11, 16)),
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
