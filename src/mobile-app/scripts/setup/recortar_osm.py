"""Recorta o OSM do Sudeste para o retângulo do município de São Paulo (chamado pelo otp2.mjs).

Mesma lógica de scripts/otp2/preparar_dados.py no monorepo; copiada aqui porque o espelho de
entrega do app só recebe src/mobile-app/. Se mudar o recorte, mude nos dois.

Uso: python recortar_osm.py <sudeste-latest.osm.pbf> <sao-paulo.osm.pbf>
"""

from __future__ import annotations

import sys
import time

import osmium

# Retângulo que envolve o município de São Paulo (oeste, sul, leste, norte), com folga de ~1 km.
BBOX = (-46.84, -24.02, -46.35, -23.34)


class RecorteRetangulo:
    """Mantém nós dentro do retângulo, vias que tocam esses nós e relações com algum membro mantido."""

    def __init__(self, escritor: osmium.BackReferenceWriter):
        self.oeste, self.sul, self.leste, self.norte = BBOX
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


def main() -> int:
    origem, destino = sys.argv[1], sys.argv[2]
    inicio = time.perf_counter()
    with osmium.BackReferenceWriter(destino, ref_src=origem, overwrite=True) as escritor:
        osmium.apply(origem, RecorteRetangulo(escritor))
    print(f"  [ok] recorte pronto em {(time.perf_counter() - inicio) / 60:.1f} min")
    return 0


if __name__ == "__main__":
    sys.exit(main())
