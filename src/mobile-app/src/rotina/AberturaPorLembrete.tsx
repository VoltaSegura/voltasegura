import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { useConsulta } from '@/consulta';

import { useRotinas } from './RotinaContext';

/** Saída de hoje no horário da rotina, em ISO (mesmo formato do SeletorHorario). */
export function saidaDeHoje(hora: string, agora: Date = new Date()): string {
  const [h, m] = hora.split(':').map(Number);
  const data = new Date(agora);
  data.setHours(h, m, 0, 0);
  return data.toISOString();
}

/**
 * Tocar no lembrete abre a home (planejar) com origem, destino e horário da rotina (FN-17).
 * A notificação leva só o id da rotina; as coordenadas são lidas do armazenamento do aparelho.
 * Se a rotina não existe mais, o app só abre.
 */
export function AberturaPorLembrete() {
  const resposta = Notifications.useLastNotificationResponse();
  const { rotinas, carregado } = useRotinas();
  const { definirOrigem, definirDestino, definirSaida, definirSentido } = useConsulta();
  const tratada = useRef<string | null>(null);

  useEffect(() => {
    if (!resposta || !carregado) return;
    const pedido = resposta.notification.request;
    const chave = `${pedido.identifier}:${resposta.notification.date}`;
    if (tratada.current === chave) return;
    tratada.current = chave;
    const id = pedido.content.data?.rotinaId;
    const rotina = typeof id === 'string' ? rotinas.find((r) => r.id === id) : undefined;
    if (!rotina) return;
    definirSentido('ida');
    definirOrigem(rotina.origem.ponto, rotina.origem.rotulo);
    definirDestino(rotina.destino.ponto, rotina.destino.rotulo);
    definirSaida(saidaDeHoje(rotina.hora));
    router.navigate('/planejar');
  }, [resposta, carregado, rotinas, definirOrigem, definirDestino, definirSaida, definirSentido]);

  return null;
}
