import type { RespostaConsulta } from "../tipos";

export const insuficiente_cobertura: RespostaConsulta = {
  "exemplo": true,
  "caso": "INSUFICIENTE",
  "motivo": "COBERTURA",
  "rotas": [
    {
      "id": "rota_1",
      "focos": [
        "MENOR_TEMPO"
      ],
      "duracaoMin": 35,
      "caminhadaKm": 1.1,
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
          "distanciaKm": 1.1,
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
        "registros": 9,
        "kmAPe": 1.1,
        "registrosPorKm": 8.2,
        "cobertura": 0.55
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
      "id": "rota_2",
      "focos": [
        "MENOS_CAMINHADA"
      ],
      "duracaoMin": 40,
      "caminhadaKm": 0.9,
      "trocas": 1,
      "saidaPrevista": "2026-11-13T23:00:00-03:00",
      "chegadaPrevista": "2026-11-13T23:40:00-03:00",
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
          "duracaoMin": 35,
          "distanciaKm": 0.9,
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
          "partidaPrevista": "2026-11-13T23:35:00-03:00",
          "duracaoMin": 5,
          "distanciaKm": 1.2,
          "faixaDoDia": null,
          "geometria": "f~wnCzgt{GbB~WzJzh@fJf^"
        }
      ],
      "exposicao": {
        "registros": 8,
        "kmAPe": 0.9,
        "registrosPorKm": 8.9,
        "cobertura": 0.55
      },
      "categorias": {
        "furto": {
          "total": 11,
          "outros": 8,
          "carga": 0,
          "veiculo": 3
        },
        "roubo": {
          "total": 10,
          "outros": 7,
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
