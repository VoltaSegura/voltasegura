# TODO — VoltaSegura

Lista viva de tarefas do projeto. Entrega final das disciplinas: **19/11/2026, 23h55**.

**Última atualização:** 13/11/2026

## Regras de steering (obrigatórias para agentes de IA)

Este arquivo é a fonte única do andamento das tarefas. Todo agente que trabalhar neste repositório deve:

1. **Ler este arquivo no início de qualquer tarefa** e, ao terminar, checar se o que foi feito toca alguma tarefa daqui.
2. **Atualizar este arquivo na mesma alteração** que mudar o andamento de uma tarefa: status, data e evidência (arquivo, commit ou decisão registrada). Não deixar para depois.
3. **Criar uma tarefa nova** quando surgir uma pendência que não esteja aqui. Dar a ela um ID seguinte (T20, T21…), status e detalhes.
4. **Não apagar tarefas concluídas.** Manter com status `CONCLUÍDO` e a evidência.
5. **Não marcar `CONCLUÍDO` sem evidência** (arquivo criado, decisão registrada em `docs/06_estado_atual.md`, link enviado). Se depender de teste ou dado externo, manter `EM DESENVOLVIMENTO` ou `PENDENTE` e dizer o que falta.
6. **Não inventar responsável nem prazo.** Enquanto o grupo não definir, escrever `a definir`.
7. **Decisões de produto continuam em `docs/06_estado_atual.md`** (com `[DECISÃO]`, `[HIPÓTESE]`, `[EM ABERTO]` e histórico). Aqui só se aponta para elas.
8. **Classificar toda tarefa nova** como *Core do projeto* ou *Entrega de disciplina* (definições abaixo) e colocá-la na parte certa do arquivo.
9. Acrescentar uma linha em **Histórico** ao final sempre que o arquivo mudar.

**Status possíveis:** `CONCLUÍDO` · `EM DESENVOLVIMENTO` · `PENDENTE`

## Classificação das tarefas

| Tipo | O que é | Quem define o escopo | Exemplos |
|---|---|---|---|
| **Core do projeto** | O que define e constrói o produto VoltaSegura: decisões de produto e método, dados, roteamento, pesquisa com usuários, marca, comunicação. Existiria mesmo sem a FIAP. | O grupo, registrado em `docs/` | Pontos em aberto, backlog, OTP2, SSP 2025, marca, pitch |
| **Entrega de disciplina** | O que cada matéria da FIAP exige para nota: rubrica, formato, vídeo e envio próprios. Cada uma implementa uma parte do mesmo produto. | A FIAP (`docs/02_entregas_disciplinas.md`) | SOA, C#, ML, Mobile, OS, Physical Computing, QA, Cybersecurity |

**Como as duas partes se relacionam:** as decisões do core vêm primeiro e alimentam as disciplinas. Quando uma decisão do core mudar (ex.: arquitetura, função do ESP32, definição do Risco Cidadão), revisar as entregas de disciplina que dependem dela (coluna "Depende do core").

## Resumo

### Parte A — Core do projeto

| ID | Tarefa | Status | Responsável | Prazo |
|---|---|---|---|---|
| T01 | Fechar os pontos em aberto do estado atual (`docs/06`) | EM DESENVOLVIMENTO | a definir | antes de 19/11 |
| T02 | Construir o backlog do VoltaSegura | EM DESENVOLVIMENTO | a definir | a definir |
| T03 | Arquitetar o vídeo pitch (até 4 min) | PENDENTE | a definir | 19/11 23h55 |
| T12 | Roteamento: teste local do OpenTripPlanner 2 | EM DESENVOLVIMENTO | Lucas Simidu | a definir |
| T13 | Dados: SSP-SP 2025 e janela de 12 meses | PENDENTE | a definir | a definir |
| T14 | Pesquisa com estudantes noturnos e universidades | CONCLUÍDO (fora desta fase) | grupo | 11/11 |
| T15 | Marca: fechamento e checagens | EM DESENVOLVIMENTO | a definir | a definir |
| T16 | Slides da apresentação | PENDENTE | a definir | a definir |
| T17 | Benchmarking atualizado | PENDENTE | a definir | a definir |
| T19 | Base de conhecimento e dados já entregues | CONCLUÍDO | grupo | 11/11 |
| T21 | Script automático de cobertura por região (revisão de vieses) | PENDENTE | a definir | antes do piloto |

### Parte B — Entregas de disciplinas (prazo de todas: 19/11/2026, 23h55)

| ID | Disciplina | Entrega | Status | Depende do core | Responsável |
|---|---|---|---|---|---|
| T04 | IA & Machine Learning | Notebook e relatório prontos; vídeo de até 5 min | EM DESENVOLVIMENTO | T13 (janela de 12 meses de dados) | a definir |
| T05 | SOA & Web Services | Backend REST, banco, migrações, Swagger, testes | EM DESENVOLVIMENTO | T01.17 (arquitetura), T12, `docs/08` | a definir |
| T06 | C# Software Development | Backend .NET (POO, EF Core, Web API, async, testes) | EM DESENVOLVIMENTO | T01.17 (arquitetura), `docs/08` | a definir |
| T07 | Mobile & IoT | App Expo com a jornada ida e volta, vídeo de até 3 min | EM DESENVOLVIMENTO | `docs/08` (bloco "Sobre os dados"; resultado revisto em `docs/app-map` D-01), T12, T15, T01.7 | Lucas Simidu |
| T08 | Operating Systems | Provisionamento Linux automatizado, vídeo de até 7 min | PENDENTE | T05/T06 (aplicação a hospedar) | a definir |
| T09 | Physical Computing | Circuito ESP32 no Wokwi, vídeo de até 4 min, `.txt` | PENDENTE | nenhuma (ESP32 fora do produto, decisão de 11/11) | a definir |
| T10 | Testing, Compliance & QA | Features e Test Cases no Azure Boards, PDF | PENDENTE | T02 (backlog em `docs/10`), `docs/08` | a definir |
| T11 | Cybersecurity | Módulo PII, Taint Analysis, Risco Cidadão, ZIP | PENDENTE | T01.3 (privacidade), T01.6 (Risco Cidadão) | a definir |
| T18 | Envio final (todas) | Conferir e enviar cada disciplina até 19/11 23h55 | PENDENTE | T04 a T11 | a definir |
| T20 | Alinhar backend ao `docs/07`/`docs/08` | Rubricas elegíveis, faixa do dia, cobertura e frases fixas | CONCLUÍDO (12/11/2026) | `docs/07`, `docs/08` | a definir |

---

# PARTE A — CORE DO PROJETO

## T01 — Fechar os pontos em aberto do estado atual

**Status:** EM DESENVOLVIMENTO
**Tipo:** Core do projeto
**Referência:** `docs/06_estado_atual.md`, seção 3 (e seções 2 e 4). Método em `docs/09_fluxo_trabalho_ia.md`.

**Como fazer:** seguir a ordem da seção 3 de `docs/06`, uma pergunta de cada vez, com contexto suficiente para decidir. A resposta do grupo gera `[DECISÃO]`, `[HIPÓTESE]` ou mantém `[EM ABERTO]`. Registrar o resultado em `docs/06` (seção e histórico) e em `prompts.md` antes de avançar. Se o item depender de dado externo ou teste, anotar a evidência necessária em vez de fechar por suposição.

**Andamento (19 perguntas):**

- [ ] 1. Validar a regra de comparação em trajetos reais. *Em andamento: teste 1 do Lucas Simidu redefinido (11/11, ver T12): ida trabalho → FIAP às 18h, volta FIAP → casa às 23h, alternativas geradas pelo OTP2. Faltam a execução (depende do OTP2), outros testes em outras regiões e quem roda a regra.*
- [ ] 2. Teste local do OTP2 (ver T12). *Pulado em 11/11 por falta de responsável; retomado no mesmo dia: Lucas Simidu assumiu a execução. Roteiro e scripts em `scripts/otp2/`. Falta rodar e anotar as medições.*
- [x] 3. Privacidade, retenção e LGPD da localização: decidido em 11/11 para o MVP (pacote mínimo com conta obrigatória, `docs/03` §6). Falta: responsável por acesso e exclusão, provedor de login, base legal e revisão jurídica (continuam em `docs/06`).
- [x] 4. Vieses entre regiões: decidido em 11/11 pela **opção B** (revisão totalmente automática, sem responsável humano; `docs/08`). Implementação em T21.
- [x] 5. Teste das mensagens de incerteza: decidido em 11/11 que **não será feito nesta fase**; metodologia registrada em `docs/08` ("Teste de compreensão das mensagens") para uso futuro.
- [ ] 6. Indicador "Risco Cidadão" (despriorizado; ver T11)
- [ ] 7. GTFS/SPTrans: termos de redistribuição e ligação de IDs com a Olho Vivo. *Em aberto, com Lucas Simidu (11/11): será tratada na entrega de Mobile (T07), onde ficam as questões técnicas do app.*
- [ ] 8. API Olho Vivo: cadência real, limites e termos de uso. *Em aberto, com Lucas Simidu (11/11): tratada na entrega de Mobile (T07); rodar `scripts/olhovivo_cadencia.py` se o app usar tempo real.*
- [x] 9. Metrô 6 e 17: conferido em 11/11 (Linha 6 = operação real; Linha 17 = feed desatualizado). Decidido aceitar o GTFS como vem e avisar no bloco "Sobre os dados" (`docs/04` §5, `docs/08`).
- [x] 10. Função do circuito ESP32: decidido em 11/11 que o ESP32 **não faz parte do produto**, só da entrega de Physical Computing; a função do circuito é definida na T09.
- [x] 11. PL 1.169/2025: verificado em 11/11 (aguardando despacho na Câmara desde 04/11/2025; não é lei). Redação para slides em `docs/03`.
- [ ] 12. Marca: checagens de marca, domínio e anterioridade. *11/11: domínio escolhido `voltasegura.app` (livre, ainda não registrado); nenhum app homônimo na web. Faltam registrar o domínio e fazer a busca no INPI (classes 9 e 42).*
- [x] 13. Marca: sombra da dobra do S **descartada** em 11/11 (identidade chapada). Os arquivos de imagem ficam com o grupo.
- [ ] 14. Marca: aprovação formal do fechamento v8–v10. *Pulada em 11/11: as imagens ficam com o grupo; marcar quando o grupo aprovar (T15).*
- [x] 15. Instituição do primeiro piloto: decidido em 11/11 que **não haverá instituição participante**.
- [x] 16. ODS: decidido em 11/11 **somente o ODS 11** (metas 11.2 e 11.7), com justificativa na Ficha do `README.md` e em `docs/01` §7.
- [x] 17. Arquitetura: SOA e C# no mesmo serviço ou módulos distintos (despriorizado; ver T05/T06) — *Fechado para as entregas em 11–12/11/2026: mesma solution .NET com domínio/infra únicos e duas APIs (`VoltaSegura.Api` e `VoltaSegura.Servicos`), evidência `src/csharp-backend/`. Como questão de produto segue despriorizada; ver `docs/06` §3.*
- [x] 18. Hipóteses revisadas em 11/11: B2B2C mantido como hipótese de modelo futuro; valor para estudantes segue "a validar"; bases suficientes via T12; diferenciação via T17; persona padronizada como **Ágatha Santos, 24** (proto-persona).
- [x] 19. Backlog: decidido em 11/11 um arquivo próprio com todas as características do produto, base do Azure Boards (`docs/10_backlog_produto.md`, ver T02).

**Pronto quando:** nenhum item da seção 3 de `docs/06` estiver como `[EM ABERTO]` sem justificativa, e o histórico tiver uma linha por mudança.

---

## T02 — Construir o backlog do VoltaSegura

**Status:** EM DESENVOLVIMENTO (versão 1.0 criada em `docs/10_backlog_produto.md`; falta revisão do grupo e atualizar o benchmarking com a T17)
**Formato decidido (11/11/2026):** arquivo de backlog do produto com **todas** as características (proposta de valor, benchmarking, decisões técnicas e de código, histórias de usuário com critérios de aceite). É a base para criar as Features e os Test Cases no Azure Boards (T10). O andamento das tarefas continua neste `TODO.md`.
**Tipo:** Core do projeto
**Referência:** `docs/06_estado_atual.md`, seção 4; `docs/03_projeto_documento_vivo.md` (roadmap, Fase 1).

**O que fazer:** transformar a lista da seção 4 de `docs/06` em um backlog priorizado e executável até 19/11, com:
- uma linha por item, com **responsável**, **prazo** e **critério de pronto**;
- ligação de cada item à disciplina da GS que ele alimenta (T04 a T11);
- ordem de prioridade que respeite o que bloqueia o quê (ex.: roteamento antes de validar a regra; função do ESP32 antes do Wokwi);
- itens da Fase 1 do roadmap que viram Features no Azure Boards (T10).

**Itens de partida (de `docs/06`, seção 4):**
- Desenhar 2–3 trajetos reais em partes distintas de São Paulo (T12)
- Baixar `SPDadosCriminais_2025.xlsx` e auditar (T13)
- Entrevistar estudantes noturnos e parceiros universitários (T14)
- Primeira metodologia simples e transparente de comparação (já descrita em `docs/08`; falta validar)
- Benchmarking atualizado (T17)
- Revisar persona, B2B2C e disposição a pagar
- Atualizar slides (T16)
- Definir responsáveis e prazos em reunião

**Pronto quando:** o backlog estiver registrado (em `docs/` ou no Azure Boards, a decidir) e cada item tiver dono e prazo.

---

## T03 — Arquitetar o vídeo pitch

**Status:** PENDENTE
**Tipo:** Core do projeto (comunicação do produto; o link é enviado pela disciplina de Testing)
**Referência:** `docs/01_gs_briefing.md` §2–3; `docs/02_entregas_disciplinas.md` (seção Pitch); `docs/05_regras_linguagem_etica.md`.

**Regras da GS:**
- Vídeo de **até 4 minutos**, publicado no **YouTube**.
- Enviar o link na tarefa da disciplina de **Testing** (concorre ao prêmio "Melhor GS").
- Deve explicar o problema, a solução e quem ela ajuda, e **mostrar as entregas que mais somaram** (dashboard incluído).

**Decisões já tomadas que valem para o vídeo:** identidade da apresentação em preto e laranja, menos texto e Big Numbers em destaque (`docs/06` §1). Linguagem: "exposição estimada", nunca "rota segura", "área perigosa" ou "segurança garantida".

**O que fazer:**
- [ ] Definir responsável pelo roteiro, pela gravação e pela edição
- [ ] Escolher o fio da história (proposta a validar: persona noturna, o problema da volta para casa, a comparação ida e volta, a confiança nos dados, o impacto)
- [ ] Escolher os Big Numbers (candidatos tirados dos dados do repositório, a conferir antes de usar: 274.990 BOs de roubo/furto na capital em 2026; 39,8% dos BOs do recorte sem hora utilizável; 47% dos bairros com menos de 10 BOs em 2026). Não usar nenhum número como rótulo de bairro ou rua.
- [ ] Escolher as entregas que entram (app, API, ML, dashboard de Cybersecurity, circuito ESP32), de acordo com o que estiver pronto
- [ ] Montar o roteiro com tempos por bloco, somando no máximo 4 min
- [ ] Storyboard simples (telas e demonstrações a gravar)
- [ ] Modelo de receita: proposta de assinatura individual (freemium) em discussão no grupo (`Claude outputs/proposta_premium_voltasegura.md`, fora do git); decidir antes do pitch se entra como "modelo a validar"
- [ ] Decidir a paleta dos slides (preto e laranja da apresentação ou dourado da marca; ver T15)
- [ ] Gravar, editar, subir no YouTube e conferir o link
- [ ] Colocar o link na tarefa de Testing (ver T18)

**Depende de:** marca (T15), protótipo do app (T07), entregas de ML (T04) e Cybersecurity (T11).
**Pronto quando:** vídeo publicado com até 4 min e link enviado.

---

## T12 — Roteamento: teste local do OpenTripPlanner 2

**Status:** EM DESENVOLVIMENTO (roteiro e scripts prontos; execução com Lucas Simidu)
**Tipo:** Core do projeto
**Referência:** `docs/04` §6.2–6.3.

**Decisão já tomada:** OTP2 em servidor próprio com GTFS SPTrans + OpenStreetMap.
**Responsável pela execução:** Lucas Simidu (11/11/2026).
**Roteiro:** [`scripts/otp2/README.md`](scripts/otp2/README.md): Java 25 (exigido pelo OTP 2.10.0), download e recorte do OSM, montagem do grafo, servidor e consulta do teste 1 com saída em GeoJSON dos trechos a pé; tabela de medições a preencher no passo 7.
- [ ] Subir o OTP2 (Java 21) com o grafo de SP e medir memória e tempo
- [ ] Rodar 2 ou 3 trajetos reais em partes distintas do município e obter a geometria dos trechos a pé
- [ ] Estimar o custo de hospedagem a partir do consumo medido
- [ ] A cada novo download do GTFS, conferir se as janelas das linhas Metrô 6 e 17 mudaram (decisão de 11/11, `docs/04` §5)
- [ ] Rodar a regra de comparação nesses trajetos (alimenta T01.1)

**Testes do piloto** (cada teste agrupa os trajetos de ida e volta; novos testes podem ser acrescentados):

| Teste | Autor | Trajeto | Origem → destino | Horário e faixa do dia | Alternativas X/Y | Status |
|---|---|---|---|---|---|---|
| Teste 1 | Lucas Simidu | 1 (ida) | Trabalho do Lucas → FIAP Paulista | saída às 18h · noite | geradas pelo OTP2 | PENDENTE (execução) |
| Teste 1 | Lucas Simidu | 2 (volta) | FIAP Paulista → residência do Lucas | saída por volta das 23h · noite (trecho a pé depois de 0h conta como madrugada) | geradas pelo OTP2 | PENDENTE (execução) |

- Definido em 11/11/2026 pelo Lucas e redefinido no mesmo dia (versão 1.17 de `docs/06`): a primeira versão (casa ↔ FIAP via Metrô Vila Sônia e Oscar Freire) foi substituída; o percurso agora sai do roteamento.
- Os endereços de trabalho e residência **não** entram no repositório (dados pessoais): usar pontos de referência aproximados.
- Pendente do teste 1: executar depois do OTP2 e definir quem roda a regra.
- Lembrete: a regra conta só os trechos caminhados. `docs/08` pede trajetos de diferentes regiões, então outros testes serão necessários.

---

## T13 — Dados: SSP-SP 2025

**Status:** PENDENTE
**Tipo:** Core do projeto
**Referência:** `docs/06` §4; `src/ml/dados/README.md`.
- [ ] Baixar `SPDadosCriminais_2025.xlsx` em `ssp.sp.gov.br/estatistica/consultas`
- [ ] Registrar o SHA256 em `src/ml/dados/README.md`
- [ ] Rodar `src/ml/auditar_calibracao_ssp.py` para completar a janela de 12 meses (hoje o MVP usa jan–set/2026)

---

## T14 — Pesquisa com estudantes noturnos e universidades

**Status:** CONCLUÍDO (encerrada por decisão do grupo em 11/11/2026: sem entrevistas, testes com usuários nem instituições nesta fase; evidência em `docs/06`, versões 1.20, 1.28 e 1.30)
**Tipo:** Core do projeto
**Referência:** `docs/03` §12; `docs/06` §2.
- [ ] ~~Roteiro das entrevistas (sem dados pessoais nas anotações)~~ Fora desta fase.
- [ ] ~~Entrevistar estudantes do período noturno e possíveis parceiros universitários~~ Fora desta fase.
- [x] Hipóteses revistas sem pesquisa (T01.18, 11/11)
- [x] Padronizar a persona: Ágatha Santos, 24, proto-persona (11/11)
- [ ] ~~Teste de compreensão das mensagens de incerteza (ver T01.5)~~ Fora desta fase (decisão de 11/11/2026); metodologia em `docs/08`.

---

## T15 — Marca

**Status:** EM DESENVOLVIMENTO
**Tipo:** Core do projeto
**Referência:** `design/`; `docs/06` §3.
- [x] Nome definido (VoltaSegura), monograma "VS" e paleta com dourado `#FFC53D`
- [x] PNG e SVG premium gerados (`design/v10/`), teste a 48 px aprovado
- [ ] Aprovação formal do grupo do fechamento v8–v10
- [x] Decidir a sombra da dobra do S: descartada (11/11)
- [ ] Checagens de marca, domínio e anterioridade
- [ ] Alinhar a paleta dos slides (preto e laranja da apresentação ou dourado da marca)
- [ ] Registrar o domínio `voltasegura.app` (escolhido em 11/11; responsável a definir)
- [ ] Busca de marca no INPI, classes 9 e 42 (busca.inpi.gov.br)
---

## T16 — Slides da apresentação

**Status:** PENDENTE
**Tipo:** Core do projeto
**Referência:** `docs/06` §4.
- [ ] Atualizar: problema, Big Numbers, dados, metodologia, ética, diferencial, público, sustentabilidade
- [ ] Seguir a identidade definida (menos texto, Big Numbers em destaque) e a linguagem de `docs/05`

---

## T17 — Benchmarking atualizado

**Status:** PENDENTE
**Tipo:** Core do projeto
**Referência:** `docs/06` §4.
- [ ] Comparar Google Maps, Waze, Moovit, Citizen e iniciativas relacionadas (ex.: Onde Fui Roubado) por função e diferencial

---

## T19 — Base de conhecimento e dados já entregues

**Status:** CONCLUÍDO
**Tipo:** Core do projeto
- [x] Base de conhecimento em `docs/` (01 a 09), `AGENTS.md` e `prompts.md`
- [x] Ficha da CitizenTech preenchida no `README.md` (indicador de impacto segue em aberto; ODS 11 justificado em 11/11, ver T01)
- [x] Renomeação para VoltaSegura (10/11)
- [x] Auditoria das fontes e token da Olho Vivo validado (10/11)
- [x] Datasets SSP-SP 2026 e Infosiga adquiridos, com catálogo (10/11)
- [x] Recorte das ocorrências e apresentação no app (`docs/07`)
- [x] Metodologia de comparação, parâmetros de calibração e auditoria (`docs/08`, `src/ml/dados/AUDITORIA_CALIBRACAO_SSP_2026.md`)
- [x] Decisões de roteamento (OTP2), confiança dos dados, "dados insuficientes", percepção de usuários e exclusões do MVP

---

## T21 — Script automático de cobertura por região (revisão de vieses)

**Status:** PENDENTE
**Tipo:** Core do projeto
**Referência:** `docs/08`, "Revisão de vieses entre regiões" (decisão de 11/11/2026, opção B).

- [ ] Script que mede, por circunscrição de delegacia e por subprefeitura, a fração de boletins elegíveis com coordenada válida e período, partindo de `src/ml/auditar_calibracao_ssp.py`
- [ ] Gerar o relatório publicado com a metodologia, antes do piloto e a cada atualização da base da SSP-SP
- [ ] Rodar uma vez antes do piloto (mínimo para o MVP)
- [ ] Decidir se o script interrompe a atualização ao detectar mudança na base (colunas ausentes, queda brusca da cobertura, circunscrição sumida): hipótese em `docs/08`

**Pronto quando:** o script rodar sobre a base atual, o relatório estiver publicado junto da metodologia e a decisão sobre as travas estiver registrada.

---

# PARTE B — ENTREGAS DE DISCIPLINAS

## T04 — IA & Machine Learning

**Status:** EM DESENVOLVIMENTO (notebook e relatório concluídos; falta o vídeo)
**Tipo:** Entrega de disciplina (IA & Machine Learning)
**Referência:** `src/ml/`; `docs/02` §4.

- [x] Notebook executado com dados reais (SSP-SP 2026 e Infosiga), 27 combinações de 3 hiperparâmetros, validação cruzada só no treino. R² de teste 0,61.
- [x] `RELATORIO_ML.md`, `dados/README.md`, `requirements.txt` e figuras em `src/ml/`
- [ ] Conferir o relatório contra a exigência de 2 a 4 páginas
- [ ] Gravar e publicar o vídeo de até 5 min no YouTube (a entrega pede links do repositório e do vídeo)
- [ ] Sincronizar o espelho `github.com/VoltaSegura/ml` (`scripts/sync_mirrors.sh`)

---

## T05 — SOA & Web Services

**Status:** PENDENTE (só existe o README em `src/soa-backend/`)
**Tipo:** Entrega de disciplina (SOA & Web Services)
**Referência:** `docs/02` §1.

**Escopo previsto:** API REST de rotas, comparação e exposição estimada. A rubrica pede domínio (3,0), banco de dados (3,0), migrações (1,5), documentação automática (1,5) e testes automatizados (1,0).
- [ ] Decidir a linguagem e a relação com o backend C# (ver T06 e T01.17)
- [ ] Modelar o domínio e o banco (conta com e-mail e identificador; sem armazenar consultas nem histórico de trajetos; `docs/03` §6)
- [ ] Autenticação e exclusão de conta
- [ ] Implementar endpoints, migrações e Swagger
- [ ] Testes automatizados
- [ ] README com execução, solução e nomes dos integrantes; evidências

---

## T06 — C# Software Development

**Status:** PENDENTE (só existe o README em `src/csharp-backend/`)
**Tipo:** Entrega de disciplina (C# Software Development)
**Referência:** `docs/02` §3.

**Escopo previsto:** backend .NET com POO, interfaces, injeção de dependência, EF Core, LINQ, Web API, async/await e testes unitários. Rubrica: POO (3,0), Web API (2,5), EF Core + LINQ (1,5), async (1,0), qualidade (2,0).
- [ ] Decidir se é o mesmo serviço da SOA ou módulo distinto
- [ ] Implementar e testar
- [ ] README, Swagger/Scalar e evidências

---

## T07 — Mobile & IoT

**Status:** EM DESENVOLVIMENTO (13/11/2026: mapeamento do app iniciado em `docs/app-map/`, com as Fases 0 e 1 do plano `docs/plano_app.md` feitas; o código do app ainda não existe)
**Responsável:** Lucas Simidu (indicado em 11/11/2026)
**Tipo:** Entrega de disciplina (Mobile & IoT)
**Referência:** `docs/02` §5; plano `docs/plano_app.md`; mapeamento `docs/app-map/`.

**Escopo previsto:** app React Native (TypeScript) com Expo Router para a jornada ida e volta do estudante noturno; consumir API ou mock; salvar em banco; acessibilidade.
- [x] Mapeamento, Fase 0: decisões D-00 a D-07 registradas (`docs/app-map/01_decisoes.md`, 13/11)
- [x] Mapeamento, Fase 1: story map e fluxogramas FL-01 a FL-14 em rascunho, com os 17 diagramas Mermaid validados (`docs/app-map/02_story_map.md`, `docs/app-map/03_fluxogramas/`, 13/11)
- [x] Mapeamento, Fase 2: telas, navegação, funcionalidades (com o contrato esperado de conta, D-03) e dados por tela. *13/11: TL-01 a TL-13, `05_navegacao.md`, `06_funcionalidades.md` (FN-01 a FN-14 e contrato esperado da API, PL-18) e `09_dados_por_tela.md`; aprovados pelo Lucas (D-17), telas `pronta`.*
- [x] Mapeamento, Fase 3: design (tokens, componentes, acessibilidade, mockups) e microcopy, com varredura de termos. *13/11: `07_design/` e `08_microcopy.md`; varredura com 0 termos proibidos em 762 linhas; validados pelo Lucas (D-18), com pontos de design a rever (PL-19).*
- [x] Mapeamento, Fase 4: rastreabilidade e fechamento. *13/11: `docs/app-map/10_rastreabilidade.md` (76 AC + 9 RNF, conferido por script) e `00_LEIA-ME.md` com a definição de pronto; backlog revisado (`docs/10` v1.5). Roteiro do vídeo adiado por decisão do Lucas (D-18).*
- [ ] Revisão de pontos de design com o Lucas antes de estilizar as telas (PL-19)
- [ ] Conciliar o contrato da API esperado pelo app com o backend (PL-18)
- [ ] **Compartilhar trajeto e localização ao vivo** (F2.5/US-21, D-19 a D-22). **Depende do tempo:** construir por último; se o prazo apertar, fica para depois. Mapeamento feito em 13/11 (FL-15, FL-16, TL-14, TL-15, FN-15, FN-16); faltam a revisão do Lucas das telas novas, a checagem do GPS em segundo plano no Expo Go (PL-24) e o endpoint no backend (PL-18)
- [x] Resolver as pendências do mapeamento que bloqueavam telas: PL-01, PL-02, PL-04, PL-08, PL-13, PL-14 e PL-15 (D-08 a D-14, 13/11)
- [x] Resolver PL-16 (candidatas aos focos) e PL-17 (consulta com uma rota só): D-15 e D-16, 13/11
- [ ] Cadastro e login (conta obrigatória; consentimento e aviso de privacidade no cadastro; exclusão da conta pelo app; `docs/03` §6). *13/11: por endpoints do backend (D-03); implementação pendente fora deste plano (PL-05).*
- [ ] Telas e navegação. *13/11: o resultado deixou de ser três telas; agora é mapa + container por trechos + "Por que esta rota?", com o selo só no caso conclusivo (D-01).*
- [ ] Bloco "Sobre os dados" (`docs/08`)
- [ ] Consumo de API ou mock e banco local
- [ ] README com a Ficha, instruções e prints
- [ ] Vídeo de até 3 min com o app rodando
- [ ] GTFS/SPTrans (T01.7, atribuída ao Lucas em 11/11): conferir os termos de redistribuição no cadastro do Portal do Desenvolvedor ou pelo SP156 e testar a ligação de IDs com a Olho Vivo (precisa do token)
- [ ] API Olho Vivo (T01.8, atribuída ao Lucas em 11/11): se o app usar tempo real, medir a cadência com `scripts/olhovivo_cadencia.py` (precisa do token) e confirmar limites e termos de uso

---

## T08 — Operating Systems

**Status:** PENDENTE (só existe o README em `src/os-infra/`)
**Tipo:** Entrega de disciplina (Operating Systems)
**Referência:** `docs/02` §6.

**Escopo previsto:** provisionamento Linux automatizado (Shell Script) para hospedar a aplicação web, com monitoramento de CPU, disco e memória, serviço tolerante a falhas e logs de auditoria.
- [ ] Script de infraestrutura (rede, DNS, IP)
- [ ] Script da aplicação (dependências, configuração)
- [ ] Monitoramento com alertas e como serviço
- [ ] Logs, teste de falha e README
- [ ] Vídeo de até 7 min dentro da VM

---

## T09 — Physical Computing

**Status:** PENDENTE (só existe o README em `src/physical-computing/`)
**Tipo:** Entrega de disciplina (Physical Computing)
**Referência:** `docs/02` §7; `docs/06` §3 (ESP32).

**Decisão de 11/11/2026:** o ESP32 não faz parte do produto; existe só para esta entrega (`docs/06`). Não há mais bloqueio do core. A rubrica (`docs/02` §7) ainda pede que o circuito se relacione com o problema do grupo, o que deve ser justificado no vídeo.
- [ ] Definir a função do circuito dentro da entrega (hipótese anterior, não adotada para o produto: sensor de ambiente ou iluminação em parada)
- [ ] Montar o circuito e o código no Wokwi
- [ ] Vídeo de até 4 min
- [ ] Arquivo `.txt` com os nomes dos integrantes

---

## T10 — Testing, Compliance & QA

**Status:** PENDENTE (só existe o README em `src/qa/`)
**Tipo:** Entrega de disciplina (Testing, Compliance & QA)
**Referência:** `docs/02` §8; `docs/03` (Fase 1 do roadmap).

**Escopo previsto:** Features com critérios de aceite e Test Cases funcionais (positivos e negativos) no Azure Boards. Peso: 50% Features, 50% Test Cases.
- [ ] Criar o projeto no Azure Boards e incluir o professor como Admin
- [ ] Features do MVP com critérios de aceite, a partir de `docs/10_backlog_produto.md` (seção 11 explica a conversão). *13/11: a matriz `docs/app-map/10_rastreabilidade.md` já lista um teste previsto (positivo ou negativo) por AC, base para os Test Cases.*
- [ ] Test Cases com objetivo, preparação, inputs, outputs esperados e passos
- [ ] Prints de todas as telas em um documento único e PDF com o link do projeto

---

## T11 — Cybersecurity

**Status:** PENDENTE (só existe o README em `src/cybersecurity/`)
**Tipo:** Entrega de disciplina (Cybersecurity)
**Referência:** `docs/02` §2; `docs/06` §3 (Risco Cidadão).

**Escopo previsto:** ZIP com o código do módulo de regras PII/LGPD, a auditoria com Taint Analysis e o dashboard (vídeo e print) com o indicador de Risco Cidadão.
- [ ] Regras PII sobre os dados de localização e sobre os dados da conta (e-mail e identificador)
- [ ] Taint Analysis com evidências
- [ ] Definir o Risco Cidadão (sugestão registrada: risco de exposição dos dados pessoais do usuário, nunca descrição de ruas ou bairros)
- [ ] Dashboard e ZIP final

---

## T18 — Envio final por disciplina

**Status:** PENDENTE
**Tipo:** Entrega das disciplinas (transversal)
**Referência:** `docs/01` §3; `docs/02` (visão geral).

Prazo: **19/11/2026, 23h55**. Só **um integrante** envia por disciplina, no Teams ou Portal do Aluno. Semana de orientação: 16 a 19/11. Dia 20/11 é feriado.

| Disciplina | O que enviar |
|---|---|
| SOA | Link do GitHub |
| Cybersecurity | ZIP |
| C# | Link do GitHub |
| IA & ML | Links do repositório e do vídeo |
| Mobile & IoT | Link do repositório (com Ficha, prints e vídeo) |
| Operating Systems | Link do repositório |
| Physical Computing | Link do Wokwi, vídeo e `.txt` |
| Testing & QA | PDF com prints e links + link do vídeo pitch |

- [ ] Definir quem envia cada disciplina
- [ ] Conferir cada envio antes das 23h55 de 19/11
- [ ] Sincronizar os espelhos (`scripts/sync_mirrors.sh`) depois de revisar as alterações

---

## Histórico

| Data | Mudança | Responsável |
|---|---|---|
| 11/11/2026 | Criação do TODO.md com as tarefas T01–T19 a partir de `docs/06`, `docs/01` e `docs/02`. T01 em andamento (pergunta 1 aguardando o grupo). | assistente (para revisão do grupo) |
| 11/11/2026 | Tarefas separadas em Parte A (Core do projeto) e Parte B (Entregas de disciplinas), com definições, coluna "Depende do core" e regra 8 de classificação. IDs T01–T19 mantidos. | assistente (para revisão do grupo) |
| 11/11/2026 | Registrado o teste 1 do Lucas Simidu (ida e volta casa ↔ FIAP Paulista via Vila Sônia e Oscar Freire) em T12 e atualizado T01.1. Horários, alternativas e execução seguem pendentes. | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.3 concluída: privacidade do MVP decidida (pacote mínimo com conta obrigatória). T01.2 (OTP2) pulada por ser questão técnica sem responsável. Impactos anotados em T05 (autenticação), T07 (cadastro e login) e T11 (PII da conta). | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.4 segue em aberto: registrada a proposta de Lucas Simidu de automatizar a revisão de vieses (opções A, B e C), a ser avaliada pelo grupo. | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.1 e T12: teste 1 redefinido pelo Lucas (ida trabalho → FIAP às 18h, volta FIAP → casa às 23h, faixa noite; alternativas X/Y geradas pelo OTP2). Endereços não registrados. Execução segue pendente. | assistente (a pedido do Lucas) |
| 11/11/2026 | T12 → EM DESENVOLVIMENTO: Lucas Simidu assumiu o teste local do OTP2 (T01.2 retomada). Criados `scripts/otp2/` (roteiro, preparo dos dados, consulta do teste 1) e regras no `.gitignore`. Corrigido o requisito de Java para 25 (OTP 2.10.0). Medições ainda não feitas. | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.4 concluída: revisão de vieses totalmente automática (opção B), sem responsável humano. Criada a T21 (script de cobertura por região). | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.5 concluída: teste de compreensão das mensagens fora desta fase; metodologia preservada em `docs/08`. Item correspondente da T14 marcado como fora do escopo. | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.7 segue em aberto, atribuída a Lucas Simidu e ligada à T07 (Mobile), que passa a ter Lucas como responsável. | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.8 segue em aberto, atribuída a Lucas Simidu e ligada à T07 (Mobile). | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.9 concluída: Linha 6 com horário real reduzido, Linha 17 com feed desatualizado; aceitar o GTFS e avisar. Conferência a cada download acrescentada à T12. | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.10 concluída: ESP32 fora do produto, só para a entrega de Physical Computing. T09 deixa de depender do core. | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.11 concluída: tramitação do PL 1.169/2025 verificada na Câmara e registrada em `docs/03` e `docs/06`. | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.12 em andamento: checagem de domínios e de nomes na web feita; domínio `voltasegura.app` escolhido. Registro do domínio e busca no INPI acrescentados à T15. | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.13 concluída: sombra da dobra do S descartada. Nova pendência na T15: produzir a versão sem sombra. | assistente (a pedido do Lucas) |
| 11/11/2026 | Removida da T15, a pedido do Lucas, a tarefa de produzir o logo sem sombra: o grupo cuida dos arquivos de imagem por conta própria. | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.14 pulada (imagens com o grupo). T01.15 concluída: piloto sem instituição participante. | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.16 concluída: somente o ODS 11, justificado na Ficha do README e em `docs/01` §7. | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.18 concluída: hipóteses revisadas e persona padronizada como Ágatha Santos, 24 (README, AGENTS, `docs/03`, relatório e notebook de ML atualizados). | assistente (a pedido do Lucas) |
| 11/11/2026 | T01.19 concluída e T02 → EM DESENVOLVIMENTO: criado o backlog do produto `docs/10_backlog_produto.md` (20 features, 20 histórias com critérios de aceite), base da T10. | assistente (a pedido do Lucas) |
| 11/11/2026 | LGPD operacional (`docs/06` §3): login por e-mail e senha e Google; exclusão e incidentes com desenvolvedores internos; dados acessíveis ao usuário. Base legal e revisão jurídica seguem abertas. Backlog (`docs/10`, F1.1 e DT-08) atualizado. | assistente (a pedido do Lucas) |
| 11/11/2026 | LGPD operacional fechada: sem revisão jurídica nesta fase (MVP acadêmico); aviso como minuta e sem afirmar conformidade com a LGPD (RNF-09 no backlog). | assistente (a pedido do Lucas) |
| 12/11/2026 | T14 encerrada por decisão do grupo (sem pesquisa com usuários nem instituições nesta fase). Limpeza de textos desatualizados em `docs/06` e `docs/08`. | assistente (a pedido do Lucas) |
| 12/11/2026 | T01.17 concluída (arquitetura: mesma solution .NET, duas APIs). T05/T06 passam a EM DESENVOLVIMENTO: solution estruturada, migração + ETL com 278.961 boletins reais, 17 testes passando, APIs no ar com Swagger. Criada T20 (alinhar backend ao docs/07/docs/08). | assistente + grupo |
| 12/11/2026 | Merge com a `main`: T20 do colega (alinhar backend) mantida; a tarefa do script de cobertura passou a T21. Versões desta rodada no `docs/06` renumeradas para 1.17–1.34. Backlog (`docs/10`, DT-12) atualizado com a arquitetura das entregas. | assistente (a pedido do Lucas) |
| 12/11/2026 | **T20 CONCLUÍDA**: backend alinhado ao docs/07/docs/08 — recorte por `NATUREZA_APURADA` (só FURTO - OUTROS 172.852 e ROUBO - OUTROS 62.365 em N), faixa pela HORA_OCORRENCIA_BO com fallback DESC_PERIODO (sem faixa: 0,9%), cobertura real por circunscrição (docs/08 §64) e frases fixas (§§99–102). Migração regenerada + recarga (278.687 boletins); 20 testes passando; APIs ao vivo e smoke test OK. Evidência: `src/csharp-backend/` (commit deste dia), README do backend, `docs/06` §1.35. | assistente + grupo |
| 13/11/2026 | T07 → EM DESENVOLVIMENTO: mapeamento do app iniciado em `docs/app-map/` (plano `docs/plano_app.md`). Fase 0: decisões D-00 a D-07 do Lucas (resultado com mapa, container por trechos e "Por que esta rota?"; pontos por mapa, GPS ou locais salvos; conta por endpoints do backend; F2.4 no MVP; fora do município bloqueado). Fase 1: story map e 14 fluxogramas. 15 pendências registradas. `docs/10` v1.2 e `docs/06` 1.36. | assistente (a pedido do Lucas) |
| 13/11/2026 | Mapeamento do app (T07), segunda rodada: decisões D-08 a D-14 (pendências PL-01, PL-02, PL-04, PL-08, PL-13 a PL-15 resolvidas; criadas PL-16 e PL-17). Rotas com foco (até 3). FL-06 e FL-07 reescritos; `docs/08` com a regra para três ou mais candidatas; `docs/10` v1.3; `docs/06` 1.37. | assistente (a pedido do Lucas) |
| 13/11/2026 | Mapeamento do app (T07): PL-16 e PL-17 resolvidas (D-15: até 5 candidatas; D-16: "outra opção" quando sobra uma rota só). FL-06 e FL-07 ajustados; `docs/08`, `docs/10` v1.4, `docs/06` 1.38. | assistente (a pedido do Lucas) |
| 13/11/2026 | Mapeamento do app (T07), Fase 2 em rascunho: 13 especificações de tela com wireframes por estado, navegação (Expo Router), catálogo de funcionalidades com o contrato esperado da API (PL-18, a conciliar com o backend) e dados por tela. Aguarda revisão do Lucas para marcar as telas como `pronta`. | assistente (a pedido do Lucas) |
| 13/11/2026 | Mapeamento do app (T07): Fase 2 aprovada pelo Lucas (D-17, telas `pronta`). Fase 3 em rascunho: tokens (contraste WCAG calculado), componentes, acessibilidade, mockups HTML (26 telas, 0 erros de JS no teste) e catálogo de textos (varredura limpa). | assistente (a pedido do Lucas) |
| 13/11/2026 | Mapeamento do app (T07) fechado: Fases 3 e 4 concluídas (validação do Lucas, D-18); `docs/10` v1.5 (revisão de consistência com D-01 a D-17); matriz de rastreabilidade com 76 AC + 9 RNF, que também serve à T10. Abertas: revisão de design (PL-19) e contrato da API (PL-18). Roteiro do vídeo adiado. | assistente (a pedido do Lucas) |
| 13/11/2026 | Compartilhamento de trajeto e localização ao vivo planejado como feature nativa, MVP "Depende do tempo" (D-19 a D-22): `docs/10` v1.6, `docs/03` §6, `docs/06` 1.41 e mapeamento (FL-15, FL-16, TL-14, TL-15, FN-15, FN-16, mockups e rastreabilidade com 86 AC). Proposta de premium registrada como pendência do pitch (T03). | assistente (a pedido do Lucas) |
| 13/11/2026 | Mapeamento do app (T07): prioridade do resultado passa a ser a menor exposição estimada (D-23, revê a D-10): rota com esse foco primeiro, selecionada e com rótulo em destaque; sem o foco, ordem por tempo. `docs/10` v1.7, `docs/06` 1.42, TL-07, fluxos, design, textos e mockups. | assistente (a pedido do Lucas) |
