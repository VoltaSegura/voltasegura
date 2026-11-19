using System.Globalization;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VoltaSegura.Domain.Entidades;
using VoltaSegura.Domain.Interfaces;
using VoltaSegura.Domain.Servicos;
using VoltaSegura.Infrastructure.Dados;

namespace VoltaSegura.Servicos.Controllers;

/// <summary>Orquestra roteamento, consulta ao acervo, comparação conservadora e auditoria sem localização.</summary>
[ApiController]
[Route("api/comparacoes")]
public class ComparacoesController : ControllerBase
{
    private readonly IRoteador _roteador;
    private readonly IOcorrenciaRepositorio _ocorrencias;
    private readonly VoltaSeguraDbContext _contexto;
    public ComparacoesController(IRoteador roteador, IOcorrenciaRepositorio ocorrencias, VoltaSeguraDbContext contexto)
        => (_roteador, _ocorrencias, _contexto) = (roteador, ocorrencias, contexto);

    /// <summary>Compara até cinco alternativas no horário solicitado. Rotas e acervo de exemplo são identificados.</summary>
    /// <remarks>Saída exige fuso. Início/fim delimitam o histórico, não o horário da viagem. Uma única rota é devolvida sem comparação.</remarks>
    [HttpPost("trajetos")]
    [ProducesResponseType(typeof(RespostaComparacao), 200)]
    [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
    [ProducesResponseType(typeof(ProblemDetails), 503)]
    [ProducesResponseType(typeof(ProblemDetails), 504)]
    public async Task<ActionResult<RespostaComparacao>> CompararTrajetos(
        [FromBody] RequisicaoComparacao requisicao, CancellationToken ct)
    {
        var acervo = await _contexto.Acervos.AsNoTracking().FirstOrDefaultAsync(ct);
        var inicio = requisicao.Inicio ?? acervo?.Inicio ?? new DateOnly(2026, 1, 1);
        var fim = requisicao.Fim ?? acervo?.Fim ?? new DateOnly(2026, 9, 30);
        if (inicio > fim || (acervo != null && (inicio < acervo.Inicio || fim > acervo.Fim)))
        {
            ModelState.AddModelError("periodo", "Informe um período dentro da janela do acervo, com início anterior ao fim.");
            return ValidationProblem(ModelState);
        }
        var saida = DateTimeOffset.Parse(requisicao.Saida!, CultureInfo.InvariantCulture);
        IReadOnlyList<Trajeto> rotas;
        try
        {
            rotas = (await _roteador.PlanejarAsync(requisicao.Origem!.Value, requisicao.Destino!.Value,
                requisicao.Sentido ?? "ida", saida, ct)).Take(5).ToList();
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        { return Problem(statusCode: 504, title: "O serviço de roteamento demorou para responder."); }
        catch (ArgumentException)
        { return Problem(statusCode: 400, title: "Consulta fora da área atendida pelo roteador."); }
        catch (Exception e) when (e is HttpRequestException or InvalidDataException or JsonException)
        { return Problem(statusCode: 503, title: "Roteamento indisponível. Tente novamente mais tarde."); }

        var cenarios = new Dictionary<double, IReadOnlyList<CenarioRota>>();
        foreach (var largura in EstabilidadeCorredor.LargurasPadraoM)
        {
            var lista = new List<CenarioRota>();
            for (var i = 0; i < rotas.Count; i++)
            {
                var caminhadas = rotas[i].Caminhadas();
                // Falta de horário/geometria não vira cobertura positiva.
                var incompleta = caminhadas.Any(c => c.Faixa == null || c.Pontos.Count < 2);
                var n = incompleta ? 0 : await _ocorrencias.ContarBoletinsDistintosAsync(caminhadas, largura, inicio, fim, ct);
                var cobertura = incompleta ? 0 : await _ocorrencias.CoberturaCorredorAsync(caminhadas, largura, inicio, fim, ct);
                lista.Add(new($"R{i + 1}", n, rotas[i].KmCaminhados, cobertura));
            }
            cenarios[largura] = lista;
        }
        var resultado = ComparadorAlternativas.Avaliar(cenarios);
        var padrao = cenarios[100];
        _contexto.RegistrosConsulta.Add(new RegistroConsulta
        {
            DataHoraUtc = DateTime.UtcNow, StatusResultado = resultado.Status.ToString(),
            LargurasTestadasM = "50/100/150", QuantidadeRotas = rotas.Count,
            FaixaConsulta = PeriodoLocal.Faixa(saida).ToString()
        });
        await _contexto.SaveChangesAsync(ct);
        var fontes = new FonteResposta(_roteador.Fonte, acervo?.Tipo ?? "nao_informado",
            acervo?.Fonte ?? "Acervo não carregado ou sem proveniência registrada",
            _roteador.Fonte == "mock" || acervo?.Tipo == "demonstracao");
        var descricaoRotas = rotas.Select((r, i) => new RotaResposta($"R{i + 1}", r.DuracaoMin,
            r.KmCaminhados, r.Baldeacoes, r.SaidaPrevista, r.ChegadaPrevista,
            r.Trechos.Select(t => new TrechoResposta(t.Ordem, t.Modo, t.ComprimentoKm,
                t.PartidaPrevista, t.ChegadaPrevista, t.Modo == "WALK" && t.PartidaPrevista.HasValue
                    ? PeriodoLocal.Faixa(t.PartidaPrevista.Value) : null, t.Linha, t.Pontos())).ToList())).ToList();
        var situacao = rotas.Count == 0 ? "Nenhuma alternativa encontrada para a consulta."
            : rotas.Count == 1 ? "Uma alternativa disponível; sem comparação de exposição estimada." : resultado.Motivo;
        return Ok(new RespostaComparacao(resultado.Status.ToString(), situacao, resultado.RotaDestacada,
            resultado.PValor, padrao.ToDictionary(c => c.Identificador, c => c.QuantidadeBoletins),
            padrao.ToDictionary(c => c.Identificador, c => c.KmCaminhados),
            padrao.ToDictionary(c => c.Identificador, c => c.Cobertura), resultado.ExposicaoEstimadaPorRota,
            EstabilidadeCorredor.LargurasPadraoM, new(inicio, fim), fontes, descricaoRotas, new[]
            {
                fontes.Descricao,
                fontes.Exemplo ? "Demonstração: rotas e/ou registros sintéticos. Não representa uma comparação real de trajetos." : "Metodologia inicial, ainda não validada em trajetos reais.",
                "N = boletins distintos; L = km caminhados; D = N/L. Sem caminhada, D é não aplicável (null).",
                "Cobertura estimada por circunscrições inferidas dos registros próximos, sem polígonos oficiais.",
                "Subnotificação: zero registro não significa ausência de ocorrência. Coordenadas podem ser pontos de referência.",
                "Todos os tipos de local entram; só FURTO - OUTROS e ROUBO - OUTROS compõem a comparação.",
                "Horários programados do transporte podem não refletir mudanças recentes de operação.",
                "Exposição estimada não é probabilidade individual nem garantia de segurança."
            }));
    }
}
