using System.ComponentModel.DataAnnotations.Schema;
using VoltaSegura.Domain.Interfaces;

namespace VoltaSegura.Domain.Entidades;

/// <summary>
/// Alternativa de ida ou volta do cidadão, retornada por um <see cref="Interfaces.IRoteador"/>.
/// A comparação entre trajetos usa SOMENTE os trechos caminhados (regra de comparação, item 11).
/// </summary>
public class Trajeto
{
    [NotMapped] public DateTimeOffset? SaidaPrevista { get; set; }
    [NotMapped] public DateTimeOffset? ChegadaPrevista { get; set; }
    [NotMapped] public double DuracaoMin => SaidaPrevista.HasValue && ChegadaPrevista.HasValue
        ? (ChegadaPrevista.Value - SaidaPrevista.Value).TotalMinutes : 0;
    [NotMapped] public int Baldeacoes => Math.Max(0, Trechos.Count(t => t.Modo != "WALK") - 1);

    public IReadOnlyList<CorredorCaminhada> Caminhadas() => Trechos
        .Where(t => t.Modo == "WALK")
        .Select(t => new CorredorCaminhada(t.Pontos(), t.PartidaPrevista.HasValue
            ? PeriodoLocal.Faixa(t.PartidaPrevista.Value) : null)).ToList();
    public long Id { get; set; }

    public string NomeOrigem { get; set; } = string.Empty;

    public string NomeDestino { get; set; } = string.Empty;

    /// <summary>"ida" ou "volta" (a solução compara alternativas de ida E volta — decisão do grupo).</summary>
    public string Sentido { get; set; } = string.Empty;

    public List<Trecho> Trechos { get; set; } = new();

    public double DistanciaTotalKm => Trechos.Sum(t => t.ComprimentoKm);

    /// <summary>Soma apenas os trechos a pé — base do cálculo de D = N/km.</summary>
    public double KmCaminhados => Trechos
        .Where(t => t.Modo.Equals("WALK", StringComparison.OrdinalIgnoreCase))
        .Sum(t => t.ComprimentoKm);

    /// <summary>Pontos dos trechos caminhados, em ordem, para o corredor de exposição.</summary>
    public IReadOnlyList<Coordenada> PontosCaminhados() => Trechos
        .Where(t => t.Modo.Equals("WALK", StringComparison.OrdinalIgnoreCase))
        .SelectMany(t => t.Pontos())
        .ToList();
}

/// <summary>Segmento de um trajeto, com modo (WALK, BUS, SUBWAY, RAIL...) conforme o roteador.</summary>
public class Trecho
{
    [NotMapped] public DateTimeOffset? PartidaPrevista { get; set; }
    [NotMapped] public DateTimeOffset? ChegadaPrevista { get; set; }
    [NotMapped] public string? Linha { get; set; }
    [NotMapped] public string? Embarque { get; set; }
    [NotMapped] public string? Desembarque { get; set; }
    public long Id { get; set; }

    public int Ordem { get; set; }

    public string Modo { get; set; } = string.Empty;

    public double ComprimentoKm { get; set; }

    /// <summary>Geometria do trecho serializada (JSON [[lat,lon],...]). Evita mapeamento complexo no EF Core.</summary>
    public string GeometriaJson { get; set; } = "[]";

    public List<Coordenada> Pontos()
    {
        if (string.IsNullOrWhiteSpace(GeometriaJson)) return new List<Coordenada>();
        var bruta = System.Text.Json.JsonSerializer.Deserialize<double[][]>(GeometriaJson)
            ?? Array.Empty<double[]>();
        return bruta
            .Where(p => p.Length >= 2)
            .Select(p => new Coordenada(p[0], p[1]))
            .ToList();
    }

    public static Trecho Criar(int ordem, string modo, double km, IEnumerable<Coordenada> pontos)
    {
        var geometria = pontos.Select(p => new[] { p.Latitude, p.Longitude }).ToArray();
        return new Trecho
        {
            Ordem = ordem,
            Modo = modo,
            ComprimentoKm = km,
            GeometriaJson = System.Text.Json.JsonSerializer.Serialize(geometria),
        };
    }
}

/// <summary>Ponto geográfico do trajeto consultado: pode compor a resposta da consulta, mas não a auditoria ou o histórico do servidor.</summary>
public readonly record struct Coordenada(double Latitude, double Longitude);

public static class PeriodoLocal
{
    // O recorte do MVP é São Paulo; o fuso é aplicado também quando o OTP retorna UTC.
    private static readonly TimeZoneInfo Fuso = TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");
    public static FaixaDoDia Faixa(DateTimeOffset instante)
        => (FaixaDoDia)(TimeZoneInfo.ConvertTime(instante, Fuso).Hour / 6 + 1);
}
