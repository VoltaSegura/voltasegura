import { router, Stack } from 'expo-router';

import { ConsultaProvider } from '@/consulta';
import { LocaisProvider } from '@/locais';
import { fonte } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';
import { Botao } from '@/components/Botao';
import { TituloModal } from '@/components/TituloModal';
import { textos } from '@/textos';

/**
 * Rotas que exigem sessão. A guarda fica na raiz (Stack.Protected).
 * O estado da consulta vive só enquanto houver sessão: ao sair, este layout
 * desmonta e a consulta e a resposta são descartadas (05_navegacao.md, "Estados globais").
 */
export default function AppLayout() {
  return (
    <ConsultaProvider>
      <LocaisProvider>
        <PilhaApp />
      </LocaisProvider>
    </ConsultaProvider>
  );
}

function PilhaApp() {
  const { cores } = useTema();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerTintColor: cores.texto,
        headerTitleStyle: { fontSize: 17, fontFamily: fonte.displayMedio },
        headerBackTitle: textos.comuns.voltar,
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="planejar" options={{ headerShown: false }} />
      <Stack.Screen
        name="escolher-ponto"
        options={{ presentation: 'modal', headerShown: false }}
      />
      <Stack.Screen name="buscando" options={{ headerShown: false }} />
      <Stack.Screen name="resultado/index" />
      <Stack.Screen name="resultado/[rotaId]" />
      <Stack.Screen
        name="por-que/[rotaId]/[trechoId]"
        options={{ presentation: 'modal', headerTitle: ({ children }) => <TituloModal titulo={children} cor={cores.texto} />, headerRight: () => <Botao variante="texto" rotulo={textos.comuns.fechar} onPress={() => router.back()} /> }}
      />
      <Stack.Screen name="sobre-os-dados" />
      <Stack.Screen name="dados-considerados" />
      <Stack.Screen name="configuracoes" />
      <Stack.Screen
        name="compartilhar/[rotaId]"
        options={{ title: 'Compartilhar', presentation: 'modal', headerTitle: ({ children }) => <TituloModal titulo={children} cor={cores.texto} />, headerRight: () => <Botao variante="texto" rotulo={textos.comuns.fechar} onPress={() => router.back()} /> }}
      />
      <Stack.Screen name="acompanhar/[token]" options={{ title: 'Acompanhar viagem' }} />
    </Stack>
  );
}
