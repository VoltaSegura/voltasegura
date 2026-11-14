import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { definirProvedorToken } from '@/services';
import { SessaoProvider, useSessao } from '@/sessao/SessaoContext';
import { coresEscuro, fonte } from '@/theme/tokens';
import { useFontesPremium } from '@/theme/fontes';
import { useTema } from '@/theme/useTema';

/**
 * Raiz: provedores e guarda de sessão (docs/app-map/05_navegacao.md, "Guardas").
 * Sem sessão, qualquer rota de (app) volta para a TL-01; com sessão, o app abre na TL-04.
 */
export default function RootLayout() {
  const fontesProntas = useFontesPremium();
  // Segura a primeira pintura (fundo da marca) até as fontes chegarem: evita o salto de fonte.
  if (!fontesProntas) return <View style={{ flex: 1, backgroundColor: coresEscuro.fundo }} />;
  return (
    <SessaoProvider>
      <LigacaoServicos />
      <Navegacao />
    </SessaoProvider>
  );
}

/** Entrega o token da sessão à camada de serviços (cabeçalho Authorization das chamadas da consulta). */
function LigacaoServicos() {
  const { sessao } = useSessao();

  useEffect(() => {
    definirProvedorToken(() => sessao?.token ?? null);
  }, [sessao]);

  return null;
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
            headerTitleStyle: { fontSize: 17, fontFamily: fonte.displayMedio },
            headerStyle: { backgroundColor: cores.fundo },
            headerTintColor: cores.texto,
          }}
        />
      </Stack>
    </>
  );
}
