import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';

import { Aviso, Botao, Cabecalho, Carregando, ImagemPlaceholder, Link, Tela, Texto } from '@/components';
import { haptica } from '@/components/movimento';
import { useConsulta } from '@/consulta';
import { textos } from '@/textos';
import { hipotesesPlanejar } from '@/textos/hipotesesPlanejar';
import { esp } from '@/theme/tokens';

/** Depois deste tempo de espera, a tela mostra uma linha neutra sobre a demora. */
export const ESPERA_AVISO_DEMORA_MS = 8000;

export default function Buscando() {
  const { estado, buscar, cancelarBusca } = useConsulta();
  const { busca, consulta } = estado;
  const iniciou = useRef(false);
  const buscaInicial = useRef(busca);
  const repetindo = useRef(false);
  const [demorou, setDemorou] = useState(false);
  const esperando = busca.status === 'ocioso' || busca.status === 'buscando';

  useEffect(() => {
    if (!esperando) return;
    const id = setTimeout(() => {
      setDemorou(true);
      AccessibilityInfo.announceForAccessibility(textos.buscando.demora);
    }, ESPERA_AVISO_DEMORA_MS);
    return () => clearTimeout(id);
  }, [esperando]);

  useEffect(() => {
    if (!iniciou.current) {
      iniciou.current = true;
      void buscar();
    }
  }, [buscar]);

  useEffect(() => {
    if (busca !== buscaInicial.current && busca.status === 'sucesso' && busca.resposta.rotas.length > 0) {
      haptica.sucesso();
      AccessibilityInfo.announceForAccessibility(hipotesesPlanejar.alternativasEncontradas);
      router.replace('/resultado');
    }
  }, [busca]);

  useEffect(() => {
    if (busca.status === 'erro' && busca.erro.tipo === 'NAO_AUTORIZADO') {
      AccessibilityInfo.announceForAccessibility(hipotesesPlanejar.sessaoExpirada);
      router.replace('/entrar');
    }
  }, [busca]);

  useEffect(() => {
    if (busca.status === 'erro' && busca.erro.tipo !== 'NAO_AUTORIZADO') haptica.erro();
  }, [busca]);

  const voltar = () => { cancelarBusca(); router.replace('/planejar'); };
  const mudarHorario = () => { cancelarBusca(); router.replace({ pathname: '/planejar', params: { foco: 'horario' } }); };
  const hora = Number.isNaN(Date.parse(consulta.saida)) ? '--:--' :
    new Date(consulta.saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const resumo = hipotesesPlanejar.buscarResumo(consulta.sentido === 'volta' ? textos.planejar.volta : textos.planejar.ida, hora);
  const semTransporte = busca.status === 'sucesso' && busca.resposta.rotas.length === 0;
  const mensagem = semTransporte ? textos.buscando.semTransporte : busca.status === 'erro'
    ? busca.erro.tipo === 'SEM_REDE' ? hipotesesPlanejar.semRede
      : busca.erro.tipo === 'FORA_DA_AREA' ? textos.planejar.foraArea
      : busca.erro.tipo === 'VALIDACAO' ? busca.problemas?.includes('ORIGEM_AUSENTE') ? textos.planejar.erroOrigem
        : busca.problemas?.includes('DESTINO_AUSENTE') ? textos.planejar.erroDestino
        : busca.problemas?.includes('ORIGEM_IGUAL_DESTINO') ? textos.planejar.mesmoLugar
        : busca.problemas?.includes('SAIDA_INVALIDA') ? hipotesesPlanejar.saidaInvalida : textos.comuns.erro.servidor
      : busca.erro.status === 504 ? textos.comuns.erro.tempoEsgotado
      : textos.comuns.erro.servidor
    : null;

  return (
    <Tela rolagem={false} topo={<Cabecalho titulo={resumo} navegacao={{ rotulo: textos.comuns.voltar, onPress: voltar }} />}>
      <ScrollView style={estilos.rolagem} contentContainerStyle={estilos.conteudo}>
        <Stack.Screen options={{ title: textos.buscando.texto }} />
        {busca.status === 'ocioso' || busca.status === 'buscando' ? (
          <View style={estilos.espera}>
            <ImagemPlaceholder nome="heroBuscando" icone="map-search-outline" style={estilos.imagem} />
            <Carregando texto={textos.buscando.texto} />
            {esperando && demorou ? <Texto testID="buscando-demora">{textos.buscando.demora}</Texto> : null}
            <Texto>{textos.buscando.privacidade}</Texto>
            <Botao rotulo={textos.comuns.cancelar} variante="secundario" onPress={voltar} />
          </View>
        ) : null}
        {mensagem ? <ImagemPlaceholder nome="vazioBusca" icone={semTransporte ? 'bus-clock' : 'cloud-off-outline'} style={estilos.imagem} /> : null}
        {mensagem ? <Aviso texto={mensagem} variante={semTransporte ? 'informativo' : 'erro'} /> : null}
        {semTransporte ? <Botao rotulo={textos.buscando.mudarHorario} onPress={mudarHorario} /> : null}
        {busca.status === 'erro' ? (
          <>
            <Botao rotulo={textos.comuns.tentarDeNovo} onPress={() => { if (repetindo.current) return; repetindo.current = true; void buscar().finally(() => { repetindo.current = false; }); }} />
            <Link rotulo={textos.comuns.erro.voltarPlanejamento} onPress={voltar} />
          </>
        ) : null}
      </ScrollView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  rolagem: { flex: 1 },
  conteudo: { flexGrow: 1, justifyContent: 'center', gap: esp[4] },
  espera: { gap: esp[4] },
  imagem: { height: 150, width: '100%', borderRadius: 20 },
});
