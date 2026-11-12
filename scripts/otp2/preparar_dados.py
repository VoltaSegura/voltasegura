"""Baixa o GTFS da SPTrans e o OpenStreetMap do Sudeste e recorta o OSM para o municipio de Sao Paulo.

Uso (a partir da raiz do repositorio):
    python scripts/otp2/preparar_dados.py

Saidas em scripts/otp2/dados/ (pasta fora do git):
    sptrans-gtfs.zip       GTFS da SPTrans (inclui Metro e CPTM, docs/04 secao 2.1)
    sao-paulo.osm.pbf      recorte do OSM pelo retangulo do municipio
    sudeste-latest.osm.pbf arquivo original da Geofabrik (pode ser apagado depois do recorte)

Requisito: pip install -r scripts/otp2/requirements.txt
"""

from __future__ import annotations

import argparse
import sys
import time
import urllib.request
from pathlib import Path

import osmium

PASTA = Path(__file__).resolve().parent / "dados"

URL_GTFS = "https://www.sptrans.com.br/umbraco/Surface/PerfilDesenvolvedor/BaixarGTFS?memberName=sptrans"
URL_OSM = "https://download.geofabrik.de/south-america/brazil/sudeste-latest.osm.pbf"

# Retangulo que envolve o municipio de Sao Paulo (oeste, sul, leste, norte), com folga de ~1 km.
# Inclui Marsilac no extremo sul. Pega trechos de municipios vizinhos, o que nao atrapalha o roteamento.
BBOX = (-46.84, -24.02, -46.35, -23.34)


def baixar(url: str, destino: Path) -> None:
    if destino.exists():
        print(f"[ok] {destino.name} ja existe ({destino.stat().st_size / 1e6:.1f} MB), pulando download")
        return
    print(f"[..] baixando {destino.name}")
    temporario = destino.with_suffix(destino.suffix + ".parcial")
    requisicao = urllib.request.Request(url, headers={"User-Agent": "voltasegura-otp2-teste"})
    with urllib.request.urlopen(requisicao) as resposta, open(temporario, "wb") as arquivo:
        total = int(resposta.headers.get("Content-Length") or 0)
        baixado = 0
        while bloco := resposta.read(1 << 20):
            arquivo.write(bloco)
            baixado += len(bloco)
            if total:
                print(f"\r     {baixado / 1e6:7.1f} / {total / 1e6:.1f} MB", end="", flush=True)
    print()
    temporario.replace(destino)
    print(f"[ok] {destino.name} ({destino.stat().st_size / 1e6:.1f} MB)")


class RecorteRetangulo:
    """Mantem nos dentro do retangulo, vias que tocam esses nos e relacoes com algum membro mantido.

    O BackReferenceWriter completa o arquivo: acrescenta os nos de cada via mantida (mesmo fora
    do retangulo), para que nenhuma via fique cortada no meio. Padrao do cookbook do pyosmium
    "Filtering by Geometry".
    """

    def __init__(self, bbox: tuple[float, float, float, float], escritor: osmium.BackReferenceWriter):
        self.oeste, self.sul, self.leste, self.norte = bbox
        self.escritor = escritor
        self.ids = osmium.IdTracker()

    def node(self, n):
        local = n.location
        if local.valid() and self.oeste <= local.lon <= self.leste and self.sul <= local.lat <= self.norte:
            self.escritor.add_node(n)
            self.ids.add_node(n.id)

    def way(self, w):
        if self.ids.contains_any_references(w):
            self.escritor.add_way(w)
            self.ids.add_way(w.id)

    def relation(self, r):
        if self.ids.contains_any_references(r):
            self.escritor.add_relation(r)


def recortar(origem: Path, destino: Path) -> None:
    if destino.exists():
        print(f"[ok] {destino.name} ja existe, pulando recorte (apague o arquivo para refazer)")
        return
    print(f"[..] recortando {origem.name} para o retangulo {BBOX} (leva alguns minutos)")
    inicio = time.perf_counter()
    with osmium.BackReferenceWriter(str(destino), ref_src=str(origem), overwrite=True) as escritor:
        osmium.apply(str(origem), RecorteRetangulo(BBOX, escritor))
    minutos = (time.perf_counter() - inicio) / 60
    print(f"[ok] {destino.name} ({destino.stat().st_size / 1e6:.1f} MB) em {minutos:.1f} min")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--so-gtfs", action="store_true", help="baixa apenas o GTFS (ex.: atualizar o feed)")
    args = parser.parse_args()

    PASTA.mkdir(parents=True, exist_ok=True)
    baixar(URL_GTFS, PASTA / "sptrans-gtfs.zip")
    if args.so_gtfs:
        return 0
    sudeste = PASTA / "sudeste-latest.osm.pbf"
    baixar(URL_OSM, sudeste)
    recortar(sudeste, PASTA / "sao-paulo.osm.pbf")
    print("\nPronto. Proximo passo: montar o grafo (scripts/otp2/README.md, passo 4).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
