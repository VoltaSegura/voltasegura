import { Pressable, StyleSheet, Text, View } from 'react-native';

import { esp, fonte, raio } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

import { Icone, type NomeIcone } from './Icone';
import { medidas } from './medidas';

type Item = { rotulo: string; icone: NomeIcone };

/** Forma mínima do `tabBar` do Expo Router (evita depender de @react-navigation/bottom-tabs direto). */
type BottomTabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigateToTab: (chave: string) => void;
};

/**
 * Barra inferior flutuante em pílula (mockups 01 e 10 da onda de redesign).
 * Os rótulos e ícones vêm do nome da rota: quem cria a aba informa `icone` em `ICONES_ABAS`.
 */
export const ICONES_ABAS: Record<string, Item> = {
  planejar: { rotulo: 'Planejar', icone: 'map-outline' },
  locais: { rotulo: 'Locais', icone: 'map-marker-outline' },
  contatos: { rotulo: 'Contatos', icone: 'account-group-outline' },
  plus: { rotulo: 'Plus', icone: 'star-outline' },
  perfil: { rotulo: 'Perfil', icone: 'account-circle-outline' },
};

export function BarraAbas({ state, navigateToTab }: BottomTabBarProps) {
  const { cores } = useTema();
  return (
    <View style={[estilos.externo, { paddingBottom: esp[3] }]} pointerEvents="box-none">
      <View style={[estilos.pilula, { backgroundColor: '#0D1B2A', borderColor: cores.divisoria }]}>
        {state.routes.map((rota, indice) => {
          const ativa = state.index === indice;
          const info = ICONES_ABAS[rota.name] ?? { rotulo: rota.name, icone: 'circle-outline' as NomeIcone };
          const corConteudo = ativa ? '#0D1B2A' : '#F8F9FA';
          return (
            <Pressable
              key={rota.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: ativa }}
              accessibilityLabel={info.rotulo}
              onPress={() => {
                if (!ativa) navigateToTab(rota.key);
              }}
              style={[estilos.item, ativa && { backgroundColor: cores.acao, borderRadius: raio.pilula }]}
            >
              <Icone nome={info.icone} tamanho={22} cor={corConteudo} />
              <Text style={[estilos.rotulo, { color: corConteudo }]}>{info.rotulo}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  externo: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  pilula: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: raio.pilula,
    borderWidth: medidas.borda,
    paddingHorizontal: esp[1],
    paddingVertical: esp[1],
    minHeight: 64,
    width: '92%',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: esp[1],
  },
  rotulo: { fontFamily: fonte.textoMedio, fontSize: 13, marginTop: 2 },
});
