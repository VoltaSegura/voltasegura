import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';

import { SeloExemplo, Tela, Texto } from '@/components';
import { RESUMO_EXEMPLO } from '@/plus';
import { textos } from '@/textos';
import { esp, raio } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

const ALTURA_MAXIMA = 120;

/** TL-24: Resumo da semana (mockup 14). Números de exemplo; sem nota nem pontuação. */
export default function Resumo() {
  const { cores } = useTema();
  const maximo = Math.max(...RESUMO_EXEMPLO.porDia);

  return (
    <Tela>
      <Stack.Screen options={{ title: textos.plus.resumoTitulo }} />
      <View style={estilos.linhaTopo}>
        <Texto variante="corpo" cor="texto2">{textos.plus.periodoExemplo}</Texto>
        <SeloExemplo />
      </View>
      <Linha rotulo={textos.plus.voltasFeitas} valor={String(RESUMO_EXEMPLO.voltas)} />
      <Linha rotulo={textos.plus.tempoAPe} valor={RESUMO_EXEMPLO.tempoAPe} />
      <Linha rotulo={textos.plus.horarioMaisUsado} valor={RESUMO_EXEMPLO.horarioMaisUsado} ultima />

      <View style={[estilos.cartao, { backgroundColor: cores.superficie, borderColor: cores.borda }]}>
        <Texto variante="destaque">{textos.plus.voltasPorDia}</Texto>
        <View style={estilos.colunas} accessible accessibilityLabel={RESUMO_EXEMPLO.porDia.map((v, i) => `${textos.plus.diasCurtos[i]}: ${v}`).join(', ')}>
          {RESUMO_EXEMPLO.porDia.map((v, i) => (
            <View key={textos.plus.diasCurtos[i]} style={estilos.coluna}>
              <Texto variante="rotulo">{String(v)}</Texto>
              <View style={[estilos.barra, { height: (v / maximo) * ALTURA_MAXIMA, backgroundColor: cores.texto }]} />
              <Texto variante="apoio" cor="texto2">{textos.plus.diasCurtos[i]}</Texto>
            </View>
          ))}
        </View>
      </View>
      <Texto variante="apoio" cor="texto2">{textos.plus.resumoNota}</Texto>
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
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: esp[2] },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: esp[3] },
  cartao: { borderRadius: raio.grande, borderWidth: 1, padding: esp[4], gap: esp[3] },
  colunas: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: ALTURA_MAXIMA + esp[8] },
  coluna: { alignItems: 'center', gap: esp[1], justifyContent: 'flex-end' },
  barra: { width: 26, borderRadius: raio.medio },
});
