using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Domain.Servicos;
using VoltaSegura.Infrastructure.Dados;
using VoltaSegura.Infrastructure.Repositorios;
using Xunit;

namespace VoltaSegura.Tests;

/// <summary>
/// Teste de INTEGRAÇÃO ponta a ponta do pipeline de comparação, sem mocks de lógica:
/// banco SQLite em memória com o schema real do EF Core → repositório de ocorrências
/// (corredor + Haversine) → avaliador (itens 11/12) → estabilidade de largura (item 16).
/// Valida o caminho "Conclusiva" com dados no banco — os testes de unidade cobrem
/// apenas o avaliador puro.
/// </summary>
public class ComparacaoPontaAPontaTests
{
    private readonly SqliteConnection _conexao;
    private readonly VoltaSeguraDbContext _contexto;

    public ComparacaoPontaAPontaTests()
    {
        // Conexão em memória mantida aberta durante o teste (SQLite in-memory
        // morre quando a conexão fecha — manter a referência viva).
        _conexao = new SqliteConnection("DataSource=:memory:");
        _conexao.Open();
        var opcoes = new DbContextOptionsBuilder<VoltaSeguraDbContext>()
            .UseSqlite(_conexao)
            .Options;
        _contexto = new VoltaSeguraDbContext(opcoes);
        _contexto.Database.EnsureCreated();
    }

    /// <summary>Corredor de ~0,9 km, 10 pontos espaçados ~100 m em latitude.</summary>
    private static IReadOnlyList<Coordenada> Corredor(double longitude)
        => Enumerable.Range(0, 10)
            .Select(i => new Coordenada(-23.5500 + i * 0.0009, longitude))
            .ToList();

    /// <summary>BOs a ~28 m do ponto informado (dentro do raio de 50 m).</summary>
    private static Ocorrencia Bo(int numero, Coordenada ponto, DateOnly data)
        => new()
        {
            NumeroBo = $"BO-{numero:D6}",
            AnoBo = "2026",
            Delegacia = "DELEGACIA TESTE",
            Rubrica = "FURTO - OUTROS",
            TipoLocal = "Via pública",
            Bairro = "TESTE",
            Municipio = "S.PAULO",
            DataOcorrencia = data,
            Faixa = FaixaDoDia.Noite,
            Latitude = ponto.Latitude + 0.00025,
            Longitude = ponto.Longitude,
        };

    [Fact]
    public async Task Pipeline_ComCorredoresDistintos_RetornaConclusivaEstavel()
    {
        var corredorA = Corredor(-46.6400); // rota A: 40 BOs distintos
        var corredorB = Corredor(-46.5800); // rota B: 10 BOs distintos
        var data = new DateOnly(2026, 3, 15);

        var numero = 0;
        foreach (var ponto in corredorA)
        {
            for (var i = 0; i < 4; i++)
                _contexto.Ocorrencias.Add(Bo(numero++, ponto, data));
        }
        foreach (var ponto in corredorB)
        {
            _contexto.Ocorrencias.Add(Bo(numero++, ponto, data));
        }
        await _contexto.SaveChangesAsync(CancellationToken.None);

        var repositorio = new OcorrenciaRepositorio(_contexto);
        var periodoInicio = new DateOnly(2026, 1, 1);
        var periodoFim = new DateOnly(2026, 9, 30);
        var faixas = new[] { FaixaDoDia.Noite };

        var avaliador = new AvaliadorComparacao();
        var porLargura = new Dictionary<double, ResultadoComparacao>();
        foreach (var largura in EstabilidadeCorredor.LargurasPadraoM)
        {
            var nA = await repositorio.ContarBoletinsDistintosAsync(
                corredorA, largura, periodoInicio, periodoFim, faixas, CancellationToken.None);
            var coberturaA = await repositorio.CoberturaCorredorAsync(
                corredorA, largura, periodoInicio, periodoFim, faixas, CancellationToken.None);
            var nB = await repositorio.ContarBoletinsDistintosAsync(
                corredorB, largura, periodoInicio, periodoFim, faixas, CancellationToken.None);
            var coberturaB = await repositorio.CoberturaCorredorAsync(
                corredorB, largura, periodoInicio, periodoFim, faixas, CancellationToken.None);

            Assert.Equal(40, nA);
            Assert.Equal(10, nB);
            Assert.True(coberturaA >= AvaliadorComparacao.CoberturaMinima);
            Assert.True(coberturaB >= AvaliadorComparacao.CoberturaMinima);

            // ~0,9 km caminhados em cada corredor (10 pontos × ~100 m).
            porLargura[largura] = avaliador.Avaliar(
                new CenarioRota("R1", nA, 0.9, coberturaA),
                new CenarioRota("R2", nB, 0.9, coberturaB));
        }

        var resultado = EstabilidadeCorredor.Consolidar(porLargura);

        // R2 tem N e D menores — a regra do item 11 destaca R2 (menor exposição estimada).
        Assert.Equal(StatusComparacao.Conclusiva, resultado.Status);
        Assert.Equal("R2", resultado.RotaDestacada);
        Assert.NotNull(resultado.PValor);
        Assert.True(resultado.PValor < AvaliadorComparacao.NivelSignificancia);
        Assert.Equal(40.0 / 0.9, resultado.ExposicaoEstimadaPorRota["R1"], 6);
        Assert.Equal(10.0 / 0.9, resultado.ExposicaoEstimadaPorRota["R2"], 6);
    }

    [Fact]
    public async Task Repositorio_BoletimRepetidoContaUmaVez_GaranteBoletimDistinto()
    {
        // Item 12: N conta BOs distintos (NUM_BO + ANO_BO + delegacia), não linhas.
        var corredor = Corredor(-46.6400);
        var data = new DateOnly(2026, 5, 10);
        _contexto.Ocorrencias.Add(Bo(1, corredor[0], data));
        await _contexto.SaveChangesAsync(CancellationToken.None);

        // Tentativa de inserir a MESMA chave por SQL bruto (como linhas repetidas
        // chegariam do dataset público): o índice único + INSERT OR IGNORE descartam.
        var ignoradas = await _contexto.Database.ExecuteSqlAsync(
            $@"INSERT OR IGNORE INTO ocorrencias
               (NumeroBo, AnoBo, Delegacia, Rubrica, TipoLocal, Bairro, Municipio,
                DataOcorrencia, Faixa, Latitude, Longitude)
               VALUES ('BO-000001', '2026', 'DELEGACIA TESTE', 'FURTO - OUTROS',
                       'Via pública', 'TESTE', 'S.PAULO', '2026-05-10', 4,
                       {-23.5500 + 0.00030}, -46.6400)");
        Assert.Equal(0, ignoradas);

        var repositorio = new OcorrenciaRepositorio(_contexto);
        var n = await repositorio.ContarBoletinsDistintosAsync(
            corredor, 100, new DateOnly(2026, 1, 1), new DateOnly(2026, 9, 30),
            new[] { FaixaDoDia.Noite }, CancellationToken.None);

        Assert.Equal(1, n);
    }

    [Fact]
    public async Task Repositorio_ForaDoPeriodoOuFaixa_NaoConta()
    {
        var corredor = Corredor(-46.6400);
        _contexto.Ocorrencias.Add(Bo(1, corredor[0], new DateOnly(2026, 3, 1)));  // no período
        _contexto.Ocorrencias.Add(Bo(2, corredor[1], new DateOnly(2025, 3, 1)));  // fora do período
        var outraFaixa = Bo(3, corredor[2], new DateOnly(2026, 3, 1));
        outraFaixa.Faixa = FaixaDoDia.Madrugada;                                  // fora da faixa
        _contexto.Ocorrencias.Add(outraFaixa);
        var semFaixa = Bo(4, corredor[3], new DateOnly(2026, 3, 1));
        semFaixa.Faixa = null;                                                    // faixa NULL (55% da base real)
        _contexto.Ocorrencias.Add(semFaixa);
        await _contexto.SaveChangesAsync(CancellationToken.None);

        var repositorio = new OcorrenciaRepositorio(_contexto);
        var n = await repositorio.ContarBoletinsDistintosAsync(
            corredor, 100, new DateOnly(2026, 1, 1), new DateOnly(2026, 9, 30),
            new[] { FaixaDoDia.Noite }, CancellationToken.None);

        Assert.Equal(1, n);
    }

    public void Dispose()
    {
        _contexto.Dispose();
        _conexao.Dispose();
    }
}
