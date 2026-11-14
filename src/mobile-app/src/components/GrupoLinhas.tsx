import { Pressable, StyleSheet, View } from 'react-native';

import { esp, raio, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { Icone, type NomeIcone } from './Icone';
import { Texto } from './Texto';

/** Grupo de linhas dentro de um cartão, com título de seção em cima (referência "Profile after", D-29). */
export function GrupoLinhas({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const { cores } = useTema();
  return (
    <View style={estilos.grupo}>
      <Texto variante="rotulo" cor="texto2" accessibilityRole="header" style={estilos.titulo}>{titulo}</Texto>
      <View style={[estilos.cartao, { backgroundColor: cores.superficie, borderColor: cores.divisoria }]}>{children}</View>
    </View>
  );
}

type PropsLinha = {
  icone: NomeIcone;
  titulo: string;
  detalhe?: string;
  /** Se informado, a linha é um botão com seta. */
  onPress?: () => void;
  /** Ação secundária à direita (ex.: apagar). */
  acao?: { icone: NomeIcone; rotulo: string; onPress: () => void };
  ultima?: boolean;
  destrutiva?: boolean;
  testID?: string;
};

export function LinhaGrupo({ icone, titulo, detalhe, onPress, acao, ultima = false, destrutiva = false, testID }: PropsLinha) {
  const { cores } = useTema();
  const corpo = (
    <>
      <View style={[estilos.icone, { backgroundColor: cores.superficie2 }]}><Icone nome={icone} tamanho={20} corTema={destrutiva ? 'erro' : 'acaoLink'} /></View>
      <View style={estilos.textos}>
        <Texto variante="corpo" cor={destrutiva ? 'erro' : 'texto'} numberOfLines={2}>{titulo}</Texto>
        {detalhe ? <Texto variante="apoio" cor="texto2" numberOfLines={2}>{detalhe}</Texto> : null}
      </View>
    </>
  );
  const base = [estilos.linha, !ultima && { borderBottomWidth: 1, borderBottomColor: cores.divisoria }];
  return (
    <View style={base}>
      {onPress ? (
        <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={[titulo, detalhe].filter(Boolean).join('. ')} onPress={onPress} style={estilos.alvo}>
          {corpo}
          <Icone nome="chevron-right" tamanho={22} corTema="texto2" />
        </Pressable>
      ) : (
        <View testID={testID} accessible accessibilityLabel={[titulo, detalhe].filter(Boolean).join('. ')} style={estilos.alvo}>{corpo}</View>
      )}
      {acao ? (
        <Pressable accessibilityRole="button" accessibilityLabel={acao.rotulo} onPress={acao.onPress} style={estilos.acao}>
          <Icone nome={acao.icone} tamanho={22} corTema="texto2" />
        </Pressable>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { gap: esp[2] },
  titulo: { paddingHorizontal: esp[2] },
  cartao: { borderRadius: raio.grande, borderWidth: 1, overflow: 'hidden' },
  linha: { flexDirection: 'row', alignItems: 'center', minHeight: toque.minimo + esp[3] },
  alvo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: esp[3], paddingVertical: esp[2], paddingHorizontal: esp[3], minHeight: toque.minimo + esp[3] },
  icone: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  textos: { flex: 1 },
  acao: { width: toque.minimo, height: toque.minimo, alignItems: 'center', justifyContent: 'center' },
});
