using VoltaSegura.Domain.Entidades;

namespace VoltaSegura.Domain.Interfaces;

/// <summary>
/// Serviço de roteamento do VoltaSegura. Implementação principal: adaptador para
/// OpenTripPlanner 2 em servidor próprio, com GTFS da SPTrans (inclui Metrô e CPTM)
/// + OpenStreetMap (decisão do grupo, item 14 — OSRM descartado por não rotear
/// transporte público). Enquanto o OTP2 não estiver ativo (item 22, EM ABERTO),
/// usa-se um roteador mock determinístico.
/// </summary>
public interface IRoteador
{
    /// <summary>Planeja alternativas de trajeto entre dois pontos (coordenadas nunca saem daqui para logs).</summary>
    Task<IReadOnlyList<Trajeto>> PlanejarAsync(
        Coordenada origem, Coordenada destino, string sentido, CancellationToken ct);
}

/// <summary>
/// Contagem de boletins distintos (NUM_BO + ANO_BO + delegacia — item 12) dentro do
/// corredor caminhado de uma rota, no período e faixa acordados.
/// </summary>
public interface IOcorrenciaRepositorio
{
    /// <summary>
    /// Conta boletins distintos a até <paramref name="raioMetros"/> de qualquer ponto
    /// caminhado da rota, no período informado, para as rubricas do recorte (item 8).
    /// </summary>
    Task<int> ContarBoletinsDistintosAsync(
        IReadOnlyList<Coordenada> pontosCaminhados, double raioMetros,
        DateOnly inicio, DateOnly fim, IReadOnlyCollection<FaixaDoDia>? faixas, CancellationToken ct);

    /// <summary>
    /// Cobertura de dados ao longo do corredor (proporção dos pontos caminhados que
    /// possuem dados de ocorrência publicados na região). ATENÇÃO: a metodologia
    /// definitiva de cobertura é ponto EM ABERTO do grupo — esta é uma heurística
    /// provisória, declarada como tal no bloco "Sobre os dados".
    /// </summary>
    Task<double> CoberturaCorredorAsync(
        IReadOnlyList<Coordenada> pontosCaminhados, double raioMetros,
        DateOnly inicio, DateOnly fim, IReadOnlyCollection<FaixaDoDia>? faixas, CancellationToken ct);
}
