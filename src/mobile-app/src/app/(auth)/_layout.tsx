import { Stack } from 'expo-router';

import { useTema } from '@/theme/useTema';

export default function AuthLayout() {
  const { cores } = useTema();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerTintColor: cores.texto,
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="criar-conta" options={{ title: 'Criar conta' }} />
      <Stack.Screen name="entrar" options={{ title: 'Entrar' }} />
    </Stack>
  );
}
