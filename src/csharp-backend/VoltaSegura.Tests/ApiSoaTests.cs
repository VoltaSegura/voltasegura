using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Domain.Interfaces;
using VoltaSegura.Infrastructure.Dados;
using VoltaSegura.Infrastructure.Roteamento;

namespace VoltaSegura.Tests;

public class ApiSoaTests
{
    public static object Consulta(string saida = "2026-11-19T23:00:00-03:00") => new
    {
        origem = new { latitude = -23.5629, longitude = -46.6544 },
        destino = new { latitude = -23.5379, longitude = -46.6295 }, saida, sentido = "volta"
    };

    [Fact]
    public async Task MigracoesReais_CriamSchemaEReaplicacaoEIdempotente()
    {
        using var host = new HostSoa();
        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<VoltaSeguraDbContext>();
        var antes = (await db.Database.GetAppliedMigrationsAsync()).ToList();
        Assert.Equal(2, antes.Count);
        await db.Database.MigrateAsync();
        Assert.Equal(antes, (await db.Database.GetAppliedMigrationsAsync()).ToList());
    }

    [Fact]
    public async Task BancoVazio_RespondeSemDestaqueERegistraAuditoriaSemLocalizacao()
    {
        using var host = new HostSoa();
        var resposta = await host.Client.PostAsJsonAsync("/api/comparacoes/trajetos", Consulta());
        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        var json = await resposta.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("DadosInsuficientes", json.GetProperty("status").GetString());
        Assert.Equal(JsonValueKind.Null, json.GetProperty("rotaComMenorExposicaoEstimada").ValueKind);
        var auditoria = await host.Client.GetFromJsonAsync<JsonElement>("/api/dados/auditoria");
        Assert.Equal(1, auditoria.GetArrayLength());
        var nomes = auditoria[0].EnumerateObject().Select(p => p.Name).Order().ToArray();
        Assert.Equal(new[] { "dataHoraUtc", "faixaConsulta", "id", "largurasTestadasM", "quantidadeRotas", "statusResultado" }, nomes);
    }

    [Fact]
    public async Task CargaDemonstracao_PersisteESeIdentificaSemAlegarSSPReal()
    {
        using var host = new HostSoa(demonstracao: true);
        using (var scope = host.Services.CreateScope())
            await DadosDemonstracao.CarregarAsync(scope.ServiceProvider.GetRequiredService<VoltaSeguraDbContext>());
        var situacao = await host.Client.GetFromJsonAsync<JsonElement>("/api/dados/situacao");
        Assert.Equal(80, situacao.GetProperty("boletinsDistintos").GetInt32());
        Assert.Equal("demonstracao", situacao.GetProperty("tipoAcervo").GetString());
        var response = await host.Client.PostAsJsonAsync("/api/comparacoes/trajetos", Consulta());
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(json.GetProperty("fontes").GetProperty("exemplo").GetBoolean());
        Assert.Equal("mock", json.GetProperty("fontes").GetProperty("roteamento").GetString());
        Assert.Equal(2, json.GetProperty("rotas").GetArrayLength());
    }

    [Theory]
    [InlineData("{}")]
    [InlineData("{\"origem\":{\"latitude\":999,\"longitude\":0},\"destino\":{\"latitude\":1,\"longitude\":1},\"saida\":\"2026-11-19T23:00:00-03:00\"}")]
    [InlineData("{\"origem\":{\"latitude\":1,\"longitude\":1},\"destino\":{\"latitude\":1,\"longitude\":1},\"saida\":\"2026-11-19T23:00:00-03:00\"}")]
    [InlineData("{\"origem\":{\"latitude\":1,\"longitude\":1},\"destino\":{\"latitude\":2,\"longitude\":2},\"saida\":\"2026-11-19T23:00:00\"}")]
    [InlineData("{\"origem\":{\"latitude\":1,\"longitude\":1},\"destino\":{\"latitude\":2,\"longitude\":2},\"saida\":\"2026-11-19T23:00:00-03:00\",\"inicio\":\"2026-09-01\",\"fim\":\"2026-01-01\"}")]
    public async Task EntradaInvalida_Retorna400SemGravarConsulta(string corpo)
    {
        using var host = new HostSoa();
        var response = await host.Client.PostAsync("/api/comparacoes/trajetos", new StringContent(corpo, System.Text.Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(0, (await host.Client.GetFromJsonAsync<JsonElement>("/api/dados/auditoria")).GetArrayLength());
    }

    [Fact]
    public async Task UmaAlternativa_Retorna200SemComparacao()
    {
        using var host = new HostSoa(new RoteadorControlado(1));
        var response = await host.Client.PostAsJsonAsync("/api/comparacoes/trajetos", Consulta());
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Single(json.GetProperty("rotas").EnumerateArray());
        Assert.Equal(JsonValueKind.Null, json.GetProperty("rotaComMenorExposicaoEstimada").ValueKind);
    }

    [Theory]
    [InlineData(false, 503)]
    [InlineData(true, 504)]
    public async Task FalhaDeRoteamento_NaoRetornaMockNemDetalhesInternos(bool timeout, int status)
    {
        using var host = new HostSoa(new RoteadorControlado(0, timeout ? new TaskCanceledException() : new HttpRequestException("endereço privado")));
        var response = await host.Client.PostAsJsonAsync("/api/comparacoes/trajetos", Consulta());
        Assert.Equal(status, (int)response.StatusCode);
        Assert.DoesNotContain("endereço privado", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Swagger_ExplicaRequisicaoEResposta()
    {
        using var host = new HostSoa();
        var doc = await host.Client.GetFromJsonAsync<JsonElement>("/swagger/v1/swagger.json");
        Assert.Equal(3, doc.GetProperty("paths").EnumerateObject().Count());
        Assert.True(doc.GetProperty("components").GetProperty("schemas").TryGetProperty("RespostaComparacao", out _));
    }

    private sealed class RoteadorControlado(int quantidade, Exception? falha = null) : IRoteador
    {
        public string Fonte => "mock";
        public async Task<IReadOnlyList<Trajeto>> PlanejarAsync(Coordenada o, Coordenada d, string sentido, DateTimeOffset saida, CancellationToken ct)
        {
            if (falha != null) throw falha;
            return (await new RoteadorMock().PlanejarAsync(o, d, sentido, saida, ct)).Take(quantidade).ToList();
        }
    }
}

internal sealed class HostSoa : WebApplicationFactory<ServicosEntryPoint>
{
    private readonly SqliteConnection _conexao = new("Data Source=:memory:");
    private readonly IRoteador? _roteador;
    public HttpClient Client { get; }
    public HostSoa(IRoteador? roteador = null, bool demonstracao = false)
    {
        _roteador = roteador;
        _conexao.Open();
        Client = CreateClient();
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<VoltaSeguraDbContext>();
        db.Database.Migrate();
        if (demonstracao) DadosDemonstracao.CarregarAsync(db).GetAwaiter().GetResult();
    }
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureServices(s =>
        {
            s.RemoveAll<DbContextOptions<VoltaSeguraDbContext>>();
            s.AddDbContext<VoltaSeguraDbContext>(o => o.UseSqlite(_conexao));
            if (_roteador != null) { s.RemoveAll<IRoteador>(); s.AddSingleton(_roteador); }
        });
    }
    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) { Client.Dispose(); _conexao.Dispose(); }
    }
}
