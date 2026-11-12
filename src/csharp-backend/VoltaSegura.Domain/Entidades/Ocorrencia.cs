namespace VoltaSegura.Domain.Entidades;

/// <summary>
/// Boletim de ocorrência no recorte acordado pelo grupo (item 8 das decisões, 11/11/2026):
/// Furto, Roubo e Trânsito; apenas FURTO - OUTROS e ROUBO - OUTROS entram na comparação
/// de rota. Homicídio, tentativa e violência sexual ficam restritos ao panorama municipal
/// opcional, sem ligação a rua ou rota.
/// </summary>
public class Ocorrencia
{
    public long Id { get; set; }

    /// <summary>Campo NUM_BO da SSP-SP.</summary>
    public string NumeroBo { get; set; } = string.Empty;

    /// <summary>Campo ANO_BO da SSP-SP.</summary>
    public string AnoBo { get; set; } = string.Empty;

    /// <summary>Nome da delegacia — parte da chave de boletim distinto (item 12).</summary>
    public string Delegacia { get; set; } = string.Empty;

    /// <summary>Rubrica da SSP-SP (ex.: "FURTO - OUTROS", "ROUBO - OUTROS", ocorrências de trânsito).</summary>
    public string Rubrica { get; set; } = string.Empty;

    /// <summary>Tipo de local publicado pela SSP (todos os tipos entram na contagem — item 12).</summary>
    public string TipoLocal { get; set; } = string.Empty;

    public string Bairro { get; set; } = string.Empty;

    public string Municipio { get; set; } = string.Empty;

    public DateOnly DataOcorrencia { get; set; }

    /// <summary>
    /// Faixa do dia conforme os 4 períodos da SSP (item 12). ANULÁVEL por honestidade:
    /// ~57% dos BOs da capital em 2026 vêm sem DESC_PERIODO preenchido (ou "Em hora
    /// incerta") — nesses casos a faixa fica NULL e o BO não participa de contagens
    /// filtradas por faixa (achado de qualidade do ML, 10/11/2026).
    /// </summary>
    public FaixaDoDia? Faixa { get; set; }

    /// <summary>Coordenadas como publicadas pela fonte (item 12). Anonimizadas em logs e saídas.</summary>
    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    /// <summary>
    /// Chave de boletim distinto: NUM_BO + ANO_BO + delegacia (item 12 das decisões).
    /// Garante que N conte BOs distintos, não linhas repetidas do dataset.
    /// </summary>
    public string ChaveBoletim() => $"{NumeroBo}|{AnoBo}|{Delegacia}";
}

/// <summary>Os 4 períodos da SSP-SP: madrugada (00h–06h), manhã (06h–12h), tarde (12h–18h) e noite (18h–24h).</summary>
public enum FaixaDoDia
{
    Madrugada = 1,
    Manha = 2,
    Tarde = 3,
    Noite = 4,
}
