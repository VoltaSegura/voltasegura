namespace VoltaSegura.Domain.Servicos;

/// <summary>Cenário de uma rota com os insumos da regra de comparação (itens 11 e 12 do grupo).</summary>
/// <param name="Identificador">Rótulo interno da rota (ex.: "R1"). Nunca descreve segurança de territórios.</param>
/// <param name="QuantidadeBoletins">N = boletins distintos no corredor, no mesmo período.</param>
/// <param name="KmCaminhados">Só trechos caminhados entram na comparação (item 11).</param>
/// <param name="Cobertura">Cobertura de dados ao longo do corredor (0 a 1).</param>
public readonly record struct CenarioRota(
    string Identificador,
    int QuantidadeBoletins,
    double KmCaminhados,
    double Cobertura);

/// <summary>Status da comparação, conforme o item 11: nunca há "preferência" sem dados suficientes.</summary>
public enum StatusComparacao
{
    /// <summary>Dados suficientes e diferença estatisticamente relevante; a rota com N e D menores é destacada.</summary>
    Conclusiva = 1,

    /// <summary>Resultado divergente NÃO gera preferência (item 11): diferença não significativa, sem N e D menores na mesma rota, ou resultado que muda com a largura do corredor.</summary>
    Divergente = 2,

    /// <summary>Cobertura &lt; 80%, diferença &gt; 10 p.p., N_X + N_Y &lt; 10, ou resultado sensível à largura do corredor (item 16).</summary>
    DadosInsuficientes = 3,
}

/// <summary>Resultado do avaliador, já no vocabulário acordado: "exposição estimada", nunca "rota segura".</summary>
/// <param name="Status">Situação da comparação.</param>
/// <param name="RotaDestacada">Identificador da rota com menor exposição estimada, ou null se não houver destaque.</param>
/// <param name="Motivo">Frase curta e honesta para o bloco "Sobre os dados" (item 15).</param>
/// <param name="PValor">P-valor do teste binomial exato bilateral, quando calculado.</param>
/// <param name="ExposicaoEstimadaPorRota">D = N/km por rota (identificador → D).</param>
public readonly record struct ResultadoComparacao(
    StatusComparacao Status,
    string? RotaDestacada,
    string Motivo,
    double? PValor,
    IReadOnlyDictionary<string, double> ExposicaoEstimadaPorRota);

/// <summary>
/// Implementa a regra de comparação acordada (itens 11, 12 e 16 do grupo):
/// - Só trechos caminhados; N = boletins distintos no corredor, no mesmo período; D = N / km.
/// - Só destaca a menor exposição se as duas rotas tiverem dados suficientes e uma tiver N e D menores.
/// - Resultado divergente não gera preferência. Sem pesos arbitrários.
/// - Dados insuficientes: cobertura &lt; 80%, diferença &gt; 10 p.p., N_X + N_Y &lt; 10.
/// </summary>
public class AvaliadorComparacao
{
    public const double CoberturaMinima = 0.80;
    public const double DiferencaCoberturaMaxima = 0.10; // 10 p.p.
    public const int AmostraMinima = 10;                 // N_X + N_Y >= 10
    public const double NivelSignificancia = 0.05;       // teste bilateral a 5%

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
            return Insuficiente(exposicao, "cobertura de dados abaixo de 80% em alguma das rotas");

        if (Math.Abs(rotaX.Cobertura - rotaY.Cobertura) > DiferencaCoberturaMaxima)
            return Insuficiente(exposicao, "diferença de cobertura entre as rotas acima de 10 p.p.");

        var total = rotaX.QuantidadeBoletins + rotaY.QuantidadeBoletins;
        if (total < AmostraMinima)
            return Insuficiente(exposicao, $"amostra insuficiente: N_X + N_Y = {total} (mínimo 10)");

        // Teste binomial exato bilateral: dado o total de BOs, a probabilidade nula de
        // cair no corredor de X é proporcional ao km caminhado de X (item 12).
        var p0 = rotaX.KmCaminhados / (rotaX.KmCaminhados + rotaY.KmCaminhados);
        var pValor = TesteBinomialExato.PValorBilateral(rotaX.QuantidadeBoletins, total, p0);

        if (pValor > NivelSignificancia)
            return Divergente(exposicao, pValor,
                "diferença entre as rotas não é estatisticamente relevante — nenhuma preferência é gerada");

        // Item 11: destaca a menor exposição somente se a MESMA rota tiver N e D menores.
        var xTemMenosBoletins = rotaX.QuantidadeBoletins < rotaY.QuantidadeBoletins;
        var xTemMenorD = exposicao[rotaX.Identificador] < exposicao[rotaY.Identificador];

        if (xTemMenosBoletins && xTemMenorD)
            return Conclusiva(rotaX.Identificador, exposicao, pValor);
        if (!xTemMenosBoletins && !xTemMenorD && rotaX.QuantidadeBoletins != rotaY.QuantidadeBoletins)
            return Conclusiva(rotaY.Identificador, exposicao, pValor);

        return Divergente(exposicao, pValor,
            "diferença relevante, porém nenhuma rota tem simultaneamente menos boletins e menor exposição estimada");
    }

    /// <summary>D = N / km caminhados (item 11). Valor bruto para leitura relativa — sem rótulo territorial.</summary>
    public static double ExposicaoEstimada(CenarioRota rota)
        => rota.KmCaminhados <= 0 ? 0.0 : rota.QuantidadeBoletins / rota.KmCaminhados;

    private static ResultadoComparacao Conclusiva(
        string rota, IReadOnlyDictionary<string, double> exposicao, double pValor)
        => new(StatusComparacao.Conclusiva, rota,
            $"dados suficientes; menor exposição estimada na {rota} (teste binomial exato a 5%)",
            pValor, exposicao);

    private static ResultadoComparacao Divergente(
        IReadOnlyDictionary<string, double> exposicao, double pValor, string motivo)
        => new(StatusComparacao.Divergente, null, motivo, pValor, exposicao);

    private static ResultadoComparacao Insuficiente(
        IReadOnlyDictionary<string, double> exposicao, string motivo)
        => new(StatusComparacao.DadosInsuficientes, null, motivo, null, exposicao);
}
