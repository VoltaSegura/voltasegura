using Microsoft.EntityFrameworkCore;
using VoltaSegura.Domain.Interfaces;
using VoltaSegura.Infrastructure.Dados;
using VoltaSegura.Infrastructure.Roteamento;

var builder = WebApplication.CreateBuilder(args);

// ── Banco de dados (EF Core + SQLite; migrações versionadas na Infrastructure) ──
builder.Services.AddDbContext<VoltaSeguraDbContext>(opcoes =>
    opcoes.UseSqlite(FabricaDesignTime.CaminhoBanco()));

// ── Injeção de dependência do roteador ──
// Enquanto o OTP2 não estiver ativo em servidor próprio (item 22, EM ABERTO),
// registra-se o mock determinístico. Para trocar:
//   builder.Services.AddHttpClient<IRoteador, Otp2Roteador>(c =>
//       c.BaseAddress = new Uri(builder.Configuration["Otp2:BaseUrl"]!));
builder.Services.AddSingleton<IRoteador, RoteadorMock>();

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
