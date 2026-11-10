# Registro de Prompts de IA (`prompts.md`)

> **Exigência da GS FIAP 2026.2**: a IA é permitida como copiloto, para aprender e revisar. **Todo** uso de IA no projeto deve ser registrado aqui (data, objetivo, ferramenta/agente, resumo do prompt e resultado), e cada integrante deve saber explicar o código resultante.

## Registro

| Data | Quem | Ferramenta/Agente | Objetivo | Resumo do prompt / resultado | Evidência (arquivos/PR) |
|---|---|---|---|---|---|
| 2026-11-10 | Grupo (via assistente T3 Code) | agente de código (GLM) | Extrair os 2 documentos de origem (DOCX + PDF) | Extração texto do Documento Vivo e do briefing da GS; PDF lido com `uv` + `pypdf` | `docs/` |
| 2026-11-10 | Grupo (via assistente T3 Code) | agente de código (GLM) | Criar base de conhecimento markdown para agentes | Geração de `docs/01…06` como arquivos estruturados (frontmatter, status, guardrails) | `docs/01…06`, `AGENTS.md` |
| 2026-11-10 | Grupo (via assistente T3 Code) | agente de código (GLM) | Renomear produto CitizenTech → VoltaSegura | Edição consistente em todos os docs; "CitizenTech" mantido apenas para tema da GS/Fonte oficial | todos os `.md` |
| 2026-11-10 | Grupo (via assistente T3 Code) | agente de código (GLM) | Organizar repo para a organização GitHub | `README.md` com Ficha preenchida, estrutura de pastas por disciplina, `.gitignore`, `prompts.md`, commit inicial e remote | este arquivo, `README.md` |
| 2026-11-10 | Grupo (via assistente T3 Code) | agente de código (GLM) | Provisionar organização GitHub | Criação via REST API (autenticada com PAT fornecido pelo grupo) do monorepo `voltasegura` + 8 repos-espelho de entrega por disciplina (soa-backend, csharp-backend, ml, mobile-app, os-infra, physical-computing, qa, cybersecurity), todos privados, com docs, AGENTS.md, prompts e push | 9 repos em github.com/VoltaSegura |
| 2026-11-10 | Grupo (via assistente T3 Code) | agente de código (GLM) | Script de sincronização | `scripts/sync_mirrors.sh`: replica docs 01–06, .gitignore, src/<disciplina> e regenera o README dos espelhos; commit automático com SHA do monorepo; suporta dry-run e seleção de disciplinas | `scripts/sync_mirrors.sh` |
| 2026-11-10 | Grupo (via assistente T3 Code) | agente de código (GLM) | 1ª auditoria de fontes de dados (Fase 0) | Pesquisa/fetch nas fontes: SSP-SP (CKAN CC-BY-4.0, painel, consultas), GeoSampa (metadados ISO + teste WFS ao vivo: 662.945 pontos IP), SPTrans (doc API v2.1 + download GTFS real: 1.365 rotas incl. 9 Metrô + 7 CPTM, 22.273 paradas), Infosiga (CC-BY-4.0). Atualização de `docs/04`, `docs/06`, `src/ml/dados/README.md` | `docs/04`, `src/ml/dados/README.md` |
| 2026-11-10 | Grupo (via assistente T3 Code) | agente de código (GLM) | Validação ao vivo da API Olho Vivo | Token fornecido pelo grupo em `.env` (fora do git); autenticação + 4 endpoints testados (login OK com body vazio — HTTP sem body = 411; `/Linha/Buscar` 4 variantes da linha 8000; `/Corredor` 7 corredores; `/Posicao` 1.730 linhas, 4.218 veículos às 04h38, flag de acessibilidade). Script reproduzível `scripts/olhovivo_check.sh` + `.env.example` | `docs/04 §2.2`, `docs/06`, `scripts/olhovivo_check.sh` |
| 2026-11-10 | Grupo (download) + assistente (T3 Code / GLM) | agente de código (GLM) | Registro dos datasets reais (SSP-SP + Infosiga) | Inspeção dos arquivos fornecidos pelo grupo em `utils/ssp/` e `utils/infosiga/` (abas, colunas, granularidade, período); SHA256 de cada arquivo; dicionários Infosiga v1.8 + diagrama ER + fluxograma versionados em `src/ml/dados/documentacao/`; .gitignore bloqueando os brutos (70–336 MB); atualização de `docs/04` (matriz: SSP/Infosiga ✅), `docs/06` e `src/ml/dados/README.md` | `docs/04`, `docs/06`, `src/ml/dados/` |
| 2026-11-10 | Grupo (via assistente T3 Code) | agente de código (GLM) | Planejar o prompt da logo do VoltaSegura | Análise do posicionamento e das guardrails (`docs/03`/`docs/05`); conceito escolhido: **"V" formado por rota contínua terminando em pino** (a volta para casa por decisão, sem prometer segurança); exclusões explícitas de escudo/cadeado/triângulo de alerta; 3 direções discutidas, 1 escolhida com o grupo | `design/prompts/` |
| 2026-11-10 | Grupo (via assistente T3 Code) | OpenRouter Image API (`gpt-image-2.5-sunburst`) via script `projects/util/img_gerar.py` | Gerar os rascunhos v1 da marca | 2 variantes (1:1, high): com wordmark `VoltaSegura` e ícone puro; sem escudo/cadeado, conforme guardrails; custo total US$ 0.109 (ledger em `design/ledger.jsonl`; chave da API em `projects/util/.env`, fora de qualquer repo) | `design/logo_v1_wordmark.png`, `design/logo_v1_icone.png`, `design/prompts/` |
| 2026-11-10 | Grupo (via assistente T3 Code) | OpenRouter Image API (`recraft/recraft-v4.1-flash`, US$ 0,007/img) via `projects/util/img_gerar.py` | Exploração de conceitos + iteração com nova paleta | 9 gerações baratas (5 conceitos v2 + 4 iterações v3 do conceito "rotas comparadas"); paleta preto/laranja questionada pelo grupo (associação indesejada); proposta "Noite + Luz do caminho" (navy `#0D1B2A` + âmbar `#FFB627` + ciano `#4ECDC4`); favorita provisória: 3b (rotas bicor, âmbar × ciano) | `design/v2/`, `design/v3/`, `design/prompts/`, ledgers em `design/v*/ledger.jsonl` |
| 2026-11-10 | Grupo (via assistente T3 Code) | OpenRouter Image API (`recraft/recraft-v4.1-flash`) + teste local de legibilidade (Pillow) | Refinar o 3b (pino integrado, bicor) | 2 gerações v4 (pino integrado vs. anel-destino); downscale 48px local sem custo; favorita técnica: v4_1 (pino clássico integrado aguenta 48px) | `design/v4/`, `design/prompts/v4_refino_*.md` |
| 2026-11-10 | Grupo (via assistente T3 Code) | OpenRouter Image API (`bytedance-seed/seedream-5-0-flash`, US$ 0,018/img, com referência de imagem) via `projects/util/img_gerar.py` | Simplificar a arte-referência do grupo (monograma VS com pino, walker e lua, com degradê) em versões minimalistas "cara de app" | 3 gerações v5 ancoradas na referência: monograma VS flat (melhor: âmbar chapado sobre navy, walker/lua/degradê removidos), versão com wordmark `VoltaSegura` (grafia correta) e "só o pino" (falhou: cor branca + leitura "19", descartada) | `design/v5/`, `design/prompts/v5_minimal_*.md`, `design/v5/ledger.jsonl` |

## Como registrar (padrão)

1. Data e identificação de quem usou.
2. Ferramenta e objetivo (o que foi pedido).
3. Resumo do prompt e do resultado.
4. Apontamento de onde a IA contribuiu no código (arquivos/PRs).
5. Validação humana: seu time revisou e entende o que foi gerado? (obrigatório marcar ✅ quando revisado)

## Lembrete do combinado da equipe

> "Permitida para aprender e revisar. Registrem os prompts em um arquivo `prompts.md` e saibam explicar cada linha."
