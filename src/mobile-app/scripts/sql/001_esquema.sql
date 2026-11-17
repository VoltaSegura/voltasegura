-- =====================================================================================
-- VoltaSegura · B-06 · 001_esquema.sql
-- Esquema da exposição estimada (PostgreSQL + PostGIS), alvo: branch `dev` do Neon.
--
-- AVISO: este arquivo NÃO foi executado. Foi escrito sem acesso a Postgres/PostGIS e
-- precisa ser aplicado e conferido na branch `dev` antes de qualquer uso (ver LEIA-ME.md).
--
-- Ordem de aplicação: 001_esquema.sql -> 002_carga.sql -> 003_exposicao.sql -> 004_testes.sql
--
-- Schemas:
--   mobile_dados : microdados da SSP-SP (boletins, cobertura, panorama). NUNCA expostos
--                  pela Data API nem a papéis de aplicação.
--   mobile_api   : apenas funções que devolvem agregados (003_exposicao.sql).
-- =====================================================================================

SET client_encoding = 'UTF8';

-- [EM ABERTO] Disponibilidade e privilégio para criar a extensão no projeto Neon atual
-- (docs/dados-reais/03_exposicao_neon.md §2). Conferir antes com:
--   SELECT name, default_version, installed_version FROM pg_available_extensions WHERE name = 'postgis';
-- A extensão é instalada no schema corrente (normalmente `public`); as funções deste
-- pacote usam `search_path = mobile_dados, public, pg_temp` contando com isso.
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE SCHEMA IF NOT EXISTS mobile_dados;
CREATE SCHEMA IF NOT EXISTS mobile_api;

COMMENT ON SCHEMA mobile_dados IS
    'VoltaSegura: microdados SSP-SP para a exposição estimada. Nunca expor pela Data API.';
COMMENT ON SCHEMA mobile_api IS
    'VoltaSegura: somente funções que devolvem agregados (sem pontos, sem ids de BO).';

-- -------------------------------------------------------------------------------------
-- Linhagem de cada carga. Exatamente uma importação pode estar ativa (índice parcial).
-- Não guarda trajetos, origem/destino nem nada de usuário.
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mobile_dados.importacao (
    id              serial PRIMARY KEY,
    fonte           text        NOT NULL,
    arquivo_sha256  text        NOT NULL CHECK (arquivo_sha256 ~ '^[0-9a-f]{64}$'),
    periodo_inicio  date        NOT NULL,
    periodo_fim     date        NOT NULL,
    linhas_lidas    int         CHECK (linhas_lidas IS NULL OR linhas_lidas >= 0),
    linhas_validas  int         CHECK (linhas_validas IS NULL OR linhas_validas >= 0),
    gerado_em       timestamptz NOT NULL,
    ativa           boolean     NOT NULL DEFAULT false,
    CONSTRAINT importacao_periodo_ok CHECK (periodo_fim >= periodo_inicio)
);

CREATE UNIQUE INDEX IF NOT EXISTS importacao_uma_ativa
    ON mobile_dados.importacao ((true)) WHERE ativa;

-- -------------------------------------------------------------------------------------
-- Boletins SSP-SP, uma linha por (boletim, natureza apurada).
-- chave_bo: boletim distinto (NUM_BO + ANO_BO + NOME_DELEGACIA, normalizado pelo importador;
--           docs/08 "Unidade de N = boletim distinto"). N usa COUNT(DISTINCT chave_bo).
-- faixa:    período SSP do boletim; NULL = sem hora/período utilizável (fica fora de N e
--           reduz a cobertura informada, docs/08).
-- geom:     coordenada publicada, sem filtro nem redistribuição; NULL = sem coordenada válida.
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mobile_dados.ssp_bo (
    importacao_id    int  NOT NULL REFERENCES mobile_dados.importacao (id) ON DELETE CASCADE,
    chave_bo         text NOT NULL,
    natureza         text NOT NULL,
    data_ocorrencia  date NULL,
    faixa            text NULL CHECK (faixa IN ('MADRUGADA', 'MANHA', 'TARDE', 'NOITE')),
    geom             geometry(Point, 4326) NULL,
    circunscricao    text NULL,
    tipo_local       text NULL,
    CONSTRAINT ssp_bo_unico UNIQUE (importacao_id, chave_bo, natureza)
);

-- Cobertura por circunscrição de delegacia (NOME_DELEGACIA_CIRCUNSCRICAO), calculada pelo
-- importador: boletins elegíveis (FURTO - OUTROS / ROUBO - OUTROS) no total e com
-- coordenada válida E faixa (docs/08 "Cobertura mínima").
CREATE TABLE IF NOT EXISTS mobile_dados.ssp_cobertura (
    importacao_id          int  NOT NULL REFERENCES mobile_dados.importacao (id) ON DELETE CASCADE,
    circunscricao          text NOT NULL,
    elegiveis_total        int  NOT NULL CHECK (elegiveis_total >= 0),
    elegiveis_coord_faixa  int  NOT NULL CHECK (elegiveis_coord_faixa >= 0),
    PRIMARY KEY (importacao_id, circunscricao),
    CONSTRAINT ssp_cobertura_coerente CHECK (elegiveis_coord_faixa <= elegiveis_total)
);

-- Panorama do MUNICÍPIO inteiro no período (docs/07: homicídio doloso, tentativa de
-- homicídio, estupro, estupro de vulnerável). Sem geometria e sem data: nunca é recortado
-- por rota, rua ou trecho e não entra na exposição estimada.
CREATE TABLE IF NOT EXISTS mobile_dados.ssp_panorama (
    importacao_id  int  NOT NULL REFERENCES mobile_dados.importacao (id) ON DELETE CASCADE,
    natureza       text NOT NULL,
    total          int  NOT NULL CHECK (total >= 0),
    PRIMARY KEY (importacao_id, natureza)
);

-- Limites das circunscrições. [EM ABERTO] Não existe, até agora, fonte de polígonos
-- auditada (docs/dados-reais/03_exposicao_neon.md §8 item 4). A tabela fica VAZIA; com ela
-- vazia, a cobertura no modo 'poligono' é NULL e a comparação vira "dados insuficientes".
CREATE TABLE IF NOT EXISTS mobile_dados.circunscricao_area (
    circunscricao  text PRIMARY KEY,
    geom           geometry(MultiPolygon, 4326),
    fonte          text
);

-- -------------------------------------------------------------------------------------
-- Índices
-- -------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS ssp_bo_geom_gist
    ON mobile_dados.ssp_bo USING gist (geom);
CREATE INDEX IF NOT EXISTS ssp_bo_recorte
    ON mobile_dados.ssp_bo (importacao_id, natureza, faixa, data_ocorrencia);
CREATE INDEX IF NOT EXISTS ssp_bo_circunscricao
    ON mobile_dados.ssp_bo (circunscricao);
CREATE INDEX IF NOT EXISTS circunscricao_area_geom_gist
    ON mobile_dados.circunscricao_area USING gist (geom);

-- -------------------------------------------------------------------------------------
-- Permissões
-- Nenhum papel de aplicação lê mobile_dados. O app (via Data API) só poderá EXECUTAR a
-- função mobile_api.comparar_exposicao(jsonb, text), que é SECURITY DEFINER e devolve
-- apenas agregados. Os GRANTs dessa função ficam em 003_exposicao.sql, comentados.
--
-- [EM ABERTO] Nome do papel autenticado: depende de como a Data API do Neon mapeia o JWT
-- do Neon Auth para um papel do Postgres (docs/dados-reais/03_exposicao_neon.md §5).
-- NÃO inventar o nome; substituir o placeholder <PAPEL_AUTENTICADO_DATA_API> só depois
-- de confirmar em `dev`. Também [EM ABERTO]: qual papel é o DONO das funções (deve ser
-- um papel com o mínimo necessário: SELECT em mobile_dados e nada além).
-- -------------------------------------------------------------------------------------
REVOKE ALL ON SCHEMA mobile_dados FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA mobile_dados FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA mobile_dados FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA mobile_dados REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA mobile_dados REVOKE ALL ON SEQUENCES FROM PUBLIC;

REVOKE ALL ON SCHEMA mobile_api FROM PUBLIC;

-- Funções: o EXECUTE para PUBLIC é um padrão GLOBAL do PostgreSQL e não pode ser revogado
-- por schema com ALTER DEFAULT PRIVILEGES ... IN SCHEMA. Por isso 002_carga.sql e
-- 003_exposicao.sql fazem REVOKE explícito logo após criar cada função.

-- Placeholder (NÃO executar enquanto o papel não estiver confirmado):
-- GRANT USAGE ON SCHEMA mobile_api TO <PAPEL_AUTENTICADO_DATA_API>;
-- (nenhum GRANT em mobile_dados para esse papel; nunca expor mobile_dados na Data API)
