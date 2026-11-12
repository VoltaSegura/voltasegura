"""Consulta o OTP2 local e extrai a geometria dos trechos a pe de cada alternativa.

Uso (com o servidor do OTP2 rodando em localhost:8080):
    python scripts/otp2/consultar_teste.py                 # todos os trajetos de pontos.local.json
    python scripts/otp2/consultar_teste.py teste1_volta    # so um trajeto
    python scripts/otp2/consultar_teste.py --data 2026-11-12 --alternativas 5

Entrada: scripts/otp2/pontos.local.json (copiar de pontos.exemplo.json; fica fora do git).
Saidas em scripts/otp2/dados/saida/ (fora do git, pois tem coordenadas perto de casa e do trabalho):
    <trajeto>.resposta.json   resposta completa do OTP2
    <trajeto>.trechos_a_pe.geojson   uma linha por trecho a pe, com alternativa, distancia,
                                     horarios e periodo da SSP (docs/08: madrugada 0-5h,
                                     manha 6-11h, tarde 12-17h, noite 18-23h)

So usa a biblioteca padrao do Python.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

PASTA = Path(__file__).resolve().parent
PONTOS = PASTA / "pontos.local.json"
SAIDA = PASTA / "dados" / "saida"
URL_OTP = "http://localhost:8080/otp/gtfs/v1"
FUSO_SP = "-03:00"  # Sao Paulo sem horario de verao

CONSULTA = """
query ($origem: PlanCoordinateInput!, $destino: PlanCoordinateInput!, $saida: OffsetDateTime!, $n: Int) {
  planConnection(
    origin: { location: { coordinate: $origem } }
    destination: { location: { coordinate: $destino } }
    dateTime: { earliestDeparture: $saida }
    first: $n
  ) {
    edges {
      node {
        start
        end
        duration
        walkDistance
        numberOfTransfers
        legs {
          mode
          distance
          duration
          start { scheduledTime }
          end { scheduledTime }
          from { name }
          to { name }
          route { shortName longName }
          legGeometry { points }
        }
      }
    }
  }
}
"""


def decodificar_polyline(texto: str) -> list[list[float]]:
    """Decodifica o formato 'encoded polyline' (precisao 5) usado pelo OTP. Devolve [lon, lat]."""
    coordenadas, indice, lat, lon = [], 0, 0, 0
    while indice < len(texto):
        valores = []
        for _ in range(2):
            resultado, deslocamento = 0, 0
            while True:
                byte = ord(texto[indice]) - 63
                indice += 1
                resultado |= (byte & 0x1F) << deslocamento
                deslocamento += 5
                if byte < 0x20:
                    break
            valores.append(~(resultado >> 1) if resultado & 1 else resultado >> 1)
        lat += valores[0]
        lon += valores[1]
        coordenadas.append([lon / 1e5, lat / 1e5])
    return coordenadas


def periodo_ssp(horario: str) -> str:
    hora = dt.datetime.fromisoformat(horario).hour
    if hora < 6:
        return "madrugada"
    if hora < 12:
        return "manha"
    if hora < 18:
        return "tarde"
    return "noite"


def proximo_dia_util(hoje: dt.date) -> dt.date:
    dia = hoje + dt.timedelta(days=1)
    while dia.weekday() >= 5:
        dia += dt.timedelta(days=1)
    return dia


def consultar(origem, destino, saida: str, n: int) -> dict:
    corpo = json.dumps({
        "query": CONSULTA,
        "variables": {
            "origem": {"latitude": origem[0], "longitude": origem[1]},
            "destino": {"latitude": destino[0], "longitude": destino[1]},
            "saida": saida,
            "n": n,
        },
    }).encode()
    requisicao = urllib.request.Request(URL_OTP, data=corpo, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(requisicao, timeout=120) as resposta:
        return json.load(resposta)


def hora_curta(horario: str) -> str:
    return dt.datetime.fromisoformat(horario).strftime("%H:%M")


def processar(nome: str, trajeto: dict, data: dt.date, n: int) -> None:
    if None in trajeto["origem"] + trajeto["destino"]:
        print(f"[!!] {nome}: preencha origem e destino em {PONTOS.name}")
        return
    saida = f"{data.isoformat()}T{trajeto['hora']}{FUSO_SP}"
    print(f"\n=== {nome}: {trajeto.get('descricao', '')} | saida {saida}")
    resposta = consultar(trajeto["origem"], trajeto["destino"], saida, n)
    SAIDA.mkdir(parents=True, exist_ok=True)
    (SAIDA / f"{nome}.resposta.json").write_text(json.dumps(resposta, ensure_ascii=False, indent=2), encoding="utf-8")

    if resposta.get("errors"):
        print(json.dumps(resposta["errors"], ensure_ascii=False, indent=2))
        return
    alternativas = resposta["data"]["planConnection"]["edges"]
    if not alternativas:
        print("     nenhuma alternativa devolvida (confira coordenadas, data e se o GTFS cobre essa data)")
        return

    feicoes = []
    for i, aresta in enumerate(alternativas, start=1):
        it = aresta["node"]
        print(f"  Alternativa {i}: {hora_curta(it['start'])} -> {hora_curta(it['end'])}, "
              f"{it['duration'] / 60:.0f} min, {it['walkDistance']:.0f} m a pe, {it['numberOfTransfers']} baldeacao(oes)")
        for j, perna in enumerate(it["legs"], start=1):
            inicio, fim = perna["start"]["scheduledTime"], perna["end"]["scheduledTime"]
            linha = perna["route"]["shortName"] if perna.get("route") else ""
            print(f"    {j}. {perna['mode']:<7} {linha:<10} {perna['distance']:7.0f} m  "
                  f"{hora_curta(inicio)}-{hora_curta(fim)}  {perna['from']['name']} -> {perna['to']['name']}")
            if perna["mode"] != "WALK" or not perna.get("legGeometry"):
                continue
            p_inicio, p_fim = periodo_ssp(inicio), periodo_ssp(fim)
            feicoes.append({
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": decodificar_polyline(perna["legGeometry"]["points"])},
                "properties": {
                    "trajeto": nome,
                    "alternativa": i,
                    "trecho": j,
                    "distancia_m": round(perna["distance"], 1),
                    "inicio": inicio,
                    "fim": fim,
                    "periodo_ssp": p_inicio if p_inicio == p_fim else f"{p_inicio}/{p_fim}",
                },
            })
    geojson = {"type": "FeatureCollection", "features": feicoes}
    destino = SAIDA / f"{nome}.trechos_a_pe.geojson"
    destino.write_text(json.dumps(geojson, ensure_ascii=False), encoding="utf-8")
    print(f"  [ok] {len(feicoes)} trechos a pe salvos em {destino.relative_to(PASTA)}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("trajetos", nargs="*", help="nomes em pontos.local.json (padrao: todos)")
    parser.add_argument("--data", type=dt.date.fromisoformat, default=proximo_dia_util(dt.date.today()),
                        help="data da viagem AAAA-MM-DD (padrao: proximo dia util)")
    parser.add_argument("--alternativas", type=int, default=3, help="quantas alternativas pedir (padrao: 3)")
    args = parser.parse_args()

    if not PONTOS.exists():
        print(f"Crie {PONTOS} a partir de pontos.exemplo.json.")
        return 1
    pontos = {k: v for k, v in json.loads(PONTOS.read_text(encoding="utf-8")).items() if not k.startswith("_")}
    nomes = args.trajetos or list(pontos)
    try:
        for nome in nomes:
            processar(nome, pontos[nome], args.data, args.alternativas)
    except urllib.error.URLError as erro:
        print(f"Nao consegui falar com o OTP2 em {URL_OTP}: {erro}. O servidor esta rodando? (README, passo 5)")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
