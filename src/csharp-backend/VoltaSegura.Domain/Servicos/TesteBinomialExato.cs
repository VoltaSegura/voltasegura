namespace VoltaSegura.Domain.Servicos;

/// <summary>
/// Teste binomial exato bilateral (item 12 das decisões: "teste binomial exato bilateral a 5%").
/// Implementação pura e determinística, sem dependências externas — testável por unidade.
/// </summary>
public static class TesteBinomialExato
{
    /// <summary>
    /// P-valor bilateral de observar k sucessos em n tentativas com probabilidade nula p0.
    /// Soma todas as probabilidades pontuais menores ou iguais à observada (definição clássica
    /// do teste exato bilateral).
    /// </summary>
    /// <param name="k">Sucessos observados (ex.: boletins na rota X).</param>
    /// <param name="n">Total de tentativas (N_X + N_Y ≥ 10 — item 12).</param>
    /// <param name="p0">Probabilidade nula (ex.: km_X / (km_X + km_Y)).</param>
    public static double PValorBilateral(int k, int n, double p0)
    {
        if (n <= 0) return 1.0;
        if (k < 0 || k > n) throw new ArgumentOutOfRangeException(nameof(k));
        if (p0 is <= 0.0 or >= 1.0) return 0.0;

        var pObservada = ProbabilidadePonto(k, n, p0);
        // Limiar com folga numérica mínima para estabilidade de ponto flutuante.
        var limiar = pObservada * (1.0 + 1e-9);
        double pvalor = 0.0;
        for (var i = 0; i <= n; i++)
        {
            var pi = ProbabilidadePonto(i, n, p0);
            if (pi <= limiar) pvalor += pi;
        }

        return Math.Min(1.0, pvalor);
    }

    /// <summary>Probabilidade pontual da binomial, calculada em espaço logarítmico.</summary>
    public static double ProbabilidadePonto(int i, int n, double p0)
    {
        if (i < 0 || i > n) return 0.0;
        var logP = LogCoeficienteBinomial(n, i)
                   + i * Math.Log(p0)
                   + (n - i) * Math.Log(1.0 - p0);
        return Math.Exp(logP);
    }

    private static double LogCoeficienteBinomial(int n, int k)
        => LogFatorial(n) - LogFatorial(k) - LogFatorial(n - k);

    private static double LogFatorial(int n)
    {
        double soma = 0.0;
        for (var i = 2; i <= n; i++) soma += Math.Log(i);
        return soma;
    }
}
