using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Domain.Interfaces;
using VoltaSegura.Infrastructure.Dados;
using VoltaSegura.Infrastructure.Repositorios;

namespace VoltaSegura.Tests;

public class CorredorRegressaoTests : IDisposable
{
    private readonly SqliteConnection _conexao = new("Data Source=:memory:");
    private readonly VoltaSeguraDbContext _db;
    private readonly DateOnly _inicio = new(2026, 1, 1), _fim = new(2026, 9, 30);
    public CorredorRegressaoTests()
    {
        _conexao.Open();
        _db = new(new DbContextOptionsBuilder<VoltaSeguraDbContext>().UseSqlite(_conexao).Options);
        _db.Database.EnsureCreated();
    }
    private void Adicionar(int id, double? lat, double? lon, FaixaDoDia? faixa = FaixaDoDia.Noite)
    {
        _db.Ocorrencias.Add(new() { NumeroBo = id.ToString(), AnoBo = "2026", Delegacia = "TESTE",
            Circunscricao = "TESTE", Natureza = "FURTO - OUTROS", DataOcorrencia = new(2026, 3, 1),
            Latitude = lat, Longitude = lon, Faixa = faixa });
        _db.SaveChanges();
    }
    private Task<int> Contar(params CorredorCaminhada[] caminhadas) =>
        new OcorrenciaRepositorio(_db).ContarBoletinsDistintosAsync(caminhadas, 100, _inicio, _fim, default);

    [Fact]
    public async Task BoNoMeioDoSegmentoLongo_EntraNoCorredor()
    {
        Adicionar(1, -23.55, -46.64);
        Assert.Equal(1, await Contar(new CorredorCaminhada(new[] { new Coordenada(-23.56, -46.64), new(-23.54, -46.64) }, FaixaDoDia.Noite)));
    }
    [Fact]
    public async Task TransporteEntreCaminhadas_NaoViraCorredorAPe()
    {
        Adicionar(1, -23.55, -46.64);
        var a = new CorredorCaminhada(new[] { new Coordenada(-23.57, -46.64), new(-23.565, -46.64) }, FaixaDoDia.Noite);
        var b = new CorredorCaminhada(new[] { new Coordenada(-23.535, -46.64), new(-23.53, -46.64) }, FaixaDoDia.Noite);
        Assert.Equal(0, await Contar(a, b));
    }
    [Fact]
    public async Task MargemLongitude_NaoExcluiBoDentroDe100m()
    {
        Adicionar(1, -23.55, -46.63905); // ~97 m a leste, além de 100/111320 graus.
        Assert.Equal(1, await Contar(new CorredorCaminhada(new[] { new Coordenada(-23.56, -46.64), new(-23.54, -46.64) }, FaixaDoDia.Noite)));
    }
    [Fact]
    public async Task PeriodoAusenteOuLongitudeAusente_ReduzemCoberturaSemEntrarEmN()
    {
        Adicionar(1, -23.55, -46.64);
        Adicionar(2, -23.55, null);
        Adicionar(3, -23.55, -46.64, null);
        Adicionar(4, 999, -46.64);
        var linha = new[] { new Coordenada(-23.56, -46.64), new(-23.54, -46.64) };
        var repo = new OcorrenciaRepositorio(_db);
        Assert.Equal(1, await repo.ContarBoletinsDistintosAsync(linha, 100, _inicio, _fim, null, default));
        Assert.Equal(.25, await repo.CoberturaCorredorAsync(linha, 100, _inicio, _fim, null, default));
    }
    [Fact]
    public async Task CadaCaminhadaUsaSuaFaixa_SemDuplaContagem()
    {
        Adicionar(1, -23.55, -46.64, FaixaDoDia.Noite);
        Adicionar(2, -23.54, -46.64, FaixaDoDia.Madrugada);
        Adicionar(3, -23.55, -46.64, FaixaDoDia.Madrugada); // não fica no trecho da madrugada
        var a = new CorredorCaminhada(new[] { new Coordenada(-23.551, -46.64), new(-23.549, -46.64) }, FaixaDoDia.Noite);
        var b = new CorredorCaminhada(new[] { new Coordenada(-23.541, -46.64), new(-23.539, -46.64) }, FaixaDoDia.Madrugada);
        Assert.Equal(2, await Contar(a, a, b));
    }
    [Theory]
    [InlineData("2026-11-20T02:59:00Z", FaixaDoDia.Noite)]
    [InlineData("2026-11-20T03:01:00Z", FaixaDoDia.Madrugada)]
    public void FaixaDoTrecho_UsaHorarioDeSaoPaulo(string instante, FaixaDoDia esperado)
        => Assert.Equal(esperado, PeriodoLocal.Faixa(DateTimeOffset.Parse(instante)));
    public void Dispose() { _db.Dispose(); _conexao.Dispose(); }
}
