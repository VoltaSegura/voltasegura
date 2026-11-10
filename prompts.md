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

## Como registrar (padrão)

1. Data e identificação de quem usou.
2. Ferramenta e objetivo (o que foi pedido).
3. Resumo do prompt e do resultado.
4. Apontamento de onde a IA contribuiu no código (arquivos/PRs).
5. Validação humana: seu time revisou e entende o que foi gerado? (obrigatório marcar ✅ quando revisado)

## Lembrete do combinado da equipe

> "Permitida para aprender e revisar. Registrem os prompts em um arquivo `prompts.md` e saibam explicar cada linha."
