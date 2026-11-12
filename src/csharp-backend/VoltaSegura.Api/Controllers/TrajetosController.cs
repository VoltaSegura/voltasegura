using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Infrastructure.Dados;

namespace VoltaSegura.Api.Controllers;

/// <summary>
/// Trajetos salvos pelo cidadão (ida e volta). O histórico fica no banco do usuário
/// do app — aqui é a persistência opcional do lado do serviço, sem dados de
/// localização bruta além do que o usuário escolhe nomear (proposta preliminar de
/// privacidade, item 23).
/// </summary>
[ApiController]
[Route("api/trajetos")]
public class TrajetosController : ControllerBase
{
    private readonly VoltaSeguraDbContext _contexto;

    public TrajetosController(VoltaSeguraDbContext contexto) => _contexto = contexto;

    /// <summary>Lista os trajetos salvos (async + LINQ).</summary>
    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken ct)
    {
        var trajetos = await _contexto.TrajetosSalvos
            .AsNoTracking()
            .OrderByDescending(t => t.Id)
            .Take(50)
            .Select(t => new
            {
                t.Id,
                t.NomeOrigem,
                t.NomeDestino,
                t.Sentido,
                DistanciaTotalKm = Math.Round(t.DistanciaTotalKm, 2),
                KmCaminhados = Math.Round(t.KmCaminhados, 2),
                QuantidadeTrechos = t.Trechos.Count,
            })
            .ToListAsync(ct);
        return Ok(trajetos);
    }

    /// <summary>Salva um trajeto (ida ou volta) com seus trechos.</summary>
    [HttpPost]
    public async Task<IActionResult> Salvar([FromBody] RequisicaoTrajeto requisicao, CancellationToken ct)
    {
        if (requisicao is null || requisicao.Trechos.Count == 0)
            return BadRequest(new { erro = "informe ao menos um trecho" });

        var trajeto = new Trajeto
        {
            NomeOrigem = requisicao.NomeOrigem,
            NomeDestino = requisicao.NomeDestino,
            Sentido = requisicao.Sentido,
            Trechos = requisicao.Trechos
                .Select((t, i) => Trecho.Criar(i, t.Modo, t.ComprimentoKm, t.Pontos))
                .ToList(),
        };

        _contexto.TrajetosSalvos.Add(trajeto);
        await _contexto.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Listar), new { id = trajeto.Id }, new
        {
            trajeto.Id,
            trajeto.NomeOrigem,
            trajeto.NomeDestino,
            trajeto.Sentido,
        });
    }

    /// <summary>Corpo de criação de trajeto.</summary>
    public sealed record RequisicaoTrajeto(string NomeOrigem, string NomeDestino, string Sentido, List<TrechoRequisicao> Trechos);

    /// <summary>Trecho do corpo de criação.</summary>
    /// <param name="Modo">WALK, BUS, SUBWAY, RAIL ou TRAM.</param>
    public sealed record TrechoRequisicao(string Modo, double ComprimentoKm, List<Coordenada> Pontos);
}
