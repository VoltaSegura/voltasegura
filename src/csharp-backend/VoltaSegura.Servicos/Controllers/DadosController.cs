using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Infrastructure.Dados;

namespace VoltaSegura.Servicos.Controllers;

/// <summary>
/// Serviço de dados do VoltaSegura: cobertura e transparência das fontes usadas
/// nas comparações (bloco "Sobre os dados", item 15). Respostas agregadas.
/// </summary>
[ApiController]
[Route("api/dados")]
public class DadosController : ControllerBase
{
    private readonly VoltaSeguraDbContext _contexto;

    public DadosController(VoltaSeguraDbContext contexto) => _contexto = contexto;

    /// <summary>Situação geral do acervo de ocorrências carregado (quantidade e período coberto).</summary>
    [HttpGet("situacao")]
    public async Task<IActionResult> Situacao(CancellationToken ct)
    {
        var total = await _contexto.Ocorrencias.AsNoTracking().CountAsync(ct);
        if (total == 0)
        {
            // Banco vazio = resposta honesta e explícita, nunca silêncio (item 9 das decisões).
            return Ok(new
            {
                carregado = false,
                mensagem = "acervo de ocorrências ainda não carregado — toda comparação retornará dados insuficientes",
                fonte = "SSP-SP (recorte Furto/Roubo/Trânsito, item 8 das decisões do grupo)",
            });
        }

        var maisAntiga = await _contexto.Ocorrencias.AsNoTracking()
            .MinAsync(o => (DateOnly?)o.DataOcorrencia, ct);
        var maisRecente = await _contexto.Ocorrencias.AsNoTracking()
            .MaxAsync(o => (DateOnly?)o.DataOcorrencia, ct);

        return Ok(new
        {
            carregado = true,
            // O índice único (NUM_BO, ANO_BO, delegacia) garante um registro por boletim distinto (item 12).
            boletinsDistintos = total,
            periodoCoberto = new { inicio = maisAntiga, fim = maisRecente },
            fonte = "SSP-SP (recorte Furto/Roubo/Trânsito, item 8 das decisões do grupo)",
        });
    }

    /// <summary>Auditoria de consultas — SEM coordenadas, endereços ou identificadores (item 23).</summary>
    [HttpGet("auditoria")]
    public async Task<IActionResult> Auditoria(CancellationToken ct)
    {
        var registros = await _contexto.RegistrosConsulta
            .AsNoTracking()
            .OrderByDescending(r => r.Id)
            .Take(100)
            .ToListAsync(ct);
        return Ok(registros);
    }
}
