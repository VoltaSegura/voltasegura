import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useSyncExternalStore } from 'react';
import { View } from 'react-native';

import { CompartilhamentoProvider, linkPendente, useCompartilhamento } from '@/compartilhamento';
import { IndicadorCompartilhamento } from '@/components/compartilhamento/IndicadorCompartilhamento';
import { definirProvedorToken } from '@/services';
import { SessaoProvider, useSessao } from '@/sessao/SessaoContext';
import { ModoTemaProvider } from '@/theme/ModoTemaProvider';
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
    <ModoTemaProvider>
      <SessaoProvider>
        <CompartilhamentoProvider>
          <LigacaoServicos />
          <LigacaoLink />
          <IndicadorCompartilhamento>
            <Navegacao />
          </IndicadorCompartilhamento>
        </CompartilhamentoProvider>
      </SessaoProvider>
    </ModoTemaProvider>
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

/**
 * Link de acompanhar (D-21, PL-23): sem sessão, o token espera o login; com sessão, abre a TL-15.
 * Ao sair da conta, uma sessão de compartilhamento ativa é encerrada (nada continua sem a conta).
 */
function LigacaoLink() {
  const { logado } = useSessao();
  const { fase, parar } = useCompartilhamento();
  const token = useSyncExternalStore(linkPendente.assinar, linkPendente.obter, linkPendente.obter);

  useEffect(() => {
    linkPendente.definirLogado(logado);
  }, [logado]);

  useEffect(() => {
    if (!logado && fase === 'ativa') void parar();
  }, [logado, fase, parar]);

  useEffect(() => {
    if (!logado || !token) return;
    // espera o navegador montar as rotas protegidas antes de empilhar a tela
    const id = setTimeout(() => {
      linkPendente.definir(null);
      router.push({ pathname: '/acompanhar/[token]', params: { token } });
    }, 0);
    return () => clearTimeout(id);
  }, [logado, token]);

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
