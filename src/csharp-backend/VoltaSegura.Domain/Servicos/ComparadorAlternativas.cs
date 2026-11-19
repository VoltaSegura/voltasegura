namespace VoltaSegura.Domain.Servicos;

/// <summary>Uma rota só recebe destaque se vencer todas as demais, nas três larguras.</summary>
public static class ComparadorAlternativas
{
    public static ResultadoComparacao Avaliar(IReadOnlyDictionary<double, IReadOnlyList<CenarioRota>> cenarios)
    {
        var padrao = cenarios[100];
        var exposicoes = padrao.ToDictionary(c => c.Identificador, AvaliadorComparacao.ExposicaoEstimada);
        ResultadoComparacao SemComparacao(string motivo) => new(StatusComparacao.DadosInsuficientes,
            null, motivo, null, exposicoes);
        if (padrao.Count < 2) return SemComparacao("Dados insuficientes — menos de duas alternativas para comparar");
        if (padrao.Any(c => c.KmCaminhados <= 0))
            return SemComparacao("Dados insuficientes — indicador não aplicável em alternativa sem caminhada");

        var pares = new List<ResultadoComparacao>();
        var avaliador = new AvaliadorComparacao();
        for (var i = 0; i < padrao.Count; i++)
            for (var j = i + 1; j < padrao.Count; j++)
            {
                var porLargura = cenarios.ToDictionary(k => k.Key, k => avaliador.Avaliar(k.Value[i], k.Value[j]));
                var par = EstabilidadeCorredor.Consolidar(porLargura);
                pares.Add(par with { PValor = par.Status == StatusComparacao.DadosInsuficientes
                    ? null : porLargura[100].PValor });
            }
        foreach (var candidata in padrao)
        {
            var vitorias = pares.Where(p => p.RotaDestacada == candidata.Identificador).ToList();
            if (vitorias.Count == padrao.Count - 1)
                return new(StatusComparacao.Conclusiva, candidata.Identificador,
                    $"Dados suficientes para comparar; menor exposição estimada entre as alternativas avaliadas na {candidata.Identificador}",
                    vitorias.Max(p => p.PValor), exposicoes);
        }
        var insuficiente = pares.FirstOrDefault(p => p.Status == StatusComparacao.DadosInsuficientes);
        if (insuficiente.Status == StatusComparacao.DadosInsuficientes)
            return insuficiente with { ExposicaoEstimadaPorRota = exposicoes };
        return new(StatusComparacao.Divergente, null, AvaliadorComparacao.FraseSemDiferencaClara,
            pares.Count == 1 ? pares[0].PValor : null, exposicoes);
    }
}
