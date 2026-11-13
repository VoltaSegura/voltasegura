import { useLocalSearchParams } from 'expo-router';

import { TelaProvisoria } from '@/components/TelaProvisoria';

export default function Planejar() {
  const { sentido } = useLocalSearchParams<{ sentido?: 'ida' | 'volta' }>();

  return (
    <TelaProvisoria
      codigo="TL-04"
      titulo={sentido === 'volta' ? 'Planejar a volta' : 'Planejar a ida'}
      acoes={[
        {
          rotulo: 'Escolher origem',
          href: { pathname: '/escolher-ponto', params: { campo: 'origem' } },
        },
        {
          rotulo: 'Escolher destino',
          href: { pathname: '/escolher-ponto', params: { campo: 'destino' } },
        },
        { rotulo: 'Buscar alternativas', href: '/buscando' },
        { rotulo: 'Configurações', href: '/configuracoes' },
      ]}
    />
  );
}
