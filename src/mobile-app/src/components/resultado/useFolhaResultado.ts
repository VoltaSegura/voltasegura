import { useEffect, useRef } from 'react';
import { AccessibilityInfo, PanResponder } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { hipotesesResultado } from '@/textos/hipotesesResultado';

/** [HIPÓTESE] Arraste apenas na alça, sem disputar os gestos da lista. */
export function useFolhaResultado(altura: number | undefined, nivel: number, onExpandir: () => void, onRecolher?: () => void) {
  const reduzido = useReducedMotion();
  const deslocamento = useSharedValue(0);
  const anterior = useRef(altura);
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesto) => Math.abs(gesto.dy) > 12 && Math.abs(gesto.dy) > Math.abs(gesto.dx),
    onPanResponderMove: (_, gesto) => {
      // Limita o deslocamento: o snap continua sendo a fonte da altura da folha.
      deslocamento.value = reduzido ? 0 : Math.max(-64, Math.min(64, gesto.dy));
    },
    onPanResponderRelease: (_, gesto) => {
      deslocamento.value = reduzido ? 0 : withTiming(0, { duration: 180 });
      if (gesto.dy < -32 && nivel < 2) onExpandir();
      else if (gesto.dy > 32 && nivel > 0) onRecolher?.();
    },
    onPanResponderTerminate: () => {
      deslocamento.value = reduzido ? 0 : withTiming(0, { duration: 180 });
    },
  });
  useEffect(() => {
    const diferenca = (altura ?? 0) - (anterior.current ?? altura ?? 0);
    anterior.current = altura;
    deslocamento.value = reduzido ? 0 : diferenca;
    deslocamento.value = reduzido ? 0 : withTiming(0, { duration: 180 });
  }, [altura, reduzido, deslocamento]);
  const estiloAnimado = useAnimatedStyle(() => ({ transform: [{ translateY: deslocamento.value }] }));
  const ultimoNivel = useRef(nivel);
  useEffect(() => {
    if (ultimoNivel.current !== nivel) {
      AccessibilityInfo.announceForAccessibility(hipotesesResultado.alturas[nivel]);
      ultimoNivel.current = nivel;
    }
  }, [nivel]);
  return { estiloAnimado, panHandlers: panResponder.panHandlers };
}
