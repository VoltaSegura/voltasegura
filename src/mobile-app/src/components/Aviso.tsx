import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';

import { esp, raio } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { Botao } from './Botao';
import { medidas } from './medidas';
import { Texto } from './Texto';

export type VarianteAviso = 'informativo' | 'erro' | 'minuta';

type Props = {
  texto: string;
  variante?: VarianteAviso;
  /** Título opcional (lido antes do texto). */
  titulo?: string;
  /** Ação opcional, ex.: "Tentar de novo". */
  acao?: { rotulo: string; onPress: () => void };
  /** Símbolo decorativo (ⓘ/⚠). A informação nunca depende dele: o texto diz tudo. */
  simbolo?: string;
  testID?: string;
};

/** Banner de informação, erro ou minuta. Anunciado ao aparecer (região ao vivo). */
export function Aviso({ texto, variante = 'informativo', titulo, acao, simbolo, testID }: Props) {
  const { cores } = useTema();
  const erro = variante === 'erro';
  useEffect(() => {
    if (erro) AccessibilityInfo.announceForAccessibility(titulo ? `${titulo}. ${texto}` : texto);
  }, [erro, texto, titulo]);
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole={erro ? 'alert' : undefined}
      accessibilityLiveRegion={erro ? 'assertive' : 'polite'}
      accessibilityLabel={titulo ? `${titulo}. ${texto}` : texto}
      style={[
        estilos.base,
        variante === 'informativo' && { backgroundColor: cores.superficie2 },
        variante === 'erro' && {
          backgroundColor: cores.superficie2,
          borderLeftWidth: medidas.filete,
          borderLeftColor: cores.erro,
        },
        variante === 'minuta' && { borderWidth: medidas.borda, borderStyle: 'dashed', borderColor: cores.borda },
      ]}
    >
      <View style={estilos.linha}>
        {simbolo ? (
          <Texto variante="corpoForte" cor={erro ? 'erro' : 'dado'} importantForAccessibility="no" accessibilityElementsHidden>
            {simbolo}
          </Texto>
        ) : null}
        <View style={estilos.corpo}>
          {titulo ? <Texto variante="corpoForte">{titulo}</Texto> : null}
          <Texto variante="corpo">{texto}</Texto>
        </View>
      </View>
      {acao ? <Botao variante="texto" rotulo={acao.rotulo} onPress={acao.onPress} style={estilos.acao} /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { borderRadius: raio.medio, padding: esp[3], gap: esp[2] },
  linha: { flexDirection: 'row', gap: esp[2] },
  corpo: { flex: 1, gap: esp[1] },
  acao: { alignSelf: 'flex-start' },
});
