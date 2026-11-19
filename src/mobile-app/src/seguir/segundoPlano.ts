/**
 * Leitura de posição com o app em segundo plano (Fase 3 de "Seguir rota").
 *
 * - Android: a leitura roda como foreground service, com notificação persistente do VoltaSegura.
 * - iOS: a leitura roda em segundo plano (UIBackgroundModes `location`) e a barra de status mostra o indicador.
 * - Sem o módulo nativo (Expo Go) ou sem a permissão de segundo plano, cai no modo de primeiro plano: quem
 *   chama continua lendo com `watchPositionAsync`, como antes.
 *
 * Não guarda histórico: cada leitura é repassada e descartada. O encerramento (botão Encerrar ou chegada) fica com
 * quem chama; aqui só se para a tarefa.
 */
import * as Location from 'expo-location';
import { Alert } from 'react-native';

import { seguir } from '@/textos/seguir';

export const NOME_TAREFA_SEGUIR_ROTA = 'voltasegura-seguir-rota';
const PERMISSAO_CONCEDIDA = 'granted';

export type ModoAcompanhamento = 'segundoPlano' | 'primeiroPlano';
export type LeituraGps = Location.LocationObject;

export interface OpcoesAcompanhamento {
  /** Recebe cada leitura, vinda da tarefa (segundo plano) ou de `registrarLeitura` (primeiro plano). */
  aoLeitura: (leitura: LeituraGps) => void;
  /** Mostra o texto de pedido de permissão e devolve a escolha da pessoa. */
  confirmarPermissao: () => Promise<boolean>;
}

interface Sessao {
  opcoes: OpcoesAcompanhamento;
}

let sessao: Sessao | null = null;

/* ---------- Funções puras (testadas em segundoPlano.test.ts) ---------- */

/** Segundo plano só com a tarefa disponível e a permissão concedida. Qualquer outro caso é primeiro plano. */
export function decidirModo(entrada: { tarefasDisponiveis: boolean; permissaoSegundoPlano: string }): ModoAcompanhamento {
  return entrada.tarefasDisponiveis && entrada.permissaoSegundoPlano === PERMISSAO_CONCEDIDA ? 'segundoPlano' : 'primeiroPlano';
}

/** Corpo da tarefa: fica com a última leitura do lote, válida só se tiver coordenadas numéricas. */
export function ultimaLeitura(data: unknown): LeituraGps | null {
  const locais = (data as { locations?: unknown } | null | undefined)?.locations;
  if (!Array.isArray(locais) || locais.length === 0) return null;
  const ultima = locais[locais.length - 1] as LeituraGps | null | undefined;
  const coords = ultima?.coords;
  if (!ultima || !coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') return null;
  return ultima;
}

/* ---------- Módulos nativos (carregados com proteção, como em notificacoes.ts) ---------- */

type ModuloTarefas = typeof import('expo-task-manager');
let tarefas: ModuloTarefas | null | undefined;

function carregarTarefas(): ModuloTarefas | null {
  if (tarefas !== undefined) return tarefas;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    tarefas = require('expo-task-manager') as ModuloTarefas;
  } catch {
    tarefas = null;
  }
  return tarefas;
}

/**
 * Define a tarefa de localização. Precisa rodar no escopo global deste módulo: com o app em segundo plano,
 * nenhum componente é montado, então a tarefa tem de existir já na carga do bundle.
 */
export function registrarTarefaSegundoPlano(): boolean {
  const modulo = carregarTarefas();
  if (!modulo) return false;
  if (!modulo.isTaskDefined(NOME_TAREFA_SEGUIR_ROTA)) {
    modulo.defineTask(NOME_TAREFA_SEGUIR_ROTA, async ({ data, error }) => {
      if (error) return;
      const leitura = ultimaLeitura(data);
      if (leitura) registrarLeitura(leitura);
    });
  }
  return true;
}

registrarTarefaSegundoPlano();

/* ---------- Ciclo do acompanhamento ---------- */

/**
 * Entrada de todas as leituras: da tarefa em segundo plano e, em primeiro plano, do GPS de quem chama.
 */
export function registrarLeitura(leitura: LeituraGps): void {
  sessao?.opcoes.aoLeitura(leitura);
}

/** Para a tarefa. Pode ser chamada mais de uma vez: sem sessão ativa, não faz nada. */
export async function pararAcompanhamento(): Promise<void> {
  const atual = sessao;
  if (!atual) return;
  sessao = null;
  try {
    if (await Location.hasStartedLocationUpdatesAsync(NOME_TAREFA_SEGUIR_ROTA)) {
      await Location.stopLocationUpdatesAsync(NOME_TAREFA_SEGUIR_ROTA);
    }
  } catch {
    // Sem tarefa ativa (ou sem módulo nativo): não há o que parar.
  }
}

/**
 * Começa o acompanhamento. Pede a permissão de segundo plano só aqui, depois que a de primeiro plano foi
 * concedida. Devolve o modo escolhido; em `primeiroPlano`, quem chama é que lê o GPS.
 */
export async function iniciarAcompanhamento(opcoes: OpcoesAcompanhamento): Promise<ModoAcompanhamento> {
  await pararAcompanhamento();
  const tarefasDisponiveis = carregarTarefas() !== null;
  const permissaoSegundoPlano = tarefasDisponiveis ? await pedirPermissaoSegundoPlano(opcoes.confirmarPermissao) : 'denied';
  let modo = decidirModo({ tarefasDisponiveis, permissaoSegundoPlano });

  sessao = { opcoes };

  if (modo === 'segundoPlano' && !(await comecarTarefa())) modo = 'primeiroPlano';
  return modo;
}

async function comecarTarefa(): Promise<boolean> {
  try {
    await Location.startLocationUpdatesAsync(NOME_TAREFA_SEGUIR_ROTA, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 5,
      timeInterval: 3000,
      activityType: Location.ActivityType.OtherNavigation,
      pausesUpdatesAutomatically: false,
      // iOS: indicador azul na barra de status enquanto a localização é usada em segundo plano.
      showsBackgroundLocationIndicator: true,
      // Android: foreground service com notificação persistente.
      foregroundService: {
        notificationTitle: seguir.segundoPlano.notificacaoTitulo,
        notificationBody: seguir.segundoPlano.notificacaoCorpo,
        killServiceOnDestroy: true,
      },
    });
    return true;
  } catch {
    return false;
  }
}

async function pedirPermissaoSegundoPlano(confirmar: () => Promise<boolean>): Promise<string> {
  try {
    const atual = await Location.getBackgroundPermissionsAsync();
    if (atual.status === PERMISSAO_CONCEDIDA) return atual.status;
    if (!(await confirmar())) return 'denied';
    return (await Location.requestBackgroundPermissionsAsync()).status;
  } catch {
    return 'denied';
  }
}

/** Texto de pedido de permissão em um alerta nativo. Fechar sem escolher conta como "agora não". */
export function confirmarPermissaoComAlerta(): Promise<boolean> {
  return new Promise((resolver) => {
    Alert.alert(
      seguir.segundoPlano.pedidoTitulo,
      seguir.segundoPlano.pedidoCorpo,
      [
        { text: seguir.segundoPlano.pedidoAgoraNao, style: 'cancel', onPress: () => resolver(false) },
        { text: seguir.segundoPlano.pedidoPermitir, onPress: () => resolver(true) },
      ],
      { cancelable: true, onDismiss: () => resolver(false) },
    );
  });
}

/** Só para testes: esquece os módulos carregados e a sessão. */
export function reiniciarSegundoPlanoParaTeste(): void {
  tarefas = undefined;
  sessao = null;
}
