using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace VoltaSegura.Infrastructure.Dados;

/// <summary>
/// Fábrica usada apenas pelas ferramentas de migração (dotnet-ef) em tempo de design,
/// sem depender do host das APIs. O caminho do banco pode ser sobrescrito pela
/// variável VOLTASEGURA_DB.
/// </summary>
public class FabricaDesignTime : IDesignTimeDbContextFactory<VoltaSeguraDbContext>
{
    public VoltaSeguraDbContext CreateDbContext(string[] args)
    {
        var opcoes = new DbContextOptionsBuilder<VoltaSeguraDbContext>()
            .UseSqlite(CaminhoBanco())
            .Options;
        return new VoltaSeguraDbContext(opcoes);
    }

    public static string CaminhoBanco()
    {
        var caminho = Environment.GetEnvironmentVariable("VOLTASEGURA_DB")
            ?? Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "dados", "voltasegura.db");
        var diretorio = Path.GetDirectoryName(Path.GetFullPath(caminho))!;
        Directory.CreateDirectory(diretorio);
        return $"Data Source={Path.GetFullPath(caminho)}";
    }
}
