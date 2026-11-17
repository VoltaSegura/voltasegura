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
      accessibilityHint={local.endereco || tipo.rotulo}
      onPress={() => { haptica.selecao(); onPress(); }}
      onPressIn={feedback.onPressIn}
      onPressOut={feedback.onPressOut}
    >
      <Animated.View style={[estilos.cartao, { backgroundColor: cores.superficie, borderColor: cores.divisoria }, feedback.estilo]}>
        <ImagemPlaceholder nome={tipo.imagem} icone={tipo.icone} style={estilos.imagem} />
        <View style={estilos.legenda}>
          <View style={estilos.linhaNome}>
            <Icone nome={tipo.icone} tamanho={18} corTema="acaoLink" />
            <Texto variante="corpoForte" numberOfLines={1} ellipsizeMode="tail" style={estilos.nome}>{local.nome}</Texto>
          </View>
          {local.endereco ? <Texto variante="apoio" cor="texto2" numberOfLines={1} ellipsizeMode="tail">{local.endereco}</Texto> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export const LARGURA_CARTAO_LOCAL = 148;

const estilos = StyleSheet.create({
  cartao: { width: LARGURA_CARTAO_LOCAL, borderRadius: raio.grande, borderWidth: 1, overflow: 'hidden' },
  imagem: { height: 96, width: '100%' },
  legenda: { minHeight: 84, justifyContent: 'center', gap: esp[1], paddingHorizontal: esp[3], paddingVertical: esp[3] },
  linhaNome: { flexDirection: 'row', alignItems: 'center', gap: esp[2] },
  nome: { flex: 1 },
  adicionar: { minHeight: 96 + 84, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: esp[2], padding: esp[3] },
  centro: { textAlign: 'center' },
});

/** Último cartão da faixa de lugares: convida a adicionar um lugar (abre o mapa). */
export function CartaoAdicionarLocal({ rotulo, onPress, testID }: { rotulo: string; onPress: () => void; testID?: string }) {
  const { cores } = useTema();
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={rotulo} onPress={() => { haptica.leve(); onPress(); }}>
      <View style={[estilos.cartao, estilos.adicionar, { borderColor: cores.borda }]}>
        <Icone nome="plus-circle-outline" tamanho={32} corTema="acaoLink" />
        <Texto variante="corpoForte" style={estilos.centro}>{rotulo}</Texto>
      </View>
    </Pressable>
  );
}

