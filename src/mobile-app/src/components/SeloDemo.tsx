import { StyleSheet, View } from 'react-native';

import { esp, raio } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { medidas } from './medidas';
import { Texto } from './Texto';

/** Selo de simulação (VoltaSegura+, mockups 08, 09 e 15): deixa claro que nada é cobrado. */
export function SeloDemo({ rotulo = 'Demonstração: nenhuma cobrança real', testID }: { rotulo?: string; testID?: string }) {
  const { cores } = useTema();
  return (
    <View testID={testID} accessible accessibilityLabel={rotulo} style={[estilos.base, { borderColor: cores.borda }]}>
      <Texto variante="rotulo" cor="texto2">
        {rotulo}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderWidth: medidas.borda,
    borderStyle: 'dashed',
    borderRadius: raio.pilula,
    paddingHorizontal: esp[2],
    paddingVertical: esp[1],
  },
});
