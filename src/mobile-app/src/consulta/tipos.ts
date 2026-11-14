import type { EntradaConsulta, ErroServico, Ponto, RespostaConsulta } from '@/services';

export type { Ponto };

export type Sentido = EntradaConsulta['sentido'];

/** Consulta atual (FN-05). Só existe em memória: nunca vai para log, disco nem servidor (US-19). */
export interface Consulta {
  /** Ausente até a usuária escolher o ponto. */
  origem: Ponto | null;
  destino: Ponto | null;
  /** ISO-8601 com fuso, ex.: "2026-11-13T23:00:00-03:00". */
  saida: string;
  sentido: Sentido;
}

export type CodigoProblema =
  | 'ORIGEM_AUSENTE'
  | 'DESTINO_AUSENTE'
  | 'ORIGEM_IGUAL_DESTINO'
  | 'SAIDA_INVALIDA'
  | 'FORA_DA_AREA';

export type Busca =
  | { status: 'ocioso' }
  | { status: 'buscando' }
  | { status: 'sucesso'; resposta: RespostaConsulta }
  | {
      status: 'erro';
      erro: ErroServico;
      /** Preenchido só quando a falha foi de validação local (nenhuma chamada de rede foi feita). */
      problemas?: CodigoProblema[];
    };

export interface EstadoConsulta {
  consulta: Consulta;
  busca: Busca;
  /** Id da rota escolhida; só existe com resposta em memória. */
  rotaSelecionadaId: string | null;
}
