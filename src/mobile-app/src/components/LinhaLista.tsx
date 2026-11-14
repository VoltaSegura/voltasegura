import { Pressable, StyleSheet, View } from 'react-native';

import { esp, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { medidas } from './medidas';
import { Texto } from './Texto';

type Props = {
  titulo: string;
  detalhe?: string;
  /** Texto à direita (ex.: valor). */
  valor?: string;
  /** Se informado, a linha é um botão. */
  onPress?: () => void;
  /** Sem divisória (última linha). */
  semDivisoria?: boolean;
  testID?: string;
};

/** Linha simples de lista: divisória em `borda`, sem sombra nem borda (R-03). */
export function LinhaLista({ titulo, detalhe, valor, onPress, semDivisoria = false, testID }: Props) {
  const { cores } = useTema();
  const rotulo = [titulo, detalhe, valor].filter(Boolean).join('. ');
  const corpo = (
    <>
      <View style={estilos.textos}>
        <Texto variante="corpo">{titulo}</Texto>
        {detalhe ? (
          <Texto variante="apoio" cor="texto2">
            {detalhe}
          </Texto>
        ) : null}
      </View>
      {valor ? (
        <Texto variante="corpoForte" style={estilos.valor}>
          {valor}
        </Texto>
      ) : null}
    </>
  );
  const estilo = [
    estilos.base,
    !semDivisoria && { borderBottomWidth: medidas.borda, borderBottomColor: cores.borda },
  ];

  if (!onPress) {
    return (
      <View testID={testID} accessible accessibilityLabel={rotulo} style={estilo}>
        {corpo}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      onPress={onPress}
      style={({ pressed }) => [estilo, pressed && { backgroundColor: cores.superficie2 }]}
    >
      {corpo}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', gap: esp[3], minHeight: toque.minimo, paddingVertical: esp[2] },
  textos: { flex: 1 },
  valor: { textAlign: 'right' },
});
