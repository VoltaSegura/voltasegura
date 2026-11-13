import { TelaProvisoria } from '@/components/TelaProvisoria';

export default function SobreOsDados() {
  return (
    <TelaProvisoria
      codigo="TL-10"
      titulo="Sobre os dados"
      acoes={[{ rotulo: 'Dados considerados', href: '/dados-considerados' }]}
    />
  );
}
