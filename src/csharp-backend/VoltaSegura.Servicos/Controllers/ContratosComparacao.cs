using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Text.RegularExpressions;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Infrastructure.Repositorios;

namespace VoltaSegura.Servicos.Controllers;

public sealed record RequisicaoComparacao(
    Coordenada? Origem, Coordenada? Destino, string? Saida, string? Sentido = "ida",
    DateOnly? Inicio = null, DateOnly? Fim = null) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (Origem == null || !Geografia.CoordenadaValida(Origem.Value.Latitude, Origem.Value.Longitude))
            yield return new("Informe uma origem com latitude e longitude válidas.", new[] { nameof(Origem) });
        if (Destino == null || !Geografia.CoordenadaValida(Destino.Value.Latitude, Destino.Value.Longitude))
            yield return new("Informe um destino com latitude e longitude válidas.", new[] { nameof(Destino) });
        if (Origem.HasValue && Origem == Destino)
            yield return new("Origem e destino devem ser distintos.", new[] { nameof(Destino) });
        if (Saida == null || !Regex.IsMatch(Saida, @"^\d{4}-\d{2}-\d{2}T.*(Z|[+-]\d{2}:\d{2})$")
            || !DateTimeOffset.TryParse(Saida, CultureInfo.InvariantCulture, DateTimeStyles.None, out _))
            yield return new("Informe saída ISO 8601 com fuso, por exemplo 2026-11-19T23:00:00-03:00.", new[] { nameof(Saida) });
        if (Sentido is not (null or "ida" or "volta"))
            yield return new("Sentido deve ser ida ou volta.", new[] { nameof(Sentido) });
        if (Inicio.HasValue && Fim.HasValue && Inicio > Fim)
            yield return new("Início do histórico deve ser anterior ou igual ao fim.", new[] { nameof(Inicio), nameof(Fim) });
    }
}

public sealed record FonteResposta(string Roteamento, string Acervo, string Descricao, bool Exemplo);
public sealed record PeriodoResposta(DateOnly Inicio, DateOnly Fim);
public sealed record TrechoResposta(int Ordem, string Modo, double ComprimentoKm, DateTimeOffset? PartidaPrevista,
    DateTimeOffset? ChegadaPrevista, FaixaDoDia? FaixaDoDia, string? Linha, IReadOnlyList<Coordenada> Geometria);
public sealed record RotaResposta(string Id, double DuracaoMin, double KmCaminhados, int Baldeacoes,
    DateTimeOffset? SaidaPrevista, DateTimeOffset? ChegadaPrevista, IReadOnlyList<TrechoResposta> Trechos);
public sealed record RespostaComparacao(string Status, string Situacao, string? RotaComMenorExposicaoEstimada,
    double? PValor, IReadOnlyDictionary<string, int> BoletinsPorRota,
    IReadOnlyDictionary<string, double> KmCaminhadosPorRota, IReadOnlyDictionary<string, double> CoberturaPorRota,
    IReadOnlyDictionary<string, double?> ExposicaoEstimadaBoletinsPorKm,
    IReadOnlyList<double> LargurasCorredorTestadasM, PeriodoResposta PeriodoDados, FonteResposta Fontes,
    IReadOnlyList<RotaResposta> Rotas, IReadOnlyList<string> SobreOsDados);
