"""carga_ocorrencias.py — ETL de carga do recorte SSP-SP no banco do backend (SQLite).

Fonte: <raiz>/utils/ssp/SPDadosCriminais_2026.xlsx (dados REAIS e públicos, CC-BY-4.0,
SSP-SP/CKAN estadual — ver src/ml/dados/README.md). Nunca dados simulados.

Recorte acordado pelo grupo (docs/07 e docs/08, decisões de 11/11/2026):
  - Município: capital (S.PAULO);
  - Período do MVP: jan–set/2026 (12 meses completos virão após o MVP, com aviso);
  - NATUREZA_APURADA dos grupos da tela principal (docs/07, valores literais):
    Furto (OUTROS, carga, veículo), Roubo (OUTROS, carga, veículo, latrocínio) e
    trânsito (lesão corporal culposa por acidente). Somente FURTO - OUTROS e
    ROUBO - OUTROS entram na comparação de trajetos (docs/08 §3). Homicídio,
    tentativa e violência sexual ficam FORA (panorama municipal, sem ligação a rota).
  - N = boletins distintos: NUM_BO + ANO_BO + NOME_DELEGACIA (docs/08 §59); um
    boletim com mais de uma natureza do recorte fica com a de maior prioridade.
  - Faixa do dia: da HORA_OCORRENCIA_BO quando existe; caso contrário de
    DESC_PERIODO (os dois coincidem em 100% das linhas com ambos — auditoria §4).
    "Em hora incerta" e vazio em ambos → NULL (não fabricar faixa — docs/08 §16).
  - Coordenadas como publicadas; sem coordenada → NULL (nunca entra em corredor).
  - NOME_DELEGACIA_CIRCUNSCRICAO carregada para a checagem de cobertura (docs/08 §64).

Banco: dados/voltasegura.db (schema gerado pelo EF Core — migração MigracaoInicial).
O ETL NÃO cria schema: rode antes `dotnet ef database update --project VoltaSegura.Infrastructure
--startup-project VoltaSegura.Api`. A carga usa INSERT OR IGNORE: o índice único
(NUM_BO, ANO_BO, delegacia) garante 1 registro por boletim distinto.

Uso:
  uv run --with pandas,openpyxl,python-calamine,pyarrow python scripts/carga_ocorrencias.py [--force]
  (--force: trunca a tabela e regera o cache do recorte; sem --force e sem cache
   do recorte, lê o xlsx uma vez e guarda o recorte em dados/cache_recorte_ssp.parquet)
"""

from __future__ import annotations

import sqlite3
import sys
import time
from datetime import date
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parents[3]
XLSX = RAIZ / "utils" / "ssp" / "SPDadosCriminais_2026.xlsx"
DB = RAIZ / "src" / "csharp-backend" / "dados" / "voltasegura.db"
# Cache do recorte (parquet) — evita reler o xlsx de 140 MB a cada tentativa.
CACHE = RAIZ / "src" / "csharp-backend" / "dados" / "cache_recorte_ssp.parquet"

# Campos da base SPDadosCriminais usados na carga (33 no total; o resto não entra).
# docs/08 (decisão 11/11/2026): recorte por NATUREZA_APURADA (não por RUBRICA),
# faixa do dia derivada da HORA_OCORRENCIA_BO (com fallback DESC_PERIODO) e
# NOME_DELEGACIA_CIRCUNSCRICAO para a checagem de cobertura (docs/08 §64).
COLUNAS = [
    "NOME_MUNICIPIO",
    "NUM_BO",
    "ANO_BO",
    "NOME_DELEGACIA",
    "NOME_DELEGACIA_CIRCUNSCRICAO",
    "NATUREZA_APURADA",
    "RUBRICA",
    "DESCR_TIPOLOCAL",
    "BAIRRO",
    "DATA_OCORRENCIA_BO",
    "HORA_OCORRENCIA_BO",
    "DESC_PERIODO",
    "LATITUDE",
    "LONGITUDE",
]

MUNICIPIO_CAPITAL = "S.PAULO"
PERIODO_INI = date(2026, 1, 1)
PERIODO_FIM = date(2026, 9, 30)

# Mapeamento de faixas (item 12: os 4 períodos da SSP, como publicados).
FAIXAS_SSP = {
    "de madrugada": 1,  # FaixaDoDia.Madrugada
    "pela manhã": 2,  # FaixaDoDia.Manha
    "a tarde": 3,  # FaixaDoDia.Tarde
    "a noite": 4,  # FaixaDoDia.Noite
    # "em hora incerta" e vazio → NULL (nunca fabricar faixa)
}

# Recorte por NATUREZA_APURADA (docs/07 — valores literais; docs/08 §3): grupos
# Furto, Roubo e Trânsito do app. Somente FURTO - OUTROS e ROUBO - OUTROS entram
# na comparação de trajetos; carga, veículo, latrocínio e trânsito são contexto.
# A prioridade define qual linha fica quando um mesmo boletim tem mais de uma
# natureza do recorte (ex.: os 42 BOs com furto e roubo — docs/08 §59).
NATUREZAS_RECORTE = {
    "ROUBO - OUTROS": 0,
    "FURTO - OUTROS": 1,
    "ROUBO DE CARGA": 2,
    "ROUBO DE VEÍCULO": 3,
    "LATROCÍNIO": 4,
    "FURTO DE CARGA": 5,
    "FURTO DE VEÍCULO": 6,
    "LESÃO CORPORAL CULPOSA POR ACIDENTE DE TRÂNSITO": 7,
}


def ler_base() -> pd.DataFrame:
    """Lê as duas abas semestrais do xlsx bruto com as colunas do recorte."""
    partes = []
    for aba in ("JAN-JUN_2026", "JUL-DEZ_2026"):
        df = pd.read_excel(XLSX, sheet_name=aba, engine="calamine", usecols=COLUNAS)
        df.columns = [str(c).strip() for c in df.columns]
        faltando = [c for c in COLUNAS if c not in df.columns]
        if faltando:
            raise ValueError(f"colunas ausentes na aba {aba}: {faltando}")
        partes.append(df)
        print(f"  aba {aba}: {len(df):,} linhas lidas")
    return pd.concat(partes, ignore_index=True)


def recortar(df: pd.DataFrame) -> pd.DataFrame:
    """Filtra capital + período + naturezas do recorte; normaliza tipos e deduplica."""
    df = df[df["NOME_MUNICIPIO"] == MUNICIPIO_CAPITAL].copy()
    df["DATA_OCORRENCIA_BO"] = pd.to_datetime(df["DATA_OCORRENCIA_BO"], errors="coerce")
    df = df[
        (df["DATA_OCORRENCIA_BO"] >= pd.Timestamp(PERIODO_INI))
        & (df["DATA_OCORRENCIA_BO"] <= pd.Timestamp(PERIODO_FIM))
    ].copy()

    # Recorte por NATUREZA_APURADA (docs/07: valores literais, sem aproximação textual).
    natureza = df["NATUREZA_APURADA"].astype("string").str.strip()
    df["__prio"] = natureza.map(NATUREZAS_RECORTE).astype("Int64")
    df["__natureza"] = natureza
    df = df[df["__prio"].notna()].copy()

    # Deduplicação por boletim distinto (docs/08 §59): uma linha por boletim, ficando
    # a natureza de maior prioridade (ROUBO - OUTROS > FURTO - OUTROS > contexto).
    df = df.sort_values(["__prio"]).drop_duplicates(
        subset=["NUM_BO", "ANO_BO", "NOME_DELEGACIA"], keep="first"
    )

    # Coordenadas como publicadas (docs/08 §61): '-' e vazios viram NULL; sem filtro.
    for col in ("LATITUDE", "LONGITUDE"):
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Faixa do dia (docs/08 §16): da HORA_OCORRENCIA_BO quando existe; caso contrário
    # de DESC_PERIODO. Os dois coincidem em 100% das 16.077 linhas com ambos (auditoria).
    # "Em hora incerta" e vazio em ambos → NULL (nunca fabricar faixa).
    hora_txt = df["HORA_OCORRENCIA_BO"].astype("string").str.strip()
    hora = pd.to_datetime(hora_txt, format="%H:%M:%S", errors="coerce").fillna(
        pd.to_datetime(hora_txt, format="%H:%M", errors="coerce")
    )
    faixa_pela_hora = pd.cut(
        hora.dt.hour,
        bins=[-1, 5, 11, 17, 23],
        labels=[1, 2, 3, 4],
        ordered=True,
    ).astype("Int64")

    periodo = df["DESC_PERIODO"].astype("string").str.lower().str.strip()
    faixa_pelo_periodo = periodo.map(FAIXAS_SSP).astype("Int64")

    df["__faixa"] = faixa_pela_hora.fillna(faixa_pelo_periodo)

    df["DATA_OCORRENCIA_BO"] = df["DATA_OCORRENCIA_BO"].dt.strftime("%Y-%m-%d")
    df["NUM_BO"] = df["NUM_BO"].astype("string").str.strip().fillna("")
    df["ANO_BO"] = df["ANO_BO"].astype("string").str.strip().fillna("")
    df["NOME_DELEGACIA"] = df["NOME_DELEGACIA"].astype("string").str.strip().fillna("")
    df["NOME_DELEGACIA_CIRCUNSCRICAO"] = (
        df["NOME_DELEGACIA_CIRCUNSCRICAO"].astype("string").str.strip().fillna("")
    )
    for col in ("RUBRICA", "DESCR_TIPOLOCAL", "BAIRRO"):
        df[col] = df[col].astype("string").str.strip().fillna("")
    return df


def carregar(df: pd.DataFrame, db: Path, truncate: bool = False) -> int:
    """Insere no SQLite (tabela do EF) com INSERT OR IGNORE; retorna linhas gravadas."""
    con = sqlite3.connect(db)
    try:
        if truncate:
            apagadas = con.execute("SELECT COUNT(*) FROM ocorrencias").fetchone()[0]
            con.execute("DELETE FROM ocorrencias")
            con.commit()
            print(f"      [truncate] {apagadas:,} linhas antigas removidas")
        sql = (
            "INSERT OR IGNORE INTO ocorrencias "
            "(NumeroBo, AnoBo, Delegacia, Circunscricao, Natureza, Rubrica, TipoLocal, "
            " Bairro, Municipio, DataOcorrencia, Faixa, Latitude, Longitude) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'S.PAULO', ?, ?, ?, ?)"
        )
        linhas = [
            (
                r["NUM_BO"],
                r["ANO_BO"],
                r["NOME_DELEGACIA"],
                r["NOME_DELEGACIA_CIRCUNSCRICAO"],
                r["__natureza"],
                r["RUBRICA"],
                r["DESCR_TIPOLOCAL"],
                r["BAIRRO"],
                r["DATA_OCORRENCIA_BO"],
                int(r["__faixa"]) if pd.notna(r["__faixa"]) else None,
                float(r["LATITUDE"]) if pd.notna(r["LATITUDE"]) else None,
                float(r["LONGITUDE"]) if pd.notna(r["LONGITUDE"]) else None,
            )
            for r in df.to_dict("records")
        ]
        antes = con.total_changes
        con.executemany(sql, linhas)
        con.commit()
        return con.total_changes - antes
    finally:
        con.close()


def main() -> None:
    force = "--force" in sys.argv

    print(f"[fonte] {XLSX}")
    if not XLSX.exists() and not CACHE.exists():
        raise FileNotFoundError(
            f"{XLSX} não encontrado — baixe em https://www.ssp.sp.gov.br/estatistica/consultas "
            "(instruções em src/ml/dados/README.md)."
        )

    inicio = time.time()

    # O SCHEMA é responsabilidade do EF Core: rode antes
    #   dotnet ef database update --project VoltaSegura.Infrastructure --startup-project VoltaSegura.Api
    if not DB.exists():
        raise FileNotFoundError(
            f"{DB} não existe — crie o schema com `dotnet ef database update` "
            "(projeto Infrastructure, startup Api) antes da carga."
        )
    con_check = sqlite3.connect(DB)
    existe = con_check.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='ocorrencias'"
    ).fetchone()
    con_check.close()
    if not existe:
        raise RuntimeError(
            "tabela 'ocorrencias' inexistente — aplique as migrações com "
            "`dotnet ef database update` antes da carga."
        )

    if force and CACHE.exists():
        CACHE.unlink()
        print("[limpeza] cache do recorte removido")

    if CACHE.exists():
        print(f"[cache] lendo recorte de {CACHE.name}...")
        recorte = pd.read_parquet(CACHE)
    else:
        print("[1/3] lendo xlsx bruto (duas abas semestrais)...")
        base = ler_base()
        print(f"      total estado: {len(base):,} linhas")
        print(
            "[2/3] aplicando recorte (capital, jan-set/2026, NATUREZA_APURADA do recorte)..."
        )
        recorte = recortar(base)
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        recorte.to_parquet(CACHE)
        print(f"      recorte salvo em cache: {CACHE.name}")

    por_natureza = recorte["__natureza"].value_counts().to_dict()
    sem_faixa = int(recorte["__faixa"].isna().sum())
    sem_coords = int(recorte["LATITUDE"].isna().sum())
    print(f"      recorte: {len(recorte):,} boletins distintos")
    print(f"      naturezas: {por_natureza}")
    print(f"      sem faixa (NULL): {sem_faixa:,} | sem coordenadas: {sem_coords:,}")

    print("[3/3] gravando no SQLite...")
    gravadas = carregar(recorte, DB, truncate=force)
    print(f"      {gravadas:,} linhas gravadas em {DB.name}")

    print(f"[ok] concluído em {time.time() - inicio:.0f}s")
    print(
        "[registro] fonte, recorte e contagens acima devem constar no README de entrega"
    )


if __name__ == "__main__":
    main()
