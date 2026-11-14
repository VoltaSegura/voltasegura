import { Pressable, StyleSheet, View } from 'react-native';

import { Texto } from '@/components';
import { esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

export function SeletorOpcoes({ opcoes, valor, onChange, rotuloGrupo }: {
  opcoes: { valor: string; rotulo: string }[];
  valor: string;
  onChange: (valor: string) => void;
  rotuloGrupo: string;
}) {
  const { cores } = useTema();
  return <View accessibilityRole="tablist" accessibilityLabel={rotuloGrupo} style={estilos.lista}>
    {opcoes.map((opcao) => <Pressable key={opcao.valor} accessibilityRole="tab" accessibilityLabel={opcao.rotulo}
      accessibilityState={{ selected: opcao.valor === valor }} onPress={() => onChange(opcao.valor)}
      style={[estilos.opcao, { borderColor: opcao.valor === valor ? cores.acao : cores.borda, backgroundColor: opcao.valor === valor ? cores.superficie2 : cores.superficie }]}>
      <Texto variante="corpoForte">{opcao.rotulo}</Texto>
    </Pressable>)}
  </View>;
}

const estilos = StyleSheet.create({
  lista: { gap: esp[2] },
  opcao: { minHeight: toque.minimo, justifyContent: 'center', padding: esp[3], borderWidth: 1, borderRadius: raio.medio },
});
