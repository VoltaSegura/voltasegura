"""Prepara pastas/ZIPs independentes de SOA e C#, sem commit, push ou acesso ao GitHub.
Uso: python scripts/preparar_entregas_backend.py [--destino output/entregas]
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import posixpath
import re
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
EXCLUIR = {"bin", "obj", "dados", ".venv", "__pycache__", "TestResults", ".git"}

def copiar_arvore(origem: Path, destino: Path):
    for caminho in origem.rglob("*"):
        relativo = caminho.relative_to(origem)
        if set(relativo.parts) & EXCLUIR or caminho.is_symlink(): continue
        if not caminho.is_file() or caminho.name.startswith(".env") or caminho.suffix in {".db", ".parquet", ".pyc", ".user"}: continue
        alvo = destino / relativo
        alvo.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(caminho, alvo)

def readme_raiz(disciplina: str):
    geral = (ROOT / "README.md").read_text(encoding="utf-8-sig")
    ficha = geral[geral.index("## Ficha da CitizenTech"):].split("\n---", 1)[0]
    original = (ROOT / "src" / disciplina / "README.md").read_text(encoding="utf-8-sig")
    def ajustar(m):
        url = m.group(2)
        if re.match(r"(?:[a-z]+:|/|#)", url): return m.group(0)
        return m.group(1) + posixpath.normpath(f"src/{disciplina}/{url}") + ")"
    original = re.sub(r"(!?\[[^\]]*\]\()([^\s)]+)\)", ajustar, original)
    return f"# VoltaSegura — entrega {disciplina}\n\n{ficha}\n\n---\n\n{original}"

def preparar(destino: Path):
    destino = destino.resolve()
    # Sem limpeza recursiva: se já existir, escolher outro destino evita apagar trabalho.
    destino.mkdir(parents=True, exist_ok=True)
    saidas = []
    for disciplina in ("soa-backend", "csharp-backend"):
        pacote = destino / disciplina
        if pacote.exists(): raise FileExistsError(f"{pacote} já existe. Escolha outro --destino.")
        pacote.mkdir()
        for pasta in ("soa-backend", "csharp-backend"):
            copiar_arvore(ROOT / "src" / pasta, pacote / "src" / pasta)
        (pacote / "docs").mkdir()
        for doc in (ROOT / "docs").glob("[0-9][0-9]_*.md"):
            shutil.copy2(doc, pacote / "docs" / doc.name)
        for nome in ("prompts.md", ".gitignore"):
            shutil.copy2(ROOT / nome, pacote / nome)
        (pacote / "README.md").write_text(readme_raiz(disciplina), encoding="utf-8")
        arquivos = sorted(p for p in pacote.rglob("*") if p.is_file())
        manifesto = {p.relative_to(pacote).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in arquivos}
        (pacote / "manifesto-arquivos.json").write_text(json.dumps(manifesto, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        zip_path = destino / f"{disciplina}.zip"
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
            for p in sorted(pacote.rglob("*")):
                if p.is_file(): z.write(p, p.relative_to(destino))
        saidas.append(str(zip_path))
    print("Pacotes preparados sem publicar:\n" + "\n".join(saidas))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--destino", type=Path, default=ROOT / "output" / "entregas")
    preparar(parser.parse_args().destino)
