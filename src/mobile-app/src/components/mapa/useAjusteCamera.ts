import { useCallback, useContext, useEffect, type RefObject } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import type MapView from 'react-native-maps';
import type { LatLng } from 'react-native-maps';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** Margens reservam os pinos e a área coberta pela folha, sem alterar o traçado. */
export function useAjusteCamera(mapa: RefObject<MapView | null>, pontos: LatLng[] | undefined, alturaFolha: number, expandido: boolean) {
  const reduzido = useReducedMotion();
  // Sem provedor (testes isolados) a margem é zero; no app, reserva a barra de status/recorte.
  const topoSeguro = useContext(SafeAreaInsetsContext)?.top ?? 0;
  const ajustar = useCallback(() => {
    if (!pontos?.length) return;
    mapa.current?.fitToCoordinates(pontos, {
      edgePadding: { top: 48 + topoSeguro, left: 48, right: 48, bottom: alturaFolha + 24 },
      animated: !reduzido,
    });
  }, [mapa, pontos, alturaFolha, reduzido, topoSeguro]);
  // O callback também é chamado em onMapReady/onLayout, após a medição nativa.
  useEffect(() => { ajustar(); }, [ajustar, expandido]);
  return ajustar;
}
