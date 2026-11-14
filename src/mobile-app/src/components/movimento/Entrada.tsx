import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { movimento } from '@/theme/tokens';

type Props = {
  children: React.ReactNode;
  /** Posição na sequência (0 = primeiro). O atraso é `indice * escalonamentoMs`, com teto para listas longas. */
  indice?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Entrada em sequência (stagger): sobe 14 pt e aparece com mola, uma vez, ao montar.
 * Com "reduzir movimento", aparece direto, sem deslocamento. Só `transform` e `opacity`.
 */
export function Entrada({ children, indice = 0, style }: Props) {
  const reduzido = useReducedMotion();
  const progresso = useSharedValue(reduzido ? 1 : 0);

  useEffect(() => {
    if (reduzido) {
      progresso.value = 1;
      return;
    }
    const atraso = Math.min(indice, 6) * movimento.escalonamentoMs;
    progresso.value = withDelay(atraso, withSpring(1, movimento.mola));
  }, [indice, progresso, reduzido]);

  const estilo = useAnimatedStyle(() => ({
    opacity: Math.min(1, progresso.value * 1.4),
    transform: [{ translateY: (1 - progresso.value) * movimento.entradaDeslocamento }],
  }));

  return <Animated.View style={[style, estilo]}>{children}</Animated.View>;
}
