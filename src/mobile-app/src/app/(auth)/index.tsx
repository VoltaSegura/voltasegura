import { TelaProvisoria } from '@/components/TelaProvisoria';

export default function Abertura() {
  return (
    <TelaProvisoria
      codigo="TL-01"
      titulo="VoltaSegura"
      descricao="Compare alternativas de ida e volta com a exposição estimada e a confiança dos dados."
      acoes={[
        { rotulo: 'Criar conta', href: '/criar-conta' },
        { rotulo: 'Entrar', href: '/entrar' },
        { rotulo: 'Aviso de privacidade', href: '/aviso-privacidade' },
      ]}
    />
  );
}
