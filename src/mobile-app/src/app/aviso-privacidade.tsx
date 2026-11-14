import { Stack } from 'expo-router';
import { View } from 'react-native';

import { Aviso, Tela, Texto } from '@/components';
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
    <Tela>
      <Stack.Screen options={{ title: textos.aviso.titulo }} />
      <Texto variante="titulo" accessibilityRole="header">{textos.aviso.titulo}</Texto>
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
