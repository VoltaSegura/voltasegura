import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { hipotesesPlanejar } from '@/textos/hipotesesPlanejar';
import { esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { Botao } from '../Botao';
import { Icone } from '../Icone';
import { Texto } from '../Texto';

const ALTURA_ITEM = 44;
const VISIVEIS = 5;
const HORAS = Array.from({ length: 24 }, (_, i) => i);
const MINUTOS = Array.from({ length: 60 }, (_, i) => i);

type Props = {
  rotulo: string;
  saida: string;
  onChange: (saida: string) => void;
  /** Abre a folha de horário ao montar (ex.: vindo da tela de busca com foco no horário). */
  abrirInicialmente?: boolean;
};

type HoraMinuto = { horas: number; minutos: number };

const dois = (n: number) => String(n).padStart(2, '0');

function lerHora(saida: string): HoraMinuto {
  const data = new Date(saida);
  if (Number.isNaN(data.getTime())) return { horas: 0, minutos: 0 };
  return { horas: data.getHours(), minutos: data.getMinutes() };
}

function horaTexto({ horas, minutos }: HoraMinuto) {
  return `${dois(horas)}:${dois(minutos)}`;
}

/** "hoje, 15 de novembro", "amanhã, 16 de novembro" ou só a data. */
function diaTexto(saida: string, agora = new Date()): string {
  const data = new Date(saida);
  if (Number.isNaN(data.getTime())) return '';
  const amanha = new Date(agora);
  amanha.setDate(agora.getDate() + 1);
  const mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const longa = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  if (mesmoDia(data, agora)) return `${hipotesesPlanejar.hoje}, ${longa}`;
  if (mesmoDia(data, amanha)) return `${hipotesesPlanejar.amanha}, ${longa}`;
  return longa;
}

/**
 * Roda vertical de valores (horas ou minutos). Sem teclado: rola e encaixa no item do centro.
 * Acessível: ajustável (incrementar/decrementar pelo leitor de tela) e toque direto num item.
 */
function Roda({ valores, selecionado, onMudar, rotulo }: { valores: number[]; selecionado: number; onMudar: (valor: number) => void; rotulo: string }) {
  const { cores } = useTema();
  const rolagem = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const indice = Math.max(0, valores.indexOf(selecionado));

  useEffect(() => {
    rolagem.current?.scrollTo({ y: indice * ALTURA_ITEM, animated: false });
    // Só na montagem: depois disso a própria rolagem é a fonte da verdade.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function encaixar(evento: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.min(valores.length - 1, Math.max(0, Math.round(evento.nativeEvent.contentOffset.y / ALTURA_ITEM)));
    if (valores[i] !== selecionado) onMudar(valores[i]);
  }

  function irPara(i: number) {
    const proximo = Math.min(valores.length - 1, Math.max(0, i));
    onMudar(valores[proximo]);
    rolagem.current?.scrollTo({ y: proximo * ALTURA_ITEM, animated: true });
  }

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={rotulo}
      accessibilityValue={{ text: dois(selecionado) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(evento) => irPara(indice + (evento.nativeEvent.actionName === 'increment' ? 1 : -1))}
      style={estilos.roda}
    >
      <View pointerEvents="none" style={[estilos.faixa, { backgroundColor: cores.superficie2, borderColor: cores.borda }]} />
      <ScrollView
        ref={rolagem}
        showsVerticalScrollIndicator={false}
        snapToInterval={ALTURA_ITEM}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ALTURA_ITEM * 2 }}
        style={{ height: ALTURA_ITEM * VISIVEIS }}
        onMomentumScrollEnd={encaixar}
        onScrollEndDrag={encaixar}
      >
        {valores.map((valor, i) => (
          <Pressable
            key={valor}
            accessible={false}
            onPress={() => irPara(i)}
            style={estilos.item}
            testID={`${rotulo}-${dois(valor)}`}
          >
            <Texto variante={valor === selecionado ? 'corpoForte' : 'corpo'} cor={valor === selecionado ? 'texto' : 'texto2'}>{dois(valor)}</Texto>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

/**
 * Saída por folha com rodas HH:MM (sem TextInput, sem teclado). Mostra a hora e o dia
 * e abre a folha em "Alterar". Confirmar grava a nova saída; Cancelar não altera nada.
 */
export function SeletorHorario({ rotulo, saida, onChange, abrirInicialmente = false }: Props) {
  const { cores } = useTema();
  const [aberto, setAberto] = useState(abrirInicialmente);
  const [rascunho, setRascunho] = useState<HoraMinuto>(() => lerHora(saida));
  const hora = horaTexto(lerHora(saida));
  const dia = diaTexto(saida);

  function abrir() {
    setRascunho(lerHora(saida));
    setAberto(true);
  }

  function confirmar() {
    const data = new Date(saida);
    if (!Number.isNaN(data.getTime())) {
      data.setHours(rascunho.horas, rascunho.minutos, 0, 0);
      onChange(data.toISOString());
    }
    setAberto(false);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${rotulo} ${hora}, ${dia}`}
        accessibilityHint={hipotesesPlanejar.abrirHorario}
        onPress={abrir}
        testID="hora-saida"
        style={[estilos.cartao, { backgroundColor: cores.superficie, borderColor: cores.divisoria }]}
      >
        <View style={[estilos.icone, { backgroundColor: cores.superficie2 }]}>
          <Icone nome="clock-outline" tamanho={26} corTema="acaoLink" />
        </View>
        <View style={estilos.textos}>
          <Texto variante="rotulo" cor="texto2">{rotulo}</Texto>
          <Texto variante="duracao">{hora}</Texto>
          <Texto variante="apoio" cor="texto2">{dia}</Texto>
        </View>
        <Icone nome="chevron-right" tamanho={24} corTema="texto2" />
      </Pressable>

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        <View style={estilos.fundo}>
          <Pressable accessibilityRole="button" accessibilityLabel={hipotesesPlanejar.cancelarHorario} onPress={() => setAberto(false)} style={StyleSheet.absoluteFill} />
          <View accessibilityViewIsModal style={[estilos.folha, { backgroundColor: cores.superficie, borderColor: cores.divisoria }]}>
            <View style={[estilos.alca, { backgroundColor: cores.borda }]} />
            <Texto variante="secao" accessibilityRole="header">{rotulo}</Texto>
            <View style={estilos.rodas}>
              <Roda rotulo={hipotesesPlanejar.rodaHoras} valores={HORAS} selecionado={rascunho.horas} onMudar={(horas) => setRascunho((r) => ({ ...r, horas }))} />
              <Texto variante="duracao" cor="texto2">:</Texto>
              <Roda rotulo={hipotesesPlanejar.rodaMinutos} valores={MINUTOS} selecionado={rascunho.minutos} onMudar={(minutos) => setRascunho((r) => ({ ...r, minutos }))} />
            </View>
            <Botao rotulo={hipotesesPlanejar.confirmarHorario} onPress={confirmar} />
            <Botao rotulo={hipotesesPlanejar.cancelarHorario} variante="texto" onPress={() => setAberto(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const estilos = StyleSheet.create({
  cartao: { flexDirection: 'row', alignItems: 'center', gap: esp[3], minHeight: toque.minimo + esp[6], padding: esp[3], borderRadius: raio.painel, borderWidth: 1 },
  icone: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  textos: { flex: 1, gap: esp[1] },
  fundo: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0D1B2A88' },
  folha: { borderTopLeftRadius: raio.painel, borderTopRightRadius: raio.painel, borderWidth: 1, borderBottomWidth: 0, padding: esp[4], gap: esp[3], alignItems: 'center' },
  alca: { width: 40, height: 4, borderRadius: 2, marginBottom: esp[1] },
  rodas: { flexDirection: 'row', alignItems: 'center', gap: esp[3] },
  roda: { width: 96, height: ALTURA_ITEM * VISIVEIS, justifyContent: 'center' },
  faixa: { position: 'absolute', left: 0, right: 0, top: ALTURA_ITEM * 2, height: ALTURA_ITEM, borderRadius: raio.medio, borderWidth: 1 },
  item: { height: ALTURA_ITEM, alignItems: 'center', justifyContent: 'center' },
});
