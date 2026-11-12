using Microsoft.EntityFrameworkCore;
using VoltaSegura.Domain.Entidades;

namespace VoltaSegura.Infrastructure.Dados;

/// <summary>
/// Contexto do EF Core do VoltaSegura. Único banco da solution — compartilhado pelas
/// duas APIs (VoltaSegura.Api e VoltaSegura.Servicos), com migrações versionadas aqui.
/// </summary>
public class VoltaSeguraDbContext : DbContext
{
    public VoltaSeguraDbContext(DbContextOptions<VoltaSeguraDbContext> options)
        : base(options)
    {
    }

    public DbSet<Ocorrencia> Ocorrencias => Set<Ocorrencia>();

    public DbSet<Trajeto> TrajetosSalvos => Set<Trajeto>();

    public DbSet<RegistroConsulta> RegistrosConsulta => Set<RegistroConsulta>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ocorrencia>(entidade =>
        {
            entidade.ToTable("ocorrencias");
            // Boletim distinto (item 12): NUM_BO + ANO_BO + delegacia.
            entidade.HasIndex(o => new { o.NumeroBo, o.AnoBo, o.Delegacia }).IsUnique();
            entidade.HasIndex(o => new { o.Bairro, o.DataOcorrencia });
            entidade.HasIndex(o => o.Faixa);
            entidade.Property(o => o.NumeroBo).HasMaxLength(40);
            entidade.Property(o => o.AnoBo).HasMaxLength(8);
            entidade.Property(o => o.Delegacia).HasMaxLength(120);
            entidade.Property(o => o.Rubrica).HasMaxLength(80);
            entidade.Property(o => o.TipoLocal).HasMaxLength(60);
            entidade.Property(o => o.Bairro).HasMaxLength(80);
            entidade.Property(o => o.Municipio).HasMaxLength(80);
        });

        modelBuilder.Entity<Trajeto>(entidade =>
        {
            entidade.ToTable("trajetos");
            entidade.HasMany(t => t.Trechos).WithOne().HasForeignKey("TrajetoId");
            entidade.Property(t => t.NomeOrigem).HasMaxLength(120);
            entidade.Property(t => t.NomeDestino).HasMaxLength(120);
            entidade.Property(t => t.Sentido).HasMaxLength(8);
            entidade.HasIndex(t => new { t.NomeOrigem, t.NomeDestino, t.Sentido });
        });

        modelBuilder.Entity<Trecho>(entidade =>
        {
            entidade.ToTable("trechos");
            entidade.Property(t => t.Modo).HasMaxLength(12);
            entidade.Property(t => t.GeometriaJson);
        });

        modelBuilder.Entity<RegistroConsulta>(entidade =>
        {
            entidade.ToTable("registros_consulta");
            // Sem coordenadas, endereços ou identificadores (item 23: logs sem coordenadas).
            entidade.Property(r => r.StatusResultado).HasMaxLength(30);
            entidade.Property(r => r.LargurasTestadasM).HasMaxLength(40);
            entidade.Property(r => r.FaixaConsulta).HasMaxLength(20);
        });
    }
}

