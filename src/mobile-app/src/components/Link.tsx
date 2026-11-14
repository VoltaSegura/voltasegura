import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useState } from 'react';

import { esp, toque } from '@/theme/tokens';

import { medidas } from './medidas';
import { useFeedbackToque } from './movimento';
import { Texto } from './Texto';
import { useTema } from '@/theme/useTema';

type Props = {
  rotulo: string;
  onPress: () => void;
  /** `acao`: link de ação; `dado`: link sobre os dados. */
  variante?: 'acao' | 'dado';
  desabilitado?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function Link({ rotulo, onPress, variante = 'acao', desabilitado = false, testID, style }: Props) {
  const feedback = useFeedbackToque(desabilitado);
  const { cores } = useTema();
  const [focado, setFocado] = useState(false);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="link"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: desabilitado }}
      disabled={desabilitado}
      onPress={onPress}
      onPressIn={feedback.onPressIn}
      onPressOut={feedback.onPressOut}
      onFocus={() => setFocado(true)}
      onBlur={() => setFocado(false)}
      style={({ pressed }) => [estilos.base, (focado || (pressed && feedback.reduzido)) && !desabilitado && { ...estilos.foco, borderColor: cores.borda }, desabilitado && { opacity: medidas.opacidadeDesabilitado }, style]}
    >
      <Animated.View style={feedback.estilo}><Texto
        variante="apoio"
        cor={variante === 'dado' ? 'dado' : 'acaoLink'}
        style={estilos.texto}
      >
        {rotulo}
      </Texto></Animated.View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: { minHeight: toque.minimo, minWidth: toque.minimo, justifyContent: 'center', paddingHorizontal: esp[2] },
  texto: { textDecorationLine: 'underline' },
  foco: { borderWidth: medidas.bordaFoco, borderRadius: 6 },
});
