import { ambiente, type ModoApi } from '@/config/ambiente';
import { consultaMock, criarConsultaApi, type EntradaConsulta, type ServicoConsulta } from './consulta';
import { ErroServico } from './erros';
import type { ModoCobertura } from './exposicao';
import { criarConsultaOtp2 } from './otp2';
import { comPrioridadeDosDados } from './rotaDosDados';

/** Código do erro quando a configuração do app não permite consultar (modo inválido ou URL ausente). */
export const CODIGO_CONFIGURACAO = 'CONFIGURACAO';

/** Consulta que sempre falha com erro tratado: nunca devolve fixture no lugar de dado real. */
const consultaSemConfiguracao: ServicoConsulta = {
  async consultarRotas() {
    throw new ErroServico('INDISPONIVEL', CODIGO_CONFIGURACAO);
  },
};

export interface ConfiguracaoConsulta {
  modoApi: ModoApi | 'invalido';
  urlApi: string;
  urlOtp2: string;
  /** B-30: com `otp2`, só há exposição real se a Data API e o Neon Auth estiverem configurados. */
  urlDataApi?: string;
  urlNeonAuth?: string;
  origemNeonAuth?: string;
  exposicaoCobertura?: ModoCobertura;
}

/**
 * Escolhe a fonte da consulta (B-04). Só `mock` devolve fixtures (rotuladas EXEMPLO); `api` e `otp2`
 * sem URL, ou um modo desconhecido, falham com `INDISPONIVEL`/`CONFIGURACAO`, sem cair no mock.
 */
export function selecionarConsulta(config: ConfiguracaoConsulta): ServicoConsulta {
  switch (config.modoApi) {
    case 'mock':
      return consultaMock;
    case 'api':
      return config.urlApi ? criarConsultaApi(config.urlApi) : consultaSemConfiguracao;
    case 'otp2':
      if (!config.urlOtp2) return consultaSemConfiguracao;
      // B-59 (D-33): com exposição real, os registros da SSP-SP desenham o caminho a pé de menor exposição
      // estimada e ele ganha prioridade (com a confiança ao lado). Sem a Data API, fica só o roteamento.
      return config.urlDataApi && config.urlNeonAuth
        ? comPrioridadeDosDados(criarConsultaOtp2(config.urlOtp2), {
          urlOtp2: config.urlOtp2,
          urlDataApi: config.urlDataApi,
          urlNeonAuth: config.urlNeonAuth,
          origemNeonAuth: config.origemNeonAuth ?? 'http://localhost:8081',
          modoCobertura: config.exposicaoCobertura,
        })
        : criarConsultaOtp2(config.urlOtp2);
    default:
      return consultaSemConfiguracao;
  }
}

export const consultaSelecionada = selecionarConsulta(ambiente);

export const consultarRotas = (entrada: EntradaConsulta, opcoes?: { signal?: AbortSignal }) =>
  consultaSelecionada.consultarRotas(entrada, opcoes);
