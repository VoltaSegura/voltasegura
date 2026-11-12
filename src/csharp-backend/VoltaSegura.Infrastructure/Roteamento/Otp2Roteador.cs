using System.Net.Http.Json;
using System.Text.Json.Serialization;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Domain.Interfaces;

namespace VoltaSegura.Infrastructure.Roteamento;

/// <summary>
/// Adaptador para o OpenTripPlanner 2 em servidor próprio (decisão do grupo, item 14),
/// com GTFS da SPTrans (inclui Metrô e CPTM) + OpenStreetMap. O endpoint de plano é
/// <c>{base}/otp/routers/{router}/plan</c>. Qualquer resposta inválida vira exceção
/// clara — o contrato do VoltaSegura nunca inventa rota.
/// </summary>
public class Otp2Roteador : IRoteador
{
    private readonly HttpClient _http;
    private readonly string _router;

    public Otp2Roteador(HttpClient http, string router = "default")
    {
        _http = http;
        _router = router;
    }

    public async Task<IReadOnlyList<Trajeto>> PlanejarAsync(
        Coordenada origem, Coordenada destino, string sentido, CancellationToken ct)
    {
        var url = $"otp/routers/{_router}/plan" +
                  $"?fromPlace={origem.Latitude.ToStringInvariant()},{origem.Longitude.ToStringInvariant()}" +
                  $"&toPlace={destino.Latitude.ToStringInvariant()},{destino.Longitude.ToStringInvariant()}" +
                  "&mode=TRANSIT,WALK&numItineraries=3";

        using var resposta = await _http.GetAsync(url, ct);
        resposta.EnsureSuccessStatusCode();
        var plano = await resposta.Content.ReadFromJsonAsync<RespostaPlanoOtp>(cancellationToken: ct)
            ?? throw new InvalidOperationException("OTP2 devolveu resposta vazia.");

        var trajetos = new List<Trajeto>();
        foreach (var itinerario in plano.Plan?.Itinerarios ?? Enumerable.Empty<ItinerarioOtp>())
        {
            var trechos = new List<Trecho>();
            var ordem = 0;
            foreach (var perna in itinerario.Legs)
            {
                trechos.Add(Trecho.Criar(
                    ordem++,
                    MapearModo(perna.Mode),
                    (perna.Distance ?? 0) / 1000.0,
                    perna.LegGeometry?.Pontos is { Length: > 0 } pontos
                    ? Polilinha.Decodificar(pontos)
                    : Enumerable.Empty<Coordenada>()));
            }

            if (trechos.Count == 0) continue;

            trajetos.Add(new Trajeto
            {
                NomeOrigem = "origem",
                NomeDestino = "destino",
                Sentido = sentido,
                Trechos = trechos,
            });
        }

        return trajetos;
    }

    /// <summary>Modos do OTP (WALK, BUS, SUBWAY, RAIL, TRAM...) mapeados para os modos do domínio.</summary>
    private static string MapearModo(string modoOtp)
        => modoOtp.Equals("WALK", StringComparison.OrdinalIgnoreCase) ? "WALK"
         : modoOtp.Equals("SUBWAY", StringComparison.OrdinalIgnoreCase) ? "SUBWAY"
         : modoOtp.Equals("RAIL", StringComparison.OrdinalIgnoreCase) ? "RAIL"
         : modoOtp.Equals("TRAM", StringComparison.OrdinalIgnoreCase) ? "TRAM"
         : "BUS";

    // ── Contratos de desserialização do OTP2 (apenas os campos usados) ──

    private sealed class RespostaPlanoOtp
    {
        [JsonPropertyName("plan")]
        public PlanoOtp? Plan { get; set; }
    }

    private sealed class PlanoOtp
    {
        [JsonPropertyName("itineraries")]
        public List<ItinerarioOtp>? Itinerarios { get; set; }
    }

    private sealed class ItinerarioOtp
    {
        [JsonPropertyName("legs")]
        public List<PernaOtp> Legs { get; set; } = new();
    }

    private sealed class PernaOtp
    {
        [JsonPropertyName("mode")]
        public string Mode { get; set; } = string.Empty;

        [JsonPropertyName("distance")]
        public double? Distance { get; set; }

        [JsonPropertyName("legGeometry")]
        public GeometriaOtp? LegGeometry { get; set; }
    }

    private sealed class GeometriaOtp
    {
        [JsonPropertyName("points")]
        public string? Pontos { get; set; }
    }
}

/// <summary>Decodifica o polilinha encodado (polyline) do OTP em coordenadas.</summary>
public static class Polilinha
{
    public static IReadOnlyList<Coordenada> Decodificar(string pontos)
    {
        var resultado = new List<Coordenada>();
        var indice = 0;
        var latitude = 0;
        var longitude = 0;

        while (indice < pontos.Length)
        {
            latitude += DecodificarValor(pontos, ref indice);
            longitude += DecodificarValor(pontos, ref indice);
            resultado.Add(new Coordenada(latitude / 1e5, longitude / 1e5));
        }

        return resultado;
    }

    private static int DecodificarValor(string texto, ref int indice)
    {
        int resultado = 0, deslocamento = 0, byteAtual;
        do
        {
            byteAtual = texto[indice++] - 63;
            resultado |= (byteAtual & 0x1f) << deslocamento;
            deslocamento += 5;
        } while (byteAtual >= 0x20);

        return (resultado & 1) != 0 ? ~(resultado >> 1) : resultado >> 1;
    }
}

internal static class DoubleFormato
{
    public static string ToStringInvariant(this double valor)
        => valor.ToString(System.Globalization.CultureInfo.InvariantCulture);
}
