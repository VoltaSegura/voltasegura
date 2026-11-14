import { Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { esp, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { medidas } from './medidas';
import { Texto } from './Texto';

type Props = {
  rotulo: string;
  ligado: boolean;
  onChange: (ligado: boolean) => void;
  desabilitado?: boolean;
  testID?: string;
};

export function Interruptor({ rotulo, ligado, onChange, desabilitado = false, testID }: Props) {
  const { cores } = useTema();
  const [focado, setFocado] = useState(false);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityLabel={rotulo}
      accessibilityState={{ checked: ligado, disabled: desabilitado }}
      disabled={desabilitado}
      onPress={() => onChange(!ligado)}
      onFocus={() => setFocado(true)}
      onBlur={() => setFocado(false)}
      style={[estilos.linha, focado && !desabilitado && { borderWidth: medidas.bordaFoco, borderColor: cores.borda, borderRadius: 6 }, desabilitado && { opacity: medidas.opacidadeDesabilitado }]}
    >
      <Texto variante="corpo" style={estilos.texto}>
        {rotulo}
      </Texto>
      <View
        style={[
          estilos.trilha,
          {
            backgroundColor: ligado ? cores.acao : cores.superficie2,
            borderColor: ligado ? cores.acao : cores.borda,
            alignItems: ligado ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        <View style={[estilos.pino, { backgroundColor: ligado ? cores.acaoTexto : cores.texto2 }]} />
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: esp[3], minHeight: toque.minimo },
  texto: { flex: 1 },
  trilha: {
    width: medidas.interruptorLargura,
    height: medidas.interruptorAltura,
    borderRadius: medidas.interruptorAltura,
    borderWidth: medidas.borda,
    justifyContent: 'center',
    padding: esp[1] / 2,
  },
  pino: { width: medidas.interruptorPino, height: medidas.interruptorPino, borderRadius: medidas.interruptorPino },
});
