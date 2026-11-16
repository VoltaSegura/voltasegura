#!/usr/bin/env python3
"""Importador da planilha SSP-SP (SPDadosCriminais_2026.xlsx) para CSVs de carga no Postgres/PostGIS.

Tarefa B-07 do VoltaSegura. Usa somente a biblioteca padrão e o openpyxl. Não conecta em banco:
gera arquivos para uma carga posterior (método de carga [EM ABERTO], ver LEIA-ME.md).

Uso:
    python importar_ssp.py --xlsx <arquivo.xlsx> --saida <pasta>
        [--periodo-inicio 2026-01-01] [--periodo-fim 2026-09-30] [--ibge 3550308] [--limite N]

Saídas (UTF-8 sem BOM, separador vírgula, aspas padrão do módulo csv, campo vazio = NULL):
    ssp_bo.csv         chave_bo,natureza,data_ocorrencia,faixa,lat,lon,circunscricao,tipo_local
    ssp_cobertura.csv  circunscricao,elegiveis_total,elegiveis_coord_faixa
    ssp_panorama.csv   natureza,total
    importacao.json    linhagem da fonte (hash, período, contagens)
    relatorio.md       contagens agregadas, descartes, duplicatas, divergências e cobertura

Minimização (LGPD): o CSV nunca leva NUM_BO, logradouro, bairro, número, nome de pessoa ou qualquer
coluna além das listadas acima. O terminal só mostra contagens agregadas e caminhos de arquivo.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import json
import math
import os
import re
import sys
import time
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path

FONTE = "SSP-SP SPDadosCriminais_2026"

# Colunas que o importador exige em cada aba de dados (localizadas pelo NOME do cabeçalho).
COLUNAS_OBRIGATORIAS = (
    "NOME_MUNICIPIO",
    "COD IBGE",
    "LATITUDE",
    "LONGITUDE",
    "NATUREZA_APURADA",
    "RUBRICA",
    "HORA_OCORRENCIA_BO",
    "DESCR_TIPOLOCAL",
    "DESC_PERIODO",
    "DATA_OCORRENCIA_BO",
    "NUM_BO",
    "ANO_BO",
    "NOME_DELEGACIA",
    "NOME_DELEGACIA_CIRCUNSCRICAO",
    "MES_ESTATISTICA",
    "ANO_ESTATISTICA",
)

# Abas cujo nome começa assim são documentação, não linhas de boletim.
PREFIXO_ABA_DOCUMENTACAO = "Campos"

# docs/07: naturezas que viram linhas de ssp_bo.csv (comparação literal após normalizar espaços).
NATUREZAS_LINHA = (
    "FURTO - OUTROS",
    "FURTO DE CARGA",
    "FURTO DE VEÍCULO",
    "ROUBO - OUTROS",
    "ROUBO DE CARGA",
    "ROUBO DE VEÍCULO",
    "LATROCÍNIO",
    "LESÃO CORPORAL CULPOSA POR ACIDENTE DE TRÂNSITO",
)
# docs/07: naturezas que entram SÓ no panorama municipal agregado (nunca como linha com coordenada).
NATUREZAS_PANORAMA = (
    "HOMICÍDIO DOLOSO",
    "TENTATIVA DE HOMICÍDIO",
    "ESTUPRO",
    "ESTUPRO DE VULNERÁVEL",
)
# docs/08: únicas naturezas elegíveis para a conta criminal e, portanto, para a cobertura.
NATUREZAS_ELEGIVEIS = ("FURTO - OUTROS", "ROUBO - OUTROS")

# Faixas da SSP (docs/08), com os mesmos valores do tipo FaixaDoDia do app (src/services/otp2.ts).
FAIXAS = ("MADRUGADA", "MANHA", "TARDE", "NOITE")

# Textos reais de DESC_PERIODO encontrados na planilha 2026 (comparação após normalizar espaços).
# "Em hora incerta", "NULL" e vazio não têm faixa.
MAPA_DESC_PERIODO = {
    "De madrugada": "MADRUGADA",
    "Pela manhã": "MANHA",
    "A tarde": "TARDE",
    "A noite": "NOITE",
}
DESC_PERIODO_SEM_FAIXA = ("Em hora incerta",)

# Retângulo amplo em volta do município de São Paulo (graus decimais, WGS84). O município vai de
# cerca de -24,01 a -23,36 de latitude e -46,83 a -46,36 de longitude; a margem evita cortar
# pontos de borda. Fora dele, a coordenada é considerada inválida (fica vazia). [HIPÓTESE]
RETANGULO_SP = {"lat_min": -24.10, "lat_max": -23.30, "lon_min": -46.90, "lon_max": -46.30}

# A SSP grava campo vazio como o texto literal "NULL" (nota da aba "Campos da Tabela_SPDADOS").
TEXTOS_NULOS = ("", "NULL")

MOTIVOS_DESCARTE = {
    "linha_vazia": "linha totalmente vazia",
    "municipio_fora": "município diferente do código IBGE pedido",
    "natureza_fora_recorte": "natureza apurada fora das listas do docs/07",
    "data_invalida": "DATA_OCORRENCIA_BO ausente ou ilegível",
    "data_fora_periodo": "DATA_OCORRENCIA_BO fora do período pedido",
    "chave_bo_incompleta": "NUM_BO, ANO_BO ou NOME_DELEGACIA ausente",
}

INTERVALO_PROGRESSO = 100_000


class ErroImportacao(Exception):
    """Erro que interrompe a importação com mensagem clara (esquema, argumentos, arquivo)."""


# --------------------------------------------------------------------------------------------
# Normalização de valores
# --------------------------------------------------------------------------------------------

_ESPACOS = re.compile(r"\s+")


def normalizar_espacos(valor) -> str:
    """Remove espaços nas pontas e colapsa espaços internos (qualquer espaço em branco vira um)."""
    if valor is None:
        return ""
    return _ESPACOS.sub(" ", str(valor)).strip()


def texto(valor) -> str | None:
    """Texto com espaços normalizados; vazio ou o literal 'NULL' viram None."""
    t = normalizar_espacos(valor)
    return None if t in TEXTOS_NULOS else t


def numero_inteiro_texto(valor) -> str | None:
    """Representa um número inteiro como texto, aceitando int, float integral ou texto ('2026', '2026.0')."""
    if valor is None or isinstance(valor, bool):
        return None
    if isinstance(valor, int):
        return str(valor)
    if isinstance(valor, float):
        return str(int(valor)) if math.isfinite(valor) and valor.is_integer() else None
    t = texto(valor)
    if t is None:
        return None
    if re.fullmatch(r"\d+(\.0+)?", t):
        return t.split(".")[0]
    return t


def formato_ibge(valor) -> str:
    """Descreve o formato observado do COD IBGE (para o relatório), sem guardar o valor."""
    tipo = type(valor).__name__
    t = numero_inteiro_texto(valor)
    if t is None:
        return f"{tipo}:vazio"
    return f"{tipo}:{len(t)} dígitos" if t.isdigit() else f"{tipo}:não numérico"


def ibge_confere(valor, ibge_alvo: str) -> bool:
    """Compara o COD IBGE com o código pedido (7 dígitos).

    Aceita número ou texto. Se vier com 6 dígitos (forma sem o dígito verificador), compara com os
    6 primeiros dígitos do código pedido.
    """
    t = numero_inteiro_texto(valor)
    if t is None or not t.isdigit():
        return False
    if len(t) == 7:
        return t == ibge_alvo
    if len(t) == 6:
        return t == ibge_alvo[:6]
    return False


def ler_data(valor) -> dt.date | None:
    """Converte DATA_OCORRENCIA_BO (datetime, date ou texto ISO/brasileiro) em date."""
    if isinstance(valor, dt.datetime):
        return valor.date()
    if isinstance(valor, dt.date):
        return valor
    t = texto(valor)
    if t is None:
        return None
    for formato in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S", "%d/%m/%Y", "%d/%m/%Y %H:%M:%S"):
        try:
            return dt.datetime.strptime(t, formato).date()
        except ValueError:
            continue
    return None


_HORA_TEXTO = re.compile(r"(\d{1,2}):(\d{2})(?::(\d{2}))?")


def ler_hora(valor) -> int | None:
    """Hora (0-23) de HORA_OCORRENCIA_BO quando válida; senão None.

    Aceita datetime.time, datetime.datetime, timedelta (< 24 h) e texto 'HH:MM[:SS]'.
    """
    if isinstance(valor, dt.datetime):
        return valor.hour
    if isinstance(valor, dt.time):
        return valor.hour
    if isinstance(valor, dt.timedelta):
        segundos = valor.total_seconds()
        return int(segundos // 3600) if 0 <= segundos < 86400 else None
    t = texto(valor)
    if t is None:
        return None
    m = _HORA_TEXTO.fullmatch(t)
    if not m:
        return None
    hora, minuto = int(m.group(1)), int(m.group(2))
    segundo = int(m.group(3) or 0)
    if 0 <= hora <= 23 and 0 <= minuto <= 59 and 0 <= segundo <= 59:
        return hora
    return None


def faixa_da_hora(hora: int) -> str:
    if hora < 6:
        return "MADRUGADA"
    if hora < 12:
        return "MANHA"
    if hora < 18:
        return "TARDE"
    return "NOITE"


def faixa_do_periodo(valor) -> tuple[str | None, str]:
    """Faixa a partir de DESC_PERIODO. Retorna (faixa, categoria) para o relatório."""
    t = texto(valor)
    if t is None:
        return None, "vazio"
    if t in MAPA_DESC_PERIODO:
        return MAPA_DESC_PERIODO[t], "mapeado"
    if t in DESC_PERIODO_SEM_FAIXA:
        return None, "hora_incerta"
    return None, "desconhecido"


def ler_coordenada(valor) -> tuple[float | None, str]:
    """Converte uma coordenada publicada em float, sem corrigir o valor. Retorna (valor, situação)."""
    if valor is None or isinstance(valor, bool):
        return None, "ausente"
    if isinstance(valor, (int, float)):
        numero = float(valor)
    else:
        t = texto(valor)
        if t is None or t == "-":
            return None, "ausente"
        try:
            numero = float(t)
        except ValueError:
            return None, "nao_numerica"
    if not math.isfinite(numero):
        return None, "nao_numerica"
    return numero, "ok"


def validar_ponto(lat_bruta, lon_bruta) -> tuple[float | None, float | None, str]:
    """Valida o par lat/lon como publicado. Retorna (lat, lon, situação); se inválido, ambos None."""
    lat, s_lat = ler_coordenada(lat_bruta)
    lon, s_lon = ler_coordenada(lon_bruta)
    for situacao in ("ausente", "nao_numerica"):
        if situacao in (s_lat, s_lon):
            return None, None, situacao
    if lat == 0 or lon == 0:
        return None, None, "zero"
    r = RETANGULO_SP
    if not (r["lat_min"] <= lat <= r["lat_max"] and r["lon_min"] <= lon <= r["lon_max"]):
        return None, None, "fora_retangulo"
    return lat, lon, "valida"


def normalizar_parte_chave(valor) -> str | None:
    """Parte da chave do boletim: espaços nas pontas removidos, internos colapsados, maiúsculas.

    Números (ex.: ANO_BO 2026 ou 2026.0) viram o texto do inteiro ('2026'); zeros à esquerda de um
    texto são preservados.
    """
    t = numero_inteiro_texto(valor)
    if t is None:
        return None
    return normalizar_espacos(t).upper()


def calcular_chave_bo(num_bo, ano_bo, nome_delegacia) -> str | None:
    """SHA256 (hex minúsculo) de 'NUM_BO|ANO_BO|NOME_DELEGACIA' normalizados; None se faltar parte."""
    partes = [normalizar_parte_chave(v) for v in (num_bo, ano_bo, nome_delegacia)]
    if any(p is None for p in partes):
        return None
    return hashlib.sha256("|".join(partes).encode("utf-8")).hexdigest()


def sha256_arquivo(caminho: Path, tamanho_bloco: int = 1024 * 1024) -> str:
    h = hashlib.sha256()
    with open(caminho, "rb") as f:
        for bloco in iter(lambda: f.read(tamanho_bloco), b""):
            h.update(bloco)
    return h.hexdigest()


def formatar_coordenada(valor: float | None) -> str:
    """Coordenada como publicada (repr mais curto do float); vazio = NULL."""
    return "" if valor is None else repr(valor)


# --------------------------------------------------------------------------------------------
# Estado da importação
# --------------------------------------------------------------------------------------------


@dataclass
class EstadoBo:
    """Resumo por boletim (chave_bo) para divergências entre naturezas e cobertura."""

    naturezas: int = 0
    pontos: set = field(default_factory=set)
    faixas: set = field(default_factory=set)
    datas: set = field(default_factory=set)
    circunscricoes: set = field(default_factory=set)


@dataclass
class Resultado:
    linhas_lidas: int = 0
    linhas_validas: int = 0
    por_aba: dict = field(default_factory=dict)
    descartes: Counter = field(default_factory=Counter)
    formatos_ibge: Counter = field(default_factory=Counter)
    linhas_por_natureza: Counter = field(default_factory=Counter)
    linhas_csv_por_natureza: Counter = field(default_factory=Counter)
    duplicatas: Counter = field(default_factory=Counter)
    duplicatas_com_valores_diferentes: int = 0
    origem_faixa: Counter = field(default_factory=Counter)
    desc_periodo: Counter = field(default_factory=Counter)
    hora_e_periodo_divergentes: int = 0
    hora_e_periodo_ambos: int = 0
    coordenada: Counter = field(default_factory=Counter)
    bos_multinatureza: int = 0
    divergencia_coord: int = 0
    divergencia_faixa: int = 0
    divergencia_data: int = 0
    divergencia_circunscricao: int = 0
    panorama: dict = field(default_factory=dict)
    cobertura: list = field(default_factory=list)
    elegiveis_numerador_parcial: int = 0
    abas_dados: list = field(default_factory=list)
    abas_ignoradas: list = field(default_factory=list)
    interrompido_no_limite: bool = False


def localizar_colunas(cabecalho, aba: str) -> dict[str, int]:
    """Mapeia nome normalizado do cabeçalho -> índice; falha clara se faltar coluna obrigatória."""
    indices: dict[str, int] = {}
    for i, nome in enumerate(cabecalho or ()):
        chave = normalizar_espacos(nome).upper()
        if chave and chave not in indices:
            indices[chave] = i
    faltando = [c for c in COLUNAS_OBRIGATORIAS if c not in indices]
    if faltando:
        raise ErroImportacao(
            f"a aba '{aba}' não tem as colunas obrigatórias: {', '.join(faltando)}. "
            "Confira se a planilha é a SPDadosCriminais da SSP-SP com o cabeçalho na primeira linha."
        )
    return {c: indices[c] for c in COLUNAS_OBRIGATORIAS}


def _abrir_csv(caminho: Path):
    f = open(caminho, "w", encoding="utf-8", newline="")
    return f, csv.writer(f, lineterminator="\n")


def importar(
    xlsx: Path,
    saida: Path,
    periodo_inicio: dt.date,
    periodo_fim: dt.date,
    ibge: str = "3550308",
    limite: int | None = None,
    progresso=None,
) -> Resultado:
    """Lê a planilha em streaming e grava os CSVs, o JSON de linhagem e o relatório em `saida`."""
    try:
        import openpyxl  # importado aqui para a ajuda (--help) funcionar sem a dependência
    except ImportError as exc:  # pragma: no cover
        raise ErroImportacao("o pacote openpyxl não está disponível neste Python.") from exc

    if not xlsx.is_file():
        raise ErroImportacao(f"arquivo não encontrado: {xlsx}")
    if periodo_inicio > periodo_fim:
        raise ErroImportacao("--periodo-inicio é posterior a --periodo-fim.")
    if not re.fullmatch(r"\d{7}", ibge):
        raise ErroImportacao("--ibge deve ter 7 dígitos (ex.: 3550308).")
    avisar = progresso or (lambda _msg: None)

    saida.mkdir(parents=True, exist_ok=True)
    arquivo_sha256 = sha256_arquivo(xlsx)
    r = Resultado()

    vistos: dict[tuple[str, str], tuple] = {}  # (chave_bo, natureza) -> valores gravados
    por_bo: dict[str, EstadoBo] = {}
    panorama: dict[str, set] = {n: set() for n in NATUREZAS_PANORAMA}
    # Cobertura: circunscrição -> {chave_bo: tem coordenada válida E faixa em ao menos uma linha elegível}
    cobertura: dict[str, dict[str, bool]] = defaultdict(dict)
    cobertura_qualquer_falha: dict[str, set] = defaultdict(set)

    parcial_bo = saida / "ssp_bo.csv.parcial"
    f_bo, w_bo = _abrir_csv(parcial_bo)
    try:
        w_bo.writerow(["chave_bo", "natureza", "data_ocorrencia", "faixa", "lat", "lon", "circunscricao", "tipo_local"])
        wb = openpyxl.load_workbook(xlsx, read_only=True, data_only=True)
        try:
            for aba in wb.sheetnames:
                if aba.startswith(PREFIXO_ABA_DOCUMENTACAO):
                    r.abas_ignoradas.append(aba)
                    continue
                if limite is not None and r.linhas_lidas >= limite:
                    r.interrompido_no_limite = True
                    break
                r.abas_dados.append(aba)
                linhas = wb[aba].iter_rows(values_only=True)
                idx = localizar_colunas(next(linhas, None), aba)
                stats_aba = r.por_aba.setdefault(aba, Counter())
                for linha in linhas:
                    if limite is not None and r.linhas_lidas >= limite:
                        r.interrompido_no_limite = True
                        break
                    r.linhas_lidas += 1
                    stats_aba["lidas"] += 1
                    if r.linhas_lidas % INTERVALO_PROGRESSO == 0:
                        avisar(f"  {r.linhas_lidas:,} linhas lidas".replace(",", "."))
                    motivo = _processar_linha(
                        linha, idx, r, ibge, periodo_inicio, periodo_fim,
                        vistos, por_bo, panorama, cobertura, cobertura_qualquer_falha, w_bo,
                    )
                    if motivo:
                        r.descartes[motivo] += 1
                        stats_aba[f"descarte:{motivo}"] += 1
                    else:
                        r.linhas_validas += 1
                        stats_aba["validas"] += 1
        finally:
            wb.close()
    except BaseException:
        f_bo.close()
        parcial_bo.unlink(missing_ok=True)
        raise
    f_bo.close()

    if not r.abas_dados:
        parcial_bo.unlink(missing_ok=True)
        raise ErroImportacao("nenhuma aba de dados encontrada na planilha.")

    # Divergências entre naturezas do mesmo boletim (cada natureza mantém seus próprios valores).
    for estado in por_bo.values():
        if estado.naturezas < 2:
            continue
        r.bos_multinatureza += 1
        r.divergencia_coord += len(estado.pontos) > 1
        r.divergencia_faixa += len(estado.faixas) > 1
        r.divergencia_data += len(estado.datas) > 1
        r.divergencia_circunscricao += len(estado.circunscricoes) > 1

    r.panorama = {n: len(panorama[n]) for n in NATUREZAS_PANORAMA}
    r.cobertura = sorted(
        (circ, len(bos), sum(1 for ok in bos.values() if ok)) for circ, bos in cobertura.items()
    )
    # Boletins contados no numerador apesar de outra linha elegível do mesmo BO não ter coord/faixa.
    r.elegiveis_numerador_parcial = sum(
        1 for circ, bos in cobertura.items() for chave, ok in bos.items()
        if ok and chave in cobertura_qualquer_falha[circ]
    )

    _gravar_saidas(saida, parcial_bo, r, xlsx, arquivo_sha256, periodo_inicio, periodo_fim, ibge, limite)
    return r


def _processar_linha(linha, idx, r, ibge, inicio, fim, vistos, por_bo, panorama, cobertura,
                     cobertura_qualquer_falha, w_bo) -> str | None:
    """Aplica filtros e grava a linha aceita. Retorna o motivo de descarte ou None se aceita."""
    if linha is None or all(v is None for v in linha):
        return "linha_vazia"

    def campo(nome):
        i = idx[nome]
        return linha[i] if i < len(linha) else None

    valor_ibge = campo("COD IBGE")
    r.formatos_ibge[formato_ibge(valor_ibge)] += 1
    if not ibge_confere(valor_ibge, ibge):
        return "municipio_fora"

    natureza = normalizar_espacos(campo("NATUREZA_APURADA"))
    eh_linha = natureza in NATUREZAS_LINHA
    eh_panorama = natureza in NATUREZAS_PANORAMA
    if not (eh_linha or eh_panorama):
        return "natureza_fora_recorte"

    data = ler_data(campo("DATA_OCORRENCIA_BO"))
    if data is None:
        return "data_invalida"
    if not (inicio <= data <= fim):
        return "data_fora_periodo"

    chave = calcular_chave_bo(campo("NUM_BO"), campo("ANO_BO"), campo("NOME_DELEGACIA"))
    if chave is None:
        return "chave_bo_incompleta"

    r.linhas_por_natureza[natureza] += 1
    if eh_panorama:
        # Só a contagem agregada de boletins distintos; nenhuma coordenada, data ou chave é gravada.
        panorama[natureza].add(chave)
        return None

    # Faixa: hora do BO quando válida; senão DESC_PERIODO.
    hora = ler_hora(campo("HORA_OCORRENCIA_BO"))
    faixa_periodo, cat_periodo = faixa_do_periodo(campo("DESC_PERIODO"))
    r.desc_periodo[cat_periodo] += 1
    if hora is not None:
        faixa = faixa_da_hora(hora)
        r.origem_faixa["hora_do_bo"] += 1
        if faixa_periodo is not None:
            r.hora_e_periodo_ambos += 1
            r.hora_e_periodo_divergentes += faixa_periodo != faixa
    elif faixa_periodo is not None:
        faixa = faixa_periodo
        r.origem_faixa["desc_periodo"] += 1
    else:
        faixa = None
        r.origem_faixa["sem_faixa"] += 1

    lat, lon, situacao_coord = validar_ponto(campo("LATITUDE"), campo("LONGITUDE"))
    r.coordenada[situacao_coord] += 1
    circunscricao = texto(campo("NOME_DELEGACIA_CIRCUNSCRICAO"))
    tipo_local = texto(campo("DESCR_TIPOLOCAL"))
    valores = (data, faixa, lat, lon, circunscricao, tipo_local)

    chave_nat = (chave, natureza)
    if chave_nat in vistos:
        r.duplicatas[natureza] += 1
        if vistos[chave_nat] != valores:
            r.duplicatas_com_valores_diferentes += 1
        return None  # linha válida, mas repetida: mantém a primeira ocorrência lida
    vistos[chave_nat] = valores

    w_bo.writerow([
        chave, natureza, data.isoformat(), faixa or "",
        formatar_coordenada(lat), formatar_coordenada(lon), circunscricao or "", tipo_local or "",
    ])
    r.linhas_csv_por_natureza[natureza] += 1

    estado = por_bo.get(chave)
    if estado is None:
        estado = por_bo[chave] = EstadoBo()
    estado.naturezas += 1
    estado.pontos.add((lat, lon))
    estado.faixas.add(faixa)
    estado.datas.add(data)
    estado.circunscricoes.add(circunscricao)

    if natureza in NATUREZAS_ELEGIVEIS:
        circ = circunscricao or ""
        completo = lat is not None and faixa is not None
        cobertura[circ][chave] = cobertura[circ].get(chave, False) or completo
        if not completo:
            cobertura_qualquer_falha[circ].add(chave)
    return None


# --------------------------------------------------------------------------------------------
# Saídas
# --------------------------------------------------------------------------------------------


def _pct(num: int, den: int) -> float | None:
    return None if den == 0 else 100.0 * num / den


def _fmt_pct(valor: float | None) -> str:
    return "—" if valor is None else f"{valor:.1f}%".replace(".", ",")


def _fmt_int(valor: int) -> str:
    return f"{valor:,}".replace(",", ".")


def resumo_cobertura(cobertura) -> dict:
    """Média simples e mínimo do percentual por circunscrição (ignora a linha sem circunscrição)."""
    pcts = [(c, _pct(num, den)) for c, den, num in cobertura if c and den > 0]
    if not pcts:
        return {"quantidade": 0, "media": None, "minimo": None, "minimo_circunscricao": None, "abaixo_80": 0}
    minimo = min(pcts, key=lambda x: x[1])
    return {
        "quantidade": len(pcts),
        "media": sum(p for _, p in pcts) / len(pcts),
        "minimo": minimo[1],
        "minimo_circunscricao": minimo[0],
        "abaixo_80": sum(1 for _, p in pcts if p < 80.0),
    }


def _gravar_saidas(saida, parcial_bo, r, xlsx, arquivo_sha256, inicio, fim, ibge, limite):
    f, w = _abrir_csv(saida / "ssp_cobertura.csv")
    with f:
        w.writerow(["circunscricao", "elegiveis_total", "elegiveis_coord_faixa"])
        for circ, den, num in r.cobertura:
            w.writerow([circ, den, num])

    f, w = _abrir_csv(saida / "ssp_panorama.csv")
    with f:
        w.writerow(["natureza", "total"])
        for natureza in NATUREZAS_PANORAMA:
            w.writerow([natureza, r.panorama[natureza]])

    importacao = {
        "fonte": FONTE,
        "arquivo_sha256": arquivo_sha256,
        "periodo_inicio": inicio.isoformat(),
        "periodo_fim": fim.isoformat(),
        "linhas_lidas": r.linhas_lidas,
        "linhas_validas": r.linhas_validas,
        "gerado_em": dt.datetime.now().astimezone().isoformat(timespec="seconds"),
    }
    with open(saida / "importacao.json", "w", encoding="utf-8", newline="\n") as fj:
        json.dump(importacao, fj, ensure_ascii=False, indent=2)
        fj.write("\n")

    with open(saida / "relatorio.md", "w", encoding="utf-8", newline="\n") as fr:
        fr.write(montar_relatorio(r, xlsx, importacao, ibge, limite))

    os.replace(parcial_bo, saida / "ssp_bo.csv")


def montar_relatorio(r: Resultado, xlsx: Path, importacao: dict, ibge: str, limite) -> str:
    rc = resumo_cobertura(r.cobertura)
    total_dup = sum(r.duplicatas.values())
    linhas = [
        "# Relatório de importação SSP-SP (B-07)",
        "",
        f"- Fonte: {importacao['fonte']} (dados públicos da SSP-SP, licença CC-BY 4.0)",
        f"- Arquivo: `{xlsx.name}`",
        f"- SHA256: `{importacao['arquivo_sha256']}`",
        f"- Município (COD IBGE): {ibge}",
        f"- Período pela data da ocorrência: {importacao['periodo_inicio']} a {importacao['periodo_fim']}",
        f"- Gerado em: {importacao['gerado_em']}",
        f"- Linhas lidas: {_fmt_int(r.linhas_lidas)}; linhas válidas (antes da deduplicação, incluindo panorama): "
        f"{_fmt_int(r.linhas_validas)}",
    ]
    if limite is not None:
        linhas.append(f"- **Execução de teste com `--limite {limite}`** (resultado parcial, não usar para carga).")
    linhas += [
        "",
        "> Contagens de registros da base, sujeitas a subnotificação e revisão pela SSP-SP. "
        "Zero registro não significa ausência de ocorrência. Nenhuma linha individual, número de "
        "boletim ou endereço aparece neste relatório.",
        "",
        "## Abas",
        "",
        f"- Abas de dados lidas: {', '.join(r.abas_dados) or '—'}",
        f"- Abas ignoradas (documentação): {', '.join(r.abas_ignoradas) or '—'}",
        "",
        "| Aba | Lidas | Válidas | Descartadas |",
        "|---|---:|---:|---:|",
    ]
    for aba, c in r.por_aba.items():
        desc = sum(v for k, v in c.items() if k.startswith("descarte:"))
        linhas.append(f"| {aba} | {_fmt_int(c['lidas'])} | {_fmt_int(c['validas'])} | {_fmt_int(desc)} |")

    linhas += ["", "## Formato observado do COD IBGE", "", "| Formato | Linhas |", "|---|---:|"]
    for formato, n in r.formatos_ibge.most_common():
        linhas.append(f"| {formato} | {_fmt_int(n)} |")

    linhas += ["", "## Descartes por motivo", "", "| Motivo | Linhas |", "|---|---:|"]
    for motivo, descricao in MOTIVOS_DESCARTE.items():
        linhas.append(f"| {descricao} (`{motivo}`) | {_fmt_int(r.descartes.get(motivo, 0))} |")

    linhas += [
        "",
        "## Por natureza",
        "",
        "| Natureza | Papel | Linhas válidas | Duplicatas (mesmo BO e natureza) | Linhas em ssp_bo.csv / boletins no panorama |",
        "|---|---|---:|---:|---:|",
    ]
    for natureza in NATUREZAS_LINHA:
        papel = "conta criminal e cobertura" if natureza in NATUREZAS_ELEGIVEIS else "contexto (linha)"
        linhas.append(
            f"| {natureza} | {papel} | {_fmt_int(r.linhas_por_natureza.get(natureza, 0))} | "
            f"{_fmt_int(r.duplicatas.get(natureza, 0))} | {_fmt_int(r.linhas_csv_por_natureza.get(natureza, 0))} |"
        )
    for natureza in NATUREZAS_PANORAMA:
        n_linhas = r.linhas_por_natureza.get(natureza, 0)
        linhas.append(
            f"| {natureza} | só panorama municipal | {_fmt_int(n_linhas)} | — | {_fmt_int(r.panorama.get(natureza, 0))} |"
        )

    linhas += [
        "",
        "## Duplicatas e divergências",
        "",
        f"- Linhas repetidas com o mesmo boletim e a mesma natureza (mantida a primeira lida): {_fmt_int(total_dup)}",
        f"- Dessas, repetidas com algum valor diferente (data, faixa, coordenada, circunscrição ou tipo de local): "
        f"{_fmt_int(r.duplicatas_com_valores_diferentes)}",
        f"- Boletins com mais de uma natureza em ssp_bo.csv: {_fmt_int(r.bos_multinatureza)}",
        f"- Desses, com coordenada diferente entre naturezas: {_fmt_int(r.divergencia_coord)}",
        f"- Com faixa diferente entre naturezas: {_fmt_int(r.divergencia_faixa)}",
        f"- Com data de ocorrência diferente entre naturezas: {_fmt_int(r.divergencia_data)}",
        f"- Com circunscrição diferente entre naturezas: {_fmt_int(r.divergencia_circunscricao)}",
        "",
        "Cada natureza do mesmo boletim mantém os seus próprios valores; nenhuma é escolhida no lugar da outra.",
        "",
        "## Faixa do dia (linhas de ssp_bo.csv, antes da deduplicação)",
        "",
        f"- Pela hora do boletim: {_fmt_int(r.origem_faixa.get('hora_do_bo', 0))}",
        f"- Por DESC_PERIODO (sem hora válida): {_fmt_int(r.origem_faixa.get('desc_periodo', 0))}",
        f"- Sem faixa (hora incerta, vazio ou texto não reconhecido): {_fmt_int(r.origem_faixa.get('sem_faixa', 0))}",
        f"- Linhas com hora válida e DESC_PERIODO mapeável: {_fmt_int(r.hora_e_periodo_ambos)}; "
        f"com faixas diferentes entre as duas fontes: {_fmt_int(r.hora_e_periodo_divergentes)}",
        f"- DESC_PERIODO: mapeado {_fmt_int(r.desc_periodo.get('mapeado', 0))}, 'Em hora incerta' "
        f"{_fmt_int(r.desc_periodo.get('hora_incerta', 0))}, vazio/NULL {_fmt_int(r.desc_periodo.get('vazio', 0))}, "
        f"texto não reconhecido {_fmt_int(r.desc_periodo.get('desconhecido', 0))}",
        "",
        "## Coordenadas (linhas de ssp_bo.csv, antes da deduplicação)",
        "",
        f"- Válidas (usadas como publicadas): {_fmt_int(r.coordenada.get('valida', 0))}",
        f"- Ausentes (vazio, 'NULL' ou '-'): {_fmt_int(r.coordenada.get('ausente', 0))}",
        f"- Zero: {_fmt_int(r.coordenada.get('zero', 0))}",
        f"- Fora do retângulo amplo do município: {_fmt_int(r.coordenada.get('fora_retangulo', 0))}",
        f"- Não numéricas: {_fmt_int(r.coordenada.get('nao_numerica', 0))}",
        "",
        "Coordenada inválida fica vazia: a linha fica fora da conta espacial, mas dentro do denominador de cobertura.",
        "",
        "## Cobertura por circunscrição",
        "",
        "Boletins distintos de `FURTO - OUTROS` ou `ROUBO - OUTROS` no período, por "
        "`NOME_DELEGACIA_CIRCUNSCRICAO`. Numerador: boletins com coordenada válida **e** faixa do dia.",
        "",
        f"- Circunscrições: {rc['quantidade']}",
        f"- Média simples entre circunscrições: {_fmt_pct(rc['media'])}",
        f"- Mínimo: {_fmt_pct(rc['minimo'])} ({rc['minimo_circunscricao'] or '—'})",
        f"- Circunscrições com cobertura abaixo de 80%: {rc['abaixo_80']}",
        f"- Boletins no numerador por ter ao menos uma linha elegível completa, embora outra linha elegível "
        f"do mesmo boletim não tenha coordenada ou faixa: {_fmt_int(r.elegiveis_numerador_parcial)}",
        "",
        "| Circunscrição | Elegíveis | Com coordenada e faixa | Cobertura | Observação |",
        "|---|---:|---:|---:|---|",
    ]
    ordenadas = sorted(r.cobertura, key=lambda x: (_pct(x[2], x[1]) or 0.0, x[0]))
    for circ, den, num in ordenadas:
        pct = _pct(num, den)
        obs = "cobertura abaixo de 80%" if pct is not None and pct < 80.0 else ""
        nome = circ or "(sem circunscrição informada)"
        linhas.append(f"| {nome} | {_fmt_int(den)} | {_fmt_int(num)} | {_fmt_pct(pct)} | {obs} |")
    linhas += [
        "",
        "A cobertura descreve a qualidade dos dados de cada circunscrição, não a exposição estimada. "
        "Cobertura menor significa mais respostas \"dados insuficientes\" para quem circula nessa região.",
        "",
    ]
    return "\n".join(linhas)


# --------------------------------------------------------------------------------------------
# Linha de comando
# --------------------------------------------------------------------------------------------


def _data_arg(valor: str) -> dt.date:
    try:
        return dt.date.fromisoformat(valor)
    except ValueError as exc:
        raise argparse.ArgumentTypeError(f"data inválida '{valor}' (use AAAA-MM-DD)") from exc


def _limite_arg(valor: str) -> int:
    try:
        n = int(valor)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("--limite deve ser um inteiro positivo") from exc
    if n <= 0:
        raise argparse.ArgumentTypeError("--limite deve ser um inteiro positivo")
    return n


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="Importa a planilha SSP-SP 2026 e gera CSVs para carga no Postgres/PostGIS (não conecta em banco)."
    )
    parser.add_argument("--xlsx", required=True, type=Path, help="planilha SPDadosCriminais (somente leitura)")
    parser.add_argument("--saida", required=True, type=Path, help="pasta de saída (ignorada pelo git)")
    parser.add_argument("--periodo-inicio", type=_data_arg, default=dt.date(2026, 1, 1),
                        help="primeira data de ocorrência incluída (padrão 2026-01-01)")
    parser.add_argument("--periodo-fim", type=_data_arg, default=dt.date(2026, 9, 30),
                        help="última data de ocorrência incluída (padrão 2026-09-30)")
    parser.add_argument("--ibge", default="3550308", help="código IBGE de 7 dígitos (padrão 3550308, São Paulo)")
    parser.add_argument("--limite", type=_limite_arg, default=None, help="lê só as primeiras N linhas de dados (teste)")
    args = parser.parse_args(argv)

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")

    inicio_relogio = time.monotonic()
    print(f"Importando {args.xlsx.name} (período {args.periodo_inicio} a {args.periodo_fim}, IBGE {args.ibge})")
    try:
        r = importar(args.xlsx, args.saida, args.periodo_inicio, args.periodo_fim, args.ibge, args.limite,
                     progresso=lambda msg: print(msg, flush=True))
    except ErroImportacao as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        return 2

    rc = resumo_cobertura(r.cobertura)
    print(f"Linhas lidas: {_fmt_int(r.linhas_lidas)} | válidas: {_fmt_int(r.linhas_validas)}"
          + (" (parcial: --limite)" if r.interrompido_no_limite or args.limite else ""))
    print(f"Linhas em ssp_bo.csv: {_fmt_int(sum(r.linhas_csv_por_natureza.values()))} | "
          f"duplicatas: {_fmt_int(sum(r.duplicatas.values()))} | "
          f"boletins com coordenada divergente entre naturezas: {_fmt_int(r.divergencia_coord)}")
    print("Descartes: " + ", ".join(f"{m}={_fmt_int(r.descartes.get(m, 0))}" for m in MOTIVOS_DESCARTE))
    print(f"Cobertura: {rc['quantidade']} circunscrições, média {_fmt_pct(rc['media'])}, "
          f"mínimo {_fmt_pct(rc['minimo'])}, {rc['abaixo_80']} com cobertura abaixo de 80%")
    print(f"Tempo: {time.monotonic() - inicio_relogio:.1f} s")
    print("Arquivos gravados:")
    for nome in ("ssp_bo.csv", "ssp_cobertura.csv", "ssp_panorama.csv", "importacao.json", "relatorio.md"):
        print(f"  {args.saida / nome}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
