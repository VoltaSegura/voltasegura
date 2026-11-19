export type CasoConsulta =
  | "CONCLUSIVO"
  | "SEM_DIFERENCA"
  | "MISTOS"
  | "INSUFICIENTE"
  | "NAO_APLICAVEL"
  | "SEM_COMPARACAO"
  | "INDISPONIVEL";

export type MotivoInsuficiencia = "AMOSTRA" | "COBERTURA" | "LARGURA";
export type ModoTrecho = "A_PE" | "ONIBUS" | "METRO" | "TREM";
export type FaixaDoDia = "MADRUGADA" | "MANHA" | "TARDE" | "NOITE";
export type FocoRota = "MENOR_TEMPO" | "MENOS_CAMINHADA" | "MENOR_EXPOSICAO" | "OUTRA_OPCAO";

/**
 * Contrato da consulta entre serviços e telas. Só a frente do Plano B altera este arquivo
 * (`docs/dados-reais/04_plano_implementacao.md` §3); as telas leem.
 * Horários (`saidaPrevista`, `chegadaPrevista`, `partidaPrevista`) são sempre ISO-8601 COM fuso;
 * a tela formata no fuso do aparelho.
 */

export interface Trecho {
  id: string;
  ordem: number;
  modo: ModoTrecho;
  linha: string | null;
  embarque: string | null;
  desembarque: string | null;
  partidaPrevista: string | null;
  duracaoMin: number;
  distanciaKm: number;
  faixaDoDia: FaixaDoDia | null;
  /** Polyline 5 (precisão 1e-5) do próprio trecho, com pelo menos dois pontos: o mapa desenha por trecho. */
  geometria: string;
}

export interface TotaisCategoria {
  total: number | null;
  outros: number | null;
  carga: number | null;
  veiculo: number | null;
  latrocinio?: number | null;
}

export interface CategoriasRota {
  furto: TotaisCategoria;
  roubo: TotaisCategoria;
  transito: { total: number | null };
}

/**
 * Exposição desconhecida = objeto presente com números `null` (nunca zero, nunca o objeto inteiro nulo).
 * `kmAPe` é distância do roteamento, não ocorrência, e existe mesmo sem exposição.
 */
export interface ExposicaoRota {
  registros: number | null;
  kmAPe: number;
  registrosPorKm: number | null;
  cobertura: number | null;
}

export interface Rota {
  id: string;
  focos: FocoRota[];
  duracaoMin: number;
  caminhadaKm: number;
  trocas: number;
  saidaPrevista: string;
  chegadaPrevista: string;
  /** Polyline 5 da rota inteira (união dos trechos). */
  geometria: string;
  trechos: Trecho[];
  exposicao: ExposicaoRota;
  categorias: CategoriasRota;
  /**
   * B-58: presente quando a rota é uma variação de caminhada gerada pelo app a partir de outra
   * alternativa (mesma condução, trechos a pé por outro caminho). Ausente nas alternativas do roteador.
   */
  variante?: {
    deRotaId: string;
    /** B-59 (D-33): `dados` = caminho a pé escolhido pelos registros da SSP-SP; ausente = desvio geométrico (B-58). */
    origem?: 'dados';
  };
  /**
   * B-59 (D-33): só na rota com o foco `MENOR_EXPOSICAO`. `clara` = a comparação estatística do docs/08
   * concluiu a favor dela (CONCLUSIVO); `pequena` = tem menos registros com cobertura suficiente, mas a
   * diferença não passou no teste. A confiança é sempre exibida junto com o destaque (docs/05).
   */
  destaqueExposicao?: { confianca: 'clara' | 'pequena' };
}

/** De onde veio cada bloco da resposta. */
export interface FontesConsulta {
  /** `otp2` = OpenTripPlanner do projeto (GTFS + OSM); `exemplo` = fixture local. */
  roteamento: 'otp2' | 'exemplo';
  /** `ssp` = cálculo do serviço sobre a SSP-SP; `exemplo` = fixture; `indisponivel` = sem exposição validada. */
  exposicao: 'ssp' | 'exemplo' | 'indisponivel';
}

export interface RespostaConsulta {
  /** `true` se QUALQUER bloco for de exemplo (`fontes.roteamento` ou `fontes.exposicao` = `exemplo`). */
  exemplo: boolean;
  /**
   * Origem por bloco: o selo EXEMPLO some só nas partes reais. Com `exposicao: 'indisponivel'`,
   * `caso` é `INDISPONIVEL`, os números de exposição, categorias e panorama são `null` e nenhuma
   * rota tem o foco `MENOR_EXPOSICAO` ("só roteamento").
   */
  fontes: FontesConsulta;
  caso: CasoConsulta;
  motivo: MotivoInsuficiencia | null;
  rotas: Rota[];
  sobreOsDados: {
    fonte: string;
    periodo: { inicio: string; fim: string; meses: number };
    atualizacao: { ssp: string; gtfs: string };
  };
  panoramaMunicipal: {
    periodo: { inicio: string; fim: string };
    homicidioDoloso: number | null;
    tentativaHomicidio: number | null;
    estupro: number | null;
    estuproVulneravel: number | null;
  };
}
