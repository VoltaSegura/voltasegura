# VoltaSegura — Base de Conhecimento

> **Nome do produto**: **VoltaSegura** (renomeado de "CitizenTech" em 10/11/2026). O desafio da FIAP tem como **tema** "CitizenTech" (tecnologia centrada no cidadão, 2º semestre de 2026) — mantenha essa distinção: **VoltaSegura = nome do produto**; **CitizenTech = nome do tema/desafio da GS**.

**Repositório**: https://github.com/VoltaSegura/voltasegura (privado)

Você é um agente trabalhando neste repositório. Toda a base de conhecimento está em `docs/`. Comece por aqui e siga a ordem de leitura abaixo.

## Como usar esta base (instrução para agentes)

1. **Antes de gerar qualquer conteúdo** (código, slide, texto, análise), leia os documentos na ordem abaixo.
2. **Nunca contrarie** as regras de posicionamento e linguagem do `docs/05_regras_linguagem_etica.md`. Elas têm prioridade.
3. **Marque sempre o status** de uma afirmação: `[DECISÃO]` (direcionamento atual do grupo), `[HIPÓTESE]` (precisa ser testada) ou `[EM ABERTO]` (não apresentar como resolvido).
4. **Não invente** dados, métricas, fontes, pesos ou funcionalidades. Se algo estiver `[EM ABERTO]`, mantenha em aberto.
5. **Datas-limite são rígidas**: entrega em **19/11/2026, 23h55** (ver `docs/01_gs_briefing.md`).
6. Ao produzir alterações de estado (nova decisão, hipótese validada, ponto fechado), anote a mudança no **Documento Vivo**, no formato de `docs/06_estado_atual.md`, sem apagar o histórico. Prompts usados devem ser registrados em `prompts.md` (regra da GS).

## Ordem de leitura

| Ordem | Arquivo | Conteúdo | Quando acessar |
|---|---|---|---|
| 1 | `docs/01_gs_briefing.md` | Regras da GS FIAP: prazos, equipe, ficha, combinados, ODS | Antes de qualquer entrega ou planejamento |
| 2 | `docs/02_entregas_disciplinas.md` | Entregáveis e rubricas das 8 disciplinas | Ao trabalhar em uma entrega específica |
| 3 | `docs/03_projeto_documento_vivo.md` | O projeto: origem, posicionamento, persona, funcionamento, negócio, roadmap | Contexto de produto e estratégia |
| 4 | `docs/04_dados_fontes.md` | Fontes de dados (SSP-SP, SPTrans, GeoSampa…), matriz de validação, subnotificação | Antes de escrever qualquer código que consuma dados |
| 5 | `docs/05_regras_linguagem_etica.md` | O que pode e o que NÃO pode ser dito/prometido | Antes de gerar qualquer texto público ou telas do produto |
| 6 | `docs/06_estado_atual.md` | Decisões, hipóteses, pontos em aberto, próximas ações | Antes de sugerir direções ou prioridades |
| 7 | `docs/07_classificacao_ssp_app.md` | Recorte das naturezas SSP-SP e apresentação no app | Ao trabalhar com categorias, dados de ocorrências ou telas correspondentes |
| 8 | `docs/08_metodologia_comparacao_mvp.md` | Conta inicial de comparação de trajetos e condições para exibir resultados | Ao trabalhar com cálculo, API, UX ou testes de exposição estimada |
| 9 | `docs/09_fluxo_trabalho_ia.md` | Rotina para mudanças de estado, revisão das pendências e checagem da base | Ao iniciar uma tarefa com IA ou registrar uma decisão |

## Estrutura do repositório

| Caminho | Conteúdo |
|---|---|
| `README.md` | Visão do produto + **Ficha da CitizenTech** preenchida (obrigatória no topo do README) |
| `AGENTS.md` | Este arquivo — ponto de entrada para agentes |
| `CLAUDE.md` | Complemento curto para o Claude Code (ambiente, comandos, rotina de fechamento); remete a este arquivo |
| `prompts.md` | Registro obrigatório de uso de IA |
| `docs/` | Base de conhecimento (01–09) |
| `src/soa-backend/` | API REST (SOA/Web Services) |
| `src/csharp-backend/` | Backend C#/.NET |
| `src/ml/` | Notebook de ML + relatório (dados reais) |
| `src/mobile-app/` | App React Native/Expo |
| `src/os-infra/` | Provisionamento Linux automatizado |
| `src/physical-computing/` | Circuito ESP32 (Wokwi) |
| `src/qa/` | Features e test cases (Azure Boards) |
| `src/cybersecurity/` | Regras PII/LGPD e evidências de auditoria |
| `design/` | Identidade visual da marca (rascunhos de logo, prompts versionados e ledger de custos de geração) |

> **Espelhos de entrega**: cada disciplina tem um repo privado de entrega (`https://github.com/VoltaSegura/<disciplina>`, ex.: `ml`, `qa`, `soa-backend`), criado a partir deste monorepo — fonte da verdade sempre aqui; sincronize com `bash scripts/sync_mirrors.sh`. Alterações manuais diretas no espelho serão sobrescritas no sync.

## Convenções globais desta base

- **Status de afirmação**: `[DECISÃO]` / `[HIPÓTESE]` / `[EM ABERTO]`.
- **Nome do produto**: **VoltaSegura** (grafia única, sem espaço; ex-"CitizenTech", renomeado em 10/11/2026). "CitizenTech" deve ser usado apenas para o tema da GS da FIAP, a Ficha oficial e citações do briefing.
- **Idioma**: português (BR), tom profissional.
- **Conflito entre documentos**: regras de ética/linguagem (`05`) > regras da FIAP (`01`) > projeto (`03`) > dados (`04`).
- **Termo canônico do produto**: "exposição estimada" (nunca "segurança garantida", "rota segura", "área perigosa").
- **Público inicial**: estudantes universitários do período noturno (persona: Marina, 22 anos — validar via entrevistas).
- **Modelo comercial a validar**: B2B2C começando por universidades.
- **Commits**: mensagens convencionais (feat/fix/docs/chore) em português.

## Meta-informações do desafio (resumo ultra-rápido)

- **Desafio**: escolher um problema real de uma cidade e construir o protótipo de uma CitizenTech que o resolva.
- **Cada disciplina** constrói **uma parte** da mesma solução; as partes conversam entre si.
- **Pitch**: vídeo de até 4 min no YouTube, enviado na disciplina de Testing.
- **Ficha da CitizenTech** (nome oficial do formulário da FIAP) deve ficar no início do README do repositório, preenchida com os dados do **VoltaSegura**. ✅ já está no `README.md`.
- **IA é permitida como copiloto**: registrar prompts em `prompts.md` e saber explicar cada linha do código.
