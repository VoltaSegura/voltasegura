import { Stack } from 'expo-router';

import { fonte } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

export default function AuthLayout() {
  const { cores } = useTema();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerTintColor: cores.texto,
        headerTitleStyle: { fontSize: 17, fontFamily: fonte.displayMedio },
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="criar-conta" />
      <Stack.Screen name="entrar" />
    </Stack>
  );
}
