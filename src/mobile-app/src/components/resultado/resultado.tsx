import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Botao, SeloExemplo, Texto } from '@/components';
import { Entrada, NumeroContando, haptica } from '@/components/movimento';
import type { FocoRota, ModoTrecho, RespostaConsulta, Rota, Trecho } from '@/services';
import { hipotesesResultado } from '@/textos/hipotesesResultado';
import { brilho, esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { medidas } from './medidas';

export type RotulosModos = Record<ModoTrecho, string>;
export type RotulosFocos = Record<FocoRota, string>;
export type RotulosTrecho = {
  resumo: (trecho: Trecho, total: number, modo: string) => string;
  detalhe: (trecho: Trecho, modo: string) => string;
  embarque: (trecho: Trecho) => string | null;
  desembarque: (trecho: Trecho) => string | null;
};
export type RotulosResultado = {
  focos: RotulosFocos;
  modos: RotulosModos;
  duracao: (minutos: number) => string;
  caminhada: (km: number) => string;
  trocas: (quantidade: number) => string;
  saida: (data: string) => string;
  trechoAPe: (minutos: number) => string;
  linha: (trecho: Trecho) => string;
  card: (rota: Rota, indice: number, total: number, modos: string) => string;
  selecionada: string;
  dadosInsuficientes: string;
};

export function SeloLinha({ trecho, rotulo }: { trecho: Trecho; rotulo: string }) {
  const { cores } = useTema();
  return <View accessible accessibilityLabel={rotulo} style={[estilos.selo, { borderColor: cores.borda, backgroundColor: cores.superficie }]}>
    <Texto variante="corpoForte" style={{ color: cores.texto, fontSize: 13, lineHeight: 18 }}>{trecho.linha ?? rotulo}</Texto>
  </View>;
}

export function RotuloFoco({ foco, rotulo }: { foco: FocoRota; rotulo: string }) {
  const { cores } = useTema();
  const destaque = foco === 'MENOR_EXPOSICAO';
  // O componente desenha o ◆ do destaque (D-23); alguns textos do catálogo já o trazem no começo.
  const texto = rotulo.replace(/^◆\s*/, '');
  return <View accessible accessibilityLabel={rotulo} style={[estilos.foco, { borderColor: destaque ? cores.acao : cores.borda, backgroundColor: destaque ? cores.acao : 'transparent' }, destaque && brilho(cores.luz, 0.35)]}>
    {destaque && <Texto accessible={false} style={{ color: cores.acaoTexto }}>◆</Texto>}
    <Texto variante="rotulo" style={{ color: destaque ? cores.acaoTexto : cores.texto }}>{texto}</Texto>
  </View>;
}

/** O "fio": os trechos ligados por uma linha. Acesa (dourada, com brilho) quando a rota está selecionada. */
export function SequenciaModos({ trechos, rotulos, rotuloAPe, rotuloLinha, rotuloAcessivel, acesa = false }: {
  trechos: Trecho[]; rotulos: RotulosModos; rotuloAPe: (minutos: number) => string;
  rotuloLinha: (trecho: Trecho) => string; rotuloAcessivel: string; acesa?: boolean;
}) {
  const { cores } = useTema();
  return <View accessibilityLabel={rotuloAcessivel} accessible style={estilos.sequencia}>
    {trechos.map((trecho, i) => <View key={trecho.id} style={estilos.modo}>
      {i > 0 && <View style={[estilos.conector, acesa ? [estilos.conectorAceso, { backgroundColor: cores.luz }, brilho(cores.luz, 0.6)] : { backgroundColor: cores.borda }]} accessible={false} />}
      {/* A pé: o rótulo de minutos já começa por "A pé"; repetir o modo daria "A pé A pé 35 min". */}
      {trecho.modo !== 'A_PE' && <Texto variante="rotulo" cor="texto2">{rotulos[trecho.modo]}</Texto>}
      {trecho.modo === 'A_PE' ? <Texto variante="rotulo">{rotuloAPe(trecho.duracaoMin)}</Texto> : <SeloLinha trecho={trecho} rotulo={rotuloLinha(trecho)} />}
    </View>)}
  </View>;
}

export function CardRota({ rota, indice, total, selecionada, exemplo, rotulos, onPress, onAbrirDetalhes }: {
  rota: Rota; indice: number; total: number; selecionada: boolean; exemplo?: boolean;
  rotulos: RotulosResultado; onPress: () => void; onAbrirDetalhes: () => void;
}) {
  const { cores } = useTema();
  const modos = rota.trechos.map(t => t.modo === 'A_PE' ? rotulos.trechoAPe(t.duracaoMin) : rotulos.linha(t)).join(', ');
  const rotuloCard = rotulos.card(rota, indice, total, modos).replace('Toque duas vezes para ver os detalhes.', hipotesesResultado.rotuloSelecao);
  // A opção selecionada é a "acesa": número enorme, fio dourado e brilho. As demais ficam quietas (uma coisa acesa por tela).
  return <View style={[estilos.card, selecionada
    ? [estilos.cardAceso, { backgroundColor: cores.superficie2, borderColor: cores.acao }, brilho(cores.luz, 0.28)]
    : { borderBottomColor: cores.divisoria, borderBottomWidth: medidas.borda }]}>
    <Pressable onPress={() => { if (!selecionada) haptica.selecao(); onPress(); }} accessibilityRole="button" accessibilityState={{ selected: selecionada }}
      accessibilityLabel={rotuloCard} style={estilos.cardSelecao}>
    <View style={estilos.topo}>{rota.focos.map(f => <RotuloFoco key={f} foco={f} rotulo={rotulos.focos[f]} />)}
      {selecionada && <Texto variante="rotulo">{rotulos.selecionada}</Texto>}{exemplo && <SeloExemplo />}</View>
    <View style={estilos.cardMeio}>
      <NumeroContando valor={rota.duracaoMin} formatar={rotulos.duracao} variante={selecionada ? 'numero' : 'duracao'} style={estilos.duracao} />
      <View style={estilos.metadados}><Texto variante="apoio">{rotulos.caminhada(rota.caminhadaKm)}</Texto><Texto variante="apoio">{rotulos.trocas(rota.trocas)}</Texto><Texto variante="apoio">{rotulos.saida(rota.saidaPrevista)}</Texto></View></View>
      <SequenciaModos trechos={rota.trechos} rotulos={rotulos.modos} rotuloAPe={rotulos.trechoAPe} rotuloLinha={rotulos.linha} rotuloAcessivel={modos} acesa={selecionada} />
    </Pressable>
    <Pressable onPress={onAbrirDetalhes} accessibilityRole="button" accessibilityLabel={hipotesesResultado.detalhes(indice)}
      style={[estilos.cardDetalhes, { borderColor: cores.borda }]}>
      <Texto accessible={false} variante="destaque">›</Texto>
    </Pressable>
  </View>;
}

export function LinhaSobreOsDados({ texto, rotuloAcessivel, onPress, indisponivel = false }: {
  texto: string; rotuloAcessivel: string; onPress: () => void; indisponivel?: boolean;
}) {
  const { cores } = useTema();
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={rotuloAcessivel}
    style={({ pressed }) => [estilos.linhaDados, { borderTopColor: cores.borda, backgroundColor: pressed ? cores.superficie2 : cores.superficie }]}>
    <Texto cor="dado" accessible={false}>ⓘ</Texto>
    <Texto variante="apoio" cor={indisponivel ? 'texto2' : 'dado'} style={estilos.flex}>{texto}</Texto>
    <Texto cor="dado" accessible={false}>›</Texto>
  </Pressable>;
}

export function Indicativo({ texto }: { texto: string }) {
  const { cores } = useTema();
  return <View accessible accessibilityLabel={texto} style={[estilos.indicativo, { backgroundColor: cores.superficie2, borderColor: cores.borda }]}>
    <Texto>{texto}</Texto>
  </View>;
}

export function TabelaNumeros({ linhas, dadosInsuficientes }: {
  linhas: { rotulo: string; valor: string | number | null }[]; dadosInsuficientes: string;
}) {
  const { cores } = useTema();
  return <View>{linhas.map((linha, i) => {
    const valor = linha.valor === null ? dadosInsuficientes : String(linha.valor);
    return <View key={`${linha.rotulo}-${i}`} accessible accessibilityLabel={`${linha.rotulo}: ${valor}`} style={[estilos.tabelaLinha, { borderBottomColor: cores.borda }]}>
      <Texto cor="texto2" style={estilos.flex}>{linha.rotulo}</Texto><Texto>{valor}</Texto>
    </View>;
  })}</View>;
}

export function LinhaCategoria({ rotulo, valor, textoParcela, expandida, onPress, detalhes }: {
  rotulo: string; valor: string; textoParcela?: string; expandida?: boolean;
  onPress?: () => void; detalhes?: ReactNode;
}) {
  const { cores } = useTema();
  const conteudo = <><View style={estilos.categoriaConteudo}>
    <Texto style={estilos.flex}>{rotulo}</Texto><Texto>{valor}</Texto>
    {onPress && <Texto accessible={false}>⌄</Texto>}
  </View>{textoParcela && <Texto variante="apoio" cor="texto2">{textoParcela}</Texto>}</>;
  return <View style={[estilos.categoria, { borderBottomColor: cores.borda }]}>
    {onPress ? <Pressable accessibilityRole="button" accessibilityLabel={`${rotulo}, ${valor}`} accessibilityState={{ expanded: !!expandida }} onPress={onPress} style={estilos.categoriaBotao}>{conteudo}</Pressable> : <View accessible accessibilityLabel={`${rotulo}, ${valor}`}>{conteudo}</View>}
    {expandida && detalhes}
  </View>;
}

export function BotaoPorQue({ trecho, rotulo, rotuloAcessivel, onPress }: {
  trecho: Trecho; rotulo: string; rotuloAcessivel: string; onPress: () => void;
}) {
  if (trecho.modo !== 'A_PE') return null;
  return <Botao variante="secundario" rotulo={rotulo} accessibilityHint={rotuloAcessivel} onPress={onPress}
    icone={<Texto accessible={false}>?</Texto>} />;
}

export function ItemTrecho({ trecho, total, rotulos, rotuloLinha, botaoPorQue }: {
  trecho: Trecho; total: number; rotulos: RotulosTrecho & { modos: RotulosModos };
  rotuloLinha: (trecho: Trecho) => string;
  botaoPorQue?: { rotulo: string; rotuloAcessivel: string; onPress: () => void };
}) {
  const { cores } = useTema();
  const modo = rotulos.modos[trecho.modo];
  return <View style={estilos.itemTrecho}>
    <View style={estilos.trilho}><View style={[estilos.no, { backgroundColor: cores.superficie2 }]}><Texto variante="rotulo" accessible={false}>{modo.slice(0, 1)}</Texto></View>
      <View style={[estilos.vertical, { backgroundColor: cores.borda }]} accessible={false} /></View>
    <View style={estilos.flex} accessible accessibilityLabel={rotulos.resumo(trecho, total, modo)}>
      <Texto variante="corpoForte">{rotulos.detalhe(trecho, modo)}</Texto>
      {trecho.modo !== 'A_PE' && <SeloLinha trecho={trecho} rotulo={rotuloLinha(trecho)} />}
      {rotulos.embarque(trecho) && <Texto variante="apoio">{rotulos.embarque(trecho)}</Texto>}
      {rotulos.desembarque(trecho) && <Texto variante="apoio">{rotulos.desembarque(trecho)}</Texto>}
    </View>
    {botaoPorQue && <BotaoPorQue trecho={trecho} {...botaoPorQue} />}
  </View>;
}

export function ListaTrechos({ trechos, rotulos, rotuloLinha, botaoPorQue }: {
  trechos: Trecho[]; rotulos: RotulosTrecho & { modos: RotulosModos }; rotuloLinha: (trecho: Trecho) => string;
  botaoPorQue?: (trecho: Trecho) => { rotulo: string; rotuloAcessivel: string; onPress: () => void };
}) {
  return <View>{trechos.map(t => <ItemTrecho key={t.id} trecho={t} total={trechos.length} rotulos={rotulos} rotuloLinha={rotuloLinha} botaoPorQue={botaoPorQue?.(t)} />)}</View>;
}

export function PainelResultado({ resposta, rotaSelecionadaId, rotulos, tituloLista, rotuloExpandir, expandido = false, onExpandir, onSelecionar, onAbrirDetalhes, linhaDados, children }: {
  resposta: RespostaConsulta; rotaSelecionadaId: string; rotulos: RotulosResultado;
  tituloLista: string; rotuloExpandir: string; expandido?: boolean; onExpandir: () => void; onSelecionar: (rota: Rota) => void; onAbrirDetalhes: (rota: Rota) => void;
  linhaDados: { texto: string; rotuloAcessivel: string; onPress: () => void; indisponivel?: boolean };
  children?: ReactNode;
}) {
  const { cores } = useTema();
  return <View testID="painel-resultado" style={[estilos.painel, { backgroundColor: cores.superficie, borderTopColor: cores.luz }]}>
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={[estilos.alca, { backgroundColor: cores.luz }]} />
    <View style={estilos.cabecalho}><Texto accessibilityRole="header" variante="secao" style={estilos.flex}>{tituloLista}</Texto>
      <Botao variante="texto" rotulo={rotuloExpandir} accessibilityHint={expandido ? hipotesesResultado.dicaRecolher : hipotesesResultado.dicaExpandir} onPress={onExpandir} /></View>
    <ScrollView testID="lista-resultado" style={estilos.lista} contentContainerStyle={estilos.conteudoLista}>
      {children}
      {resposta.rotas.length >= 2 && <Texto variante="apoio" style={estilos.dica}>{hipotesesResultado.dicaSelecao}</Texto>}
      {resposta.rotas.map((rota, i) => <Entrada key={rota.id} indice={i}><CardRota rota={rota} indice={i + 1} total={resposta.rotas.length} selecionada={rota.id === rotaSelecionadaId} exemplo={resposta.exemplo} rotulos={rotulos} onPress={() => onSelecionar(rota)} onAbrirDetalhes={() => onAbrirDetalhes(rota)} /></Entrada>)}
    </ScrollView>
    <LinhaSobreOsDados {...linhaDados} />
  </View>;
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  painel: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minHeight: 0, borderTopWidth: medidas.borda, borderTopLeftRadius: raio.painel, borderTopRightRadius: raio.painel, overflow: 'hidden' },
  alca: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: esp[2], opacity: 0.55 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: esp[4], gap: esp[2] },
  lista: { flex: 1, minHeight: 0 },
  conteudoLista: { flexGrow: 1 },
  card: { padding: esp[4], gap: esp[3], minHeight: toque.minimo },
  cardAceso: { margin: esp[2], borderRadius: raio.grande, borderWidth: 1.5, paddingVertical: esp[6] },
  cardSelecao: { gap: esp[3], minHeight: toque.minimo, paddingRight: toque.minimo + esp[2] },
  cardDetalhes: { position: 'absolute', right: esp[4], bottom: esp[4], width: toque.minimo, height: toque.minimo, borderWidth: medidas.borda, borderRadius: raio.pequeno, alignItems: 'center', justifyContent: 'center' },
  dica: { paddingHorizontal: esp[4], paddingBottom: esp[2] },
  topo: { flexDirection: 'row', flexWrap: 'wrap', gap: esp[2], alignItems: 'center' },
  cardMeio: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: esp[4] },
  duracao: { flexShrink: 1 },
  metadados: { gap: esp[1], alignItems: 'flex-end', flexShrink: 1 },
  foco: { borderWidth: medidas.borda, borderRadius: raio.pequeno, flexDirection: 'row', gap: esp[1], alignItems: 'center', paddingHorizontal: esp[2], paddingVertical: esp[1] },
  selo: { borderWidth: medidas.borda, borderRadius: raio.grande, paddingHorizontal: esp[2], paddingVertical: esp[1], alignSelf: 'flex-start' },
  sequencia: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: esp[2], paddingVertical: esp[1] },
  modo: { flexDirection: 'row', alignItems: 'center', gap: esp[1] },
  conector: { width: medidas.separador, height: medidas.alturaLinha, marginRight: esp[1] },
  conectorAceso: { width: esp[6], height: 3, borderRadius: 2 },
  linhaDados: { borderTopWidth: medidas.borda, minHeight: toque.minimo, flexDirection: 'row', alignItems: 'center', gap: esp[2], paddingHorizontal: esp[4], paddingVertical: esp[2] },
  itemTrecho: { flexDirection: 'row', alignItems: 'flex-start', gap: esp[3], padding: esp[3], flexWrap: 'wrap' },
  trilho: { alignItems: 'center', alignSelf: 'stretch', width: medidas.noTrecho },
  no: { width: medidas.noTrecho, height: medidas.noTrecho, borderRadius: raio.grande, alignItems: 'center', justifyContent: 'center' },
  vertical: { width: medidas.alturaLinha, flex: 1, minHeight: esp[4] },
  indicativo: { borderWidth: medidas.borda, borderRadius: raio.medio, padding: esp[4] },
  tabelaLinha: { borderBottomWidth: medidas.borda, flexDirection: 'row', gap: esp[3], paddingVertical: esp[2] },
  categoria: { borderBottomWidth: medidas.borda, paddingVertical: esp[2] },
  categoriaBotao: { minHeight: toque.minimo, justifyContent: 'center' },
  categoriaConteudo: { flexDirection: 'row', alignItems: 'center', gap: esp[2] },
});
