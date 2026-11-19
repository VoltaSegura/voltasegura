namespace VoltaSegura.Domain.Entidades;

/// <summary>Proveniência da carga; dados sintéticos nunca recebem o rótulo SSP-SP.</summary>
public class Acervo
{
    public int Id { get; set; } = 1;
    public string Tipo { get; set; } = "nao_informado";
    public string Fonte { get; set; } = string.Empty;
    public DateOnly Inicio { get; set; }
    public DateOnly Fim { get; set; }
    public DateTime AtualizadoEmUtc { get; set; }
    public string? Sha256 { get; set; }
}
