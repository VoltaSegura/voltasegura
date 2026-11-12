"""Auditoria dos dados SSP-SP 2026 para calibrar a comparação de trajetos (docs/08).

Mede, para os registros elegíveis do MVP (NATUREZA_APURADA = FURTO - OUTROS ou
ROUBO - OUTROS, município de São Paulo): unidade de registro e duplicatas,
cobertura e precisão das coordenadas, tipos de local, cobertura de hora/período,
datas e uma estimativa de quantos registros noturnos cairiam em corredores de
1 km de caminhada com diferentes larguras.

Uso:
    python src/ml/auditar_calibracao_ssp.py utils/ssp/SPDadosCriminais_2026.xlsx

Resultado comentado em src/ml/dados/AUDITORIA_CALIBRACAO_SSP_2026.md.
"""

from __future__ import annotations

import sys

import numpy as np
import pandas as pd

SHEETS = ("JAN-JUN_2026", "JUL-DEZ_2026")
ELEGIVEIS = ("FURTO - OUTROS", "ROUBO - OUTROS")
CHAVE_BO = ["NUM_BO", "ANO_BO", "NOME_DELEGACIA"]
# Caixa aproximada do município (graus); usada só para descartar coordenadas absurdas.
BBOX = dict(lat=(-24.01, -23.35), lon=(-46.83, -46.36))
CELULA_M = 50.0


def carregar(xlsx: str) -> pd.DataFrame:
    frames = []
    for sheet in SHEETS:
        df = pd.read_excel(xlsx, sheet_name=sheet, engine="openpyxl", dtype=object)
        df.columns = [str(c).strip() for c in df.columns]
        df = df[df["NOME_MUNICIPIO"].astype(str).str.strip() == "S.PAULO"].copy()
        frames.append(df)
    df = pd.concat(frames, ignore_index=True)
    for col in ("NATUREZA_APURADA", "DESCR_TIPOLOCAL", "DESC_PERIODO", "NOME_DELEGACIA"):
        df[col] = df[col].astype(str).str.strip()
    return df[df["NATUREZA_APURADA"].isin(ELEGIVEIS)].copy()


def secao(titulo: str) -> None:
    print(f"\n## {titulo}")


def unidade(rec: pd.DataFrame) -> None:
    secao("Unidade de registro")
    g = rec.groupby(CHAVE_BO, dropna=False).size()
    print(f"linhas: {len(rec)} | chaves {CHAVE_BO}: {len(g)} | chaves com >1 linha: {(g > 1).sum()}")
    sem_del = rec.groupby(["NUM_BO", "ANO_BO"]).size()
    print(f"chaves (NUM_BO, ANO_BO): {len(sem_del)}")
    dup = rec[rec.duplicated(CHAVE_BO, keep=False)]
    if len(dup):
        mesma = dup.groupby(CHAVE_BO).agg(
            naturezas=("NATUREZA_APURADA", "nunique"),
            coord=("LATITUDE", lambda x: x.astype(str).nunique()),
            hora=("HORA_OCORRENCIA_BO", lambda x: x.astype(str).nunique()),
        )
        print("grupos duplicados com valor único por campo:", (mesma == 1).mean().round(3).to_dict())


def coordenadas(rec: pd.DataFrame) -> pd.Series:
    secao("Coordenadas")
    lat = pd.to_numeric(rec["LATITUDE"], errors="coerce")
    lon = pd.to_numeric(rec["LONGITUDE"], errors="coerce")
    ok = lat.between(*BBOX["lat"]) & lon.between(*BBOX["lon"])
    print(f"com coordenada válida no município: {ok.mean():.2%}")
    eletr = rec["NOME_DELEGACIA"].str.contains("ELETR")
    print(f"registros de delegacia eletrônica: {eletr.mean():.2%}")
    dec = rec.loc[ok, "LATITUDE"].astype(str).str.split(".").str[1].str.len()
    print(f"latitude com ≤ 4 casas decimais (≈ ≥ 11 m de arredondamento): {(dec <= 4).mean():.2%}")
    pontos = pd.Series(list(zip(lat[ok].round(6), lon[ok].round(6)))).value_counts()
    for t in (10, 50, 100):
        print(f"registros em pontos repetidos ≥ {t}x: {pontos[pontos >= t].sum() / ok.sum():.2%} ({(pontos >= t).sum()} pontos)")
    print("10 pontos mais repetidos (contagem, lat, lon, logradouro mais frequente):")
    for (la, lo), n in pontos.head(10).items():
        m = rec[ok.values & (lat.round(6) == la).values & (lon.round(6) == lo).values]
        print(f"  {n} {la} {lo} {m['LOGRADOURO'].astype(str).mode().iat[0]}")
    return ok


def tipo_local(rec: pd.DataFrame) -> None:
    secao("Tipo de local (DESCR_TIPOLOCAL)")
    print(rec["DESCR_TIPOLOCAL"].value_counts(normalize=True).head(12).round(4).to_string())


def horario(rec: pd.DataFrame) -> pd.Series:
    secao("Hora e período")
    h = rec["HORA_OCORRENCIA_BO"].astype(str).str.strip()
    t = pd.to_datetime(h, format="%H:%M:%S", errors="coerce").fillna(
        pd.to_datetime(h, format="%H:%M", errors="coerce")
    )
    hora = t.dt.hour
    per = rec["DESC_PERIODO"]
    per_ok = ~per.isin(["nan", "Em hora incerta"])
    print(f"hora utilizável: {hora.notna().mean():.2%} | período informado: {per_ok.mean():.2%} | hora OU período: {(hora.notna() | per_ok).mean():.2%}")
    print(f"horas cheias (minuto 00) entre as utilizáveis: {(t.dt.minute == 0)[t.notna()].mean():.2%}")
    print("hora utilizável por natureza:", rec.groupby("NATUREZA_APURADA").apply(lambda d: hora[d.index].notna().mean()).round(3).to_dict())
    ambos = rec[hora.notna() & per_ok]
    faixas = ambos.groupby("DESC_PERIODO").apply(lambda d: (int(hora[d.index].min()), int(hora[d.index].max())))
    print(f"quando hora e período coexistem ({len(ambos)} linhas), faixa de horas de cada período:", faixas.to_dict())
    noite = hora.between(18, 23) | (hora.isna() & (per == "A noite"))
    lat = pd.to_numeric(rec["LATITUDE"], errors="coerce")
    lon = pd.to_numeric(rec["LONGITUDE"], errors="coerce")
    utilizavel = lat.between(*BBOX["lat"]) & lon.between(*BBOX["lon"]) & (hora.notna() | per_ok)
    circ = utilizavel.groupby(rec["NOME_DELEGACIA_CIRCUNSCRICAO"].astype(str)).agg(["mean", "size"])
    circ = circ[circ["size"] >= 100]["mean"]
    print(f"cobertura (coordenada + período) por circunscrição com ≥ 100 BOs: {len(circ)} circunscrições, "
          f"média {circ.mean():.1%}, mínimo {circ.min():.1%} ({circ.idxmin()}), abaixo de 80%: {(circ < 0.8).sum()}")
    return noite


def datas(rec: pd.DataFrame) -> None:
    secao("Datas")
    d = pd.to_datetime(rec["DATA_OCORRENCIA_BO"], errors="coerce")
    r = pd.to_datetime(rec["DATA_REGISTRO"], errors="coerce")
    print(f"ocorrência em 2026: {(d.dt.year == 2026).mean():.2%} | intervalo: {d.min().date()} a {d.max().date()}")
    print("atraso registro − ocorrência (dias), p50/p90/p99:", (r - d).dt.days.quantile([0.5, 0.9, 0.99]).to_dict())
    print("ocorrências por mês de 2026:", d[d.dt.year == 2026].dt.month.value_counts().sort_index().to_dict())


def _janela(g: np.ndarray, h: int, w: int) -> np.ndarray:
    c = np.pad(g, ((1, 0), (1, 0))).cumsum(0).cumsum(1)
    return c[h:, w:] - c[:-h, w:] - c[h:, :-w] + c[:-h, :-w]


def densidade(rec: pd.DataFrame, ok: pd.Series, noite: pd.Series) -> None:
    secao("Registros noturnos em corredores de 1 km (aproximação em grade)")
    lat = pd.to_numeric(rec["LATITUDE"], errors="coerce")
    lon = pd.to_numeric(rec["LONGITUDE"], errors="coerce")
    y = (lat - -23.6) * 110574.0
    x = (lon + 46.6) * 111320.0 * np.cos(np.radians(-23.6))
    gx = np.floor((x - x[ok].min()) / CELULA_M)
    gy = np.floor((y - y[ok].min()) / CELULA_M)
    shape = (int(gy[ok].max()) + 1, int(gx[ok].max()) + 1)

    def grade(mask: pd.Series) -> np.ndarray:
        g = np.zeros(shape)
        m = mask & ok
        np.add.at(g, (gy[m].astype(int), gx[m].astype(int)), 1)
        return g

    todas, noturnas = grade(pd.Series(True, index=rec.index)), grade(noite)
    comprimento = int(1000 / CELULA_M)
    print(f"registros noturnos: {noite.sum()} (com coordenada: {(noite & ok).sum()})")
    print("janelas retas de 1 km (horizontais e verticais) restritas a áreas com algum registro; 9 meses:")
    for meia in (50, 100, 150, 250):
        w = int(2 * meia / CELULA_M)
        v = []
        for hh, ww in ((w, comprimento), (comprimento, w)):
            janela, area = _janela(noturnas, hh, ww), _janela(todas, hh, ww) > 0
            v.append(janela[area].ravel())
        v = np.concatenate(v)
        q = np.quantile(v, [0.1, 0.25, 0.5, 0.75, 0.9]).round(1)
        print(f"  ±{meia} m: p10/p25/p50/p75/p90 = {q.tolist()} | N = 0: {(v == 0).mean():.1%} | N < 5: {(v < 5).mean():.1%}")


def main() -> None:
    rec = carregar(sys.argv[1])
    print(f"registros elegíveis no município: {len(rec)}", rec["NATUREZA_APURADA"].value_counts().to_dict())
    unidade(rec)
    ok = coordenadas(rec)
    tipo_local(rec)
    noite = horario(rec)
    datas(rec)
    densidade(rec, ok, noite)


if __name__ == "__main__":
    main()
