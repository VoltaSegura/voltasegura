import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { hipotesesMapa as h } from '@/textos/hipotesesMapa';
import { brilho, esp, raio, tipo, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { Icone } from '../Icone';
import { Texto } from '../Texto';

type Props = {
  valor: string;
  onChange: (valor: string) => void;
  onBuscar: () => void;
  buscando?: boolean;
  testID?: string;
};

/** Campo de busca por texto sobre o mapa (D-29). Só consulta ao tocar em Buscar ou no "ok" do teclado. */
export function BuscaEndereco({ valor, onChange, onBuscar, buscando = false, testID }: Props) {
  const { cores } = useTema();
  const [focado, setFocado] = useState(false);
  return (
    <View>
      <View style={[estilos.caixa, { backgroundColor: cores.superficie, borderColor: focado ? cores.acaoLink : cores.borda }, brilho(cores.fundo, 0.5)]}>
        <Icone nome="magnify" tamanho={22} corTema="texto2" />
        <TextInput
          testID={testID}
          accessibilityLabel={h.buscarCampo}
          placeholder={h.buscarExemplo}
          placeholderTextColor={cores.texto2}
          selectionColor={cores.acao}
          value={valor}
          onChangeText={onChange}
          onSubmitEditing={onBuscar}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          returnKeyType="search"
          autoCorrect={false}
          allowFontScaling
          maxFontSizeMultiplier={2}
          style={[estilos.entrada, tipo.corpo, { color: cores.texto }]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={h.buscar}
          accessibilityState={{ disabled: buscando, busy: buscando }}
          disabled={buscando}
          onPress={onBuscar}
          style={[estilos.botao, { backgroundColor: cores.acao }]}
        >
          {buscando ? <ActivityIndicator size="small" color={cores.acaoTexto} /> : <Texto variante="rotulo" cor="acaoTexto">{h.buscar}</Texto>}
        </Pressable>
      </View>
      {focado ? <Texto variante="apoio" cor="texto2" style={[estilos.aviso, { backgroundColor: cores.fundo + 'E6' }]}>{h.buscarAviso}</Texto> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { flexDirection: 'row', alignItems: 'center', gap: esp[2], borderRadius: raio.pilula, borderWidth: 1, paddingLeft: esp[4], paddingRight: esp[2], minHeight: toque.minimo + 4 },
  entrada: { flex: 1, minHeight: toque.minimo, paddingVertical: esp[2] },
  botao: { minHeight: 36, minWidth: 64, borderRadius: raio.pilula, alignItems: 'center', justifyContent: 'center', paddingHorizontal: esp[3] },
  aviso: { marginTop: esp[2], padding: esp[2], borderRadius: raio.medio },
});
