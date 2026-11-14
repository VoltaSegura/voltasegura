import { useLocalSearchParams } from 'expo-router';

import { TelaProvisoria } from '@/components/TelaProvisoria';

/** Depende do tempo (D-22): construir por último. */
export default function Compartilhar() {
  const { rotaId } = useLocalSearchParams<{ rotaId: string }>();

  return <TelaProvisoria codigo="TL-14" titulo="Compartilhar" descricao={`Rota: ${rotaId}`} />;
}
