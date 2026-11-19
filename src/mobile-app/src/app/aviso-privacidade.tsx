import { Stack, router } from 'expo-router';
import { View } from 'react-native';

import { Aviso, Cabecalho, ImagemPlaceholder, Tela, Texto } from '@/components';
import { textos } from '@/textos';
import { hipotesesAviso } from '@/textos/hipotesesAviso';

const secoes = [
  [hipotesesAviso.pedimosTitulo, hipotesesAviso.pedimos],
  [hipotesesAviso.consultasTitulo, hipotesesAviso.consultas],
  [hipotesesAviso.localizacaoTitulo, hipotesesAviso.localizacao],
  [hipotesesAviso.buscaTitulo, hipotesesAviso.busca],
  [hipotesesAviso.locaisTitulo, hipotesesAviso.locais],
] as const;

export default function AvisoPrivacidade() {
  return (
    <Tela topo={<Cabecalho titulo={textos.aviso.titulo} navegacao={{ rotulo: textos.comuns.voltar, onPress: () => router.back() }} />}>
      <Stack.Screen options={{ title: textos.aviso.titulo, headerShown: false }} />
      <ImagemPlaceholder nome="heroPrivacidade" icone="shield-lock-outline" style={{ height: 140, borderRadius: 20 }} />
      <Aviso variante="minuta" texto={textos.aviso.minuta} />
      {secoes.map(([titulo, conteudo]) => (
        <View key={titulo}>
          <Texto variante="secao" accessibilityRole="header">{titulo}</Texto>
          <Texto>{conteudo}</Texto>
        </View>
      ))}
    </Tela>
  );
}
