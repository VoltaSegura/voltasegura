import { forwardRef, useState, type ComponentRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Botao, Texto } from '@/components';
import { medidas } from '@/components/medidas';
import { esp, raio, tipo, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

type Props = Omit<TextInputProps, 'style' | 'accessibilityLabel' | 'secureTextEntry'> & {
  rotulo: string;
  erro?: string;
  desabilitado?: boolean;
  senha?: boolean;
  rotuloMostrar?: string;
  rotuloOcultar?: string;
};

export const CampoEntrada = forwardRef<ComponentRef<typeof TextInput>, Props>(function CampoEntrada(
  { rotulo, erro, desabilitado = false, senha = false, rotuloMostrar, rotuloOcultar, onFocus, onBlur, ...resto },
  ref,
) {
  const { cores } = useTema();
  const [focado, setFocado] = useState(false);
  const [visivel, setVisivel] = useState(false);
  return (
    <View style={estilos.base}>
      <Texto variante="corpoForte">{rotulo}</Texto>
      <View style={[estilos.caixa, { backgroundColor: cores.superficie2, borderColor: erro ? cores.erro : focado ? cores.acaoLink : cores.borda, borderWidth: focado || erro ? medidas.bordaFoco : medidas.borda }, desabilitado && { opacity: medidas.opacidadeDesabilitado }]}>
        <TextInput
          ref={ref}
          {...resto}
          editable={!desabilitado}
          secureTextEntry={senha && !visivel}
          accessibilityLabel={rotulo}
          accessibilityHint={erro}
          accessibilityState={{ disabled: desabilitado }}
          allowFontScaling
          maxFontSizeMultiplier={2}
          placeholderTextColor={cores.texto2}
          selectionColor={cores.acao}
          onFocus={(event) => { setFocado(true); onFocus?.(event); }}
          onBlur={(event) => { setFocado(false); onBlur?.(event); }}
          style={[estilos.entrada, tipo.corpo, { color: cores.texto }]}
        />
        {senha && rotuloMostrar && rotuloOcultar ? (
          <Botao variante="texto" rotulo={visivel ? rotuloOcultar : rotuloMostrar} onPress={() => setVisivel((valor) => !valor)} desabilitado={desabilitado} />
        ) : null}
      </View>
      {erro ? <Texto variante="apoio" cor="erro" accessibilityLiveRegion="polite" accessibilityRole="alert">{erro}</Texto> : null}
    </View>
  );
});

const estilos = StyleSheet.create({
  base: { gap: esp[1] },
  caixa: { flexDirection: 'row', alignItems: 'center', borderRadius: raio.medio, minHeight: toque.minimo },
  entrada: { flex: 1, minWidth: 0, minHeight: toque.minimo, paddingHorizontal: esp[3], paddingVertical: esp[2] },
});
