using Microsoft.EntityFrameworkCore;
using VoltaSegura.Infrastructure;
using VoltaSegura.Infrastructure.Dados;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AdicionarBackend(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.SwaggerDoc("v1", new() { Title = "VoltaSegura — VoltaSegura.Api", Version = "v1",
        Description = "Protótipo acadêmico. Roteamento mock e acervo sintético identificados na resposta; exposição estimada não é garantia." });
    var xml = Path.Combine(AppContext.BaseDirectory, "VoltaSegura.Api.xml");
    if (File.Exists(xml)) o.IncludeXmlComments(xml);
});
var app = builder.Build();
// Comandos locais explícitos: não alteram o banco automaticamente ao iniciar a API.
if (args.Contains("--migrar") || args.Contains("--demonstracao"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<VoltaSeguraDbContext>();
    await db.Database.MigrateAsync();
    if (args.Contains("--demonstracao")) await DadosDemonstracao.CarregarAsync(db);
    Console.WriteLine("Migrações aplicadas. " + (args.Contains("--demonstracao") ? "Acervo SINTÉTICO pronto." : ""));
    return;
}
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseAuthorization();
app.MapControllers();
app.Run();

public partial class ApiEntryPoint { }
