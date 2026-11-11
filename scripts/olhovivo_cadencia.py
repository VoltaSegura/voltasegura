"""Mede cadência das posições da API Olho Vivo e testa o join de IDs com o GTFS.

Lê OLHO_VIVO do .env na raiz do repositório (nunca imprime o token) e usa o
routes.txt de um GTFS da SPTrans já baixado e descompactado.
Uso: python scripts/olhovivo_cadencia.py <caminho/para/routes.txt>
Duração: ~2,5 min (4 amostras de /Posicao a cada 45 s).
"""
import csv
import json
import sys
import time
import urllib.request
from pathlib import Path
from collections import Counter
from datetime import datetime
from http.cookiejar import CookieJar

BASE = "https://api.olhovivo.sptrans.com.br/v2.1"
token = next(l.split("=", 1)[1].strip().strip("\"'") for l in open(Path(__file__).resolve().parents[1] / ".env", encoding="utf-8") if l.startswith("OLHO_VIVO="))
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(CookieJar()))


def get(path):
    with opener.open(BASE + path, timeout=60) as r:
        return json.load(r)


req = urllib.request.Request(f"{BASE}/Login/Autenticar?token={token}", data=b"", method="POST")
print("login:", opener.open(req, timeout=30).read().decode())


def amostra():
    d = get("/Posicao")
    veic = {}
    for linha in d["l"]:
        for v in linha["vs"]:
            veic[v["p"]] = v["ta"]
    return d["hr"], veic


amostras = []
for i in range(4):
    hr, veic = amostra()
    amostras.append((time.time(), hr, veic))
    print(f"amostra {i}: hr={hr} veiculos={len(veic)}", flush=True)
    if i < 3:
        time.sleep(45)

for (t0, _, a), (t1, _, b) in zip(amostras, amostras[1:]):
    comuns = set(a) & set(b)
    mudou = [p for p in comuns if a[p] != b[p]]
    print(f"intervalo {t1 - t0:.0f}s: veículos comuns {len(comuns)}, com 'ta' atualizado {len(mudou) / len(comuns):.1%}")

# idade das posições na última amostra
_, hr, veic = amostras[-1]
idades = []
for ta in veic.values():
    try:
        idades.append((datetime.now().astimezone() - datetime.fromisoformat(ta.replace("Z", "+00:00"))).total_seconds())
    except ValueError:
        pass
idades.sort()
q = lambda p: idades[int(p * (len(idades) - 1))]
print(f"idade das posições (s): p10={q(.1):.0f} p50={q(.5):.0f} p90={q(.9):.0f}")
# intervalo entre atualizações por veículo (amostra 0 -> 3, ~135 s)
a, b = amostras[0][2], amostras[-1][2]
print("veículos sem nenhuma atualização em ~135 s:", f"{sum(1 for p in set(a) & set(b) if a[p] == b[p]) / len(set(a) & set(b)):.1%}")

# join de IDs: GTFS route_id = '<lt>-<tl>'?  Olho Vivo: lt (letreiro), tl (10/21...), sl (sentido), cl (código interno)
gtfs = {row["route_id"] for row in csv.DictReader(open(sys.argv[1], encoding="utf-8"))}
amostra_lt = [r for r in sorted(gtfs) if "-" in r][::60][:20]
ok, total, cl_por_lt = 0, 0, Counter()
for rid in amostra_lt:
    lt, tl = rid.rsplit("-", 1)
    res = get(f"/Linha/Buscar?termosBusca={lt}")
    match = [x for x in res if x["lt"] == lt and str(x["tl"]) == tl]
    total += 1
    ok += bool(match)
    cl_por_lt[len(match)] += 1
print(f"join GTFS route_id '<lt>-<tl>' ↔ Olho Vivo (lt, tl): {ok}/{total} encontrados; linhas Olho Vivo por route_id: {dict(cl_por_lt)}")
print("exemplo:", amostra_lt[0], get(f"/Linha/Buscar?termosBusca={amostra_lt[0].rsplit('-', 1)[0]}")[:2])
