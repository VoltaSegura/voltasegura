import { useContext, useEffect, useState, type ReactNode } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { useFolhaResultado } from './useFolhaResultado';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Botao, SeloExemplo, Texto } from '@/components';
import { Entrada, NumeroContando, haptica } from '@/components/movimento';
import type { FocoRota, ModoTrecho, RespostaConsulta, Rota, Trecho } from '@/services';
import { textos } from '@/textos';
import { hipotesesPrioridade } from '@/textos/hipotesesPrioridade';
import { hipotesesResultado } from '@/textos/hipotesesResultado';
import { brilho, esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { focosVisiveis, selosExemplo, soRoteamento } from './fontes';
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

export function CardRota({ rota, indice, total, selecionada, exemplo, semExposicao = false, opcaoUnica = false, rotulos, onPress, onAbrirDetalhes }: {
  rota: Rota; /** `semExposicao` = "só roteamento" (B-08): descarta o foco de exposição. */ semExposicao?: boolean; /** B-51: resposta com 1 rota não mostra focos comparativos. */ opcaoUnica?: boolean; indice: number; total: number; selecionada: boolean; exemplo?: boolean;
  rotulos: RotulosResultado; onPress: () => void; onAbrirDetalhes: () => void;
}) {
  const { cores } = useTema();
  const focos = opcaoUnica ? [] : semExposicao ? rota.focos.filter(f => f !== 'MENOR_EXPOSICAO') : rota.focos;
  const modos = rota.trechos.map(t => t.modo === 'A_PE' ? rotulos.trechoAPe(t.duracaoMin) : rotulos.linha(t)).join(', ');
  const rotuloBase = rotulos.card({ ...rota, focos }, indice, total, modos).replace('Toque duas vezes para ver os detalhes.', hipotesesResultado.rotuloSelecao);
  // B-58: a variação de caminhada se apresenta como tal (texto neutro, sem juízo sobre o caminho)
  const rotuloVariante = rota.variante?.origem === 'dados' ? hipotesesPrioridade.rotaDosDados : rota.variante ? hipotesesResultado.varianteCaminhada : null;
  const confianca = !semExposicao && !opcaoUnica && rota.destaqueExposicao ? hipotesesPrioridade.confianca[rota.destaqueExposicao.confianca] : null;
  const rotuloCard = [rotuloVariante, confianca, rotuloBase].filter(Boolean).join('. ');
  // A opção selecionada é a "acesa": número enorme, fio dourado e brilho. As demais ficam quietas (uma coisa acesa por tela).
  return <View style={[estilos.card, selecionada
    ? [estilos.cardAceso, { backgroundColor: cores.superficie2, borderColor: cores.acao }, brilho(cores.luz, 0.28)]
    : { borderBottomColor: cores.divisoria, borderBottomWidth: medidas.borda }]}>
    <Pressable onPress={() => { if (!selecionada) haptica.selecao(); onPress(); }} accessibilityRole="button" accessibilityState={{ selected: selecionada }}
      accessibilityLabel={rotuloCard} style={estilos.cardSelecao}>
    <View style={estilos.topo}>{focos.map(f => <RotuloFoco key={f} foco={f} rotulo={rotulos.focos[f]} />)}
      {selecionada && <Texto variante="rotulo">{rotulos.selecionada}</Texto>}{exemplo && <SeloExemplo />}</View>
    {confianca && <Texto variante="apoio" testID="confianca-destaque">{confianca}</Texto>}
    {rotuloVariante && <Texto variante="apoio" cor="texto2" testID="rotulo-variante">{rotuloVariante}</Texto>}
    <View style={estilos.cardMeio}>
      {/* Item 6 (T25-B): linha densa "duração · km a pé · trocas"; o horário de saída sai do cartão (fica na folha e em "Sobre os dados"). */}
      <NumeroContando valor={rota.duracaoMin} formatar={rotulos.duracao} variante="duracao" style={estilos.duracao} />
      <View style={estilos.metadados}><Texto variante="apoio">{rotulos.caminhada(rota.caminhadaKm)}</Texto><Texto variante="apoio">{rotulos.trocas(rota.trocas)}</Texto></View></View>
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

/**
 * Cartão "Dados insuficientes" (mockup 04): aparece no topo da lista quando a comparação é insuficiente.
 * O texto vem de quem chama (o mesmo do caso, para não haver duas versões); as ações são só de navegação.
 */
export function CartaoInsuficiente({ titulo, texto, rotuloEntender, rotuloOutroHorario, onEntender, onOutroHorario }: {
  titulo: string; texto: string; rotuloEntender: string; rotuloOutroHorario: string; onEntender: () => void; onOutroHorario: () => void;
}) {
  const { cores } = useTema();
  return <View testID="cartao-insuficiente" style={[estilos.cartaoInsuf, { backgroundColor: cores.superficie2 }]}>
    <Texto variante="secao" accessibilityRole="header">{titulo}</Texto>
    <Texto testID="texto-caso" variante="apoio" cor="texto2">{texto}</Texto>
    <View style={estilos.cartaoAcoes}>
      <Botao variante="secundario" rotulo={rotuloEntender} onPress={onEntender} />
      <Botao variante="texto" rotulo={rotuloOutroHorario} onPress={onOutroHorario} />
    </View>
  </View>;
}

/** Barra de cobertura (0 a 1) da opção: a cor só enche a proporção; o número escrito é o que vale. */
export function BarraCobertura({ rotulo, valor }: { rotulo: string; valor: number }) {
  const { cores } = useTema();
  const pct = Math.round(Math.min(1, Math.max(0, valor)) * 100);
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={`${rotulo}: ${pct}%`}
    accessibilityValue={{ min: 0, max: 100, now: pct }} style={[estilos.barraTrilho, { backgroundColor: cores.superficie2 }]}>
    <View style={[estilos.barraPreench, { width: `${pct}%`, backgroundColor: cores.texto }]} />
  </View>;
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

// Memória da sessão do app: sem persistência e sem dados pessoais.
let dicaSelecaoApresentada = false;

export function PainelResultado({ resposta, rotaSelecionadaId, rotulos, tituloLista, rotuloExpandir, onExpandir, onSelecionar, onAbrirDetalhes, linhaDados, children, saida, alturaFolha, nivel = 0, onRecolher, rodapeLista }: {
  resposta: RespostaConsulta; rotaSelecionadaId: string; rotulos: RotulosResultado;
  tituloLista: string; rotuloExpandir: string; expandido?: boolean; onExpandir: () => void; onSelecionar: (rota: Rota) => void; onAbrirDetalhes: (rota: Rota) => void;
  linhaDados: { texto: string; rotuloAcessivel: string; onPress: () => void; indisponivel?: boolean };
  children?: ReactNode;
  saida?: string; alturaFolha?: number; nivel?: number; onRecolher?: () => void; rodapeLista?: ReactNode;
}) {
  const { cores } = useTema();
  const baseSegura = useContext(SafeAreaInsetsContext)?.bottom ?? 0;
  const [mostrarDica] = useState(() => resposta.rotas.length >= 2 && !dicaSelecaoApresentada);
  useEffect(() => { if (mostrarDica) dicaSelecaoApresentada = true; }, [mostrarDica]);
  const { estiloAnimado, panHandlers } = useFolhaResultado(alturaFolha, nivel, onExpandir, onRecolher);
  const semExposicao = soRoteamento(resposta);
  const selos = selosExemplo(resposta);
  const rotaSelecionada = resposta.rotas.find(rota => rota.id === rotaSelecionadaId);
  const resumo = rotaSelecionada && hipotesesResultado.resumoRecolhido(
    rotulos.duracao(rotaSelecionada.duracaoMin),
    rotulos.trocas(rotaSelecionada.trocas).toLocaleLowerCase('pt-BR'),
    rotulos.caminhada(rotaSelecionada.caminhadaKm),
    focosVisiveis(rotaSelecionada.focos, resposta).map(foco => rotulos.focos[foco].replace(/^◆\s*/, '')),
  );
  return <Animated.View testID="painel-resultado" style={[estilos.painel, alturaFolha !== undefined && { position: 'absolute', left: 0, right: 0, bottom: 0, height: alturaFolha, flexGrow: 0, flexBasis: 'auto' }, { backgroundColor: cores.superficie, borderTopColor: cores.luz, paddingBottom: baseSegura }, estiloAnimado]}>
    <View {...panHandlers}>
      <Pressable testID="alca-resultado" accessibilityRole="button" accessibilityLabel={rotuloExpandir}
        accessibilityHint={hipotesesResultado.alternarAltura} accessibilityValue={{ text: hipotesesResultado.alturas[nivel] }}
        onPress={onExpandir} style={estilos.toqueAlca}>
        <View accessible={false} style={[estilos.alca, { backgroundColor: cores.luz }]} />
      </Pressable>
    </View>
    <View style={estilos.cabecalho}><Texto accessibilityRole="header" variante="secao" style={estilos.flex}>{tituloLista}</Texto>
      {saida && <Texto variante="apoio" style={estilos.hora}>{saida}</Texto>}</View>
    {!semExposicao && resposta.rotas.length > 1 && resposta.rotas[0]?.focos.includes('MENOR_EXPOSICAO') && <View style={[estilos.chipOrdem, { borderColor: cores.borda }]}>
      <Texto variante="rotulo">{hipotesesResultado.exposicaoPrimeiro}</Texto>
    </View>}
    {nivel === 0 && resumo && <Texto testID="resumo-recolhido" accessibilityLabel={resumo} variante="apoio" numberOfLines={2} ellipsizeMode="tail" style={estilos.resumoRecolhido}>{resumo}</Texto>}
    <ScrollView testID="lista-resultado" style={estilos.lista} contentContainerStyle={estilos.conteudoLista}>
      {semExposicao && resposta.rotas.length > 0 && <Texto testID="aviso-so-roteamento" variante="apoio" style={estilos.avisoRoteamento}>{textos.soRoteamento.aviso}</Texto>}
      {children}
      {resposta.rotas.map((rota, i) => <Entrada key={rota.id} indice={i}><CardRota rota={rota} indice={i + 1} total={resposta.rotas.length} selecionada={rota.id === rotaSelecionadaId} exemplo={selos.roteamento || (selos.exposicao && rota.focos.includes('MENOR_EXPOSICAO'))} semExposicao={semExposicao} opcaoUnica={resposta.rotas.length === 1} rotulos={rotulos} onPress={() => onSelecionar(rota)} onAbrirDetalhes={() => onAbrirDetalhes(rota)} /></Entrada>)}
      {mostrarDica && <Texto variante="apoio" style={estilos.dica}>{hipotesesResultado.dicaSelecao}</Texto>}
      {rodapeLista}
    </ScrollView>
    <LinhaSobreOsDados {...linhaDados} />
  </Animated.View>;
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  painel: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minHeight: 0, borderTopWidth: medidas.borda, borderTopLeftRadius: raio.painel, borderTopRightRadius: raio.painel, overflow: 'hidden' },
  toqueAlca: { minHeight: toque.minimo, justifyContent: 'center', alignItems: 'center' },
  alca: { width: 36, height: 4, borderRadius: 2, opacity: 0.55 },
  hora: { flexShrink: 1 },
  chipOrdem: { alignSelf: 'flex-start', marginHorizontal: esp[4], marginBottom: esp[2], padding: esp[1], borderWidth: 1, borderRadius: raio.pequeno },
  avisoRoteamento: { marginHorizontal: esp[4], marginBottom: esp[2] },
  resumoRecolhido: { marginHorizontal: esp[4], marginBottom: esp[2], flexShrink: 1 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: esp[4], paddingBottom: esp[2], gap: esp[2], flexWrap: 'wrap' },
  lista: { flex: 1, minHeight: 0 },
  conteudoLista: { flexGrow: 1 },
  card: { padding: esp[3], gap: esp[2], minHeight: toque.minimo },
  cardAceso: { margin: esp[2], borderRadius: raio.grande, borderWidth: 1.5, paddingVertical: esp[4] },
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
  cartaoInsuf: { borderRadius: raio.medio, padding: esp[4], gap: esp[2] },
  cartaoAcoes: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: esp[2], marginTop: esp[1] },
  barraTrilho: { height: esp[2], borderRadius: raio.pilula, overflow: 'hidden' },
  barraPreench: { height: '100%', borderRadius: raio.pilula },
});
