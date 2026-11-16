-- =====================================================================================
-- VoltaSegura · B-06 · 003_exposicao.sql
-- Função de EXPOSIÇÃO ESTIMADA (comparação de trajetos a pé, docs/08) em PostgreSQL+PostGIS.
--
-- AVISO: este arquivo NÃO foi executado (não há Postgres/PostGIS nesta máquina). Aplicar
-- e conferir na branch `dev` do Neon, depois rodar 004_testes.sql. Requer 001 e 002.
--
-- Linguagem (docs/05, prioridade máxima): o resultado é "exposição estimada" comparativa
-- entre as alternativas avaliadas. Não é classificação de trechos, não é probabilidade de vitimização, não
-- rotula território. Zero registro não é vantagem: sem amostra, sem cobertura ou sem trecho
-- a pé, nenhuma rota é destacada.
--
-- Funções (as de mobile_dados são internas; só a de mobile_api é chamável pelo app):
--   mobile_dados.binomial_bilateral(k, n, p)   teste binomial exato bilateral ('minlike')
--   mobile_dados.vencedor_raio(...)            N e D apontam a mesma rota?
--   mobile_dados.decidir_par(...)              resultado de um par X × Y
--   mobile_dados.decidir_exposicao(...)        caso da consulta para 1..5 rotas
--   mobile_dados.categorias_json(...)          bloco "categorias" do contrato
--   mobile_dados.medir_rotas(...)              parte espacial: N50/N100/N150, cobertura, categorias
--   mobile_api.comparar_exposicao(jsonb, text) entrada/saída JSON (contrato do app)
--
-- A implementação de referência em Python (referencia_exposicao.py) espelha a decisão e o
-- teste binomial; os mesmos casos estão em test_referencia_exposicao.py e 004_testes.sql.
-- =====================================================================================

SET client_encoding = 'UTF8';

-- -------------------------------------------------------------------------------------
-- (a) Teste binomial exato bilateral, método 'minlike' (o mesmo de scipy.stats.binomtest):
--     p = soma de pmf(i), i = 0..n, para todo i com pmf(i) <= pmf(k) * (1 + 1e-7),
--     limitado a 1. Em logaritmo: ln C(n,i) = ln n! - ln i! - ln (n-i)!, com ln de
--     fatoriais por soma acumulada de ln (sem lgamma, que não existe em todas as versões).
--     Termos com ln(pmf) <= -700 (~1e-304) são ignorados: no PostgreSQL exp() de valor
--     muito negativo dá erro de underflow, e esses termos não mudam a decisão em alfa=0,05.
-- -------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION mobile_dados.binomial_bilateral(k integer, n integer, p double precision)
RETURNS double precision
LANGUAGE plpgsql
IMMUTABLE STRICT
SET search_path = mobile_dados, public, pg_temp
AS $$
DECLARE
    c_tolerancia_rel  CONSTANT double precision := 1e-7;
    c_ln_minimo_termo CONSTANT double precision := -700;
    v_ln_fat  double precision[];   -- v_ln_fat[i + 1] = ln(i!)
    v_ln_p    double precision;
    v_ln_q    double precision;
    v_limite  double precision;
    v_lpmf    double precision;
    v_soma    double precision := 0;
BEGIN
    -- No PostgreSQL, NaN = NaN é verdadeiro e NaN > 1 também; a comparação explícita
    -- deixa a intenção clara.
    IF n < 0 OR k < 0 OR k > n OR p < 0 OR p > 1 OR p = 'NaN'::double precision THEN
        RAISE EXCEPTION 'binomial_bilateral: parâmetros fora do domínio' USING ERRCODE = '22023';
    END IF;
    IF n = 0 THEN
        RETURN 1;
    END IF;
    -- Casos degenerados (não ocorrem na regra, pois L_X > 0 e L_Y > 0).
    IF p = 0 THEN
        RETURN CASE WHEN k = 0 THEN 1 ELSE 0 END;
    END IF;
    IF p = 1 THEN
        RETURN CASE WHEN k = n THEN 1 ELSE 0 END;
    END IF;

    v_ln_fat := array_fill(0::double precision, ARRAY[n + 1]);
    FOR i IN 1 .. n LOOP
        v_ln_fat[i + 1] := v_ln_fat[i] + ln(i::double precision);
    END LOOP;
    v_ln_p := ln(p);
    v_ln_q := ln(1 - p);

    v_limite := v_ln_fat[n + 1] - v_ln_fat[k + 1] - v_ln_fat[n - k + 1]
                + k * v_ln_p + (n - k) * v_ln_q
                + ln(1 + c_tolerancia_rel);

    FOR i IN 0 .. n LOOP
        v_lpmf := v_ln_fat[n + 1] - v_ln_fat[i + 1] - v_ln_fat[n - i + 1]
                  + i * v_ln_p + (n - i) * v_ln_q;
        IF v_lpmf <= v_limite AND v_lpmf > c_ln_minimo_termo THEN
            v_soma := v_soma + exp(v_lpmf);
        END IF;
    END LOOP;

    RETURN LEAST(v_soma, 1.0);
END;
$$;

-- -------------------------------------------------------------------------------------
-- N e D apontam a mesma rota? 1 = X (N_X < N_Y e D_X < D_Y), 2 = Y (simétrico),
-- 0 = nenhuma (divergem ou empatam). Exige L > 0 nas duas.
-- -------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION mobile_dados.vencedor_raio(
    p_nx integer, p_ny integer, p_lx double precision, p_ly double precision)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE STRICT
SET search_path = mobile_dados, public, pg_temp
AS $$
BEGIN
    IF p_lx <= 0 OR p_ly <= 0 THEN
        RAISE EXCEPTION 'vencedor_raio: L deve ser > 0' USING ERRCODE = '22023';
    END IF;
    IF p_nx < p_ny AND p_nx / p_lx < p_ny / p_ly THEN
        RETURN 1;
    ELSIF p_ny < p_nx AND p_ny / p_ly < p_nx / p_lx THEN
        RETURN 2;
    END IF;
    RETURN 0;
END;
$$;

-- -------------------------------------------------------------------------------------
-- Resultado de um par X × Y (ambas com L > 0): 'COBERTURA' | 'AMOSTRA' | 'MISTOS' |
-- 'SEM_DIFERENCA' | 'LARGURA' | 'X' | 'Y'.
--
-- Parâmetros [DECISÃO] de docs/08 (11/11/2026): cobertura >= 80% em cada rota e diferença
-- <= 10 p.p.; N_X + N_Y >= 10; teste binomial bilateral com p < 0,05; sensibilidade nos
-- corredores de ±50 e ±150 m. A tolerância c_eps (1e-9) é decisão técnica deste pacote,
-- só para comparar coberturas em ponto flutuante (0,93 - 0,83 = 0,10000000000000009).
--
-- [HIPÓTESE] Ordem de precedência DENTRO do par (docs/08 não fixa; confirmar com o grupo):
--   1. cobertura NULL, < 0,80 em alguma, ou diferença > 0,10      -> COBERTURA
--   2. raio 100: N_X + N_Y < 10                                   -> AMOSTRA
--   3. raio 100: N e D não apontam a mesma rota (inclui empate)   -> MISTOS
--   4. apontam a mesma, mas p >= 0,05                             -> SEM_DIFERENCA
--   5. p < 0,05 no 100, mas no 50 ou no 150: n < 10, p >= 0,05,
--      N e D divergentes ou outro vencedor                        -> LARGURA
--   6. vale nos três raios                                        -> X ou Y
-- p0 = L_X / (L_X + L_Y): sob igualdade de taxas por km, N_X ~ Binomial(N_X + N_Y, p0).
-- -------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION mobile_dados.decidir_par(
    p_nx50 integer, p_nx100 integer, p_nx150 integer, p_lx double precision, p_cx double precision,
    p_ny50 integer, p_ny100 integer, p_ny150 integer, p_ly double precision, p_cy double precision)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = mobile_dados, public, pg_temp
AS $$
DECLARE
    c_cobertura_minima          CONSTANT double precision := 0.80;
    c_diferenca_cobertura_max   CONSTANT double precision := 0.10;
    c_amostra_minima            CONSTANT integer := 10;
    c_alfa                      CONSTANT double precision := 0.05;
    c_eps                       CONSTANT double precision := 1e-9;
    v_vencedor  integer;
    v_p0        double precision;
    v_nx        integer;
    v_ny        integer;
BEGIN
    IF p_lx IS NULL OR p_ly IS NULL OR p_lx <= 0 OR p_ly <= 0
       OR p_nx50 IS NULL OR p_nx100 IS NULL OR p_nx150 IS NULL
       OR p_ny50 IS NULL OR p_ny100 IS NULL OR p_ny150 IS NULL THEN
        RAISE EXCEPTION 'decidir_par: exige N não nulo e L > 0 nas duas rotas' USING ERRCODE = '22023';
    END IF;

    -- 1. Cobertura
    IF p_cx IS NULL OR p_cy IS NULL
       OR p_cx < c_cobertura_minima - c_eps OR p_cy < c_cobertura_minima - c_eps
       OR abs(p_cx - p_cy) > c_diferenca_cobertura_max + c_eps THEN
        RETURN 'COBERTURA';
    END IF;

    -- 2. Amostra (raio padrão de 100 m)
    IF p_nx100 + p_ny100 < c_amostra_minima THEN
        RETURN 'AMOSTRA';
    END IF;

    -- 3. N e D concordam?
    v_vencedor := mobile_dados.vencedor_raio(p_nx100, p_ny100, p_lx, p_ly);
    IF v_vencedor = 0 THEN
        RETURN 'MISTOS';
    END IF;

    -- 4. Diferença compatível com o acaso?
    v_p0 := p_lx / (p_lx + p_ly);
    IF mobile_dados.binomial_bilateral(p_nx100, p_nx100 + p_ny100, v_p0) >= c_alfa THEN
        RETURN 'SEM_DIFERENCA';
    END IF;

    -- 5. Sensibilidade à largura do corredor (±50 m e ±150 m)
    FOR r IN 1 .. 2 LOOP
        IF r = 1 THEN v_nx := p_nx50;  v_ny := p_ny50;
        ELSE          v_nx := p_nx150; v_ny := p_ny150;
        END IF;
        IF v_nx + v_ny < c_amostra_minima
           OR mobile_dados.vencedor_raio(v_nx, v_ny, p_lx, p_ly) <> v_vencedor
           OR mobile_dados.binomial_bilateral(v_nx, v_nx + v_ny, v_p0) >= c_alfa THEN
            RETURN 'LARGURA';
        END IF;
    END LOOP;

    -- 6. Vale nos três raios
    RETURN CASE v_vencedor WHEN 1 THEN 'X' ELSE 'Y' END;
END;
$$;

-- -------------------------------------------------------------------------------------
-- Caso da consulta para 1..5 rotas (arrays alinhados, índice 1 = primeira rota).
-- vencedor = índice (base 1) da rota de menor exposição estimada; só em CONCLUSIVO.
--
--   1 rota                 -> SEM_COMPARACAO
--   alguma rota com L = 0  -> NAO_APLICAVEL (nenhum destaque; docs/08, D-12)
--   pares (decidir_par) e agregação.
-- [HIPÓTESE] Precedência da agregação (confirmar com o grupo):
--   NAO_APLICAVEL > CONCLUSIVO (uma rota vence TODOS os seus pares; pares entre as demais
--   não retiram o destaque) > INSUFICIENTE (motivo COBERTURA > AMOSTRA > LARGURA) >
--   MISTOS > SEM_DIFERENCA.
-- -------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION mobile_dados.decidir_exposicao(
    p_n50 integer[], p_n100 integer[], p_n150 integer[],
    p_l double precision[], p_cobertura double precision[],
    OUT caso text, OUT motivo text, OUT vencedor integer)
LANGUAGE plpgsql
IMMUTABLE
SET search_path = mobile_dados, public, pg_temp
AS $$
DECLARE
    v_k         integer := coalesce(cardinality(p_l), 0);
    v_vitorias  integer[];
    v_outros    text[] := ARRAY[]::text[];
    v_res       text;
BEGIN
    IF v_k < 1
       OR coalesce(cardinality(p_n50), 0) <> v_k OR coalesce(cardinality(p_n100), 0) <> v_k
       OR coalesce(cardinality(p_n150), 0) <> v_k OR coalesce(cardinality(p_cobertura), 0) <> v_k
       OR array_position(p_l, NULL) IS NOT NULL THEN
        RAISE EXCEPTION 'decidir_exposicao: arrays vazios, desalinhados ou com L nulo' USING ERRCODE = '22023';
    END IF;

    caso := NULL; motivo := NULL; vencedor := NULL;

    IF v_k = 1 THEN
        caso := 'SEM_COMPARACAO';
        RETURN;
    END IF;

    FOR i IN 1 .. v_k LOOP
        IF p_l[i] <= 0 THEN
            caso := 'NAO_APLICAVEL';
            RETURN;
        END IF;
    END LOOP;

    v_vitorias := array_fill(0, ARRAY[v_k]);
    FOR i IN 1 .. v_k - 1 LOOP
        FOR j IN i + 1 .. v_k LOOP
            v_res := mobile_dados.decidir_par(
                p_n50[i], p_n100[i], p_n150[i], p_l[i], p_cobertura[i],
                p_n50[j], p_n100[j], p_n150[j], p_l[j], p_cobertura[j]);
            IF v_res = 'X' THEN
                v_vitorias[i] := v_vitorias[i] + 1;
            ELSIF v_res = 'Y' THEN
                v_vitorias[j] := v_vitorias[j] + 1;
            ELSE
                v_outros := array_append(v_outros, v_res);
            END IF;
        END LOOP;
    END LOOP;

    FOR i IN 1 .. v_k LOOP
        IF v_vitorias[i] = v_k - 1 THEN
            caso := 'CONCLUSIVO';
            vencedor := i;
            RETURN;
        END IF;
    END LOOP;

    IF 'COBERTURA' = ANY (v_outros) THEN
        caso := 'INSUFICIENTE'; motivo := 'COBERTURA';
    ELSIF 'AMOSTRA' = ANY (v_outros) THEN
        caso := 'INSUFICIENTE'; motivo := 'AMOSTRA';
    ELSIF 'LARGURA' = ANY (v_outros) THEN
        caso := 'INSUFICIENTE'; motivo := 'LARGURA';
    ELSIF 'MISTOS' = ANY (v_outros) THEN
        caso := 'MISTOS';
    ELSE
        caso := 'SEM_DIFERENCA';
    END IF;
END;
$$;

-- -------------------------------------------------------------------------------------
-- Bloco "categorias" do contrato (tipos.ts: CategoriasRota). Totais = soma das parcelas.
-- Qualquer parcela NULL -> totais NULL (desconhecido, nunca zero).
-- Categorias são CONTEXTO: não entram na decisão (docs/07).
-- [EM ABERTO] Limiar de supressão de contagens pequenas (risco de identificação, docs/07 e
-- docs/dados-reais/03 §8 item 6): NÃO implementado e NÃO inventado aqui. Até haver decisão,
-- estas parcelas saem sem supressão; revisar antes de publicar com dados reais.
-- -------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION mobile_dados.categorias_json(
    p_furto_outros integer, p_furto_carga integer, p_furto_veiculo integer,
    p_roubo_outros integer, p_roubo_carga integer, p_roubo_veiculo integer, p_latrocinio integer,
    p_transito integer)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = mobile_dados, public, pg_temp
AS $$
    SELECT jsonb_build_object(
        'furto', jsonb_build_object(
            'total',   p_furto_outros + p_furto_carga + p_furto_veiculo,
            'outros',  p_furto_outros,
            'carga',   p_furto_carga,
            'veiculo', p_furto_veiculo),
        'roubo', jsonb_build_object(
            'total',      p_roubo_outros + p_roubo_carga + p_roubo_veiculo + p_latrocinio,
            'outros',     p_roubo_outros,
            'carga',      p_roubo_carga,
            'veiculo',    p_roubo_veiculo,
            'latrocinio', p_latrocinio),
        'transito', jsonb_build_object('total', p_transito))
$$;

-- -------------------------------------------------------------------------------------
-- Parte espacial. Recebe os trechos a pé já validados em arrays alinhados
-- (p_trecho_rota[i] = índice 1..p_n_rotas da rota do trecho i). Não grava nada.
--
-- N (por rota e raio 50/100/150 m): COUNT(DISTINCT chave_bo) de 'FURTO - OUTROS' e
--   'ROUBO - OUTROS', geom não nula, faixa do BO = faixa do trecho, data no período, dentro
--   da UNIÃO dos corredores dos trechos a pé da rota. Corredor = ST_Buffer em GEOGRAPHY
--   (raio em metros, nunca em graus). Cada BO conta uma vez por rota; o mesmo BO pode
--   contar em duas rotas.
-- Categorias: só no corredor de ±100 m, mesmo recorte (faixa e período), COUNT DISTINCT
--   por natureza.
-- Cobertura (independe do raio): circunscrições atravessadas pelos trechos a pé, cada uma
--   uma vez por rota; cobertura = soma(elegiveis_coord_faixa) / soma(elegiveis_total).
--   'poligono'     : ST_Intersects(trecho, circunscricao_area). Tabela vazia -> NULL.
--   'proxy_pontos' : [HIPÓTESE, aguarda decisão do Lucas] circunscrições dos pontos de
--                    ssp_bo (qualquer natureza, qualquer faixa/data da importação) dentro do
--                    corredor de 100 m da rota.
--   Decisão técnica deste pacote: se alguma circunscrição atravessada não tiver linha em
--   ssp_cobertura, ou se a soma dos totais for 0, a cobertura é NULL (desconhecida), e não
--   uma média parcial.
-- -------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION mobile_dados.medir_rotas(
    p_n_rotas         integer,
    p_trecho_rota     integer[],
    p_trecho_faixa    text[],
    p_trecho_geom     geometry[],
    p_importacao_id   integer,
    p_periodo_inicio  date,
    p_periodo_fim     date,
    p_modo_cobertura  text)
RETURNS TABLE (
    rota_idx        integer,
    n50             integer,
    n100            integer,
    n150            integer,
    cobertura       double precision,
    furto_outros    integer,
    furto_carga     integer,
    furto_veiculo   integer,
    roubo_outros    integer,
    roubo_carga     integer,
    roubo_veiculo   integer,
    latrocinio      integer,
    transito        integer)
LANGUAGE sql
STABLE
SET search_path = mobile_dados, public, pg_temp
AS $$
WITH
rotas AS (
    SELECT g AS ri FROM generate_series(1, p_n_rotas) AS g
),
raios AS (
    SELECT v.raio FROM (VALUES (50), (100), (150)) AS v (raio)
),
trechos AS (
    SELECT t.ri, t.faixa, t.geom
    FROM unnest(p_trecho_rota, p_trecho_faixa, p_trecho_geom) AS t (ri, faixa, geom)
),
-- União dos corredores por rota, faixa e raio (buffer em metros via geography).
corredores AS (
    SELECT tr.ri, tr.faixa, ra.raio,
           ST_Union(ST_Buffer(tr.geom::geography, ra.raio::double precision)::geometry) AS geom
    FROM trechos AS tr
    CROSS JOIN raios AS ra
    GROUP BY tr.ri, tr.faixa, ra.raio
),
-- Corredor de 100 m por rota, sem separar faixa (só para o modo 'proxy_pontos').
corredor_cobertura AS (
    SELECT tr.ri, ST_Union(ST_Buffer(tr.geom::geography, 100::double precision)::geometry) AS geom
    FROM trechos AS tr
    GROUP BY tr.ri
),
-- Boletins do recorte (período e faixa) dentro de algum corredor; uma linha por
-- (rota, raio, boletim, natureza).
achados AS (
    SELECT DISTINCT c.ri, c.raio, b.chave_bo, b.natureza
    FROM corredores AS c
    JOIN ssp_bo AS b
      ON b.importacao_id = p_importacao_id
     AND b.geom IS NOT NULL
     AND b.faixa = c.faixa
     AND b.data_ocorrencia BETWEEN p_periodo_inicio AND p_periodo_fim
     AND b.natureza IN ('FURTO - OUTROS', 'FURTO DE CARGA', 'FURTO DE VEÍCULO',
                        'ROUBO - OUTROS', 'ROUBO DE CARGA', 'ROUBO DE VEÍCULO', 'LATROCÍNIO',
                        'LESÃO CORPORAL CULPOSA POR ACIDENTE DE TRÂNSITO')
     AND ST_Intersects(b.geom, c.geom)
),
-- N: boletins distintos das duas naturezas da conta (docs/07, docs/08).
contagem AS (
    SELECT a.ri, a.raio, count(DISTINCT a.chave_bo)::integer AS n
    FROM achados AS a
    WHERE a.natureza IN ('FURTO - OUTROS', 'ROUBO - OUTROS')
    GROUP BY a.ri, a.raio
),
-- Categorias (±100 m), boletins distintos por natureza.
categorias AS (
    SELECT a.ri,
           (count(DISTINCT a.chave_bo) FILTER (WHERE a.natureza = 'FURTO - OUTROS'))::integer   AS furto_outros,
           (count(DISTINCT a.chave_bo) FILTER (WHERE a.natureza = 'FURTO DE CARGA'))::integer   AS furto_carga,
           (count(DISTINCT a.chave_bo) FILTER (WHERE a.natureza = 'FURTO DE VEÍCULO'))::integer AS furto_veiculo,
           (count(DISTINCT a.chave_bo) FILTER (WHERE a.natureza = 'ROUBO - OUTROS'))::integer   AS roubo_outros,
           (count(DISTINCT a.chave_bo) FILTER (WHERE a.natureza = 'ROUBO DE CARGA'))::integer   AS roubo_carga,
           (count(DISTINCT a.chave_bo) FILTER (WHERE a.natureza = 'ROUBO DE VEÍCULO'))::integer AS roubo_veiculo,
           (count(DISTINCT a.chave_bo) FILTER (WHERE a.natureza = 'LATROCÍNIO'))::integer       AS latrocinio,
           (count(DISTINCT a.chave_bo) FILTER (
               WHERE a.natureza = 'LESÃO CORPORAL CULPOSA POR ACIDENTE DE TRÂNSITO'))::integer AS transito
    FROM achados AS a
    WHERE a.raio = 100
    GROUP BY a.ri
),
circ_rota AS (
    SELECT DISTINCT tr.ri, ca.circunscricao
    FROM trechos AS tr
    JOIN circunscricao_area AS ca ON ST_Intersects(ca.geom, tr.geom)
    WHERE p_modo_cobertura = 'poligono'
    UNION
    SELECT DISTINCT cc.ri, b.circunscricao
    FROM corredor_cobertura AS cc
    JOIN ssp_bo AS b
      ON b.importacao_id = p_importacao_id
     AND b.geom IS NOT NULL
     AND b.circunscricao IS NOT NULL
     AND ST_Intersects(b.geom, cc.geom)
    WHERE p_modo_cobertura = 'proxy_pontos'
),
cobertura_rota AS (
    SELECT cr.ri,
           CASE
               WHEN count(*) FILTER (WHERE sc.circunscricao IS NULL) > 0 THEN NULL
               WHEN sum(sc.elegiveis_total) > 0
                   THEN sum(sc.elegiveis_coord_faixa)::double precision / sum(sc.elegiveis_total)::double precision
               ELSE NULL
           END AS cobertura
    FROM circ_rota AS cr
    LEFT JOIN ssp_cobertura AS sc
      ON sc.importacao_id = p_importacao_id
     AND sc.circunscricao = cr.circunscricao
    GROUP BY cr.ri
)
SELECT r.ri,
       coalesce((SELECT c.n FROM contagem AS c WHERE c.ri = r.ri AND c.raio = 50), 0),
       coalesce((SELECT c.n FROM contagem AS c WHERE c.ri = r.ri AND c.raio = 100), 0),
       coalesce((SELECT c.n FROM contagem AS c WHERE c.ri = r.ri AND c.raio = 150), 0),
       cob.cobertura,
       coalesce(cat.furto_outros, 0),
       coalesce(cat.furto_carga, 0),
       coalesce(cat.furto_veiculo, 0),
       coalesce(cat.roubo_outros, 0),
       coalesce(cat.roubo_carga, 0),
       coalesce(cat.roubo_veiculo, 0),
       coalesce(cat.latrocinio, 0),
       coalesce(cat.transito, 0)
FROM rotas AS r
LEFT JOIN categorias AS cat ON cat.ri = r.ri
LEFT JOIN cobertura_rota AS cob ON cob.ri = r.ri
ORDER BY r.ri
$$;

-- -------------------------------------------------------------------------------------
-- (b) Função chamada pelo app (via Data API, como RPC).
--
-- Entrada: p_rotas = [{"id":"r1","trechos_a_pe":[{"geometria":"<polyline 5>","faixa":"NOITE"}]}]
--   1 a 5 rotas, ids únicos; `trechos_a_pe` pode ser [] (rota sem caminhada, L = 0).
-- Saída (jsonb; sem p-valor, sem ids de BO, sem pontos):
--   {caso, motivo, periodo:{inicio,fim,meses}, atualizacao_ssp,
--    rotas:[{id, menorExposicao, exposicao:{registros,kmAPe,registrosPorKm,cobertura},
--            categorias:{...}}],
--    panoramaMunicipal:{homicidioDoloso,tentativaHomicidio,estupro,estuproVulneravel}}
--
-- Privacidade: a função NÃO grava nada (nem geometria, nem horário, nem id de rota).
-- Mensagens de erro nunca incluem valores recebidos (nada de coordenadas em log).
-- VOLATILE de propósito: no PostgREST/Data API, funções STABLE/IMMUTABLE também aceitam
-- GET, o que colocaria as geometrias na URL (e em logs de acesso). VOLATILE força POST.
-- Sem SQL dinâmico (nenhum EXECUTE).
--
-- Decisões técnicas deste pacote (ajustáveis, não são metodologia):
--   * limites de entrada: 5 rotas (docs/08, D-15), 5000 vértices por rota, 50 trechos a pé
--     por rota, 100000 caracteres por polyline, id de 1 a 64 caracteres;
--   * a polyline precisa ser canônica: decodificar e recodificar deve devolver o mesmo
--     texto (rejeita lixo que por acaso decodifica em coordenadas válidas);
--   * L = 0 -> registros, registrosPorKm, cobertura e categorias NULL ("não aplicável",
--     nunca zero que pareça vantagem); kmAPe = 0;
--   * kmAPe e registrosPorKm arredondados a 2 casas só na saída; a decisão usa os
--     valores completos;
--   * periodo.meses = meses do calendário entre periodo_inicio e periodo_fim, inclusive
--     (jan–set = 9);
--   * atualizacao_ssp = data de gerado_em no fuso America/Sao_Paulo.
-- -------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION mobile_api.comparar_exposicao(
    p_rotas jsonb,
    p_modo_cobertura text DEFAULT 'poligono')
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = mobile_dados, public, pg_temp
AS $$
DECLARE
    c_max_rotas              CONSTANT integer := 5;
    c_max_vertices_por_rota  CONSTANT integer := 5000;
    c_max_trechos_por_rota   CONSTANT integer := 50;
    c_max_tamanho_polyline   CONSTANT integer := 100000;
    c_max_tamanho_id         CONSTANT integer := 64;
    c_faixas                 CONSTANT text[]  := ARRAY['MADRUGADA', 'MANHA', 'TARDE', 'NOITE'];

    v_n_rotas      integer;
    v_rota         jsonb;
    v_trechos      jsonb;
    v_trecho       jsonb;
    v_id           text;
    v_poly         text;
    v_faixa        text;
    v_geom         geometry;
    v_vertices     integer;
    v_ids          text[]             := ARRAY[]::text[];
    v_l            double precision[] := ARRAY[]::double precision[];
    v_t_rota       integer[]          := ARRAY[]::integer[];
    v_t_faixa      text[]             := ARRAY[]::text[];
    v_t_geom       geometry[]         := ARRAY[]::geometry[];

    v_imp          mobile_dados.importacao%ROWTYPE;
    v_n50          integer[];
    v_n100         integer[];
    v_n150         integer[];
    v_cob          double precision[];
    v_cat          jsonb[];
    v_caso         text;
    v_motivo       text;
    v_vencedor     integer;
    v_meses        integer;
    v_rotas_json   jsonb;
    v_cat_nulas    jsonb := mobile_dados.categorias_json(NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
BEGIN
    -- ---------------------------------------------------------------- 1. Validação
    IF p_modo_cobertura IS NULL OR p_modo_cobertura NOT IN ('poligono', 'proxy_pontos') THEN
        RAISE EXCEPTION 'comparar_exposicao: modo de cobertura inválido (use poligono ou proxy_pontos)'
            USING ERRCODE = '22023';
    END IF;
    IF p_rotas IS NULL OR jsonb_typeof(p_rotas) <> 'array' THEN
        RAISE EXCEPTION 'comparar_exposicao: p_rotas deve ser um array JSON' USING ERRCODE = '22023';
    END IF;
    v_n_rotas := jsonb_array_length(p_rotas);
    IF v_n_rotas < 1 OR v_n_rotas > c_max_rotas THEN
        RAISE EXCEPTION 'comparar_exposicao: p_rotas deve ter de 1 a % rotas', c_max_rotas
            USING ERRCODE = '22023';
    END IF;

    FOR i IN 0 .. v_n_rotas - 1 LOOP
        v_rota := p_rotas -> i;
        IF jsonb_typeof(v_rota) IS DISTINCT FROM 'object' THEN
            RAISE EXCEPTION 'comparar_exposicao: cada rota deve ser um objeto JSON' USING ERRCODE = '22023';
        END IF;
        IF jsonb_typeof(v_rota -> 'id') IS DISTINCT FROM 'string' THEN
            RAISE EXCEPTION 'comparar_exposicao: rota sem id textual' USING ERRCODE = '22023';
        END IF;
        v_id := v_rota ->> 'id';
        IF length(v_id) < 1 OR length(v_id) > c_max_tamanho_id THEN
            RAISE EXCEPTION 'comparar_exposicao: id de rota deve ter de 1 a % caracteres', c_max_tamanho_id
                USING ERRCODE = '22023';
        END IF;
        IF v_id = ANY (v_ids) THEN
            RAISE EXCEPTION 'comparar_exposicao: ids de rota repetidos' USING ERRCODE = '22023';
        END IF;
        v_ids := array_append(v_ids, v_id);

        v_trechos := v_rota -> 'trechos_a_pe';
        IF jsonb_typeof(v_trechos) IS DISTINCT FROM 'array' THEN
            RAISE EXCEPTION 'comparar_exposicao: trechos_a_pe deve ser um array JSON (pode ser vazio)'
                USING ERRCODE = '22023';
        END IF;
        IF jsonb_array_length(v_trechos) > c_max_trechos_por_rota THEN
            RAISE EXCEPTION 'comparar_exposicao: rota com mais de % trechos a pé', c_max_trechos_por_rota
                USING ERRCODE = '22023';
        END IF;

        v_vertices := 0;
        v_l := array_append(v_l, 0::double precision);

        FOR j IN 0 .. jsonb_array_length(v_trechos) - 1 LOOP
            v_trecho := v_trechos -> j;
            IF jsonb_typeof(v_trecho) IS DISTINCT FROM 'object'
               OR jsonb_typeof(v_trecho -> 'geometria') IS DISTINCT FROM 'string'
               OR jsonb_typeof(v_trecho -> 'faixa') IS DISTINCT FROM 'string' THEN
                RAISE EXCEPTION 'comparar_exposicao: trecho a pé deve ter geometria e faixa textuais'
                    USING ERRCODE = '22023';
            END IF;

            v_faixa := v_trecho ->> 'faixa';
            IF NOT (v_faixa = ANY (c_faixas)) THEN
                RAISE EXCEPTION 'comparar_exposicao: faixa inválida (use MADRUGADA, MANHA, TARDE ou NOITE)'
                    USING ERRCODE = '22023';
            END IF;

            v_poly := v_trecho ->> 'geometria';
            IF length(v_poly) < 2 OR length(v_poly) > c_max_tamanho_polyline THEN
                RAISE EXCEPTION 'comparar_exposicao: geometria de trecho com tamanho inválido'
                    USING ERRCODE = '22023';
            END IF;

            -- Decodifica sem deixar escapar a mensagem original (que poderia conter o texto).
            BEGIN
                v_geom := ST_LineFromEncodedPolyline(v_poly, 5);
                IF v_geom IS NOT NULL AND ST_AsEncodedPolyline(v_geom, 5) IS DISTINCT FROM v_poly THEN
                    v_geom := NULL;
                END IF;
            EXCEPTION WHEN OTHERS THEN
                v_geom := NULL;
            END;
            IF v_geom IS NULL
               OR ST_IsEmpty(v_geom)
               OR GeometryType(v_geom) <> 'LINESTRING'
               OR ST_NPoints(v_geom) < 2
               OR ST_XMin(v_geom) < -180 OR ST_XMax(v_geom) > 180
               OR ST_YMin(v_geom) < -90  OR ST_YMax(v_geom) > 90 THEN
                RAISE EXCEPTION 'comparar_exposicao: geometria de trecho não é uma polyline de precisão 5 válida'
                    USING ERRCODE = '22023';
            END IF;

            v_vertices := v_vertices + ST_NPoints(v_geom);
            IF v_vertices > c_max_vertices_por_rota THEN
                RAISE EXCEPTION 'comparar_exposicao: rota excede % vértices nos trechos a pé', c_max_vertices_por_rota
                    USING ERRCODE = '22023';
            END IF;

            -- L = soma dos comprimentos dos trechos ORIGINAIS (não da união), em km.
            v_l[i + 1] := v_l[i + 1] + ST_Length(v_geom::geography) / 1000.0;
            v_t_rota  := array_append(v_t_rota, i + 1);
            v_t_faixa := array_append(v_t_faixa, v_faixa);
            v_t_geom  := array_append(v_t_geom, v_geom);
        END LOOP;
    END LOOP;

    -- ---------------------------------------------------------------- 2. Importação ativa
    SELECT * INTO v_imp FROM mobile_dados.importacao WHERE ativa ORDER BY id DESC LIMIT 1;

    IF NOT FOUND THEN
        -- Sem base validada: INDISPONIVEL, números NULL (nunca zero). kmAPe é distância.
        SELECT jsonb_agg(jsonb_build_object(
                   'id', v_ids[g],
                   'menorExposicao', false,
                   'exposicao', jsonb_build_object(
                       'registros', NULL::integer,
                       'kmAPe', round(v_l[g]::numeric, 2),
                       'registrosPorKm', NULL::numeric,
                       'cobertura', NULL::double precision),
                   'categorias', v_cat_nulas)
               ORDER BY g)
          INTO v_rotas_json
          FROM generate_series(1, v_n_rotas) AS g;

        RETURN jsonb_build_object(
            'caso', 'INDISPONIVEL',
            'motivo', NULL::text,
            'periodo', jsonb_build_object('inicio', NULL::text, 'fim', NULL::text, 'meses', NULL::integer),
            'atualizacao_ssp', NULL::text,
            'rotas', v_rotas_json,
            'panoramaMunicipal', jsonb_build_object(
                'homicidioDoloso', NULL::integer,
                'tentativaHomicidio', NULL::integer,
                'estupro', NULL::integer,
                'estuproVulneravel', NULL::integer));
    END IF;

    -- ---------------------------------------------------------------- 3. Medidas
    SELECT array_agg(m.n50 ORDER BY m.rota_idx),
           array_agg(m.n100 ORDER BY m.rota_idx),
           array_agg(m.n150 ORDER BY m.rota_idx),
           array_agg(m.cobertura ORDER BY m.rota_idx),
           array_agg(mobile_dados.categorias_json(
                         m.furto_outros, m.furto_carga, m.furto_veiculo,
                         m.roubo_outros, m.roubo_carga, m.roubo_veiculo, m.latrocinio,
                         m.transito) ORDER BY m.rota_idx)
      INTO v_n50, v_n100, v_n150, v_cob, v_cat
      FROM mobile_dados.medir_rotas(v_n_rotas, v_t_rota, v_t_faixa, v_t_geom,
                                    v_imp.id, v_imp.periodo_inicio, v_imp.periodo_fim,
                                    p_modo_cobertura) AS m;

    -- ---------------------------------------------------------------- 4. Decisão
    SELECT d.caso, d.motivo, d.vencedor
      INTO v_caso, v_motivo, v_vencedor
      FROM mobile_dados.decidir_exposicao(v_n50, v_n100, v_n150, v_l, v_cob) AS d;

    -- ---------------------------------------------------------------- 5. Saída
    SELECT jsonb_agg(jsonb_build_object(
               'id', v_ids[g],
               'menorExposicao', coalesce(v_caso = 'CONCLUSIVO' AND g = v_vencedor, false),
               'exposicao', jsonb_build_object(
                   'registros',      CASE WHEN v_l[g] > 0 THEN v_n100[g] END,
                   'kmAPe',          round(v_l[g]::numeric, 2),
                   'registrosPorKm', CASE WHEN v_l[g] > 0 THEN round((v_n100[g] / v_l[g])::numeric, 2) END,
                   'cobertura',      CASE WHEN v_l[g] > 0 THEN v_cob[g] END),
               'categorias', CASE WHEN v_l[g] > 0 THEN v_cat[g] ELSE v_cat_nulas END)
           ORDER BY g)
      INTO v_rotas_json
      FROM generate_series(1, v_n_rotas) AS g;

    v_meses := (EXTRACT(YEAR FROM v_imp.periodo_fim)::integer - EXTRACT(YEAR FROM v_imp.periodo_inicio)::integer) * 12
             + EXTRACT(MONTH FROM v_imp.periodo_fim)::integer - EXTRACT(MONTH FROM v_imp.periodo_inicio)::integer + 1;

    RETURN jsonb_build_object(
        'caso', v_caso,
        'motivo', v_motivo,
        'periodo', jsonb_build_object(
            'inicio', to_char(v_imp.periodo_inicio, 'YYYY-MM-DD'),
            'fim',    to_char(v_imp.periodo_fim, 'YYYY-MM-DD'),
            'meses',  v_meses),
        'atualizacao_ssp', to_char((v_imp.gerado_em AT TIME ZONE 'America/Sao_Paulo')::date, 'YYYY-MM-DD'),
        'rotas', v_rotas_json,
        -- Panorama do município inteiro (docs/07): nunca recortado pela rota. Ausente = null.
        'panoramaMunicipal', jsonb_build_object(
            'homicidioDoloso', (SELECT sp.total FROM mobile_dados.ssp_panorama AS sp
                                WHERE sp.importacao_id = v_imp.id AND sp.natureza = 'HOMICÍDIO DOLOSO'),
            'tentativaHomicidio', (SELECT sp.total FROM mobile_dados.ssp_panorama AS sp
                                   WHERE sp.importacao_id = v_imp.id AND sp.natureza = 'TENTATIVA DE HOMICÍDIO'),
            'estupro', (SELECT sp.total FROM mobile_dados.ssp_panorama AS sp
                        WHERE sp.importacao_id = v_imp.id AND sp.natureza = 'ESTUPRO'),
            'estuproVulneravel', (SELECT sp.total FROM mobile_dados.ssp_panorama AS sp
                                  WHERE sp.importacao_id = v_imp.id AND sp.natureza = 'ESTUPRO DE VULNERÁVEL')));
END;
$$;

COMMENT ON FUNCTION mobile_api.comparar_exposicao(jsonb, text) IS
    'VoltaSegura: exposição estimada comparativa dos trechos a pé de 1 a 5 rotas (docs/08). '
    'Devolve só agregados; não grava a consulta. Não classifica trechos nem estima probabilidade de vitimização.';

-- -------------------------------------------------------------------------------------
-- Permissões. Por padrão o PostgreSQL concede EXECUTE a PUBLIC em toda função nova:
-- revogar SEMPRE, principalmente da função SECURITY DEFINER.
-- -------------------------------------------------------------------------------------
REVOKE ALL ON FUNCTION mobile_api.comparar_exposicao(jsonb, text) FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA mobile_dados FROM PUBLIC;

-- [EM ABERTO] Papel autenticado da Data API do Neon: nome a confirmar em `dev`.
-- NÃO executar com o placeholder. Só EXECUTE nesta função; nada em mobile_dados.
-- GRANT USAGE ON SCHEMA mobile_api TO <PAPEL_AUTENTICADO_DATA_API>;
-- GRANT EXECUTE ON FUNCTION mobile_api.comparar_exposicao(jsonb, text) TO <PAPEL_AUTENTICADO_DATA_API>;
