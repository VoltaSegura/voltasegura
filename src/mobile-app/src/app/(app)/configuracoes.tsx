import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, Keyboard, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';

import { Aviso, Botao, CampoTexto, GrupoLinhas, ImagemPlaceholder, LinhaGrupo, Tela, Texto } from '@/components';
import { infoTipo } from '@/components/planejar';
import { useLocais, MAX_NOME, type LocalSalvo } from '@/locais';
import { normalizarNome } from '@/locais/armazenamento';
import { servicos } from '@/services';
import { useSessao } from '@/sessao/SessaoContext';
import { textos } from '@/textos';
import { rotina as r } from '@/textos/rotina';
import { hipotesesDetalhes as h } from '@/textos/hipotesesDetalhes';
import { hipotesesMapa as m } from '@/textos/hipotesesMapa';
import { hipotesesConfig as c } from '@/textos/hipotesesConfig';
import { esp } from '@/theme/tokens';

export default function Configuracoes() {
  const { sessao, encerrarSessao } = useSessao();
  const { locais, apagar, renomear, restaurar } = useLocais();
  const [saindo, setSaindo] = useState(false);

  const [editando, setEditando] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [erroNome, setErroNome] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const trava = useRef(false);
  const [apagado, setApagado] = useState<{ local: LocalSalvo; posicao: number } | null>(null);
  const [alturaTeclado, setAlturaTeclado] = useState(0);
  const rolagem = useRef<ComponentRef<typeof ScrollView>>(null);
  const editor = useRef<ComponentRef<typeof View>>(null);
  const deslocamento = useRef(0);
  const topoTeclado = useRef<number | null>(null);

  // Mede a área inteira de edição (campo e ações), sem depender de adjustResize no Android.
  function mostrarEditor() {
    requestAnimationFrame(() => {
      const limite = topoTeclado.current;
      if (limite === null) return;
      editor.current?.measureInWindow((_x, y, _largura, altura) => {
        const excesso = y + altura + esp[4] - limite;
        if (excesso > 0) rolagem.current?.scrollTo({ y: deslocamento.current + excesso, animated: false });
      });
    });
  }

  useEffect(() => {
    const abrir = Keyboard.addListener('keyboardDidShow', (evento) => {
      topoTeclado.current = evento.endCoordinates.screenY;
      setAlturaTeclado(evento.endCoordinates.height);
      mostrarEditor();
    });
    const fechar = Keyboard.addListener('keyboardDidHide', () => {
      topoTeclado.current = null;
      setAlturaTeclado(0);
    });
    return () => { abrir.remove(); fechar.remove(); };
  }, []);

  useEffect(() => {
    if (!apagado) return;
    const prazo = setTimeout(() => setApagado(null), 5000);
    return () => clearTimeout(prazo);
  }, [apagado]);

  function editar(local: LocalSalvo) {
    if (trava.current) return;
    setNome(local.nome);
    setErroNome('');
    setErro('');
    setEditando(local.id);
  }

  function fecharEditor() {
    setEditando(null);
    setErroNome('');
    Keyboard.dismiss();
  }

  async function salvarNome() {
    if (!editando || trava.current) return;
    const limpo = normalizarNome(nome);
    if (!limpo) { setErroNome(c.nomeVazio); return; }
    trava.current = true;
    setOcupado(true);
    setErro('');
    try {
      await renomear(editando, limpo);
      fecharEditor();
      AccessibilityInfo.announceForAccessibility(c.nomeAtualizado);
    } catch {
      setErro(c.erroAlterar);
    } finally { trava.current = false; setOcupado(false); }
  }

  async function apagarLugar(local: LocalSalvo, posicao: number) {
    if (trava.current) return;
    trava.current = true;
    setOcupado(true);
    setErro('');
    if (editando === local.id) fecharEditor();
    try {
      await apagar(local.id);
      setApagado({ local, posicao });
      AccessibilityInfo.announceForAccessibility(c.lugarApagado);
    } catch { setErro(c.erroAlterar); }
    finally { trava.current = false; setOcupado(false); }
  }

  async function desfazer() {
    if (!apagado || trava.current) return;
    trava.current = true;
    setOcupado(true);
    setErro('');
    try {
      const resultado = await restaurar(apagado.local, apagado.posicao);
      if (resultado !== 'ok') { setErro(c.erroAlterar); return; }
      setApagado(null);
      AccessibilityInfo.announceForAccessibility(c.lugarRestaurado);
    } catch { setErro(c.erroAlterar); }
    finally { trava.current = false; setOcupado(false); }
  }

  async function sair() {
    if (saindo) return;
    setSaindo(true);
    try {
      if (sessao && 'encerrarSessaoRemota' in servicos.conta && typeof servicos.conta.encerrarSessaoRemota === 'function') {
        try {
          await servicos.conta.encerrarSessaoRemota(sessao.token);
        } catch {
          // A saída local precisa acontecer mesmo se a remota falhar.
        }
      }
      await encerrarSessao();
      router.replace('/entrar');
    } finally {
      setSaindo(false);
    }
  }

  return (
    <Tela rolagem={false}>
      <ScrollView
        ref={rolagem}
        style={estilos.rolagem}
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        onScroll={(evento) => { deslocamento.current = evento.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={16}
        onContentSizeChange={mostrarEditor}
      >
        <Stack.Screen options={{ title: textos.config.titulo }} />
        <View accessible accessibilityLabel={[textos.config.conta, sessao?.email].filter(Boolean).join('. ')} style={estilos.perfil}>
          <ImagemPlaceholder nome="avatarPerfil" icone="account-outline" escurecer={false} style={estilos.avatar} />
          <View style={estilos.perfilTextos}>
            <Texto variante="rotulo" cor="texto2">{textos.config.conta}</Texto>
            <Texto variante="destaque" numberOfLines={1}>{sessao?.email ?? textos.config.conta}</Texto>
          </View>
        </View>
        <GrupoLinhas titulo={m.lugaresSecao}>
          {locais.length ? locais.map((l, i) => (
            <View key={l.id}>
              <LinhaGrupo
                icone={infoTipo[l.tipo].icone}
                titulo={l.nome}
                detalhe={l.endereco || (l.nome === infoTipo[l.tipo].rotulo ? undefined : infoTipo[l.tipo].rotulo)}
                rotuloAcessibilidade={c.renomear(l.nome)}
                onPress={() => editar(l)}
                acao={{ icone: 'trash-can-outline', rotulo: m.apagarLugar(l.nome), onPress: () => { void apagarLugar(l, i); } }}
                ultima={i === locais.length - 1}
              />
              {editando === l.id ? (
                <View ref={editor} collapsable={false} onLayout={mostrarEditor} style={estilos.editor}>
                  <CampoTexto
                    rotulo={c.nomeLugar}
                    value={nome}
                    onChangeText={(valor) => { setNome(valor.slice(0, MAX_NOME)); setErroNome(''); }}
                    maxLength={MAX_NOME}
                    autoFocus
                    onFocus={mostrarEditor}
                    erro={erroNome}
                    desabilitado={ocupado}
                    returnKeyType="done"
                    onSubmitEditing={() => { void salvarNome(); }}
                  />
                  <Texto variante="apoio" cor="texto2" numberOfLines={2}>{l.endereco || c.enderecoNaoSalvo}</Texto>
                  <Botao rotulo={c.salvar} desabilitado={ocupado} onPress={() => { void salvarNome(); }} />
                  <Botao rotulo={c.cancelar} variante="texto" desabilitado={ocupado} onPress={fecharEditor} />
                </View>
              ) : null}
            </View>
          )) : <LinhaGrupo icone="bookmark-outline" titulo={m.lugaresSecaoVazia} ultima />}
        </GrupoLinhas>
        {apagado ? (
          <View style={estilos.aviso}>
            <Texto accessibilityLiveRegion="polite">{c.lugarApagado}</Texto>
            <Botao rotulo={c.desfazer} variante="texto" desabilitado={ocupado} onPress={() => { void desfazer(); }} />
          </View>
        ) : null}
        {erro ? <Aviso texto={erro} variante="erro" /> : null}
        <Texto variante="apoio" cor="texto2">{m.noAparelho}</Texto>
        <GrupoLinhas titulo={r.selo}>
          <LinhaGrupo icone="calendar-clock-outline" titulo={r.entradaConfig} detalhe={r.entradaConfigDetalhe} onPress={() => router.push('/rotina')} ultima />
        </GrupoLinhas>
        <GrupoLinhas titulo={textos.config.privacidade}>
          <LinhaGrupo icone="shield-lock-outline" titulo={textos.aviso.titulo} onPress={() => router.push('/aviso-privacidade')} ultima />
        </GrupoLinhas>
        <Botao
          rotulo={textos.config.sair}
          variante="secundario"
          carregando={saindo}
          rotuloCarregando={h.saindo}
          anuncioCarregando={textos.comuns.carregando}
          onPress={() => { void sair(); }}
        />
        {Platform.OS === 'android' && alturaTeclado > 0 ? <View testID="espaco-teclado" style={{ height: alturaTeclado }} /> : null}
      </ScrollView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  rolagem: { flex: 1, margin: -esp[4] },
  conteudo: { padding: esp[4], gap: esp[4] },
  editor: { padding: esp[3], gap: esp[2] },
  aviso: { gap: esp[2] },
  perfil: { flexDirection: 'row', alignItems: 'center', gap: esp[4] },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  perfilTextos: { flex: 1 },
});
