import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { Botao } from '@/components/Botao';
import { esp } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';
import type { Rota } from '@/services';
import { seguir } from '@/textos/seguir';

import type { Coordenada } from './polyline';
import { trechosDaRota } from './trechosMapa';

export type PropsMapaSeguir = {
  rota: Rota;
  /** Trecho em andamento: os anteriores ficam com traço discreto, o atual e os seguintes em destaque. */
  indiceTrecho: number;
  posicao: Coordenada | null;
};

/**
 * Mapa da tela "Seguir rota". Enquanto a câmera estiver em modo "seguindo", acompanha a posição do usuário;
 * ao arrastar o mapa, sai desse modo e aparece "Recentrar".
 */
export default function MapaSeguir({ rota, indiceTrecho, posicao }: PropsMapaSeguir) {
  const { cores } = useTema();
  const mapa = useRef<MapView>(null);
  const [seguindo, setSeguindo] = useState(true);
  const trechos = useMemo(() => trechosDaRota(rota), [rota]);
  const todosOsPontos = useMemo(() => trechos.flatMap((t) => t.pontos), [trechos]);
  const destino = todosOsPontos.at(-1);

  const ajustarAoTrajeto = () => {
    if (todosOsPontos.length > 1) {
      mapa.current?.fitToCoordinates(todosOsPontos, { edgePadding: { top: 96, right: 48, bottom: 240, left: 48 }, animated: false });
    }
  };

  useEffect(() => {
    if (!posicao || !seguindo) return;
    mapa.current?.animateToRegion({ ...posicao, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 400);
  }, [posicao, seguindo]);

  return (
    <View style={StyleSheet.absoluteFill} accessibilityLabel={seguir.mapaRotulo}>
      <MapView
        ref={mapa}
        testID="mapa-seguir"
        style={StyleSheet.absoluteFill}
        onMapReady={ajustarAoTrajeto}
        onPanDrag={() => setSeguindo(false)}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {trechos.map((trecho, i) => (
          <Polyline
            key={trecho.id}
            testID={i < indiceTrecho ? 'trecho-percorrido' : 'trecho-restante'}
            coordinates={trecho.pontos}
            strokeColor={i < indiceTrecho ? cores.rotaOutra : cores.rotaSelecionada}
            strokeWidth={i < indiceTrecho ? 4 : 7}
            lineDashPattern={trecho.aPe ? [2, 8] : undefined}
            lineCap="round"
          />
        ))}
        {destino && <Marker testID="marcador-destino" coordinate={destino} title={seguir.marcadorDestino} />}
        {posicao && <Marker testID="marcador-posicao" coordinate={posicao} title={seguir.marcadorPosicao} accessibilityLabel={seguir.marcadorPosicao} />}
      </MapView>
      {!seguindo && (
        <View style={estilos.recentrar}>
          <Botao variante="secundario" rotulo={seguir.recentrar} onPress={() => setSeguindo(true)} testID="botao-recentrar" />
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  recentrar: { position: 'absolute', right: esp[4], left: esp[4], bottom: 200 },
});
