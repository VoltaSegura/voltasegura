using Microsoft.EntityFrameworkCore;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Domain.Interfaces;
using VoltaSegura.Infrastructure.Dados;

namespace VoltaSegura.Infrastructure.Repositorios;

/// <summary>
/// Conta boletins distintos no corredor caminhado (regra dos itens 11/12). Estratégia:
/// pré-filtro por janela geográfica no banco (LINQ → SQL), depois filtro preciso de
/// distância (Haversine) em memória. Os dados vêm do recorte SSP-SP carregado pelo ETL.
/// </summary>
public class OcorrenciaRepositorio : IOcorrenciaRepositorio
{
    private readonly VoltaSeguraDbContext _contexto;

    public OcorrenciaRepositorio(VoltaSeguraDbContext contexto) => _contexto = contexto;

    public async Task<int> ContarBoletinsDistintosAsync(
        IReadOnlyList<Coordenada> pontosCaminhados, double raioMetros,
        DateOnly inicio, DateOnly fim, IReadOnlyCollection<FaixaDoDia>? faixas, CancellationToken ct)
    {
        var candidatas = await BuscarCandidatasAsync(pontosCaminhados, raioMetros, inicio, fim, faixas, ct);
        var distintas = candidatas
            .Where(o => pontosCaminhados.Any(p => Geografia.HaversineMetros(p, new Coordenada(o.Latitude!.Value, o.Longitude!.Value)) <= raioMetros))
            .Select(o => o.ChaveBoletim())
            .Distinct();
        return distintas.Count();
    }

    public async Task<double> CoberturaCorredorAsync(
        IReadOnlyList<Coordenada> pontosCaminhados, double raioMetros,
        DateOnly inicio, DateOnly fim, IReadOnlyCollection<FaixaDoDia>? faixas, CancellationToken ct)
    {
        // HEURÍSTICA PROVISÓRIA (metodologia definitiva de cobertura é EM ABERTO no grupo):
        // proporção dos pontos do corredor que possuem ao menos uma ocorrência publicada
        // por perto no período. O bloco "Sobre os dados" declara isso ao usuário.
        if (pontosCaminhados.Count == 0) return 0.0;
        var candidatas = await BuscarCandidatasAsync(pontosCaminhados, raioMetros, inicio, fim, faixas, ct);
        var cobertos = pontosCaminhados.Count(ponto =>
            candidatas.Any(o => Geografia.HaversineMetros(ponto, new Coordenada(o.Latitude!.Value, o.Longitude!.Value)) <= raioMetros));
        return (double)cobertos / pontosCaminhados.Count;
    }

    private async Task<List<Ocorrencia>> BuscarCandidatasAsync(
        IReadOnlyList<Coordenada> pontos, double raioMetros,
        DateOnly inicio, DateOnly fim, IReadOnlyCollection<FaixaDoDia>? faixas, CancellationToken ct)
    {
        if (pontos.Count == 0) return new List<Ocorrencia>();

        var minLat = pontos.Min(p => p.Latitude) - Graus(raioMetros);
        var maxLat = pontos.Max(p => p.Latitude) + Graus(raioMetros);
        var minLon = pontos.Min(p => p.Longitude) - Graus(raioMetros);
        var maxLon = pontos.Max(p => p.Longitude) + Graus(raioMetros);

        var consulta = _contexto.Ocorrencias
            .Where(o => o.Latitude != null && o.Longitude != null)
            .Where(o => o.Latitude >= minLat && o.Latitude <= maxLat)
            .Where(o => o.Longitude >= minLon && o.Longitude <= maxLon)
            .Where(o => o.DataOcorrencia >= inicio && o.DataOcorrencia <= fim);

        if (faixas is { Count: > 0 })
            consulta = consulta.Where(o => o.Faixa != null && faixas.Contains(o.Faixa.Value));

        return await consulta.ToListAsync(ct);
    }

    private static double Graus(double metros) => metros / 111_320.0;
}

/// <summary>Distância geodésica aproximada entre dois pontos (fórmula de Haversine).</summary>
public static class Geografia
{
    private const double RaioTerraM = 6_371_000.0;

    public static double HaversineMetros(Coordenada a, Coordenada b)
    {
        var dLat = ParaRadiano(b.Latitude - a.Latitude);
        var dLon = ParaRadiano(b.Longitude - a.Longitude);
        var h = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                + Math.Cos(ParaRadiano(a.Latitude)) * Math.Cos(ParaRadiano(b.Latitude))
                * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return 2 * RaioTerraM * Math.Asin(Math.Min(1.0, Math.Sqrt(h)));
    }

    private static double ParaRadiano(double graus) => graus * Math.PI / 180.0;
}
