using VoltaSegura.Domain.Servicos;
using Xunit;

namespace VoltaSegura.Tests;

/// <summary>
/// Testa a regra de comparação acordada (itens 11, 12 e 16 das decisões do grupo,
/// 11/11/2026) — a mesma que o serviço de comparação usa em produção.
/// </summary>
public class AvaliadorComparacaoTests
{
    private static CenarioRota Rota(string id, int n, double km, double cobertura)
        => new(id, n, km, cobertura);

    [Fact]
    public void Avaliar_AmostraAbaixoDe10_RetornaDadosInsuficientes()
    {
        var avaliador = new AvaliadorComparacao();

        var resultado = avaliador.Avaliar(Rota("R1", 3, 0.8, 0.95), Rota("R2", 4, 0.7, 0.95));

        Assert.Equal(StatusComparacao.DadosInsuficientes, resultado.Status);
        Assert.Null(resultado.RotaDestacada);
        Assert.StartsWith(AvaliadorComparacao.FraseDadosInsuficientes, resultado.Motivo);
        Assert.Contains("menos de 10 registros no total", resultado.Motivo);
    }

    [Fact]
    public void Avaliar_CoberturaAbaixoDe80_RetornaDadosInsuficientes()
    {
        var avaliador = new AvaliadorComparacao();

        var resultado = avaliador.Avaliar(Rota("R1", 30, 0.8, 0.79), Rota("R2", 5, 0.7, 0.95));

        Assert.Equal(StatusComparacao.DadosInsuficientes, resultado.Status);
        Assert.Contains("cobertura", resultado.Motivo);
        Assert.StartsWith(AvaliadorComparacao.FraseDadosInsuficientes, resultado.Motivo);
    }

    [Fact]
    public void Avaliar_DiferencaDeCoberturaAcimaDe10Pp_RetornaDadosInsuficientes()
    {
        var avaliador = new AvaliadorComparacao();

        var resultado = avaliador.Avaliar(Rota("R1", 30, 0.8, 0.99), Rota("R2", 5, 0.7, 0.88));

        Assert.Equal(StatusComparacao.DadosInsuficientes, resultado.Status);
        Assert.Contains("10 p.p.", resultado.Motivo);
        Assert.StartsWith(AvaliadorComparacao.FraseDadosInsuficientes, resultado.Motivo);
    }

    [Fact]
    public void Avaliar_SemTrechoCaminhado_RetornaDadosInsuficientes()
    {
        // Regra do item 11: só trechos caminhados entram na comparação.
        var avaliador = new AvaliadorComparacao();

        var resultado = avaliador.Avaliar(Rota("R1", 30, 0.0, 0.9), Rota("R2", 5, 0.7, 0.9));

        Assert.Equal(StatusComparacao.DadosInsuficientes, resultado.Status);
        Assert.Contains("trecho caminhado", resultado.Motivo);
    }

    [Fact]
    public void Avaliar_DiferencaNaoSignificativa_RetornaDivergenteSemPreferencia()
    {
        // N dividido proporcionalmente ao km: nenhuma diferença real → divergente.
        var avaliador = new AvaliadorComparacao();

        var resultado = avaliador.Avaliar(Rota("R1", 55, 1.0, 0.95), Rota("R2", 55, 1.0, 0.95));

        Assert.Equal(StatusComparacao.Divergente, resultado.Status);
        Assert.Null(resultado.RotaDestacada);
        Assert.Equal(AvaliadorComparacao.FraseSemDiferencaClara, resultado.Motivo);
    }

    [Fact]
    public void Avaliar_MesmaRotaComNEDMenores_RetornaConclusivaComDestaque()
    {
        // R2: menos boletins E menor D, diferença estatisticamente relevante.
        var avaliador = new AvaliadorComparacao();

        var resultado = avaliador.Avaliar(Rota("R1", 90, 1.0, 0.95), Rota("R2", 20, 1.0, 0.95));

        Assert.Equal(StatusComparacao.Conclusiva, resultado.Status);
        Assert.StartsWith(AvaliadorComparacao.FraseDadosSuficientes, resultado.Motivo);
        Assert.Equal("R2", resultado.RotaDestacada);
        Assert.NotNull(resultado.PValor);
        Assert.True(resultado.PValor < AvaliadorComparacao.NivelSignificancia);
    }

    [Fact]
    public void Avaliar_MenosBoletinsMasExposicaoMaior_RetornaDivergente()
    {
        // R1 tem menos N, mas expõe menos km caminhado → D de R1 é maior.
        // Item 11: só destaca se a MESMA rota tiver N e D menores.
        var avaliador = new AvaliadorComparacao();

        var resultado = avaliador.Avaliar(Rota("R1", 40, 0.5, 0.95), Rota("R2", 60, 1.0, 0.95));

        Assert.Equal(StatusComparacao.Divergente, resultado.Status);
        Assert.Null(resultado.RotaDestacada);
    }

    [Fact]
    public void ExposicaoEstimada_CalculaDivisaoPorKm()
    {
        var d = AvaliadorComparacao.ExposicaoEstimada(Rota("R1", 12, 3.0, 0.9));

        Assert.Equal(4.0, d, 9);
    }
}
