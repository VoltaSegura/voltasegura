using Microsoft.EntityFrameworkCore;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Domain.Interfaces;
using VoltaSegura.Infrastructure.Dados;

namespace VoltaSegura.Infrastructure.Repositorios;

/// <summary>Pré-filtro no SQLite e distância ponto–segmento, sem ligar caminhadas separadas.</summary>
public class OcorrenciaRepositorio : IOcorrenciaRepositorio
{
    private readonly VoltaSeguraDbContext _contexto;
    public OcorrenciaRepositorio(VoltaSeguraDbContext contexto) => _contexto = contexto;

    public async Task<int> ContarBoletinsDistintosAsync(
        IReadOnlyList<CorredorCaminhada> caminhadas, double raioMetros,
        DateOnly inicio, DateOnly fim, CancellationToken ct)
    {
        var candidatas = await BuscarCandidatasAsync(caminhadas, raioMetros, inicio, fim, ct);
        return candidatas.Where(o => o.Faixa is >= FaixaDoDia.Madrugada and <= FaixaDoDia.Noite
                && caminhadas.Any(c => (c.Faixa == null || c.Faixa == o.Faixa)
                    && Geografia.NoCorredor(c.Pontos, new(o.Latitude!.Value, o.Longitude!.Value), raioMetros)))
            .Select(o => o.ChaveBoletim()).Distinct().Count();
    }

    public async Task<double> CoberturaCorredorAsync(
        IReadOnlyList<CorredorCaminhada> caminhadas, double raioMetros,
        DateOnly inicio, DateOnly fim, CancellationToken ct)
    {
        // Aproximação declarada: inferir circunscrições pelos BOs próximos, sem polígonos oficiais.
        // Sem filtro de faixa: BOs sem faixa também identificam a circunscrição.
        var candidatas = await BuscarCandidatasAsync(caminhadas, raioMetros, inicio, fim, ct);
        var circunscricoes = candidatas.Where(o => caminhadas.Any(c =>
                Geografia.NoCorredor(c.Pontos, new(o.Latitude!.Value, o.Longitude!.Value), raioMetros)))
            .Select(o => o.Circunscricao).Where(c => !string.IsNullOrWhiteSpace(c)).Distinct().ToList();
        if (circunscricoes.Count == 0) return 0;
        var registros = await Elegiveis(inicio, fim)
            .Where(o => circunscricoes.Contains(o.Circunscricao))
            .Select(o => new { o.Latitude, o.Longitude, o.Faixa }).ToListAsync(ct);
        // O índice único do banco garante um registro por chave de BO.
        return registros.Count == 0 ? 0 : (double)registros.Count(o =>
            Geografia.CoordenadaValida(o.Latitude, o.Longitude)
            && o.Faixa is >= FaixaDoDia.Madrugada and <= FaixaDoDia.Noite) / registros.Count;
    }

    public Task<int> ContarBoletinsDistintosAsync(IReadOnlyList<Coordenada> pontos,
        double raio, DateOnly inicio, DateOnly fim, IReadOnlyCollection<FaixaDoDia>? faixas, CancellationToken ct)
        => ContarBoletinsDistintosAsync(Corredores(pontos, faixas), raio, inicio, fim, ct);
    public Task<double> CoberturaCorredorAsync(IReadOnlyList<Coordenada> pontos,
        double raio, DateOnly inicio, DateOnly fim, IReadOnlyCollection<FaixaDoDia>? faixas, CancellationToken ct)
        => CoberturaCorredorAsync(Corredores(pontos, faixas), raio, inicio, fim, ct);

    private static IReadOnlyList<CorredorCaminhada> Corredores(IReadOnlyList<Coordenada> pontos,
        IReadOnlyCollection<FaixaDoDia>? faixas) => faixas is { Count: > 0 }
        ? faixas.Select(f => new CorredorCaminhada(pontos, f)).ToList()
        : new[] { new CorredorCaminhada(pontos, null) };

    private IQueryable<Ocorrencia> Elegiveis(DateOnly inicio, DateOnly fim) => _contexto.Ocorrencias
        .AsNoTracking().Where(o => Ocorrencia.NaturezasComparacao.Contains(o.Natureza))
        .Where(o => o.DataOcorrencia >= inicio && o.DataOcorrencia <= fim);

    private async Task<List<Ocorrencia>> BuscarCandidatasAsync(IReadOnlyList<CorredorCaminhada> caminhadas,
        double raio, DateOnly inicio, DateOnly fim, CancellationToken ct)
    {
        var pontos = caminhadas.SelectMany(c => c.Pontos).ToList();
        if (pontos.Count == 0) return new();
        if (raio <= 0 || !double.IsFinite(raio) || pontos.Any(p => !Geografia.CoordenadaValida(p.Latitude, p.Longitude)))
            throw new ArgumentException("Corredor inválido.");
        var margemLat = raio / 110_000.0;
        var latitudeMaxima = Math.Min(89.9, pontos.Max(p => Math.Abs(p.Latitude)) + margemLat);
        var margemLon = margemLat / Math.Cos(latitudeMaxima * Math.PI / 180);
        var minLat = pontos.Min(p => p.Latitude) - margemLat;
        var maxLat = pontos.Max(p => p.Latitude) + margemLat;
        var minLon = pontos.Min(p => p.Longitude) - margemLon;
        var maxLon = pontos.Max(p => p.Longitude) + margemLon;
        return await Elegiveis(inicio, fim)
            .Where(o => o.Latitude != null && o.Longitude != null)
            .Where(o => o.Latitude >= -90 && o.Latitude <= 90 && o.Longitude >= -180 && o.Longitude <= 180)
            .Where(o => o.Latitude >= minLat && o.Latitude <= maxLat && o.Longitude >= minLon && o.Longitude <= maxLon)
            .ToListAsync(ct);
    }
}

public static class Geografia
{
    private const double RaioTerraM = 6_371_000.0;
    private static double Rad(double graus) => graus * Math.PI / 180;
    public static bool CoordenadaValida(double? lat, double? lon) =>
        lat is >= -90 and <= 90 && lon is >= -180 and <= 180;
    public static double HaversineMetros(Coordenada a, Coordenada b)
    {
        var h = Math.Pow(Math.Sin(Rad(b.Latitude - a.Latitude) / 2), 2)
            + Math.Cos(Rad(a.Latitude)) * Math.Cos(Rad(b.Latitude))
            * Math.Pow(Math.Sin(Rad(b.Longitude - a.Longitude) / 2), 2);
        return 2 * RaioTerraM * Math.Asin(Math.Min(1, Math.Sqrt(h)));
    }
    /// <summary>Distância ao arco de círculo máximo, limitada às extremidades.</summary>
    public static double DistanciaSegmentoMetros(Coordenada ponto, Coordenada a, Coordenada b)
    {
        var comprimento = HaversineMetros(a, b) / RaioTerraM;
        if (comprimento < 1e-12) return HaversineMetros(a, ponto);
        var delta = HaversineMetros(a, ponto) / RaioTerraM;
        var angulo = Rumo(a, ponto) - Rumo(a, b);
        var aoLongo = Math.Atan2(Math.Sin(delta) * Math.Cos(angulo), Math.Cos(delta));
        if (aoLongo < 0 || aoLongo > comprimento)
            return Math.Min(HaversineMetros(a, ponto), HaversineMetros(b, ponto));
        return Math.Abs(Math.Asin(Math.Clamp(Math.Sin(delta) * Math.Sin(angulo), -1, 1))) * RaioTerraM;
    }
    private static double Rumo(Coordenada a, Coordenada b) => Math.Atan2(
        Math.Sin(Rad(b.Longitude - a.Longitude)) * Math.Cos(Rad(b.Latitude)),
        Math.Cos(Rad(a.Latitude)) * Math.Sin(Rad(b.Latitude))
        - Math.Sin(Rad(a.Latitude)) * Math.Cos(Rad(b.Latitude)) * Math.Cos(Rad(b.Longitude - a.Longitude)));
    public static bool NoCorredor(IReadOnlyList<Coordenada> pontos, Coordenada alvo, double raio)
    {
        if (pontos.Count == 1) return HaversineMetros(pontos[0], alvo) <= raio;
        for (var i = 1; i < pontos.Count; i++)
            if (DistanciaSegmentoMetros(alvo, pontos[i - 1], pontos[i]) <= raio) return true;
        return false;
    }
}
