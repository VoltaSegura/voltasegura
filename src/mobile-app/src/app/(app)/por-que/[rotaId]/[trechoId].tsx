import { useLocalSearchParams } from 'expo-router';

import { TelaProvisoria } from '@/components/TelaProvisoria';

export default function PorQueEstaRota() {
  const { rotaId, trechoId } = useLocalSearchParams<{ rotaId: string; trechoId: string }>();

  return (
    <TelaProvisoria
      codigo="TL-09"
      titulo="Por que esta rota?"
      descricao={`Rota: ${rotaId} · trecho: ${trechoId}`}
      acoes={[
        { rotulo: 'Sobre os dados', href: '/sobre-os-dados' },
        {
          rotulo: 'Dados considerados',
          href: { pathname: '/dados-considerados', params: { rotaId } },
        },
      ]}
    />
  );
}
