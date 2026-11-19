import { StyleSheet, View } from 'react-native';

import { useTema } from '@/theme/useTema';

/**
 * Fundo decorativo de mapa para as telas da simulação (mockups 12 e 13). Não é um mapa real:
 * ruas e quadras desenhadas com Views, sem dados nem localização. Escondido do leitor de tela.
 */
export function FundoMapa({ altura = 260, testID }: { altura?: number; testID?: string }) {
  const { cores } = useTema();
  const rua = cores.superficie;
  return (
    <View testID={testID} accessible={false} importantForAccessibility="no-hide-descendants" style={[estilos.base, { height: altura, backgroundColor: cores.superficie2 }]}>
      <View style={[estilos.quadra, { top: altura * 0.18, left: '6%', width: '22%', height: altura * 0.2, backgroundColor: cores.acao, opacity: 0.18 }]} />
      <View style={[estilos.barra, { top: altura * 0.12, left: 0, right: 0, height: 10, backgroundColor: rua }]} />
      <View style={[estilos.barra, { top: altura * 0.55, left: 0, right: 0, height: 12, backgroundColor: rua }]} />
      <View style={[estilos.barraVertical, { left: '28%', top: 0, bottom: 0, width: 10, backgroundColor: rua }]} />
      <View style={[estilos.barraVertical, { left: '70%', top: 0, bottom: 0, width: 8, backgroundColor: rua }]} />
      <View style={[estilos.trecho, { top: altura * 0.62, left: '18%', width: '62%', backgroundColor: cores.texto }]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { width: '100%', overflow: 'hidden' },
  quadra: { position: 'absolute', borderRadius: 12 },
  barra: { position: 'absolute' },
  barraVertical: { position: 'absolute' },
  trecho: { position: 'absolute', height: 6, borderRadius: 3, transform: [{ rotate: '-12deg' }] },
});
