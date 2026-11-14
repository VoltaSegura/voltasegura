import { Pressable, StyleSheet, View } from 'react-native';

import { Botao, Texto } from '@/components';
import { SeloLinha } from '@/components/resultado';
import type { Trecho } from '@/services';
import { hipotesesDetalhes as h } from '@/textos/hipotesesDetalhes';
import { esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

type Props = {
  trechos: Trecho[];
  modos: Record<Trecho['modo'], string>;
  detalhe: (trecho: Trecho, modo: string) => string;
  embarque: (trecho: Trecho) => string | null;
  onSelecionar: (id: string) => void;
  selecionadoId: string | null;
  onExplicar?: (trecho: Trecho) => void;
};

export function ListaTrechosDetalhada({ trechos, modos, detalhe, embarque, onSelecionar, selecionadoId, onExplicar }: Props) {
  const { cores } = useTema();
  return <View>{trechos.map((trecho, indice) => {
    const selecionado = selecionadoId === trecho.id;
    const numero = h.trechoNumerado(indice + 1, trechos.length);
    const descricao = detalhe(trecho, modos[trecho.modo]);
    return <View key={trecho.id} style={[estilos.item, { borderBottomColor: cores.borda }]}>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: selecionado }}
        accessibilityLabel={`${numero}. ${descricao}${selecionado ? `. ${h.trechoSelecionado}` : ''}`}
        onPress={() => onSelecionar(trecho.id)}
        style={[estilos.selecao, { backgroundColor: selecionado ? cores.superficie2 : cores.superficie, borderColor: selecionado ? cores.acao : cores.borda }]}>
        <Texto variante="rotulo" cor="texto2">{numero}</Texto>
        <Texto variante="corpoForte">{descricao}</Texto>
        {trecho.modo !== 'A_PE' && <SeloLinha trecho={trecho} rotulo={trecho.linha ?? modos[trecho.modo]} />}
        {embarque(trecho) ? <Texto variante="apoio">{embarque(trecho)}</Texto> : null}
        {trecho.desembarque ? <Texto variante="apoio">{`${h.desembarque} · ${trecho.desembarque}`}</Texto> : null}
      </Pressable>
      {trecho.modo === 'A_PE' && onExplicar ? <Botao variante="secundario" rotulo={h.porQueAcessivel(indice + 1)}
        accessibilityHint={h.porQueAcessivel(indice + 1)} onPress={() => onExplicar(trecho)} /> : null}
    </View>;
  })}</View>;
}

const estilos = StyleSheet.create({
  item: { paddingVertical: esp[2], gap: esp[2], borderBottomWidth: 1 },
  selecao: { minHeight: toque.minimo, padding: esp[3], gap: esp[1], borderWidth: 1, borderRadius: raio.medio },
});
