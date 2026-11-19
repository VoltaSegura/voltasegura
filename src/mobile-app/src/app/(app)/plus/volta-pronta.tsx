import { useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { Botao, Icone, SeloExemplo, Tela, Texto } from '@/components';
import { FundoMapa, VOLTA_EXEMPLO, horaLocal } from '@/plus';
import { useRotinas } from '@/rotina';
import { textos } from '@/textos';
import { esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

const ATALHOS = [0, 15, 30, 60] as const;

/**
 * TL-22: "Sua volta está pronta" (mockup 12). Mapa decorativo; horários e tempos são exemplos (EXEMPLO).
 * O botão de compartilhar ainda não funciona aqui: o envio depende da rota real (TL-14), `[EM ABERTO]`.
 */
export default function VoltaPronta() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { rotinas } = useRotinas();
  const { cores } = useTema();
  const rotina = rotinas.find((r) => r.id === id);
  const [atalho, setAtalho] = useState<number>(15);
  const nome = rotina ? `${rotina.origem.rotulo} para ${rotina.destino.rotulo}` : 'Volta de exemplo';
  const hora = rotina?.hora ?? horaLocal(new Date());

  return (
    <Tela rolagem={false}>
      <Stack.Screen options={{ title: textos.plus.voltaTitulo }} />
      <FundoMapa altura={300} testID="volta-mapa" />
      <View style={[estilos.painel, { backgroundColor: cores.superficie }]}>
        <Texto variante="rotulo" cor="texto2">{textos.plus.voltaRotulo(nome, hora)}</Texto>
        <View style={estilos.linhaTopo}>
          <Texto variante="secao" accessibilityRole="header">{textos.plus.voltaTitulo}</Texto>
          <SeloExemplo />
        </View>
        <Texto variante="corpoForte">{textos.plus.melhorHorario}</Texto>
        <View style={estilos.atalhos} accessibilityRole="radiogroup">
          {ATALHOS.map((minutos, i) => {
            const marcado = atalho === minutos;
            return (
              <Pressable
                key={minutos}
                accessibilityRole="radio"
                accessibilityState={{ selected: marcado }}
                accessibilityLabel={textos.plus.atalhos[i]}
                onPress={() => { setAtalho(minutos); AccessibilityInfo.announceForAccessibility(`${textos.plus.atalhos[i]}, selecionado`); }}
                style={[estilos.atalho, { backgroundColor: marcado ? cores.texto : cores.superficie, borderColor: marcado ? cores.texto : cores.borda }]}
              >
                <Texto variante="rotulo" style={{ color: marcado ? cores.fundo : cores.texto }}>{textos.plus.atalhos[i]}</Texto>
              </Pressable>
            );
          })}
        </View>
        <Texto variante="apoio" cor="texto2">{textos.plus.melhorHorarioNota}</Texto>
        <View style={[estilos.resultado, { borderColor: cores.texto }]}>
          <Texto variante="duracao">{VOLTA_EXEMPLO.duracao}</Texto>
          <Texto variante="apoio" cor="texto2">{VOLTA_EXEMPLO.trajetoAPe}</Texto>
          <View style={estilos.trajeto}>
            <View style={[estilos.chip, { backgroundColor: cores.superficie2 }]}>
              <Icone nome="walk" cor="texto" tamanho={16} />
              <Texto variante="rotulo">{textos.plus.aPe}</Texto>
            </View>
            <Icone nome="chevron-right" cor="texto2" tamanho={16} />
            <View style={[estilos.chip, { backgroundColor: cores.superficie2 }]}>
              <Icone nome="bus" cor="texto" tamanho={16} />
              <Texto variante="rotulo">{textos.plus.linha}</Texto>
            </View>
          </View>
        </View>
        <Botao rotulo={textos.plus.compartilharToque} desabilitado onPress={() => undefined} testID="volta-compartilhar" />
        <Texto variante="apoio" cor="texto2">{textos.plus.compartilharEmBreve}</Texto>
        <Pressable accessibilityRole="link" onPress={() => router.push('/sobre-os-dados')} style={estilos.rodape}>
          <Texto variante="apoio" cor="texto2">{textos.plus.dadosRodape}</Texto>
          <Icone nome="chevron-right" cor="texto2" tamanho={18} />
        </Pressable>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  painel: { marginTop: -esp[6], borderTopLeftRadius: raio.painel, borderTopRightRadius: raio.painel, padding: esp[4], gap: esp[3] },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: esp[2] },
  atalhos: { flexDirection: 'row', flexWrap: 'wrap', gap: esp[2] },
  atalho: { minHeight: toque.minimo, minWidth: toque.minimo, paddingHorizontal: esp[3], borderRadius: raio.pilula, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  resultado: { borderWidth: 2, borderRadius: raio.grande, padding: esp[4], gap: esp[2] },
  trajeto: { flexDirection: 'row', alignItems: 'center', gap: esp[2], flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: esp[1], borderRadius: raio.pilula, paddingHorizontal: esp[3], paddingVertical: esp[2] },
  rodape: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: toque.minimo },
});
