import { Pressable, StyleSheet, View } from 'react-native';

import { esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { Icone, type NomeIcone } from '../Icone';
import { haptica } from '../movimento';
import { Texto } from '../Texto';

type Props = {
  rotulo: string;
  valor: string;
  /** `true` quando já há um ponto escolhido (texto em destaque); `false` mostra o texto de convite apagado. */
  preenchido?: boolean;
  icone?: NomeIcone;
  erro?: string;
  onPress: () => void;
  testID?: string;
};

/** Linha tocável "De onde / Para onde": ícone, rótulo pequeno e valor. Abre direto o mapa (D-29). */
export function CampoPonto({ rotulo, valor, preenchido = true, icone = 'map-marker-outline', erro, onPress, testID }: Props) {
  const { cores } = useTema();
  return (
    <View>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={valor}
        accessibilityHint={rotulo}
        onPress={() => { haptica.selecao(); onPress(); }}
        style={({ pressed }) => [estilos.linha, { backgroundColor: pressed ? cores.superficie2 : 'transparent' }]}
      >
        <View style={[estilos.icone, { backgroundColor: cores.superficie2 }]}><Icone nome={icone} tamanho={20} corTema="acaoLink" /></View>
        <View style={estilos.textos}>
          <Texto variante="rotulo" cor="texto2">{rotulo}</Texto>
          <Texto variante={preenchido ? 'corpoForte' : 'corpo'} cor={preenchido ? 'texto' : 'texto2'} numberOfLines={1}>{valor}</Texto>
        </View>
        <Icone nome="chevron-right" tamanho={22} corTema="texto2" />
      </Pressable>
      {erro ? <Texto variante="apoio" cor="erro" accessibilityRole="alert" accessibilityLiveRegion="polite" style={estilos.erro}>{erro}</Texto> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: esp[3], minHeight: toque.minimo + esp[3], paddingHorizontal: esp[2], borderRadius: raio.medio },
  icone: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  textos: { flex: 1 },
  erro: { paddingHorizontal: esp[2] },
});
