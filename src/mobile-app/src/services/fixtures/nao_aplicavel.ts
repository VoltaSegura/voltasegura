import type { RespostaConsulta } from "../tipos";

export const nao_aplicavel: RespostaConsulta = {
  "exemplo": true,
  "caso": "NAO_APLICAVEL",
  "motivo": null,
  "rotas": [
    {
      "id": "rota_1",
      "focos": [
        "MENOR_TEMPO"
      ],
      "duracaoMin": 35,
      "caminhadaKm": 0.8,
      "trocas": 0,
      "saidaPrevista": "2026-11-13T23:00:00-03:00",
      "chegadaPrevista": "2026-11-13T23:35:00-03:00",
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
          "duracaoMin": 30,
          "distanciaKm": 0.8,
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
          "partidaPrevista": "2026-11-13T23:30:00-03:00",
          "duracaoMin": 5,
          "distanciaKm": 1.2,
          "faixaDoDia": null,
          "geometria": "nfwnC~jt{GnKvQrSnd@zOve@"
        }
      ],
      "exposicao": {
        "registros": 5,
        "kmAPe": 0.8,
        "registrosPorKm": 6.3,
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
    },
    {
      "id": "rota_2",
      "focos": [
        "MENOS_CAMINHADA"
      ],
      "duracaoMin": 40,
      "caminhadaKm": 0,
      "trocas": 1,
      "saidaPrevista": "2026-11-13T23:00:00-03:00",
      "chegadaPrevista": "2026-11-13T23:40:00-03:00",
      "geometria": "ruvnCbas{GjM~HvLrNnKbLbB~WzJzh@fJf^",
      "trechos": [
        {
          "id": "trecho_2_1",
          "ordem": 1,
          "modo": "ONIBUS",
          "linha": "Linha 000",
          "embarque": "Parada Exemplo A",
          "desembarque": "Parada Exemplo B",
          "partidaPrevista": "2026-11-13T23:00:00-03:00",
          "duracaoMin": 40,
          "distanciaKm": 1.2,
          "faixaDoDia": null,
          "geometria": "ruvnCbas{GjM~HvLrNnKbLbB~WzJzh@fJf^"
        }
      ],
      "exposicao": {
        "registros": 0,
        "kmAPe": 0,
        "registrosPorKm": null,
        "cobertura": 0.9
      },
      "categorias": {
        "furto": {
          "total": 3,
          "outros": 0,
          "carga": 0,
          "veiculo": 3
        },
        "roubo": {
          "total": 2,
          "outros": 0,
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
