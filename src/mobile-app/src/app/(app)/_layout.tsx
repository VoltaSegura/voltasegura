import { Stack } from 'expo-router';

import { useTema } from '@/theme/useTema';

/** Rotas que exigem sessão. A guarda fica na raiz (Stack.Protected). */
export default function AppLayout() {
  const { cores } = useTema();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerTintColor: cores.texto,
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="planejar" options={{ title: 'Planejar' }} />
      <Stack.Screen
        name="escolher-ponto"
        options={{ title: 'Escolher ponto', presentation: 'modal' }}
      />
      <Stack.Screen name="buscando" options={{ title: 'Buscando alternativas' }} />
      <Stack.Screen name="resultado/index" options={{ title: 'Alternativas' }} />
      <Stack.Screen name="resultado/[rotaId]" options={{ title: 'Detalhes da rota' }} />
      <Stack.Screen
        name="por-que/[rotaId]/[trechoId]"
        options={{ title: 'Por que esta rota?', presentation: 'modal' }}
      />
      <Stack.Screen name="sobre-os-dados" options={{ title: 'Sobre os dados' }} />
      <Stack.Screen name="dados-considerados" options={{ title: 'Dados considerados' }} />
      <Stack.Screen name="configuracoes" options={{ title: 'Configurações' }} />
      <Stack.Screen
        name="compartilhar/[rotaId]"
        options={{ title: 'Compartilhar', presentation: 'modal' }}
      />
      <Stack.Screen name="acompanhar/[token]" options={{ title: 'Acompanhar viagem' }} />
    </Stack>
  );
}
