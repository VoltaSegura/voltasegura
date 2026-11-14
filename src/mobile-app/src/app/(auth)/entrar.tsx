import { Stack, useRouter } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, TextInput } from 'react-native';

import { Aviso, Botao, BotaoIcone, Hero, Link, Tela, Texto } from '@/components';
import { CampoEntrada } from '@/components/entrada';
import { ErroServico, servicos } from '@/services';
import { useSessao } from '@/sessao/SessaoContext';
import { textos } from '@/textos';

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Entrar() {
  const router = useRouter();
  const { abrirSessao } = useSessao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroEmail, setErroEmail] = useState<string>();
  const [erroSenha, setErroSenha] = useState<string>();
  const [erroGeral, setErroGeral] = useState<string>();
  const [carregando, setCarregando] = useState(false);
  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);
  const senhaRef = useRef<ComponentRef<typeof TextInput>>(null);

  async function entrar() {
    if (carregando) return;
    const erroDeEmail = !email.trim()
      ? textos.entrar.erroVazioEmail
      : !FORMATO_EMAIL.test(email.trim()) ? textos.criarConta.erroEmail : undefined;
    const erroDeSenha = senha.length ? undefined : textos.entrar.erroVazioSenha;
    setErroEmail(erroDeEmail);
    setErroSenha(erroDeSenha);
    setErroGeral(undefined);
    if (erroDeEmail || erroDeSenha) {
      if (erroDeEmail) { emailRef.current?.focus(); AccessibilityInfo.announceForAccessibility(erroDeEmail); }
      else if (erroDeSenha) { senhaRef.current?.focus(); AccessibilityInfo.announceForAccessibility(erroDeSenha); }
      return;
    }

    setCarregando(true);
    try {
      const sessao = await servicos.conta.entrar({ email: email.trim(), senha });
      await abrirSessao(sessao);
    } catch (erro) {
      if (erro instanceof ErroServico) {
        if (erro.tipo === 'SEM_REDE') { setErroGeral(textos.comuns.erro.semRede); AccessibilityInfo.announceForAccessibility(textos.comuns.erro.semRede); }
        else if (erro.tipo === 'INDISPONIVEL') { setErroGeral(textos.comuns.erro.servidor); AccessibilityInfo.announceForAccessibility(textos.comuns.erro.servidor); }
        else { setErroGeral(textos.entrar.erroCredenciais); AccessibilityInfo.announceForAccessibility(textos.entrar.erroCredenciais); setTimeout(() => emailRef.current?.focus(), 0); }
      } else { setErroGeral(textos.comuns.erro.servidor); AccessibilityInfo.announceForAccessibility(textos.comuns.erro.servidor); }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Tela hero={<Hero imagem="heroEntrar" icone="lock-outline" altura={190} esquerda={<BotaoIcone icone="arrow-left" rotulo={textos.comuns.voltar} onPress={() => router.back()} />}><Texto variante="titulo" accessibilityRole="header">{textos.entrar.titulo}</Texto></Hero>}>
      <Stack.Screen options={{ title: textos.entrar.titulo, headerShown: false }} />
      <CampoEntrada
        ref={emailRef}
        rotulo={textos.criarConta.email}
        value={email}
        onChangeText={(valor) => { setEmail(valor); setErroEmail(undefined); }}
        erro={erroEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        desabilitado={carregando}
      />
      <CampoEntrada
        ref={senhaRef}
        rotulo={textos.criarConta.senha}
        value={senha}
        onChangeText={(valor) => { setSenha(valor); setErroSenha(undefined); }}
        erro={erroSenha}
        senha
        rotuloMostrar={textos.criarConta.mostrarSenha}
        rotuloOcultar={textos.criarConta.ocultarSenha}
        autoComplete="current-password"
        desabilitado={carregando}
      />
      {erroGeral ? <Aviso variante="erro" texto={erroGeral} acao={erroGeral === textos.comuns.erro.semRede ? { rotulo: textos.comuns.tentarDeNovo, onPress: () => { void entrar(); } } : undefined} /> : null}
      <Botao
        rotulo={textos.entrar.botao}
        rotuloCarregando={textos.entrar.botaoCarregando}
        anuncioCarregando={textos.comuns.carregando}
        onPress={() => { void entrar(); }}
        carregando={carregando}
      />
      <Link rotulo={textos.entrar.criar} onPress={() => router.replace('/criar-conta')} desabilitado={carregando} />
    </Tela>
  );
}
