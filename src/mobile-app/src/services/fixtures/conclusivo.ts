import type { RespostaConsulta } from "../tipos";

export const conclusivo: RespostaConsulta = {
  "exemplo": true,
  "caso": "CONCLUSIVO",
  "motivo": null,
  "rotas": [
    {
      "id": "rota_1",
      "focos": [
        "MENOR_EXPOSICAO"
      ],
      "duracaoMin": 40,
      "caminhadaKm": 1,
      "trocas": 1,
      "saidaPrevista": "2026-11-13T23:00:00-03:00",
      "chegadaPrevista": "2026-11-13T23:40:00-03:00",
      "geometria": "ruvnCbas{Gz@nPbGbLzEfJnKvQrSnd@zOve@",
      "trechos": [
        {
          "id": "trecho_1_1",
          "ordem": 1,
          "modo": "A_PE",
          "linha": null,
          "embarque": null,
          "desembarque": null,
          "partidaPrevista": "2026-11-13T23:00:00-03:00",
          "duracaoMin": 35,
          "distanciaKm": 1,
          "faixaDoDia": "NOITE",
          "geometria": "ruvnCbas{Gz@nPbGbLzEfJ"
        },
        {
          "id": "trecho_1_2",
          "ordem": 2,
          "modo": "ONIBUS",
          "linha": "Linha 000",
          "embarque": "Parada Exemplo A",
          "desembarque": "Parada Exemplo B",
          "partidaPrevista": "2026-11-13T23:35:00-03:00",
          "duracaoMin": 5,
          "distanciaKm": 1.2,
          "faixaDoDia": null,
          "geometria": "nfwnC~jt{GnKvQrSnd@zOve@"
        }
      ],
      "exposicao": {
        "registros": 4,
        "kmAPe": 1,
        "registrosPorKm": 4,
        "cobertura": 0.9
      },
      "categorias": {
        "furto": {
          "total": 6,
          "outros": 3,
          "carga": 0,
          "veiculo": 3
        },
        "roubo": {
          "total": 5,
          "outros": 3,
          "carga": 0,
          "veiculo": 1,
          "latrocinio": 0
        },
        "transito": {
          "total": 1
        }
      }
    },
    {
      "id": "rota_2",
      "focos": [
        "MENOR_TEMPO"
      ],
      "duracaoMin": 35,
      "caminhadaKm": 1.3,
      "trocas": 0,
      "saidaPrevista": "2026-11-13T23:00:00-03:00",
      "chegadaPrevista": "2026-11-13T23:35:00-03:00",
      "geometria": "ruvnCbas{GjM~HvLrNnKbLbB~WzJzh@fJf^",
      "trechos": [
        {
          "id": "trecho_2_1",
          "ordem": 1,
          "modo": "A_PE",
          "linha": null,
          "embarque": null,
          "desembarque": null,
          "partidaPrevista": "2026-11-13T23:00:00-03:00",
          "duracaoMin": 30,
          "distanciaKm": 1.3,
          "faixaDoDia": "NOITE",
          "geometria": "ruvnCbas{GjM~HvLrNnKbL"
        },
        {
          "id": "trecho_2_2",
          "ordem": 2,
          "modo": "ONIBUS",
          "linha": "Linha 000",
          "embarque": "Parada Exemplo A",
          "desembarque": "Parada Exemplo B",
          "partidaPrevista": "2026-11-13T23:30:00-03:00",
          "duracaoMin": 5,
          "distanciaKm": 1.2,
          "faixaDoDia": null,
          "geometria": "f~wnCzgt{GbB~WzJzh@fJf^"
        }
      ],
      "exposicao": {
        "registros": 9,
        "kmAPe": 1.3,
        "registrosPorKm": 6.9,
        "cobertura": 0.9
      },
      "categorias": {
        "furto": {
          "total": 12,
          "outros": 9,
          "carga": 0,
          "veiculo": 3
        },
        "roubo": {
          "total": 11,
          "outros": 8,
          "carga": 0,
          "veiculo": 1,
          "latrocinio": 0
        },
        "transito": {
          "total": 1
        }
      }
    },
    {
      "id": "rota_3",
      "focos": [
        "MENOS_CAMINHADA"
      ],
      "duracaoMin": 45,
      "caminhadaKm": 0.6,
      "trocas": 2,
      "saidaPrevista": "2026-11-13T23:00:00-03:00",
      "chegadaPrevista": "2026-11-13T23:45:00-03:00",
      "geometria": "ruvnCbas{GcBfTrDfTrDbQ~MzYnUj\\fT~R",
      "trechos": [
        {
          "id": "trecho_3_1",
          "ordem": 1,
          "modo": "A_PE",
          "linha": null,
          "embarque": null,
          "desembarque": null,
          "partidaPrevista": "2026-11-13T23:00:00-03:00",
          "duracaoMin": 40,
          "distanciaKm": 0.6,
          "faixaDoDia": "NOITE",
          "geometria": "ruvnCbas{GcBfTrDfTrDbQ"
        },
        {
          "id": "trecho_3_2",
          "ordem": 2,
          "modo": "ONIBUS",
          "linha": "Linha 000",
          "embarque": "Parada Exemplo A",
          "desembarque": "Parada Exemplo B",
          "partidaPrevista": "2026-11-13T23:40:00-03:00",
          "duracaoMin": 5,
          "distanciaKm": 1.2,
          "faixaDoDia": null,
          "geometria": "v}vnCv}t{G~MzYnUj\\fT~R"
        }
      ],
      "exposicao": {
        "registros": 5,
        "kmAPe": 0.6,
        "registrosPorKm": 8.3,
        "cobertura": 0.9
      },
      "categorias": {
        "furto": {
          "total": 8,
          "outros": 5,
          "carga": 0,
          "veiculo": 3
        },
        "roubo": {
          "total": 7,
          "outros": 4,
          "carga": 0,
          "veiculo": 1,
          "latrocinio": 0
        },
        "transito": {
          "total": 1
        }
      }
    }
  ],
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
