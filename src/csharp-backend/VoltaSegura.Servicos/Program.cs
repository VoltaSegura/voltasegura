using Microsoft.EntityFrameworkCore;
using VoltaSegura.Domain.Interfaces;
using VoltaSegura.Infrastructure.Dados;
using VoltaSegura.Infrastructure.Repositorios;
using VoltaSegura.Infrastructure.Roteamento;

var builder = WebApplication.CreateBuilder(args);

// ── Banco compartilhado com a VoltaSegura.Api (mesma solution, mesmo domínio) ──
builder.Services.AddDbContext<VoltaSeguraDbContext>(opcoes =>
    opcoes.UseSqlite(FabricaDesignTime.CaminhoBanco()));

// ── Orquestração de serviços: roteador (OTP2/mock) + repositorio + avaliador ──
// Para ativar o OTP2 (item 22, EM ABERTO):
//   builder.Services.AddHttpClient<IRoteador, Otp2Roteador>(c =>
//       c.BaseAddress = new Uri(builder.Configuration["Otp2:BaseUrl"]!));
builder.Services.AddSingleton<IRoteador, RoteadorMock>();
builder.Services.AddScoped<IOcorrenciaRepositorio, OcorrenciaRepositorio>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();

app.Run();
