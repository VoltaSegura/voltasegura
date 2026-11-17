import { decodificarPolyline } from '@/components/mapa/polyline';
import type {
  EstadoSessao,
  SessaoCompartilhamento,
  TrajetoCompartilhado,
  VisaoAcompanhamento,
} from '../compartilhamento';
import { conclusivo } from './conclusivo';

const MIN = 60_000;

/** Tokens de exemplo (modo mock): abrem pelo link voltasegura://acompanhar/<token>. */
export const tokensExemplo: Record<EstadoSessao, string> = {
  ATIVO: 'exemplo-ativo',
  CHEGOU: 'exemplo-chegou',
  ENCERRADO: 'exemplo-encerrado',
  EXPIRADO: 'exemplo-expirado',
};

/** Trajeto de exemplo: cópia da primeira alternativa da fixture "conclusivo" (EXEMPLO), com chegada em `chegadaEm`. */
export function trajetoExemplo(chegadaEm: number): TrajetoCompartilhado {
  const rota = conclusivo.rotas[0];
  const pontos = decodificarPolyline(rota.geometria);
  const fim = pontos[pontos.length - 1] ?? { latitude: -23.5615, longitude: -46.6559 };
  return {
    geometria: rota.geometria,
    trechos: rota.trechos.map((t) => ({ modo: t.modo, linha: t.linha, partidaPrevista: t.partidaPrevista })),
    chegadaPrevista: new Date(chegadaEm).toISOString(),
    destino: { lat: fim.latitude, lon: fim.longitude },
  };
}

function posicaoNoMeio(trajeto: TrajetoCompartilhado, em: number) {
  const pontos = decodificarPolyline(trajeto.geometria);
  const p = pontos[Math.floor(pontos.length / 2)] ?? { latitude: trajeto.destino.lat, longitude: trajeto.destino.lon };
  return { lat: p.latitude, lon: p.longitude, em: new Date(em).toISOString() };
}

/** O que o contato vê em cada estado (FN-16). Nunca inclui dados da conta nem da comparação (US-21 AC8). */
export function visaoExemplo(estado: EstadoSessao, agora: number): VisaoAcompanhamento {
  if (estado === 'EXPIRADO') {
    return { estado, aoVivo: false, trajeto: null, posicao: null, encerradoEm: null };
  }
  if (estado === 'ATIVO') {
    const trajeto = trajetoExemplo(agora + 20 * MIN);
    return { estado, aoVivo: true, trajeto, posicao: posicaoNoMeio(trajeto, agora - 2 * MIN), encerradoEm: null };
  }
  // CHEGOU e ENCERRADO: o servidor já apagou trajeto e posição (US-21 AC7).
  return { estado, aoVivo: true, trajeto: null, posicao: null, encerradoEm: new Date(agora - 5 * MIN).toISOString() };
}

/** Sessão de quem compartilha, em cada estado do ciclo (PL-20: chegada prevista + 30 min). */
export function sessaoExemplo(estado: EstadoSessao, agora: number): SessaoCompartilhamento {
  const chegada = estado === 'ATIVO' ? agora + 20 * MIN : agora - 40 * MIN;
  const trajeto = trajetoExemplo(chegada);
  return {
    id: `sessao-${estado.toLowerCase()}`,
    token: tokensExemplo[estado],
    link: `voltasegura://acompanhar/${tokensExemplo[estado]}`,
    estado,
    aoVivo: true,
    trajeto,
    posicao: estado === 'ATIVO' ? posicaoNoMeio(trajeto, agora - 2 * MIN) : null,
    iniciadaEm: new Date(estado === 'ATIVO' ? agora - 10 * MIN : chegada - 30 * MIN).toISOString(),
    expiraEm: new Date(chegada + 30 * MIN).toISOString(),
  };
}
