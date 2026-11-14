import { useEffect, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import MapView, { Marker, type MapPressEvent, type Region } from 'react-native-maps';

import type { Ponto } from '@/consulta';
import { textos } from '@/textos';
import { useTema } from '@/theme/useTema';
import { Icone } from '@/components/Icone';
import { Texto } from '@/components/Texto';
import { pontosExemplo } from './pontosExemplo';

export type PropsMapaPonto = {
  onEscolher: (ponto: Ponto) => void;
  ponto?: Ponto | null;
  foco?: Ponto | null;
  onDisponibilidadeChange?: (disponivel: boolean) => void;
  /** Tela cheia (D-29): ocupa o pai inteiro, sem moldura, com o pino fixo no centro em vez de marcador. */
  cheio?: boolean;
};

export default function MapaPonto({ onEscolher, ponto, foco, onDisponibilidadeChange, cheio = false }: PropsMapaPonto) {
  const { cores } = useTema();
  const mapaRef = useRef<MapView>(null);
  const arrastou = useRef(false);
  const ultimoFoco = useRef<Ponto | null>(null);
  const mapaPronto = useRef(false);
  const reduzirMovimento = useRef(false);
  const latFoco = foco?.lat;
  const lonFoco = foco?.lon;

  useEffect(() => {
    let ativo = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduzir) => { if (ativo) reduzirMovimento.current = reduzir; });
    const assinatura = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduzir) => { reduzirMovimento.current = reduzir; });
    return () => { ativo = false; assinatura.remove(); };
  }, []);

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
      if (ativo) mapaRef.current?.animateToRegion({ latitude: latFoco, longitude: lonFoco, latitudeDelta: 0.04, longitudeDelta: 0.04 }, reduzir || reduzirMovimento.current ? 0 : 250);
    });
    return () => { ativo = false; };
  }, [latFoco, lonFoco]);
  const tocar = (evento: MapPressEvent) => {
    const { latitude, longitude } = evento.nativeEvent.coordinate;
    if (cheio) mapaRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.04, longitudeDelta: 0.04 }, reduzirMovimento.current ? 0 : 250);
    onEscolher({ lat: latitude, lon: longitude });
  };
  const mover = (regiao: Region) => {
    if (!arrastou.current) return;
    arrastou.current = false;
    onEscolher({ lat: regiao.latitude, lon: regiao.longitude });
  };
  return (
    <View style={cheio ? estilos.cheio : [estilos.moldura, { borderColor: cores.borda }]}>
      <MapView
        ref={mapaRef}
        testID="mapa-ponto"
        style={StyleSheet.absoluteFill}
        initialRegion={{ latitude: ponto?.lat ?? pontosExemplo.origem.lat, longitude: ponto?.lon ?? pontosExemplo.origem.lon, latitudeDelta: 0.04, longitudeDelta: 0.04 }}
        onPress={tocar}
        onPanDrag={() => { arrastou.current = true; }}
        onRegionChangeComplete={mover}
        onMapReady={() => { mapaPronto.current = true; onDisponibilidadeChange?.(true); }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        accessibilityLabel={textos.escolherPonto.rotuloMapa}
      >
        {ponto && !cheio ? <Marker coordinate={{ latitude: ponto.lat, longitude: ponto.lon }} accessibilityLabel={textos.planejar.pontoMapa} /> : null}
      </MapView>
      <View pointerEvents="none" style={estilos.mira}>
        {cheio ? <View style={estilos.pino}><Icone nome="map-marker" tamanho={48} cor={cores.acao} /></View> : <Texto variante="titulo" cor="acaoLink">＋</Texto>}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cheio: { ...(StyleSheet.absoluteFill as object) },
  // A ponta do pino fica no centro do mapa: sobe metade da altura do ícone.
  pino: { transform: [{ translateY: -24 }] },
  moldura: { height: 320, borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  mira: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
});
