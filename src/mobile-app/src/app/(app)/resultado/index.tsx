import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { formatarHora } from '@/components/resultado/formatos';
import { Redirect, Stack, router } from 'expo-router';
import { Texto } from '@/components';
import { MapaResultado } from '@/components/mapa';
import { CartaoInsuficiente, PainelResultado, soRoteamento, textoCaso, type RotulosResultado } from '@/components/resultado';
import { useConsulta } from '@/consulta';
import type { FocoRota, ModoTrecho, Rota, Trecho } from '@/services';
import { textos } from '@/textos';
import { hipotesesResultado, hipotesesEstadosResultado } from '@/textos/hipotesesResultado';
import { esp } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

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

const linha = (trecho: Trecho) => trecho.linha ?? modos[trecho.modo];
const rotulos: RotulosResultado = {
  focos, modos, duracao, caminhada, trocas: textos.resultado.trocas,
  saida: (data) => textos.resultado.saidaPrevista(formatarHora(data)),
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
  const { cores } = useTema();
  const { estado, resposta, rotaSelecionadaId, selecionarRota } = useConsulta();
  const { height } = useWindowDimensions();
  const [alturaTela, setAlturaTela] = useState(height);
  // Item 6 (T25-B): a folha abre no nível médio (cartões visíveis sem arrastar); os níveis seguem o ciclo do alça.
  const [nivel, setNivel] = useState(1);
  const alturaFolha = Math.round(alturaTela * [0.45, 0.68, 0.90][nivel]);
  if (!resposta) return <Redirect href="/planejar" />;
  const selecionada = resposta.rotas.find(r => r.id === rotaSelecionadaId) ?? resposta.rotas[0];
  const tituloLista = resposta.rotas.length === 0 ? hipotesesEstadosResultado.semAlternativas : hipotesesResultado.opcoes(resposta.rotas.length);
  const nomeSentido = estado.consulta.sentido === 'volta' ? textos.resultado.cabecalhoVolta : textos.resultado.cabecalhoIda;
  const selecionar = (rota: Rota) => {
    selecionarRota(rota.id);
  };
  const abrirDetalhes = (rota: Rota) => {
    router.push({ pathname: '/resultado/[rotaId]', params: { rotaId: rota.id } });
  };
  return <View style={[estilos.tela, { backgroundColor: cores.fundo }]} onLayout={evento => {
    const medida = evento.nativeEvent.layout.height;
    if (medida > 0) setAlturaTela(medida);
  }}>
    <Stack.Screen options={{ title: nomeSentido }} />
    {selecionada && <MapaResultado rotas={resposta.rotas} rotaSelecionadaId={selecionada.id} onSelecionar={selecionarRota} expandido={nivel > 0} alturaFolha={alturaFolha} exemplo={resposta.fontes.roteamento === 'exemplo'} />}
    <PainelResultado resposta={resposta} rotaSelecionadaId={selecionada?.id ?? ''} rotulos={rotulos}
      tituloLista={tituloLista} expandido={nivel > 0} alturaFolha={alturaFolha} nivel={nivel}
      saida={hipotesesResultado.saida(formatarHora(estado.consulta.saida))}
      rotuloExpandir={nivel === 2 ? hipotesesEstadosResultado.recolher : textos.resultado.expandir}
      onExpandir={() => setNivel(v => (v + 1) % 3)} onRecolher={() => setNivel(v => Math.max(0, v - 1))}
      onSelecionar={selecionar}
      onAbrirDetalhes={abrirDetalhes}
      rodapeLista={<View style={estilos.intro}>
        <Texto variante="apoio">{textos.comuns.horariosPrevistos}</Texto>
      </View>}
      linhaDados={{
        // Item 6: link de uma linha para a explicação dos dados (a fonte e o período ficam em "Sobre os dados").
        texto: soRoteamento(resposta) ? (resposta.rotas.length > 0 ? textos.soRoteamento.linhaDados : textos.comuns.linhaDadosIndisponivel) : textos.resultado.linkDados,
        rotuloAcessivel: textos.sobre.titulo,
        indisponivel: soRoteamento(resposta),
        onPress: () => router.push('/sobre-os-dados'),
      }}>
      <View style={estilos.intro}>
        {resposta.rotas.length === 1 && <Texto>{textos.resultado.soUma}</Texto>}
        {/* Mockup 04: caso insuficiente vira cartão com as duas ações; os demais casos seguem como texto. */}
        {resposta.caso === 'INSUFICIENTE' && textoCaso(resposta) ? <CartaoInsuficiente
          titulo={hipotesesEstadosResultado.cartaoInsuficiente.titulo}
          texto={textoCaso(resposta) ?? ''}
          rotuloEntender={hipotesesEstadosResultado.cartaoInsuficiente.entender}
          rotuloOutroHorario={hipotesesEstadosResultado.cartaoInsuficiente.outroHorario}
          onEntender={() => router.push('/sobre-os-dados')}
          onOutroHorario={() => router.push('/planejar')} />
          : textoCaso(resposta) && <Texto testID="texto-caso">{textoCaso(resposta)}</Texto>}
        {resposta.rotas.length === 0 && <Texto>{resposta.caso === 'INDISPONIVEL' ? hipotesesEstadosResultado.comparacaoIndisponivel : hipotesesEstadosResultado.semServico}</Texto>}
      </View>
    </PainelResultado>
  </View>;
}
const estilos = StyleSheet.create({ tela: { flex: 1 }, intro: { paddingHorizontal: esp[4], gap: esp[2], paddingBottom: esp[2] } });
