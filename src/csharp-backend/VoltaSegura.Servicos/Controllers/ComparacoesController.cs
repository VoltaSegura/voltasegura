using Microsoft.AspNetCore.Mvc;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Domain.Interfaces;
using VoltaSegura.Domain.Servicos;
using VoltaSegura.Infrastructure.Dados;

namespace VoltaSegura.Servicos.Controllers;

/// <summary>
/// Serviço de comparação de trajetos (ida e volta) — o coração do VoltaSegura.
/// Orquestra: roteador (OTP2 ou mock) → corredores caminhados → contagem N no
/// corredor → avaliador (regras dos itens 11/12/16) → resultado com bloco
/// "Sobre os dados". O produto comunica EXPOSIÇÃO ESTIMADA — nunca "rota segura".
/// </summary>
[ApiController]
[Route("api/comparacoes")]
public class ComparacoesController : ControllerBase
{
    private readonly IRoteador _roteador;
    private readonly IOcorrenciaRepositorio _ocorrencias;
    private readonly VoltaSeguraDbContext _contexto;

    public ComparacoesController(
        IRoteador roteador, IOcorrenciaRepositorio ocorrencias, VoltaSeguraDbContext contexto)
    {
        _roteador = roteador;
        _ocorrencias = ocorrencias;
        _contexto = contexto;
    }

    /// <summary>
    /// Compara duas alternativas de trajeto. Executa o avaliador nas larguras de
    /// corredor padrão (±50/±100/±150 m) e aplica o critério de estabilidade (item 16):
    /// resultado que muda com a largura = dados insuficientes.
    /// </summary>
    [HttpPost("trajetos")]
    public async Task<IActionResult> CompararTrajetos(
        [FromBody] RequisicaoComparacao requisicao, CancellationToken ct)
    {
        // 1. Planejar alternativas (serviço externo de roteamento).
        var rotas = await _roteador.PlanejarAsync(
            requisicao.Origem, requisicao.Destino, requisicao.Sentido ?? "ida", ct);
        if (rotas.Count < 2)
            return StatusCode(503, new { erro = "roteamento indisponível para esta consulta" });

        // 2. Período acordado (item 12): 12 meses; no MVP, jan–set/2026 com aviso.
        var inicio = requisicao.Inicio ?? new DateOnly(2026, 1, 1);
        var fim = requisicao.Fim ?? new DateOnly(2026, 9, 30);
        var faixas = requisicao.Faixas is { Count: > 0 }
            ? requisicao.Faixas.Select(f => (FaixaDoDia)f).ToList()
            : null;

        // 3. Cenários por rota e largura de corredor (itens 11/12).
        var porLargura = new Dictionary<double, ResultadoComparacao>();
        foreach (var largura in EstabilidadeCorredor.LargurasPadraoM)
        {
            var cenarios = new List<CenarioRota>();
            foreach (var rota in rotas.Take(2))
            {
                var pontos = rota.PontosCaminhados();
                var n = await _ocorrencias.ContarBoletinsDistintosAsync(
                    pontos, largura, inicio, fim, faixas, ct);
                var cobertura = await _ocorrencias.CoberturaCorredorAsync(
                    pontos, largura, inicio, fim, faixas, ct);
                cenarios.Add(new CenarioRota(
                    Identificador: $"R{cenarios.Count + 1}",
                    QuantidadeBoletins: n,
                    KmCaminhados: rota.KmCaminhados,
                    Cobertura: cobertura));
            }

            var avaliador = new AvaliadorComparacao();
            porLargura[largura] = avaliador.Avaliar(cenarios[0], cenarios[1]);
        }

        // 4. Estabilidade entre larguras (item 16): divergência → dados insuficientes.
        var resultado = EstabilidadeCorredor.Consolidar(porLargura);

        // 5. Auditoria SEM dados pessoais (item 23): nenhum coordenada/identificador gravado.
        _contexto.RegistrosConsulta.Add(new RegistroConsulta
        {
            DataHoraUtc = DateTime.UtcNow,
            StatusResultado = resultado.Status.ToString(),
            LargurasTestadasM = string.Join("/", EstabilidadeCorredor.LargurasPadraoM),
            QuantidadeRotas = Math.Min(2, rotas.Count),
            FaixaConsulta = faixas is { Count: 1 } ? faixas[0].ToString() : null,
        });
        await _contexto.SaveChangesAsync(ct);

        // 6. Resposta: sempre com o bloco "Sobre os dados" (item 15) e linguagem acordada.
        return Ok(new
        {
            status = resultado.Status.ToString(),
            rotaComMenorExposicaoEstimada = resultado.RotaDestacada,
            motivo = resultado.Motivo,
            pValor = resultado.PValor,
            exposicaoEstimadaBoletinsPorKm = resultado.ExposicaoEstimadaPorRota,
            largurasCorredorTestadasM = EstabilidadeCorridaLarguras(),
            periodoDados = new { inicio, fim },
            sobreOsDados = new[]
            {
                $"Dados públicos (SSP-SP/SPTrans) no período {inicio:dd/MM/yyyy} a {fim:dd/MM/yyyy}.",
                $"Cobertura de dados avaliada por rota; valores de N e D calculados só nos trechos caminhados.",
                resultado.Status == StatusComparacao.DadosInsuficientes
                    ? "Dados insuficientes: a comparação não é concluída — nunca há resposta silenciosa."
                    : "A menor exposição estimada não significa rota segura.",
            },
        });
    }

    private static string EstabilidadeCorridaLarguras() // nome claro para leitura do OpenAPI
        => string.Join("/", EstabilidadeCorredor.LargurasPadraoM);

    /// <summary>Corpo da requisição de comparação. Coordenadas são usadas apenas na memória da consulta.</summary>
    public sealed record RequisicaoComparacao(
        Coordenada Origem,
        Coordenada Destino,
        string? Sentido,
        DateOnly? Inicio,
        DateOnly? Fim,
        List<int>? Faixas);
}
