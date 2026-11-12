using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Infrastructure.Dados;

namespace VoltaSegura.Api.Controllers;

/// <summary>
/// Consulta aos boletins agregados do recorte SSP-SP (Furto/Roubo/Trânsito — item 8).
/// Respostas SEMPRE agregadas: nunca expõem BO individual ao cidadão. Demonstração
/// de LINQ + async + EF Core (rubrica da disciplina de C#).
/// </summary>
[ApiController]
[Route("api/ocorrencias")]
public class OcorrenciasController : ControllerBase
{
    private readonly VoltaSeguraDbContext _contexto;

    public OcorrenciasController(VoltaSeguraDbContext contexto) => _contexto = contexto;

    /// <summary>Resumo agregado por bairro e faixa do dia, com o período consultado sempre explícito.</summary>
    /// <param name="bairro">Filtro opcional por bairro (nome exato da SSP-SP).</param>
    /// <param name="natureza">Filtro opcional por NATUREZA_APURADA (docs/07 — ex.: "FURTO - OUTROS").</param>
    /// <param name="rubrica">Filtro opcional por rubrica (conservada para auditoria — docs/07).</param>
    /// <param name="faixa">Filtro opcional por faixa do dia (1=madrugada, 2=manhã, 3=tarde, 4=noite).</param>
    [HttpGet]
    public async Task<IActionResult> Resumo(
        [FromQuery] string? bairro, [FromQuery] string? natureza, [FromQuery] string? rubrica,
        [FromQuery] int? faixa, CancellationToken ct)
    {
        var consulta = _contexto.Ocorrencias.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(bairro))
            consulta = consulta.Where(o => o.Bairro == bairro);
        if (!string.IsNullOrWhiteSpace(natureza))
            consulta = consulta.Where(o => o.Natureza == natureza);
        if (!string.IsNullOrWhiteSpace(rubrica))
            consulta = consulta.Where(o => o.Rubrica == rubrica);
        if (faixa is >= 1 and <= 4)
            consulta = consulta.Where(o => o.Faixa == (FaixaDoDia)faixa);

        var resumo = await consulta
            .GroupBy(o => new { o.Bairro, o.Faixa })
            .Select(g => new
            {
                g.Key.Bairro,
                Faixa = g.Key.Faixa.ToString(),
                // O índice único (NUM_BO, ANO_BO, delegacia) garante um registro por boletim
                // distinto (item 12) — contar linhas já conta boletins distintos.
                BoletinsDistintos = g.Count(),
            })
            .OrderBy(r => r.Bairro)
            .Take(200)
            .ToListAsync(ct);

        var existeDado = await consulta.AnyAsync(ct);
        DateOnly? inicioPeriodo = null, fimPeriodo = null;
        if (existeDado)
        {
            inicioPeriodo = await consulta.MinAsync(o => o.DataOcorrencia, ct);
            fimPeriodo = await consulta.MaxAsync(o => o.DataOcorrencia, ct);
        }

        return Ok(new
        {
            periodoDados = inicioPeriodo is null || fimPeriodo is null
                ? null
                : new { inicio = inicioPeriodo, fim = fimPeriodo },
            sobreOsDados = SobreOsDados.FrasesFixas,
            resumo,
        });
    }
}

/// <summary>Bloco "Sobre os dados" (item 15): fonte e período, cobertura, situação da comparação — sempre visível, sem nota nem níveis.</summary>
public static class SobreOsDados
{
    /// <summary>
    /// FRASES FIXAS acordadas (item 15). A copy final para as telas é tarefa do grupo
    /// [EM ABERTO] — não apresentar como copy fechada antes de aprovação.
    /// </summary>
    public static readonly string[] FrasesFixas =
    {
        "Dados públicos da SSP-SP e da SPTrans, com fonte e período indicados em cada consulta.",
        "A cobertura dos dados varia por região e período — leia a cobertura antes de comparar.",
        "Quando os dados são insuficientes, a comparação não é concluída — nunca há resposta silenciosa.",
    };
}
