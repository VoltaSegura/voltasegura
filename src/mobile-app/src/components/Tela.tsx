import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { esp } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { medidas } from './medidas';

type Props = {
  children: React.ReactNode;
  /** Conteúdo fixo no topo (ex.: `Cabecalho`), fora da rolagem. */
  topo?: React.ReactNode;
  /** Conteúdo fixo no rodapé (ex.: botão principal), fora da rolagem. */
  rodape?: React.ReactNode;
  /** Imagem no topo (componente `Hero`): fica fora do recuo e a Tela deixa de aplicar a área segura do topo. */
  hero?: React.ReactNode;
  /** `false` para telas sem rolagem. */
  rolagem?: boolean;
  /** Tela de aba: reserva o espaço da barra flutuante no fim do conteúdo. */
  abas?: boolean;
  testID?: string;
};

/**
 * Container de tela: fundo do tema, área segura, rolagem e teclado.
 * No Android o `app.json` usa `softwareKeyboardLayoutMode: "pan"` (o sistema já move a janela até o campo focado);
 * `behavior="height"` somava um segundo ajuste e fazia o teclado abrir e fechar no campo de hora.
 */
export function Tela({ children, topo, rodape, hero, rolagem = true, abas = false, testID }: Props) {
  const { cores } = useTema();
  const recuoAbas = abas ? { paddingBottom: esp[4] + medidas.alturaBarraAbas } : undefined;
  const conteudo = rolagem ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={estilos.fluxo}
      contentContainerStyle={hero ? undefined : [estilos.conteudo, recuoAbas]}
    >
      {hero}
      {hero ? <View style={[estilos.conteudo, recuoAbas]}>{children}</View> : children}
    </ScrollView>
  ) : (
    <View style={[estilos.fluxo, estilos.conteudo, recuoAbas]}>{children}</View>
  );

  return (
    <SafeAreaView testID={testID} edges={hero ? ['bottom', 'left', 'right'] : undefined} style={[estilos.base, { backgroundColor: cores.fundo }]}>
      {hero ? null : <LinearGradient pointerEvents="none" colors={[cores.fundoTopo, cores.fundo]} locations={[0, 0.55]} style={StyleSheet.absoluteFill} />}
      <KeyboardAvoidingView style={estilos.base} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {topo ? <View style={estilos.faixa}>{topo}</View> : null}
        {conteudo}
        {rodape ? <View style={estilos.faixa}>{rodape}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  base: { flex: 1 },
  fluxo: { flex: 1 },
  faixa: { paddingHorizontal: esp[4], width: '100%', maxWidth: medidas.larguraMaxima, alignSelf: 'center' },
  conteudo: {
    padding: esp[4],
    gap: esp[4],
    width: '100%',
    maxWidth: medidas.larguraMaxima,
    alignSelf: 'center',
  },
});
