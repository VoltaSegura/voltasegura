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
/// Contagem de boletins distintos (NUM_BO + ANO_BO + delegacia — docs/08 §59) dentro do
/// corredor caminhado de uma rota, no período e faixa acordados, apenas nas naturezas
/// elegíveis (FURTO - OUTROS e ROUBO - OUTROS — docs/07 e docs/08 §3).
/// </summary>
public interface IOcorrenciaRepositorio
{
    /// <summary>
    /// Conta boletins distintos a até <paramref name="raioMetros"/> de qualquer ponto
    /// caminhado da rota, no período informado, para as naturezas elegíveis.
    /// </summary>
    Task<int> ContarBoletinsDistintosAsync(
        IReadOnlyList<Coordenada> pontosCaminhados, double raioMetros,
        DateOnly inicio, DateOnly fim, IReadOnlyCollection<FaixaDoDia>? faixas, CancellationToken ct);

    /// <summary>
    /// Cobertura conforme docs/08 §64 (DECISÃO de 11/11/2026): fração dos boletins
    /// elegíveis com coordenada válida e faixa do dia informada, nas circunscrições de
    /// delegacia atravessadas pelos trechos a pé. Exigência: ≥ 80% em cada alternativa
    /// e diferença ≤ 10 p.p. entre elas.
    /// </summary>
    Task<double> CoberturaCorredorAsync(
        IReadOnlyList<Coordenada> pontosCaminhados, double raioMetros,
        DateOnly inicio, DateOnly fim, IReadOnlyCollection<FaixaDoDia>? faixas, CancellationToken ct);
}
