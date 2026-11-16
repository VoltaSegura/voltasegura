import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Share, View } from 'react-native';

import { Aviso, Botao, Link, SeloExemplo, Tela, Texto } from '@/components';
import { decodificarPolyline } from '@/components/mapa/polyline';
import { formatarHora } from '@/components/resultado/formatos';
import { chegadaParaSessao, fimMaximo, useCompartilhamento } from '@/compartilhamento';
import { useConsulta } from '@/consulta';
import type { Rota, SessaoCompartilhamento } from '@/services';
import { textos } from '@/textos';
import { hipotesesCompartilhar as h } from '@/textos/hipotesesCompartilhar';
import { esp } from '@/theme/tokens';

const t = textos.compartilhar;

/** Abre a folha de compartilhar do sistema com o link temporário (US-21 AC1). */
async function enviarLink(link: string): Promise<void> {
  try {
    await Share.share({ message: t.mensagemLink(link) });
  } catch {
    // a pessoa pode cancelar a folha; a sessão continua e o link pode ser enviado de novo
  }
}

/** Última coordenada da geometria: o destino usado no critério de chegada (PL-22). */
function destinoDa(rota: Rota): { lat: number; lon: number } {
  const pontos = decodificarPolyline(rota.geometria);
  const fim = pontos[pontos.length - 1];
  return fim ? { lat: fim.latitude, lon: fim.longitude } : { lat: 0, lon: 0 };
}

/** TL-14 · Compartilhar minha volta (Depende do tempo, D-22). Protótipo com serviço de exemplo. */
export default function Compartilhar() {
  const { rotaId } = useLocalSearchParams<{ rotaId: string }>();
  const { resposta } = useConsulta();
  const c = useCompartilhamento();
  const rota = resposta?.rotas.find((r) => r.id === rotaId);
  const estavaAtiva = useRef(false);

  useEffect(() => {
    if (c.fase === 'ativa') estavaAtiva.current = true;
    // Parar, chegada ou tempo máximo: volta à tela anterior, onde o aviso de encerramento aparece.
    if (c.fase === 'encerrada') {
      if (!estavaAtiva.current) {
        c.dispensarEncerrado(); // aviso antigo, de antes de abrir esta tela
        return;
      }
      estavaAtiva.current = false;
      if (router.canGoBack()) router.back();
      else router.replace('/planejar');
    }
  }, [c]);

  if (c.fase === 'ativa' && c.sessao) return <SessaoAtiva sessao={c.sessao} />;
  if (c.fase === 'encerrada') return null;
  if (!rota) return <Redirect href="/planejar" />;
  return <Confirmar rota={rota} />;
}

function Confirmar({ rota }: { rota: Rota }) {
  const c = useCompartilhamento();
  const [aoVivoEscolhido, setAoVivoEscolhido] = useState(true);
  const [agora] = useState(() => Date.now());
  const chegada = chegadaParaSessao(rota.chegadaPrevista, rota.duracaoMin, agora);
  const fim = fimMaximo(chegada);
  const iniciando = c.fase === 'iniciando';

  async function iniciar(aoVivo: boolean) {
    setAoVivoEscolhido(aoVivo);
    const sessao = await c.iniciar({
      rotaId: rota.id,
      aoVivo,
      trajeto: {
        geometria: rota.geometria,
        trechos: rota.trechos.map((x) => ({ modo: x.modo, linha: x.linha, partidaPrevista: x.partidaPrevista })),
        chegadaPrevista: chegada,
        destino: destinoDa(rota),
      },
    });
    if (sessao) await enviarLink(sessao.link);
  }

  return (
    <Tela>
      <Texto variante="titulo" accessibilityRole="header">{t.titulo}</Texto>
      <Aviso simbolo="ⓘ" texto={h.prototipo} />
      <Texto>{t.verao}</Texto>
      <View style={{ gap: esp[1] }}>
        <Texto>{`• ${t.itemTrajeto}`}</Texto>
        <Texto>{`• ${t.itemPosicao}`}</Texto>
        <Texto>{`• ${t.itemChegada(formatarHora(chegada))}`}</Texto>
      </View>
      <SeloExemplo />
      <Texto>{t.termina(formatarHora(fim))}</Texto>
      <Texto cor="texto2">{t.privacidade}</Texto>
      <Texto cor="texto2">{`${t.precisaApp} ${h.instalarOutro}`}</Texto>
      <Texto cor="texto2">{h.quemEspera}</Texto>
      <View style={{ gap: esp[1] }}>
        <Texto variante="corpoForte">{textos.aviso.compartilharTitulo}</Texto>
        <Texto cor="texto2">{textos.aviso.compartilhar}</Texto>
        <Link variante="dado" rotulo={textos.aviso.titulo} onPress={() => router.push('/aviso-privacidade')} />
      </View>
      {c.erro && (
        <Aviso
          variante="erro"
          simbolo="⚠"
          texto={t.erro}
          acao={{ rotulo: textos.comuns.tentarDeNovo, onPress: () => void iniciar(aoVivoEscolhido) }}
        />
      )}
      <Botao
        rotulo={t.confirmar}
        carregando={iniciando && aoVivoEscolhido}
        rotuloCarregando={t.iniciando}
        desabilitado={iniciando}
        onPress={() => void iniciar(true)}
        testID="compartilhar-confirmar"
      />
      <Botao
        variante="secundario"
        rotulo={t.soTrajeto}
        carregando={iniciando && !aoVivoEscolhido}
        rotuloCarregando={t.iniciando}
        desabilitado={iniciando}
        onPress={() => void iniciar(false)}
        accessibilityHint={h.verTrajetoSo}
        testID="compartilhar-so-trajeto"
      />
      <Botao variante="texto" rotulo={textos.comuns.cancelar} onPress={() => router.back()} />
    </Tela>
  );
}

function SessaoAtiva({ sessao }: { sessao: SessaoCompartilhamento }) {
  const c = useCompartilhamento();
  return (
    <Tela>
      <Texto variante="titulo" accessibilityRole="header">{h.tituloAtivo}</Texto>
      <Aviso simbolo="ⓘ" texto={h.prototipo} />
      <Texto variante="corpoForte">{`● ${t.ativoDesde(formatarHora(sessao.iniciadaEm))}`}</Texto>
      <Texto>{textos.acompanhar.chegada(formatarHora(sessao.trajeto.chegadaPrevista))}</Texto>
      <Texto>{t.termina(formatarHora(sessao.expiraEm))}</Texto>
      {sessao.aoVivo ? (
        <Texto>{sessao.posicao ? t.ultimaEnviada(formatarHora(sessao.posicao.em)) : h.semPosicao}</Texto>
      ) : (
        <Texto cor="texto2">{h.verTrajetoSo}</Texto>
      )}
      <SeloExemplo />
      <Texto cor="texto2">{h.quemEspera}</Texto>
      <Botao variante="secundario" rotulo={t.reenviar} onPress={() => void enviarLink(sessao.link)} />
      <Botao variante="secundario" rotulo={h.simularChegada} onPress={() => void c.simularChegada()} />
      <Botao variante="destrutivo" rotulo={t.pararCompleto} onPress={() => void c.parar()} testID="compartilhar-parar" />
    </Tela>
  );
}
