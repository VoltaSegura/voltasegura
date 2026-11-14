import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ChaveImagem } from '@/theme/imagens';
import { esp, raio } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import type { NomeIcone } from './Icone';
import { ImagemPlaceholder } from './ImagemPlaceholder';

type Props = {
  imagem: ChaveImagem;
  icone?: NomeIcone;
  altura?: number;
  /** Botões sobre a imagem (ex.: voltar à esquerda, configurações à direita). */
  esquerda?: React.ReactNode;
  direita?: React.ReactNode;
  /** Texto sobre a parte de baixo da imagem. */
  children?: React.ReactNode;
};

/**
 * Faixa de imagem no topo da tela, com a borda de baixo curva (inspirada nas referências, D-29).
 * A curva é uma folha na cor do fundo que sobe sobre a imagem; o conteúdo da tela continua logo abaixo.
 * Use dentro de `Tela` com a propriedade `hero` (a Tela deixa de aplicar a área segura do topo).
 */
export function Hero({ imagem, icone, altura = 220, esquerda, direita, children }: Props) {
  const { cores } = useTema();
  return (
    <View style={{ height: altura }}>
      <ImagemPlaceholder nome={imagem} icone={icone} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={['top']} style={estilos.topo}>
        <View style={estilos.barra}>
          <View>{esquerda}</View>
          <View>{direita}</View>
        </View>
      </SafeAreaView>
      {children ? <View style={estilos.texto}>{children}</View> : null}
      <View style={[estilos.curva, { backgroundColor: cores.fundo }]} />
    </View>
  );
}

const CURVA = 28;
const estilos = StyleSheet.create({
  topo: { position: 'absolute', top: 0, left: 0, right: 0 },
  barra: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: esp[4], paddingTop: esp[2] },
  texto: { position: 'absolute', left: esp[4], right: esp[4], bottom: CURVA + esp[2], gap: esp[1] },
  curva: { position: 'absolute', left: 0, right: 0, bottom: -1, height: CURVA, borderTopLeftRadius: raio.painel, borderTopRightRadius: raio.painel },
});
