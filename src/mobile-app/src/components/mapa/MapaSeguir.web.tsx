import { Texto } from '@/components/Texto';
import { seguir } from '@/textos/seguir';
import type { PropsMapaSeguir } from './MapaSeguir.native';

export default function MapaSeguir(_props: PropsMapaSeguir) {
  return <Texto>{seguir.mapaWeb}</Texto>;
}
