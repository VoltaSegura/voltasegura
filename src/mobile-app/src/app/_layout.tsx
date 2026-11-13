import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SessaoProvider, useSessao } from '@/sessao/SessaoContext';
import { useTema } from '@/theme/useTema';

/**
 * Raiz: provedores e guarda de sessão (docs/app-map/05_navegacao.md, "Guardas").
 * Sem sessão, qualquer rota de (app) volta para a TL-01; com sessão, o app abre na TL-04.
 */
export default function RootLayout() {
  return (
    <SessaoProvider>
      <Navegacao />
    </SessaoProvider>
  );
}

function Navegacao() {
  const { logado } = useSessao();
  const { cores, escuro } = useTema();

  return (
    <>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: cores.fundo },
        }}
      >
        <Stack.Protected guard={!logado} redirectTo="/planejar">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={logado} redirectTo="/">
          <Stack.Screen name="(app)" />
        </Stack.Protected>

        {/* TL-13: acessível com ou sem sessão. */}
        <Stack.Screen
          name="aviso-privacidade"
          options={{
            headerShown: true,
            title: 'Aviso de privacidade',
            headerStyle: { backgroundColor: cores.fundo },
            headerTintColor: cores.texto,
          }}
        />
      </Stack>
    </>
  );
}
