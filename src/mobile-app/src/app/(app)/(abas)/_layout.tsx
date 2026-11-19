import { Tabs } from 'expo-router';

import { BarraAbas } from '@/components/BarraAbas';

/**
 * Cinco abas da barra inferior (mockups 01 e 10): Planejar, Locais, Contatos, Plus e Perfil.
 * As telas de fluxo (resultado, modais, Plus de compra, etc.) ficam fora deste grupo, na pilha do (app).
 */
export default function AbasLayout() {
  return (
    <Tabs tabBar={(props) => <BarraAbas {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="planejar" />
      <Tabs.Screen name="locais" />
      <Tabs.Screen name="contatos" />
      <Tabs.Screen name="plus" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
