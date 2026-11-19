import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Botao, Icone, SeloDemo, SeloExemplo, Texto } from '@/components';
import { MAX_ROTINAS, resumoDias, useRotinas, type Rotina } from '@/rotina';
import { rotina as tr } from '@/textos/rotina';
import { textos } from '@/textos';
import { esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { useAssinatura } from './AssinaturaContext';
import { dataCurta, fimDoTeste } from './datas';
import { RESUMO_EXEMPLO } from './exemplos';

/**
 * Conteúdo da home do VoltaSegura+ (TL-21, item 11 do T25-B). Usado pela rota `plus/home` e pela aba Plus
 * quando há assinatura simulada. Lista todas as rotinas do aparelho (até 5), sem alterá-las.
 */
export function PlusHomeConteudo() {
  const { rotinas, carregado } = useRotinas();
  const { inicio } = useAssinatura();
  const { cores } = useTema();

  return (
    <>
      <View style={estilos.topo}>
        <Texto variante="titulo">{textos.plus.titulo}</Texto>
        {inicio ? <Texto variante="rotulo" cor="texto2">{textos.plus.badgeTeste(dataCurta(fimDoTeste(inicio)))}</Texto> : null}
      </View>
      <SeloDemo />

      <View style={estilos.linhaTopo}>
        <Texto variante="secao" accessibilityRole="header">{tr.secaoRotinas}</Texto>
      </View>
      {carregado && rotinas.length === 0 ? (
        <View style={[estilos.cartao, { backgroundColor: cores.superficie, borderColor: cores.borda }]}>
          <Texto variante="corpo" cor="texto2">{textos.plus.semRotina}</Texto>
          <Botao rotulo={textos.plus.cadastrarRotina} variante="secundario" onPress={() => router.push('/rotina/editar')} />
        </View>
      ) : null}
      {rotinas.map((r) => <CartaoRotina key={r.id} rotina={r} />)}

      <View style={estilos.acoes}>
        <Botao rotulo={tr.nova} variante="secundario" desabilitado={rotinas.length >= MAX_ROTINAS} onPress={() => router.push('/rotina/editar')} />
        <Botao rotulo={textos.plus.gerenciarRotinas} variante="texto" onPress={() => router.push('/rotina')} />
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel={`${textos.plus.radarTitulo}. ${textos.plus.radarCartao}`} onPress={() => router.push('/plus/radar')} style={[estilos.cartao, { backgroundColor: cores.superficie2, borderColor: cores.superficie2 }]}>
        <View style={estilos.linhaTopo}>
          <View style={estilos.titulo}>
            <Icone nome="target" cor="texto" tamanho={20} />
            <Texto variante="destaque">{textos.plus.radarTitulo}</Texto>
          </View>
          <SeloExemplo />
        </View>
        <Texto variante="corpo" cor="texto2">{textos.plus.radarCartao}</Texto>
      </Pressable>

      <View style={estilos.linhaTopo}>
        <Texto variante="secao" accessibilityRole="header">{textos.plus.secaoResumo}</Texto>
        <Pressable accessibilityRole="button" onPress={() => router.push('/plus/resumo')} style={estilos.alvo}>
          <Texto variante="corpoForte" cor="acaoLink">{textos.plus.verTudo}</Texto>
        </Pressable>
      </View>
      <View style={estilos.grade}>
        <Estatistica valor={String(RESUMO_EXEMPLO.voltas)} rotulo={textos.plus.voltasFeitas} />
        <Estatistica valor={RESUMO_EXEMPLO.tempoAPe} rotulo={textos.plus.tempoAPe} />
        <Estatistica valor={RESUMO_EXEMPLO.horarioMaisUsado} rotulo={textos.plus.horarioMaisUsado} />
      </View>
      <SeloExemplo />

      <Pressable accessibilityRole="button" onPress={() => router.push('/plus/assinatura')} style={estilos.linhaTopo}>
        <Texto variante="corpoForte" cor="acaoLink">{textos.plus.gerenciar}</Texto>
        <Icone nome="chevron-right" cor="acaoLink" tamanho={20} />
      </Pressable>
    </>
  );
}

function CartaoRotina({ rotina }: { rotina: Rotina }) {
  const { cores } = useTema();
  return (
    <View testID={`plus-rotina-${rotina.id}`} style={[estilos.cartao, { backgroundColor: cores.superficie, borderColor: cores.borda }]}>
      <View style={estilos.linhaTopo}>
        <Texto variante="destaque" style={estilos.flex}>{tr.trajeto(rotina.origem.rotulo, rotina.destino.rotulo)}</Texto>
        <Pressable accessibilityRole="button" accessibilityLabel={`${tr.editar}. ${tr.trajeto(rotina.origem.rotulo, rotina.destino.rotulo)}`} onPress={() => router.push({ pathname: '/rotina/editar', params: { id: rotina.id } })} style={estilos.alvo}>
          <Texto variante="corpoForte" cor="acaoLink">{textos.plus.editar}</Texto>
        </Pressable>
      </View>
      <Texto variante="apoio" cor="texto2">{tr.detalhe(resumoDias(rotina.dias), rotina.hora)}</Texto>
      <View style={estilos.chips}>
        <Chip rotulo={textos.plus.saida(rotina.hora)} icone="clock-outline" />
        <Chip rotulo={textos.plus.lembrete(rotina.antecedencia)} icone="bell-outline" />
      </View>
      <Botao rotulo={textos.plus.abrirVolta} onPress={() => router.push({ pathname: '/plus/volta-pronta', params: { id: rotina.id } })} />
    </View>
  );
}

function Chip({ rotulo, icone }: { rotulo: string; icone: 'clock-outline' | 'bell-outline' }) {
  const { cores } = useTema();
  return (
    <View style={[estilos.chip, { backgroundColor: cores.superficie2 }]}>
      <Icone nome={icone} cor="texto" tamanho={16} />
      <Texto variante="rotulo">{rotulo}</Texto>
    </View>
  );
}

function Estatistica({ valor, rotulo }: { valor: string; rotulo: string }) {
  const { cores } = useTema();
  return (
    <View style={[estilos.estatistica, { backgroundColor: cores.superficie, borderColor: cores.borda }]}>
      <Texto variante="destaque">{valor}</Texto>
      <Texto variante="apoio" cor="texto2">{rotulo}</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: esp[2] },
  cartao: { borderRadius: raio.grande, borderWidth: 1, padding: esp[4], gap: esp[2] },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: esp[2] },
  alvo: { minHeight: toque.minimo, justifyContent: 'center' },
  flex: { flex: 1 },
  acoes: { gap: esp[2] },
  titulo: { flexDirection: 'row', alignItems: 'center', gap: esp[2] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: esp[2] },
  chip: { flexDirection: 'row', alignItems: 'center', gap: esp[1], borderRadius: raio.pilula, paddingHorizontal: esp[3], paddingVertical: esp[2] },
  grade: { flexDirection: 'row', gap: esp[2] },
  estatistica: { flex: 1, borderRadius: raio.medio, borderWidth: 1, padding: esp[3], gap: esp[1] },
});
