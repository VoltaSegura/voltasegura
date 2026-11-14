import { AccessibilityInfo, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';

import { brilho, esp } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { Texto } from './Texto';

type Props = {
  /** Texto ao lado do indicador; também é o que o leitor de tela anuncia. */
  texto: string;
  /** `tela`: centralizado e ocupando a área; `linha`: só o indicador com o texto. */
  variante?: 'tela' | 'linha';
};

/** Carregamento premium: o fio de luz pulsa. Com "reduzir movimento", fica aceso e parado. */
function FioPulsante() {
  const { cores } = useTema();
  const reduzido = useReducedMotion();
  const p = useSharedValue(reduzido ? 1 : 0.35);
  useEffect(() => {
    if (reduzido) { p.value = 1; return; }
    p.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [p, reduzido]);
  const estilo = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ scaleX: 0.55 + 0.45 * p.value }] }));
  return <Animated.View accessible={false} style={[estilos.fio, { backgroundColor: cores.luz }, brilho(cores.luz, 0.6), estilo]} />;
}

export function Carregando({ texto, variante = 'tela' }: Props) {
  const { cores } = useTema();
  useEffect(() => { AccessibilityInfo.announceForAccessibility(texto); }, [texto]);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={texto}
      accessibilityLiveRegion="polite"
      style={variante === 'tela' ? estilos.tela : estilos.linha}
    >
      {variante === 'tela' ? <FioPulsante /> : <ActivityIndicator color={cores.acao} size="small" />}
      <Texto variante="corpo" cor="texto2">
        {texto}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: esp[3], padding: esp[4] },
  fio: { width: 96, height: 4, borderRadius: 2 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: esp[2] },
});
