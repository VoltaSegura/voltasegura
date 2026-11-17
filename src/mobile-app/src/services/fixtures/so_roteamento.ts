import type { RespostaConsulta } from "../tipos";
import { sem_diferenca } from "./sem_diferenca";

/**
 * "Só roteamento" (B-08): rotas de EXEMPLO sem exposição validada. É o formato que o modo `otp2`
 * devolve enquanto a SSP não estiver no serviço: `fontes.exposicao = 'indisponivel'`, `caso` e
 * números de exposição/categorias/panorama indisponíveis (`null`, nunca zero), sem foco de exposição.
 * Derivada de `sem_diferenca` para manter tempos, trechos e geometrias coerentes.
 */
export const so_roteamento: RespostaConsulta = {
  ...sem_diferenca,
  exemplo: true,
  fontes: { roteamento: "exemplo", exposicao: "indisponivel" },
  caso: "INDISPONIVEL",
  motivo: null,
  rotas: sem_diferenca.rotas.map((rota) => ({
    ...rota,
    focos: rota.focos.filter((foco) => foco !== "MENOR_EXPOSICAO"),
    exposicao: { registros: null, kmAPe: rota.caminhadaKm, registrosPorKm: null, cobertura: null },
    categorias: {
      furto: { total: null, outros: null, carga: null, veiculo: null },
      roubo: { total: null, outros: null, carga: null, veiculo: null, latrocinio: null },
      transito: { total: null },
    },
  })),
  sobreOsDados: {
    fonte: "Trajetos de exemplo. Exposição estimada indisponível: os registros da SSP-SP não foram consultados.",
    periodo: { inicio: "", fim: "", meses: 0 },
    atualizacao: { ssp: "", gtfs: sem_diferenca.sobreOsDados.atualizacao.gtfs },
  },
  panoramaMunicipal: {
    periodo: { inicio: "", fim: "" },
    homicidioDoloso: null,
    tentativaHomicidio: null,
    estupro: null,
    estuproVulneravel: null,
  },
};
