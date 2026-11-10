#!/usr/bin/env bash
# =============================================================================
# olhovivo_check.sh — verifica a API Olho Vivo (SPTrans) com o token do .env
#
# Uso:
#   bash scripts/olhovivo_check.sh [codigoLinha]
#
# - Lê OLHO_VIVO do arquivo .env (NUNCA mostra o token nem o commita)
# - Autentica (POST /Login/Autenticar — precisa de Content-Length: enviar
#   body vazio, senão a API responde HTTP 411) e guarba o cookie de sessão
# - Testa /Linha/Buscar, /Corredor e /Posicao/Linha
# Combinações de hiperparâmetros NÃO se aplicam aqui: é script de smoke test,
# não de ML.
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/.env"
BASE="https://api.olhovivo.sptrans.com.br/v2.1"
COOKIES="$(mktemp)"
trap 'rm -f "$COOKIES"' EXIT

LINHA="${1:-}"

[ -f "$ENV_FILE" ] || { echo "ERRO: .env não encontrado em $ENV_FILE (copie de .env.example)" >&2; exit 1; }
TOKEN=$(grep '^OLHO_VIVO=' "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
[ -n "$TOKEN" ] || { echo "ERRO: OLHO_VIVO ausente no .env" >&2; exit 1; }

echo "== 1) Login/Autenticar =="
body=$(curl -sS -X POST "$BASE/Login/Autenticar?token=$TOKEN" -d "" \
  -c "$COOKIES" -o /dev/null -w '%{http_code}' --max-time 30)
[ "$body" = "200" ] || { echo "ERRO: login retornou HTTP $body" >&2; exit 1; }
echo "OK (HTTP 200, cookie de sessão gravado)"

echo ""
echo "== 2) /Linha/Buscar?termosBusca=8000 =="
curl -sS "$BASE/Linha/Buscar?termosBusca=8000" -b "$COOKIES" --max-time 30 |
  python3 -c "import json,sys; d=json.load(sys.stdin); print(f'OK — {len(d)} variantes da linha 8000')"

echo ""
echo "== 3) /Corredor =="
curl -sS "$BASE/Corredor" -b "$COOKIES" --max-time 30 |
  python3 -c "import json,sys; d=json.load(sys.stdin); print(f'OK — {len(d)} corredores'); [print('  -', c['nc']) for c in d]"

if [ -n "$LINHA" ]; then
  echo ""
  echo "== 4) /Posicao/Linha?codigoLinha=$LINHA =="
  curl -sS "$BASE/Posicao/Linha?codigoLinha=$LINHA" -b "$COOKIES" --max-time 30 |
    python3 -c "
import json, sys
d = json.load(sys.stdin)
vs = d.get('vs', [])
print(f\"linha {d.get('cl', '?')} — horário {d.get('hr', '?')} — {len(vs)} veículo(s) no sentido\")
for v in vs[:3]:
    print(f\"  prefixo {v['p']} acessível={v['a']} lat={v['py']} lon={v['px']}\")
"
else
  echo ""
  echo "Dica: passe um codigoLinha para testar a posição de uma linha:"
  echo "  bash scripts/olhovivo_check.sh 2506   # linha 8000 (var. da manhã)"
  echo "  (vs vazio fora do horário de operação da linha é comportamento normal)"
fi
