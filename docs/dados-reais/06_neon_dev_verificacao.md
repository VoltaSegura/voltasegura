# B-13: verificação do Neon `dev` (16/11/2026)

**Fonte:** console do Neon, informado pelo Lucas (texto colado; nenhuma credencial). Projeto `dark-bread-31601140`, branch `dev`. A `production` não foi tocada.
**Status:** `[DECISÃO]` fato observado no console · `[HIPÓTESE]` leitura do lead · `[EM ABERTO]` falta provar.

| Pergunta | Resposta | Status |
|---|---|---|
| Região | AWS South America East 1 (São Paulo), `aws-sa-east-1` | `[DECISÃO]` |
| Plano | Free, US$ 0/mês: 1 GB de armazenamento por projeto, autoscaling até 2 CU, 100 horas de computação, 10 branches (2 em uso) | `[DECISÃO]` |
| Restrição de IP | nenhuma | `[DECISÃO]` |
| PostGIS | disponível: `postgis` versão padrão 3.6.4 em `pg_available_extensions`; a coluna `installed_version` voltou sem valor, então **não instalado ainda** | `[DECISÃO]`; a leitura de "não instalado" é `[HIPÓTESE]` (a linha colada veio misturada com a resposta da Data API) |
| Data API | pode ser ativada na `dev`, ainda não está ativa | `[DECISÃO]` |

**Atualização 16/11:** `CREATE EXTENSION postgis` rodado na `dev` pelo Lucas; `postgis_version()` = `3.6 USE_GEOS=1 USE_PROJ=1 USE_STATS=1`. PostGIS **instalado** na `dev`. `[DECISÃO]`

## O que isso decide
- **Functions do Neon: fora.** A região é `sa-east-1`, que não está na lista de regiões com Functions (`docs/dados-reais/03_exposicao_neon.md`). Opção B descartada.
- **Opção A (função SQL com PostGIS exposta como RPC pela Data API): continua de pé.** PostGIS e Data API existem. Falta provar o JWT do Neon Auth na RPC (B-14) e a latência com a carga real. `[EM ABERTO]`
- **Opção E (API fina própria): contingência** se o B-14 falhar.
- **Cota de armazenamento:** a carga tem 281.966 linhas válidas. Estimativa grosseira de algumas dezenas a poucas centenas de MB com os índices GiST, abaixo de 1 GB. `[HIPÓTESE]`: medir com `pg_total_relation_size` no B-15 antes de carregar tudo. Lembrar que o 1 GB é do projeto inteiro (soma das branches).
- **Computação:** 100 h por mês com scale-to-zero; carga única e testes cabem. `[HIPÓTESE]`

## Próximo passo (B-14)
1. Ativar a Data API **na `dev`** e anotar a URL (sem colar chaves no chat).
2. Criar no `dev` uma função de teste trivial com dados sintéticos, sem tabelas da SSP.
3. Obter o JWT em `/token` do Neon Auth e chamar a RPC com `Authorization: Bearer <JWT>`. O cookie de sessão não serve.
4. Conferir que a mesma chamada sem JWT é recusada.

## B-14 provado (17/11/2026)
Teste feito pelo Lucas no PowerShell contra a branch `dev` (nenhum token ou URL registrado aqui). Função sintética `mobile_api.ping_teste()` (sem tabelas da SSP), `GRANT USAGE` no schema e `GRANT EXECUTE` na função só para o papel `authenticated`; schema `mobile_api` exposto na Data API e cache de schema atualizado. JWT obtido em `/token` do Neon Auth após login por e-mail (conta de teste criada só na `dev`; cabeçalho `Origin` enviado).

| Chamada | Resultado | Status |
|---|---|---|
| `POST /rpc/ping_teste` com `Authorization: Bearer <JWT>` e `Content-Profile: mobile_api` | HTTP 200, `{"ok": true, "origem": "sintetico"}` | `[DECISÃO]` observado |
| mesma chamada sem JWT | HTTP 401, `PGRST302` ("missing authentication credentials") | `[DECISÃO]` observado |

**Conclusão:** a Opção A (função SQL como RPC na Data API, protegida pelo JWT do Neon Auth) funciona na `dev`. Opção E (API fina própria) fica só como contingência. `[EM ABERTO]` falta a latência com a carga real (B-15) e o app chamar a RPC com o JWT da sessão. Regra mantida: **nunca expor `mobile_dados`** na Data API.

## B-15 provado pela Data API (17/11/2026)
Carga real na `dev` (importação 22: 279.048 linhas em `ssp_bo`, 94 circunscrições; `ssp_bo` 113 MB, banco total 129 MB de 1 GB). `GRANT USAGE` em `mobile_api` e `GRANT EXECUTE` em `comparar_exposicao(jsonb, text)` para `authenticated`. Chamada `POST /rpc/comparar_exposicao` com JWT do Neon Auth, duas rotas de exemplo a pé (linhas retas ilustrativas, faixa NOITE, região da Av. Paulista):

| Modo | HTTP | Resultado | Tempo |
|---|---|---|---|
| `poligono` | 200 | `INSUFICIENTE` / `COBERTURA` (sem polígonos de circunscrição) | 884 ms (primeira chamada, inclui partida a frio) |
| `proxy_pontos` | 200 | `SEM_DIFERENCA` (cobertura 91,1% e 91,9%; 234 e 206 registros em 0,75 e 0,78 km) | 57 ms |

`[DECISÃO]` do Lucas: usar `proxy_pontos` no MVP (`[HIPÓTESE]` do projeto, sem validação do grupo). `[EM ABERTO]` supressão de contagens pequenas; latência com rotas reais do OTP2 (rotas mais longas); trajetos de exemplo não são rotas reais.
