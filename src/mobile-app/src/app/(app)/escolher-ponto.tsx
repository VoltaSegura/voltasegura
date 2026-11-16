import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Keyboard, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import * as Location from 'expo-location';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao, BotaoIcone, Icone, Texto } from '@/components';
import MapaPonto from '@/components/mapa/MapaPonto';
import { enderecoDoPonto } from '@/components/mapa/enderecoDoPonto';
import { useAlturaTeclado } from '@/components/planejar/useAlturaTeclado';
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
 * salvar este lugar e confirmar. D-30: endereço via sistema e marcador por toque.
 * PL-11: a função real depende de um limite municipal validado.
 */
export default function EscolherPonto({ dentroDoMunicipio = () => true }: OpcoesValidacao) {
  const { campo } = useLocalSearchParams<{ campo?: string }>();
  const { estado, definirOrigem, definirDestino } = useConsulta();
  const { locais, salvar } = useLocais();
  const { cores } = useTema();
  const alturaTeclado = useAlturaTeclado();
  const { height: alturaTela } = useWindowDimensions();
  const [alturaTopo, setAlturaTopo] = useState(150);
  const interagiu = useRef(false);
  const numeroEndereco = useRef(0);
  const [endereco, setEndereco] = useState<string | null>(null);
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);
  const [confirmacaoSalvo, setConfirmacaoSalvo] = useState<string | null>(null);
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
  const [centroInicial] = useState(() => pontoExistente ?? (campo === 'destino' ? estado.consulta.origem : estado.consulta.destino));
  const campoValido = campo === 'origem' || campo === 'destino';
  const fora = escolha !== null && !dentroDoMunicipio(escolha.ponto);

  useEffect(() => {
    if (centroInicial) return;
    let ativo = true;
    void (async () => {
      try {
        const permissao = await Location.getForegroundPermissionsAsync();
        if (permissao.status !== 'granted') return;
        const ultima = await Location.getLastKnownPositionAsync();
        if (ativo && !interagiu.current && ultima) {
          setFoco({ lat: ultima.coords.latitude, lon: ultima.coords.longitude });
        }
      } catch { /* Falha silenciosa: mantém o centro padrão. */ }
    })();
    return () => { ativo = false; };
  }, [centroInicial]);

  const escolher = (ponto: Ponto, metodo: Metodo, rotulo: string, mover = metodo !== 'mapa', enderecoSalvo?: string | null) => {
    interagiu.current = true;
    setErro(null);
    setSalvando(false);
    setConfirmacaoSalvo(null);
    setEscolha({ ponto, metodo, rotulo });
    setFoco(mover ? ponto : null);
    const pedido = ++numeroEndereco.current;
    if (enderecoSalvo) {
      setEndereco(enderecoSalvo);
      setBuscandoEndereco(false);
    } else {
      setEndereco(null);
      setBuscandoEndereco(true);
      void enderecoDoPonto(ponto).then((achado) => {
        if (pedido !== numeroEndereco.current) return;
        setEndereco(achado);
        setBuscandoEndereco(false);
      });
    }
  };

  const usarLocalizacao = async () => {
    if (obtendo) return;
    setErro(null);
    setObtendo(true);
    interagiu.current = true;
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
    interagiu.current = true;
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
    const resultado = await salvar(nome, escolha.ponto, tipo, endereco ?? undefined);
    if (resultado === 'ok') {
      setSalvando(false);
      Keyboard.dismiss();
      const mensagem = h.salvoComo(nome.trim());
      setConfirmacaoSalvo(mensagem);
      AccessibilityInfo.announceForAccessibility(mensagem);
      return null;
    }
    return resultado === 'nome_vazio' ? h.erroNome : resultado === 'limite' ? h.erroLimite : h.erroSalvar;
  };

  const confirmar = () => {
    if (!escolha || fora || !campoValido) return;
    const rotulo = escolha.metodo === 'localizacao' || escolha.metodo === 'salvo'
      ? escolha.rotulo
      : endereco ? (endereco.length > 60 ? `${endereco.slice(0, 59)}…` : endereco) : escolha.rotulo;
    if (campo === 'origem') definirOrigem(escolha.ponto, rotulo);
    else definirDestino(escolha.ponto, rotulo);
    router.back();
  };

  const rotuloEscolha = buscandoEndereco ? h.buscandoEndereco : endereco ?? h.enderecoIndisponivel;

  return (
    <View testID="tela-escolher-ponto" style={[estilos.base, { backgroundColor: cores.fundo }]}>
      <Stack.Screen options={{ title: titulo }} />
      {mapaDisponivel ? (
        <MapaPonto cheio onInteragir={() => { interagiu.current = true; }} centroInicial={centroInicial} onEscolher={(ponto) => escolher(ponto, 'mapa', textos.planejar.pontoMapa)} ponto={escolha?.ponto} foco={foco} onDisponibilidadeChange={setMapaDisponivel} />
      ) : (
        <View style={estilos.semMapa}><Icone nome="map-marker-off-outline" tamanho={40} corTema="texto2" /><Texto cor="texto2" style={estilos.centro}>{hipotesesPlanejar.mapaIndisponivel}</Texto></View>
      )}

      <SafeAreaView edges={['top']} pointerEvents="box-none" style={estilos.topo} onLayout={(evento) => setAlturaTopo(evento.nativeEvent.layout.height)}>
        <View pointerEvents="box-none" style={estilos.linhaTopo}>
          <BotaoIcone icone="arrow-left" rotulo={textos.comuns.fechar} onPress={() => router.back()} />
          <View style={estilos.busca}>
            <BuscaEndereco testID="campo-busca" valor={texto} onChange={setTexto} onBuscar={() => { void buscar(); }} buscando={buscando} ocultarAjuda={alturaTeclado > 0} />
          </View>
        </View>
        {!alturaTeclado ? <Texto variante="rotulo" accessibilityRole="header" style={[estilos.titulo, { backgroundColor: cores.fundo + 'D9' }]}>{titulo}</Texto> : null}
      </SafeAreaView>

      <View testID="painel-ponto" pointerEvents="box-none" style={[estilos.dock, { bottom: alturaTeclado, maxHeight: Math.max(0, alturaTela - alturaTeclado - alturaTopo - esp[2]) }]}>
        {!salvando || !alturaTeclado ? <Pressable
          accessibilityRole="button"
          accessibilityLabel={h.minhaLocalizacaoPilula}
          accessibilityState={{ disabled: obtendo, busy: obtendo }}
          disabled={obtendo}
          onPress={() => { void usarLocalizacao(); }}
          style={[estilos.localizar, { backgroundColor: cores.superficie2, borderColor: cores.borda }]}
        >
          <Icone nome="crosshairs-gps" corTema="acaoLink" tamanho={22} />
          <Texto variante="rotulo" style={estilos.textoLocalizar}>{h.minhaLocalizacaoPilula}</Texto>
        </Pressable> : null}
        <SafeAreaView edges={alturaTeclado ? [] : ['bottom']} style={[estilos.painel, { backgroundColor: cores.superficie, borderColor: cores.divisoria }]}>
          {!salvando ? <View style={[estilos.alca, { backgroundColor: cores.borda }]} /> : null}
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[estilos.conteudo, salvando && estilos.conteudoCompacto]} style={estilos.rolagem}>
            {!escolha ? <Texto cor="texto2">{h.toqueMapa}</Texto> : !salvando ? (
              <View style={estilos.escolhido}>
                <Icone nome="map-marker" tamanho={22} corTema="acaoLink" />
                <View style={estilos.textosEscolha}>
                  <Texto variante="rotulo" cor="texto2">{h.pontoEscolhido}</Texto>
                  <Texto variante="corpoForte" numberOfLines={2} accessibilityLiveRegion="polite">{rotuloEscolha}</Texto>
                  {!buscandoEndereco && !endereco ? <Texto variante="apoio" cor="texto2">{textos.planejar.pontoMapa}</Texto> : null}
                </View>
              </View>
            ) : null}
            {escolha && !salvando ? <Botao rotulo={h.salvarLugar} variante="texto" icone={<Icone nome="bookmark-outline" tamanho={18} corTema="acaoLink" />} onPress={() => setSalvando(true)} /> : null}
            {confirmacaoSalvo ? <Texto accessibilityLiveRegion="polite">{confirmacaoSalvo}</Texto> : null}
            {salvando && escolha ? <SalvarLugar endereco={rotuloEscolha} onSalvar={salvarLugar} onCancelar={() => setSalvando(false)} /> : null}
            {locais.length && !salvando ? (
              <View style={estilos.salvos}>
                <Texto variante="rotulo" cor="texto2">{h.lugaresSalvos}</Texto>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips} keyboardShouldPersistTaps="handled">
                  {locais.map((l) => (
                    <Pressable key={l.id} accessibilityRole="button" accessibilityLabel={l.nome} onPress={() => escolher(l.ponto, 'salvo', l.nome, true, l.endereco)} style={[estilos.chip, { borderColor: cores.borda, backgroundColor: cores.superficie2 }]}>
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
            {!salvando ? <Botao rotulo={hipotesesPlanejar.usarEstePonto} onPress={confirmar} desabilitado={!escolha || fora || !campoValido} /> : null}
          </ScrollView>
        </SafeAreaView>
      </View>
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
  dock: { position: 'absolute', left: 0, right: 0, gap: esp[2] },
  localizar: { alignSelf: 'flex-end', marginHorizontal: esp[3], maxWidth: '95%', minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: esp[2], paddingHorizontal: esp[3], paddingVertical: esp[2], borderWidth: 1, borderRadius: raio.pilula, flexShrink: 0 },
  textoLocalizar: { flexShrink: 1 },
  painel: { flexShrink: 1, borderTopLeftRadius: raio.painel, borderTopRightRadius: raio.painel, borderWidth: 1, borderBottomWidth: 0 },
  alca: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginTop: esp[2] },
  rolagem: { flexGrow: 0, flexShrink: 1 },
  conteudo: { padding: esp[4], gap: esp[3] },
  conteudoCompacto: { paddingVertical: esp[2], gap: esp[2] },
  escolhido: { flexDirection: 'row', alignItems: 'center', gap: esp[3] },
  textosEscolha: { flex: 1 },
  salvos: { gap: esp[2] },
  chips: { gap: esp[2] },
  chip: { flexDirection: 'row', alignItems: 'center', gap: esp[2], minHeight: 48, paddingHorizontal: esp[3], borderRadius: raio.pilula, borderWidth: 1 },
});
