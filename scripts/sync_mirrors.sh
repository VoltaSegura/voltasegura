#!/usr/bin/env bash
# =============================================================================
# sync_mirrors.sh — sincroniza o monorepo VoltaSegura com os repos de entrega
#
# Uso:
#   bash scripts/sync_mirrors.sh              # sincroniza todas as disciplinas
#   bash scripts/sync_mirrors.sh ml qa        # sincroniza só os indicados
#   DRY_RUN=1 bash scripts/sync_mirrors.sh    # mostra o que mudaria, nada commita
#   MIRRORS_DIR=~/espelhos bash scripts/sync_mirrors.sh   # cache alternativo
#
# O que é sincronizado por espelho:
#   - docs numerados em docs/        (base de conhecimento, igual ao monorepo)
#   - .gitignore                       (idem)
#   - src/<disciplina>/                (conteúdo exato do monorepo, com --delete)
#   - README.md                        (regenerado: Ficha + README da disciplina)
#
# O que NÃO é sincronizado (varia por repo, mantido localmente em cada espelho):
#   - AGENTS.md (prompts.md passa a acompanhar a entrega)
#
# Fonte da verdade é sempre o monorepo. Alteração manual direta no espelho
# será sobrescrita aqui.
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIRRORS_DIR="${MIRRORS_DIR:-/tmp/opencode/mirrors}"
ORG=VoltaSegura
DRY_RUN="${DRY_RUN:-0}"
PUSH="${PUSH:-1}" # PUSH=0 prepara/commita, sem publicar
PYTHON="${PYTHON:-python}"

GIT_PROTOCOL="${GIT_PROTOCOL:-ssh}"   # ssh | https

declare -A DISCIPLINAS=(
  ["soa-backend"]="Arquitetura Orientada a Serviços (SOA) e Web Services"
  ["csharp-backend"]="C# Software Development"
  ["ml"]="Inteligência Artificial & Machine Learning"
  ["mobile-app"]="Mobile Development & IoT"
  ["os-infra"]="Operating Systems"
  ["physical-computing"]="Physical Computing: IoT & IOB"
  ["qa"]="Testing, Compliance & Quality Assurance"
  ["cybersecurity"]="Cybersecurity"
)

selecionados=("$@")
((${#selecionados[@]})) || selecionados=("${!DISCIPLINAS[@]}")

repo_url() { # $1 = repo
  if [ "$GIT_PROTOCOL" = "https" ]; then
    echo "https://github.com/$ORG/$1"
  else
    echo "git@github.com:$ORG/$1.git"
  fi
}

clone_or_update() { # $1 = repo
  local repo="$1" mirror="$MIRRORS_DIR/$1"
  if [ -d "$mirror/.git" ]; then
    git -C "$mirror" fetch origin >/dev/null
    git -C "$mirror" pull --ff-only origin main >/dev/null
  else
    mkdir -p "$MIRRORS_DIR"
    git clone -b main "$(repo_url "$repo")" "$mirror" >/dev/null
  fi
  # identidade de commit local (evita erro de "user.name/email" em máquina nova)
  if [ -z "$(git -C "$mirror" config user.name || true)" ]; then
    git -C "$mirror" config user.name "Equipe VoltaSegura"
    git -C "$mirror" config user.email "Asteriuz@users.noreply.github.com"
  fi
  echo "$mirror"
}

regenerate_readme() { # $1 = mirror, $2 = dir, $3 = repo
  if [ "$2" = "soa-backend" ] || [ "$2" = "csharp-backend" ]; then
    "$PYTHON" -c 'import sys; from pathlib import Path; sys.path.insert(0, sys.argv[1]); from preparar_entregas_backend import readme_raiz; Path(sys.argv[3]).write_text(readme_raiz(sys.argv[2]), encoding="utf-8")' "$ROOT/scripts" "$2" "$1/README.md"
    return
  fi
  if [ "$2" = "mobile-app" ]; then
    sed -e 's#(../../docs/#(./docs/#g' -e 's#(./ARQUITETURA.md)#(./src/mobile-app/ARQUITETURA.md)#g' -e 's#(./todo-mobile.md)#(./src/mobile-app/todo-mobile.md)#g' -e 's#(../../prompts.md)#(./prompts.md)#g' "$ROOT/src/$2/README.md" > "$1/README.md"
    return
  fi
  cat > "$1/README.md" <<EOF
# $3 — entrega da disciplina ${DISCIPLINAS[$2]} (VoltaSegura)

> 🗂 **Ficha da CitizenTech** — resumo do produto **VoltaSegura** (ex-"CitizenTech"; renomeado em 10/11/2026):
> cidade São Paulo; cidadão = estudante universitário do período noturno;
> problema = falta de visão integrada das condições urbanas que influenciam a percepção de segurança no deslocamento;
> como funciona = comparação de alternativas de ida/volta com exposição estimada e confiança dos dados;
> ODS = 11 e 10. Ficha completa: monorepo **https://github.com/$ORG/voltasegura**.
> ⚠️ O produto não garante segurança e não classifica bairros — comunicar apenas exposição estimada e confiança dos dados (ver docs/05_regras_linguagem_etica.md).

**Monorepo central (fonte da verdade)**: https://github.com/$ORG/voltasegura

EOF
  cat "$ROOT/src/$2/README.md" >> "$1/README.md"
}

sync_mirror() { # $1 = dir
  local dir="$1" repo="$dir" mirror
  mirror=$(clone_or_update "$repo")

  # docs + .gitignore
  mkdir -p "$mirror/docs"
  rsync -a --checksum "$ROOT"/docs/[0-9][0-9]_*.md "$mirror/docs/"
  rsync -a --checksum "$ROOT/.gitignore" "$mirror/.gitignore"
  rsync -a --checksum "$ROOT/prompts.md" "$mirror/prompts.md"

  # código da disciplina (réplica exata)
  mkdir -p "$mirror/src"
  if [ "$dir" = "soa-backend" ] || [ "$dir" = "csharp-backend" ]; then
    for componente in soa-backend csharp-backend; do
      mkdir -p "$mirror/src/$componente"
      rsync -a --delete --exclude=bin/ --exclude=obj/ --exclude=dados/ --exclude=.venv/ --exclude=__pycache__/ --exclude=TestResults/ --exclude='.env*' "$ROOT/src/$componente/" "$mirror/src/$componente/"
    done
  else
    rsync -a --delete "$ROOT/src/$dir/" "$mirror/src/$dir/"
  fi

  # README raiz regenerado
  regenerate_readme "$mirror" "$dir" "$repo"

  # resumo do commit do monorepo para rastreabilidade
  local sha; sha=$(git -C "$ROOT" rev-parse --short HEAD)

  if git -C "$mirror" status --porcelain | grep -q .; then
    if [ "$DRY_RUN" = "1" ]; then
      echo "[dry-run] $repo teria sync:"
      git -C "$mirror" status --porcelain | sed 's/^/    /'
    else
      git -C "$mirror" add -A
      git -C "$mirror" commit -q -m "chore: sync do monorepo ($sha) — $dir"
      if [ "$PUSH" = "1" ]; then
        git -C "$mirror" push -q origin main
        echo "[sync]   $repo publicado (monorepo $sha)"
      else
        echo "[local]  $repo preparado; push pendente"
      fi
    fi
  else
    echo "[ok]     $repo já sincronizado"
  fi
}

for dir in "${selecionados[@]}"; do
  if [ -z "${DISCIPLINAS[$dir]:-}" ]; then
    echo "REPO DESCONHECIDO '$dir' — aceitos: ${!DISCIPLINAS[*]}" >&2
    exit 1
  fi
  sync_mirror "$dir"
done
