# B-06 — Esquema SQL e função de exposição estimada (Neon `dev`)

> ⚠️ **AVISO: o SQL desta pasta NÃO foi executado.** Ele foi escrito numa máquina sem Postgres nem PostGIS, sem conexão com banco. Antes de qualquer uso, ele precisa ser aplicado e testado na **branch `dev` do Neon**, rodando `004_testes.sql` até o fim sem erro. Até lá, trate o código como rascunho revisado à mão, não como algo comprovado. Só a referência em Python foi executada (ver "Testes").

O que a função entrega é uma **exposição estimada** comparativa entre as alternativas avaliadas, contada a partir de boletins registrados (sujeitos a subnotificação) perto dos trechos a pé. Ela não é pontuação de rua nem probabilidade de vitimização. Zero registro não conta como vantagem: sem amostra, sem cobertura ou sem trecho a pé, nenhuma rota é destacada (`docs/05`, `docs/08`).

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `001_esquema.sql` | PostGIS, schemas `mobile_dados` (microdados, nunca expostos) e `mobile_api` (só funções), tabelas, índices e `REVOKE` |
| `002_carga.sql` | Tabelas de estágio, `mobile_dados.publicar_importacao()` (valida, grava e ativa de forma atômica) e os `\copy` comentados |
| `003_exposicao.sql` | `binomial_bilateral`, regra de decisão, parte espacial (`medir_rotas`) e `mobile_api.comparar_exposicao(jsonb, text)` |
| `004_testes.sql` | Testes com dados sintéticos dentro de `BEGIN … ROLLBACK`; qualquer divergência gera `RAISE EXCEPTION` |
| `referencia_exposicao.py` | Implementação de referência da decisão e do binomial (Python puro) |
| `test_referencia_exposicao.py` | Testes `unittest` da referência, usando o scipy como oráculo |

## Ordem de aplicação (branch `dev`)

1. `001_esquema.sql`, depois `002_carga.sql` (parte A), depois `003_exposicao.sql` e por fim `004_testes.sql`.
2. Use `psql` com `ON_ERROR_STOP`, apontando para a conexão **da branch `dev`**. Não imprima a URL nem a senha num terminal compartilhado:
   ```
   psql "<conexão da branch dev>" -v ON_ERROR_STOP=1 -f 001_esquema.sql
   psql "<conexão da branch dev>" -v ON_ERROR_STOP=1 -f 002_carga.sql
   psql "<conexão da branch dev>" -v ON_ERROR_STOP=1 -f 003_exposicao.sql
   psql "<conexão da branch dev>" -v ON_ERROR_STOP=1 -f 004_testes.sql
   ```
3. O `004_testes.sql` deve terminar com a mensagem `B-06: todos os testes passaram` e um `ROLLBACK`. Ele desativa a importação ativa e esvazia `circunscricao_area` **só dentro da transação**. O `SAVEPOINT` logo no início faz o script parar se o cliente estiver em autocommit.
4. Carga real: siga a **parte B** de `002_carga.sql` (descomentar os `\copy`, rodar o bloco `BEGIN … COMMIT` e depois `ANALYZE`).
5. Antes de mexer em `production`, a mesma migração e uma nova carga reprodutível. Uma branch não passa para a outra sozinha.

### Contrato com o importador (arquivos que a carga lê)

- `ssp_bo.csv`: `chave_bo,natureza,data_ocorrencia,faixa,lat,lon,circunscricao,tipo_local`
- `ssp_cobertura.csv`: `circunscricao,elegiveis_total,elegiveis_coord_faixa`
- `ssp_panorama.csv`: `natureza,total` (só as quatro naturezas do panorama)
- `importacao.json`: `fonte, arquivo_sha256, periodo_inicio, periodo_fim, linhas_lidas, linhas_validas, gerado_em`

Formato: UTF-8, CSV com cabeçalho exato (`HEADER MATCH`, PostgreSQL 15+), datas ISO, campo vazio = NULL. `natureza` vem com a grafia literal da SSP (acentos em NFC). O sha256 é hexadecimal de 64 caracteres.

## A função `mobile_api.comparar_exposicao(p_rotas jsonb, p_modo_cobertura text DEFAULT 'poligono')`

- **Entrada**: de 1 a 5 rotas, no formato `[{"id":"r1","trechos_a_pe":[{"geometria":"<polyline 5>","faixa":"NOITE"}]}]`. `trechos_a_pe` pode ser `[]`, o que significa L = 0.
- **Saída**: `{caso, motivo, periodo:{inicio,fim,meses}, atualizacao_ssp, rotas:[{id, menorExposicao, exposicao:{registros,kmAPe,registrosPorKm,cobertura}, categorias}], panoramaMunicipal:{…}}`. A saída não traz p-valor, ids de boletim nem pontos.
- **Recorte de N**: `FURTO - OUTROS` e `ROUBO - OUTROS`, um boletim distinto por rota, com faixa igual à do trecho, dentro do período da importação ativa e na união dos corredores de ±50/100/150 m. O buffer é feito em `geography`, com raio em metros. L é a soma dos trechos originais, não da união.
- **Privacidade**: a função não grava nada (o teste 10 confere isso). As mensagens de erro não repetem valores recebidos. Ela é `VOLATILE` de propósito: no PostgREST, funções STABLE também aceitam GET, e aí as geometrias iriam parar na URL.
- **Chamada via Data API** `[EM ABERTO]`: em PostgREST, seria `POST …/rpc/comparar_exposicao` com corpo `{"p_rotas": […]}`. URL, papel e JWT ainda precisam ser confirmados em `dev`.
- **Encaixe no contrato do app** (`src/mobile-app/src/services/tipos.ts`): a resposta preenche `caso`, `motivo`, `exposicao`, `categorias`, os números do panorama, o período e a data de atualização. Ficam com o serviço do app: o mapeamento `menorExposicao` → foco `MENOR_EXPOSICAO`, `sobreOsDados.fonte`, `atualizacao.gtfs` e `panoramaMunicipal.periodo` (que pode reaproveitar o `periodo`).

## Status das afirmações

### [DECISÃO] (vem de `docs/07` e `docs/08`, só implementado aqui)

- Naturezas de N, boletim distinto como unidade, as quatro faixas SSP e as faixas nulas fora de N.
- Corredor de ±100 m com sensibilidade obrigatória em ±50 m e ±150 m.
- Cobertura ≥ 80% em cada rota e diferença ≤ 10 p.p.; amostra N_X + N_Y ≥ 10.
- Teste binomial exato bilateral, condicional ao total, com p0 = L_X/(L_X+L_Y) e α = 0,05.
- Regra em pares: uma rota só é destacada se vencer **todas** as outras, entre até 5 candidatas.
- L = 0 dá "não aplicável" e nenhum destaque.
- Categorias e panorama municipal não entram na decisão.

### [HIPÓTESE] (proposta desta implementação, precisa de confirmação do grupo)

- **Precedência dentro do par**: COBERTURA → AMOSTRA → MISTOS → SEM_DIFERENCA → LARGURA → vencedor.
- **Agregação**: NAO_APLICAVEL > CONCLUSIVO > INSUFICIENTE (motivo COBERTURA > AMOSTRA > LARGURA) > MISTOS > SEM_DIFERENCA. Quando uma rota vence todos os seus pares, pares ruins entre as outras rotas não tiram o destaque dela.
- **Modo de cobertura `proxy_pontos`** (aguarda decisão do Lucas): usa as circunscrições dos pontos de `ssp_bo`, de qualquer natureza, faixa ou data, que caem no corredor de 100 m. O padrão é `'poligono'`. Também em aberto: se o app deve poder escolher esse parâmetro ou se ele deve ficar fixo no servidor.
- **Ponderação da cobertura**: soma(elegiveis_coord_faixa) / soma(elegiveis_total) das circunscrições distintas da rota. `docs/08` não fixa como ponderar.
- **Independência do teste**: corredores que se sobrepõem, e um mesmo boletim contado em duas rotas, podem violar a independência Poisson que o teste supõe. O efeito precisa ser avaliado com trajetos reais.

### [EM ABERTO] (não apresentar como resolvido)

- **Papel autenticado da Data API e permissões**: o nome do papel não foi inventado; os `GRANT` estão comentados com `<PAPEL_AUTENTICADO_DATA_API>`. Também falta definir qual papel mínimo será dono das funções `SECURITY DEFINER`.
- **Limiar de supressão de contagens pequenas** (`docs/07`, `docs/dados-reais/03` §8 item 6): **não foi definido nem implementado**. As parcelas por rota saem sem supressão e precisam ser revisadas antes de publicar dados reais.
- **Polígonos das circunscrições**: não há fonte auditada. A tabela `circunscricao_area` fica vazia, então no modo `'poligono'` toda comparação real resulta em `INSUFICIENTE/COBERTURA`.
- PostGIS disponível e com privilégio no projeto; região, cotas e Data API (`docs/dados-reais/03` §2).
- Logs da Data API e do Neon: verificar se guardam corpo, parâmetros ou IP. Inspecionar com pontos sintéticos antes de enviar rotas reais.
- Validação com trajetos reais de várias regiões (`docs/08`).

## Decisões técnicas deste pacote (ajustáveis; não são metodologia)

- Limites de entrada: 5 rotas, 5000 vértices por rota, 50 trechos a pé por rota, polyline de até 100000 caracteres, id de 1 a 64 caracteres.
- A polyline precisa ser **canônica**: decodificar e recodificar tem de devolver o mesmo texto, o que barra lixo que por acaso decodifica em coordenadas válidas. Se em `dev` alguma polyline legítima do roteamento for recusada, revise essa checagem.
- Tolerância `1e-9` ao comparar coberturas em ponto flutuante (0,93 − 0,83 = 0,10000000000000009).
- Termos do binomial com ln(pmf) ≤ −700 são ignorados, porque no PostgreSQL `exp()` gera erro de underflow. Isso não afeta a decisão com α = 0,05.
- Se uma circunscrição atravessada não tiver dado em `ssp_cobertura`, a cobertura da rota fica NULL; não se calcula média parcial.
- **Rota com L = 0**: `registros`, `registrosPorKm`, `cobertura` e `categorias` saem `null` ("não aplicável") e `kmAPe` sai 0. ⚠️ Isso difere da fixture de exemplo `services/fixtures/nao_aplicavel.ts`, que mostra `registros: 0` e categorias preenchidas. Decidir qual das duas vale.
- `kmAPe` e `registrosPorKm` são arredondados para 2 casas só na saída; a decisão usa os valores completos. A `cobertura` sai sem arredondamento.
- `periodo.meses` conta os meses do calendário entre início e fim, inclusive (jan–set = 9). `atualizacao_ssp` é a data de `gerado_em` no fuso America/Sao_Paulo.
- A carga recusa `(chave_bo, natureza)` repetido, faixa fora das quatro, lat/lon incompletos e naturezas de panorama fora das quatro previstas.

## Testes

- **Python (executado)**: rode a partir da raiz do repositório.
  ```
  python -m unittest discover -s src/mobile-app/scripts/sql -p "test_*.py" -v
  ```
  Ele compara o binomial próprio com `scipy.stats.binomtest` numa grade completa até n = 100, em pontos com n = 2000 e em 300 casos aleatórios. Também roda os 28 casos de decisão, a invariância à ordem das rotas e a validação de domínio.
- **SQL (não executado)**: `004_testes.sql` repete os mesmos 28 casos de decisão e os 19 p-valores de referência (gerados com scipy 1.15.2 e colados no arquivo). Além disso, cobre os testes geométricos: raios 50/100/150, filtros de N, boletim com duas naturezas, corredores sobrepostos, faixas por trecho, L = 0, amostra 9 vs 10, cobertura 0,799 vs 0,80, diferença 0,10 vs 0,101, vencedor que muda com o raio, 3 e 5 candidatas, os dois modos de cobertura, INDISPONIVEL, panorama, validação de entrada e ausência de escrita.
