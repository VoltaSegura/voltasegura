import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { Aviso, BotaoIcone, Botao, Hero, Tela, Texto } from '@/components';
import { CampoPonto, CartaoLocal, SeletorHorario } from '@/components/planejar';
import { Entrada } from '@/components/movimento';
import { useConsulta, validarConsulta, type CodigoProblema } from '@/consulta';
import { useLocais, type LocalSalvo } from '@/locais';
import { textos } from '@/textos';
import { hipotesesMapa as h } from '@/textos/hipotesesMapa';
import { hipotesesPlanejar } from '@/textos/hipotesesPlanejar';
import { esp, raio } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

type Campo = 'origem' | 'destino';

export default function Planejar() {
  const { sentido: sentidoParam, foco } = useLocalSearchParams<{ sentido?: string; foco?: string }>();
  const { estado, rotulos, definirOrigem, definirDestino, definirSentido, definirSaida, inverterPontos, planejarVolta } = useConsulta();
  const { consulta, busca } = estado;
  const [validacao, setValidacao] = useState<{ chave: string; problemas: CodigoProblema[] } | null>(null);
  const [horaValida, setHoraValida] = useState(true);
  const [focarHora, setFocarHora] = useState(foco === 'horario');
  const parametroAplicado = useRef(false);
  const { locais } = useLocais();
  const { cores } = useTema();
  const chaveConsulta = JSON.stringify([consulta.origem, consulta.destino, consulta.saida, consulta.sentido]);
  const problemas = validacao?.chave === chaveConsulta ? validacao.problemas : [];

  useEffect(() => {
    if (parametroAplicado.current || sentidoParam !== 'volta') return;
    parametroAplicado.current = true;
    if (consulta.sentido === 'volta') return;
    if (consulta.origem || consulta.destino) planejarVolta();
    else definirSentido('volta');
  }, [sentidoParam, consulta.sentido, consulta.origem, consulta.destino, planejarVolta, definirSentido]);

  function verificar() {
    const encontrados = validarConsulta(consulta);
    if (!horaValida && !encontrados.includes('SAIDA_INVALIDA')) encontrados.push('SAIDA_INVALIDA');
    setValidacao({ chave: chaveConsulta, problemas: encontrados });
    if (encontrados.length === 0) router.push('/buscando');
    else {
      if (encontrados.includes('ORIGEM_AUSENTE')) abrir('origem');
      else if (encontrados.includes('DESTINO_AUSENTE')) abrir('destino');
      else if (encontrados.includes('SAIDA_INVALIDA')) setFocarHora(true);
      AccessibilityInfo.announceForAccessibility(encontrados.includes('ORIGEM_AUSENTE') ? textos.planejar.erroOrigem : encontrados.includes('DESTINO_AUSENTE') ? textos.planejar.erroDestino : encontrados.includes('SAIDA_INVALIDA') ? hipotesesPlanejar.erroHora : textos.planejar.mesmoLugar);
    }
  }

  /** D-29: tocar no campo abre direto o mapa (com busca, localização e lugares salvos). */
  function abrir(campo: Campo) { router.push({ pathname: '/escolher-ponto', params: { campo } }); }

  /** Lugar salvo com um toque: preenche o destino; se o destino já está certo e falta a origem, preenche a origem. */
  function usarLugar(lugar: LocalSalvo) {
    const comoOrigem = !consulta.origem && !!consulta.destino;
    if (comoOrigem) definirOrigem(lugar.ponto, lugar.nome);
    else definirDestino(lugar.ponto, lugar.nome);
    setValidacao(null);
    AccessibilityInfo.announceForAccessibility(comoOrigem ? h.lugarUsadoComoOrigem(lugar.nome) : h.lugarUsadoComoDestino(lugar.nome));
  }

  const foraArea = problemas.includes('FORA_DA_AREA') || (busca.status === 'erro' && busca.erro.tipo === 'FORA_DA_AREA');
  const rotuloOrigem = consulta.origem ? rotulos?.origem ?? textos.planejar.pontoMapa : textos.planejar.escolherOrigem;
  const rotuloDestino = consulta.destino ? rotulos?.destino ?? textos.planejar.pontoMapa : textos.planejar.escolherDestino;

  const volta = consulta.sentido === 'volta';
  const dia = Number.isNaN(Date.parse(consulta.saida)) ? '--' : new Date(consulta.saida).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

  return <Tela hero={
    <Hero
      imagem="heroPlanejar"
      icone="city-variant-outline"
      direita={<BotaoIcone icone="cog-outline" rotulo={textos.config.titulo} onPress={() => router.push('/configuracoes')} />}
    >
      <Texto variante="rotulo" cor="acaoLink">{textos.abertura.titulo}</Texto>
      <Texto variante="titulo" accessibilityRole="header">{h.saudacao}</Texto>
      <Texto variante="apoio" cor="texto2">{h.subtitulo}</Texto>
    </Hero>
  }>
    <Stack.Screen options={{ title: textos.abertura.titulo }} />
    {volta ? <View style={[estilos.etiqueta, { backgroundColor: cores.superficie2 }]}><Texto variante="rotulo" accessibilityRole="header">{h.planejandoVolta}</Texto></View> : null}
    <Entrada indice={0}>
      <View style={[estilos.painel, { backgroundColor: cores.superficie, borderColor: cores.divisoria }]}>
        <CampoPonto rotulo={textos.planejar.deOnde} icone="circle-outline" valor={consulta.origem ? rotuloOrigem : h.deOndeVazio} preenchido={!!consulta.origem} erro={problemas.includes('ORIGEM_AUSENTE') ? textos.planejar.erroOrigem : undefined} onPress={() => abrir('origem')} />
        <View style={estilos.separador}>
          <View style={[estilos.fio, { backgroundColor: cores.divisoria }]} />
          <BotaoIcone icone="swap-vertical" rotulo={textos.planejar.inverter} fundo="superficie" onPress={() => { inverterPontos(); setValidacao(null); AccessibilityInfo.announceForAccessibility(hipotesesPlanejar.pontosInvertidos); }} />
        </View>
        <CampoPonto rotulo={textos.planejar.paraOnde} icone="map-marker" valor={consulta.destino ? rotuloDestino : h.paraOndeVazio} preenchido={!!consulta.destino} erro={problemas.includes('DESTINO_AUSENTE') ? textos.planejar.erroDestino : undefined} onPress={() => abrir('destino')} />
      </View>
    </Entrada>
    <Entrada indice={1}>
      <SeletorHorario rotulo={volta ? textos.planejar.saidaVolta : textos.planejar.saida} saida={consulta.saida} onChange={definirSaida} onValidadeChange={setHoraValida} focar={focarHora || foco === 'horario'} />
      <Texto variante="apoio" cor="texto2">{hipotesesPlanejar.diaSaida}: {dia}</Texto>
    </Entrada>
    {foco === 'horario' ? <Texto variante="apoio" cor="texto2">{hipotesesPlanejar.retornoHorario}</Texto> : null}
    {problemas.includes('SAIDA_INVALIDA') ? <Aviso texto={hipotesesPlanejar.saidaInvalida} variante="erro" /> : null}
    {problemas.includes('ORIGEM_IGUAL_DESTINO') ? <Aviso texto={textos.planejar.mesmoLugar} variante="erro" /> : null}
    {foraArea ? <Aviso texto={textos.planejar.foraArea} variante="erro" /> : null}
    <Botao rotulo={textos.planejar.verAlternativas} onPress={verificar} />
    <Entrada indice={2} style={estilos.lugares}>
      <Texto variante="secao" accessibilityRole="header">{h.lugaresSalvos}</Texto>
      {locais.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.faixa}>
          {locais.map((l) => <CartaoLocal key={l.id} local={l} onPress={() => usarLugar(l)} />)}
        </ScrollView>
      ) : <Texto variante="apoio" cor="texto2">{h.lugaresVazio}</Texto>}
    </Entrada>
  </Tela>;
}

const estilos = StyleSheet.create({
  painel: { borderRadius: raio.painel, borderWidth: 1, padding: esp[2] },
  separador: { flexDirection: 'row', alignItems: 'center', gap: esp[2], paddingLeft: esp[2] + 17 },
  fio: { flex: 1, height: 1 },
  etiqueta: { alignSelf: 'flex-start', borderRadius: raio.pilula, paddingHorizontal: esp[3], paddingVertical: esp[1] },
  lugares: { gap: esp[3] },
  faixa: { gap: esp[3], paddingRight: esp[4] },
});
