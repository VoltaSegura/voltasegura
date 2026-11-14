import { useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao, BotaoIcone, Icone, Texto } from '@/components';
import MapaPonto from '@/components/mapa/MapaPonto';
import { BuscaEndereco, SalvarLugar, infoTipo } from '@/components/planejar';
import { useConsulta, type OpcoesValidacao, type Ponto } from '@/consulta';
import { useLocais, type LocalSalvo } from '@/locais';
import { buscarEndereco } from '@/services/geocodificacao';
import { textos } from '@/textos';
import { hipotesesMapa as h } from '@/textos/hipotesesMapa';
import { hipotesesPlanejar } from '@/textos/hipotesesPlanejar';
import { esp, raio } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

type Metodo = 'mapa' | 'localizacao' | 'busca' | 'salvo';
type Escolha = { ponto: Ponto; metodo: Metodo; rotulo: string };

/**
 * TL-05 (D-29): o mapa ocupa a tela. Por cima: busca por texto e voltar. Embaixo: lugares salvos,
 * salvar este lugar e confirmar. Sem pontos de exemplo na interface (o app já abre no centro de São Paulo).
 * PL-11: a função real depende de um limite municipal validado.
 */
export default function EscolherPonto({ dentroDoMunicipio = () => true }: OpcoesValidacao) {
  const { campo } = useLocalSearchParams<{ campo?: string }>();
  const { estado, definirOrigem, definirDestino } = useConsulta();
  const { locais, salvar } = useLocais();
  const { cores } = useTema();
  const [escolha, setEscolha] = useState<Escolha | null>(null);
  const [foco, setFoco] = useState<Ponto | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [obtendo, setObtendo] = useState(false);
  const [texto, setTexto] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mapaDisponivel, setMapaDisponivel] = useState(Platform.OS === 'web' ? false : true);
  const titulo = campo === 'destino' ? textos.escolherPonto.tituloDestino : textos.escolherPonto.tituloOrigem;
  const pontoExistente = campo === 'destino' ? estado.consulta.destino : estado.consulta.origem;
  const campoValido = campo === 'origem' || campo === 'destino';
  const fora = escolha !== null && !dentroDoMunicipio(escolha.ponto);

  const escolher = (ponto: Ponto, metodo: Metodo, rotulo: string, mover = metodo !== 'mapa') => {
    setErro(null);
    setSalvando(false);
    setEscolha({ ponto, metodo, rotulo });
    setFoco(mover ? ponto : null);
  };

  const usarLocalizacao = async () => {
    if (obtendo) return;
    setErro(null);
    setObtendo(true);
    try {
      const permissao = await Location.requestForegroundPermissionsAsync();
      if (permissao.status !== 'granted') {
        setErro(textos.planejar.semPermissao);
        return;
      }
      const localizacao = await Location.getCurrentPositionAsync({});
      escolher({ lat: localizacao.coords.latitude, lon: localizacao.coords.longitude }, 'localizacao', textos.planejar.minhaLocalizacao);
    } catch {
      setErro(textos.planejar.erroLocalizacao);
    } finally {
      setObtendo(false);
    }
  };

  const buscar = async () => {
    if (buscando) return;
    const pedido = texto.trim();
    if (pedido.length < 3) return;
    setErro(null);
    setBuscando(true);
    const resultado = await buscarEndereco(pedido);
    setBuscando(false);
    if (resultado.tipo === 'achou') {
      escolher(resultado.ponto, 'busca', pedido.slice(0, 40));
      AccessibilityInfo.announceForAccessibility(hipotesesPlanejar.pontoMarcado);
    } else {
      const mensagem = resultado.tipo === 'nao_achou' ? h.naoAchou : h.buscaIndisponivel;
      setErro(mensagem);
      AccessibilityInfo.announceForAccessibility(mensagem);
    }
  };

  const salvarLugar = async (nome: string, tipo: LocalSalvo['tipo']): Promise<string | null> => {
    if (!escolha) return h.erroSalvar;
    const resultado = await salvar(nome, escolha.ponto, tipo);
    if (resultado === 'ok') {
      setSalvando(false);
      AccessibilityInfo.announceForAccessibility(h.salvoOk);
      return null;
    }
    return resultado === 'nome_vazio' ? h.erroNome : resultado === 'limite' ? h.erroLimite : h.erroSalvar;
  };

  const confirmar = () => {
    if (!escolha || fora || !campoValido) return;
    if (campo === 'origem') definirOrigem(escolha.ponto, escolha.rotulo);
    else definirDestino(escolha.ponto, escolha.rotulo);
    router.back();
  };

  const rotuloEscolha = escolha?.metodo === 'localizacao' ? textos.planejar.minhaLocalizacao : escolha?.metodo === 'salvo' || escolha?.metodo === 'busca' ? escolha.rotulo : textos.planejar.pontoMapa;

  return (
    <View testID="tela-escolher-ponto" style={[estilos.base, { backgroundColor: cores.fundo }]}>
      <Stack.Screen options={{ title: titulo }} />
      {mapaDisponivel ? (
        <MapaPonto cheio onEscolher={(ponto) => escolher(ponto, 'mapa', textos.planejar.pontoMapa)} ponto={escolha?.ponto ?? pontoExistente} foco={foco} onDisponibilidadeChange={setMapaDisponivel} />
      ) : (
        <View style={estilos.semMapa}><Icone nome="map-marker-off-outline" tamanho={40} corTema="texto2" /><Texto cor="texto2" style={estilos.centro}>{hipotesesPlanejar.mapaIndisponivel}</Texto></View>
      )}

      <SafeAreaView edges={['top']} pointerEvents="box-none" style={estilos.topo}>
        <View pointerEvents="box-none" style={estilos.linhaTopo}>
          <BotaoIcone icone="arrow-left" rotulo={textos.comuns.fechar} onPress={() => router.back()} />
          <View style={estilos.busca}>
            <BuscaEndereco testID="campo-busca" valor={texto} onChange={setTexto} onBuscar={() => { void buscar(); }} buscando={buscando} />
          </View>
        </View>
        <Texto variante="rotulo" accessibilityRole="header" style={[estilos.titulo, { backgroundColor: cores.fundo + 'D9' }]}>{titulo}</Texto>
      </SafeAreaView>

      <View pointerEvents="box-none" style={estilos.localizar}>
        <BotaoIcone icone="crosshairs-gps" rotulo={h.minhaLocalizacaoBotao} fundo="superficie" onPress={() => { void usarLocalizacao(); }} desabilitado={obtendo} />
      </View>

      <SafeAreaView edges={['bottom']} style={[estilos.painel, { backgroundColor: cores.superficie, borderColor: cores.divisoria }]}>
        <View style={[estilos.alca, { backgroundColor: cores.borda }]} />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={estilos.conteudo} style={estilos.rolagem}>
          {!escolha ? <Texto cor="texto2">{h.arrasteMapa}</Texto> : (
            <View style={estilos.escolhido}>
              <Icone nome="map-marker" tamanho={22} corTema="acaoLink" />
              <View style={estilos.textosEscolha}>
                <Texto variante="rotulo" cor="texto2">{h.pontoEscolhido}</Texto>
                <Texto variante="corpoForte" numberOfLines={1}>{rotuloEscolha}</Texto>
              </View>
              {!salvando ? <Botao rotulo={h.salvarLugar} variante="texto" icone={<Icone nome="bookmark-outline" tamanho={18} corTema="acaoLink" />} onPress={() => setSalvando(true)} /> : null}
            </View>
          )}
          {salvando && escolha ? <SalvarLugar onSalvar={salvarLugar} onCancelar={() => setSalvando(false)} /> : null}
          {locais.length && !salvando ? (
            <View style={estilos.salvos}>
              <Texto variante="rotulo" cor="texto2">{h.lugaresSalvos}</Texto>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips} keyboardShouldPersistTaps="handled">
                {locais.map((l) => (
                  <Pressable key={l.id} accessibilityRole="button" accessibilityLabel={l.nome} onPress={() => escolher(l.ponto, 'salvo', l.nome)} style={[estilos.chip, { borderColor: cores.borda, backgroundColor: cores.superficie2 }]}>
                    <Icone nome={infoTipo[l.tipo].icone} tamanho={18} corTema="acaoLink" />
                    <Texto variante="rotulo">{l.nome}</Texto>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
          {!campoValido ? <Texto cor="erro">{hipotesesPlanejar.campoInvalido}</Texto> : null}
          {fora ? <Texto cor="erro">{textos.escolherPonto.foraArea}</Texto> : null}
          {erro ? <Texto cor="erro" accessibilityRole="alert" accessibilityLiveRegion="polite">{erro}</Texto> : null}
          <Botao rotulo={hipotesesPlanejar.usarEstePonto} onPress={confirmar} desabilitado={!escolha || fora || !campoValido} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { flex: 1 },
  semMapa: { ...(StyleSheet.absoluteFill as object), alignItems: 'center', justifyContent: 'center', gap: esp[3], padding: esp[6] },
  centro: { textAlign: 'center' },
  topo: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: esp[3], gap: esp[2] },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', gap: esp[2], paddingTop: esp[2] },
  busca: { flex: 1 },
  titulo: { alignSelf: 'flex-start', borderRadius: raio.pilula, paddingHorizontal: esp[3], paddingVertical: esp[1], overflow: 'hidden' },
  localizar: { position: 'absolute', right: esp[3], bottom: '38%' },
  painel: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '55%', borderTopLeftRadius: raio.painel, borderTopRightRadius: raio.painel, borderWidth: 1, borderBottomWidth: 0 },
  alca: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginTop: esp[2] },
  rolagem: { flexGrow: 0 },
  conteudo: { padding: esp[4], gap: esp[3] },
  escolhido: { flexDirection: 'row', alignItems: 'center', gap: esp[3] },
  textosEscolha: { flex: 1 },
  salvos: { gap: esp[2] },
  chips: { gap: esp[2] },
  chip: { flexDirection: 'row', alignItems: 'center', gap: esp[2], minHeight: 40, paddingHorizontal: esp[3], borderRadius: raio.pilula, borderWidth: 1 },
});
