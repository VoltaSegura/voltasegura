import { TelaProvisoria } from '@/components/TelaProvisoria';
import { useSessao } from '@/sessao/SessaoContext';

export default function Entrar() {
  const { entrar } = useSessao();

  return (
    <TelaProvisoria
      codigo="TL-03"
      titulo="Entrar"
      acoes={[
        // Provisório: sem formulário nem backend; só abre a sessão em memória.
        { rotulo: 'Entrar (provisório)', aoTocar: entrar },
        { rotulo: 'Criar conta', href: '/criar-conta', substituir: true },
      ]}
    />
  );
}
