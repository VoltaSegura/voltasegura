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
  geometria: string;
  trechos: Trecho[];
  exposicao: ExposicaoRota;
  categorias: CategoriasRota;
}

export interface RespostaConsulta {
  exemplo: boolean;
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
