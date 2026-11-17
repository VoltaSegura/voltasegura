-- B-15c: chamada de verificação com DUAS rotas de exemplo (a pé, faixa NOITE) na região da Av. Paulista.
-- Só agregados na saída. Os trajetos são linhas retas ilustrativas, não rotas reais do roteamento.
\set rotas '[{"id":"r1","trechos_a_pe":[{"geometria":"byxnC~nw{GzOoKvQoK","faixa":"NOITE"}]},{"id":"r2","trechos_a_pe":[{"geometria":"~wwnCvax{GvQoKvQoK","faixa":"NOITE"}]}]'

\echo '--- modo poligono (padrão) ---'
SELECT r -> 'caso' AS caso, r -> 'motivo' AS motivo,
       (r #> '{rotas,0,exposicao}') AS rota1, (r #> '{rotas,1,exposicao}') AS rota2
FROM (SELECT mobile_api.comparar_exposicao(:'rotas'::jsonb, 'poligono') AS r) t;

\echo '--- modo proxy_pontos ([HIPOTESE]) ---'
SELECT r -> 'caso' AS caso, r -> 'motivo' AS motivo,
       (r #> '{rotas,0,exposicao}') AS rota1, (r #> '{rotas,1,exposicao}') AS rota2,
       (r #> '{rotas,0,menorExposicao}') AS destaque1, (r #> '{rotas,1,menorExposicao}') AS destaque2
FROM (SELECT mobile_api.comparar_exposicao(:'rotas'::jsonb, 'proxy_pontos') AS r) t;
