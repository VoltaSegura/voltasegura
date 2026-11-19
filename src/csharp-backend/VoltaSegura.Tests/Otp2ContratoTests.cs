using System.Net;
using System.Text;
using System.Text.Json;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Infrastructure.Roteamento;

namespace VoltaSegura.Tests;

public class Otp2ContratoTests
{
    [Fact]
    public async Task GraphQL_EnviaHorarioComFusoECincoCandidatas_PreservaCaminhada()
    {
        var node = new { start = "2026-11-19T23:00:00-03:00", end = "2026-11-19T23:10:00-03:00", legs = new[] {
            new { mode = "WALK", distance = 500, start = new { scheduledTime = "2026-11-19T23:00:00-03:00" },
                end = new { scheduledTime = "2026-11-19T23:10:00-03:00" }, from = new { name = "EXEMPLO" }, to = new { name = "EXEMPLO" },
                legGeometry = new { points = "_p~iF~ps|U_ulLnnqC_mqNvxq`@" } } } };
        var payload = JsonSerializer.Serialize(new { data = new { planConnection = new { routingErrors = Array.Empty<object>(), edges = new[] { new { node } } } } });
        using var handler = new Handler(payload);
        using var http = new HttpClient(handler) { BaseAddress = new Uri("http://otp.exemplo/") };
        var rotas = await new Otp2Roteador(http).PlanejarAsync(new(-23.56, -46.65), new(-23.55, -46.63),
            "volta", DateTimeOffset.Parse("2026-11-19T23:00:00-03:00"), default);
        Assert.Equal("/otp/gtfs/v1", handler.Caminho);
        using var enviado = JsonDocument.Parse(handler.Corpo!);
        Assert.Equal(5, enviado.RootElement.GetProperty("variables").GetProperty("n").GetInt32());
        Assert.EndsWith("-03:00", enviado.RootElement.GetProperty("variables").GetProperty("saida").GetString());
        Assert.Single(rotas);
        Assert.Equal(.5, rotas[0].KmCaminhados);
        Assert.Equal(FaixaDoDia.Noite, rotas[0].Caminhadas()[0].Faixa);
    }
    [Theory]
    [InlineData("{\"errors\":[{\"message\":\"falha\"}]}")]
    [InlineData("{\"data\":{}}")]
    public async Task RespostaInvalida_NaoInventaItinerario(string payload)
    {
        using var http = new HttpClient(new Handler(payload)) { BaseAddress = new Uri("http://otp.exemplo/") };
        await Assert.ThrowsAsync<InvalidDataException>(() => new Otp2Roteador(http).PlanejarAsync(
            new(-23.56, -46.65), new(-23.55, -46.63), "ida", DateTimeOffset.UtcNow, default));
    }
    private sealed class Handler(string payload) : HttpMessageHandler
    {
        public string? Caminho, Corpo;
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Assert.Equal(HttpMethod.Post, request.Method);
            Caminho = request.RequestUri!.AbsolutePath;
            Corpo = await request.Content!.ReadAsStringAsync(ct);
            return new(HttpStatusCode.OK) { Content = new StringContent(payload, Encoding.UTF8, "application/json") };
        }
    }
}
