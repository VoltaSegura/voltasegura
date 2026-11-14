import { StyleSheet, View } from 'react-native';

import { esp } from '@/theme/tokens';

import { Botao } from './Botao';
import { Texto } from './Texto';

type Props = {
  texto: string;
  titulo?: string;
  acao?: { rotulo: string; onPress: () => void };
};

export function EstadoVazio({ texto, titulo, acao }: Props) {
  return (
    <View style={estilos.base}>
      {titulo ? <Texto variante="destaque">{titulo}</Texto> : null}
      <Texto variante="corpo" cor="texto2" style={estilos.centro}>
        {texto}
      </Texto>
      {acao ? <Botao variante="secundario" rotulo={acao.rotulo} onPress={acao.onPress} /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { alignItems: 'center', gap: esp[3], padding: esp[6] },
  centro: { textAlign: 'center' },
});
