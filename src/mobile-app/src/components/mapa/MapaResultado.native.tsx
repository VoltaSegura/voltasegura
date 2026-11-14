import { Fragment, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import type { Rota } from '@/services';
import { textos } from '@/textos';
import { hipotesesEstadosResultado } from '@/textos/hipotesesResultado';
import { useTema } from '@/theme/useTema';
import { esp } from '@/theme/tokens';
import { Texto } from '@/components/Texto';
import { medidas } from '@/components/resultado/medidas';
import { decodificarPolyline } from './polyline';

export type PropsMapaResultado = {
  rotas: Rota[];
  rotaSelecionadaId: string;
  onSelecionar: (id: string) => void;
  expandido: boolean;
};

export default function MapaResultado({ rotas, rotaSelecionadaId, onSelecionar, expandido }: PropsMapaResultado) {
  const { cores } = useTema();
  const mapa = useRef<MapView>(null);
  const linhas = useMemo(() => rotas.map(rota => ({ id: rota.id, pontos: decodificarPolyline(rota.geometria) })), [rotas]);
  const selecionada = linhas.find(linha => linha.id === rotaSelecionadaId);
  const inicio = selecionada?.pontos[0];

  useEffect(() => {
    if (selecionada?.pontos.length) mapa.current?.fitToCoordinates(selecionada.pontos, {
      edgePadding: { top: 24, right: 24, bottom: 24, left: 24 }, animated: false,
    });
  }, [selecionada, expandido]);

  return <View testID="moldura-mapa-resultado" accessibilityLabel={hipotesesEstadosResultado.rotaNoMapa(rotas.findIndex(rota => rota.id === rotaSelecionadaId) + 1)} style={[estilos.moldura, { height: expandido ? medidas.mapaAlturaExpandido : medidas.mapaAltura, borderColor: cores.borda }]}>
    <MapView ref={mapa} testID="mapa-resultado" style={StyleSheet.absoluteFill}
      initialRegion={inicio ? { ...inicio, latitudeDelta: 0.04, longitudeDelta: 0.04 } : undefined}
      showsUserLocation={false} showsMyLocationButton={false}>
      {linhas.filter(linha => linha.id !== rotaSelecionadaId).map(linha => linha.pontos.length > 0 &&
        <Fragment key={linha.id}>
          <Polyline testID={`toque-rota-${linha.id}`} coordinates={linha.pontos} strokeColor="transparent" strokeWidth={medidas.areaToqueMapa} tappable onPress={() => onSelecionar(linha.id)} />
          <Polyline testID={`linha-rota-${linha.id}`} coordinates={linha.pontos} strokeColor={cores.rotaOutra} strokeWidth={3}
            lineDashPattern={[8, 6]} tappable onPress={() => onSelecionar(linha.id)} />
        </Fragment>)}
      {selecionada && selecionada.pontos.length > 0 && <>
        <Polyline testID={`toque-rota-${selecionada.id}`} coordinates={selecionada.pontos} strokeColor="transparent" strokeWidth={medidas.areaToqueMapa} tappable onPress={() => onSelecionar(selecionada.id)} />
        <Polyline testID={`linha-rota-${selecionada.id}`} coordinates={selecionada.pontos} strokeColor={cores.rotaSelecionada} strokeWidth={7} tappable onPress={() => onSelecionar(selecionada.id)} />
        <Marker coordinate={selecionada.pontos[0]} title={textos.escolherPonto.tituloOrigem} accessibilityLabel={textos.escolherPonto.tituloOrigem} />
        <Marker coordinate={selecionada.pontos[selecionada.pontos.length - 1]} title={textos.escolherPonto.tituloDestino} accessibilityLabel={textos.escolherPonto.tituloDestino} />
      </>}
    </MapView>
    {!inicio && <View style={[estilos.aviso, { backgroundColor: cores.superficie }]}><Texto>{hipotesesEstadosResultado.trajetoIndisponivel}</Texto></View>}
  </View>;
}

const estilos = StyleSheet.create({ moldura: { borderWidth: medidas.borda, overflow: 'hidden' }, aviso: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: esp[3] } });
