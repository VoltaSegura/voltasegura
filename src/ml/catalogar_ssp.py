"""Cataloga RUBRICA e NATUREZA_APURADA dos microdados anuais da SSP-SP.

Uso: python src/ml/catalogar_ssp.py utils/ssp/SPDadosCriminais_2026.xlsx
"""

from __future__ import annotations

import argparse
import csv
import hashlib
from collections import Counter
from datetime import date, datetime
from pathlib import Path

from openpyxl import load_workbook


SOURCE_URL = (
    "https://www.ssp.sp.gov.br/assets/estatistica/transparencia/"
    "spDados/SPDadosCriminais_2026.xlsx"
)
SHEETS = ("JAN-JUN_2026", "JUL-DEZ_2026")
FIELDS = ("RUBRICA", "NATUREZA_APURADA", "NOME_MUNICIPIO", "MES_ESTATISTICA", "DATA_OCORRENCIA_BO")
PERIODS = ("jan_jun", "jul_dez")


def value_text(value: object) -> str:
    return "" if value is None else str(value).strip()


def number_pt(value: int) -> str:
    return f"{value:,}".replace(",", ".")


def write_counts(path: Path, fields: tuple[str, ...], counters: dict[str, Counter]) -> None:
    keys = set().union(*(counter.keys() for counter in counters.values()))
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([*fields, "estado_jan_jun", "estado_jul_dez", "estado_total", "capital_jan_jun", "capital_jul_dez", "capital_total"])
        for key in sorted(keys, key=lambda parts: tuple(part.casefold() for part in parts)):
            state_first = counters["estado_jan_jun"][key]
            state_second = counters["estado_jul_dez"][key]
            city_first = counters["capital_jan_jun"][key]
            city_second = counters["capital_jul_dez"][key]
            writer.writerow([
                *key,
                state_first,
                state_second,
                state_first + state_second,
                city_first,
                city_second,
                city_first + city_second,
            ])


def markdown_table(counters: dict[str, Counter], title: str) -> list[str]:
    keys = set().union(*(counter.keys() for counter in counters.values()))
    lines = [f"## {title}", "", "| Valor literal na planilha | Estado de SP | Município de São Paulo |", "|---|---:|---:|"]
    for key in sorted(keys, key=lambda parts: tuple(part.casefold() for part in parts)):
        state_total = counters["estado_jan_jun"][key] + counters["estado_jul_dez"][key]
        city_total = counters["capital_jan_jun"][key] + counters["capital_jul_dez"][key]
        label = key[0].replace("|", "\\|") or "(célula vazia)"
        lines.append(f"| {label} | {number_pt(state_total)} | {number_pt(city_total)} |")
    return lines + [""]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--output-dir", type=Path, default=Path("src/ml/dados"))
    args = parser.parse_args()
    if not args.workbook.is_file():
        parser.error(f"Arquivo não encontrado: {args.workbook}")

    args.output_dir.mkdir(parents=True, exist_ok=True)
    digest = hashlib.file_digest(args.workbook.open("rb"), "sha256").hexdigest()
    workbook = load_workbook(args.workbook, read_only=True, data_only=True)
    definitions = {
        value_text(row[0]): value_text(row[1])
        for row in workbook["Campos da Tabela_SPDADOS"].iter_rows(values_only=True)
        if row[0] is not None
    }
    counts = {kind: {scope: Counter() for scope in ("estado_jan_jun", "estado_jul_dez", "capital_jan_jun", "capital_jul_dez")} for kind in ("rubricas", "naturezas", "pares")}
    rows_by_sheet = Counter()
    rows_by_city = Counter()
    months = Counter()
    earliest: date | None = None
    latest: date | None = None

    for sheet_name, period in zip(SHEETS, PERIODS, strict=True):
        sheet = workbook[sheet_name]
        rows = sheet.iter_rows(values_only=True)
        header = [value_text(value) for value in next(rows)]
        missing = set(FIELDS) - set(header)
        if missing:
            raise ValueError(f"Colunas ausentes em {sheet_name}: {sorted(missing)}")
        index = {field: header.index(field) for field in FIELDS}

        for row in rows:
            if all(value is None for value in row):
                continue
            rubrica = value_text(row[index["RUBRICA"]])
            natureza = value_text(row[index["NATUREZA_APURADA"]])
            municipio = value_text(row[index["NOME_MUNICIPIO"]]).upper()
            capital = municipio == "S.PAULO"
            scope = f"estado_{period}"
            keys = {"rubricas": (rubrica,), "naturezas": (natureza,), "pares": (rubrica, natureza)}
            for kind, key in keys.items():
                counts[kind][scope][key] += 1
                if capital:
                    counts[kind][f"capital_{period}"][key] += 1
            rows_by_sheet[sheet_name] += 1
            if capital:
                rows_by_city[sheet_name] += 1
            month = value_text(row[index["MES_ESTATISTICA"]])
            months[(sheet_name, month)] += 1
            event_date = row[index["DATA_OCORRENCIA_BO"]]
            if isinstance(event_date, (date, datetime)):
                event_date = event_date.date() if isinstance(event_date, datetime) else event_date
                earliest = event_date if earliest is None else min(earliest, event_date)
                latest = event_date if latest is None else max(latest, event_date)
            if rows_by_sheet[sheet_name] % 100_000 == 0:
                print(f"{sheet_name}: {rows_by_sheet[sheet_name]:,} registros lidos", flush=True)

    workbook.close()
    output_files = {
        "rubricas": args.output_dir / "ssp_2026_rubricas.csv",
        "naturezas": args.output_dir / "ssp_2026_naturezas_apuradas.csv",
        "pares": args.output_dir / "ssp_2026_rubrica_natureza.csv",
    }
    write_counts(output_files["rubricas"], ("RUBRICA",), counts["rubricas"])
    write_counts(output_files["naturezas"], ("NATUREZA_APURADA",), counts["naturezas"])
    write_counts(output_files["pares"], ("RUBRICA", "NATUREZA_APURADA"), counts["pares"])

    total_rows = sum(rows_by_sheet.values())
    city_rows = sum(rows_by_city.values())
    for kind in counts:
        assert sum(counts[kind]["estado_jan_jun"].values()) + sum(counts[kind]["estado_jul_dez"].values()) == total_rows
        assert sum(counts[kind]["capital_jan_jun"].values()) + sum(counts[kind]["capital_jul_dez"].values()) == city_rows

    month_labels = sorted({int(month) for _, month in months if month.isdigit()})
    report = [
        "# Catálogo de rubricas e naturezas apuradas — SSP-SP 2026",
        "",
        f"Fonte: [SP Dados Criminais 2026 — SSP-SP]({SOURCE_URL}). Extração local em 10/11/2026.",
        "",
        f"- SHA256 do arquivo: `{digest}`.",
        f"- Linhas de dados lidas: **{number_pt(total_rows)}** no estado e **{number_pt(city_rows)}** no município de São Paulo (`NOME_MUNICIPIO = S.PAULO`).",
        f"- Abas: `JAN-JUN_2026` ({number_pt(rows_by_sheet[SHEETS[0]])} linhas) e `JUL-DEZ_2026` ({number_pt(rows_by_sheet[SHEETS[1]])} linhas).",
        f"- Meses estatísticos presentes: **{', '.join(str(month) for month in month_labels)}** de 2026. O nome da segunda aba não indica que outubro a dezembro já estejam publicados.",
        f"- `DATA_OCORRENCIA_BO` nas células de data vai de {earliest} a {latest}; esse campo não equivale ao mês estatístico.",
        f"- Valores distintos: **{len(set(counts['rubricas']['estado_jan_jun']) | set(counts['rubricas']['estado_jul_dez']))} rubricas**, **{len(set(counts['naturezas']['estado_jan_jun']) | set(counts['naturezas']['estado_jul_dez']))} naturezas apuradas** e **{len(set(counts['pares']['estado_jan_jun']) | set(counts['pares']['estado_jul_dez']))} pares**.",
        "",
        "As contagens abaixo são **linhas da planilha**, não taxas de criminalidade nem estimativas de exposição. Os valores foram preservados como publicados, com remoção apenas de espaços nas extremidades. `NULL` e `Pendente de Validação` são textos presentes em `RUBRICA`, não rótulos criados por esta análise. A base está sujeita a subnotificação e revisões da SSP-SP.",
        "",
        "## Significado oficial dos campos",
        "",
        f"- `RUBRICA`: {definitions['RUBRICA']}",
        f"- `NATUREZA_APURADA`: {definitions['NATUREZA_APURADA']}",
        "",
        "Os campos não são equivalentes: a mesma rubrica pode aparecer em mais de uma natureza apurada. Por exemplo, `Roubo (art. 157)` aparece inclusive com `FURTO - OUTROS` e `LATROCÍNIO`. O arquivo [ssp_2026_rubrica_natureza.csv](ssp_2026_rubrica_natureza.csv) contém **todos os pares**, com contagens por semestre no estado e na capital.",
        "",
        "**[EM ABERTO]** O grupo ainda não definiu quais categorias entram na metodologia do VoltaSegura, nem os critérios de suficiência dos dados. Este catálogo não atribui pesos ou rótulos de segurança a trajetos ou territórios.",
        "",
        "Arquivos para análise: [rubricas](ssp_2026_rubricas.csv), [naturezas apuradas](ssp_2026_naturezas_apuradas.csv) e [pares rubrica × natureza](ssp_2026_rubrica_natureza.csv). As tabelas CSV preservam também as contagens de cada semestre.",
        "",
    ]
    report.extend(markdown_table(counts["naturezas"], "Naturezas apuradas (23 valores)"))
    report.extend(markdown_table(counts["rubricas"], "Rubricas (72 valores)"))
    (args.output_dir / "CATALOGO_SSP_2026.md").write_text("\n".join(report), encoding="utf-8")

    print(f"SHA256: {digest}")
    print(f"Registros estado: {total_rows:,}; capital: {city_rows:,}")
    print(f"Rubricas: {len(set(counts['rubricas']['estado_jan_jun']) | set(counts['rubricas']['estado_jul_dez']))}")
    print(f"Naturezas apuradas: {len(set(counts['naturezas']['estado_jan_jun']) | set(counts['naturezas']['estado_jul_dez']))}")
    print(f"Pares: {len(set(counts['pares']['estado_jan_jun']) | set(counts['pares']['estado_jul_dez']))}")
    print(f"Data de ocorrência: {earliest} a {latest}")
    print("Meses estatísticos:", sorted(months.items()))
    print("Arquivos:", *(str(path) for path in output_files.values()))
    print("Fonte:", SOURCE_URL)


if __name__ == "__main__":
    main()
