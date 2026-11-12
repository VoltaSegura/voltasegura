using Microsoft.EntityFrameworkCore;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Domain.Interfaces;
using VoltaSegura.Infrastructure.Dados;

namespace VoltaSegura.Infrastructure.Repositorios;

/// <summary>
/// Conta boletins distintos no corredor caminhado (docs/08 §§28 e 59). Estratégia:
/// pré-filtro por janela geográfica no banco (LINQ → SQL), depois filtro preciso de
/// distância (Haversine) em memória. A contagem considera apenas as naturezas
/// elegíveis (FURTO - OUTROS e ROUBO - OUTROS — docs/07 e docs/08 §3).
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

    /// <summary>
    /// Cobertura conforme docs/08 §64 (DECISÃO de 11/11/2026, após auditoria): fração de
    /// boletins elegíveis com coordenada válida E faixa do dia informada, dentro das
    /// circunscrições de delegacia atravessadas pelo corredor. As circunscrições são
    /// identificadas pelos boletins elegíveis (no período, sem filtro de faixa) cujas
    /// coordenadas caem no corredor; a fração é calculada sobre TODOS os boletins
    /// elegíveis dessas circunscrições no período — mede a qualidade dos dados da
    /// região, não a ocupação do corredor.
    /// </summary>
    public async Task<double> CoberturaCorredorAsync(
        IReadOnlyList<Coordenada> pontosCaminhados, double raioMetros,
        DateOnly inicio, DateOnly fim, IReadOnlyCollection<FaixaDoDia>? faixas, CancellationToken ct)
    {
        if (pontosCaminhados.Count == 0) return 0.0;

        // 1. Circunscrições atravessadas: boletins elegíveis com coordenada no corredor,
        //    no período, sem filtro de faixa (a cobertura mede usabilidade de dados).
        var noCorredor = await BuscarCandidatasAsync(pontosCaminhados, raioMetros, inicio, fim, faixas: null, ct);
        var circunscricoes = noCorredor
            .Where(o => pontosCaminhados.Any(p => Geografia.HaversineMetros(p, new Coordenada(o.Latitude!.Value, o.Longitude!.Value)) <= raioMetros))
            .Select(o => o.Circunscricao)
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Distinct()
            .ToList();
        if (circunscricoes.Count == 0) return 0.0;

        // 2. Fração dos boletins elegíveis dessas circunscrições (período) com
        //    coordenada válida e faixa informada — projeção mínima para o banco.
        var consulta = _contexto.Ocorrencias
            .AsNoTracking()
            .Where(o => Ocorrencia.NaturezasComparacao.Contains(o.Natureza))
            .Where(o => o.DataOcorrencia >= inicio && o.DataOcorrencia <= fim)
            .Where(o => circunscricoes.Contains(o.Circunscricao))
            .Select(o => new { o.NumeroBo, o.AnoBo, o.Delegacia, o.Faixa, o.Latitude });
        var registros = await consulta.ToListAsync(ct);

        var total = registros
            .Select(o => $"{o.NumeroBo}|{o.AnoBo}|{o.Delegacia}")
            .Distinct()
            .Count();
        if (total == 0) return 0.0;

        var usaveis = registros
            .Where(o => o.Latitude != null && o.Faixa != null)
            .Select(o => $"{o.NumeroBo}|{o.AnoBo}|{o.Delegacia}")
            .Distinct()
            .Count();
        return (double)usaveis / total;
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
            .AsNoTracking()
            // Somente naturezas elegíveis para N (docs/07 e docs/08 §3): FURTO - OUTROS
            // e ROUBO - OUTROS. Carga, veículo, latrocínio e trânsito não entram.
            .Where(o => Ocorrencia.NaturezasComparacao.Contains(o.Natureza))
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
