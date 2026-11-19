using System.Net.Http.Json;
using System.Text.Json;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Domain.Interfaces;
using VoltaSegura.Infrastructure.Repositorios;

namespace VoltaSegura.Infrastructure.Roteamento;

/// <summary>Adaptador opcional OTP2 2.10, GraphQL. Sem fallback silencioso para mock.</summary>
public class Otp2Roteador : IRoteador
{
    private readonly HttpClient _http;
    public string Fonte => "otp2";
    public Otp2Roteador(HttpClient http) => _http = http;
    public const string Consulta = """
        query ($origem: PlanCoordinateInput!, $destino: PlanCoordinateInput!, $saida: OffsetDateTime!, $n: Int) {
          planConnection(origin: {location: {coordinate: $origem}},
            destination: {location: {coordinate: $destino}},
            dateTime: {earliestDeparture: $saida}, first: $n) {
            routingErrors { code }
            edges { node { start end legs {
              mode distance start { scheduledTime } end { scheduledTime }
              from { name } to { name } route { shortName longName } legGeometry { points }
            } } }
          }
        }
        """;

    public async Task<IReadOnlyList<Trajeto>> PlanejarAsync(Coordenada origem, Coordenada destino,
        string sentido, DateTimeOffset saida, CancellationToken ct)
    {
        var corpo = new { query = Consulta, variables = new {
            origem = new { latitude = origem.Latitude, longitude = origem.Longitude },
            destino = new { latitude = destino.Latitude, longitude = destino.Longitude },
            saida = saida.ToString("O"), n = 5 } };
        using var resposta = await _http.PostAsJsonAsync("otp/gtfs/v1", corpo, ct);
        resposta.EnsureSuccessStatusCode();
        using var json = await JsonDocument.ParseAsync(await resposta.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
        try
        {
            var root = json.RootElement;
            if (root.TryGetProperty("errors", out var erros) && erros.GetArrayLength() > 0)
                throw new InvalidDataException("OTP devolveu erro GraphQL.");
            var plano = root.GetProperty("data").GetProperty("planConnection");
            var edges = plano.GetProperty("edges");
            if (edges.GetArrayLength() == 0)
            {
                var codigos = plano.GetProperty("routingErrors").EnumerateArray()
                    .Select(e => e.GetProperty("code").GetString()).ToList();
                if (codigos.Contains("OUTSIDE_BOUNDS")) throw new ArgumentException("Consulta fora da área do roteador.");
            }
            var rotas = new List<Trajeto>();
            foreach (var edge in edges.EnumerateArray().Take(5))
            {
                var node = edge.GetProperty("node");
                var rota = new Trajeto { Sentido = sentido, NomeOrigem = "origem", NomeDestino = "destino",
                    SaidaPrevista = node.GetProperty("start").GetDateTimeOffset(),
                    ChegadaPrevista = node.GetProperty("end").GetDateTimeOffset() };
                foreach (var leg in node.GetProperty("legs").EnumerateArray())
                {
                    var modo = leg.GetProperty("mode").GetString()!;
                    if (modo is not ("WALK" or "BUS" or "SUBWAY" or "RAIL" or "TRAM" or "FERRY"))
                        throw new InvalidDataException("Modo de transporte não suportado.");
                    var pontos = Polilinha.Decodificar(leg.GetProperty("legGeometry").GetProperty("points").GetString()!);
                    var km = leg.GetProperty("distance").GetDouble() / 1000;
                    if (pontos.Count < 2 || pontos.Any(p => !Geografia.CoordenadaValida(p.Latitude, p.Longitude))
                        || !double.IsFinite(km) || km < 0) throw new InvalidDataException("Geometria OTP inválida.");
                    var trecho = Trecho.Criar(rota.Trechos.Count, modo, km, pontos);
                    trecho.PartidaPrevista = leg.GetProperty("start").GetProperty("scheduledTime").GetDateTimeOffset();
                    trecho.ChegadaPrevista = leg.GetProperty("end").GetProperty("scheduledTime").GetDateTimeOffset();
                    if (trecho.ChegadaPrevista < trecho.PartidaPrevista) throw new InvalidDataException("Horário OTP inválido.");
                    trecho.Embarque = leg.GetProperty("from").GetProperty("name").GetString();
                    trecho.Desembarque = leg.GetProperty("to").GetProperty("name").GetString();
                    if (leg.TryGetProperty("route", out var linha) && linha.ValueKind == JsonValueKind.Object)
                        trecho.Linha = linha.GetProperty("shortName").GetString() ?? linha.GetProperty("longName").GetString();
                    rota.Trechos.Add(trecho);
                }
                if (rota.Trechos.Count == 0 || rota.ChegadaPrevista < rota.SaidaPrevista)
                    throw new InvalidDataException("Itinerário OTP inválido.");
                rotas.Add(rota);
            }
            return rotas;
        }
        catch (Exception e) when (e is KeyNotFoundException or InvalidOperationException or FormatException or IndexOutOfRangeException)
        {
            throw new InvalidDataException("Resposta OTP fora do contrato esperado.", e);
        }
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
