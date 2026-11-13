import { TelaProvisoria } from '@/components/TelaProvisoria';

/** Depende do tempo (D-22): aberta pelo link temporário (voltasegura://acompanhar/<token>). */
export default function Acompanhar() {
  return <TelaProvisoria codigo="TL-15" titulo="Acompanhar viagem" />;
}
