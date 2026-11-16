import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import MapView, { Marker, type MapPressEvent } from 'react-native-maps';

import type { Ponto } from '@/consulta';
import { textos } from '@/textos';
import { useTema } from '@/theme/useTema';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { pontosExemplo } from './pontosExemplo';

export type PropsMapaPonto = {
  onEscolher: (ponto: Ponto) => void;
  ponto?: Ponto | null;
  foco?: Ponto | null;
  centroInicial?: Ponto | null;
  onInteragir?: () => void;
  onDisponibilidadeChange?: (disponivel: boolean) => void;
  /** Tela cheia: ocupa o pai inteiro; o marcador fica na coordenada escolhida. */
  cheio?: boolean;
};

export default function MapaPonto({ onEscolher, ponto, foco, centroInicial, onInteragir, onDisponibilidadeChange, cheio = false }: PropsMapaPonto) {
  const { cores } = useTema();
  const mapaRef = useRef<MapView>(null);
  const ultimoFoco = useRef<Ponto | null>(null);
  const mapaPronto = useRef(false);
  const reduzirMovimento = useReducedMotion();
  const reduzirRef = useRef(reduzirMovimento);
  useEffect(() => { reduzirRef.current = reduzirMovimento; }, [reduzirMovimento]);
  const [inicio] = useState(() => centroInicial ?? ponto);
  const latFoco = foco?.lat;
  const lonFoco = foco?.lon;

  useEffect(() => {
    const temporizador = setTimeout(() => {
      if (!mapaPronto.current) onDisponibilidadeChange?.(false);
    }, 10000);
    return () => clearTimeout(temporizador);
  }, [onDisponibilidadeChange]);

  useEffect(() => {
    if (latFoco === undefined || lonFoco === undefined) return;
    if (ultimoFoco.current?.lat === latFoco && ultimoFoco.current.lon === lonFoco) return;
    ultimoFoco.current = { lat: latFoco, lon: lonFoco };
    let ativo = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduzir) => {
      if (ativo) mapaRef.current?.animateToRegion({ latitude: latFoco, longitude: lonFoco, latitudeDelta: 0.015, longitudeDelta: 0.015 }, reduzir || reduzirRef.current ? 0 : 250);
    });
    return () => { ativo = false; };
  }, [latFoco, lonFoco]);
  const tocar = (evento: MapPressEvent) => {
    onInteragir?.();
    const { latitude, longitude } = evento.nativeEvent.coordinate;
    onEscolher({ lat: latitude, lon: longitude });
  };
  return (
    <View style={cheio ? estilos.cheio : [estilos.moldura, { borderColor: cores.borda }]}>
      <MapView
        ref={mapaRef}
        testID="mapa-ponto"
        style={StyleSheet.absoluteFill}
        initialRegion={{ latitude: inicio?.lat ?? pontosExemplo.origem.lat, longitude: inicio?.lon ?? pontosExemplo.origem.lon, latitudeDelta: inicio ? 0.015 : 0.04, longitudeDelta: inicio ? 0.015 : 0.04 }}
        onPress={tocar}
        onTouchStart={() => onInteragir?.()}
        onMapReady={() => { mapaPronto.current = true; onDisponibilidadeChange?.(true); }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        accessibilityLabel={textos.escolherPonto.rotuloMapa}
      >
        {ponto ? <Marker coordinate={{ latitude: ponto.lat, longitude: ponto.lon }} pinColor={cores.acao} draggable accessibilityLabel={textos.planejar.pontoMapa} onDragEnd={(evento) => { onInteragir?.(); const { latitude, longitude } = evento.nativeEvent.coordinate; onEscolher({ lat: latitude, lon: longitude }); }} /> : null}
      </MapView>
    </View>
  );
}

const estilos = StyleSheet.create({
  cheio: { ...(StyleSheet.absoluteFill as object) },
  moldura: { height: 320, borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
});
