import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { movimento } from '@/theme/tokens';

/**
 * Feedback de toque com mola (Reanimated): o conteúdo "afunda" ao pressionar e volta com mola.
 * Com "reduzir movimento" ligado ou desabilitado, não anima (D-28). Use o `estilo` num `Animated.View`
 * de `react-native-reanimated`.
 */
export function useFeedbackToque(desabilitado = false) {
  const reduzido = useReducedMotion();
  const progresso = useSharedValue(0);
  const parado = reduzido || desabilitado;

  function animar(pressionado: boolean) {
    if (parado) return;
    progresso.value = withSpring(pressionado ? 1 : 0, movimento.mola);
  }

  const estilo = useAnimatedStyle(() => ({
    opacity: 1 - (1 - movimento.opacidadePressionada) * progresso.value,
    transform: [{ scale: 1 - (1 - movimento.escalaPressionada) * progresso.value }],
  }));

  return {
    onPressIn: () => animar(true),
    onPressOut: () => animar(false),
    estilo,
    reduzido,
  };
}
