using VoltaSegura.Domain.Servicos;
using Xunit;

namespace VoltaSegura.Tests;

/// <summary>
/// Testa o critério de estabilidade (item 16): resultado que muda com a largura do
/// corredor (±50/±100/±150 m) → dados insuficientes, nunca conveniência.
/// </summary>
public class EstabilidadeCorredorTests
{
    private static ResultadoComparacao Resultado(StatusComparacao status, string? rota)
        => new(status, rota, "motivo de teste", null, new Dictionary<string, double>());

    [Fact]
    public void Consolidar_ResultadosIguaisEmTodasAsLarguras_MantemReferencia()
    {
        var porLargura = new Dictionary<double, ResultadoComparacao>
        {
            [50] = Resultado(StatusComparacao.Conclusiva, "R2"),
            [100] = Resultado(StatusComparacao.Conclusiva, "R2"),
            [150] = Resultado(StatusComparacao.Conclusiva, "R2"),
        };

        var consolidado = EstabilidadeCorredor.Consolidar(porLargura);

        Assert.Equal(StatusComparacao.Conclusiva, consolidado.Status);
        Assert.Equal("R2", consolidado.RotaDestacada);
    }

    [Fact]
    public void Consolidar_ResultadoQueMudaComALargura_RetornaDadosInsuficientes()
    {
        var porLargura = new Dictionary<double, ResultadoComparacao>
        {
            [50] = Resultado(StatusComparacao.Conclusiva, "R1"),
            [100] = Resultado(StatusComparacao.Conclusiva, "R2"),
            [150] = Resultado(StatusComparacao.Divergente, null),
        };

        var consolidado = EstabilidadeCorredor.Consolidar(porLargura);

        Assert.Equal(StatusComparacao.DadosInsuficientes, consolidado.Status);
        Assert.Null(consolidado.RotaDestacada);
        Assert.Contains("largura do corredor", consolidado.Motivo);
    }
}
