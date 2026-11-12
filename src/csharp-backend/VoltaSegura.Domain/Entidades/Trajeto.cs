namespace VoltaSegura.Domain.Entidades;

/// <summary>
/// Alternativa de ida ou volta do cidadão, retornada por um <see cref="Interfaces.IRoteador"/>.
/// A comparação entre trajetos usa SOMENTE os trechos caminhados (regra de comparação, item 11).
/// </summary>
public class Trajeto
{
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

/// <summary>Ponto geográfico. As coordenadas circulam apenas internamente — nunca em logs ou respostas públicas.</summary>
public readonly record struct Coordenada(double Latitude, double Longitude);
