using VoltaSegura.Domain.Entidades;
using VoltaSegura.Domain.Interfaces;
using VoltaSegura.Infrastructure.Repositorios;

namespace VoltaSegura.Infrastructure.Roteamento;

/// <summary>
/// Roteador MOCK, determinístico, para desenvolvimento e demonstração enquanto o
/// OTP2 não está ativo em servidor próprio (item 22 das decisões — EM ABERTO).
/// NÃO representa dados reais de transporte: gera geometrias sintéticas entre
/// origem e destino. A regra de comparação do domínio continua valendo — com banco
/// vazio, qualquer comparação retorna "dados insuficientes", nunca silêncio.
/// </summary>
public class RoteadorMock : IRoteador
{
    private const int PontosPorTrecho = 12;

    public Task<IReadOnlyList<Trajeto>> PlanejarAsync(
        Coordenada origem, Coordenada destino, string sentido, CancellationToken ct)
    {
        var distanciaKm = Geografia.HaversineMetros(origem, destino) / 1000.0;

        // Duas alternativas determinísticas: (A) mais caminhada, (B) mais transporte.
        var a = MontarTrajeto(sentido, "A", new[]
        {
            (Modo: "WALK", Fator: 0.45),
            (Modo: "BUS", Fator: 0.55),
        }, origem, destino, distanciaKm);

        var b = MontarTrajeto(sentido, "B", new[]
        {
            (Modo: "WALK", Fator: 0.15),
            (Modo: "BUS", Fator: 0.65),
            (Modo: "WALK", Fator: 0.20),
        }, origem, destino, distanciaKm * 1.1); // alternativa ligeiramente mais longa

        IReadOnlyList<Trajeto> trajetos = new[] { a, b };
        return Task.FromResult(trajetos);
    }

    private static Trajeto MontarTrajeto(
        string sentido, string sufixo, (string Modo, double Fator)[] composicao,
        Coordenada origem, Coordenada destino, double distanciaTotalKm)
    {
        var trechos = new List<Trecho>();
        var progresso = 0.0;
        for (var i = 0; i < composicao.Length; i++)
        {
            var (modo, fator) = composicao[i];
            var km = distanciaTotalKm * fator;
            var pontos = Interpolar(origem, destino, progresso, progresso + fator);
            progresso += fator;
            trechos.Add(Trecho.Criar(i, modo, km, pontos));
        }

        return new Trajeto
        {
            NomeOrigem = $"origem-{sufixo}",
            NomeDestino = "destino",
            Sentido = sentido,
            Trechos = trechos,
        };
    }

    /// <summary>Interpolação linear entre origem e destino, na fatia [de, ate] do percurso.</summary>
    private static IReadOnlyList<Coordenada> Interpolar(
        Coordenada origem, Coordenada destino, double de, double ate)
    {
        var pontos = new List<Coordenada>();
        for (var i = 0; i < PontosPorTrecho; i++)
        {
            var t = de + (ate - de) * i / (PontosPorTrecho - 1);
            pontos.Add(new Coordenada(
                origem.Latitude + (destino.Latitude - origem.Latitude) * t,
                origem.Longitude + (destino.Longitude - origem.Longitude) * t));
        }

        return pontos;
    }
}
