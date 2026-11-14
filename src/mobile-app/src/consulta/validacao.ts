import type { CodigoProblema, Consulta, Ponto } from './tipos';

export interface OpcoesValidacao {
  /**
   * PONTO DE EXTENSÃO (D-05, PL-11 em aberto): o polígono do município de São Paulo
   * ainda não existe. Quando existir, é injetado aqui. Enquanto isso, o padrão
   * aceita qualquer ponto; nenhum polígono ou caixa de coordenadas é assumido.
   */
  dentroDoMunicipio?: (ponto: Ponto) => boolean;
}

const SAIDA_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

function pontoPreenchido(p: Ponto | null | undefined): p is Ponto {
  return !!p && Number.isFinite(p.lat) && Number.isFinite(p.lon);
}

export function saidaValida(saida: string): boolean {
  return SAIDA_ISO.test(saida) && !Number.isNaN(Date.parse(saida));
}

/** Devolve os problemas da consulta (lista vazia = válida). Nunca lança exceção. */
export function validarConsulta(
  consulta: Consulta,
  opcoes: OpcoesValidacao = {},
): CodigoProblema[] {
  const dentro = opcoes.dentroDoMunicipio ?? (() => true);
  const problemas: CodigoProblema[] = [];
  const { origem, destino } = consulta;
  const temOrigem = pontoPreenchido(origem);
  const temDestino = pontoPreenchido(destino);

  if (!temOrigem) problemas.push('ORIGEM_AUSENTE');
  if (!temDestino) problemas.push('DESTINO_AUSENTE');
  if (temOrigem && temDestino && origem.lat === destino.lat && origem.lon === destino.lon) {
    problemas.push('ORIGEM_IGUAL_DESTINO');
  }
  if (typeof consulta.saida !== 'string' || !saidaValida(consulta.saida)) {
    problemas.push('SAIDA_INVALIDA');
  }
  try {
    const fora = (temOrigem && !dentro(origem)) || (temDestino && !dentro(destino));
    if (fora) problemas.push('FORA_DA_AREA');
  } catch {
    // função injetada com defeito não derruba a validação; a API ainda responde 422 (D-05)
  }
  return problemas;
}
