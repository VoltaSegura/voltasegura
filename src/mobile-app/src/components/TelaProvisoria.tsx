import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { esp, raio, tipo, toque } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

export type AcaoProvisoria = {
  rotulo: string;
  /** Navega para esta rota (push). */
  href?: Href;
  /** Substitui a tela atual em vez de empilhar. */
  substituir?: boolean;
  /** Alternativa a `href`: executa uma função. */
  aoTocar?: () => void;
};

type Props = {
  /** ID da especificação em docs/app-map/04_telas/ (ex.: "TL-04"). */
  codigo: string;
  titulo: string;
  descricao?: string;
  acoes?: AcaoProvisoria[];
};

/**
 * Tela de esqueleto: mostra qual especificação ela representa e os caminhos
 * de navegação previstos em docs/app-map/05_navegacao.md. Cada tela real
 * substitui este componente na fatia correspondente (docs/plano_app.md §5.3).
 */
export function TelaProvisoria({ codigo, titulo, descricao, acoes = [] }: Props) {
  const { cores } = useTema();

  function tocar(acao: AcaoProvisoria) {
    if (acao.aoTocar) return acao.aoTocar();
    if (!acao.href) return;
    if (acao.substituir) router.replace(acao.href);
    else router.push(acao.href);
  }

  return (
    <ScrollView
      style={{ backgroundColor: cores.fundo }}
      contentContainerStyle={estilos.conteudo}
    >
      <Text style={[tipo.rotulo, { color: cores.texto2 }]}>{codigo} · tela provisória</Text>
      <Text accessibilityRole="header" style={[tipo.titulo, { color: cores.texto }]}>
        {titulo}
      </Text>
      {descricao ? (
        <Text style={[tipo.corpo, { color: cores.texto2 }]}>{descricao}</Text>
      ) : null}

      <View style={estilos.acoes}>
        {acoes.map((acao) => (
          <Pressable
            key={acao.rotulo}
            accessibilityRole="button"
            onPress={() => tocar(acao)}
            style={({ pressed }) => [
              estilos.botao,
              {
                backgroundColor: pressed ? cores.superficie2 : cores.superficie,
                borderColor: cores.borda,
              },
            ]}
          >
            <Text style={[tipo.corpoForte, { color: cores.texto }]}>{acao.rotulo}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: {
    padding: esp[4],
    gap: esp[3],
  },
  acoes: {
    marginTop: esp[6],
    gap: toque.espaco,
  },
  botao: {
    minHeight: toque.minimo,
    justifyContent: 'center',
    paddingHorizontal: esp[4],
    borderWidth: 1,
    borderRadius: raio.medio,
  },
});
