import { Stack, useRouter } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, TextInput, View } from 'react-native';

import { Aviso, Botao, BotaoIcone, Hero, Caixa, Link, Tela, Texto } from '@/components';
import { CampoEntrada } from '@/components/entrada';
import { ErroServico, servicos } from '@/services';
import { useSessao } from '@/sessao/SessaoContext';
import { textos } from '@/textos';
import { hipotesesEntrada } from '@/textos/hipotesesEntrada';
import { esp } from '@/theme/tokens';

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CriarConta() {
  const router = useRouter();
  const { abrirSessao } = useSessao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [aceiteAviso, setAceiteAviso] = useState(false);
  const [erroEmail, setErroEmail] = useState<string>();
  const [erroSenha, setErroSenha] = useState<string>();
  const [erroAceite, setErroAceite] = useState<string>();
  const [erroGeral, setErroGeral] = useState<string>();
  const [carregando, setCarregando] = useState(false);
  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);
  const senhaRef = useRef<ComponentRef<typeof TextInput>>(null);

  function anunciar(mensagem: string) {
    AccessibilityInfo.announceForAccessibility(mensagem);
  }

  async function cadastrar() {
    if (carregando) return;
    const emailValido = FORMATO_EMAIL.test(email.trim());
    const senhaValida = senha.length > 0;
    setErroEmail(emailValido ? undefined : textos.criarConta.erroEmail);
    setErroSenha(senhaValida ? undefined : textos.criarConta.erroSenha);
    setErroAceite(aceiteAviso ? undefined : textos.criarConta.erroAceite);
    setErroGeral(undefined);
    if (!emailValido || !senhaValida || !aceiteAviso) {
      if (!emailValido) { emailRef.current?.focus(); anunciar(textos.criarConta.erroEmail); }
      else if (!senhaValida) { senhaRef.current?.focus(); anunciar(textos.criarConta.erroSenha); }
      else anunciar(textos.criarConta.erroAceite);
      return;
    }

    setCarregando(true);
    try {
      const sessao = await servicos.conta.cadastrar({ email: email.trim(), senha, aceiteAviso });
      await abrirSessao(sessao);
    } catch (erro) {
      if (erro instanceof ErroServico) {
        if (erro.codigo === 'EMAIL_EXISTENTE') { setErroGeral(textos.criarConta.erroEmailExistente); anunciar(textos.criarConta.erroEmailExistente); setTimeout(() => emailRef.current?.focus(), 0); }
        else if (erro.codigo === 'ACEITE') { setErroAceite(textos.criarConta.erroAceite); anunciar(textos.criarConta.erroAceite); }
        else if (erro.codigo === 'SENHA_CURTA' || erro.codigo === 'SENHA_LONGA') {
          const mensagem = erro.codigo === 'SENHA_CURTA' ? hipotesesEntrada.senhaCurta : hipotesesEntrada.senhaLonga;
          setErroSenha(mensagem); anunciar(mensagem); setTimeout(() => senhaRef.current?.focus(), 0);
        } else if (erro.tipo === 'SEM_REDE') { setErroGeral(textos.comuns.erro.semRede); anunciar(textos.comuns.erro.semRede); }
        else if (erro.tipo === 'VALIDACAO') { setErroGeral(hipotesesEntrada.cadastroInvalido); anunciar(hipotesesEntrada.cadastroInvalido); }
        else { setErroGeral(textos.comuns.erro.servidor); anunciar(textos.comuns.erro.servidor); }
      } else { setErroGeral(textos.comuns.erro.servidor); anunciar(textos.comuns.erro.servidor); }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Tela hero={<Hero imagem="heroCriarConta" icone="account-plus-outline" altura={190} esquerda={<BotaoIcone icone="arrow-left" rotulo={textos.comuns.voltar} onPress={() => router.back()} />}><Texto variante="titulo" accessibilityRole="header">{textos.criarConta.titulo}</Texto></Hero>}>
      <Stack.Screen options={{ title: textos.criarConta.titulo, headerShown: false }} />
      <Texto cor="texto2">{textos.criarConta.apoio}</Texto>
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
        autoComplete="new-password"
        desabilitado={carregando}
      />
      <View style={{ gap: esp[2] }}>
        <Caixa
          rotulo={textos.criarConta.aceite}
          marcada={aceiteAviso}
          onChange={(valor) => { setAceiteAviso(valor); setErroAceite(undefined); }}
          erro={erroAceite}
          desabilitado={carregando}
        />
        <Link rotulo={textos.criarConta.lerAviso} onPress={() => router.push('/aviso-privacidade')} desabilitado={carregando} />
      </View>
      {erroGeral ? <Aviso variante="erro" texto={erroGeral} acao={erroGeral === textos.comuns.erro.semRede ? { rotulo: textos.comuns.tentarDeNovo, onPress: () => { void cadastrar(); } } : undefined} /> : null}
      <Botao
        rotulo={textos.criarConta.botao}
        rotuloCarregando={textos.criarConta.botaoCarregando}
        anuncioCarregando={textos.comuns.carregando}
        onPress={() => { void cadastrar(); }}
        carregando={carregando}
      />
      <Link rotulo={textos.criarConta.jaTenho} onPress={() => router.replace('/entrar')} desabilitado={carregando} />
    </Tela>
  );
}
