import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';

import { Botao, Icone, SeloDemo, Tela, Texto } from '@/components';
import { PlusHomeConteudo, useAssinatura } from '@/plus';
import { textos } from '@/textos';
import { esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

const PLANOS = [textos.plus.planoMensal, textos.plus.planoAnual] as const;
type Chave = 'mensal' | 'anual';
const CHAVES: readonly Chave[] = ['mensal', 'anual'];

/**
 * TL-19 na aba Plus (mockup 08). Portão (item 12 do T25-B): com assinatura simulada, a aba mostra a home
 * do VoltaSegura+ (TL-21); sem ela, os planos. Simulação: nenhum valor é cobrado.
 */
export default function Plus() {
  const { assinante } = useAssinatura();
  if (assinante) {
    return (
      <Tela abas>
        <PlusHomeConteudo />
      </Tela>
    );
  }
  return <Planos />;
}

function Planos() {
  const { width } = useWindowDimensions();
  const { cores } = useTema();
  const [selecionado, setSelecionado] = useState(0);
  const larguraCartao = Math.min(width - esp[4] * 2 - esp[4], 340);
  const plano = PLANOS[selecionado];

  return (
    <Tela abas>
      <View style={estilos.topo}>
        <Texto variante="titulo">{textos.plus.titulo}</Texto>
        <SeloDemo testID="plus-selo" />
      </View>
      <Texto variante="secao" accessibilityRole="header">{textos.plus.chamada}</Texto>
      <Texto variante="corpo" cor="texto2">{textos.plus.apoio}</Texto>

      <ScrollView
        horizontal
        pagingEnabled={false}
        snapToInterval={larguraCartao + esp[3]}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.faixa}
      >
        {PLANOS.map((p, i) => {
          const marcado = i === selecionado;
          return (
            <Pressable
              key={p.nome}
              testID={`plano-${CHAVES[i]}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: marcado }}
              accessibilityLabel={`${p.nome}, ${p.preco}${p.periodo}. ${p.detalhe}`}
              onPress={() => setSelecionado(i)}
              style={[estilos.cartao, { width: larguraCartao, backgroundColor: cores.superficie, borderColor: marcado ? cores.texto : cores.borda, borderWidth: marcado ? 2 : 1 }]}
            >
              <Texto variante="destaque">{p.nome}</Texto>
              <View style={estilos.linhaPreco}>
                <Texto variante="duracao">{p.preco}</Texto>
                <Texto variante="corpo" cor="texto2">{p.periodo}</Texto>
              </View>
              <Texto variante="apoio" cor="texto2">{p.detalhe}</Texto>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={estilos.pontos} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {PLANOS.map((_, i) => (
          <View key={i} style={[estilos.ponto, { backgroundColor: i === selecionado ? cores.texto : cores.borda, width: i === selecionado ? 24 : 8 }]} />
        ))}
      </View>

      <Texto variante="corpoForte" accessibilityRole="header">{textos.plus.incluido}</Texto>
      <View style={estilos.lista}>
        {textos.plus.itens.map((item) => (
          <View key={item} style={estilos.item}>
            <View style={[estilos.marca, { backgroundColor: cores.superficie2 }]}>
              <Icone nome="check" cor="texto" tamanho={18} />
            </View>
            <Texto variante="corpo" style={estilos.itemTexto}>{item}</Texto>
          </View>
        ))}
      </View>

      <Botao rotulo={textos.plus.testar} onPress={() => router.push({ pathname: '/plus/confirmacao', params: { plano: CHAVES[selecionado] } })} />
      <Texto variante="apoio" cor="texto2" style={estilos.centro}>{textos.plus.depois(plano.valorMes)}</Texto>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: esp[2], flexWrap: 'wrap' },
  faixa: { gap: esp[3], paddingVertical: esp[2] },
  cartao: { borderRadius: raio.grande, padding: esp[4], gap: esp[2] },
  linhaPreco: { flexDirection: 'row', alignItems: 'flex-end', gap: esp[1] },
  pontos: { flexDirection: 'row', justifyContent: 'center', gap: esp[1] },
  ponto: { height: 8, borderRadius: raio.pilula },
  lista: { gap: esp[3] },
  item: { flexDirection: 'row', alignItems: 'center', gap: esp[3], minHeight: toque.minimo },
  marca: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  itemTexto: { flex: 1 },
  centro: { textAlign: 'center' },
});
