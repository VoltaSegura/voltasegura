import { Pressable, StyleSheet, View } from 'react-native';

import { hipotesesMapa as h } from '@/textos/hipotesesMapa';
import { esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { haptica } from '../movimento';
import { Texto } from '../Texto';

const ATALHOS = [
  { rotulo: h.agora, minutos: 0 },
  { rotulo: h.em15, minutos: 15 },
  { rotulo: h.em30, minutos: 30 },
  { rotulo: h.em1h, minutos: 60 },
] as const;

type Props = { onEscolher: (saida: string) => void; agora?: () => number };

/** Atalhos de saída: evita digitar a hora no caso mais comum (sair agora ou daqui a pouco). */
export function AtalhosHorario({ onEscolher, agora = Date.now }: Props) {
  const { cores } = useTema();
  return (
    <View accessibilityRole="toolbar" accessibilityLabel={h.atalhosSaida} style={estilos.linha}>
      {ATALHOS.map((a) => (
        <Pressable
          key={a.rotulo}
          accessibilityRole="button"
          accessibilityLabel={a.rotulo}
          onPress={() => { haptica.selecao(); onEscolher(new Date(agora() + a.minutos * 60000).toISOString()); }}
          style={[estilos.chip, { borderColor: cores.borda, backgroundColor: cores.superficie2 }]}
        >
          <Texto variante="rotulo">{a.rotulo}</Texto>
        </Pressable>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: esp[2] },
  chip: { minHeight: toque.minimo - 8, paddingHorizontal: esp[3], justifyContent: 'center', borderRadius: raio.pilula, borderWidth: 1 },
});
