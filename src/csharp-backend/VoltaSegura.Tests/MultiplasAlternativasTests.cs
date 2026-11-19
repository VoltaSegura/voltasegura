using VoltaSegura.Domain.Servicos;

namespace VoltaSegura.Tests;

public class MultiplasAlternativasTests
{
    private static ResultadoComparacao Avaliar(params CenarioRota[] rotas) => ComparadorAlternativas.Avaliar(
        new Dictionary<double, IReadOnlyList<CenarioRota>> { [50] = rotas, [100] = rotas, [150] = rotas });
    [Fact]
    public void VencedoraDaQuintaRota_EComparadaComTodas()
    {
        var r = Avaliar(new("R1", 90, 1, .9), new("R2", 100, 1, .9), new("R3", 110, 1, .9),
            new("R4", 120, 1, .9), new("R5", 10, 1, .9));
        Assert.Equal("R5", r.RotaDestacada);
        Assert.Equal(5, r.ExposicaoEstimadaPorRota.Count);
    }
    [Fact]
    public void VencerPrimeiroPar_NaoBastaSeEmpataComTerceira()
    {
        var r = Avaliar(new("R1", 10, 1, .9), new("R2", 90, 1, .9), new("R3", 10, 1, .9));
        Assert.Null(r.RotaDestacada);
    }
    [Fact]
    public void CaminhadaZero_TemIndicadorNuloEBloqueiaDestaque()
    {
        var r = Avaliar(new("R1", 10, 1, .9), new("R2", 90, 1, .9), new("R3", 0, 0, .9));
        Assert.Null(r.RotaDestacada);
        Assert.Null(r.ExposicaoEstimadaPorRota["R3"]);
    }
    [Fact]
    public void UmaRota_NaoRecebeDestaque() => Assert.Null(Avaliar(new CenarioRota("R1", 10, 1, .9)).RotaDestacada);
}
