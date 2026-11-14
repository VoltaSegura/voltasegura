import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao, FioLuz, ImagemPlaceholder, Link, Texto } from '@/components';
import { Entrada } from '@/components/movimento';
import { textos } from '@/textos';
import { esp } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

/** TL-01 (D-29): imagem em tela cheia, marca e frase por cima, botões embaixo (referência "plantas", abertura). */
export default function Abertura() {
  const router = useRouter();
  const { cores } = useTema();

  return (
    <View style={[estilos.base, { backgroundColor: cores.fundo }]}>
      <Stack.Screen options={{ title: textos.abertura.titulo }} />
      <ImagemPlaceholder nome="heroAbertura" icone="city-variant-outline" style={StyleSheet.absoluteFill} />
      <SafeAreaView style={estilos.conteudo}>
        <View style={estilos.texto}>
          <Entrada indice={0}><Texto variante="marca" accessibilityRole="header">{textos.abertura.titulo}</Texto></Entrada>
          <Entrada indice={1}><FioLuz /></Entrada>
          <Entrada indice={2}><Texto variante="destaque" cor="texto2">{textos.abertura.frase}</Texto></Entrada>
        </View>
        <Entrada indice={3} style={estilos.botoes}>
          <Botao rotulo={textos.abertura.criarConta} onPress={() => router.push('/criar-conta')} />
          <Botao rotulo={textos.abertura.entrar} variante="secundario" onPress={() => router.push('/entrar')} />
        </Entrada>
        <Entrada indice={4}><Link rotulo={textos.abertura.aviso} onPress={() => router.push('/aviso-privacidade')} /></Entrada>
      </SafeAreaView>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { flex: 1 },
  conteudo: { flex: 1, justifyContent: 'flex-end', padding: esp[4], gap: esp[4] },
  texto: { gap: esp[4], paddingBottom: esp[4] },
  botoes: { gap: esp[3] },
});
