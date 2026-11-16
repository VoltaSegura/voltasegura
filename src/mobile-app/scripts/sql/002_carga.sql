-- =====================================================================================
-- VoltaSegura · B-06 · 002_carga.sql
-- Carga de uma importação SSP-SP a partir dos arquivos gerados pelo importador.
--
-- AVISO: este arquivo NÃO foi executado (não há Postgres/PostGIS nesta máquina). Aplicar
-- e conferir na branch `dev` do Neon. Requer 001_esquema.sql.
--
-- Contrato com o importador (outro worker). Arquivos UTF-8, CSV com cabeçalho, separador
-- vírgula, datas ISO (AAAA-MM-DD), campo vazio = NULL. Colunas EXATAMENTE nesta ordem:
--   ssp_bo.csv        : chave_bo,natureza,data_ocorrencia,faixa,lat,lon,circunscricao,tipo_local
--   ssp_cobertura.csv : circunscricao,elegiveis_total,elegiveis_coord_faixa
--   ssp_panorama.csv  : natureza,total
--   importacao.json   : {"fonte", "arquivo_sha256", "periodo_inicio", "periodo_fim",
--                        "linhas_lidas", "linhas_validas", "gerado_em"}
-- `natureza` deve vir com a grafia literal da SSP (NATUREZA_APURADA), com acentos em NFC,
-- p.ex. 'FURTO DE VEÍCULO', 'LATROCÍNIO'. `faixa` em MADRUGADA|MANHA|TARDE|NOITE ou vazia.
-- `lat`/`lon` em graus decimais WGS84 (ambos vazios = sem coordenada).
--
-- Uso (psql, com ON_ERROR_STOP): parte A uma vez; parte B a cada carga.
-- =====================================================================================

SET client_encoding = 'UTF8';

-- -------------------------------------------------------------------------------------
-- PARTE A — tabelas de estágio (idempotente). Mesmo schema privado: não são expostas.
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mobile_dados.ssp_bo_estagio (
    chave_bo         text,
    natureza         text,
    data_ocorrencia  date,
    faixa            text,
    lat              double precision,
    lon              double precision,
    circunscricao    text,
    tipo_local       text
);

CREATE TABLE IF NOT EXISTS mobile_dados.ssp_cobertura_estagio (
    circunscricao          text,
    elegiveis_total        int,
    elegiveis_coord_faixa  int
);

CREATE TABLE IF NOT EXISTS mobile_dados.ssp_panorama_estagio (
    natureza  text,
    total     int
);

-- importacao.json é lido linha a linha (preserva a ordem pelo bigserial) e remontado.
CREATE TABLE IF NOT EXISTS mobile_dados.importacao_estagio (
    linha  bigserial,
    texto  text
);

REVOKE ALL ON mobile_dados.ssp_bo_estagio, mobile_dados.ssp_cobertura_estagio,
              mobile_dados.ssp_panorama_estagio, mobile_dados.importacao_estagio FROM PUBLIC;

-- -------------------------------------------------------------------------------------
-- Publicação: valida o estágio, grava a nova importação e a ATIVA desativando a anterior.
-- Roda dentro da transação de quem chama (parte B): tudo ou nada. Esvazia o estágio no fim.
-- Devolve o id da nova importação.
-- -------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION mobile_dados.publicar_importacao()
RETURNS integer
LANGUAGE plpgsql
SET search_path = mobile_dados, public, pg_temp
AS $$
DECLARE
    v_texto   text;
    v_meta    jsonb;
    v_id      integer;
    v_qtd     bigint;
BEGIN
    -- 1. Metadados (importacao.json)
    SELECT string_agg(texto, E'\n' ORDER BY linha) INTO v_texto FROM mobile_dados.importacao_estagio;
    IF v_texto IS NULL THEN
        RAISE EXCEPTION 'carga: importacao.json não foi carregado no estágio';
    END IF;
    BEGIN
        v_meta := v_texto::jsonb;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'carga: importacao.json não é um JSON válido';
    END;
    IF jsonb_typeof(v_meta) IS DISTINCT FROM 'object'
       OR NOT (v_meta ?& ARRAY['fonte', 'arquivo_sha256', 'periodo_inicio', 'periodo_fim',
                               'linhas_lidas', 'linhas_validas', 'gerado_em']) THEN
        RAISE EXCEPTION 'carga: importacao.json sem os campos obrigatórios do contrato';
    END IF;

    -- 2. Boletins
    SELECT count(*) INTO v_qtd FROM mobile_dados.ssp_bo_estagio;
    IF v_qtd = 0 THEN
        RAISE EXCEPTION 'carga: ssp_bo.csv vazio';
    END IF;
    IF EXISTS (SELECT 1 FROM mobile_dados.ssp_bo_estagio
               WHERE chave_bo IS NULL OR natureza IS NULL) THEN
        RAISE EXCEPTION 'carga: ssp_bo.csv com chave_bo ou natureza vazia';
    END IF;
    IF EXISTS (SELECT 1 FROM mobile_dados.ssp_bo_estagio
               WHERE faixa IS NOT NULL AND faixa NOT IN ('MADRUGADA', 'MANHA', 'TARDE', 'NOITE')) THEN
        RAISE EXCEPTION 'carga: ssp_bo.csv com faixa fora de MADRUGADA|MANHA|TARDE|NOITE';
    END IF;
    IF EXISTS (SELECT 1 FROM mobile_dados.ssp_bo_estagio
               WHERE (lat IS NULL) <> (lon IS NULL)
                  OR lat NOT BETWEEN -90 AND 90 OR lon NOT BETWEEN -180 AND 180) THEN
        RAISE EXCEPTION 'carga: ssp_bo.csv com lat/lon incompletos ou fora do intervalo';
    END IF;
    IF EXISTS (SELECT 1 FROM mobile_dados.ssp_bo_estagio
               GROUP BY chave_bo, natureza HAVING count(*) > 1) THEN
        RAISE EXCEPTION 'carga: ssp_bo.csv com (chave_bo, natureza) repetido; deduplicar no importador';
    END IF;

    -- 3. Cobertura
    IF NOT EXISTS (SELECT 1 FROM mobile_dados.ssp_cobertura_estagio) THEN
        RAISE EXCEPTION 'carga: ssp_cobertura.csv vazio';
    END IF;
    IF EXISTS (SELECT 1 FROM mobile_dados.ssp_cobertura_estagio
               WHERE circunscricao IS NULL OR elegiveis_total IS NULL OR elegiveis_coord_faixa IS NULL
                  OR elegiveis_total < 0 OR elegiveis_coord_faixa < 0
                  OR elegiveis_coord_faixa > elegiveis_total) THEN
        RAISE EXCEPTION 'carga: ssp_cobertura.csv com valores ausentes ou incoerentes';
    END IF;

    -- 4. Panorama (pode faltar alguma natureza: a função devolve null, nunca 0)
    IF EXISTS (SELECT 1 FROM mobile_dados.ssp_panorama_estagio
               WHERE natureza IS NULL OR total IS NULL OR total < 0) THEN
        RAISE EXCEPTION 'carga: ssp_panorama.csv com valores ausentes ou negativos';
    END IF;
    IF EXISTS (SELECT 1 FROM mobile_dados.ssp_panorama_estagio
               WHERE natureza NOT IN ('HOMICÍDIO DOLOSO', 'TENTATIVA DE HOMICÍDIO',
                                      'ESTUPRO', 'ESTUPRO DE VULNERÁVEL')) THEN
        RAISE EXCEPTION 'carga: ssp_panorama.csv com natureza fora das quatro do panorama (docs/07)';
    END IF;

    -- 5. Grava a importação (ainda inativa)
    INSERT INTO mobile_dados.importacao
        (fonte, arquivo_sha256, periodo_inicio, periodo_fim, linhas_lidas, linhas_validas, gerado_em, ativa)
    VALUES (
        v_meta ->> 'fonte',
        lower(v_meta ->> 'arquivo_sha256'),
        (v_meta ->> 'periodo_inicio')::date,
        (v_meta ->> 'periodo_fim')::date,
        (v_meta ->> 'linhas_lidas')::int,
        (v_meta ->> 'linhas_validas')::int,
        (v_meta ->> 'gerado_em')::timestamptz,
        false
    )
    RETURNING id INTO v_id;

    IF EXISTS (SELECT 1 FROM mobile_dados.importacao
               WHERE id <> v_id AND arquivo_sha256 = lower(v_meta ->> 'arquivo_sha256')) THEN
        RAISE NOTICE 'carga: o mesmo arquivo (sha256) já tinha sido importado antes; seguindo';
    END IF;

    -- 6. Copia o estágio, convertendo lat/lon em ponto (lon primeiro: ST_MakePoint(x, y))
    INSERT INTO mobile_dados.ssp_bo
        (importacao_id, chave_bo, natureza, data_ocorrencia, faixa, geom, circunscricao, tipo_local)
    SELECT v_id, e.chave_bo, e.natureza, e.data_ocorrencia, e.faixa,
           CASE WHEN e.lat IS NOT NULL AND e.lon IS NOT NULL
                THEN ST_SetSRID(ST_MakePoint(e.lon, e.lat), 4326) END,
           e.circunscricao, e.tipo_local
    FROM mobile_dados.ssp_bo_estagio AS e;

    INSERT INTO mobile_dados.ssp_cobertura (importacao_id, circunscricao, elegiveis_total, elegiveis_coord_faixa)
    SELECT v_id, c.circunscricao, c.elegiveis_total, c.elegiveis_coord_faixa
    FROM mobile_dados.ssp_cobertura_estagio AS c;

    INSERT INTO mobile_dados.ssp_panorama (importacao_id, natureza, total)
    SELECT v_id, p.natureza, p.total
    FROM mobile_dados.ssp_panorama_estagio AS p;

    -- 7. Troca atômica: desativa a anterior e ativa a nova na MESMA transação.
    --    O índice único parcial importacao_uma_ativa impede duas ativas ao mesmo tempo.
    UPDATE mobile_dados.importacao SET ativa = false WHERE ativa AND id <> v_id;
    UPDATE mobile_dados.importacao SET ativa = true WHERE id = v_id;

    -- 8. Esvazia o estágio (não deixa cópia solta de microdados).
    TRUNCATE mobile_dados.ssp_bo_estagio, mobile_dados.ssp_cobertura_estagio,
             mobile_dados.ssp_panorama_estagio, mobile_dados.importacao_estagio;

    RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION mobile_dados.publicar_importacao() FROM PUBLIC;

-- -------------------------------------------------------------------------------------
-- PARTE B — a cada carga (psql). Descomentar, ajustar os caminhos e rodar o bloco inteiro.
-- `HEADER MATCH` (PostgreSQL 15+) recusa o arquivo se o cabeçalho não for o do contrato;
-- em versão anterior, trocar por `HEADER true`. FORCE_NULL faz "" (vazio entre aspas)
-- também virar NULL.
-- -------------------------------------------------------------------------------------
-- \set ON_ERROR_STOP on
-- BEGIN;
-- TRUNCATE mobile_dados.ssp_bo_estagio, mobile_dados.ssp_cobertura_estagio,
--          mobile_dados.ssp_panorama_estagio, mobile_dados.importacao_estagio;
--
-- \copy mobile_dados.ssp_bo_estagio (chave_bo,natureza,data_ocorrencia,faixa,lat,lon,circunscricao,tipo_local) FROM 'ssp_bo.csv' WITH (FORMAT csv, HEADER MATCH, ENCODING 'UTF8', FORCE_NULL (data_ocorrencia,faixa,lat,lon,circunscricao,tipo_local))
-- \copy mobile_dados.ssp_cobertura_estagio (circunscricao,elegiveis_total,elegiveis_coord_faixa) FROM 'ssp_cobertura.csv' WITH (FORMAT csv, HEADER MATCH, ENCODING 'UTF8')
-- \copy mobile_dados.ssp_panorama_estagio (natureza,total) FROM 'ssp_panorama.csv' WITH (FORMAT csv, HEADER MATCH, ENCODING 'UTF8')
-- -- JSON: cada linha do arquivo vira uma linha de texto (delimitador/aspas improváveis,
-- -- para nada do JSON ser interpretado pelo COPY).
-- \copy mobile_dados.importacao_estagio (texto) FROM 'importacao.json' WITH (FORMAT csv, DELIMITER E'\x01', QUOTE E'\x02', ENCODING 'UTF8')
--
-- SELECT mobile_dados.publicar_importacao() AS importacao_ativa;
-- COMMIT;
-- ANALYZE mobile_dados.ssp_bo;
-- ANALYZE mobile_dados.ssp_cobertura;
--
-- Conferência rápida depois do COMMIT (só agregados):
-- SELECT id, fonte, periodo_inicio, periodo_fim, linhas_lidas, linhas_validas, gerado_em
--   FROM mobile_dados.importacao WHERE ativa;
-- SELECT natureza, count(DISTINCT chave_bo) FROM mobile_dados.ssp_bo b
--   JOIN mobile_dados.importacao i ON i.id = b.importacao_id AND i.ativa GROUP BY natureza ORDER BY 1;
--
-- Opcional, para economizar espaço no plano Free (apaga importações antigas inativas):
-- DELETE FROM mobile_dados.importacao WHERE NOT ativa;   -- ON DELETE CASCADE nas filhas
