import { useLocalSearchParams } from 'expo-router';

import { TelaProvisoria } from '@/components/TelaProvisoria';

export default function DetalhesRota() {
  const { rotaId } = useLocalSearchParams<{ rotaId: string }>();

  return (
    <TelaProvisoria
      codigo="TL-08"
      titulo="Detalhes da rota"
      descricao={`Rota: ${rotaId}`}
      acoes={[
        // D-08: o botão só aparece nos trechos a pé.
        {
          rotulo: 'Por que esta rota? (trecho a pé)',
          href: { pathname: '/por-que/[rotaId]/[trechoId]', params: { rotaId, trechoId: 'trecho-1' } },
        },
        { rotulo: 'Sobre os dados', href: '/sobre-os-dados' },
        {
          rotulo: 'Compartilhar',
          href: { pathname: '/compartilhar/[rotaId]', params: { rotaId } },
        },
        {
          rotulo: 'Planejar a volta',
          href: { pathname: '/planejar', params: { sentido: 'volta' } },
        },
      ]}
    />
  );
}
