import { router, useLocalSearchParams } from 'expo-router';

import { TelaProvisoria } from '@/components/TelaProvisoria';

export default function EscolherPonto() {
  const { campo } = useLocalSearchParams<{ campo?: 'origem' | 'destino' }>();

  return (
    <TelaProvisoria
      codigo="TL-05"
      titulo={campo === 'destino' ? 'Escolher destino' : 'Escolher origem'}
      acoes={[{ rotulo: 'Fechar', aoTocar: () => router.back() }]}
    />
  );
}
