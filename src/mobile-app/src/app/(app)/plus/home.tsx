import { Stack } from 'expo-router';

import { Tela } from '@/components';
import { PlusHomeConteudo } from '@/plus';
import { textos } from '@/textos';

/**
 * TL-21: home do VoltaSegura+ como tela de pilha (item 11 do T25-B). A aba Plus mostra o mesmo conteúdo
 * quando há assinatura simulada (ver `(abas)/plus.tsx`).
 */
export default function PlusHome() {
  return (
    <Tela>
      <Stack.Screen options={{ title: textos.plus.titulo }} />
      <PlusHomeConteudo />
    </Tela>
  );
}
