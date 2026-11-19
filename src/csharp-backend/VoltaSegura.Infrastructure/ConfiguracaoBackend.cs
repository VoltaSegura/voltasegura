using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using VoltaSegura.Domain.Interfaces;
using VoltaSegura.Infrastructure.Dados;
using VoltaSegura.Infrastructure.Repositorios;
using VoltaSegura.Infrastructure.Roteamento;

namespace VoltaSegura.Infrastructure;

public static class ConfiguracaoBackend
{
    public static IServiceCollection AdicionarBackend(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<VoltaSeguraDbContext>(o => o.UseSqlite(FabricaDesignTime.CaminhoBanco()));
        services.AddScoped<IOcorrenciaRepositorio, OcorrenciaRepositorio>();
        var modo = config["Roteamento:Modo"] ?? "mock";
        if (modo == "mock") services.AddSingleton<IRoteador, RoteadorMock>();
        else if (modo == "otp2") services.AddHttpClient<IRoteador, Otp2Roteador>(c =>
        {
            c.BaseAddress = new Uri((config["Otp2:BaseUrl"] ?? "http://localhost:8080").TrimEnd('/') + "/");
            c.Timeout = TimeSpan.FromSeconds(45);
        }).RemoveAllLoggers();
        else throw new InvalidOperationException("Roteamento:Modo deve ser mock ou otp2.");
        return services;
    }
}
