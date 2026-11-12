using VoltaSegura.Domain.Servicos;
using Xunit;

namespace VoltaSegura.Tests;

/// <summary>
/// Testes do núcleo estatístico do VoltaSegura: teste binomial exato bilateral
/// (item 12 das decisões) com valores de referência calculáveis à mão.
/// </summary>
public class TesteBinomialExatoTests
{
    [Fact]
    public void PValorBilateral_CasoSimetrico_K1De10ComP05_Correto()
    {
        // P(X=0) = P(X=1) com n=10, p=0,5 → soma bilateral = 2 * (1/1024 + 10/1024)
        var esperado = 2.0 * (1.0 + 10.0) / 1024.0;

        var pvalor = TesteBinomialExato.PValorBilateral(1, 10, 0.5);

        Assert.Equal(esperado, pvalor, 12);
    }

    [Fact]
    public void PValorBilateral_ResultadoExatoDeAmbosOsLados_IgualA1()
    {
        // k = valor central (n/2, p=0,5): p-valor exato bilateral = 1.
        var pvalor = TesteBinomialExato.PValorBilateral(5, 10, 0.5);

        Assert.Equal(1.0, pvalor, 12);
    }

    [Fact]
    public void PValorBilateral_EstatisticaExtrema_AbaixoDoNivelDeSignificancia()
    {
        // Todos os 10 sucessos com p0=0,5 → p-valor = 2/1024 ≈ 0,001953125.
        var pvalor = TesteBinomialExato.PValorBilateral(10, 10, 0.5);

        Assert.Equal(2.0 / 1024.0, pvalor, 12);
        Assert.True(pvalor < AvaliadorComparacao.NivelSignificancia);
    }

    [Fact]
    public void PValorBilateral_AmostraVazia_Retorna1()
    {
        Assert.Equal(1.0, TesteBinomialExato.PValorBilateral(0, 0, 0.5));
    }
}
