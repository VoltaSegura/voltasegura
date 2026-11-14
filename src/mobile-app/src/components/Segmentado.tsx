import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useState } from 'react';

import { esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { Texto } from './Texto';
import { haptica, useFeedbackToque } from './movimento';

export type OpcaoSegmentada = { valor: string; rotulo: string };

type Props = {
  /** Rótulo do grupo (lido pelo leitor de tela). */
  rotuloGrupo: string;
  opcoes: OpcaoSegmentada[];
  valor: string;
  onChange: (valor: string) => void;
  /** Papel de cada opção: `radio` (SeletorSentido) ou `tab` (SeletorRota). */
  papel?: 'radio' | 'tab';
  testID?: string;
};

/** Base de `SeletorSentido` e `SeletorRota`: trilha em `superficie2`, opção selecionada em `acao`. */
export function Segmentado({ rotuloGrupo, opcoes, valor, onChange, papel = 'radio', testID }: Props) {
  const { cores } = useTema();
  return (
    <View
      testID={testID}
      accessibilityRole={papel === 'tab' ? 'tablist' : 'radiogroup'}
      accessibilityLabel={rotuloGrupo}
      style={[estilos.trilha, { backgroundColor: cores.superficie2 }]}
    >
      {opcoes.map((o) => {
        const selecionada = o.valor === valor;
        return <Opcao key={o.valor} rotulo={o.rotulo} selecionada={selecionada} papel={papel} onPress={() => onChange(o.valor)} cores={cores} />;
      })}
    </View>
  );
}

function Opcao({ rotulo, selecionada, papel, onPress, cores }: {
  rotulo: string; selecionada: boolean; papel: 'radio' | 'tab'; onPress: () => void;
  cores: ReturnType<typeof useTema>['cores'];
}) {
  const feedback = useFeedbackToque();
  const [focado, setFocado] = useState(false);
  return <Pressable
    accessibilityRole={papel === 'tab' ? 'tab' : 'radio'}
    accessibilityLabel={rotulo}
    accessibilityState={{ selected: selecionada, checked: papel === 'radio' ? selecionada : undefined }}
    onPress={() => { haptica.selecao(); onPress(); AccessibilityInfo.announceForAccessibility(rotulo); }}
    onPressIn={feedback.onPressIn}
    onPressOut={feedback.onPressOut}
    onFocus={() => setFocado(true)}
    onBlur={() => setFocado(false)}
    style={({ pressed }) => [estilos.opcao, selecionada && { backgroundColor: cores.acao }, (focado || (pressed && feedback.reduzido)) && { borderWidth: 2, borderColor: cores.borda }]}
  >
    <Animated.View style={feedback.estilo}><Texto variante="corpoForte" cor={selecionada ? 'acaoTexto' : 'texto'} style={estilos.texto}>{rotulo}</Texto></Animated.View>
  </Pressable>;
}

const estilos = StyleSheet.create({
  trilha: { flexDirection: 'row', borderRadius: raio.medio, padding: esp[1], gap: esp[1] },
  opcao: {
    flex: 1,
    minHeight: toque.minimo,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raio.medio,
    paddingHorizontal: esp[2],
    minWidth: 0,
  },
  texto: { textAlign: 'center' },
});
