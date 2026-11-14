import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import Animated from 'react-native-reanimated';

import { brilho, esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { medidas } from './medidas';
import { haptica, useFeedbackToque } from './movimento';
import { Texto } from './Texto';

export type VarianteBotao = 'primario' | 'secundario' | 'destrutivo' | 'texto';

type Props = {
  rotulo: string;
  onPress: () => void;
  variante?: VarianteBotao;
  desabilitado?: boolean;
  carregando?: boolean;
  /** Texto exibido (e anunciado) enquanto carrega, ex.: "Criando…". Padrão: o rótulo. */
  rotuloCarregando?: string;
  /** Anunciado pelo leitor quando carregando (ex.: textos.comuns.carregando). */
  anuncioCarregando?: string;
  icone?: React.ReactNode;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function Botao({
  rotulo,
  onPress,
  variante = 'primario',
  desabilitado = false,
  carregando = false,
  rotuloCarregando,
  anuncioCarregando,
  icone,
  accessibilityHint,
  testID,
  style,
}: Props) {
  const { cores } = useTema();
  const inativo = desabilitado || carregando;
  const feedback = useFeedbackToque(inativo);
  const [focado, setFocado] = useState(false);
  const primario = variante === 'primario';
  const textoVisivel = carregando && rotuloCarregando ? rotuloCarregando : rotulo;
  const corTexto = primario ? 'acaoTexto' : variante === 'destrutivo' ? 'erro' : 'texto';
  const rotuloA11y = carregando && anuncioCarregando ? `${textoVisivel}. ${anuncioCarregando}` : textoVisivel;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={rotuloA11y}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      disabled={inativo}
      onPress={() => { if (variante !== 'texto') haptica.leve(); onPress(); }}
      onPressIn={feedback.onPressIn}
      onPressOut={feedback.onPressOut}
      onFocus={() => setFocado(true)}
      onBlur={() => setFocado(false)}
      style={({ pressed }) => [
        estilos.base,
        primario && [{ backgroundColor: cores.acao }, brilho(cores.luz, 0.3)],
        variante === 'secundario' && { borderWidth: medidas.borda, borderColor: cores.borda },
        variante === 'destrutivo' && { borderWidth: medidas.borda, borderColor: cores.erro },
        pressed && !inativo && !feedback.reduzido && !primario && { backgroundColor: cores.superficie2 },
        pressed && !inativo && feedback.reduzido && { borderWidth: medidas.bordaFoco, borderColor: cores.borda },
        inativo && { opacity: medidas.opacidadeDesabilitado },
        style,
        focado && !inativo && { borderWidth: medidas.bordaFoco, borderColor: cores.borda },
      ]}
    >
      {primario && <LinearGradient pointerEvents="none" colors={['#FFD76B', cores.acao]} style={estilos.degrade} />}
      <Animated.View style={[estilos.conteudo, feedback.estilo]}>
        {carregando ? <ActivityIndicator size="small" color={primario ? cores.acaoTexto : cores.texto} /> : icone}
        <Texto variante="corpoForte" cor={corTexto} style={estilos.texto}>
          {textoVisivel}
        </Texto>
      </Animated.View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: toque.minimo,
    minWidth: toque.minimo,
    justifyContent: 'center',
    paddingHorizontal: esp[4],
    paddingVertical: esp[2],
    borderRadius: raio.botao,
    overflow: 'hidden',
  },
  degrade: { ...StyleSheet.absoluteFill as object },
  conteudo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: esp[2] },
  texto: { textAlign: 'center', flexShrink: 1 },
});
