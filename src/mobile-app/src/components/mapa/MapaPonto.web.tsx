import { useEffect } from 'react';
import { Texto } from '@/components/Texto';
import { textos } from '@/textos';
import type { PropsMapaPonto } from './MapaPonto.native';

export default function MapaPonto({ onDisponibilidadeChange }: PropsMapaPonto) {
  useEffect(() => { onDisponibilidadeChange?.(false); }, [onDisponibilidadeChange]);
  return <Texto>{textos.escolherPonto.mapaErro}</Texto>;
}
