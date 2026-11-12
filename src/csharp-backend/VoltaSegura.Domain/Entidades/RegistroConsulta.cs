namespace VoltaSegura.Domain.Entidades;

/// <summary>
/// Registro de auditoria de uma consulta de comparação (log de uso do serviço).
/// PRIVACIDADE (proposta preliminar do grupo, item 23): este registro NÃO contém
/// coordenadas, endereços ou identificadores do usuário — apenas metadados estatísticos
/// da consulta. Consultas sem conta são descartadas; nada é compartilhado com
/// universidades no MVP. Material direto para o módulo PII da disciplina de Cybersecurity.
/// </summary>
public class RegistroConsulta
{
    public long Id { get; set; }

    public DateTime DataHoraUtc { get; set; }

    /// <summary>Status retornado: Conclusiva, Divergente ou DadosInsuficientes.</summary>
    public string StatusResultado { get; set; } = string.Empty;

    /// <summary>Larguras de corredor testadas (ex.: 50/100/150 m — item 12).</summary>
    public string LargurasTestadasM { get; set; } = string.Empty;

    /// <summary>Quantidade de alternativas de trajeto comparadas.</summary>
    public int QuantidadeRotas { get; set; }

    /// <summary>Faixa do dia da consulta (não identifica o usuário).</summary>
    public string? FaixaConsulta { get; set; }
}
