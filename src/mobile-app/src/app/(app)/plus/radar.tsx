import { useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';

import { Aviso, Botao, Icone, SeloExemplo, Tela, Texto } from '@/components';
import { FundoMapa } from '@/plus';
import { textos } from '@/textos';
import { esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

/**
 * TL-23: Radar da rota (mockup 13). Exemplo: não consulta dados nem calcula alternativa.
 * "Manter minha rota" só volta; a rota nunca muda sem escolha da pessoa (D-36).
 */
export default function Radar() {
  const { cores } = useTema();
  const [mostrarComo, setMostrarComo] = useState(false);
  const [alternativa, setAlternativa] = useState(false);

  function manter() {
    AccessibilityInfo.announceForAccessibility(textos.plus.manteve);
    router.back();
  }

  return (
    <Tela rolagem={false}>
      <Stack.Screen options={{ title: textos.plus.radarTitulo }} />
      <FundoMapa altura={300} testID="radar-mapa" />
      <View style={[estilos.painel, { backgroundColor: cores.superficie }]}>
        <View style={estilos.linhaTopo}>
          <View style={estilos.titulo}>
            <Icone nome="target" cor="texto" tamanho={22} />
            <Texto variante="secao" accessibilityRole="header">{textos.plus.radarFolha}</Texto>
          </View>
          <SeloExemplo />
        </View>
        <Texto variante="corpo">{textos.plus.radarCorpo}</Texto>
        <View style={[estilos.caixa, { backgroundColor: cores.superficie2 }]}>
          <Texto variante="apoio" cor="texto2">{textos.plus.radarSugestao}</Texto>
        </View>
        {alternativa ? <Aviso texto={textos.plus.alternativaExemplo} testID="radar-alternativa" /> : null}
        <Botao rotulo={textos.plus.verAlternativa} onPress={() => setAlternativa(true)} />
        <Botao rotulo={textos.plus.manterRota} variante="secundario" onPress={manter} />
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: mostrarComo }} onPress={() => setMostrarComo((v) => !v)} style={estilos.alvo}>
          <Texto variante="corpoForte" cor="acaoLink">{textos.plus.comoFunciona}</Texto>
        </Pressable>
        {mostrarComo ? <Texto variante="apoio" cor="texto2">{textos.plus.radarComo}</Texto> : null}
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  painel: { marginTop: -esp[6], borderTopLeftRadius: raio.painel, borderTopRightRadius: raio.painel, padding: esp[4], gap: esp[3] },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: esp[2] },
  titulo: { flexDirection: 'row', alignItems: 'center', gap: esp[2], flexShrink: 1 },
  caixa: { borderRadius: raio.medio, padding: esp[3] },
  alvo: { minHeight: toque.minimo, justifyContent: 'center' },
});
