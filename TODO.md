# TODO — VoltaSegura

Lista viva de tarefas do projeto. Entrega final das disciplinas: **19/11/2026, 23h55**.

**Última atualização:** 12/11/2026

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
| T02 | Construir o backlog do VoltaSegura | PENDENTE | a definir | a definir |
| T03 | Arquitetar o vídeo pitch (até 4 min) | PENDENTE | a definir | 19/11 23h55 |
| T12 | Roteamento: teste local do OpenTripPlanner 2 | PENDENTE | a definir | a definir |
| T13 | Dados: SSP-SP 2025 e janela de 12 meses | PENDENTE | a definir | a definir |
| T14 | Pesquisa com estudantes noturnos e universidades | PENDENTE | a definir | a definir |
| T15 | Marca: fechamento e checagens | EM DESENVOLVIMENTO | a definir | a definir |
| T16 | Slides da apresentação | PENDENTE | a definir | a definir |
| T17 | Benchmarking atualizado | PENDENTE | a definir | a definir |
| T19 | Base de conhecimento e dados já entregues | CONCLUÍDO | grupo | 11/11 |

### Parte B — Entregas de disciplinas (prazo de todas: 19/11/2026, 23h55)

| ID | Disciplina | Entrega | Status | Depende do core | Responsável |
|---|---|---|---|---|---|
| T04 | IA & Machine Learning | Notebook e relatório prontos; vídeo de até 5 min | EM DESENVOLVIMENTO | T13 (janela de 12 meses de dados) | a definir |
| T05 | SOA & Web Services | Backend REST, banco, migrações, Swagger, testes | EM DESENVOLVIMENTO | T01.17 (arquitetura), T12, `docs/08` | a definir |
| T06 | C# Software Development | Backend .NET (POO, EF Core, Web API, async, testes) | EM DESENVOLVIMENTO | T01.17 (arquitetura), `docs/08` | a definir |
| T07 | Mobile & IoT | App Expo com a jornada ida e volta, vídeo de até 3 min | PENDENTE | `docs/08` (3 telas e bloco "Sobre os dados"), T12, T15 | a definir |
| T08 | Operating Systems | Provisionamento Linux automatizado, vídeo de até 7 min | PENDENTE | T05/T06 (aplicação a hospedar) | a definir |
| T09 | Physical Computing | Circuito ESP32 no Wokwi, vídeo de até 4 min, `.txt` | PENDENTE | T01.10 (função do ESP32) | a definir |
| T10 | Testing, Compliance & QA | Features e Test Cases no Azure Boards, PDF | PENDENTE | T02 (backlog), `docs/08` | a definir |
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

- [ ] 1. Validar a regra de comparação em trajetos reais. *Em andamento: teste 1 do Lucas Simidu definido (11/11, ver T12); faltam horários, alternativas a comparar, outros testes e quem roda a regra.*
- [ ] 2. Teste local do OTP2 (ver T12). *Pulado em 11/11: questão técnica; falta um responsável técnico do grupo para executar.*
- [x] 3. Privacidade, retenção e LGPD da localização: decidido em 11/11 para o MVP (pacote mínimo com conta obrigatória, `docs/03` §6). Falta: responsável por acesso e exclusão, provedor de login, base legal e revisão jurídica (continuam em `docs/06`).
- [ ] 4. Vieses entre regiões (indicar o responsável pela metodologia). *Proposta de Lucas Simidu em avaliação (11/11): automatizar a revisão; o grupo ainda precisa escolher entre A, B e C (`docs/08`).*
- [ ] 5. Teste das mensagens de incerteza (proposta preliminar com 5 estudantes; levar ao grupo)
- [ ] 6. Indicador "Risco Cidadão" (despriorizado; ver T11)
- [ ] 7. GTFS/SPTrans: termos de redistribuição e ligação de IDs com a Olho Vivo
- [ ] 8. API Olho Vivo: cadência real, limites e termos de uso
- [ ] 9. Metrô 6 e 17: horários só de dia no feed (operação real ou lacuna?)
- [ ] 10. Função do circuito ESP32 (ver T09)
- [ ] 11. PL 1.169/2025: verificar tramitação antes de citar
- [ ] 12. Marca: checagens de marca, domínio e anterioridade
- [ ] 13. Marca: manter ou não a sombra da dobra do S
- [ ] 14. Marca: aprovação formal do fechamento v8–v10
- [ ] 15. Instituição do primeiro piloto
- [ ] 16. ODS conectados e justificativas no formato da FIAP (candidatos: 11 e 10)
- [x] 17. Arquitetura: SOA e C# no mesmo serviço ou módulos distintos (despriorizado; ver T05/T06) — *Fechado para as entregas em 11–12/11/2026: mesma solution .NET com domínio/infra únicos e duas APIs (`VoltaSegura.Api` e `VoltaSegura.Servicos`), evidência `src/csharp-backend/`. Como questão de produto segue despriorizada; ver `docs/06` §3.*
- [ ] 18. Hipóteses a validar (valor para estudantes, interesse das universidades, bases suficientes, diferenciação, persona Marina ou Ágatha)
- [ ] 19. Backlog do grupo (ver T02)

**Pronto quando:** nenhum item da seção 3 de `docs/06` estiver como `[EM ABERTO]` sem justificativa, e o histórico tiver uma linha por mudança.

---

## T02 — Construir o backlog do VoltaSegura

**Status:** PENDENTE
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
- [ ] Decidir a paleta dos slides (preto e laranja da apresentação ou dourado da marca; ver T15)
- [ ] Gravar, editar, subir no YouTube e conferir o link
- [ ] Colocar o link na tarefa de Testing (ver T18)

**Depende de:** marca (T15), protótipo do app (T07), entregas de ML (T04) e Cybersecurity (T11).
**Pronto quando:** vídeo publicado com até 4 min e link enviado.

---

## T12 — Roteamento: teste local do OpenTripPlanner 2

**Status:** PENDENTE
**Tipo:** Core do projeto
**Referência:** `docs/04` §6.2–6.3.

**Decisão já tomada:** OTP2 em servidor próprio com GTFS SPTrans + OpenStreetMap.
- [ ] Subir o OTP2 (Java 21) com o grafo de SP e medir memória e tempo
- [ ] Rodar 2 ou 3 trajetos reais em partes distintas do município e obter a geometria dos trechos a pé
- [ ] Estimar o custo de hospedagem a partir do consumo medido
- [ ] Rodar a regra de comparação nesses trajetos (alimenta T01.1)

**Testes do piloto** (cada teste agrupa os trajetos de ida e volta; novos testes podem ser acrescentados):

| Teste | Autor | Trajeto | Origem → destino | Horário e faixa do dia | Alternativas X/Y | Status |
|---|---|---|---|---|---|---|
| Teste 1 | Lucas Simidu | 1 (ida) | Residência do Lucas → Metrô Vila Sônia (Linha 4–Amarela) → saída em Oscar Freire → FIAP Paulista | a definir | a definir | PENDENTE |
| Teste 1 | Lucas Simidu | 2 (volta) | FIAP Paulista → Metrô Oscar Freire → Vila Sônia → residência do Lucas | a definir | a definir | PENDENTE |

- Definido em 11/11/2026 pelo Lucas (registro em `docs/06`, seção 3, item de validação em trajetos reais).
- O endereço da residência **não** entra no repositório (dado pessoal): usar um ponto de referência aproximado.
- Pendente do teste 1: horário e faixa do dia de cada trajeto; alternativas X e Y em cada sentido (a regra compara alternativas, ida e volta não são alternativas entre si); executar depois do OTP2.
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

**Status:** PENDENTE
**Tipo:** Core do projeto
**Referência:** `docs/03` §12; `docs/06` §2.
- [ ] Roteiro das entrevistas (sem dados pessoais nas anotações)
- [ ] Entrevistar estudantes do período noturno e possíveis parceiros universitários
- [ ] Registrar resultados e atualizar as hipóteses em `docs/06`
- [ ] Padronizar a persona (Marina, 22 ou Ágatha Santos, 24)
- [ ] Teste de compreensão das mensagens de incerteza (ver T01.5)

---

## T15 — Marca

**Status:** EM DESENVOLVIMENTO
**Tipo:** Core do projeto
**Referência:** `design/`; `docs/06` §3.
- [x] Nome definido (VoltaSegura), monograma "VS" e paleta com dourado `#FFC53D`
- [x] PNG e SVG premium gerados (`design/v10/`), teste a 48 px aprovado
- [ ] Aprovação formal do grupo do fechamento v8–v10
- [ ] Decidir a sombra da dobra do S
- [ ] Checagens de marca, domínio e anterioridade
- [ ] Alinhar a paleta dos slides (preto e laranja da apresentação ou dourado da marca)

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
- [x] Ficha da CitizenTech preenchida no `README.md` (indicador de impacto e ODS seguem em aberto, ver T01)
- [x] Renomeação para VoltaSegura (10/11)
- [x] Auditoria das fontes e token da Olho Vivo validado (10/11)
- [x] Datasets SSP-SP 2026 e Infosiga adquiridos, com catálogo (10/11)
- [x] Recorte das ocorrências e apresentação no app (`docs/07`)
- [x] Metodologia de comparação, parâmetros de calibração e auditoria (`docs/08`, `src/ml/dados/AUDITORIA_CALIBRACAO_SSP_2026.md`)
- [x] Decisões de roteamento (OTP2), confiança dos dados, "dados insuficientes", percepção de usuários e exclusões do MVP

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

**Status:** PENDENTE (só existe o README em `src/mobile-app/`)
**Tipo:** Entrega de disciplina (Mobile & IoT)
**Referência:** `docs/02` §5.

**Escopo previsto:** app React Native (TypeScript) com Expo Router para a jornada ida e volta do estudante noturno; consumir API ou mock; salvar em banco; acessibilidade.
- [ ] Cadastro e login (conta obrigatória; consentimento e aviso de privacidade no cadastro; exclusão da conta pelo app; `docs/03` §6)
- [ ] Telas e navegação (inclui as três telas de resultado: "menor exposição estimada", "sem diferença clara", "dados insuficientes")
- [ ] Bloco "Sobre os dados" (`docs/08`)
- [ ] Consumo de API ou mock e banco local
- [ ] README com a Ficha, instruções e prints
- [ ] Vídeo de até 3 min com o app rodando

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

**Bloqueio:** função do ESP32 no VoltaSegura ainda `[EM ABERTO]`. A entrega exige que o circuito agregue valor à solução, não seja projeto paralelo.
- [ ] Definir a função do circuito (hipótese anterior: sensor de ambiente ou iluminação em parada)
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
- [ ] Features do MVP com critérios de aceite (fluxo Planejar, Analisar, Comparar, Decidir, Revisar)
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
| 12/11/2026 | T01.17 concluída (arquitetura: mesma solution .NET, duas APIs). T05/T06 passam a EM DESENVOLVIMENTO: solution estruturada, migração + ETL com 278.961 boletins reais, 17 testes passando, APIs no ar com Swagger. Criada T20 (alinhar backend ao docs/07/docs/08). | assistente + grupo |
| 12/11/2026 | **T20 CONCLUÍDA**: backend alinhado ao docs/07/docs/08 — recorte por `NATUREZA_APURADA` (só FURTO - OUTROS 172.852 e ROUBO - OUTROS 62.365 em N), faixa pela HORA_OCORRENCIA_BO com fallback DESC_PERIODO (sem faixa: 0,9%), cobertura real por circunscrição (docs/08 §64) e frases fixas (§§99–102). Migração regenerada + recarga (278.687 boletins); 20 testes passando; APIs ao vivo e smoke test OK. Evidência: `src/csharp-backend/` (commit deste dia), README do backend, `docs/06` §1.17. | assistente + grupo |
