import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { esp, raio } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

type Props = { visivel: boolean; onFechar: () => void; children: ReactNode; testID?: string };

/**
 * Folha inferior genérica (mockups 02, 03 e 'Alterar' do horário). Toque fora fecha.
 * Não substitui a folha de resultado (`resultado/useFolhaResultado.ts`), que tem gesto próprio.
 */
export function FolhaInferior({ visivel, onFechar, children, testID }: Props) {
  const { cores } = useTema();
  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={onFechar}>
      <View style={estilos.fundo}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Fechar" onPress={onFechar} />
        <View testID={testID} style={[estilos.folha, { backgroundColor: cores.superficie, borderColor: cores.divisoria }]}>
          <View style={[estilos.puxador, { backgroundColor: cores.borda }]} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  folha: {
    borderTopLeftRadius: raio.painel,
    borderTopRightRadius: raio.painel,
    borderWidth: 1,
    paddingHorizontal: esp[4],
    paddingBottom: esp[6],
    paddingTop: esp[2],
  },
  puxador: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: esp[3] },
});
