import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { Icone, type NomeIcone } from './Icone';
import { haptica, useFeedbackToque } from './movimento';

type Props = {
  icone: NomeIcone;
  /** Obrigatório: o botão só tem ícone, o leitor de tela lê este texto. */
  rotulo: string;
  onPress: () => void;
  /** `vidro` = círculo translúcido sobre imagem ou mapa; `plano` = sem fundo. */
  fundo?: 'vidro' | 'superficie' | 'plano';
  tamanho?: number;
  desabilitado?: boolean;
  testID?: string;
};

/** Botão redondo só com ícone. Alvo de toque de 48 pt no mínimo. */
export function BotaoIcone({ icone, rotulo, onPress, fundo = 'vidro', tamanho = toque.minimo, desabilitado = false, testID }: Props) {
  const { cores } = useTema();
  const feedback = useFeedbackToque(desabilitado);
  const lado = Math.max(tamanho, toque.minimo);
  const bg = fundo === 'vidro' ? cores.fundo + 'D9' : fundo === 'superficie' ? cores.superficie2 : 'transparent';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: desabilitado }}
      disabled={desabilitado}
      onPress={() => { haptica.leve(); onPress(); }}
      onPressIn={feedback.onPressIn}
      onPressOut={feedback.onPressOut}
      style={[estilos.base, { width: lado, height: lado, borderRadius: lado / 2, backgroundColor: bg }, desabilitado && { opacity: 0.5 }]}
    >
      <Animated.View style={feedback.estilo}><Icone nome={icone} tamanho={24} /></Animated.View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({ base: { alignItems: 'center', justifyContent: 'center' } });
