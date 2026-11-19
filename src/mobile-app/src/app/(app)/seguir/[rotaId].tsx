import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aviso, Botao, Icone, Tela, Texto } from '@/components';
import { MapaSeguir } from '@/components/mapa';
import { formatarHora } from '@/components/resultado/formatos';
import { useConsulta } from '@/consulta';
import { gravarIntroOculta, lerIntroOculta } from '@/seguir/armazenamento';
import { useSeguirRota } from '@/seguir/useSeguirRota';
import type { Rota } from '@/services';
import { distanciaParaTexto, instrucaoDoTrecho } from '@/services/seguirRota';
import { esp, raio } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';
import { seguir } from '@/textos/seguir';
import { textos } from '@/textos';

/** Tela TL-18: acompanha a posição no trajeto da rota escolhida. */
export default function SeguirRotaTela() {
  const { rotaId } = useLocalSearchParams<{ rotaId?: string }>();
  const { resposta } = useConsulta();
  // A rota é fixada na abertura: o recálculo troca a resposta (e o id da rota) sem a tela sair do trajeto.
  const [aberta] = useState<Rota | null>(() => resposta?.rotas.find((item) => item.id === rotaId) ?? null);
  if (!aberta) return <Redirect href="/planejar" />;
  return <Acompanhamento rota={aberta} />;
}

function Acompanhamento({ rota: rotaAberta }: { rota: Rota }) {
  const { rota, status, avaliacao, posicao, recalculo, comecar, encerrar, tentarRecalculo } = useSeguirRota(rotaAberta);
  const titulo = <Stack.Screen options={{ title: seguir.titulo }} />;
  // null enquanto a preferência não foi lida: não mostra o aviso antes de saber se ele deve sumir.
  const [introOculta, setIntroOculta] = useState<boolean | null>(null);
  const [naoMostrarDeNovo, setNaoMostrarDeNovo] = useState(false);
  useEffect(() => { void lerIntroOculta().then(setIntroOculta); }, []);

  if (status === 'semTrajeto') {
    return <Tela>
      {titulo}
      <Aviso texto={seguir.semTrajeto} />
    </Tela>;
  }

  if (status === 'pronto' || status === 'pedindoPermissao' || status === 'semPermissao' || status === 'erro') {
    const tentar = status === 'semPermissao' || status === 'erro';
    const iniciar = () => {
      if (naoMostrarDeNovo) void gravarIntroOculta(true);
      void comecar();
    };
    return <Tela rodape={<Botao rotulo={tentar ? seguir.tentarDeNovo : seguir.comecar} onPress={iniciar}
      carregando={status === 'pedindoPermissao'} testID="botao-comecar-seguir" />}>
      {titulo}
      {introOculta === false && (
        <>
          <Texto>{seguir.intro}</Texto>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: naoMostrarDeNovo }}
            accessibilityLabel={seguir.entendiNaoMostrar} testID="checkbox-nao-mostrar-intro"
            onPress={() => setNaoMostrarDeNovo((valor) => !valor)} style={estilos.caixa}>
            <Icone nome={naoMostrarDeNovo ? 'checkbox-marked' : 'checkbox-blank-outline'} tamanho={24} />
            <Texto>{seguir.entendiNaoMostrar}</Texto>
          </Pressable>
        </>
      )}
      <Texto cor="texto2">{seguir.sobreLocalizacao}</Texto>
      {status === 'semPermissao' && <Aviso variante="erro" texto={seguir.semPermissao} testID="aviso-sem-permissao" />}
      {status === 'erro' && <Aviso variante="erro" texto={seguir.erroGps} testID="aviso-erro-gps" />}
    </Tela>;
  }

  return <MapaAcompanhando rota={rota} status={status} avaliacao={avaliacao} posicao={posicao} encerrar={encerrar}
    recalculo={recalculo} tentarRecalculo={tentarRecalculo} />;
}

type PropsAcompanhando = Pick<ReturnType<typeof useSeguirRota>, 'status' | 'avaliacao' | 'posicao' | 'encerrar' | 'recalculo' | 'tentarRecalculo'> & { rota: Rota };

function MapaAcompanhando({ rota, status, avaliacao, posicao, encerrar, recalculo, tentarRecalculo }: PropsAcompanhando) {
  const { cores } = useTema();
  const insets = useSafeAreaInsets();
  const finalizado = status === 'chegou' || status === 'encerrado';
  const instrucao = avaliacao ? instrucaoDoTrecho(avaliacao) : null;
  const restante = avaliacao && !finalizado ? seguir.restante(distanciaParaTexto(avaliacao.restanteM), avaliacao.restanteMin) : null;
  const chegada = rota.chegadaPrevista ? seguir.chegadaPrevista(formatarHora(rota.chegadaPrevista)) : null;

  return <View style={estilos.tela}>
    <MapaSeguir rota={rota} indiceTrecho={avaliacao?.estado.indice ?? 0} posicao={posicao} />

    <View style={[estilos.topo, { top: insets.top + esp[2] }]} pointerEvents="box-none">
      {avaliacao?.foraDoTrajeto && recalculo === 'falhou' ? (
        <Aviso variante="erro" texto={seguir.recalculoFalhou} testID="aviso-recalculo-falhou"
          acao={{ rotulo: seguir.tentarDeNovo, onPress: () => { void tentarRecalculo(); } }} />
      ) : avaliacao?.foraDoTrajeto ? (
        <Aviso texto={seguir.foraDoTrajeto} testID="aviso-fora-do-trajeto" />
      ) : (
        <View style={[estilos.cartao, { backgroundColor: cores.superficie, borderColor: cores.borda }]}>
          <Texto variante="rotulo" cor="texto2">{seguir.proximoPasso}</Texto>
          <Texto variante="destaque" accessibilityLiveRegion="polite" testID="instrucao-atual">
            {instrucao ?? seguir.buscandoGps}
          </Texto>
        </View>
      )}
      {status === 'seguindo' && <Texto variante="rotulo" cor="texto2" style={estilos.indicador}>{seguir.indicadorAtivo}</Texto>}
    </View>

    <View style={[estilos.base, { bottom: insets.bottom + esp[2] }]} pointerEvents="box-none">
      {status === 'chegou' && <Aviso texto={seguir.chegou} titulo={seguir.titulo} testID="aviso-chegou" />}
      {status === 'encerrado' && <Aviso texto={seguir.encerrado} testID="aviso-encerrado" />}
      {!finalizado && (
        <View style={[estilos.cartao, { backgroundColor: cores.superficie, borderColor: cores.borda }]}>
          {restante && <Texto variante="corpoForte" testID="restante">{restante}</Texto>}
          {chegada && <Texto variante="apoio" cor="texto2">{chegada}</Texto>}
          <Botao variante="secundario" rotulo={textos.compartilhar.botaoTl08} onPress={() => router.push(`/compartilhar/${rota.id}`)} testID="botao-compartilhar-seguir" />
          <Botao variante="secundario" rotulo={seguir.encerrar} onPress={encerrar} testID="botao-encerrar-seguir" />
        </View>
      )}
      {finalizado && <Botao rotulo={seguir.fechar} onPress={voltarParaHome} testID="botao-fechar-seguir" />}
    </View>
  </View>;
}

/** Ao encerrar, a pessoa volta direto para a home (Planejar), sem passar pelas telas do trajeto. */
function voltarParaHome() {
  router.dismissAll();
  router.replace('/planejar');
}

const estilos = StyleSheet.create({
  caixa: { flexDirection: 'row', alignItems: 'center', gap: esp[2], minHeight: 48 },
  tela: { flex: 1 },
  topo: { position: 'absolute', left: esp[4], right: esp[4], gap: esp[2] },
  base: { position: 'absolute', left: esp[4], right: esp[4], gap: esp[2] },
  cartao: { borderWidth: 1, borderRadius: raio.grande, padding: esp[4], gap: esp[2] },
  indicador: { alignSelf: 'center' },
});
