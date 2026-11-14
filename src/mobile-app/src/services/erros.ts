/**
 * Erros da camada de serviços. O contrato de códigos é [HIPÓTESE] até a
 * conciliação com o backend (PL-18); o mapeamento fica só aqui.
 * A mensagem nunca carrega coordenadas, endereço ou e-mail (US-19 AC2).
 */

export type TipoErroServico =
  | 'VALIDACAO'
  | 'NAO_AUTORIZADO'
  | 'FORA_DA_AREA'
  | 'INDISPONIVEL'
  | 'SEM_REDE';

export class ErroServico extends Error {
  readonly tipo: TipoErroServico;
  /** Código do corpo da resposta (ex.: "EMAIL_EXISTENTE", "CREDENCIAIS"), se houver. */
  readonly codigo: string | null;
  readonly status: number | null;

  constructor(tipo: TipoErroServico, codigo: string | null = null, status: number | null = null) {
    super(tipo);
    this.name = 'ErroServico';
    this.tipo = tipo;
    this.codigo = codigo;
    this.status = status;
  }
}

export function ehErroServico(e: unknown): e is ErroServico {
  return e instanceof ErroServico;
}

/** Status HTTP -> tipo. `contexto` distingue o 422 da consulta (fora da área) do 422 de cadastro. */
export function erroDeStatus(
  status: number,
  codigo: string | null,
  contexto: 'consulta' | 'conta',
): ErroServico {
  if (status === 401) return new ErroServico('NAO_AUTORIZADO', codigo, status);
  if (status === 422) {
    return new ErroServico(contexto === 'consulta' ? 'FORA_DA_AREA' : 'VALIDACAO', codigo, status);
  }
  if (status === 400 || status === 409) return new ErroServico('VALIDACAO', codigo, status);
  return new ErroServico('INDISPONIVEL', codigo, status); // 503, 504 e demais falhas do servidor
}
