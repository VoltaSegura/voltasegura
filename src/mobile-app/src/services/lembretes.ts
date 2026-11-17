import { Platform } from 'react-native';

import type { Rotina } from '@/rotina/tipos';
import { rotina as t } from '@/textos/rotina';

import { carregarNotificacoes } from './notificacoes';

/**
 * Lembretes locais da Rotina da semana (FN-17, D-31).
 * [DECISÃO] Gatilho: notificação local N minutos antes do horário de saída, repetida nos dias escolhidos.
 * Sem tempo real, sem servidor e sem token de push: nada sai do aparelho.
 */

const CANAL = 'rotina';
const prefixo = (id: string) => `rotina-${id}-`;

export type GatilhoLembrete = {
  identificador: string;
  /** 1 = domingo ... 7 = sábado (convenção do expo-notifications), já ajustado se o aviso cai no dia anterior. */
  weekday: number;
  hour: number;
  minute: number;
  /** Dia da saída (1 a 7), usado no texto do lembrete. */
  diaSaida: number;
};

/** Um gatilho por dia da rotina. Se o aviso passa da meia-noite para trás, cai no dia anterior. */
export function gatilhosDaRotina(r: Pick<Rotina, 'id' | 'dias' | 'hora' | 'antecedencia'>): GatilhoLembrete[] {
  const [h, m] = r.hora.split(':').map(Number);
  const total = h * 60 + m - r.antecedencia;
  const voltaDia = total < 0;
  const minutosDoDia = ((total % 1440) + 1440) % 1440;
  return r.dias.map((dia) => ({
    identificador: `${prefixo(r.id)}${dia}`,
    weekday: voltaDia ? (dia === 1 ? 7 : dia - 1) : dia,
    hour: Math.floor(minutosDoDia / 60),
    minute: minutosDoDia % 60,
    diaSaida: dia,
  }));
}

/** Texto neutro do lembrete: só o horário e o convite a comparar os caminhos (docs/05). */
export function corpoDoLembrete(diaSaida: number, hora: string): string {
  return t.corpo(t.diasCompletos[diaSaida - 1], hora);
}

const suportado = () => Platform.OS !== 'web' && carregarNotificacoes() !== null;

/** Módulo já carregado; só chamar depois de `suportado()`. */
const notif = () => carregarNotificacoes()!;

/** false no Expo Go ou sem o módulo nativo: a rotina continua salva, sem lembrete. */
export function lembretesDisponiveis(): boolean {
  return suportado();
}

/** Define como o app mostra o lembrete e cria o canal do Android. Chamar uma vez ao abrir a área logada. */
export async function configurarLembretes(): Promise<void> {
  if (!suportado()) return;
  const Notifications = notif();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, { name: t.canal, importance: Notifications.AndroidImportance.DEFAULT });
  }
}

export type ResultadoPermissao = 'concedida' | 'negada';

/** Pede a permissão só quando há um lembrete a programar (AC4). Nunca lança. */
export async function pedirPermissaoLembretes(): Promise<ResultadoPermissao> {
  if (!suportado()) return 'negada';
  try {
    const Notifications = notif();
    const atual = await Notifications.getPermissionsAsync();
    if (atual.granted) return 'concedida';
    if (!atual.canAskAgain) return 'negada';
    const nova = await Notifications.requestPermissionsAsync();
    return nova.granted ? 'concedida' : 'negada';
  } catch {
    return 'negada';
  }
}

export async function cancelarLembretes(id: string): Promise<void> {
  if (!suportado()) return;
  const Notifications = notif();
  const pendentes = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pendentes
      .filter((p) => p.identifier.startsWith(prefixo(id)))
      .map((p) => Notifications.cancelScheduledNotificationAsync(p.identifier)),
  );
}

/** Substitui os lembretes da rotina pelos atuais. O conteúdo leva só o id da rotina: coordenadas não vão para a notificação. */
export async function agendarLembretes(r: Rotina): Promise<void> {
  if (!suportado()) return;
  const Notifications = notif();
  await cancelarLembretes(r.id);
  for (const g of gatilhosDaRotina(r)) {
    await Notifications.scheduleNotificationAsync({
      identifier: g.identificador,
      content: { title: t.notificacaoTitulo, body: corpoDoLembrete(g.diaSaida, r.hora), data: { rotinaId: r.id } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: g.weekday, hour: g.hour, minute: g.minute, channelId: CANAL },
    });
  }
}

export async function cancelarTodosLembretes(): Promise<void> {
  if (!suportado()) return;
  await notif().cancelAllScheduledNotificationsAsync();
}
