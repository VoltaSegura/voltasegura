"""etl.py — preparação dos datasets reais para o notebook de ML do VoltaSegura.

Fontes (requisito da disciplina: dados REAIS e públicos, documentados em
`dados/README.md` — nunca simulados):

  1. SSP-SP — "SPDadosCriminais" (base criminal por BO, semestres de 2026)
     Origem: https://www.ssp.sp.gov.br/estatistica/consultas
     Local:  <raiz>/utils/ssp/SPDadosCriminais_2026.xlsx
  2. Infosiga SP — sinistros de trânsito (2015–2026)
     Origem: https://infosiga.detran.sp.gov.br/ → Dados Abertos
     Local:  <raiz>/utils/infosiga/dados_infosiga.zip

Produtos (parquet em cache local, fora do git — ver .gitignore):
  src/ml/dados/cache/infosiga_sinistros_sp.parquet  — sinistros da capital (IBGE 3550308)
  src/ml/dados/cache/ssp_bos_2026.parquet           — BOs de todo o estado (recorte de colunas)

Uso:
  uv run --with pandas,openpyxl,pyarrow python etl.py            # ambos
  uv run --with pandas,openpyxl,pyarrow python etl.py ssp        # só SSP
  uv run --with pandas,openpyxl,pyarrow python etl.py infosiga   # só Infosiga

O notebook chama `build_cache()` se o cache não existir.
"""

from __future__ import annotations

import io
import os
import zipfile
from pathlib import Path

import pandas as pd

# --- localização das bases ---------------------------------------------------
# O notebook vive em src/ml/; os brutos ficam em utils/ na raiz do monorepo.
# No repo de entrega (espelho), quem clonar baixa os brutos conforme
# `src/ml/dados/README.md` e roda este script — ou define VOLTASEGURA_DATA.


def data_root() -> Path:
    if env := os.environ.get("VOLTASEGURA_DATA"):
        return Path(env)
    here = Path(__file__).resolve().parent
    for root in (here.parent.parent, here.parent):
        if (root / "utils").is_dir():
            return root
    return here.parent.parent


def locate(raw: str, data_dir: Path | None = None) -> Path:
    """Localiza um arquivo bruto, aceitando / <raiz>/utils/<raw> (monorepo)
    ou <raiz>/<raw> (repo de entrega) — a VOLTASEGURA_DATA sobrepondo os dois."""
    if data_dir is None:
        data_dir = data_root()
    for base in (data_dir / "utils", data_dir):
        cand = base / raw
        if cand.exists():
            return cand
    return data_dir / "utils" / raw


CACHE_DIR = Path(__file__).resolve().parent / "dados" / "cache"

IBGE_SP_CAPITAL = 3550308

# Colunas da base SSP mantidas (recorte documentado no notebook; a base tem 30).
SSP_COLS = [
    "NOME_MUNICIPIO",
    "BAIRRO",
    "LOGRADOURO",
    "LATITUDE",
    "LONGITUDE",
    "DATA_OCORRENCIA_BO",
    "HORA_OCORRENCIA_BO",
    "DESC_PERIODO",
    "DESCR_TIPOLOCAL",
    "RUBRICA",
    "NATUREZA_APURADA",
    "MES_ESTATISTICA",
]

# Colunas do Infosiga mantidas (o CSV de sinistros tem ~50).
INFO_COLS = [
    "id_sinistro",
    "data_sinistro",
    "ano_sinistro",
    "mes_sinistro",
    "hora_sinistro",
    "dia_da_semana",
    "turno",
    "logradouro",
    "tipo_via",
    "tipo_local",
    "cod_ibge",
    "municipio",
    "regiao_administrativa",
    "tp_sinistro_primario",
    "qtd_pedestre",
    "qtd_bicicleta",
    "qtd_motocicleta",
    "qtd_automovel",
    "qtd_onibus",
    "qtd_caminhao",
    "qtd_gravidade_fatal",
    "qtd_gravidade_grave",
    "qtd_gravidade_leve",
]

_log = print


# --------------------------------------------------------------- infosiga --
def load_infosiga(data_dir: Path | None = None) -> pd.DataFrame:
    """Carrega os CSVs de sinistros do zip do Infosiga, filtrando a capital."""
    data_dir = data_dir or data_root()
    zip_path = locate("infosiga/dados_infosiga.zip", data_dir)
    if not zip_path.exists():
        raise FileNotFoundError(
            f"dados_infosiga.zip não encontrado em {zip_path}. "
            "Baixe em https://infosiga.detran.sp.gov.br/ (Dados Abertos) — "
            "instruções em src/ml/dados/README.md."
        )
    frames = []
    with zipfile.ZipFile(zip_path) as z:
        for name in sorted(n for n in z.namelist() if n.startswith("sinistros_")):
            with z.open(name) as fh:
                df = pd.read_csv(
                    io.TextIOWrapper(fh, encoding="latin-1"),
                    sep=";",
                    low_memory=False,
                    usecols=INFO_COLS,
                )
            frames.append(df)
            _log(f"  {name}: {len(df):,} registros lidos")
    full = pd.concat(frames, ignore_index=True)
    full["cod_ibge"] = pd.to_numeric(full["cod_ibge"], errors="coerce")
    filtered = full[full["cod_ibge"] == IBGE_SP_CAPITAL].copy()
    filtered["data_sinistro"] = pd.to_datetime(
        filtered["data_sinistro"], format="%d/%m/%Y", errors="coerce"
    )
    filtered["hora_sinistro"] = pd.to_datetime(
        filtered["hora_sinistro"], format="%H:%M", errors="coerce"
    ).dt.hour
    for c in [c for c in INFO_COLS if c.startswith("qtd_")]:
        filtered[c] = pd.to_numeric(filtered[c], errors="coerce").fillna(0)
    filtered["ano_sinistro"] = pd.to_numeric(
        filtered["ano_sinistro"], errors="coerce"
    ).astype("Int64")
    filtered["mes_sinistro"] = pd.to_numeric(
        filtered["mes_sinistro"], errors="coerce"
    ).astype("Int64")
    return filtered


# --------------------------------------------------------------------- ssp --
def load_ssp(data_dir: Path | None = None) -> pd.DataFrame:
    """Carrega a base criminal SSPDADOS 2026 (xlsx; abas por semestre)."""
    data_dir = data_dir or data_root()
    xlsx_path = locate("ssp/SPDadosCriminais_2026.xlsx", data_dir)
    if not xlsx_path.exists():
        raise FileNotFoundError(
            f"SPDadosCriminais_2026.xlsx não encontrado em {xlsx_path}. "
            "Baixe em https://www.ssp.sp.gov.br/estatistica/consultas — "
            "instruções em src/ml/dados/README.md."
        )
    frames = []
    for sheet in ["JAN-JUN_2026", "JUL-DEZ_2026"]:
        df = pd.read_excel(xlsx_path, sheet_name=sheet, engine="openpyxl")
        df.columns = [str(c).strip() for c in df.columns]
        missing = [c for c in SSP_COLS if c not in df.columns]
        if missing:
            raise ValueError(f"Colunas ausentes na aba {sheet}: {missing}")
        df = df[SSP_COLS].copy()
        df["semestre"] = sheet.split("_")[0]
        frames.append(df)
        _log(f"  aba {sheet}: {len(df):,} registros")
    full = pd.concat(frames, ignore_index=True)
    full["DATA_OCORRENCIA_BO"] = pd.to_datetime(
        full["DATA_OCORRENCIA_BO"], errors="coerce"
    )
    full["MES_ESTATISTICA"] = pd.to_numeric(
        full["MES_ESTATISTICA"], errors="coerce"
    ).astype("Int64")
    # lat/lon chegam em alguns registros com '-' (string) como marcador de
    # ausência — coerção para numérico (NaN = sem coordenada) antes do parquet.
    for col in ("LATITUDE", "LONGITUDE"):
        full[col] = pd.to_numeric(full[col], errors="coerce")
    # a hora vem com tipos mistos (texto 'HH:MM[:SS]', 'HORA FICTÍCIA', vazios) —
    # normaliza para string para o parquet; o notebook parseia por célula.
    full["HORA_OCORRENCIA_BO"] = full["HORA_OCORRENCIA_BO"].astype("string").fillna("")
    # demais colunas de texto também podem ter tipos mistos — garantia única:
    for col in full.columns:
        if full[col].dtype == object and col not in ("DATA_OCORRENCIA_BO",):
            full[col] = full[col].astype("string")
    return full


def faixa_horaria(hora: int | None) -> str | None:
    """Agrupa a hora do evento em 4 faixas de 6h (madrugada é a janela da persona)."""
    if pd.isna(hora) or hora is None:
        return None
    h = int(hora) % 24
    if h < 6:
        return "MADRUGADA (00-05)"
    if h < 12:
        return "MANHA (06-11)"
    if h < 18:
        return "TARDE (12-17)"
    return "NOITE (18-23)"


def build_cache(force: bool = False) -> dict[str, Path]:
    """Gera os parquets de cache (ambas as fontes). Retorna os caminhos."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    outputs: dict[str, Path] = {}
    for key, loader in [
        ("infosiga_sinistros_sp", load_infosiga),
        ("ssp_bos_2026", load_ssp),
    ]:
        out = CACHE_DIR / f"{key}.parquet"
        if out.exists() and not force:
            print(
                f"[cache] {out.name} já existe — use force=True (abaixo) para regerar"
            )
            outputs[key] = out
            continue
        try:
            df = loader()
        except FileNotFoundError as exc:
            print(f"[omitido] {out.name}: {exc}")
            continue
        df.to_parquet(out)
        print(f"[cache] {len(df):,} registros -> {out}")
        outputs[key] = out
    return outputs


if __name__ == "__main__":
    import sys

    which = set(sys.argv[1:]) or {"infosiga", "ssp"}
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    if "infosiga" in which:
        df = load_infosiga()
        out = CACHE_DIR / "infosiga_sinistros_sp.parquet"
        df.to_parquet(out)
        print(f"[infosiga] {len(df):,} registros da capital -> {out}")
    if "ssp" in which:
        df = load_ssp()
        out = CACHE_DIR / "ssp_bos_2026.parquet"
        df.to_parquet(out)
        print(f"[ssp] {len(df):,} BOs -> {out}")
