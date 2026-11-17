"""Testes do importador SSP-SP (B-07) com uma planilha SINTÉTICA gerada na hora.

Rodar a partir da raiz do repositório:
    python -m unittest discover -s src/mobile-app/scripts/ssp -p "test_*.py" -v

Nenhum dado real é usado: todos os boletins, delegacias e coordenadas abaixo são inventados.
"""

from __future__ import annotations

import contextlib
import csv
import datetime as dt
import io
import json
import tempfile
import unittest
from pathlib import Path

import openpyxl

import importar_ssp as imp

# As 30 colunas da planilha real, na ordem publicada pela SSP-SP.
COLUNAS_REAIS = [
    "NOME_DEPARTAMENTO", "NOME_SECCIONAL", "NOME_DELEGACIA", "NOME_MUNICIPIO", "NUM_BO", "ANO_BO",
    "DATA_REGISTRO", "DATA_OCORRENCIA_BO", "HORA_OCORRENCIA_BO", "DESC_PERIODO", "DESCR_TIPOLOCAL",
    "DESCR_SUBTIPOLOCAL", "BAIRRO", "LOGRADOURO", "NUMERO_LOGRADOURO", "LATITUDE", "LONGITUDE",
    "NOME_DELEGACIA_CIRCUNSCRICAO", "NOME_DEPARTAMENTO_CIRCUNSCRICAO", "NOME_SECCIONAL_CIRCUNSCRICAO",
    "NOME_MUNICIPIO_CIRCUNSCRICAO", "RUBRICA", "DESCR_CONDUTA", "NATUREZA_APURADA", "MES_ESTATISTICA",
    "ANO_ESTATISTICA", "CMD", "BTL", "CIA", "COD IBGE",
]

LOGRADOURO_SINTETICO = "RUA FICTICIA DOS TESTES"
CIRC_A = "901º D.P. TESTE ALFA"
CIRC_B = "902º D.P. TESTE BETA"
PONTO_1 = (-23.55, -46.63)
PONTO_2 = (-23.60, -46.70)


def linha(num_bo, natureza, data=dt.datetime(2026, 3, 10), hora=dt.time(20, 30), periodo="NULL",
          lat=PONTO_1[0], lon=PONTO_1[1], circ=CIRC_A, ibge=3550308, delegacia="901º D.P. TESTE ALFA",
          ano_bo=2026, tipo_local="Via Pública"):
    """Monta uma linha com as 30 colunas reais; campos não usados recebem valores sintéticos."""
    valores = {
        "NOME_DEPARTAMENTO": "DEPTO TESTE", "NOME_SECCIONAL": "SECCIONAL TESTE", "NOME_DELEGACIA": delegacia,
        "NOME_MUNICIPIO": "S.PAULO" if ibge == 3550308 else "OUTRO MUNICIPIO", "NUM_BO": num_bo,
        "ANO_BO": ano_bo, "DATA_REGISTRO": data, "DATA_OCORRENCIA_BO": data, "HORA_OCORRENCIA_BO": hora,
        "DESC_PERIODO": periodo, "DESCR_TIPOLOCAL": tipo_local, "DESCR_SUBTIPOLOCAL": "Subtipo teste",
        "BAIRRO": "BAIRRO FICTICIO", "LOGRADOURO": LOGRADOURO_SINTETICO, "NUMERO_LOGRADOURO": 123,
        "LATITUDE": lat, "LONGITUDE": lon, "NOME_DELEGACIA_CIRCUNSCRICAO": circ,
        "NOME_DEPARTAMENTO_CIRCUNSCRICAO": "DEPTO TESTE", "NOME_SECCIONAL_CIRCUNSCRICAO": "SECCIONAL TESTE",
        "NOME_MUNICIPIO_CIRCUNSCRICAO": "S.PAULO", "RUBRICA": "Rubrica sintética", "DESCR_CONDUTA": "NULL",
        "NATUREZA_APURADA": natureza, "MES_ESTATISTICA": 3, "ANO_ESTATISTICA": 2026, "CMD": "CPA/TESTE",
        "BTL": "1º BPM/M", "CIA": "1ª CIA", "COD IBGE": ibge,
    }
    return [valores[c] for c in COLUNAS_REAIS]


# Aba 1 (JAN-JUN_2026)
ABA1 = [
    # T01: município fora de SP (Campinas, código fictício para o teste) -> descarte
    linha("ZZ0001", "FURTO - OUTROS", ibge=3509502),
    # T02: natureza fora da lista -> descarte
    linha("ZZ0002", "LESÃO CORPORAL DOLOSA"),
    # T03: BO com duas naturezas elegíveis, mesma coordenada e hora -> 2 linhas, 1 boletim na cobertura
    linha("ZZ0003", "FURTO - OUTROS"),
    linha("ZZ0003", "ROUBO - OUTROS"),
    # T04: linha duplicada (mesmo BO e natureza), com chave escrita de forma diferente -> 1 linha
    linha("ZZ0004", "FURTO - OUTROS", hora=dt.time(9, 0)),
    linha(" zz0004 ", "FURTO  -  OUTROS", hora=dt.time(9, 0), delegacia="901º D.P.  teste alfa "),
    # T05: sem hora, DESC_PERIODO "De madrugada" -> MADRUGADA
    linha("ZZ0005", "ROUBO - OUTROS", hora="NULL", periodo="De madrugada", circ=CIRC_B),
    # T06: "Em hora incerta" e sem hora -> sem faixa (fora do numerador de cobertura)
    linha("ZZ0006", "FURTO - OUTROS", hora="NULL", periodo="Em hora incerta", circ=CIRC_B),
    # T07: hora em texto "14:05:00" vence DESC_PERIODO discordante -> TARDE
    linha("ZZ0007", "FURTO DE VEÍCULO", hora="14:05:00", periodo="A noite"),
    # T08: coordenadas inválidas -> lat/lon vazias
    linha("ZZ0008", "FURTO - OUTROS", lat=None, lon=None, circ=CIRC_B),
    linha("ZZ0009", "FURTO - OUTROS", lat=0, lon=0, circ=CIRC_B),
    linha("ZZ0010", "ROUBO DE VEÍCULO", lat=-235091, lon=-466312),
    linha("ZZ0011", "ROUBO - OUTROS", lat="-", lon="-", circ=CIRC_B),
    # T09: data fora do período -> descarte
    linha("ZZ0012", "FURTO - OUTROS", data=dt.datetime(2025, 12, 31)),
    linha("ZZ0013", "ROUBO - OUTROS", data=dt.datetime(2026, 10, 1)),
]

# Aba 2 (JUL-DEZ_2026)
ABA2 = [
    # T10: panorama — ESTUPRO duas vezes no mesmo BO conta 1; homicídio doloso 1; demais 0
    linha("ZZ0020", "ESTUPRO", data=dt.datetime(2026, 7, 2)),
    linha("ZZ0020", "ESTUPRO", data=dt.datetime(2026, 7, 2)),
    linha("ZZ0021", "HOMICÍDIO DOLOSO", data=dt.datetime(2026, 8, 3)),
    # Panorama fora do período não conta
    linha("ZZ0022", "ESTUPRO DE VULNERÁVEL", data=dt.datetime(2026, 11, 3)),
    # T11: divergência de coordenada entre naturezas do mesmo BO -> cada uma com seu ponto
    linha("ZZ0030", "FURTO - OUTROS", data=dt.datetime(2026, 7, 5)),
    linha("ZZ0030", "FURTO DE VEÍCULO", data=dt.datetime(2026, 7, 5), lat=PONTO_2[0], lon=PONTO_2[1]),
    # T12: COD IBGE como texto de 6 dígitos (sem dígito verificador) -> aceito
    linha("ZZ0031", "LATROCÍNIO", data=dt.datetime(2026, 7, 6), ibge="355030"),
    # T13: linha totalmente vazia no meio da aba
    [None] * len(COLUNAS_REAIS),
    # T14: trânsito
    linha("ZZ0032", "LESÃO CORPORAL CULPOSA POR ACIDENTE DE TRÂNSITO", data=dt.datetime(2026, 8, 1),
          hora=dt.time(7, 15)),
]

TODOS_NUM_BO = sorted({r[COLUNAS_REAIS.index("NUM_BO")].strip().upper() for r in ABA1 + ABA2 if r[4]})


def criar_planilha(caminho: Path, colunas=COLUNAS_REAIS, aba1=ABA1, aba2=ABA2):
    wb = openpyxl.Workbook()
    doc = wb.active
    doc.title = "Campos da Tabela_SPDADOS"
    doc.append(["*Resultado Null indica que o campo se encontrava vazio no banco de dados", None])
    doc.append(["Campos", "Descrição"])
    for c in COLUNAS_REAIS:
        doc.append([c, "descrição sintética"])
    for titulo, linhas in (("JAN-JUN_2026", aba1), ("JUL-DEZ_2026", aba2)):
        ws = wb.create_sheet(titulo)
        ws.append(colunas)
        for r in linhas:
            ws.append([r[COLUNAS_REAIS.index(c)] if c in COLUNAS_REAIS else None for c in colunas])
    wb.save(caminho)


def ler_csv(caminho: Path):
    with open(caminho, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


class TestImportadorSintetico(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._tmp = tempfile.TemporaryDirectory()
        base = Path(cls._tmp.name)
        cls.xlsx = base / "sintetica.xlsx"
        cls.saida = base / "saida"
        criar_planilha(cls.xlsx)
        cls.r = imp.importar(cls.xlsx, cls.saida, dt.date(2026, 1, 1), dt.date(2026, 9, 30))
        cls.bo = ler_csv(cls.saida / "ssp_bo.csv")
        cls.cob = {l["circunscricao"]: l for l in ler_csv(cls.saida / "ssp_cobertura.csv")}
        cls.pan = {l["natureza"]: int(l["total"]) for l in ler_csv(cls.saida / "ssp_panorama.csv")}

    @classmethod
    def tearDownClass(cls):
        cls._tmp.cleanup()

    def linhas_do_bo(self, num_bo, natureza=None):
        chave = imp.calcular_chave_bo(num_bo, 2026, "901º D.P. TESTE ALFA")
        return [l for l in self.bo if l["chave_bo"] == chave and (natureza is None or l["natureza"] == natureza)]

    def test_cabecalhos_exatos_e_utf8_sem_bom(self):
        esperado = {
            "ssp_bo.csv": "chave_bo,natureza,data_ocorrencia,faixa,lat,lon,circunscricao,tipo_local",
            "ssp_cobertura.csv": "circunscricao,elegiveis_total,elegiveis_coord_faixa",
            "ssp_panorama.csv": "natureza,total",
        }
        for nome, cab in esperado.items():
            bruto = (self.saida / nome).read_bytes()
            self.assertFalse(bruto.startswith(b"\xef\xbb\xbf"), nome)
            self.assertEqual(bruto.decode("utf-8").splitlines()[0], cab, nome)
        self.assertFalse((self.saida / "ssp_bo.csv.parcial").exists())

    def test_importacao_json(self):
        dados = json.loads((self.saida / "importacao.json").read_text(encoding="utf-8"))
        self.assertEqual(
            set(dados),
            {"fonte", "arquivo_sha256", "periodo_inicio", "periodo_fim", "linhas_lidas", "linhas_validas", "gerado_em"},
        )
        self.assertEqual(dados["fonte"], "SSP-SP SPDadosCriminais_2026")
        self.assertEqual(dados["arquivo_sha256"], imp.sha256_arquivo(self.xlsx))
        self.assertEqual(len(dados["arquivo_sha256"]), 64)
        self.assertEqual((dados["periodo_inicio"], dados["periodo_fim"]), ("2026-01-01", "2026-09-30"))
        self.assertEqual(dados["linhas_lidas"], len(ABA1) + len(ABA2))
        self.assertIsNotNone(dt.datetime.fromisoformat(dados["gerado_em"]).tzinfo)

    def test_abas_documentacao_ignorada(self):
        self.assertEqual(self.r.abas_dados, ["JAN-JUN_2026", "JUL-DEZ_2026"])
        self.assertEqual(self.r.abas_ignoradas, ["Campos da Tabela_SPDADOS"])

    def test_descartes_por_motivo(self):
        d = self.r.descartes
        self.assertEqual(d["municipio_fora"], 1)
        self.assertEqual(d["natureza_fora_recorte"], 1)
        self.assertEqual(d["data_fora_periodo"], 3)  # 2025-12-31, 2026-10-01 e o panorama de novembro
        self.assertEqual(d["linha_vazia"], 1)
        self.assertEqual(sum(d.values()) + self.r.linhas_validas, self.r.linhas_lidas)

    def test_municipio_e_natureza_fora_nao_viram_linha(self):
        self.assertEqual(self.linhas_do_bo("ZZ0001"), [])
        self.assertEqual(self.linhas_do_bo("ZZ0002"), [])
        self.assertEqual(self.linhas_do_bo("ZZ0012"), [])
        self.assertEqual(self.linhas_do_bo("ZZ0013"), [])

    def test_bo_com_duas_naturezas(self):
        linhas = self.linhas_do_bo("ZZ0003")
        self.assertEqual(sorted(l["natureza"] for l in linhas), ["FURTO - OUTROS", "ROUBO - OUTROS"])

    def test_duplicata_com_chave_normalizada(self):
        self.assertEqual(len(self.linhas_do_bo("ZZ0004")), 1)
        self.assertEqual(self.r.duplicatas["FURTO - OUTROS"], 1)
        self.assertEqual(self.r.duplicatas_com_valores_diferentes, 0)
        self.assertEqual(
            imp.calcular_chave_bo(" zz0004 ", "2026", "901º D.P.  teste alfa "),
            imp.calcular_chave_bo("ZZ0004", 2026, "901º D.P. TESTE ALFA"),
        )

    def test_faixas(self):
        self.assertEqual(self.linhas_do_bo("ZZ0003", "FURTO - OUTROS")[0]["faixa"], "NOITE")  # hora 20:30
        self.assertEqual(self.linhas_do_bo("ZZ0004")[0]["faixa"], "MANHA")  # hora 09:00
        self.assertEqual(self.linhas_do_bo("ZZ0005")[0]["faixa"], "MADRUGADA")  # DESC_PERIODO
        self.assertEqual(self.linhas_do_bo("ZZ0006")[0]["faixa"], "")  # Em hora incerta
        self.assertEqual(self.linhas_do_bo("ZZ0007")[0]["faixa"], "TARDE")  # hora em texto vence
        self.assertEqual(self.r.hora_e_periodo_divergentes, 1)
        self.assertEqual(self.r.desc_periodo["hora_incerta"], 1)

    def test_coordenadas_invalidas_ficam_vazias(self):
        for num in ("ZZ0008", "ZZ0009", "ZZ0010", "ZZ0011"):
            l = self.linhas_do_bo(num)[0]
            self.assertEqual((l["lat"], l["lon"]), ("", ""), num)
        self.assertEqual(self.r.coordenada["ausente"], 2)
        self.assertEqual(self.r.coordenada["zero"], 1)
        self.assertEqual(self.r.coordenada["fora_retangulo"], 1)
        l = self.linhas_do_bo("ZZ0003", "FURTO - OUTROS")[0]
        self.assertEqual((float(l["lat"]), float(l["lon"])), PONTO_1)

    def test_divergencia_de_coordenada_entre_naturezas(self):
        furto = self.linhas_do_bo("ZZ0030", "FURTO - OUTROS")[0]
        veiculo = self.linhas_do_bo("ZZ0030", "FURTO DE VEÍCULO")[0]
        self.assertEqual((float(furto["lat"]), float(furto["lon"])), PONTO_1)
        self.assertEqual((float(veiculo["lat"]), float(veiculo["lon"])), PONTO_2)
        self.assertEqual(self.r.divergencia_coord, 1)
        self.assertEqual(self.r.bos_multinatureza, 2)  # ZZ0003 e ZZ0030
        self.assertEqual(self.r.divergencia_faixa, 0)

    def test_ibge_seis_digitos_e_transito(self):
        self.assertEqual(len(self.linhas_do_bo("ZZ0031", "LATROCÍNIO")), 1)
        self.assertEqual(self.linhas_do_bo("ZZ0032")[0]["faixa"], "MANHA")
        self.assertEqual(self.r.formatos_ibge["str:6 dígitos"], 1)

    def test_panorama_agregado_sem_linha(self):
        self.assertEqual(self.pan, {
            "HOMICÍDIO DOLOSO": 1, "TENTATIVA DE HOMICÍDIO": 0, "ESTUPRO": 1, "ESTUPRO DE VULNERÁVEL": 0,
        })
        naturezas_csv = {l["natureza"] for l in self.bo}
        self.assertFalse(naturezas_csv & set(imp.NATUREZAS_PANORAMA))
        self.assertEqual(self.linhas_do_bo("ZZ0020"), [])

    def test_cobertura_por_circunscricao(self):
        # Alfa: ZZ0003 (1 boletim, 2 naturezas), ZZ0004, ZZ0030 -> 3 elegíveis, todos completos.
        self.assertEqual(self.cob[CIRC_A], {"circunscricao": CIRC_A, "elegiveis_total": "3", "elegiveis_coord_faixa": "3"})
        # Beta: ZZ0005 (ok), ZZ0006 (sem faixa), ZZ0008/ZZ0009/ZZ0011 (sem coordenada) -> 1 de 5.
        self.assertEqual(self.cob[CIRC_B], {"circunscricao": CIRC_B, "elegiveis_total": "5", "elegiveis_coord_faixa": "1"})
        rc = imp.resumo_cobertura(self.r.cobertura)
        self.assertEqual(rc["abaixo_80"], 1)
        self.assertAlmostEqual(rc["media"], 60.0)
        self.assertEqual(rc["minimo_circunscricao"], CIRC_B)

    def test_relatorio(self):
        texto = (self.saida / "relatorio.md").read_text(encoding="utf-8")
        self.assertIn("cobertura abaixo de 80%", texto)
        self.assertIn("JAN-JUN_2026", texto)
        for proibido in ("perigos", "rota segura", "área de risco", "area de risco"):
            self.assertNotIn(proibido, texto.lower())

    def test_nenhum_dado_identificador_nas_saidas(self):
        for nome in ("ssp_bo.csv", "ssp_cobertura.csv", "ssp_panorama.csv", "importacao.json", "relatorio.md"):
            conteudo = (self.saida / nome).read_text(encoding="utf-8").upper()
            for num in TODOS_NUM_BO:
                self.assertNotIn(num, conteudo, f"{num} em {nome}")
            for proibido in (LOGRADOURO_SINTETICO, "BAIRRO FICTICIO", "RUBRICA SINTÉTICA"):
                self.assertNotIn(proibido, conteudo, f"{proibido} em {nome}")


class TestErrosELinhaDeComando(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.base = Path(self._tmp.name)

    def tearDown(self):
        self._tmp.cleanup()

    def test_coluna_obrigatoria_ausente(self):
        xlsx = self.base / "sem_coluna.xlsx"
        criar_planilha(xlsx, colunas=[c for c in COLUNAS_REAIS if c != "COD IBGE"])
        with self.assertRaises(imp.ErroImportacao) as ctx:
            imp.importar(xlsx, self.base / "saida", dt.date(2026, 1, 1), dt.date(2026, 9, 30))
        self.assertIn("COD IBGE", str(ctx.exception))
        self.assertIn("JAN-JUN_2026", str(ctx.exception))
        self.assertFalse((self.base / "saida" / "ssp_bo.csv").exists())
        self.assertFalse((self.base / "saida" / "ssp_bo.csv.parcial").exists())

    def test_main_imprime_so_agregados(self):
        xlsx = self.base / "sintetica.xlsx"
        criar_planilha(xlsx)
        saida_terminal = io.StringIO()
        with contextlib.redirect_stdout(saida_terminal):
            codigo = imp.main(["--xlsx", str(xlsx), "--saida", str(self.base / "saida")])
        self.assertEqual(codigo, 0)
        texto = saida_terminal.getvalue()
        self.assertIn("Linhas lidas", texto)
        for num in TODOS_NUM_BO:
            self.assertNotIn(num, texto.upper())
        self.assertNotIn("-23.55", texto)

    def test_main_erro_de_esquema_retorna_2(self):
        xlsx = self.base / "sem_coluna.xlsx"
        criar_planilha(xlsx, colunas=[c for c in COLUNAS_REAIS if c != "NATUREZA_APURADA"])
        erro = io.StringIO()
        with contextlib.redirect_stderr(erro), contextlib.redirect_stdout(io.StringIO()):
            codigo = imp.main(["--xlsx", str(xlsx), "--saida", str(self.base / "saida")])
        self.assertEqual(codigo, 2)
        self.assertIn("NATUREZA_APURADA", erro.getvalue())

    def test_limite(self):
        xlsx = self.base / "sintetica.xlsx"
        criar_planilha(xlsx)
        r = imp.importar(xlsx, self.base / "saida", dt.date(2026, 1, 1), dt.date(2026, 9, 30), limite=4)
        self.assertEqual(r.linhas_lidas, 4)
        self.assertTrue(r.interrompido_no_limite)
        self.assertIn("--limite 4", (self.base / "saida" / "relatorio.md").read_text(encoding="utf-8"))


class TestFuncoesPuras(unittest.TestCase):
    def test_ibge(self):
        self.assertTrue(imp.ibge_confere(3550308, "3550308"))
        self.assertTrue(imp.ibge_confere("3550308", "3550308"))
        self.assertTrue(imp.ibge_confere(3550308.0, "3550308"))
        self.assertTrue(imp.ibge_confere(355030, "3550308"))
        self.assertFalse(imp.ibge_confere(3509502, "3550308"))
        self.assertFalse(imp.ibge_confere("NULL", "3550308"))

    def test_hora(self):
        self.assertEqual(imp.ler_hora(dt.time(23, 59)), 23)
        self.assertEqual(imp.ler_hora("05:59:00"), 5)
        self.assertEqual(imp.ler_hora("6:00"), 6)
        self.assertIsNone(imp.ler_hora("NULL"))
        self.assertIsNone(imp.ler_hora("25:00:00"))
        self.assertIsNone(imp.ler_hora(None))
        self.assertEqual([imp.faixa_da_hora(h) for h in (0, 5, 6, 11, 12, 17, 18, 23)],
                         ["MADRUGADA", "MADRUGADA", "MANHA", "MANHA", "TARDE", "TARDE", "NOITE", "NOITE"])

    def test_desc_periodo(self):
        self.assertEqual(imp.faixa_do_periodo("Pela manhã"), ("MANHA", "mapeado"))
        self.assertEqual(imp.faixa_do_periodo(" A  noite "), ("NOITE", "mapeado"))
        self.assertEqual(imp.faixa_do_periodo("Em hora incerta"), (None, "hora_incerta"))
        self.assertEqual(imp.faixa_do_periodo("NULL"), (None, "vazio"))
        self.assertEqual(imp.faixa_do_periodo("Ao entardecer"), (None, "desconhecido"))

    def test_natureza_literal(self):
        # Sem aproximação textual: variação de grafia não entra.
        self.assertNotIn(imp.normalizar_espacos("Furto - Outros"), imp.NATUREZAS_LINHA)
        self.assertNotIn(imp.normalizar_espacos("FURTO DE VEICULO"), imp.NATUREZAS_LINHA)
        self.assertIn(imp.normalizar_espacos("  FURTO  DE VEÍCULO "), imp.NATUREZAS_LINHA)

    def test_ponto(self):
        self.assertEqual(imp.validar_ponto(-23.55, -46.63), (-23.55, -46.63, "valida"))
        self.assertEqual(imp.validar_ponto("-23.55", "-46.63"), (-23.55, -46.63, "valida"))
        self.assertEqual(imp.validar_ponto("NULL", -46.63)[2], "ausente")
        self.assertEqual(imp.validar_ponto(0, 0)[2], "zero")
        self.assertEqual(imp.validar_ponto(-22.9, -47.06)[2], "fora_retangulo")
        self.assertEqual(imp.validar_ponto(-46.63, -23.55)[2], "fora_retangulo")  # trocadas não são corrigidas
        self.assertEqual(imp.validar_ponto("abc", -46.63)[2], "nao_numerica")

    def test_chave(self):
        chave = imp.calcular_chave_bo("AB1234", 2026, "1º D.P. SE")
        self.assertRegex(chave, r"^[0-9a-f]{64}$")
        self.assertEqual(chave, imp.calcular_chave_bo(" ab1234", "2026", "1º d.p.   se"))
        self.assertNotEqual(chave, imp.calcular_chave_bo("AB1234", 2026, "2º D.P. SE"))
        self.assertIsNone(imp.calcular_chave_bo("NULL", 2026, "1º D.P. SE"))


if __name__ == "__main__":
    unittest.main()
