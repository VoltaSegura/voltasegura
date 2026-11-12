namespace VoltaSegura.Domain.Entidades;

/// <summary>
/// Boletim de ocorrência do recorte acordado pelo grupo (docs/07 e docs/08, 11/11/2026):
/// grupos Furto, Roubo e Trânsito por NATUREZA_APURADA. Apenas FURTO - OUTROS e
/// ROUBO - OUTROS entram na comparação de trajetos (docs/08 §3); as demais naturezas
/// carregadas são contexto informativo (docs/07). Homicídio, tentativa e violência
/// sexual ficam restritos ao panorama municipal opcional, sem ligação a rua ou rota.
/// </summary>
public class Ocorrencia
{
    /// <summary>Naturezas que compõem N na comparação de trajetos (docs/07 e docs/08 §3).</summary>
    public static readonly string[] NaturezasComparacao =
        { "FURTO - OUTROS", "ROUBO - OUTROS" };

    public long Id { get; set; }

    /// <summary>Campo NUM_BO da SSP-SP.</summary>
    public string NumeroBo { get; set; } = string.Empty;

    /// <summary>Campo ANO_BO da SSP-SP.</summary>
    public string AnoBo { get; set; } = string.Empty;

    /// <summary>Nome da delegacia — parte da chave de boletim distinto (docs/08 §59).</summary>
    public string Delegacia { get; set; } = string.Empty;

    /// <summary>
    /// Circunscrição de delegacia (NOME_DELEGACIA_CIRCUNSCRICAO) — base da checagem
    /// de cobertura mínima (docs/08 §64: ≥ 80% por alternativa e diferença ≤ 10 p.p.).
    /// </summary>
    public string Circunscricao { get; set; } = string.Empty;

    /// <summary>NATUREZA_APURADA da SSP-SP (docs/07: campo que define os grupos do app).</summary>
    public string Natureza { get; set; } = string.Empty;

    /// <summary>RUBRICA da SSP-SP — conservada para auditoria e explicação de divergências (docs/07).</summary>
    public string Rubrica { get; set; } = string.Empty;

    /// <summary>Tipo de local publicado pela SSP (todos os tipos entram em N — docs/08 §57).</summary>
    public string TipoLocal { get; set; } = string.Empty;

    public string Bairro { get; set; } = string.Empty;

    public string Municipio { get; set; } = string.Empty;

    public DateOnly DataOcorrencia { get; set; }

    /// <summary>
    /// Faixa do dia conforme os 4 períodos da SSP (docs/08 §16). ANULÁVEL por honestidade:
    /// a faixa vem da HORA_OCORRENCIA_BO quando existe e, caso contrário, de DESC_PERIODO;
    /// "Em hora incerta" ou ambos ausentes → NULL. Esses boletins ficam fora da conta e
    /// reduzem a cobertura informada — nunca fabricar faixa.
    /// </summary>
    public FaixaDoDia? Faixa { get; set; }

    /// <summary>Coordenadas como publicadas pela fonte (docs/08 §61). Anonimizadas em logs e saídas.</summary>
    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    /// <summary>
    /// Chave de boletim distinto: NUM_BO + ANO_BO + delegacia (docs/08 §59).
    /// Garante que N conte BOs distintos, não linhas repetidas do dataset (os 42 BOs
    /// com furto e roubo contam uma vez).
    /// </summary>
    public string ChaveBoletim() => $"{NumeroBo}|{AnoBo}|{Delegacia}";
}

/// <summary>Os 4 períodos da SSP-SP: madrugada (0–5h), manhã (6–11h), tarde (12–17h) e noite (18–23h) — docs/08 §16.</summary>
public enum FaixaDoDia
{
    Madrugada = 1,
    Manha = 2,
    Tarde = 3,
    Noite = 4,
}
