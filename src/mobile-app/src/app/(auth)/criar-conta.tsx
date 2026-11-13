import { TelaProvisoria } from '@/components/TelaProvisoria';
import { useSessao } from '@/sessao/SessaoContext';

export default function CriarConta() {
  const { entrar } = useSessao();

  return (
    <TelaProvisoria
      codigo="TL-02"
      titulo="Criar conta"
      acoes={[
        // Provisório: sem formulário nem backend; só abre a sessão em memória.
        { rotulo: 'Criar conta (provisório)', aoTocar: entrar },
        { rotulo: 'Já tenho conta', href: '/entrar', substituir: true },
        { rotulo: 'Aviso de privacidade', href: '/aviso-privacidade' },
      ]}
    />
  );
}
