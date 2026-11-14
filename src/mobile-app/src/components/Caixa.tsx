import { Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { medidas } from './medidas';
import { Texto } from './Texto';

type Props = {
  /** Texto ao lado; o alvo de toque inclui o texto. Pode conter links no futuro (hoje, só texto). */
  rotulo: string;
  marcada: boolean;
  onChange: (marcada: boolean) => void;
  erro?: string;
  desabilitado?: boolean;
  testID?: string;
};

export function Caixa({ rotulo, marcada, onChange, erro, desabilitado = false, testID }: Props) {
  const { cores } = useTema();
  const [focado, setFocado] = useState(false);
  return (
    <View style={estilos.base}>
      <Pressable
        testID={testID}
        accessibilityRole="checkbox"
        accessibilityLabel={rotulo}
        accessibilityHint={erro}
        accessibilityState={{ checked: marcada, disabled: desabilitado }}
        disabled={desabilitado}
        onPress={() => onChange(!marcada)}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        style={[estilos.alvo, focado && !desabilitado && { borderWidth: medidas.bordaFoco, borderColor: cores.borda, borderRadius: raio.pequeno }, desabilitado && { opacity: medidas.opacidadeDesabilitado }]}
      >
        <View
          style={[
            estilos.quadro,
            {
              borderColor: erro ? cores.erro : cores.borda,
              backgroundColor: marcada ? cores.acao : 'transparent',
            },
          ]}
        >
          {marcada ? (
            <Texto variante="rotulo" cor="acaoTexto" accessibilityElementsHidden importantForAccessibility="no">
              ✓
            </Texto>
          ) : null}
        </View>
        <Texto variante="corpo" style={estilos.texto}>
          {rotulo}
        </Texto>
      </Pressable>
      {erro ? (
        <Texto variante="apoio" cor="erro" accessibilityLiveRegion="polite" accessibilityRole="alert">
          {erro}
        </Texto>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { gap: esp[1] },
  alvo: { flexDirection: 'row', alignItems: 'center', gap: esp[3], minHeight: toque.minimo },
  quadro: {
    width: medidas.caixa,
    height: medidas.caixa,
    borderWidth: medidas.bordaFoco,
    borderRadius: raio.pequeno,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { flex: 1 },
});
