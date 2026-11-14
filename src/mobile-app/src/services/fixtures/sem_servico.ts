import type { RespostaConsulta } from "../tipos";

export const sem_servico: RespostaConsulta = {
  "exemplo": true,
  "caso": "SEM_COMPARACAO",
  "motivo": null,
  "rotas": [],
  "sobreOsDados": {
    "fonte": "SSP-SP",
    "periodo": {
      "inicio": "2026-01-01",
      "fim": "2026-09-30",
      "meses": 9
    },
    "atualizacao": {
      "ssp": "2026-11-01",
      "gtfs": "2026-11-05"
    }
  },
  "panoramaMunicipal": {
    "periodo": {
      "inicio": "2026-01-01",
      "fim": "2026-09-30"
    },
    "homicidioDoloso": null,
    "tentativaHomicidio": null,
    "estupro": null,
    "estuproVulneravel": null
  }
};

