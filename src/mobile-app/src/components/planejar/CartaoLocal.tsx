import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import type { LocalSalvo } from '@/locais';
import { esp, raio } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { Icone } from '../Icone';
import { ImagemPlaceholder } from '../ImagemPlaceholder';
import { haptica, useFeedbackToque } from '../movimento';
import { Texto } from '../Texto';
import { infoTipo } from './tiposLocal';

type Props = { local: LocalSalvo; onPress: () => void; testID?: string };

/** Cartão de lugar salvo: imagem em cima, nome embaixo (referência "Popular locations", D-29). */
export function CartaoLocal({ local, onPress, testID }: Props) {
  const { cores } = useTema();
  const feedback = useFeedbackToque();
  const tipo = infoTipo[local.tipo];
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={local.nome}
      accessibilityHint={tipo.rotulo}
      onPress={() => { haptica.selecao(); onPress(); }}
      onPressIn={feedback.onPressIn}
      onPressOut={feedback.onPressOut}
    >
      <Animated.View style={[estilos.cartao, { backgroundColor: cores.superficie, borderColor: cores.divisoria }, feedback.estilo]}>
        <ImagemPlaceholder nome={tipo.imagem} icone={tipo.icone} style={estilos.imagem} />
        <View style={estilos.legenda}>
          <Icone nome={tipo.icone} tamanho={18} corTema="acaoLink" />
          <Texto variante="corpoForte" numberOfLines={1} style={estilos.nome}>{local.nome}</Texto>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: { width: 148, borderRadius: raio.grande, borderWidth: 1, overflow: 'hidden' },
  imagem: { height: 96, width: '100%' },
  legenda: { flexDirection: 'row', alignItems: 'center', gap: esp[2], paddingHorizontal: esp[3], paddingVertical: esp[3] },
  nome: { flex: 1 },
});
