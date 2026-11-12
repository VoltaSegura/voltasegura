namespace VoltaSegura.Domain.Servicos;

/// <summary>Cenário de uma rota com os insumos da regra de comparação (docs/08 §§28–32).</summary>
/// <param name="Identificador">Rótulo interno da rota (ex.: "R1"). Nunca descreve segurança de territórios.</param>
/// <param name="QuantidadeBoletins">N = boletins distintos no corredor, no mesmo período.</param>
/// <param name="KmCaminhados">Só trechos caminhados entram na comparação (docs/08 §29).</param>
/// <param name="Cobertura">Fração de boletins elegíveis com coordenada e faixa informadas nas circunscrições atravessadas (docs/08 §64).</param>
public readonly record struct CenarioRota(
    string Identificador,
    int QuantidadeBoletins,
    double KmCaminhados,
    double Cobertura);

/// <summary>Status da comparação, com as frases fixas do bloco "Sobre os dados" (docs/08 §§99–102).</summary>
public enum StatusComparacao
{
    /// <summary>"Dados suficientes para comparar"; a rota destacada (se houver) tem N e D menores, p &lt; 0,05 e estabilidade nas três larguras.</summary>
    Conclusiva = 1,

    /// <summary>"Sem diferença clara entre os registros": p ≥ 0,05 ou nenhuma rota com N e D menores na mesma direção.</summary>
    Divergente = 2,

    /// <summary>"Dados insuficientes": cobertura, amostra, ou resultado que muda com a largura do corredor (docs/08 §102).</summary>
    DadosInsuficientes = 3,
}

/// <summary>Resultado do avaliador, já no vocabulário acordado: "exposição estimada", nunca "rota segura".</summary>
/// <param name="Status">Situação da comparação, com frase fixa em <see cref="ResultadoComparacao.Motivo"/>.</param>
/// <param name="RotaDestacada">Identificador da rota com menor exposição estimada, ou null se não houver destaque.</param>
/// <param name="Motivo">Frase fixa da situação (docs/08 §§99–102), com o motivo quando dados insuficientes.</param>
/// <param name="PValor">P-valor do teste binomial exato bilateral, quando calculado.</param>
/// <param name="ExposicaoEstimadaPorRota">D = N/km por rota (identificador → D).</param>
public readonly record struct ResultadoComparacao(
    StatusComparacao Status,
    string? RotaDestacada,
    string Motivo,
    double? PValor,
    IReadOnlyDictionary<string, double> ExposicaoEstimadaPorRota);

/// <summary>
/// Implementa a regra de comparação do grupo (docs/08 — decisões de 11/11/2026):
/// - Só trechos caminhados; N = boletins distintos no corredor, no mesmo período; D = N / km.
/// - Só destaca a menor exposição se p &lt; 0,05 E a mesma rota tiver N e D menores
///   (a estabilidade nas três larguras de corredor é exigida pelo consolidador).
/// - Sem pesos arbitrários; o app não escolhe a rota pelo usuário.
/// - Dados insuficientes (docs/08 §102): cobertura abaixo de 80% ou diferença acima de
///   10 p.p.; menos de 10 registros no total; ou resultado que muda com a largura.
/// </summary>
public class AvaliadorComparacao
{
    public const double CoberturaMinima = 0.80;
    public const double DiferencaCoberturaMaxima = 0.10; // 10 p.p.
    public const int AmostraMinima = 10;                 // N_X + N_Y >= 10
    public const double NivelSignificancia = 0.05;       // teste bilateral a 5%

    /// <summary>Frase fixa da situação "Dados suficientes para comparar" (docs/08 §100).</summary>
    public const string FraseDadosSuficientes = "Dados suficientes para comparar";

    /// <summary>Frase fixa da situação "Sem diferença clara entre os registros" (docs/08 §101).</summary>
    public const string FraseSemDiferencaClara = "Sem diferença clara entre os registros";

    /// <summary>Prefixo fixo da situação "Dados insuficientes", sempre com o motivo (docs/08 §102).</summary>
    public const string FraseDadosInsuficientes = "Dados insuficientes";

    public ResultadoComparacao Avaliar(CenarioRota rotaX, CenarioRota rotaY)
    {
        var exposicao = new Dictionary<string, double>
        {
            [rotaX.Identificador] = ExposicaoEstimada(rotaX),
            [rotaY.Identificador] = ExposicaoEstimada(rotaY),
        };

        if (rotaX.KmCaminhados <= 0 || rotaY.KmCaminhados <= 0)
            return Insuficiente(exposicao, "sem trecho caminhado em alguma das rotas");

        if (rotaX.Cobertura < CoberturaMinima || rotaY.Cobertura < CoberturaMinima)
            return Insuficiente(exposicao,
                "cobertura de dados abaixo de 80% nas circunscrições atravessadas por alguma das rotas");

        if (Math.Abs(rotaX.Cobertura - rotaY.Cobertura) > DiferencaCoberturaMaxima)
            return Insuficiente(exposicao,
                "diferença de cobertura acima de 10 p.p. entre as circunscrições atravessadas pelas rotas");

        var total = rotaX.QuantidadeBoletins + rotaY.QuantidadeBoletins;
        if (total < AmostraMinima)
            return Insuficiente(exposicao, $"menos de 10 registros no total (N_X + N_Y = {total})");

        // Teste binomial exato bilateral (docs/08 §66): dado o total de BOs, a probabilidade
        // nula de cair no corredor de X é proporcional ao km caminhado de X.
        var p0 = rotaX.KmCaminhados / (rotaX.KmCaminhados + rotaY.KmCaminhados);
        var pValor = TesteBinomialExato.PValorBilateral(rotaX.QuantidadeBoletins, total, p0);

        if (pValor > NivelSignificancia)
            return Divergente(exposicao, pValor);

        // docs/08 §49: destaca somente se a MESMA rota tiver N e D menores.
        var xTemMenosBoletins = rotaX.QuantidadeBoletins < rotaY.QuantidadeBoletins;
        var xTemMenorD = exposicao[rotaX.Identificador] < exposicao[rotaY.Identificador];

        if (xTemMenosBoletins && xTemMenorD)
            return Conclusiva(rotaX.Identificador, exposicao, pValor);
        if (!xTemMenosBoletins && !xTemMenorD && rotaX.QuantidadeBoletins != rotaY.QuantidadeBoletins)
            return Conclusiva(rotaY.Identificador, exposicao, pValor);

        return Divergente(exposicao, pValor);
    }

    /// <summary>D = N / km caminhados (docs/08 §30). Valor descritivo — sem rótulo territorial.</summary>
    public static double ExposicaoEstimada(CenarioRota rota)
        => rota.KmCaminhados <= 0 ? 0.0 : rota.QuantidadeBoletins / rota.KmCaminhados;

    private static ResultadoComparacao Conclusiva(
        string rota, IReadOnlyDictionary<string, double> exposicao, double pValor)
        => new(StatusComparacao.Conclusiva, rota,
            $"{FraseDadosSuficientes}; menor exposição estimada entre as alternativas avaliadas na {rota}",
            pValor, exposicao);

    private static ResultadoComparacao Divergente(
        IReadOnlyDictionary<string, double> exposicao, double pValor)
        => new(StatusComparacao.Divergente, null, FraseSemDiferencaClara, pValor, exposicao);

    private static ResultadoComparacao Insuficiente(
        IReadOnlyDictionary<string, double> exposicao, string motivo)
        => new(StatusComparacao.DadosInsuficientes, null, $"{FraseDadosInsuficientes} — {motivo}", null, exposicao);
}
