import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { Aviso, Botao, Carregando, SeloExemplo, Tela, Texto } from '@/components';
import MapaTrajeto from '@/components/compartilhamento/MapaTrajeto';
import { formatarHora } from '@/components/resultado/formatos';
import { ambiente } from '@/config/ambiente';
import { ehErroServico, servicoCompartilhamento } from '@/services';
import type { VisaoAcompanhamento } from '@/services';
import { textos } from '@/textos';
import { hipotesesCompartilhar as h } from '@/textos/hipotesesCompartilhar';
import { esp } from '@/theme/tokens';

const t = textos.acompanhar;
/** Consulta periódica a cada 30 s (FN-16, PL-21 [HIPÓTESE]). */
const INTERVALO_MS = 30_000;

type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'erro' }
  | { tipo: 'ok'; visao: VisaoAcompanhamento; semRede: boolean };

const rotuloModo: Record<string, string> = {
  A_PE: textos.modos.modo.aPe,
  ONIBUS: textos.modos.modo.onibus,
  METRO: textos.modos.modo.metro,
  TREM: textos.modos.modo.trem,
};

/** TL-15 · Acompanhar viagem (Depende do tempo, D-22). Aberta pelo link; a guarda de sessão fica na raiz (PL-23). */
export default function Acompanhar() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });
  const [agora, setAgora] = useState(() => Date.now());

  const carregar = useCallback(async () => {
    if (!token) return;
    try {
      const visao = await servicoCompartilhamento.acompanhar(token);
      setEstado({ tipo: 'ok', visao, semRede: false });
    } catch (e) {
      // Sem rede: mantém a última informação com o horário dela (TL-15, "sem rede").
      if (ehErroServico(e) && e.tipo === 'SEM_REDE') {
        setEstado((atual) => (atual.tipo === 'ok' ? { ...atual, semRede: true } : { tipo: 'erro' }));
      } else {
        setEstado({ tipo: 'erro' });
      }
    }
    setAgora(Date.now());
  }, [token]);

  const visao = estado.tipo === 'ok' ? estado.visao : null;
  const emAndamento = visao?.estado === 'ATIVO';

  useEffect(() => {
    // primeira consulta ao abrir o link; as seguintes vêm do intervalo abaixo
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregar();
  }, [carregar]);

  // Só continua consultando enquanto a viagem está em andamento; depois do fim nada mais é pedido.
  useEffect(() => {
    if (estado.tipo === 'ok' && !emAndamento) return;
    const id = setInterval(() => void carregar(), INTERVALO_MS);
    return () => clearInterval(id);
  }, [carregar, estado.tipo, emAndamento]);

  return (
    <Tela>
      <Texto variante="titulo" accessibilityRole="header">{t.titulo}</Texto>
      {ambiente.modoApi === 'mock' && <Aviso simbolo="ⓘ" texto={h.prototipoAcompanhar} />}
      {estado.tipo === 'carregando' && <Carregando variante="linha" texto={h.carregandoViagem} />}
      {estado.tipo === 'erro' && (
        <Aviso
          variante="erro"
          simbolo="⚠"
          texto={h.naoFoiPossivel}
          acao={{ rotulo: textos.comuns.tentarDeNovo, onPress: () => void carregar() }}
        />
      )}
      {estado.tipo === 'ok' && <Corpo visao={estado.visao} semRede={estado.semRede} agora={agora} />}
      <Botao variante="texto" rotulo={textos.comuns.voltar} onPress={() => (router.canGoBack() ? router.back() : router.replace('/planejar'))} />
    </Tela>
  );
}

function Corpo({ visao, semRede, agora }: { visao: VisaoAcompanhamento; semRede: boolean; agora: number }) {
  if (visao.estado === 'EXPIRADO') return <Texto accessibilityLiveRegion="polite">{t.terminou}</Texto>;

  if (visao.estado === 'CHEGOU') {
    return (
      <Texto accessibilityLiveRegion="polite">
        {visao.encerradoEm ? `✓ ${t.chegou(formatarHora(visao.encerradoEm))}` : `✓ ${t.encerrado}`}
      </Texto>
    );
  }
  if (visao.estado === 'ENCERRADO') return <Texto accessibilityLiveRegion="polite">{t.encerrado}</Texto>;

  const trajeto = visao.trajeto;
  const posicao = visao.aoVivo ? visao.posicao : null;
  const minutos = posicao ? Math.max(0, Math.floor((agora - Date.parse(posicao.em)) / 60_000)) : 0;
  const trechos = trajeto?.trechos.map((x) => (x.linha ? `${rotuloModo[x.modo]} ${x.linha}` : rotuloModo[x.modo])).join(' → ');

  return (
    <View style={{ gap: esp[3] }}>
      {trajeto && (
        <MapaTrajeto
          geometria={trajeto.geometria}
          posicao={posicao}
          rotuloPosicao={textos.compartilhar.indicador}
          rotuloMapa={posicao ? t.atualizacao({ hora: formatarHora(posicao.em), min: minutos }) : t.emAndamento}
        />
      )}
      <View style={{ flexDirection: 'row', gap: esp[2], alignItems: 'center' }}>
        <Texto variante="corpoForte" accessibilityLiveRegion="polite">{t.emAndamento}</Texto>
        <SeloExemplo />
      </View>
      {trajeto && <Texto>{t.chegada(formatarHora(trajeto.chegadaPrevista))}</Texto>}
      {!visao.aoVivo && <Aviso simbolo="ⓘ" texto={t.soTrajeto} />}
      {visao.aoVivo && (posicao
        ? <Texto>{t.atualizacao({ hora: formatarHora(posicao.em), min: minutos })}</Texto>
        : <Texto cor="texto2">{h.ultimaSemHora}</Texto>)}
      {semRede && <Aviso simbolo="ⓘ" texto={h.semConexao} />}
      {trechos ? (
        <View style={{ gap: esp[1] }}>
          <Texto variante="corpoForte">{h.trajeto}</Texto>
          <Texto>{trechos}</Texto>
          <Texto cor="texto2">{textos.comuns.horariosPrevistos}</Texto>
        </View>
      ) : null}
    </View>
  );
}
