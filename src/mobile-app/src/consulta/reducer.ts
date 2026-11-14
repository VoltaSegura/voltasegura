import type { ErroServico, RespostaConsulta } from '@/services';
import { planejarVolta } from './planejarVolta';
import type { CodigoProblema, Consulta, EstadoConsulta, Ponto, Sentido } from './tipos';

export type AcaoConsulta =
  | { tipo: 'definirOrigem'; ponto: Ponto | null }
  | { tipo: 'definirDestino'; ponto: Ponto | null }
  | { tipo: 'definirSaida'; saida: string }
  | { tipo: 'definirSentido'; sentido: Sentido }
  | { tipo: 'iniciarBusca' }
  | { tipo: 'sucesso'; resposta: RespostaConsulta }
  | { tipo: 'erro'; erro: ErroServico; problemas?: CodigoProblema[] }
  | { tipo: 'selecionarRota'; id: string }
  | { tipo: 'planejarVolta'; saida?: string }
  | { tipo: 'cancelarBusca' }
  | { tipo: 'inverterPontos' }
  | { tipo: 'limpar' };

/** Horário padrão = agora (FN-05). */
export function consultaInicial(agora: Date = new Date()): Consulta {
  return { origem: null, destino: null, saida: agora.toISOString(), sentido: 'ida' };
}

export function estadoInicial(agora?: Date): EstadoConsulta {
  return { consulta: consultaInicial(agora), busca: { status: 'ocioso' }, rotaSelecionadaId: null };
}

export function reducerConsulta(estado: EstadoConsulta, acao: AcaoConsulta): EstadoConsulta {
  switch (acao.tipo) {
    case 'definirOrigem':
      return { ...estado, consulta: { ...estado.consulta, origem: acao.ponto } };
    case 'definirDestino':
      return { ...estado, consulta: { ...estado.consulta, destino: acao.ponto } };
    case 'definirSaida':
      return { ...estado, consulta: { ...estado.consulta, saida: acao.saida } };
    case 'definirSentido':
      return { ...estado, consulta: { ...estado.consulta, sentido: acao.sentido } };
    case 'inverterPontos':
      return { ...estado, consulta: { ...estado.consulta, origem: estado.consulta.destino, destino: estado.consulta.origem }, busca: { status: 'ocioso' }, rotaSelecionadaId: null };
    case 'cancelarBusca':
      return { ...estado, busca: { status: 'ocioso' }, rotaSelecionadaId: null };
    case 'iniciarBusca':
      // a resposta anterior é descartada ao iniciar nova consulta
      return { ...estado, busca: { status: 'buscando' }, rotaSelecionadaId: null };
    case 'sucesso':
      return {
        ...estado,
        busca: { status: 'sucesso', resposta: acao.resposta },
        // a ordem de `rotas` vem da API (D-23): o app não reordena nem escolhe pela usuária
        rotaSelecionadaId: acao.resposta.rotas[0]?.id ?? null,
      };
    case 'erro':
      return {
        ...estado,
        busca: { status: 'erro', erro: acao.erro, problemas: acao.problemas },
        rotaSelecionadaId: null,
      };
    case 'selecionarRota': {
      if (estado.busca.status !== 'sucesso') return estado;
      if (!estado.busca.resposta.rotas.some((r) => r.id === acao.id)) return estado;
      return { ...estado, rotaSelecionadaId: acao.id };
    }
    case 'planejarVolta':
      // ida e volta não se misturam (FL-08): a resposta da ida não vale para a volta
      return {
        consulta: { ...planejarVolta(estado.consulta), saida: acao.saida ?? estado.consulta.saida },
        busca: { status: 'ocioso' },
        rotaSelecionadaId: null,
      };
    case 'limpar':
      return estadoInicial();
  }
}
