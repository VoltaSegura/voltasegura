import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { Botao, SeloDemo, Tela, Texto } from '@/components';
import { dataCurta, fimDoTeste, useAssinatura } from '@/plus';
import { textos } from '@/textos';
import { esp, raio } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

/**
 * TL-20: confirmação do teste (mockup 09). Simulação: "Começar" só abre a tela de assinatura de exemplo;
 * nenhum pagamento, nenhum valor guardado e nenhuma chamada ao servidor.
 */
export default function Confirmacao() {
  const { plano } = useLocalSearchParams<{ plano?: string }>();
  const { cores } = useTema();
  const { assinar } = useAssinatura();
  const mensal = plano !== 'anual';
  const info = mensal ? textos.plus.planoMensal : textos.plus.planoAnual;
  const fim = dataCurta(fimDoTeste());

  async function comecar() {
    // Guarda só o plano e a data de início da simulação (item 5 do T25-B); nenhum valor é cobrado.
    await assinar(mensal ? 'mensal' : 'anual');
    AccessibilityInfo.announceForAccessibility(textos.plus.simulacaoNota);
    router.replace('/plus/home');
  }

  return (
    <Tela>
      <Stack.Screen options={{ title: textos.plus.confirmacaoTitulo }} />
      <Texto variante="titulo" accessibilityRole="header">{textos.plus.confirmacaoTitulo}</Texto>
      <Texto variante="corpo" cor="texto2">{textos.plus.confirmacaoCorpo}</Texto>
      <View style={[estilos.resumo, { backgroundColor: cores.superficie2 }]}>
        <Linha rotulo={textos.plus.linhaPlano} valor={info.nome} />
        <Linha rotulo={textos.plus.linhaAte} valor={fim} />
        <Linha rotulo={textos.plus.linhaDepois} valor={info.valorMes} ultima />
      </View>
      <Botao rotulo={textos.plus.comecar} onPress={() => { void comecar(); }} testID="confirmar-teste" />
      <Botao rotulo={textos.plus.voltar} variante="texto" onPress={() => router.back()} />
      <View style={estilos.selo}>
        <SeloDemo />
      </View>
    </Tela>
  );
}

function Linha({ rotulo, valor, ultima = false }: { rotulo: string; valor: string; ultima?: boolean }) {
  const { cores } = useTema();
  return (
    <View style={[estilos.linha, !ultima && { borderBottomWidth: 1, borderBottomColor: cores.divisoria }]}>
      <Texto variante="corpo" cor="texto2">{rotulo}</Texto>
      <Texto variante="corpoForte">{valor}</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  resumo: { borderRadius: raio.grande, paddingHorizontal: esp[4] },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: esp[3], gap: esp[2] },
  selo: { alignItems: 'center', marginTop: esp[2] },
});
