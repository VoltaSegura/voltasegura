import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { brilho, esp, raio, tipo, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { Botao } from './Botao';
import { medidas } from './medidas';
import { Texto } from './Texto';

type Props = Omit<TextInputProps, 'style' | 'accessibilityLabel' | 'secureTextEntry'> & {
  /** Rótulo visível acima do campo (também é o rótulo de acessibilidade). */
  rotulo: string;
  ajuda?: string;
  /** Mensagem de erro; presença = estado de erro (anunciado). */
  erro?: string;
  desabilitado?: boolean;
  /** Campo de senha com botão mostrar/ocultar. */
  senha?: boolean;
  rotuloMostrar?: string;
  rotuloOcultar?: string;
};

export function CampoTexto({
  rotulo,
  ajuda,
  erro,
  desabilitado = false,
  senha = false,
  rotuloMostrar,
  rotuloOcultar,
  onFocus,
  onBlur,
  testID,
  ...resto
}: Props) {
  const { cores } = useTema();
  const [focado, setFocado] = useState(false);
  const [visivel, setVisivel] = useState(false);

  const corBorda = erro ? cores.erro : focado ? cores.acaoLink : cores.borda;
  const hint = [ajuda, erro].filter(Boolean).join(' ') || undefined;

  return (
    <View style={estilos.base}>
      <Texto variante="corpoForte">{rotulo}</Texto>
      <View
        style={[
          estilos.caixa,
          {
            backgroundColor: cores.superficie2,
            borderColor: corBorda,
            borderWidth: focado || erro ? medidas.bordaFoco : medidas.borda,
          },
          focado && !erro && brilho(cores.luz, 0.3),
          desabilitado && { opacity: medidas.opacidadeDesabilitado },
        ]}
      >
        <TextInput
          testID={testID}
          {...resto}
          editable={!desabilitado}
          secureTextEntry={senha && !visivel}
          accessibilityLabel={rotulo}
          accessibilityHint={hint}
          accessibilityState={{ disabled: desabilitado }}
          allowFontScaling
          maxFontSizeMultiplier={2}
          placeholderTextColor={cores.texto2}
          selectionColor={cores.acao}
          onFocus={(e) => {
            setFocado(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            onBlur?.(e);
          }}
          style={[estilos.entrada, tipo.corpo, { color: cores.texto }]}
        />
        {senha && rotuloMostrar && rotuloOcultar ? (
          <Botao
            variante="texto"
            rotulo={visivel ? rotuloOcultar : rotuloMostrar}
            onPress={() => setVisivel((v) => !v)}
            desabilitado={desabilitado}
          />
        ) : null}
      </View>
      {ajuda && !erro ? (
        <Texto variante="apoio" cor="texto2">
          {ajuda}
        </Texto>
      ) : null}
      {erro ? (
        <Texto variante="apoio" cor="erro" accessibilityLiveRegion="polite" accessibilityRole="alert">
          {erro}
        </Texto>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { gap: esp[1] },
  caixa: { flexDirection: 'row', alignItems: 'center', borderRadius: raio.medio, minHeight: toque.minimo },
  entrada: { flex: 1, minHeight: toque.minimo, paddingHorizontal: esp[3], paddingVertical: esp[2] },
});
