import { StyleSheet, View } from 'react-native';

import { brilho } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

/**
 * O "fio de luz": elemento assinatura (D-28). Origem vazada, linha acesa, destino cheio.
 * Decorativo (invisível ao leitor de tela); nunca carrega significado de segurança.
 */
export function FioLuz({ largura }: { largura?: number }) {
  const { cores } = useTema();
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={[estilos.linha, largura ? { width: largura } : null]}>
      <View style={[estilos.no, { borderColor: cores.luz, backgroundColor: cores.fundo }]} />
      <View style={[estilos.fio, { backgroundColor: cores.luz }, brilho(cores.luz, 0.6)]} />
      <View style={[estilos.no, { borderColor: cores.luz, backgroundColor: cores.luz }, brilho(cores.luz, 0.6)]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  fio: { flex: 1, height: 3, borderRadius: 2 },
  no: { width: 14, height: 14, borderRadius: 7, borderWidth: 3 },
});
