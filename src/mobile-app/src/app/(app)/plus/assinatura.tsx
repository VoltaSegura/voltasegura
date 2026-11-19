import { useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';

import { Aviso, Botao, SeloDemo, Tela, Texto } from '@/components';
import { dataCurta, fimDoTeste, useAssinatura } from '@/plus';
import { textos } from '@/textos';
import { esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

/**
 * TL-25: Gerenciar assinatura (mockup 15). Simulação: trocar e cancelar só mostram um aviso.
 * Nada é cancelado, cobrado nem guardado.
 */
export default function Assinatura() {
  const { cores } = useTema();
  const { assinante, plano, inicio, cancelar } = useAssinatura();
  const [aviso, setAviso] = useState<string | null>(null);
  const ate = dataCurta(fimDoTeste(inicio ?? new Date()));

  function simular(texto: string) {
    setAviso(texto);
    AccessibilityInfo.announceForAccessibility(texto);
  }

  async function cancelarPlano() {
    await cancelar();
    AccessibilityInfo.announceForAccessibility(textos.plus.canceladoAviso);
    router.replace('/plus');
  }

  return (
    <Tela>
      <Stack.Screen options={{ title: textos.plus.assinaturaTitulo }} />
      <View style={[estilos.cartao, { backgroundColor: cores.superficie, borderColor: cores.texto }]}>
        <View style={estilos.linhaTopo}>
          <Texto variante="destaque">{plano === 'anual' ? textos.plus.assinaturaNomeAnual : textos.plus.assinaturaNome}</Texto>
          <View style={[estilos.pilula, { backgroundColor: cores.texto }]}>
            <Texto variante="rotulo" style={{ color: cores.fundo }}>{textos.plus.badgeSimples}</Texto>
          </View>
        </View>
        <Linha rotulo={textos.plus.linhaAte} valor={ate} />
        <Linha rotulo={textos.plus.linhaDepois} valor={plano === 'anual' ? textos.plus.planoAnual.valorMes : textos.plus.planoMensal.valorMes} ultima />
      </View>

      {aviso ? <Aviso texto={aviso} testID="assinatura-aviso" /> : null}
      <Pressable accessibilityRole="button" onPress={() => simular(textos.plus.simuladoTrocar)} style={estilos.trocar}>
        <Texto variante="corpoForte" cor="acaoLink">{textos.plus.trocarAnual}</Texto>
      </Pressable>
      {assinante ? <Botao rotulo={textos.plus.cancelarPlano} variante="secundario" onPress={() => { void cancelarPlano(); }} /> : null}
      <Texto variante="apoio" cor="texto2">{textos.plus.cancelarNota}</Texto>
      <View style={estilos.selo}>
        <SeloDemo />
      </View>
    </Tela>
  );
}

function Linha({ rotulo, valor, ultima = false }: { rotulo: string; valor: string; ultima?: boolean }) {
  const { cores } = useTema();
  return (
    <View style={[estilos.linha, { borderBottomColor: cores.divisoria, borderBottomWidth: ultima ? 0 : 1 }]}>
      <Texto variante="corpo" cor="texto2">{rotulo}</Texto>
      <Texto variante="destaque">{valor}</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { borderRadius: raio.painel, borderWidth: 2, padding: esp[4], gap: esp[2] },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: esp[2], flexWrap: 'wrap' },
  pilula: { borderRadius: raio.pilula, paddingHorizontal: esp[3], paddingVertical: esp[1] },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: esp[2] },
  trocar: { minHeight: toque.minimo, justifyContent: 'center' },
  selo: { alignItems: 'center' },
});
