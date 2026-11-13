import { TelaProvisoria } from '@/components/TelaProvisoria';

export default function Buscando() {
  return (
    <TelaProvisoria
      codigo="TL-06"
      titulo="Buscando alternativas"
      acoes={[
        // No sucesso, a TL-06 é substituída pela TL-07 (05_navegacao.md, "Transições").
        { rotulo: 'Ver alternativas (provisório)', href: '/resultado', substituir: true },
      ]}
    />
  );
}
