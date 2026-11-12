"""Confere se os documentos numerados chegam aos agentes e aos espelhos."""

from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
DOCS = sorted((ROOT / "docs").glob("[0-9][0-9]_*.md"))
AGENTS = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
README = (ROOT / "README.md").read_text(encoding="utf-8")
SYNC = (ROOT / "scripts/sync_mirrors.sh").read_text(encoding="utf-8")

errors = []
if not DOCS:
    errors.append("Nenhum documento numerado encontrado em docs/.")

for doc in DOCS:
    relative = doc.relative_to(ROOT).as_posix()
    if relative not in AGENTS:
        errors.append(f"Falta em AGENTS.md: {relative}")
    if f"({relative})" not in README:
        errors.append(f"Falta link em README.md: {relative}")

if 'docs/[0-9][0-9]_*.md' not in SYNC:
    errors.append("O script de espelhos não usa o padrão esperado de documentos.")

if errors:
    print("Base de conhecimento inconsistente:")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(f"Base de conhecimento consistente: {len(DOCS)} documentos numerados.")
