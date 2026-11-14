import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect, Stack, router } from 'expo-router';
import { Botao, Texto } from '@/components';
import { MapaResultado } from '@/components/mapa';
import { PainelResultado, formatarPeriodo, type RotulosResultado } from '@/components/resultado';
import { useConsulta } from '@/consulta';
import type { FocoRota, ModoTrecho, Rota, Trecho } from '@/services';
import { textos } from '@/textos';
import { hipotesesEstadosResultado } from '@/textos/hipotesesResultado';
import { esp } from '@/theme/tokens';

const focos: Record<FocoRota, string> = {
  MENOR_TEMPO: textos.modos.foco.menorTempo,
  MENOS_CAMINHADA: textos.modos.foco.menosCaminhada,
  MENOR_EXPOSICAO: textos.modos.foco.menorExposicao,
  OUTRA_OPCAO: textos.modos.foco.outraOpcao,
};
const modos: Record<ModoTrecho, string> = {
  A_PE: textos.modos.modo.aPe, ONIBUS: textos.modos.modo.onibus,
  METRO: textos.modos.modo.metro, TREM: textos.modos.modo.trem,
};
const duracao = (min: number) => min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`;
const distancia = (km: number) => km < 1 ? `${Math.round(km * 1000 / 10) * 10} m` : `${km.toFixed(1).replace('.', ',')} km`;
const caminhada = (km: number) => textos.resultado.kmAPe(distancia(km));
const hora = (data: string) => data.slice(11, 16);
const linha = (trecho: Trecho) => trecho.linha ?? modos[trecho.modo];
const rotulos: RotulosResultado = {
  focos, modos, duracao, caminhada, trocas: textos.resultado.trocas,
  saida: (data) => textos.resultado.saidaPrevista(hora(data)),
  trechoAPe: (min) => `${modos.A_PE} ${duracao(min)}`, linha,
  card: (rota, indice, total, sequencia) => textos.resultado.rotuloCard({
    i: indice, n: total, focos: rota.focos.map(f => focos[f]).join(', '),
    duracao: duracao(rota.duracaoMin), km: distancia(rota.caminhadaKm),
    trocas: textos.resultado.trocas(rota.trocas), modos: sequencia,
  }),
  selecionada: textos.resultado.selecionada,
  dadosInsuficientes: textos.dadosConsiderados.insuficiente,
};
export default function Resultado() {
  const { estado, resposta, rotaSelecionadaId, selecionarRota, planejarVolta, inverterPontos, definirSentido } = useConsulta();
  const [expandido, setExpandido] = useState(false);
  if (!resposta) return <Redirect href="/planejar" />;
  const selecionada = resposta.rotas.find(r => r.id === rotaSelecionadaId) ?? resposta.rotas[0];
  const exposicaoPrimeiro = resposta.caso === 'CONCLUSIVO' && resposta.rotas[0]?.focos.includes('MENOR_EXPOSICAO');
  const tituloLista = resposta.rotas.length === 0 ? hipotesesEstadosResultado.semAlternativas
    : resposta.rotas.length === 1 ? textos.comuns.umaOpcao
    : exposicaoPrimeiro ? textos.comuns.exposicaoPrimeiro(resposta.rotas.length)
      : textos.comuns.ordenadasPorTempo(resposta.rotas.length);
  const nomeSentido = estado.consulta.sentido === 'volta' ? textos.resultado.cabecalhoVolta : textos.resultado.cabecalhoIda;
  const selecionar = (rota: Rota) => {
    selecionarRota(rota.id);
  };
  const abrirDetalhes = (rota: Rota) => {
    router.push({ pathname: '/resultado/[rotaId]', params: { rotaId: rota.id } });
  };
  const proximoSentido = estado.consulta.sentido === 'ida' ? 'volta' : 'ida';
  return <View style={estilos.tela}>
    <Stack.Screen options={{ title: nomeSentido }} />
    {selecionada && <MapaResultado rotas={resposta.rotas} rotaSelecionadaId={selecionada.id} onSelecionar={selecionarRota} expandido={expandido} />}
    <PainelResultado resposta={resposta} rotaSelecionadaId={selecionada?.id ?? ''} rotulos={rotulos}
      tituloLista={tituloLista} expandido={expandido} rotuloExpandir={expandido ? hipotesesEstadosResultado.recolher : textos.resultado.expandir} onExpandir={() => setExpandido(v => !v)}
      onSelecionar={selecionar}
      onAbrirDetalhes={abrirDetalhes}
      linhaDados={{
        texto: resposta.caso === 'INDISPONIVEL' ? textos.comuns.linhaDadosIndisponivel : textos.comuns.linhaDados({
          fonte: resposta.sobreOsDados.fonte,
          periodo: formatarPeriodo(resposta.sobreOsDados.periodo.inicio, resposta.sobreOsDados.periodo.fim),
        }),
        rotuloAcessivel: textos.sobre.titulo,
        indisponivel: resposta.caso === 'INDISPONIVEL',
        onPress: () => router.push('/sobre-os-dados'),
      }}>
      <View style={estilos.intro}>
        <Texto variante="apoio">{textos.resultado.cabecalhoSubtitulo(hora(estado.consulta.saida))}</Texto>
        {resposta.rotas.length === 1 && <Texto>{textos.resultado.soUma}</Texto>}
        {resposta.rotas.length === 0 && <Texto>{resposta.caso === 'INDISPONIVEL' ? hipotesesEstadosResultado.comparacaoIndisponivel : hipotesesEstadosResultado.semServico}</Texto>}
        <Texto variante="apoio">{textos.comuns.horariosPrevistos}</Texto>
        <Botao variante="secundario" rotulo={estado.consulta.sentido === 'volta' ? textos.resultado.planejarIda : textos.resultado.planejarVolta}
          onPress={() => { if (proximoSentido === 'volta') planejarVolta(); else { inverterPontos(); definirSentido('ida'); } router.push(`/planejar?sentido=${proximoSentido}`); }} />
      </View>
    </PainelResultado>
  </View>;
}
const estilos = StyleSheet.create({ tela: { flex: 1 }, intro: { paddingHorizontal: esp[4], gap: esp[2], paddingBottom: esp[2] } });
