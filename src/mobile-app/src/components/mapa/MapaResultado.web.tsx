import { Texto } from '@/components/Texto';
import { hipotesesEstadosResultado } from '@/textos/hipotesesResultado';
import type { PropsMapaResultado } from './MapaResultado.native';

export default function MapaResultado(_props: PropsMapaResultado) {
  return <Texto>{hipotesesEstadosResultado.mapaWeb}</Texto>;
}
