import { StyleSheet, View } from 'react-native';

import { textos } from '@/textos';
import { esp, raio } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { medidas } from './medidas';
import { Texto } from './Texto';

/** Selo EXEMPLO (RNF-08): borda tracejada; presente em todo dado de exemplo. */
export function SeloExemplo({ testID }: { testID?: string }) {
  const { cores } = useTema();
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={textos.comuns.exemplo.toLowerCase()}
      style={[estilos.base, { borderColor: cores.borda }]}
    >
      <Texto variante="rotulo" cor="texto2">
        {textos.comuns.exemplo}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderWidth: medidas.borda,
    borderStyle: 'dashed',
    borderRadius: raio.pequeno,
    paddingHorizontal: esp[2],
    paddingVertical: esp[1],
  },
});
