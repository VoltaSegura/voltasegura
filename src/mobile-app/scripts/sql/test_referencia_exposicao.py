"""Testes da referência da exposição estimada (unittest; scipy só como oráculo).

Rodar a partir da raiz do repositório:
    python -m unittest discover -s src/mobile-app/scripts/sql -p "test_*.py" -v

Os casos de decisão de CASOS_DECISAO são os mesmos do bloco "decisão" de 004_testes.sql
(mesmos números, mesma expectativa), para que SQL e Python sejam conferidos pela mesma tabela.
Todos os números são sintéticos.
"""

from __future__ import annotations

import itertools
import math
import random
import unittest

from scipy.stats import binomtest

from referencia_exposicao import (
    ALFA,
    PAR_AMOSTRA,
    PAR_COBERTURA,
    PAR_LARGURA,
    PAR_MISTOS,
    PAR_SEM_DIFERENCA,
    PAR_X,
    PAR_Y,
    Decisao,
    RotaMedida,
    binomial_bilateral,
    decidir,
    decidir_par,
    vencedor_raio,
)


def R(n50: int, n100: int, n150: int, l_km: float = 1.0, cobertura=0.85) -> RotaMedida:
    return RotaMedida(n50=n50, n100=n100, n150=n150, l_km=l_km, cobertura=cobertura)


# Valores de referência gerados com scipy 1.15.2 (scipy.stats.binomtest(k, n, p).pvalue).
# Os mesmos números estão colados em 004_testes.sql, onde não há scipy.
REFERENCIA_BINOMIAL = [
    (8, 29, 0.9 / 2.3, 0.2545866373956896),
    (1, 10, 0.5, 0.021484375),
    (1, 9, 0.5, 0.0390625),
    (0, 10, 0.5, 0.001953125),
    (10, 10, 0.5, 0.001953125),
    (4, 12, 0.5, 0.3876953125),
    (5, 5, 0.5, 0.0625),
    (12, 43, 0.5, 0.005401572654591291),
    (31, 43, 0.5, 0.005401572654591291),
    (1, 13, 0.5, 0.00341796875),
    (3, 7, 1 / 3, 0.692729766803841),
    (0, 15, 0.1, 0.3899522012010401),
    (3, 10, 0.3, 1.0),
    (0, 1, 0.5, 1.0),
    (450, 2000, 0.25, 0.009800968706063173),
    (980, 2000, 0.5, 0.38317685533523665),
    (900, 2000, 0.5, 8.457089535503813e-06),
    (1000, 2000, 0.5, 1.0),
    (30, 2000, 0.02, 0.1281760288603639),
]


# (nome, rotas, caso, motivo, vencedor) — espelhado em 004_testes.sql.
CASOS_DECISAO = [
    ("uma_rota", [R(0, 0, 0)], "SEM_COMPARACAO", None, None),
    ("l_zero_duas", [R(1, 1, 1), R(0, 0, 0, l_km=0.0)], "NAO_APLICAVEL", None, None),
    ("l_zero_tres_com_vencedor", [R(1, 1, 1), R(12, 12, 12), R(0, 0, 0, l_km=0.0)],
     "NAO_APLICAVEL", None, None),
    ("amostra_9", [R(1, 1, 1), R(8, 8, 8)], "INSUFICIENTE", "AMOSTRA", None),
    ("amostra_10", [R(1, 1, 1), R(9, 9, 9)], "CONCLUSIVO", None, 0),
    ("cobertura_0799", [R(1, 1, 1, cobertura=0.799), R(9, 9, 9)], "INSUFICIENTE", "COBERTURA", None),
    ("cobertura_080", [R(1, 1, 1, cobertura=0.80), R(9, 9, 9)], "CONCLUSIVO", None, 0),
    ("diferenca_010", [R(1, 1, 1, cobertura=0.80), R(9, 9, 9, cobertura=0.90)], "CONCLUSIVO", None, 0),
    ("diferenca_0101", [R(1, 1, 1, cobertura=0.80), R(9, 9, 9, cobertura=0.901)],
     "INSUFICIENTE", "COBERTURA", None),
    ("diferenca_010_flutuante", [R(1, 1, 1, cobertura=0.83), R(9, 9, 9, cobertura=0.93)],
     "CONCLUSIVO", None, 0),
    ("cobertura_nula", [R(1, 1, 1, cobertura=None), R(9, 9, 9)], "INSUFICIENTE", "COBERTURA", None),
    ("mistos_n_d", [R(10, 10, 10, l_km=0.5), R(15, 15, 15, l_km=1.5)], "MISTOS", None, None),
    ("mistos_empate", [R(6, 6, 6), R(6, 6, 6)], "MISTOS", None, None),
    ("sem_diferenca_exemplo_docs08", [R(8, 8, 8, l_km=0.9), R(21, 21, 21, l_km=1.4)],
     "SEM_DIFERENCA", None, None),
    ("sem_diferenca_4_8", [R(4, 4, 4), R(8, 8, 8)], "SEM_DIFERENCA", None, None),
    ("largura_amostra_50", [R(0, 1, 1), R(5, 9, 12)], "INSUFICIENTE", "LARGURA", None),
    ("largura_p_150", [R(1, 1, 4), R(9, 9, 12)], "INSUFICIENTE", "LARGURA", None),
    ("largura_vencedor_muda_150", [R(1, 1, 31), R(12, 12, 12)], "INSUFICIENTE", "LARGURA", None),
    ("largura_empate_150", [R(1, 1, 12), R(12, 12, 12)], "INSUFICIENTE", "LARGURA", None),
    ("vencedor_y", [R(12, 12, 12), R(1, 1, 1)], "CONCLUSIVO", None, 1),
    ("tres_conclusivo", [R(1, 1, 1), R(12, 12, 12), R(12, 12, 12)], "CONCLUSIVO", None, 0),
    ("tres_amostra_vence_sem_diferenca", [R(1, 1, 1), R(12, 12, 12), R(4, 4, 4)],
     "INSUFICIENTE", "AMOSTRA", None),
    ("tres_cobertura_vence_largura",
     [R(1, 1, 31), R(12, 12, 12), R(12, 12, 12, cobertura=0.70)], "INSUFICIENTE", "COBERTURA", None),
    ("tres_largura_vence_mistos", [R(1, 1, 31), R(12, 12, 12), R(12, 12, 12)],
     "INSUFICIENTE", "LARGURA", None),
    ("tres_mistos_vence_sem_diferenca", [R(6, 6, 6), R(12, 12, 12), R(6, 6, 6, l_km=0.5)],
     "MISTOS", None, None),
    ("tres_conclusivo_com_par_alheio_insuficiente",
     [R(1, 1, 1, cobertura=0.85), R(12, 12, 12, cobertura=0.80), R(12, 12, 12, cobertura=0.905)],
     "CONCLUSIVO", None, 0),
    ("cinco_conclusivo", [R(12, 12, 12)] * 4 + [R(1, 1, 1)], "CONCLUSIVO", None, 4),
    ("cinco_um_par_amostra", [R(1, 1, 1)] + [R(12, 12, 12)] * 3 + [R(5, 5, 5)],
     "INSUFICIENTE", "AMOSTRA", None),
]


class TesteBinomialBilateral(unittest.TestCase):
    def assertPvalorIgual(self, obtido: float, esperado: float, contexto) -> None:
        self.assertTrue(
            math.isclose(obtido, esperado, rel_tol=1e-9, abs_tol=1e-15),
            f"{contexto}: obtido={obtido!r} esperado={esperado!r}",
        )

    def test_valores_de_referencia_colados(self):
        for k, n, p, esperado in REFERENCIA_BINOMIAL:
            with self.subTest(k=k, n=n, p=p):
                self.assertPvalorIgual(binomial_bilateral(k, n, p), esperado, (k, n, p))
                # Os números colados conferem com o scipy instalado.
                self.assertPvalorIgual(binomtest(k, n, p).pvalue, esperado, ("scipy", k, n, p))

    def test_grade_contra_scipy(self):
        ps = [0.05, 0.1, 0.2, 0.25, 1 / 3, 0.4, 0.45, 0.5, 0.55, 0.6, 0.7, 0.9, 0.95]
        for n in (1, 2, 3, 5, 9, 10, 11, 13, 20, 29, 50, 100):
            for p in ps:
                for k in range(0, n + 1):
                    with self.subTest(k=k, n=n, p=p):
                        self.assertPvalorIgual(
                            binomial_bilateral(k, n, p), binomtest(k, n, p).pvalue, (k, n, p)
                        )

    def test_n_grande_contra_scipy(self):
        # n grande (2000): pontos espalhados, incluindo caudas com p-valor pequeno.
        for n, p in ((2000, 0.5), (2000, 0.25), (2000, 0.02), (1500, 0.37), (2000, 0.8)):
            media = n * p
            dp = math.sqrt(n * p * (1 - p))
            ks = {0, n} | {
                int(round(media + z * dp)) for z in (-6, -4, -3, -2.5, -2, -1, -0.3, 0, 0.3, 1, 2, 2.5, 3, 4, 6)
            }
            for k in sorted(x for x in ks if 0 <= x <= n):
                esperado = binomtest(k, n, p).pvalue
                if esperado < 1e-290:
                    continue  # abaixo do corte de termos (LN_MINIMO_TERMO); irrelevante para alfa=0,05
                with self.subTest(k=k, n=n, p=p):
                    self.assertPvalorIgual(binomial_bilateral(k, n, p), esperado, (k, n, p))

    def test_aleatorio_contra_scipy(self):
        gerador = random.Random(20261115)
        for _ in range(300):
            n = gerador.randint(1, 400)
            p = gerador.uniform(0.01, 0.99)
            k = gerador.randint(0, n)
            with self.subTest(k=k, n=n, p=p):
                self.assertPvalorIgual(binomial_bilateral(k, n, p), binomtest(k, n, p).pvalue, (k, n, p))

    def test_simetria_e_limites(self):
        self.assertEqual(binomial_bilateral(0, 0, 0.5), 1.0)
        for k, n, p in ((3, 17, 0.3), (40, 100, 0.55), (1, 10, 0.5)):
            self.assertAlmostEqual(binomial_bilateral(k, n, p), binomial_bilateral(n - k, n, 1 - p), places=12)
            self.assertLessEqual(binomial_bilateral(k, n, p), 1.0)

    def test_dominio_invalido(self):
        for k, n, p in ((-1, 5, 0.5), (6, 5, 0.5), (1, -1, 0.5), (1, 5, -0.1), (1, 5, 1.1)):
            with self.subTest(k=k, n=n, p=p):
                with self.assertRaises(ValueError):
                    binomial_bilateral(k, n, p)


class TesteDecisao(unittest.TestCase):
    def test_casos_da_tabela(self):
        for nome, rotas, caso, motivo, vencedor in CASOS_DECISAO:
            with self.subTest(nome=nome):
                self.assertEqual(decidir(rotas), Decisao(caso, motivo, vencedor))

    def test_pares_explicitos(self):
        self.assertEqual(decidir_par(R(1, 1, 1), R(9, 9, 9)), PAR_X)
        self.assertEqual(decidir_par(R(9, 9, 9), R(1, 1, 1)), PAR_Y)
        self.assertEqual(decidir_par(R(1, 1, 1), R(8, 8, 8)), PAR_AMOSTRA)
        self.assertEqual(decidir_par(R(1, 1, 1, cobertura=None), R(9, 9, 9)), PAR_COBERTURA)
        self.assertEqual(decidir_par(R(6, 6, 6), R(6, 6, 6)), PAR_MISTOS)
        self.assertEqual(decidir_par(R(4, 4, 4), R(8, 8, 8)), PAR_SEM_DIFERENCA)
        self.assertEqual(decidir_par(R(1, 1, 31), R(12, 12, 12)), PAR_LARGURA)
        # Cobertura é checada antes da amostra (precedência [HIPÓTESE]).
        self.assertEqual(decidir_par(R(0, 0, 0, cobertura=0.5), R(1, 1, 1)), PAR_COBERTURA)

    def test_vencedor_raio(self):
        self.assertEqual(vencedor_raio(1, 9, 1.0, 1.0), PAR_X)
        self.assertEqual(vencedor_raio(9, 1, 1.0, 1.0), PAR_Y)
        self.assertIsNone(vencedor_raio(5, 5, 1.0, 1.0))  # empate em N
        self.assertIsNone(vencedor_raio(2, 4, 1.0, 2.0))  # empate em D
        self.assertIsNone(vencedor_raio(10, 15, 0.5, 1.5))  # N e D divergentes

    def test_zero_registro_nao_e_vantagem_sozinho(self):
        # Zero contra poucos registros: amostra insuficiente, nenhum destaque.
        self.assertEqual(decidir([R(0, 0, 0), R(5, 5, 5)]), Decisao("INSUFICIENTE", "AMOSTRA", None))
        # Sem trecho a pé (N = 0 por construção): nunca vira destaque.
        self.assertEqual(decidir([R(0, 0, 0, l_km=0.0), R(30, 30, 30)]), Decisao("NAO_APLICAVEL", None, None))

    def test_casos_dependem_do_p_valor_esperado(self):
        # Confere as premissas numéricas dos casos da tabela (evita caso "certo por acaso").
        self.assertLess(binomtest(1, 10, 0.5).pvalue, ALFA)
        self.assertGreaterEqual(binomtest(4, 16, 0.5).pvalue, ALFA)  # largura_p_150
        self.assertGreaterEqual(binomtest(4, 12, 0.5).pvalue, ALFA)  # sem_diferenca_4_8
        self.assertLess(binomtest(12, 43, 0.5).pvalue, ALFA)  # vencedor muda no 150
        self.assertGreaterEqual(binomtest(8, 29, 0.9 / 2.3).pvalue, ALFA)  # exemplo docs/08

    def test_ordem_das_rotas_nao_muda_o_caso(self):
        for nome, rotas, caso, motivo, vencedor in CASOS_DECISAO:
            if len(rotas) > 3:
                continue
            for perm in itertools.permutations(range(len(rotas))):
                reordenadas = [rotas[i] for i in perm]
                d = decidir(reordenadas)
                with self.subTest(nome=nome, perm=perm):
                    self.assertEqual((d.caso, d.motivo), (caso, motivo))
                    if vencedor is not None:
                        self.assertEqual(perm[d.vencedor], vencedor)

    def test_entrada_vazia(self):
        with self.assertRaises(ValueError):
            decidir([])


if __name__ == "__main__":
    unittest.main()
