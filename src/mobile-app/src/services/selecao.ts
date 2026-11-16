import { ambiente, type ModoApi } from '@/config/ambiente';
import { consultaMock, criarConsultaApi, type EntradaConsulta, type ServicoConsulta } from './consulta';
import { ErroServico } from './erros';
import { criarConsultaOtp2 } from './otp2';

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
      return config.urlOtp2 ? criarConsultaOtp2(config.urlOtp2) : consultaSemConfiguracao;
    default:
      return consultaSemConfiguracao;
  }
}

export const consultaSelecionada = selecionarConsulta(ambiente);

export const consultarRotas = (entrada: EntradaConsulta, opcoes?: { signal?: AbortSignal }) =>
  consultaSelecionada.consultarRotas(entrada, opcoes);
