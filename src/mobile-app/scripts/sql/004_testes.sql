-- =====================================================================================
-- VoltaSegura · B-06 · 004_testes.sql
-- Testes da exposição estimada com dados SINTÉTICOS. Tudo roda dentro de BEGIN ... ROLLBACK:
-- nada fica gravado. Qualquer divergência dá RAISE EXCEPTION e interrompe o script.
--
-- AVISO: este arquivo NÃO foi executado (não há Postgres/PostGIS nesta máquina). Rodar na
-- branch `dev` do Neon, com psql, DEPOIS de 001, 002 e 003:
--     psql "<conexão da branch dev>" -v ON_ERROR_STOP=1 -f 004_testes.sql
-- Coordenadas inventadas perto de (-23,55; -46,63); boletins fictícios 'sint-...'.
-- Os casos do bloco "decisão" e os p-valores de referência são os mesmos de
-- test_referencia_exposicao.py (p-valores gerados com scipy 1.15.2 e colados aqui).
--
-- Distâncias usadas (1e-5 grau de latitude ~ 1,108 m em -23,55):
--   +0.00027 ~  30 m (conta em 50/100/150)    +0.00072 ~  80 m (100/150)
--   +0.00117 ~ 130 m (só 150)                 +0.00180 ~ 199 m (fora)
-- =====================================================================================

\set ON_ERROR_STOP on
SET client_encoding = 'UTF8';

BEGIN;
-- SAVEPOINT só funciona dentro de um bloco de transação: se o cliente ignorou o BEGIN
-- (autocommit), o script para aqui, antes de mexer em qualquer tabela.
SAVEPOINT exige_bloco_de_transacao;

-- -------------------------------------------------------------------------------------
-- Auxiliares (pg_temp: somem no fim da sessão; nada vai para os schemas do projeto)
-- -------------------------------------------------------------------------------------
CREATE FUNCTION pg_temp.conferir(p_ok boolean, p_msg text) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
    IF p_ok IS NOT TRUE THEN
        RAISE EXCEPTION 'TESTE FALHOU: %', p_msg;
    END IF;
END;
$$;

CREATE FUNCTION pg_temp.conferir_binomial(p_k integer, p_n integer, p_p double precision, p_esperado double precision)
RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
    v double precision := mobile_dados.binomial_bilateral(p_k, p_n, p_p);
BEGIN
    IF abs(v - p_esperado) > greatest(1e-9 * abs(p_esperado), 1e-15) THEN
        RAISE EXCEPTION 'TESTE FALHOU: binomial_bilateral(%, %, %) = %, esperado %', p_k, p_n, p_p, v, p_esperado;
    END IF;
END;
$$;

CREATE FUNCTION pg_temp.conferir_decisao(
    p_nome text, p_n50 integer[], p_n100 integer[], p_n150 integer[],
    p_l double precision[], p_cob double precision[],
    p_caso text, p_motivo text, p_vencedor integer)
RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
    r record;
BEGIN
    SELECT d.caso, d.motivo, d.vencedor INTO r
      FROM mobile_dados.decidir_exposicao(p_n50, p_n100, p_n150, p_l, p_cob) AS d;
    IF r.caso IS DISTINCT FROM p_caso OR r.motivo IS DISTINCT FROM p_motivo
       OR r.vencedor IS DISTINCT FROM p_vencedor THEN
        RAISE EXCEPTION 'TESTE FALHOU: decisão [%]: obtido %/%/%, esperado %/%/%',
            p_nome, r.caso, r.motivo, r.vencedor, p_caso, p_motivo, p_vencedor;
    END IF;
END;
$$;

-- Linha leste-oeste na latitude p_lat.
CREATE FUNCTION pg_temp.linha(p_lat double precision, p_lon_ini double precision, p_lon_fim double precision)
RETURNS geometry
LANGUAGE sql IMMUTABLE AS $$
    SELECT ST_SetSRID(ST_MakeLine(ST_MakePoint(p_lon_ini, p_lat), ST_MakePoint(p_lon_fim, p_lat)), 4326)
$$;

-- Trecho a pé no formato de entrada (polyline de precisão 5).
CREATE FUNCTION pg_temp.trecho(p_lat double precision, p_lon_ini double precision, p_lon_fim double precision,
                               p_faixa text DEFAULT 'NOITE')
RETURNS jsonb
LANGUAGE sql IMMUTABLE AS $$
    SELECT jsonb_build_object('geometria', ST_AsEncodedPolyline(pg_temp.linha(p_lat, p_lon_ini, p_lon_fim), 5),
                              'faixa', p_faixa)
$$;

CREATE FUNCTION pg_temp.rota(p_id text, p_trechos jsonb) RETURNS jsonb
LANGUAGE sql IMMUTABLE AS $$
    SELECT jsonb_build_object('id', p_id, 'trechos_a_pe', p_trechos)
$$;

-- k rotas paralelas: rota i na latitude -23,55 - 0,01*(i-1), de -46,64 a -46,63 (~1,02 km), NOITE.
CREATE FUNCTION pg_temp.rotas_paralelas(p_k integer) RETURNS jsonb
LANGUAGE sql IMMUTABLE AS $$
    SELECT jsonb_agg(pg_temp.rota('r' || i,
                     jsonb_build_array(pg_temp.trecho(-23.55 - 0.01 * (i - 1), -46.64, -46.63)))
                     ORDER BY i)
    FROM generate_series(1, p_k) AS i
$$;

-- Nova importação sintética ATIVA (desativa as outras; tudo será desfeito no ROLLBACK).
CREATE FUNCTION pg_temp.nova_importacao() RETURNS integer
LANGUAGE plpgsql AS $$
DECLARE
    v_id integer;
BEGIN
    UPDATE mobile_dados.importacao SET ativa = false WHERE ativa;
    INSERT INTO mobile_dados.importacao
        (fonte, arquivo_sha256, periodo_inicio, periodo_fim, linhas_lidas, linhas_validas, gerado_em, ativa)
    VALUES ('SINTETICO - testes B-06', repeat('0', 64), DATE '2026-01-01', DATE '2026-09-30', 0, 0,
            TIMESTAMPTZ '2026-10-15 12:00:00-03', true)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$;

CREATE FUNCTION pg_temp.bo(p_imp integer, p_chave text, p_natureza text,
                           p_lat double precision, p_lon double precision,
                           p_faixa text DEFAULT 'NOITE', p_data date DEFAULT DATE '2026-05-10',
                           p_circ text DEFAULT 'SINT-DP-1')
RETURNS void
LANGUAGE sql AS $$
    INSERT INTO mobile_dados.ssp_bo
        (importacao_id, chave_bo, natureza, data_ocorrencia, faixa, geom, circunscricao, tipo_local)
    VALUES (p_imp, p_chave, p_natureza, p_data, p_faixa,
            CASE WHEN p_lat IS NOT NULL AND p_lon IS NOT NULL
                 THEN ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326) END,
            p_circ, 'sintético')
$$;

-- Cenário de k rotas paralelas: qtd30[i] BOs 'FURTO - OUTROS' a ~30 m da rota i (contam nos
-- três raios), qtd130[i] a ~130 m (só no raio de 150 m); polígono 'SINT-DP-i' por rota com
-- cobertura cob_mil[i]/1000. Devolve o id da importação (ativa).
CREATE FUNCTION pg_temp.preparar(p_qtd30 integer[], p_qtd130 integer[], p_cob_mil integer[])
RETURNS integer
LANGUAGE plpgsql AS $$
DECLARE
    v_imp integer;
    v_lat double precision;
BEGIN
    v_imp := pg_temp.nova_importacao();
    DELETE FROM mobile_dados.circunscricao_area;
    FOR i IN 1 .. cardinality(p_qtd30) LOOP
        v_lat := -23.55 - 0.01 * (i - 1);
        INSERT INTO mobile_dados.circunscricao_area (circunscricao, geom, fonte)
        VALUES ('SINT-DP-' || i,
                ST_Multi(ST_MakeEnvelope(-46.65, v_lat - 0.004, -46.62, v_lat + 0.004, 4326)),
                'sintético');
        INSERT INTO mobile_dados.ssp_cobertura (importacao_id, circunscricao, elegiveis_total, elegiveis_coord_faixa)
        VALUES (v_imp, 'SINT-DP-' || i, 1000, p_cob_mil[i]);
        FOR g IN 1 .. p_qtd30[i] LOOP
            PERFORM pg_temp.bo(v_imp, format('sint-r%s-30-%s', i, g), 'FURTO - OUTROS',
                               v_lat + 0.00027, -46.639 + 0.008 * (g - 1) / greatest(p_qtd30[i] - 1, 1),
                               'NOITE', DATE '2026-05-10', 'SINT-DP-' || i);
        END LOOP;
        FOR g IN 1 .. p_qtd130[i] LOOP
            PERFORM pg_temp.bo(v_imp, format('sint-r%s-130-%s', i, g), 'FURTO - OUTROS',
                               v_lat + 0.00117, -46.639 + 0.008 * (g - 1) / greatest(p_qtd130[i] - 1, 1),
                               'NOITE', DATE '2026-05-10', 'SINT-DP-' || i);
        END LOOP;
    END LOOP;
    RETURN v_imp;
END;
$$;

-- Confere caso, motivo, qual rota (id) tem menorExposicao=true (NULL = nenhuma) e que a
-- resposta não carrega ids de BO nem p-valor.
CREATE FUNCTION pg_temp.conferir_caso(p_nome text, p_resp jsonb, p_caso text, p_motivo text, p_destacada text)
RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
    v_qtd integer;
    v_id  text;
BEGIN
    PERFORM pg_temp.conferir(p_resp ->> 'caso' = p_caso,
        format('%s: caso %s, esperado %s', p_nome, p_resp ->> 'caso', p_caso));
    PERFORM pg_temp.conferir((p_resp ->> 'motivo') IS NOT DISTINCT FROM p_motivo,
        format('%s: motivo %s, esperado %s', p_nome, p_resp ->> 'motivo', p_motivo));
    SELECT count(*) FILTER (WHERE (e ->> 'menorExposicao')::boolean),
           max(e ->> 'id') FILTER (WHERE (e ->> 'menorExposicao')::boolean)
      INTO v_qtd, v_id
      FROM jsonb_array_elements(p_resp -> 'rotas') AS e;
    IF p_destacada IS NULL THEN
        PERFORM pg_temp.conferir(v_qtd = 0, format('%s: nenhuma rota deveria ter menorExposicao', p_nome));
    ELSE
        PERFORM pg_temp.conferir(v_qtd = 1 AND v_id = p_destacada,
            format('%s: menorExposicao em %s (%s rotas), esperado %s', p_nome, v_id, v_qtd, p_destacada));
    END IF;
    PERFORM pg_temp.conferir(p_resp::text !~* '(sint-|valor|chave_bo|"p")',
        format('%s: a resposta não pode ter ids de BO nem p-valor', p_nome));
END;
$$;

-- Espera erro 22023 e confere que a mensagem não repete valores recebidos.
CREATE FUNCTION pg_temp.espera_recusa(p_nome text, p_rotas jsonb, p_modo text, p_segredo text)
RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
    v_recusou boolean := false;
    v_msg     text;
BEGIN
    BEGIN
        PERFORM mobile_api.comparar_exposicao(p_rotas, p_modo);
    EXCEPTION WHEN invalid_parameter_value THEN
        v_recusou := true;
        v_msg := SQLERRM;
    END;
    PERFORM pg_temp.conferir(v_recusou, format('validação [%s]: entrada deveria ser recusada', p_nome));
    PERFORM pg_temp.conferir(p_segredo IS NULL OR position(p_segredo IN v_msg) = 0,
        format('validação [%s]: a mensagem repete o valor recebido', p_nome));
    PERFORM pg_temp.conferir(v_msg !~ '\d+\.\d+',
        format('validação [%s]: a mensagem não pode conter coordenadas', p_nome));
END;
$$;

-- -------------------------------------------------------------------------------------
-- 1. binomial_bilateral contra valores de referência do scipy
-- -------------------------------------------------------------------------------------
DO $$
DECLARE
    v_recusou boolean := false;
BEGIN
    PERFORM pg_temp.conferir_binomial(8, 29, 0.391304347826087::double precision, 0.2545866373956896::double precision);
    PERFORM pg_temp.conferir_binomial(1, 10, 0.5::double precision, 0.021484375::double precision);
    PERFORM pg_temp.conferir_binomial(1, 9, 0.5::double precision, 0.0390625::double precision);
    PERFORM pg_temp.conferir_binomial(0, 10, 0.5::double precision, 0.001953125::double precision);
    PERFORM pg_temp.conferir_binomial(10, 10, 0.5::double precision, 0.001953125::double precision);
    PERFORM pg_temp.conferir_binomial(4, 12, 0.5::double precision, 0.3876953125::double precision);
    PERFORM pg_temp.conferir_binomial(5, 5, 0.5::double precision, 0.0625::double precision);
    PERFORM pg_temp.conferir_binomial(12, 43, 0.5::double precision, 0.005401572654591291::double precision);
    PERFORM pg_temp.conferir_binomial(31, 43, 0.5::double precision, 0.005401572654591291::double precision);
    PERFORM pg_temp.conferir_binomial(1, 13, 0.5::double precision, 0.00341796875::double precision);
    PERFORM pg_temp.conferir_binomial(3, 7, 0.3333333333333333::double precision, 0.692729766803841::double precision);
    PERFORM pg_temp.conferir_binomial(0, 15, 0.1::double precision, 0.3899522012010401::double precision);
    PERFORM pg_temp.conferir_binomial(3, 10, 0.3::double precision, 1.0::double precision);
    PERFORM pg_temp.conferir_binomial(0, 1, 0.5::double precision, 1.0::double precision);
    PERFORM pg_temp.conferir_binomial(450, 2000, 0.25::double precision, 0.009800968706063173::double precision);
    PERFORM pg_temp.conferir_binomial(980, 2000, 0.5::double precision, 0.38317685533523665::double precision);
    PERFORM pg_temp.conferir_binomial(900, 2000, 0.5::double precision, 8.457089535503813e-06::double precision);
    PERFORM pg_temp.conferir_binomial(1000, 2000, 0.5::double precision, 1.0::double precision);
    PERFORM pg_temp.conferir_binomial(30, 2000, 0.02::double precision, 0.1281760288603639::double precision);
    BEGIN
        PERFORM mobile_dados.binomial_bilateral(6, 5, 0.5);
    EXCEPTION WHEN invalid_parameter_value THEN
        v_recusou := true;
    END;
    PERFORM pg_temp.conferir(v_recusou, 'binomial_bilateral deve recusar k > n');
    PERFORM pg_temp.conferir(mobile_dados.binomial_bilateral(0, 0, 0.5) = 1, 'binomial_bilateral com n = 0 vale 1');
    RAISE NOTICE 'ok: binomial_bilateral';
END;
$$;

-- -------------------------------------------------------------------------------------
-- 2. Decisão pura (mesma tabela de test_referencia_exposicao.py; vencedor em base 1)
-- -------------------------------------------------------------------------------------
DO $$
BEGIN
    PERFORM pg_temp.conferir_decisao('uma_rota',
        ARRAY[0]::int[], ARRAY[0]::int[], ARRAY[0]::int[],
        ARRAY[1.0]::double precision[], ARRAY[0.85]::double precision[],
        'SEM_COMPARACAO', NULL, NULL);
    PERFORM pg_temp.conferir_decisao('l_zero_duas',
        ARRAY[1, 0]::int[], ARRAY[1, 0]::int[], ARRAY[1, 0]::int[],
        ARRAY[1.0, 0.0]::double precision[], ARRAY[0.85, 0.85]::double precision[],
        'NAO_APLICAVEL', NULL, NULL);
    PERFORM pg_temp.conferir_decisao('l_zero_tres_com_vencedor',
        ARRAY[1, 12, 0]::int[], ARRAY[1, 12, 0]::int[], ARRAY[1, 12, 0]::int[],
        ARRAY[1.0, 1.0, 0.0]::double precision[], ARRAY[0.85, 0.85, 0.85]::double precision[],
        'NAO_APLICAVEL', NULL, NULL);
    PERFORM pg_temp.conferir_decisao('amostra_9',
        ARRAY[1, 8]::int[], ARRAY[1, 8]::int[], ARRAY[1, 8]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[0.85, 0.85]::double precision[],
        'INSUFICIENTE', 'AMOSTRA', NULL);
    PERFORM pg_temp.conferir_decisao('amostra_10',
        ARRAY[1, 9]::int[], ARRAY[1, 9]::int[], ARRAY[1, 9]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[0.85, 0.85]::double precision[],
        'CONCLUSIVO', NULL, 1);
    PERFORM pg_temp.conferir_decisao('cobertura_0799',
        ARRAY[1, 9]::int[], ARRAY[1, 9]::int[], ARRAY[1, 9]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[0.799, 0.85]::double precision[],
        'INSUFICIENTE', 'COBERTURA', NULL);
    PERFORM pg_temp.conferir_decisao('cobertura_080',
        ARRAY[1, 9]::int[], ARRAY[1, 9]::int[], ARRAY[1, 9]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[0.8, 0.85]::double precision[],
        'CONCLUSIVO', NULL, 1);
    PERFORM pg_temp.conferir_decisao('diferenca_010',
        ARRAY[1, 9]::int[], ARRAY[1, 9]::int[], ARRAY[1, 9]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[0.8, 0.9]::double precision[],
        'CONCLUSIVO', NULL, 1);
    PERFORM pg_temp.conferir_decisao('diferenca_0101',
        ARRAY[1, 9]::int[], ARRAY[1, 9]::int[], ARRAY[1, 9]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[0.8, 0.901]::double precision[],
        'INSUFICIENTE', 'COBERTURA', NULL);
    PERFORM pg_temp.conferir_decisao('diferenca_010_flutuante',
        ARRAY[1, 9]::int[], ARRAY[1, 9]::int[], ARRAY[1, 9]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[0.83, 0.93]::double precision[],
        'CONCLUSIVO', NULL, 1);
    PERFORM pg_temp.conferir_decisao('cobertura_nula',
        ARRAY[1, 9]::int[], ARRAY[1, 9]::int[], ARRAY[1, 9]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[NULL, 0.85]::double precision[],
        'INSUFICIENTE', 'COBERTURA', NULL);
    PERFORM pg_temp.conferir_decisao('mistos_n_d',
        ARRAY[10, 15]::int[], ARRAY[10, 15]::int[], ARRAY[10, 15]::int[],
        ARRAY[0.5, 1.5]::double precision[], ARRAY[0.85, 0.85]::double precision[],
        'MISTOS', NULL, NULL);
    PERFORM pg_temp.conferir_decisao('mistos_empate',
        ARRAY[6, 6]::int[], ARRAY[6, 6]::int[], ARRAY[6, 6]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[0.85, 0.85]::double precision[],
        'MISTOS', NULL, NULL);
    PERFORM pg_temp.conferir_decisao('sem_diferenca_exemplo_docs08',
        ARRAY[8, 21]::int[], ARRAY[8, 21]::int[], ARRAY[8, 21]::int[],
        ARRAY[0.9, 1.4]::double precision[], ARRAY[0.85, 0.85]::double precision[],
        'SEM_DIFERENCA', NULL, NULL);
    PERFORM pg_temp.conferir_decisao('sem_diferenca_4_8',
        ARRAY[4, 8]::int[], ARRAY[4, 8]::int[], ARRAY[4, 8]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[0.85, 0.85]::double precision[],
        'SEM_DIFERENCA', NULL, NULL);
    PERFORM pg_temp.conferir_decisao('largura_amostra_50',
        ARRAY[0, 5]::int[], ARRAY[1, 9]::int[], ARRAY[1, 12]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[0.85, 0.85]::double precision[],
        'INSUFICIENTE', 'LARGURA', NULL);
    PERFORM pg_temp.conferir_decisao('largura_p_150',
        ARRAY[1, 9]::int[], ARRAY[1, 9]::int[], ARRAY[4, 12]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[0.85, 0.85]::double precision[],
        'INSUFICIENTE', 'LARGURA', NULL);
    PERFORM pg_temp.conferir_decisao('largura_vencedor_muda_150',
        ARRAY[1, 12]::int[], ARRAY[1, 12]::int[], ARRAY[31, 12]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[0.85, 0.85]::double precision[],
        'INSUFICIENTE', 'LARGURA', NULL);
    PERFORM pg_temp.conferir_decisao('largura_empate_150',
        ARRAY[1, 12]::int[], ARRAY[1, 12]::int[], ARRAY[12, 12]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[0.85, 0.85]::double precision[],
        'INSUFICIENTE', 'LARGURA', NULL);
    PERFORM pg_temp.conferir_decisao('vencedor_y',
        ARRAY[12, 1]::int[], ARRAY[12, 1]::int[], ARRAY[12, 1]::int[],
        ARRAY[1.0, 1.0]::double precision[], ARRAY[0.85, 0.85]::double precision[],
        'CONCLUSIVO', NULL, 2);
    PERFORM pg_temp.conferir_decisao('tres_conclusivo',
        ARRAY[1, 12, 12]::int[], ARRAY[1, 12, 12]::int[], ARRAY[1, 12, 12]::int[],
        ARRAY[1.0, 1.0, 1.0]::double precision[], ARRAY[0.85, 0.85, 0.85]::double precision[],
        'CONCLUSIVO', NULL, 1);
    PERFORM pg_temp.conferir_decisao('tres_amostra_vence_sem_diferenca',
        ARRAY[1, 12, 4]::int[], ARRAY[1, 12, 4]::int[], ARRAY[1, 12, 4]::int[],
        ARRAY[1.0, 1.0, 1.0]::double precision[], ARRAY[0.85, 0.85, 0.85]::double precision[],
        'INSUFICIENTE', 'AMOSTRA', NULL);
    PERFORM pg_temp.conferir_decisao('tres_cobertura_vence_largura',
        ARRAY[1, 12, 12]::int[], ARRAY[1, 12, 12]::int[], ARRAY[31, 12, 12]::int[],
        ARRAY[1.0, 1.0, 1.0]::double precision[], ARRAY[0.85, 0.85, 0.7]::double precision[],
        'INSUFICIENTE', 'COBERTURA', NULL);
    PERFORM pg_temp.conferir_decisao('tres_largura_vence_mistos',
        ARRAY[1, 12, 12]::int[], ARRAY[1, 12, 12]::int[], ARRAY[31, 12, 12]::int[],
        ARRAY[1.0, 1.0, 1.0]::double precision[], ARRAY[0.85, 0.85, 0.85]::double precision[],
        'INSUFICIENTE', 'LARGURA', NULL);
    PERFORM pg_temp.conferir_decisao('tres_mistos_vence_sem_diferenca',
        ARRAY[6, 12, 6]::int[], ARRAY[6, 12, 6]::int[], ARRAY[6, 12, 6]::int[],
        ARRAY[1.0, 1.0, 0.5]::double precision[], ARRAY[0.85, 0.85, 0.85]::double precision[],
        'MISTOS', NULL, NULL);
    PERFORM pg_temp.conferir_decisao('tres_conclusivo_com_par_alheio_insuficiente',
        ARRAY[1, 12, 12]::int[], ARRAY[1, 12, 12]::int[], ARRAY[1, 12, 12]::int[],
        ARRAY[1.0, 1.0, 1.0]::double precision[], ARRAY[0.85, 0.8, 0.905]::double precision[],
        'CONCLUSIVO', NULL, 1);
    PERFORM pg_temp.conferir_decisao('cinco_conclusivo',
        ARRAY[12, 12, 12, 12, 1]::int[], ARRAY[12, 12, 12, 12, 1]::int[], ARRAY[12, 12, 12, 12, 1]::int[],
        ARRAY[1.0, 1.0, 1.0, 1.0, 1.0]::double precision[], ARRAY[0.85, 0.85, 0.85, 0.85, 0.85]::double precision[],
        'CONCLUSIVO', NULL, 5);
    PERFORM pg_temp.conferir_decisao('cinco_um_par_amostra',
        ARRAY[1, 12, 12, 12, 5]::int[], ARRAY[1, 12, 12, 12, 5]::int[], ARRAY[1, 12, 12, 12, 5]::int[],
        ARRAY[1.0, 1.0, 1.0, 1.0, 1.0]::double precision[], ARRAY[0.85, 0.85, 0.85, 0.85, 0.85]::double precision[],
        'INSUFICIENTE', 'AMOSTRA', NULL);
    RAISE NOTICE 'ok: decisão (tabela compartilhada com a referência Python)';
END;
$$;

-- -------------------------------------------------------------------------------------
-- 3. Raios 50/100/150, filtros de N, BO com duas naturezas, categorias, 1 rota
-- -------------------------------------------------------------------------------------
DO $$
DECLARE
    v_imp    integer;
    v_outra  integer;
    v_linha  geometry := pg_temp.linha(-23.55, -46.64, -46.63);
    v_l      double precision;
    r        record;
    v_resp   jsonb;
    v_rota   jsonb;
BEGIN
    v_imp := pg_temp.nova_importacao();
    DELETE FROM mobile_dados.circunscricao_area;
    INSERT INTO mobile_dados.circunscricao_area VALUES
        ('SINT-DP-1', ST_Multi(ST_MakeEnvelope(-46.65, -23.554, -46.62, -23.546, 4326)), 'sintético');
    INSERT INTO mobile_dados.ssp_cobertura VALUES (v_imp, 'SINT-DP-1', 1000, 900);

    PERFORM pg_temp.bo(v_imp, 'sint-001', 'FURTO - OUTROS', -23.55 + 0.00027, -46.635);  -- 30 m
    PERFORM pg_temp.bo(v_imp, 'sint-002', 'ROUBO - OUTROS', -23.55 + 0.00072, -46.635);  -- 80 m
    PERFORM pg_temp.bo(v_imp, 'sint-003', 'FURTO - OUTROS', -23.55 + 0.00117, -46.635);  -- 130 m
    PERFORM pg_temp.bo(v_imp, 'sint-004', 'FURTO - OUTROS', -23.55 + 0.00180, -46.635);  -- 199 m (fora)
    -- Mesmo boletim com duas naturezas da conta: N conta 1; cada parcela conta 1.
    PERFORM pg_temp.bo(v_imp, 'sint-005', 'FURTO - OUTROS', -23.55 - 0.00027, -46.634);
    PERFORM pg_temp.bo(v_imp, 'sint-005', 'ROUBO - OUTROS', -23.55 - 0.00027, -46.634);
    -- Fora de N: sem faixa, sem coordenada, outra faixa, fora do período, sem data.
    PERFORM pg_temp.bo(v_imp, 'sint-006', 'FURTO - OUTROS', -23.55 + 0.00027, -46.636, NULL);
    PERFORM pg_temp.bo(v_imp, 'sint-007', 'FURTO - OUTROS', NULL, NULL);
    PERFORM pg_temp.bo(v_imp, 'sint-008', 'FURTO - OUTROS', -23.55 + 0.00027, -46.637, 'MANHA');
    PERFORM pg_temp.bo(v_imp, 'sint-009', 'FURTO - OUTROS', -23.55 + 0.00027, -46.638, 'NOITE', DATE '2025-12-31');
    PERFORM pg_temp.bo(v_imp, 'sint-010', 'FURTO - OUTROS', -23.55 + 0.00027, -46.633, 'NOITE', NULL);
    -- Naturezas de contexto (categorias, nunca N).
    PERFORM pg_temp.bo(v_imp, 'sint-011', 'FURTO DE VEÍCULO', -23.55 + 0.00027, -46.632);
    PERFORM pg_temp.bo(v_imp, 'sint-012', 'FURTO DE CARGA', -23.55 + 0.00072, -46.632);
    PERFORM pg_temp.bo(v_imp, 'sint-013', 'ROUBO DE CARGA', -23.55 + 0.00117, -46.632);   -- só 150: fora das categorias
    PERFORM pg_temp.bo(v_imp, 'sint-014', 'LATROCÍNIO', -23.55 + 0.00027, -46.631);
    PERFORM pg_temp.bo(v_imp, 'sint-015', 'ROUBO DE VEÍCULO', -23.55 + 0.00180, -46.631); -- fora
    PERFORM pg_temp.bo(v_imp, 'sint-016', 'LESÃO CORPORAL CULPOSA POR ACIDENTE DE TRÂNSITO', -23.55 + 0.00027, -46.639);
    PERFORM pg_temp.bo(v_imp, 'sint-017', 'HOMICÍDIO DOLOSO', -23.55 + 0.00027, -46.638);  -- nunca por rota
    -- Outra importação (inativa) com BO no mesmo lugar: não pode contar.
    INSERT INTO mobile_dados.importacao
        (fonte, arquivo_sha256, periodo_inicio, periodo_fim, linhas_lidas, linhas_validas, gerado_em, ativa)
    VALUES ('SINTETICO - inativa', repeat('1', 64), DATE '2026-01-01', DATE '2026-09-30', 0, 0, now(), false)
    RETURNING id INTO v_outra;
    PERFORM pg_temp.bo(v_outra, 'sint-018', 'FURTO - OUTROS', -23.55 + 0.00027, -46.635);

    SELECT * INTO r FROM mobile_dados.medir_rotas(
        1, ARRAY[1], ARRAY['NOITE'], ARRAY[v_linha], v_imp, DATE '2026-01-01', DATE '2026-09-30', 'poligono');
    PERFORM pg_temp.conferir(r.n50 = 2,  format('raio 50: N = %s, esperado 2', r.n50));
    PERFORM pg_temp.conferir(r.n100 = 3, format('raio 100: N = %s, esperado 3', r.n100));
    PERFORM pg_temp.conferir(r.n150 = 4, format('raio 150: N = %s, esperado 4', r.n150));
    PERFORM pg_temp.conferir(r.furto_outros = 2 AND r.roubo_outros = 2,
        format('parcelas outros: furto %s, roubo %s, esperado 2 e 2', r.furto_outros, r.roubo_outros));
    PERFORM pg_temp.conferir(r.furto_carga = 1 AND r.furto_veiculo = 1 AND r.roubo_carga = 0
                             AND r.roubo_veiculo = 0 AND r.latrocinio = 1 AND r.transito = 1,
        'parcelas de contexto no corredor de 100 m');
    PERFORM pg_temp.conferir(abs(r.cobertura - 0.9) < 1e-12, format('cobertura %s, esperado 0.9', r.cobertura));

    v_resp := mobile_api.comparar_exposicao(
        jsonb_build_array(pg_temp.rota('r1', jsonb_build_array(pg_temp.trecho(-23.55, -46.64, -46.63)))));
    PERFORM pg_temp.conferir_caso('uma rota', v_resp, 'SEM_COMPARACAO', NULL, NULL);
    v_rota := v_resp -> 'rotas' -> 0;
    v_l := ST_Length(v_linha::geography) / 1000.0;
    PERFORM pg_temp.conferir(v_rota ->> 'id' = 'r1', 'id da rota devolvido');
    PERFORM pg_temp.conferir((v_rota #>> '{exposicao,registros}')::integer = 3, 'registros = N do raio de 100 m');
    PERFORM pg_temp.conferir((v_rota #>> '{exposicao,kmAPe}')::numeric = round(v_l::numeric, 2), 'kmAPe');
    PERFORM pg_temp.conferir((v_rota #>> '{exposicao,registrosPorKm}')::numeric = round((3 / v_l)::numeric, 2),
        'registrosPorKm = N/L');
    PERFORM pg_temp.conferir(abs((v_rota #>> '{exposicao,cobertura}')::double precision - 0.9) < 1e-12, 'cobertura na saída');
    PERFORM pg_temp.conferir((v_rota #>> '{categorias,furto,total}')::integer = 4
                             AND (v_rota #>> '{categorias,furto,outros}')::integer = 2
                             AND (v_rota #>> '{categorias,furto,carga}')::integer = 1
                             AND (v_rota #>> '{categorias,furto,veiculo}')::integer = 1, 'categorias de furto');
    PERFORM pg_temp.conferir((v_rota #>> '{categorias,roubo,total}')::integer = 3
                             AND (v_rota #>> '{categorias,roubo,latrocinio}')::integer = 1, 'categorias de roubo');
    PERFORM pg_temp.conferir((v_rota #>> '{categorias,transito,total}')::integer = 1, 'categoria de trânsito');
    RAISE NOTICE 'ok: raios, filtros de N, deduplicação por boletim e categorias';
END;
$$;

-- -------------------------------------------------------------------------------------
-- 4. Corredores sobrepostos, faixas por trecho, mesmo BO em duas rotas, L sem união
-- -------------------------------------------------------------------------------------
DO $$
DECLARE
    v_imp   integer;
    v_t1    geometry := pg_temp.linha(-23.55, -46.640, -46.635);
    v_t2    geometry := pg_temp.linha(-23.55, -46.637, -46.630);   -- sobrepõe v_t1 em -46,637..-46,635
    v_t2b   geometry := pg_temp.linha(-23.55, -46.635, -46.630);
    v_soma  numeric;
    v_uniao numeric;
    v_resp  jsonb;
    v_n     integer[];
BEGIN
    v_imp := pg_temp.nova_importacao();
    DELETE FROM mobile_dados.circunscricao_area;
    PERFORM pg_temp.bo(v_imp, 'sint-101', 'FURTO - OUTROS', -23.55 + 0.00027, -46.636, 'NOITE');      -- na sobreposição
    PERFORM pg_temp.bo(v_imp, 'sint-102', 'ROUBO - OUTROS', -23.55 + 0.00027, -46.632, 'NOITE');
    PERFORM pg_temp.bo(v_imp, 'sint-103', 'FURTO - OUTROS', -23.55 + 0.00027, -46.638, 'MADRUGADA');
    PERFORM pg_temp.bo(v_imp, 'sint-104', 'FURTO - OUTROS', -23.55 + 0.00027, -46.632, 'MADRUGADA');

    -- r1: dois trechos NOITE sobrepostos -> 101 (uma vez) e 102 = 2.
    -- r2: trecho 1 NOITE, trecho 2 MADRUGADA -> 101 (NOITE perto do 1) e 104 (MADRUGADA perto do 2) = 2;
    --     102 (NOITE) só está perto do trecho MADRUGADA e 103 (MADRUGADA) só do trecho NOITE.
    SELECT array_agg(m.n100 ORDER BY m.rota_idx) INTO v_n
      FROM mobile_dados.medir_rotas(2, ARRAY[1, 1, 2, 2], ARRAY['NOITE', 'NOITE', 'NOITE', 'MADRUGADA'],
                                    ARRAY[v_t1, v_t2, v_t1, v_t2b], v_imp,
                                    DATE '2026-01-01', DATE '2026-09-30', 'poligono') AS m;
    PERFORM pg_temp.conferir(v_n = ARRAY[2, 2], format('sobreposição/faixas: N = %s, esperado {2,2}', v_n));

    SELECT array_agg(m.n50 ORDER BY m.rota_idx) || array_agg(m.n150 ORDER BY m.rota_idx) INTO v_n
      FROM mobile_dados.medir_rotas(2, ARRAY[1, 1, 2, 2], ARRAY['NOITE', 'NOITE', 'NOITE', 'MADRUGADA'],
                                    ARRAY[v_t1, v_t2, v_t1, v_t2b], v_imp,
                                    DATE '2026-01-01', DATE '2026-09-30', 'poligono') AS m;
    PERFORM pg_temp.conferir(v_n = ARRAY[2, 2, 2, 2], format('sobreposição/faixas nos raios 50 e 150: %s', v_n));

    -- L = soma dos trechos originais (~0,51 + ~0,71 km), não a união (~1,02 km).
    v_soma  := round(((ST_Length(v_t1::geography) + ST_Length(v_t2::geography)) / 1000.0)::numeric, 2);
    v_uniao := round((ST_Length(ST_Union(v_t1, v_t2)::geography) / 1000.0)::numeric, 2);
    v_resp := mobile_api.comparar_exposicao(jsonb_build_array(
        pg_temp.rota('r1', jsonb_build_array(pg_temp.trecho(-23.55, -46.640, -46.635),
                                             pg_temp.trecho(-23.55, -46.637, -46.630))),
        pg_temp.rota('r2', jsonb_build_array(pg_temp.trecho(-23.55, -46.640, -46.635, 'NOITE'),
                                             pg_temp.trecho(-23.55, -46.635, -46.630, 'MADRUGADA')))));
    PERFORM pg_temp.conferir((v_resp #>> '{rotas,0,exposicao,kmAPe}')::numeric = v_soma AND v_soma > v_uniao,
        format('kmAPe = soma dos trechos (%s), não a união (%s)', v_soma, v_uniao));
    PERFORM pg_temp.conferir((v_resp #>> '{rotas,0,exposicao,registros}')::integer = 2
                             AND (v_resp #>> '{rotas,1,exposicao,registros}')::integer = 2,
        'mesmo BO (sint-101) conta nas duas rotas');
    -- Sem polígonos: cobertura NULL -> dados insuficientes por cobertura.
    PERFORM pg_temp.conferir_caso('sem polígonos', v_resp, 'INSUFICIENTE', 'COBERTURA', NULL);
    RAISE NOTICE 'ok: corredores sobrepostos, faixas por trecho e L sem união';
END;
$$;

-- -------------------------------------------------------------------------------------
-- 5. Rota sem trecho a pé (L = 0)
-- -------------------------------------------------------------------------------------
DO $$
DECLARE
    v_resp jsonb;
    v_r2   jsonb;
BEGIN
    PERFORM pg_temp.preparar(ARRAY[1, 0], ARRAY[0, 0], ARRAY[850, 850]);
    v_resp := mobile_api.comparar_exposicao(jsonb_build_array(
        pg_temp.rota('r1', jsonb_build_array(pg_temp.trecho(-23.55, -46.64, -46.63))),
        pg_temp.rota('r2', '[]'::jsonb)));
    PERFORM pg_temp.conferir_caso('L = 0', v_resp, 'NAO_APLICAVEL', NULL, NULL);
    v_r2 := v_resp -> 'rotas' -> 1;
    PERFORM pg_temp.conferir(v_r2 #> '{exposicao,registros}' = 'null'::jsonb
                             AND v_r2 #> '{exposicao,registrosPorKm}' = 'null'::jsonb
                             AND v_r2 #> '{exposicao,cobertura}' = 'null'::jsonb
                             AND (v_r2 #>> '{exposicao,kmAPe}')::numeric = 0,
        'L = 0: números de exposição null (não aplicável, nunca zero) e kmAPe 0');
    PERFORM pg_temp.conferir(v_r2 #> '{categorias,furto,total}' = 'null'::jsonb
                             AND v_r2 #> '{categorias,transito,total}' = 'null'::jsonb,
        'L = 0: categorias null');
    RAISE NOTICE 'ok: L = 0';
END;
$$;

-- -------------------------------------------------------------------------------------
-- 6. Decisões ponta a ponta (geometria -> contagem -> caso)
-- -------------------------------------------------------------------------------------
DO $$
DECLARE
    v_resp jsonb;
BEGIN
    -- Amostra: N_X + N_Y = 9 vs 10
    PERFORM pg_temp.preparar(ARRAY[1, 8], ARRAY[0, 0], ARRAY[850, 850]);
    v_resp := mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2));
    PERFORM pg_temp.conferir_caso('e2e amostra 9', v_resp, 'INSUFICIENTE', 'AMOSTRA', NULL);
    PERFORM pg_temp.conferir((v_resp #>> '{rotas,0,exposicao,registros}')::integer = 1
                             AND (v_resp #>> '{rotas,1,exposicao,registros}')::integer = 8, 'e2e amostra 9: contagens');

    PERFORM pg_temp.preparar(ARRAY[1, 9], ARRAY[0, 0], ARRAY[850, 850]);
    PERFORM pg_temp.conferir_caso('e2e amostra 10', mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2)),
                                  'CONCLUSIVO', NULL, 'r1');

    -- Cobertura 0,799 vs 0,80
    PERFORM pg_temp.preparar(ARRAY[1, 9], ARRAY[0, 0], ARRAY[799, 850]);
    PERFORM pg_temp.conferir_caso('e2e cobertura 0,799', mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2)),
                                  'INSUFICIENTE', 'COBERTURA', NULL);
    PERFORM pg_temp.preparar(ARRAY[1, 9], ARRAY[0, 0], ARRAY[800, 850]);
    PERFORM pg_temp.conferir_caso('e2e cobertura 0,80', mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2)),
                                  'CONCLUSIVO', NULL, 'r1');

    -- Diferença de cobertura 0,10 vs 0,101
    PERFORM pg_temp.preparar(ARRAY[1, 9], ARRAY[0, 0], ARRAY[800, 900]);
    PERFORM pg_temp.conferir_caso('e2e diferença 0,10', mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2)),
                                  'CONCLUSIVO', NULL, 'r1');
    PERFORM pg_temp.preparar(ARRAY[1, 9], ARRAY[0, 0], ARRAY[800, 901]);
    PERFORM pg_temp.conferir_caso('e2e diferença 0,101', mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2)),
                                  'INSUFICIENTE', 'COBERTURA', NULL);

    -- Vencedor muda com o raio: 100 m -> r1 (1 x 12); 150 m -> r2 (31 x 12)
    PERFORM pg_temp.preparar(ARRAY[1, 12], ARRAY[30, 0], ARRAY[850, 850]);
    PERFORM pg_temp.conferir_caso('e2e vencedor muda com o raio', mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2)),
                                  'INSUFICIENTE', 'LARGURA', NULL);

    -- Mistos (empate em N) e sem diferença
    PERFORM pg_temp.preparar(ARRAY[6, 6], ARRAY[0, 0], ARRAY[850, 850]);
    PERFORM pg_temp.conferir_caso('e2e empate', mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2)),
                                  'MISTOS', NULL, NULL);
    PERFORM pg_temp.preparar(ARRAY[4, 8], ARRAY[0, 0], ARRAY[850, 850]);
    PERFORM pg_temp.conferir_caso('e2e sem diferença', mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2)),
                                  'SEM_DIFERENCA', NULL, NULL);

    -- 3 e 5 candidatas
    PERFORM pg_temp.preparar(ARRAY[1, 12, 12], ARRAY[0, 0, 0], ARRAY[850, 850, 850]);
    PERFORM pg_temp.conferir_caso('e2e 3 candidatas', mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(3)),
                                  'CONCLUSIVO', NULL, 'r1');
    PERFORM pg_temp.preparar(ARRAY[12, 12, 12, 12, 1], ARRAY[0, 0, 0, 0, 0], ARRAY[850, 850, 850, 850, 850]);
    PERFORM pg_temp.conferir_caso('e2e 5 candidatas', mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(5)),
                                  'CONCLUSIVO', NULL, 'r5');
    PERFORM pg_temp.preparar(ARRAY[1, 12, 12, 12, 5], ARRAY[0, 0, 0, 0, 0], ARRAY[850, 850, 850, 850, 850]);
    PERFORM pg_temp.conferir_caso('e2e 5 candidatas, um par sem amostra',
                                  mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(5)),
                                  'INSUFICIENTE', 'AMOSTRA', NULL);
    RAISE NOTICE 'ok: decisões ponta a ponta';
END;
$$;

-- -------------------------------------------------------------------------------------
-- 7. Cobertura: polígonos (ponderada, cada circunscrição uma vez), tabela vazia,
--    circunscrição sem dado e modo proxy_pontos
-- -------------------------------------------------------------------------------------
DO $$
DECLARE
    v_imp  integer;
    v_cob  double precision;
    v_resp jsonb;
BEGIN
    v_imp := pg_temp.nova_importacao();
    DELETE FROM mobile_dados.circunscricao_area;
    INSERT INTO mobile_dados.circunscricao_area VALUES
        ('SINT-DP-O', ST_Multi(ST_MakeEnvelope(-46.650, -23.554, -46.635, -23.546, 4326)), 'sintético'),
        ('SINT-DP-L', ST_Multi(ST_MakeEnvelope(-46.635, -23.554, -46.620, -23.546, 4326)), 'sintético'),
        ('SINT-DP-Z', ST_Multi(ST_MakeEnvelope(-46.620, -23.554, -46.605, -23.546, 4326)), 'sintético');
    INSERT INTO mobile_dados.ssp_cobertura VALUES (v_imp, 'SINT-DP-O', 1000, 800), (v_imp, 'SINT-DP-L', 500, 300);
    -- (SINT-DP-Z sem linha em ssp_cobertura de propósito)

    -- Trecho 1 só em O; trecho 2 cruza O e L. Correto: (800+300)/(1000+500); O em dobro daria 0,76.
    SELECT m.cobertura INTO v_cob
      FROM mobile_dados.medir_rotas(1, ARRAY[1, 1], ARRAY['NOITE', 'NOITE'],
                                    ARRAY[pg_temp.linha(-23.55, -46.645, -46.640), pg_temp.linha(-23.55, -46.640, -46.630)],
                                    v_imp, DATE '2026-01-01', DATE '2026-09-30', 'poligono') AS m;
    PERFORM pg_temp.conferir(abs(v_cob - 1100.0 / 1500.0) < 1e-12,
        format('cobertura ponderada, cada circunscrição uma vez: %s', v_cob));

    -- Circunscrição atravessada sem dado de cobertura -> NULL (não média parcial).
    SELECT m.cobertura INTO v_cob
      FROM mobile_dados.medir_rotas(1, ARRAY[1], ARRAY['NOITE'], ARRAY[pg_temp.linha(-23.55, -46.625, -46.615)],
                                    v_imp, DATE '2026-01-01', DATE '2026-09-30', 'poligono') AS m;
    PERFORM pg_temp.conferir(v_cob IS NULL, 'circunscrição sem dado de cobertura -> NULL');

    -- Tabela de polígonos vazia -> cobertura NULL -> INSUFICIENTE/COBERTURA.
    PERFORM pg_temp.preparar(ARRAY[1, 9], ARRAY[0, 0], ARRAY[850, 850]);
    DELETE FROM mobile_dados.circunscricao_area;
    v_resp := mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2), 'poligono');
    PERFORM pg_temp.conferir_caso('polígonos vazios', v_resp, 'INSUFICIENTE', 'COBERTURA', NULL);
    PERFORM pg_temp.conferir(v_resp #> '{rotas,0,exposicao,cobertura}' = 'null'::jsonb
                             AND v_resp #> '{rotas,1,exposicao,cobertura}' = 'null'::jsonb,
        'polígonos vazios: cobertura null nas duas rotas');

    -- proxy_pontos [HIPÓTESE]: circunscrições dos pontos de ssp_bo no corredor de 100 m.
    v_resp := mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2), 'proxy_pontos');
    PERFORM pg_temp.conferir_caso('proxy_pontos', v_resp, 'CONCLUSIVO', NULL, 'r1');
    PERFORM pg_temp.conferir(abs((v_resp #>> '{rotas,0,exposicao,cobertura}')::double precision - 0.85) < 1e-12,
        'proxy_pontos: cobertura da rota 1 = 0,85');

    -- Ponto de QUALQUER natureza (aqui trânsito, sem faixa e sem data) traz outra circunscrição.
    v_imp := (SELECT id FROM mobile_dados.importacao WHERE ativa);
    INSERT INTO mobile_dados.ssp_cobertura VALUES (v_imp, 'SINT-DP-X', 1000, 500);
    PERFORM pg_temp.bo(v_imp, 'sint-201', 'LESÃO CORPORAL CULPOSA POR ACIDENTE DE TRÂNSITO',
                       -23.55 - 0.00027, -46.635, NULL, NULL, 'SINT-DP-X');
    v_resp := mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2), 'proxy_pontos');
    PERFORM pg_temp.conferir(abs((v_resp #>> '{rotas,0,exposicao,cobertura}')::double precision - 1350.0 / 2000.0) < 1e-12,
        'proxy_pontos: ponto de outra natureza entra na cobertura');
    PERFORM pg_temp.conferir_caso('proxy_pontos com 0,675', v_resp, 'INSUFICIENTE', 'COBERTURA', NULL);

    -- Ponto a ~130 m (fora do corredor de 100 m) não entra no proxy.
    PERFORM pg_temp.bo(v_imp, 'sint-202', 'FURTO - OUTROS', -23.55 - 0.00117, -46.635, 'NOITE', DATE '2026-05-10', 'SINT-DP-SEM-DADO');
    v_resp := mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2), 'proxy_pontos');
    PERFORM pg_temp.conferir(v_resp #> '{rotas,0,exposicao,cobertura}' <> 'null'::jsonb,
        'proxy_pontos: ponto fora do corredor de 100 m não entra');

    -- Ponto a ~30 m com circunscrição sem dado -> cobertura NULL.
    PERFORM pg_temp.bo(v_imp, 'sint-203', 'FURTO - OUTROS', -23.55 - 0.00027, -46.633, 'NOITE', DATE '2026-05-10', 'SINT-DP-SEM-DADO');
    v_resp := mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2), 'proxy_pontos');
    PERFORM pg_temp.conferir(v_resp #> '{rotas,0,exposicao,cobertura}' = 'null'::jsonb,
        'proxy_pontos: circunscrição sem dado -> cobertura null');
    RAISE NOTICE 'ok: cobertura';
END;
$$;

-- -------------------------------------------------------------------------------------
-- 8. Período, data de atualização, panorama municipal e INDISPONIVEL
-- -------------------------------------------------------------------------------------
DO $$
DECLARE
    v_imp  integer;
    v_resp jsonb;
BEGIN
    v_imp := pg_temp.preparar(ARRAY[1, 9], ARRAY[0, 0], ARRAY[850, 850]);
    INSERT INTO mobile_dados.ssp_panorama VALUES
        (v_imp, 'HOMICÍDIO DOLOSO', 123),
        (v_imp, 'TENTATIVA DE HOMICÍDIO', 0);
    v_resp := mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2));
    PERFORM pg_temp.conferir(v_resp #>> '{periodo,inicio}' = '2026-01-01' AND v_resp #>> '{periodo,fim}' = '2026-09-30'
                             AND (v_resp #>> '{periodo,meses}')::integer = 9, 'período jan–set = 9 meses');
    PERFORM pg_temp.conferir(v_resp ->> 'atualizacao_ssp' = '2026-10-15', 'atualizacao_ssp (AAAA-MM-DD)');
    PERFORM pg_temp.conferir((v_resp #>> '{panoramaMunicipal,homicidioDoloso}')::integer = 123
                             AND (v_resp #>> '{panoramaMunicipal,tentativaHomicidio}')::integer = 0
                             AND v_resp #> '{panoramaMunicipal,estupro}' = 'null'::jsonb
                             AND v_resp #> '{panoramaMunicipal,estuproVulneravel}' = 'null'::jsonb,
        'panorama: valor presente devolvido; ausente = null, nunca 0');

    -- Sem importação ativa -> INDISPONIVEL, números null, kmAPe ainda presente.
    UPDATE mobile_dados.importacao SET ativa = false WHERE ativa;
    v_resp := mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2));
    PERFORM pg_temp.conferir_caso('sem importação ativa', v_resp, 'INDISPONIVEL', NULL, NULL);
    PERFORM pg_temp.conferir(v_resp #> '{rotas,0,exposicao,registros}' = 'null'::jsonb
                             AND v_resp #> '{rotas,0,exposicao,cobertura}' = 'null'::jsonb
                             AND v_resp #> '{rotas,0,categorias,roubo,latrocinio}' = 'null'::jsonb
                             AND (v_resp #>> '{rotas,0,exposicao,kmAPe}')::numeric > 1,
        'INDISPONIVEL: números null, kmAPe presente');
    PERFORM pg_temp.conferir(v_resp #> '{periodo,meses}' = 'null'::jsonb
                             AND v_resp #> '{panoramaMunicipal,homicidioDoloso}' = 'null'::jsonb,
        'INDISPONIVEL: período e panorama null');
    RAISE NOTICE 'ok: período, panorama e INDISPONIVEL';
END;
$$;

-- -------------------------------------------------------------------------------------
-- 9. Validação da entrada (erro 22023, sem repetir valores recebidos)
-- -------------------------------------------------------------------------------------
DO $$
DECLARE
    v_trecho     jsonb := pg_temp.trecho(-23.55, -46.64, -46.63);
    v_poly       text  := pg_temp.trecho(-23.55, -46.64, -46.63) ->> 'geometria';
    v_grande     text;
    v_metade     text;
    v_resp       jsonb;
BEGIN
    PERFORM pg_temp.preparar(ARRAY[1, 9], ARRAY[0, 0], ARRAY[850, 850]);

    PERFORM pg_temp.espera_recusa('zero rotas', '[]'::jsonb, 'poligono', NULL);
    PERFORM pg_temp.espera_recusa('seis rotas', pg_temp.rotas_paralelas(6), 'poligono', NULL);
    PERFORM pg_temp.espera_recusa('não é array', '{"id":"r1"}'::jsonb, 'poligono', NULL);
    PERFORM pg_temp.espera_recusa('modo inválido', pg_temp.rotas_paralelas(2), 'outro_modo', 'outro_modo');
    PERFORM pg_temp.espera_recusa('ids repetidos',
        jsonb_build_array(pg_temp.rota('rx', jsonb_build_array(v_trecho)), pg_temp.rota('rx', '[]'::jsonb)),
        'poligono', 'rx');
    PERFORM pg_temp.espera_recusa('id não textual', '[{"id": 7, "trechos_a_pe": []}]'::jsonb, 'poligono', NULL);
    PERFORM pg_temp.espera_recusa('sem trechos_a_pe', '[{"id": "r1"}]'::jsonb, 'poligono', NULL);
    PERFORM pg_temp.espera_recusa('faixa inválida',
        jsonb_build_array(pg_temp.rota('r1', jsonb_build_array(jsonb_build_object('geometria', v_poly, 'faixa', 'NOITINHA')))),
        'poligono', v_poly);
    PERFORM pg_temp.espera_recusa('faixa ausente',
        jsonb_build_array(pg_temp.rota('r1', jsonb_build_array(jsonb_build_object('geometria', v_poly)))),
        'poligono', v_poly);
    PERFORM pg_temp.espera_recusa('geometria não decodificável',
        jsonb_build_array(pg_temp.rota('r1', jsonb_build_array(jsonb_build_object('geometria', '!!!!', 'faixa', 'NOITE')))),
        'poligono', '!!!!');

    -- Limite de vértices por rota (5000): um trecho com 5001 vértices é recusado...
    SELECT ST_AsEncodedPolyline(ST_SetSRID(ST_MakeLine(array_agg(ST_MakePoint(-46.64 + g * 0.00001, -23.55) ORDER BY g)), 4326), 5)
      INTO v_grande FROM generate_series(0, 5000) AS g;
    PERFORM pg_temp.espera_recusa('5001 vértices',
        jsonb_build_array(pg_temp.rota('r1', jsonb_build_array(jsonb_build_object('geometria', v_grande, 'faixa', 'NOITE')))),
        'poligono', v_grande);
    -- ... e dois trechos de 2500 (= 5000) são aceitos.
    SELECT ST_AsEncodedPolyline(ST_SetSRID(ST_MakeLine(array_agg(ST_MakePoint(-46.64 + g * 0.00001, -23.55) ORDER BY g)), 4326), 5)
      INTO v_metade FROM generate_series(0, 2499) AS g;
    v_resp := mobile_api.comparar_exposicao(jsonb_build_array(pg_temp.rota('r1', jsonb_build_array(
        jsonb_build_object('geometria', v_metade, 'faixa', 'NOITE'),
        jsonb_build_object('geometria', v_metade, 'faixa', 'NOITE')))));
    PERFORM pg_temp.conferir(v_resp ->> 'caso' = 'SEM_COMPARACAO', '5000 vértices por rota são aceitos');
    RAISE NOTICE 'ok: validação da entrada';
END;
$$;

-- -------------------------------------------------------------------------------------
-- 10. A função não grava nada
-- -------------------------------------------------------------------------------------
DO $$
DECLARE
    v_antes  bigint;
    v_depois bigint;
BEGIN
    PERFORM pg_temp.preparar(ARRAY[1, 9], ARRAY[0, 0], ARRAY[850, 850]);
    SELECT coalesce(sum(n_tup_ins + n_tup_upd + n_tup_del), 0) INTO v_antes
      FROM pg_stat_xact_user_tables WHERE schemaname IN ('mobile_dados', 'mobile_api', 'public');
    PERFORM mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2));
    PERFORM mobile_api.comparar_exposicao(pg_temp.rotas_paralelas(2), 'proxy_pontos');
    SELECT coalesce(sum(n_tup_ins + n_tup_upd + n_tup_del), 0) INTO v_depois
      FROM pg_stat_xact_user_tables WHERE schemaname IN ('mobile_dados', 'mobile_api', 'public');
    PERFORM pg_temp.conferir(v_antes = v_depois, 'comparar_exposicao não pode inserir, alterar nem apagar linhas');
    RAISE NOTICE 'ok: nenhuma escrita';
END;
$$;

DO $$ BEGIN RAISE NOTICE 'B-06: todos os testes passaram (dados sintéticos; ROLLBACK a seguir)'; END $$;

ROLLBACK;
