import { decodificarPolyline, type Coordenada } from '@/components/mapa/polyline';
import { chegouAoDestino, distanciaM } from '@/compartilhamento/chegada';
import { textos } from '@/textos';

import type { ModoTrecho, Rota, Trecho } from './tipos';

/** Distância (m) além da qual a leitura conta como fora do trajeto. GPS urbano erra dezenas de metros. */
export const LIMITE_DESVIO_M = 60;
/** Leituras seguidas fora do trajeto antes de declarar o desvio (evita alarme com um ponto ruim). */
export const LEITURAS_PARA_DESVIO = 3;

/** Trecho com a geometria já decodificada e o comprimento medido sobre ela. */
export type TrechoSeguido = Trecho & { pontos: Coordenada[]; comprimentoM: number };

/** Estado guardado entre leituras. Só avança no itinerário: um laço da rota não confunde o trecho. */
export interface EstadoSeguir {
  indice: number;
  percorridoNoTrechoM: number;
  leiturasFora: number;
  chegou: boolean;
}

export const ESTADO_INICIAL: EstadoSeguir = { indice: 0, percorridoNoTrechoM: 0, leiturasFora: 0, chegou: false };

export interface Avaliacao {
  estado: EstadoSeguir;
  /** Confirmado após `LEITURAS_PARA_DESVIO` leituras seguidas longe do trajeto. */
  foraDoTrajeto: boolean;
  trechoAtual: TrechoSeguido | null;
  proximo: TrechoSeguido | null;
  /** Metros que faltam no trecho atual. */
  restanteNoTrechoM: number;
  /** Metros que faltam até o destino, somando os trechos seguintes. */
  restanteM: number;
  /** Minutos que faltam, estimados pela duração programada de cada trecho. */
  restanteMin: number;
}

const paraPonto = (c: Coordenada) => ({ lat: c.latitude, lon: c.longitude });

/** Decodifica os trechos, na ordem do itinerário, e descarta os que não têm traço válido. */
export function prepararTrechos(rota: Rota): TrechoSeguido[] {
  return [...rota.trechos]
    .sort((a, b) => a.ordem - b.ordem)
    .map((trecho) => {
      const pontos = decodificarPolyline(trecho.geometria);
      return { ...trecho, pontos, comprimentoM: comprimentoDoTraco(pontos) };
    })
    .filter((trecho) => trecho.pontos.length >= 2);
}

function comprimentoDoTraco(pontos: Coordenada[]): number {
  let total = 0;
  for (let i = 0; i < pontos.length - 1; i++) total += distanciaM(paraPonto(pontos[i]), paraPonto(pontos[i + 1]));
  return total;
}

/**
 * Projeta o ponto no segmento a–b em um plano local (metros, origem em `a`). Em escala de cidade o erro é
 * desprezível. Devolve a fração do segmento (0–1) e a distância do ponto até ela.
 */
function projetarNoSegmento(a: Coordenada, b: Coordenada, p: Coordenada): { t: number; distancia: number } {
  const R = 111_320;
  const k = Math.cos((a.latitude * Math.PI) / 180);
  const bx = (b.longitude - a.longitude) * k * R;
  const by = (b.latitude - a.latitude) * R;
  const px = (p.longitude - a.longitude) * k * R;
  const py = (p.latitude - a.latitude) * R;
  const tamanho2 = bx * bx + by * by;
  const t = tamanho2 === 0 ? 0 : Math.min(1, Math.max(0, (px * bx + py * by) / tamanho2));
  return { t, distancia: Math.hypot(px - t * bx, py - t * by) };
}

/** Ponto mais próximo do trajeto: distância até ele e quantos metros já foram percorridos até ali. */
export function projetarNoTrecho(pontos: Coordenada[], posicao: Coordenada): { distanciaM: number; percorridoM: number } {
  let melhor = { distanciaM: Infinity, percorridoM: 0 };
  let acumulado = 0;
  for (let i = 0; i < pontos.length - 1; i++) {
    const a = pontos[i];
    const b = pontos[i + 1];
    const comprimento = distanciaM(paraPonto(a), paraPonto(b));
    const { t, distancia } = projetarNoSegmento(a, b, posicao);
    if (distancia < melhor.distanciaM) melhor = { distanciaM: distancia, percorridoM: acumulado + t * comprimento };
    acumulado += comprimento;
  }
  return melhor;
}

function restante(trechos: TrechoSeguido[], indice: number, percorridoNoTrechoM: number) {
  const atual = trechos[indice];
  const restoNoTrechoM = Math.max(0, atual.comprimentoM - percorridoNoTrechoM);
  const fracao = atual.comprimentoM > 0 ? restoNoTrechoM / atual.comprimentoM : 0;
  let restanteM = restoNoTrechoM;
  let minutos = atual.duracaoMin * fracao;
  for (const trecho of trechos.slice(indice + 1)) {
    restanteM += trecho.comprimentoM;
    minutos += trecho.duracaoMin;
  }
  return { restoNoTrechoM, restanteM, restanteMin: Math.round(minutos) };
}

/**
 * Avalia uma leitura de GPS contra a rota. Função pura: quem chama guarda o `estado` devolvido e o passa na
 * próxima leitura.
 */
export function avaliarPosicao(trechos: TrechoSeguido[], posicao: Coordenada, anterior: EstadoSeguir): Avaliacao {
  if (trechos.length === 0) {
    return { estado: anterior, foraDoTrajeto: false, trechoAtual: null, proximo: null, restanteNoTrechoM: 0, restanteM: 0, restanteMin: 0 };
  }
  const ultimo = trechos.length - 1;
  const destino = trechos[ultimo]?.pontos.at(-1);
  const trechoAtualDe = (indice: number) => trechos[indice] ?? null;

  if (anterior.chegou || (destino && chegouAoDestino(paraPonto(posicao), paraPonto(destino)))) {
    const estado: EstadoSeguir = { indice: ultimo, percorridoNoTrechoM: trechos[ultimo]?.comprimentoM ?? 0, leiturasFora: 0, chegou: true };
    return { estado, foraDoTrajeto: false, trechoAtual: trechoAtualDe(ultimo), proximo: null, restanteNoTrechoM: 0, restanteM: 0, restanteMin: 0 };
  }

  let melhor = { indice: anterior.indice, distanciaM: Infinity, percorridoM: anterior.percorridoNoTrechoM };
  for (let i = anterior.indice; i < trechos.length; i++) {
    const projecao = projetarNoTrecho(trechos[i].pontos, posicao);
    // `<=`: no encontro de dois trechos (distância zero nos dois) vale o seguinte, quem chega ao canto já embarca.
    if (projecao.distanciaM <= melhor.distanciaM) melhor = { indice: i, distanciaM: projecao.distanciaM, percorridoM: projecao.percorridoM };
  }

  const dentro = melhor.distanciaM <= LIMITE_DESVIO_M;
  const leiturasFora = dentro ? 0 : anterior.leiturasFora + 1;
  const indice = dentro ? melhor.indice : anterior.indice;
  const percorridoNoTrechoM = dentro ? melhor.percorridoM : anterior.percorridoNoTrechoM;
  const { restoNoTrechoM, restanteM, restanteMin } = restante(trechos, indice, percorridoNoTrechoM);

  return {
    estado: { indice, percorridoNoTrechoM, leiturasFora, chegou: false },
    foraDoTrajeto: leiturasFora >= LEITURAS_PARA_DESVIO,
    trechoAtual: trechoAtualDe(indice),
    proximo: trechoAtualDe(indice + 1),
    restanteNoTrechoM: restoNoTrechoM,
    restanteM,
    restanteMin,
  };
}

const NOME_MODO: Record<ModoTrecho, string> = {
  A_PE: textos.modos.modo.aPe,
  ONIBUS: textos.modos.modo.onibus,
  METRO: textos.modos.modo.metro,
  TREM: textos.modos.modo.trem,
};

/** Distância para leitura humana: metros abaixo de 1 km, km acima. */
export function distanciaParaTexto(metros: number): string {
  if (metros < 1000) return `${Math.round(metros / 10) * 10} m`;
  return `${(metros / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
}

/**
 * Instrução do passo atual. Caminhada diz para onde ir (o embarque do próximo trecho); transporte diz onde
 * embarcar no começo do trecho e com que linha seguir depois. Sem dado de manobra, não inventa curva.
 */
export function instrucaoDoTrecho(avaliacao: Avaliacao): string | null {
  const atual = avaliacao.trechoAtual;
  if (!atual || avaliacao.estado.chegou) return null;
  const proximo = avaliacao.proximo;
  if (atual.modo === 'A_PE') {
    const distancia = distanciaParaTexto(avaliacao.restanteNoTrechoM);
    const ate = proximo?.embarque ?? null;
    return ate ? textos.seguir.instrucao.caminhar(distancia, ate) : textos.seguir.instrucao.caminharAoDestino(distancia);
  }
  const identificacao = atual.linha ?? NOME_MODO[atual.modo];
  const noInicio = atual.comprimentoM > 0 && avaliacao.estado.percorridoNoTrechoM < atual.comprimentoM * 0.1;
  if (noInicio) {
    const hora = atual.partidaPrevista ? new Date(atual.partidaPrevista).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null;
    return textos.seguir.instrucao.embarcar(atual.embarque ?? 'o ponto de embarque', identificacao, hora);
  }
  return atual.desembarque
    ? textos.seguir.instrucao.seguir(identificacao, atual.desembarque)
    : textos.seguir.instrucao.seguirSemDestino(identificacao);
}
