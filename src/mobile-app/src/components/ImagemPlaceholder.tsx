import { Image, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { imagens, type ChaveImagem } from '@/theme/imagens';
import { useTema } from '@/theme/useTema';

import { Icone, type NomeIcone } from './Icone';

export type ImageSourceType = ImageSourcePropType;

type Props = {
  /** Qual espaço de imagem (ver `theme/imagens.ts`). */
  nome: ChaveImagem;
  /** Ícone mostrado enquanto não houver foto. */
  icone?: NomeIcone;
  style?: StyleProp<ViewStyle>;
  /** Escurece a foto de baixo para cima, para o texto por cima continuar legível. */
  escurecer?: boolean;
  children?: React.ReactNode;
};

/**
 * Imagem decorativa com reserva: sem arquivo, mostra degradê marinho + ícone grande e apagado.
 * É decorativa: escondida do leitor de tela (o significado vem sempre do texto ao lado).
 */
export function ImagemPlaceholder({ nome, icone = 'image-outline', style, escurecer = true, children }: Props) {
  const { cores } = useTema();
  const fonte = imagens[nome];
  return (
    <View style={[estilos.base, { backgroundColor: cores.superficie2 }, style]}>
      <View style={StyleSheet.absoluteFill} accessible={false} importantForAccessibility="no-hide-descendants">
        {fonte ? (
          <Image source={fonte} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
        ) : (
          <>
            <LinearGradient colors={[cores.superficie2, cores.superficie]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <View style={estilos.centro}>
              <Icone nome={icone} tamanho={56} cor={cores.borda} />
            </View>
          </>
        )}
        {escurecer ? <LinearGradient colors={['transparent', cores.fundo + 'CC']} locations={[0.35, 1]} style={StyleSheet.absoluteFill} /> : null}
      </View>
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { overflow: 'hidden' },
  centro: { ...(StyleSheet.absoluteFill as object), alignItems: 'center', justifyContent: 'center', opacity: 0.55 },
});
