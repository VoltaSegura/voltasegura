using VoltaSegura.Domain.Servicos;

namespace VoltaSegura.Domain.Servicos;

/// <summary>
/// Critério de estabilidade acordado (item 16 do grupo): se o resultado muda com a
/// largura do corredor (testes em ±50, ±100 e ±150 m), os dados são INSUFICIENTES —
/// nunca se escolhe o corredor mais conveniente.
/// </summary>
public static class EstabilidadeCorredor
{
    /// <summary>Larguras de corredor acordadas para o MVP (item 12).</summary>
    public static readonly IReadOnlyList<double> LargurasPadraoM = new[] { 50.0, 100.0, 150.0 };

    /// <summary>
    /// Consolida os resultados obtidos em várias larguras de corredor. Se status ou
    /// rota destacada divergirem entre larguras, retorna "dados insuficientes".
    /// </summary>
    /// <param name="porLargura">Resultados indexados pela largura do corredor em metros.</param>
    public static ResultadoComparacao Consolidar(IReadOnlyDictionary<double, ResultadoComparacao> porLargura)
    {
        if (porLargura.Count == 0)
            throw new ArgumentException("É necessário ao menos um resultado por largura de corredor.");

        var referencia = porLargura.OrderBy(kvp => kvp.Key).First().Value;
        var estavel = porLargura.Values.All(r =>
            r.Status == referencia.Status && r.RotaDestacada == referencia.RotaDestacada);

        if (estavel)
            return referencia;

        return new ResultadoComparacao(
            StatusComparacao.DadosInsuficientes,
            null,
            "Dados insuficientes — resultado muda com a largura do corredor testada (±50/±100/±150 m)",
            null,
            referencia.ExposicaoEstimadaPorRota);
    }
}
