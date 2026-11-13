import { TelaProvisoria } from '@/components/TelaProvisoria';

export default function Resultado() {
  return (
    <TelaProvisoria
      codigo="TL-07"
      titulo="Alternativas"
      acoes={[
        { rotulo: 'Ver detalhes da rota (exemplo)', href: '/resultado/exemplo-1' },
        { rotulo: 'Sobre os dados', href: '/sobre-os-dados' },
        {
          rotulo: 'Planejar a volta',
          href: { pathname: '/planejar', params: { sentido: 'volta' } },
        },
      ]}
    />
  );
}
