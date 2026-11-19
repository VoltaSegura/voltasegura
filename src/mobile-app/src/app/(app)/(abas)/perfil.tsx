import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Botao, GrupoLinhas, ImagemPlaceholder, LinhaGrupo, Segmentado, Tela, Texto } from '@/components';
import { useAssinatura, dataCurta, fimDoTeste } from '@/plus';
import { servicos } from '@/services';
import { useSessao } from '@/sessao/SessaoContext';
import { abas } from '@/textos/abas';
import { textos } from '@/textos';
import { rotina as r } from '@/textos/rotina';
import { hipotesesDetalhes as h } from '@/textos/hipotesesDetalhes';
import { useModoTema, type ModoTema } from '@/theme/ModoTemaProvider';
import { esp } from '@/theme/tokens';

/**
 * Aba Perfil (TL-12 reescrita; itens 1, 3, 5 e 12 do T25-B). Conta, status do VoltaSegura+,
 * atalho para a rotina, tema claro/escuro, privacidade e sair. Substitui a antiga tela de Configurações.
 */
export default function Perfil() {
  const { sessao, encerrarSessao } = useSessao();
  const { assinante, plano, inicio } = useAssinatura();
  const { modo, definirModo } = useModoTema();
  const t = abas.perfil;
  const [saindo, setSaindo] = useState(false);

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

  const statusPlus = assinante && inicio
    ? t.assinante(dataCurta(fimDoTeste(inicio)), plano === 'anual')
    : t.planoGratuito;

  return (
    <Tela rolagem={false} abas>
      <ScrollView style={estilos.rolagem} contentContainerStyle={estilos.conteudo}>
        <Texto variante="titulo" accessibilityRole="header">{t.titulo}</Texto>
        <View accessible accessibilityLabel={[textos.config.conta, sessao?.email].filter(Boolean).join('. ')} style={estilos.perfil}>
          <ImagemPlaceholder nome="avatarPerfil" icone="account-outline" escurecer={false} style={estilos.avatar} />
          <View style={estilos.perfilTextos}>
            <Texto variante="rotulo" cor="texto2">{textos.config.conta}</Texto>
            <Texto variante="destaque" numberOfLines={1}>{sessao?.email ?? textos.config.conta}</Texto>
          </View>
        </View>

        <GrupoLinhas titulo={t.plusSecao}>
          <LinhaGrupo icone="star-outline" titulo={textos.plus.titulo} detalhe={statusPlus} onPress={() => router.push('/plus')} testID="perfil-plus" ultima />
        </GrupoLinhas>

        <GrupoLinhas titulo={r.selo}>
          <LinhaGrupo icone="calendar-clock-outline" titulo={r.entradaConfig} detalhe={r.entradaConfigDetalhe} onPress={() => router.push('/rotina')} testID="perfil-rotina" ultima />
        </GrupoLinhas>

        <Segmentado
          rotuloGrupo={t.temaTitulo}
          opcoes={[
            { valor: 'sistema', rotulo: t.temaSistema },
            { valor: 'claro', rotulo: t.temaClaro },
            { valor: 'escuro', rotulo: t.temaEscuro },
          ]}
          valor={modo}
          onChange={(valor) => { void definirModo(valor as ModoTema); }}
          testID="perfil-tema"
        />

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
      </ScrollView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  rolagem: { flex: 1, margin: -esp[4] },
  conteudo: { padding: esp[4], gap: esp[4] },
  perfil: { flexDirection: 'row', alignItems: 'center', gap: esp[4] },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  perfilTextos: { flex: 1 },
});
