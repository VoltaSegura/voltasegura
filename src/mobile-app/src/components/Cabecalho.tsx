import { AccessibilityInfo, findNodeHandle, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';

import { esp } from '@/theme/tokens';
import { textos } from '@/textos';

import { Botao } from './Botao';
import { Texto } from './Texto';

type Acao = { rotulo: string; onPress: () => void };

type Props = {
  titulo: string;
  subtitulo?: string;
  /** Botão à esquerda (voltar ou fechar): o rótulo vem de `textos.comuns`. */
  navegacao?: Acao;
  /** Ação à direita (ex.: configurações). */
  acaoDireita?: Acao;
};

export function Cabecalho({ titulo, subtitulo, navegacao, acaoDireita }: Props) {
  const tituloRef = useRef<React.ComponentRef<typeof Text>>(null);
  useEffect(() => {
    if (navegacao?.rotulo !== textos.comuns.fechar) return;
    const id = requestAnimationFrame(() => {
      const no = findNodeHandle(tituloRef.current);
      if (no != null) AccessibilityInfo.setAccessibilityFocus(no);
    });
    return () => cancelAnimationFrame(id);
  }, [navegacao?.rotulo]);
  return (
    <View style={estilos.base}>
      <View style={estilos.linha}>
        {navegacao ? <Botao variante="texto" rotulo={navegacao.rotulo} onPress={navegacao.onPress} /> : null}
        <View style={estilos.titulos}>
          <Texto ref={tituloRef} variante="titulo" accessibilityRole="header">
            {titulo}
          </Texto>
          {subtitulo ? (
            <Texto variante="apoio" cor="texto2">
              {subtitulo}
            </Texto>
          ) : null}
        </View>
        {acaoDireita ? <Botao variante="texto" rotulo={acaoDireita.rotulo} onPress={acaoDireita.onPress} /> : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { paddingVertical: esp[2] },
  linha: { flexDirection: 'row', alignItems: 'center', gap: esp[2] },
  titulos: { flex: 1, gap: esp[1] },
});
