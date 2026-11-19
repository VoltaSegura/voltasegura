import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useCompartilhamento } from '@/compartilhamento';
import type { Coordenada } from '@/components/mapa/polyline';
import { useConsulta } from '@/consulta';
import type { Rota } from '@/services';
import { consultarRotas } from '@/services/selecao';
import { avaliarPosicao, ESTADO_INICIAL, prepararTrechos, type Avaliacao, type EstadoSeguir, type TrechoSeguido } from '@/services/seguirRota';

import { DEBOUNCE_RECALCULO_MS, escolherRotaEquivalente, MAXIMO_FALHAS_RECALCULO } from './recalculo';
import { confirmarPermissaoComAlerta, iniciarAcompanhamento, pararAcompanhamento, registrarLeitura } from './segundoPlano';

/**
 * Estados da tela. `pronto` é antes de pedir a permissão; a leitura só começa com a pessoa tocando em "Começar".
 */
export type StatusSeguir = 'pronto' | 'pedindoPermissao' | 'semPermissao' | 'buscandoGps' | 'seguindo' | 'chegou' | 'encerrado' | 'erro' | 'semTrajeto';

/**
 * `falhou` = o último recálculo não trouxe rota: a rota anterior continua na tela e a pessoa pode tentar de novo.
 */
export type EstadoRecalculo = 'ocioso' | 'recalculando' | 'falhou';

/** Intervalo mínimo entre envios ao compartilhamento, para não enviar uma posição a cada leitura. */
const INTERVALO_ENVIO_MS = 15_000;
/** Identificador da tela ligada: só este acompanhamento segura a tela acesa. */
const TAG_TELA_LIGADA = 'voltasegura-seguir-rota';

export interface SeguirRota {
  status: StatusSeguir;
  trechos: TrechoSeguido[];
  avaliacao: Avaliacao | null;
  posicao: Coordenada | null;
  /** Rota em uso: a que abriu a tela ou, depois de um recálculo, a que o substituiu. */
  rota: Rota;
  recalculo: EstadoRecalculo;
  comecar: () => Promise<void>;
  encerrar: () => void;
  /** Ação da pessoa ("Tentar de novo"): recalcula agora, sem esperar o intervalo nem o limite de falhas. */
  tentarRecalculo: () => Promise<void>;
}

/**
 * Lê a posição com a tela ligada e o app aberto. Quando a pessoa sai do trajeto (confirmado por `avaliarPosicao`),
 * pede uma rota nova a partir da posição atual, com o mesmo destino e sentido, e reinicia o acompanhamento nela.
 * Se o recálculo falhar, a rota anterior fica na tela. Com a permissão de segundo plano, a leitura vem da tarefa
 * (`segundoPlano.ts`); sem ela ou sem o módulo nativo, vem do watch do primeiro plano. Só uma das duas fontes fica ativa.
 * Se houver sessão de compartilhamento ativa, a posição é enviada por `registrarPosicao` (opt-in já existente).
 *
 * A assinatura `useSeguirRota(rota)` é estável: a rota inicial é lida na montagem e o hook guarda a que está em uso.
 */
export function useSeguirRota(rotaInicial: Rota): SeguirRota {
  const [atual, setAtual] = useState(() => ({ rota: rotaInicial, trechos: prepararTrechos(rotaInicial) }));
  const { rota, trechos } = atual;
  const [status, setStatus] = useState<StatusSeguir>(trechos.length > 0 ? 'pronto' : 'semTrajeto');
  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);
  const [posicao, setPosicao] = useState<Coordenada | null>(null);
  const [recalculo, setRecalculo] = useState<EstadoRecalculo>('ocioso');
  const estado = useRef<EstadoSeguir>(ESTADO_INICIAL);
  const assinatura = useRef<Location.LocationSubscription | null>(null);
  const ultimoEnvio = useRef(0);
  const ultimaPosicao = useRef<Coordenada | null>(null);
  // Refs espelham o último valor para o callback do GPS (que é criado uma vez) não ficar com valor antigo.
  const rotaRef = useRef(rota);
  const trechosRef = useRef(trechos);
  const { fase, registrarPosicao } = useCompartilhamento();
  const compartilhando = useRef(false);
  const registrarRef = useRef(registrarPosicao);
  const { estado: { consulta }, atualizarResposta } = useConsulta();
  const consultaRef = useRef(consulta);
  const atualizarRespostaRef = useRef(atualizarResposta);
  // Recálculo: uma chamada por vez, debounce entre automáticos, contagem de falhas seguidas e cancelamento.
  const emRecalculo = useRef(false);
  const ultimoRecalculo = useRef(0);
  const falhasSeguidas = useRef(0);
  const controlador = useRef<AbortController | null>(null);
  // Sessão muda ao encerrar ou desmontar: resposta de recálculo de uma sessão anterior é descartada.
  const sessao = useRef(0);

  useEffect(() => {
    compartilhando.current = fase === 'ativa';
    registrarRef.current = registrarPosicao;
    consultaRef.current = consulta;
    atualizarRespostaRef.current = atualizarResposta;
  }, [fase, registrarPosicao, consulta, atualizarResposta]);

  // Para o que estiver lendo: a tarefa em segundo plano (se houver) e o watch do primeiro plano (se houver).
  const pararLeitura = useCallback(() => {
    assinatura.current?.remove();
    assinatura.current = null;
    void pararAcompanhamento();
    manterTelaLigada(false);
  }, []);

  const recalcular = useCallback(async (ponto: Coordenada, forcar: boolean) => {
    if (emRecalculo.current) return;
    const agora = Date.now();
    if (!forcar && (agora - ultimoRecalculo.current < DEBOUNCE_RECALCULO_MS || falhasSeguidas.current >= MAXIMO_FALHAS_RECALCULO)) return;
    const { destino, sentido } = consultaRef.current;
    if (!destino) {
      falhasSeguidas.current += 1;
      setRecalculo('falhou');
      return;
    }
    emRecalculo.current = true;
    ultimoRecalculo.current = agora;
    const sessaoDaChamada = sessao.current;
    const controle = new AbortController();
    controlador.current = controle;
    setRecalculo('recalculando');
    try {
      const resposta = await consultarRotas(
        { origem: { lat: ponto.latitude, lon: ponto.longitude }, destino, saida: new Date().toISOString(), sentido },
        { signal: controle.signal },
      );
      if (sessaoDaChamada !== sessao.current || estado.current.chegou) return;
      const candidatas = resposta.rotas.filter((rotaCandidata) => prepararTrechos(rotaCandidata).length > 0);
      const nova = escolherRotaEquivalente(candidatas, rotaRef.current);
      if (!nova) throw new Error('Nenhuma rota equivalente no recálculo');
      falhasSeguidas.current = 0;
      const novosTrechos = prepararTrechos(nova);
      rotaRef.current = nova;
      trechosRef.current = novosTrechos;
      // Reinicia o acompanhamento na rota nova, já avaliando a posição atual para mostrar o próximo passo.
      const reinicio = avaliarPosicao(novosTrechos, ponto, ESTADO_INICIAL);
      estado.current = reinicio.estado;
      setAtual({ rota: nova, trechos: novosTrechos });
      setAvaliacao(reinicio);
      setRecalculo('ocioso');
      atualizarRespostaRef.current(resposta, nova.id);
    } catch {
      if (sessaoDaChamada !== sessao.current) return;
      falhasSeguidas.current += 1;
      setRecalculo('falhou');
    } finally {
      emRecalculo.current = false;
      if (controlador.current === controle) controlador.current = null;
    }
  }, []);

  const aoLerPosicao = useCallback((leitura: Location.LocationObject) => {
    const ponto = { latitude: leitura.coords.latitude, longitude: leitura.coords.longitude };
    const resultado = avaliarPosicao(trechosRef.current, ponto, estado.current);
    estado.current = resultado.estado;
    ultimaPosicao.current = ponto;
    setPosicao(ponto);
    setAvaliacao(resultado);
    if (resultado.estado.chegou) {
      pararLeitura();
      setStatus('chegou');
    } else {
      setStatus('seguindo');
      if (resultado.foraDoTrajeto) {
        void recalcular(ponto, false);
      } else {
        setRecalculo((atualRecalculo) => (atualRecalculo === 'falhou' ? 'ocioso' : atualRecalculo));
      }
    }
    const agora = Date.now();
    if (compartilhando.current && agora - ultimoEnvio.current >= INTERVALO_ENVIO_MS) {
      ultimoEnvio.current = agora;
      registrarRef.current({ lat: ponto.latitude, lon: ponto.longitude, em: new Date(leitura.timestamp).toISOString() }).catch(() => {});
    }
  }, [pararLeitura, recalcular]);

  // Fim do acompanhamento por qualquer motivo que não seja a chegada: o botão Encerrar ou sair da tela.
  const finalizar = useCallback(() => {
    sessao.current += 1;
    controlador.current?.abort();
    pararLeitura();
    setRecalculo('ocioso');
    setStatus('encerrado');
  }, [pararLeitura]);

  const comecar = useCallback(async () => {
    setStatus('pedindoPermissao');
    try {
      const permissao = await Location.requestForegroundPermissionsAsync();
      if (permissao.status !== 'granted') {
        setStatus('semPermissao');
        return;
      }
      setStatus('buscandoGps');
      pararLeitura();
      // Pede a permissão de segundo plano só agora. Sem ela ou sem o módulo nativo (Expo Go), fica no primeiro plano.
      const modo = await iniciarAcompanhamento({
        aoLeitura: aoLerPosicao,
        confirmarPermissao: confirmarPermissaoComAlerta,
      });
      if (modo === 'primeiroPlano') {
        assinatura.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 3000 },
          registrarLeitura,
        );
      }
      manterTelaLigada(true);
    } catch {
      pararLeitura();
      setStatus('erro');
    }
  }, [aoLerPosicao, pararLeitura]);

  const encerrar = finalizar;

  const tentarRecalculo = useCallback(async () => {
    const ponto = ultimaPosicao.current;
    if (!ponto) return;
    await recalcular(ponto, true);
  }, [recalcular]);

  useEffect(
    () => () => {
      sessao.current += 1;
      controlador.current?.abort();
      pararLeitura();
    },
    [pararLeitura],
  );

  return { status, trechos, avaliacao, posicao, rota, recalculo, comecar, encerrar, tentarRecalculo };
}

/** A tela fica ligada só durante o acompanhamento. Falha ao ligar/desligar não derruba a tela de rota. */
function manterTelaLigada(ligar: boolean) {
  Promise.resolve()
    .then(() => (ligar ? activateKeepAwakeAsync(TAG_TELA_LIGADA) : deactivateKeepAwake(TAG_TELA_LIGADA)))
    .catch(() => {});
}
