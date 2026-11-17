"""Implementação de referência da DECISÃO da exposição estimada (VoltaSegura, B-06).

Espelha, em Python puro (só biblioteca padrão), as funções SQL de `003_exposicao.sql`:

- `binomial_bilateral(k, n, p)`  <->  `mobile_dados.binomial_bilateral`
- `vencedor_raio(...)`            <->  `mobile_dados.vencedor_raio`
- `decidir_par(x, y)`             <->  `mobile_dados.decidir_par`
- `decidir(rotas)`                <->  `mobile_dados.decidir_exposicao`

Esta referência NÃO faz a parte espacial (corredores, contagem de boletins, cobertura):
ela recebe, por rota, as contagens já medidas (N nos raios de 50, 100 e 150 m), a distância
a pé L em km e a cobertura (0..1 ou None). Serve para conferir a regra de
`docs/08_metodologia_comparacao_mvp.md` e o teste binomial contra o scipy.

Linguagem: o resultado descreve "exposição estimada" comparativa entre as alternativas
avaliadas. Não é classificação de trechos, não é probabilidade de vitimização e zero registro não é vantagem
(`docs/05_regras_linguagem_etica.md`).
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Optional, Sequence

# --- Parâmetros da regra (docs/08) ------------------------------------------------------
# [DECISÃO] (docs/08, 11/11/2026): cobertura mínima de 80% por alternativa e diferença
# máxima de 10 p.p. entre as alternativas de um par.
COBERTURA_MINIMA = 0.80
DIFERENCA_COBERTURA_MAXIMA = 0.10
# [DECISÃO] (docs/08): amostra mínima N_X + N_Y >= 10 no par.
AMOSTRA_MINIMA = 10
# [DECISÃO] (docs/08): nível de 5% do teste binomial exato bilateral.
ALFA = 0.05
# Decisão técnica deste worker (não é parâmetro de metodologia): tolerância numérica para
# comparar coberturas em ponto flutuante. Sem ela, 0,93 - 0,83 = 0,10000000000000009 seria
# lido como "diferença acima de 10 p.p.". O mesmo valor está no SQL.
EPS_COMPARACAO = 1e-9
# Tolerância relativa do método 'minlike' (a mesma do scipy.stats.binomtest).
TOLERANCIA_RELATIVA_MINLIKE = 1e-7
# Termos com ln(pmf) abaixo disto são ignorados na soma (e^-700 ~ 1e-304). No PostgreSQL,
# exp() de um valor muito negativo dá erro de underflow; o SQL usa o mesmo corte.
LN_MINIMO_TERMO = -700.0

# Resultados possíveis de um par (mesmos textos do SQL).
PAR_COBERTURA = "COBERTURA"
PAR_AMOSTRA = "AMOSTRA"
PAR_MISTOS = "MISTOS"
PAR_SEM_DIFERENCA = "SEM_DIFERENCA"
PAR_LARGURA = "LARGURA"
PAR_X = "X"
PAR_Y = "Y"


@dataclass(frozen=True)
class RotaMedida:
    """Medidas de uma rota já calculadas pelo serviço de dados.

    n50, n100, n150: boletins distintos (FURTO - OUTROS / ROUBO - OUTROS) na união dos
    corredores de ±50, ±100 e ±150 m dos trechos a pé, mesma faixa e mesmo período.
    l_km: soma das distâncias dos trechos a pé originais, em km (0 = sem trecho a pé).
    cobertura: fração 0..1 das circunscrições atravessadas, ou None se desconhecida.
    """

    n50: int
    n100: int
    n150: int
    l_km: float
    cobertura: Optional[float]


@dataclass(frozen=True)
class Decisao:
    caso: str
    motivo: Optional[str]
    # Índice (base 0) da rota com menor exposição estimada; só preenchido em CONCLUSIVO.
    vencedor: Optional[int]


# --- Teste binomial exato bilateral ('minlike') -----------------------------------------


def _ln_fatoriais(n: int) -> list[float]:
    """ln(i!) para i = 0..n, por soma acumulada de ln (o mesmo cálculo do SQL)."""
    ln_fat = [0.0] * (n + 1)
    for i in range(1, n + 1):
        ln_fat[i] = ln_fat[i - 1] + math.log(i)
    return ln_fat


def binomial_bilateral(k: int, n: int, p: float) -> float:
    """p-valor do teste binomial exato bilateral pelo método 'minlike'.

    Soma as probabilidades de todos os resultados i (0..n) cuja probabilidade é menor ou
    igual à do observado, com tolerância relativa: pmf(i) <= pmf(k) * (1 + 1e-7).
    Calculado em logaritmo: ln C(n, i) = ln n! - ln i! - ln (n-i)!, com ln de fatoriais
    obtido por soma de ln. Resultado limitado a 1. Deve coincidir com
    scipy.stats.binomtest(k, n, p).pvalue (conferido em test_referencia_exposicao.py).
    """
    if not (isinstance(k, int) and isinstance(n, int)):
        raise TypeError("k e n devem ser inteiros")
    if n < 0 or k < 0 or k > n or not (0.0 <= p <= 1.0):
        raise ValueError("binomial_bilateral: parâmetros fora do domínio")
    if n == 0:
        return 1.0
    # Casos degenerados (não ocorrem na regra, porque L_X > 0 e L_Y > 0).
    if p == 0.0:
        return 1.0 if k == 0 else 0.0
    if p == 1.0:
        return 1.0 if k == n else 0.0

    ln_fat = _ln_fatoriais(n)
    ln_p = math.log(p)
    ln_q = math.log(1.0 - p)

    def ln_pmf(i: int) -> float:
        return ln_fat[n] - ln_fat[i] - ln_fat[n - i] + i * ln_p + (n - i) * ln_q

    limite = ln_pmf(k) + math.log(1.0 + TOLERANCIA_RELATIVA_MINLIKE)
    soma = 0.0
    for i in range(0, n + 1):
        lp = ln_pmf(i)
        if lp <= limite and lp > LN_MINIMO_TERMO:
            soma += math.exp(lp)
    return min(soma, 1.0)


# --- Decisão ----------------------------------------------------------------------------


def vencedor_raio(nx: int, ny: int, lx: float, ly: float) -> Optional[str]:
    """'X' se N e D de X são ambos menores; 'Y' no simétrico; None se divergem ou empatam."""
    if nx < ny and nx / lx < ny / ly:
        return PAR_X
    if ny < nx and ny / ly < nx / lx:
        return PAR_Y
    return None


def _cobertura_falha(cx: Optional[float], cy: Optional[float]) -> bool:
    if cx is None or cy is None:
        return True
    if cx < COBERTURA_MINIMA - EPS_COMPARACAO or cy < COBERTURA_MINIMA - EPS_COMPARACAO:
        return True
    return abs(cx - cy) > DIFERENCA_COBERTURA_MAXIMA + EPS_COMPARACAO


def decidir_par(x: RotaMedida, y: RotaMedida) -> str:
    """Resultado da comparação do par X × Y (ambas com L > 0).

    [HIPÓTESE] Ordem de precedência dentro do par (docs/08 não fixa a ordem; é a proposta
    desta implementação e precisa ser confirmada pelo grupo):
      1. cobertura (None, < 80% em alguma, ou diferença > 10 p.p.)  -> COBERTURA
      2. amostra no raio de 100 m (N_X + N_Y < 10)                   -> AMOSTRA
      3. N e D não apontam a mesma rota (inclui empate)              -> MISTOS
      4. apontam a mesma, mas p >= 0,05                              -> SEM_DIFERENCA
      5. vale no 100, mas não vale no 50 ou no 150                   -> LARGURA
      6. vale nos três raios                                         -> X ou Y
    """
    if x.l_km <= 0 or y.l_km <= 0:
        raise ValueError("decidir_par exige L > 0 nas duas rotas")
    if _cobertura_falha(x.cobertura, y.cobertura):
        return PAR_COBERTURA
    if x.n100 + y.n100 < AMOSTRA_MINIMA:
        return PAR_AMOSTRA
    vencedor = vencedor_raio(x.n100, y.n100, x.l_km, y.l_km)
    if vencedor is None:
        return PAR_MISTOS
    # Sob igualdade de taxas por km, N_X ~ Binomial(N_X + N_Y, L_X / (L_X + L_Y)).
    p0 = x.l_km / (x.l_km + y.l_km)
    if binomial_bilateral(x.n100, x.n100 + y.n100, p0) >= ALFA:
        return PAR_SEM_DIFERENCA
    # Teste de sensibilidade obrigatório (docs/08): o mesmo vencedor, com amostra e p < 0,05,
    # nos corredores de ±50 m e ±150 m.
    for nx, ny in ((x.n50, y.n50), (x.n150, y.n150)):
        if nx + ny < AMOSTRA_MINIMA:
            return PAR_LARGURA
        if vencedor_raio(nx, ny, x.l_km, y.l_km) != vencedor:
            return PAR_LARGURA
        if binomial_bilateral(nx, nx + ny, p0) >= ALFA:
            return PAR_LARGURA
    return vencedor


def decidir(rotas: Sequence[RotaMedida]) -> Decisao:
    """Caso da consulta para 1 a 5 rotas.

    1. 1 rota                         -> SEM_COMPARACAO
    2. alguma rota com L = 0          -> NAO_APLICAVEL (nenhum destaque; zero não é vantagem)
    3. pares X × Y (decidir_par) e agregação:
       [HIPÓTESE] precedência NAO_APLICAVEL > CONCLUSIVO > INSUFICIENTE > MISTOS >
       SEM_DIFERENCA, e motivo COBERTURA > AMOSTRA > LARGURA. CONCLUSIVO exige que uma
       rota vença TODOS os seus pares (docs/08, D-11); pares entre as demais rotas não
       retiram o destaque.
    """
    k = len(rotas)
    if k < 1:
        raise ValueError("decidir exige ao menos 1 rota")
    if k == 1:
        return Decisao("SEM_COMPARACAO", None, None)
    if any(r.l_km <= 0 for r in rotas):
        return Decisao("NAO_APLICAVEL", None, None)

    vitorias = [0] * k
    outros: list[str] = []
    for i in range(k - 1):
        for j in range(i + 1, k):
            resultado = decidir_par(rotas[i], rotas[j])
            if resultado == PAR_X:
                vitorias[i] += 1
            elif resultado == PAR_Y:
                vitorias[j] += 1
            else:
                outros.append(resultado)

    for i in range(k):
        if vitorias[i] == k - 1:
            return Decisao("CONCLUSIVO", None, i)

    for motivo in (PAR_COBERTURA, PAR_AMOSTRA, PAR_LARGURA):
        if motivo in outros:
            return Decisao("INSUFICIENTE", motivo, None)
    if PAR_MISTOS in outros:
        return Decisao("MISTOS", None, None)
    return Decisao("SEM_DIFERENCA", None, None)
