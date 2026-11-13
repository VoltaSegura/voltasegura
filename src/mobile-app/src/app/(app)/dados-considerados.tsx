import { useLocalSearchParams } from 'expo-router';

import { TelaProvisoria } from '@/components/TelaProvisoria';

export default function DadosConsiderados() {
  const { rotaId } = useLocalSearchParams<{ rotaId?: string }>();

  return (
    <TelaProvisoria
      codigo="TL-11"
      titulo="Dados considerados"
      descricao={rotaId ? `Rota: ${rotaId}` : undefined}
    />
  );
}
