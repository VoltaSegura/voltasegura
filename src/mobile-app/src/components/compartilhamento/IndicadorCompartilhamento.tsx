import { router } from 'expo-router';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import { useEffect, type ReactNode } from 'react';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { Texto } from '@/components/Texto';
import { useCompartilhamento } from '@/compartilhamento';
import { textos } from '@/textos';
import { hipotesesCompartilhar as h } from '@/textos/hipotesesCompartilhar';
import { esp, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

/**
 * Indicador global (FN-15, US-21 AC3): fixo no topo de todas as telas enquanto a sessão está ativa,
 * com "Parar". Também mostra o aviso de tempo máximo (PL-20) e o de encerramento.
 * Só aparece quando há sessão (ativa) ou aviso de fim a mostrar; fora disso não ocupa espaço.
 */
export function IndicadorCompartilhamento({ children }: { children: ReactNode }) {
  const c = useCompartilhamento();
  const insets = useSafeAreaInsets();
  const { cores } = useTema();
  const ativa = c.fase === 'ativa' && c.sessao !== null;
  const encerrada = c.fase === 'encerrada';
  const visivel = ativa || encerrada;

  useEffect(() => {
    if (ativa) AccessibilityInfo.announceForAccessibility(textos.compartilhar.indicador);
  }, [ativa]);

  const abrir = () => {
    if (c.rotaId) router.push({ pathname: '/compartilhar/[rotaId]', params: { rotaId: c.rotaId } });
  };
  const textoEncerrado =
    c.motivo === 'CHEGOU'
      ? textos.compartilhar.encerradoChegou
      : c.motivo === 'TEMPO'
        ? h.encerradoTempo
        : textos.compartilhar.encerrado;

  return (
    <View style={estilos.raiz}>
      {visivel && (
        <View
          testID="indicador-compartilhamento"
          style={[estilos.topo, { paddingTop: insets.top + esp[2], backgroundColor: cores.superficie2, borderColor: cores.borda }]}
        >
          {ativa && (
            <View style={estilos.linha}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${c.semRede ? textos.compartilhar.indicadorSemRede : textos.compartilhar.indicador}. ${h.abrirCompartilhamento}`}
                onPress={abrir}
                style={estilos.texto}
              >
                <Texto variante="corpoForte">{`● ${c.semRede ? textos.compartilhar.indicadorSemRede : textos.compartilhar.indicador}`}</Texto>
                <Texto variante="rotulo" cor="texto2">{h.prototipoCurto}</Texto>
              </Pressable>
              <Botao variante="destrutivo" rotulo={textos.compartilhar.parar} onPress={() => void c.parar()} testID="indicador-parar" />
            </View>
          )}
          {ativa && c.avisoTempo && (
            <View style={estilos.aviso}>
              <Aviso simbolo="ⓘ" texto={textos.compartilhar.tempoAcabando(c.minutosRestantes)} />
              <View style={estilos.linha}>
                <Botao variante="secundario" rotulo={textos.compartilhar.estender} onPress={() => void c.estender()} />
                <Botao variante="texto" rotulo={h.ok} onPress={c.dispensarAvisoTempo} />
              </View>
            </View>
          )}
          {encerrada && (
            <View style={estilos.aviso}>
              <Aviso simbolo="ⓘ" texto={textoEncerrado} />
              <Botao variante="texto" rotulo={h.ok} onPress={c.dispensarEncerrado} testID="encerrado-ok" />
            </View>
          )}
        </View>
      )}
      {/* O indicador já cobre a área segura do topo: as telas abaixo não somam o recuo de novo. */}
      <SafeAreaInsetsContext.Provider value={visivel ? { ...insets, top: 0 } : insets}>
        <View style={estilos.conteudo}>{children}</View>
      </SafeAreaInsetsContext.Provider>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  conteudo: { flex: 1 },
  topo: { paddingHorizontal: esp[4], paddingBottom: esp[2], borderBottomWidth: 1, gap: esp[2] },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: esp[2] },
  texto: { flex: 1, minHeight: toque.minimo, justifyContent: 'center' },
  aviso: { gap: esp[1] },
});
