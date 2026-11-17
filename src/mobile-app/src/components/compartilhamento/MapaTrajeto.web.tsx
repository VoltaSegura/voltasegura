import { Texto } from '@/components/Texto';
import { hipotesesEstadosResultado } from '@/textos/hipotesesResultado';
import type { PropsMapaTrajeto } from './MapaTrajeto.native';

export default function MapaTrajeto(_props: PropsMapaTrajeto) {
  return <Texto>{hipotesesEstadosResultado.mapaWeb}</Texto>;
}
