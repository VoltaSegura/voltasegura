import { TelaProvisoria } from '@/components/TelaProvisoria';
import { useSessao } from '@/sessao/SessaoContext';

export default function Configuracoes() {
  const { sair } = useSessao();

  return (
    <TelaProvisoria
      codigo="TL-12"
      titulo="Configurações"
      acoes={[
        { rotulo: 'Aviso de privacidade', href: '/aviso-privacidade' },
        // Sair limpa a pilha e volta à TL-01 (a guarda da raiz cuida disso).
        { rotulo: 'Sair', aoTocar: sair },
      ]}
    />
  );
}
