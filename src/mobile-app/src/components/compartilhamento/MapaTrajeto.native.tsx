import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { decodificarPolyline } from '@/components/mapa/polyline';
import { medidas } from '@/components/resultado/medidas';
import { useTema } from '@/theme/useTema';

export type PropsMapaTrajeto = {
  geometria: string;
  /** Última posição de quem compartilha (não é marcador de ocorrência). */
  posicao: { lat: number; lon: number } | null;
  rotuloPosicao: string;
  rotuloMapa: string;
};

/** Mapa do acompanhamento (TL-15): trajeto e, se houver, a última posição enviada. */
export default function MapaTrajeto({ geometria, posicao, rotuloPosicao, rotuloMapa }: PropsMapaTrajeto) {
  const { cores } = useTema();
  const mapa = useRef<MapView>(null);
  const pontos = useMemo(() => decodificarPolyline(geometria), [geometria]);
  const ajustar = () => {
    if (pontos.length > 1) {
      mapa.current?.fitToCoordinates(pontos, {
        edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
        animated: false,
      });
    }
  };
  return (
    <View testID="moldura-mapa-trajeto" accessibilityLabel={rotuloMapa} style={[estilos.moldura, { borderColor: cores.borda }]}>
      <MapView
        ref={mapa}
        testID="mapa-trajeto"
        style={StyleSheet.absoluteFill}
        onMapReady={ajustar}
        onLayout={ajustar}
        initialRegion={pontos[0] ? { ...pontos[0], latitudeDelta: 0.04, longitudeDelta: 0.04 } : undefined}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {pontos.length > 0 && (
          <Polyline testID="linha-trajeto" coordinates={pontos} strokeColor={cores.rotaSelecionada} strokeWidth={6} />
        )}
        {posicao && (
          <Marker
            testID="marcador-posicao"
            coordinate={{ latitude: posicao.lat, longitude: posicao.lon }}
            title={rotuloPosicao}
            accessibilityLabel={rotuloPosicao}
          />
        )}
      </MapView>
    </View>
  );
}

const estilos = StyleSheet.create({
  moldura: { height: medidas.mapaAltura, borderWidth: medidas.borda, overflow: 'hidden' },
});
