import { useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { Stack, router } from 'expo-router';

import { Botao, GrupoLinhas, LinhaGrupo, Tela, Texto } from '@/components';
import { infoTipo } from '@/components/planejar';
import { useLocais } from '@/locais';
import { servicos } from '@/services';
import { useSessao } from '@/sessao/SessaoContext';
import { textos } from '@/textos';
import { hipotesesDetalhes as h } from '@/textos/hipotesesDetalhes';
import { hipotesesMapa as m } from '@/textos/hipotesesMapa';

export default function Configuracoes() {
  const { sessao, encerrarSessao } = useSessao();
  const { locais, apagar } = useLocais();
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

  return (
    <Tela>
      <Stack.Screen options={{ title: textos.config.titulo }} />
      <GrupoLinhas titulo={textos.config.conta}>
        <LinhaGrupo icone="account-circle-outline" titulo={sessao?.email ?? textos.config.conta} ultima />
      </GrupoLinhas>
      <GrupoLinhas titulo={m.lugaresSecao}>
        {locais.length ? locais.map((l, i) => (
          <LinhaGrupo
            key={l.id}
            icone={infoTipo[l.tipo].icone}
            titulo={l.nome}
            detalhe={infoTipo[l.tipo].rotulo}
            acao={{ icone: 'trash-can-outline', rotulo: m.apagarLugar(l.nome), onPress: () => { void apagar(l.id); AccessibilityInfo.announceForAccessibility(m.lugarApagado); } }}
            ultima={i === locais.length - 1}
          />
        )) : <LinhaGrupo icone="bookmark-outline" titulo={m.lugaresSecaoVazia} ultima />}
      </GrupoLinhas>
      <Texto variante="apoio" cor="texto2">{m.noAparelho}</Texto>
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
    </Tela>
  );
}
