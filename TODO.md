# TODO — VoltaSegura

Lista viva de tarefas do projeto. Entrega final das disciplinas: **19/11/2026, 23h55**.

**Última atualização:** 19/11/2026

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
| T03 | Arquitetar o vídeo pitch (até 4 min) | EM DESENVOLVIMENTO (roteiro v1 recebido em 15/11) | a definir | 19/11 23h55 |
| T12 | Roteamento: teste local do OpenTripPlanner 2 | EM DESENVOLVIMENTO | Lucas Simidu | a definir |
| T13 | Dados: SSP-SP 2025 e janela de 12 meses | PENDENTE | a definir | a definir |
| T14 | Pesquisa com estudantes noturnos e universidades | CONCLUÍDO (fora desta fase) | grupo | 11/11 |
| T15 | Marca: fechamento e checagens | EM DESENVOLVIMENTO | a definir | a definir |
| T16 | Slides da apresentação | PENDENTE | a definir | a definir |
| T17 | Benchmarking atualizado | PENDENTE | a definir | a definir |
| T19 | Base de conhecimento e dados já entregues | CONCLUÍDO | grupo | 11/11 |
| T21 | Script automático de cobertura por região (revisão de vieses) | PENDENTE | a definir | antes do piloto |
| T22 | Decidir a feature premium e o modelo financeiro | EM DESENVOLVIMENTO (15/11: feature = VoltaSegura+ e modelo freemium individual + empresas, como `[HIPÓTESE]`; falta registrar o que resta e o que o grátis inclui) | grupo | antes do pitch (T03) |
| T23 | Alinhar a base de conhecimento ao roteiro do pitch (onda de perguntas) | EM DESENVOLVIMENTO (1ª rodada feita em 15/11; faltam itens listados na T23) | grupo | antes de gravar o pitch (T03) |
| T24 | Seguir rota: navegação no trajeto (D-34, US-23) | EM DESENVOLVIMENTO (Fases 1, 2 e 3 implementadas no código, 71 testes passam; sem commit e sem validação no aparelho) | a definir | a definir (D-22 se o prazo de 19/11 apertar) |
| T25 | Redesign do app pelos 16 mockups de `docs/app-map/redesign/inspo-melhorar-design/novas-telas` (horário sem teclado, barra de abas, telas Plus em simulação sem cobrança, Locais e Contatos) | CONCLUÍDO (código integrado e validado no aparelho pelo Lucas em 19/11: redesign, T25-B e correção do teclado; `tsc`, ESLint e Jest 857/857; sem commit. Em aberto, fora desta tarefa: caminho para "Planejar a volta" (FL-08), PL-34 a PL-37, frase do histórico no login (D-24)) | Lucas Simidu | 19/11/2026 23h55 |

### Parte B — Entregas de disciplinas (prazo de todas: 19/11/2026, 23h55)

| ID | Disciplina | Entrega | Status | Depende do core | Responsável |
|---|---|---|---|---|---|
| T04 | IA & Machine Learning | Notebook e relatório prontos; vídeo de até 5 min | EM DESENVOLVIMENTO | T13 (janela de 12 meses de dados) | a definir |
| T05 | SOA & Web Services | Backend REST, banco, migrações, Swagger, testes | EM DESENVOLVIMENTO | T01.17 (arquitetura), T12, `docs/08` | a definir |
| T06 | C# Software Development | Backend .NET (POO, EF Core, Web API, async, testes) | EM DESENVOLVIMENTO | T01.17 (arquitetura), `docs/08` | a definir |
| T07 | Mobile & IoT | App Expo com a jornada ida e volta, vídeo de até 3 min | EM DESENVOLVIMENTO | `docs/08` (bloco "Sobre os dados"; resultado revisto em `docs/app-map` D-01), T12, T15, T01.7 | Lucas Simidu |
| T08 | Operating Systems | Provisionamento Linux automatizado, vídeo de até 7 min | PENDENTE | T05/T06 (aplicação a hospedar) | a definir |
| T09 | Physical Computing | Circuito ESP32 no Wokwi, vídeo de até 4 min, `.txt` | PENDENTE | nenhuma (ESP32 fora do produto, decisão de 11/11) | a definir |
| T10 | Testing, Compliance & QA | Features e Test Cases no Azure Boards, PDF | EM DESENVOLVIMENTO (rascunhos em `src/qa/`) | T02 (backlog em `docs/10`), `docs/08` | a definir |
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

**Status:** EM DESENVOLVIMENTO (15/11/2026: vídeo gravado e fechado segundo o grupo; link no YouTube e descrição pendentes; roteiro v1 do grupo para 5 pessoas recebido e convertido em [`src/qa/pitch/ROTEIRO_PITCH.md`](src/qa/pitch/ROTEIRO_PITCH.md), com o `.txt` original ao lado. O texto ainda não está conferido contra a base: as divergências estão na **T23**. Faltam responsáveis, o storyboard das entregas, a gravação e o link.)
**Tipo:** Core do projeto (comunicação do produto; o link é enviado pela disciplina de Testing)
**Referência:** `docs/01_gs_briefing.md` §2–3; `docs/02_entregas_disciplinas.md` (seção Pitch); `docs/05_regras_linguagem_etica.md`.

**Regras da GS:**
- Vídeo de **até 4 minutos**, publicado no **YouTube**.
- Enviar o link na tarefa da disciplina de **Testing** (concorre ao prêmio "Melhor GS").
- Deve explicar o problema, a solução e quem ela ajuda, e **mostrar as entregas que mais somaram** (dashboard incluído).

**Decisões já tomadas que valem para o vídeo:** identidade da apresentação em preto e laranja, menos texto e Big Numbers em destaque (`docs/06` §1). Linguagem: "exposição estimada", nunca "rota segura", "área perigosa" ou "segurança garantida".

**O que fazer:**
- [ ] Definir responsável pelo roteiro, pela gravação e pela edição. *O roteiro v1 divide as falas entre "Pessoa 1" a "Pessoa 5", sem nomes (T23, PT-27).*
- [x] Escolher o fio da história. *15/11: definido pelo grupo no roteiro v1: luz acesa de quem espera → problema e números → solução em três passos → ética e demanda → negócio e roadmap → diferencial → fechamento com "voltar para casa não deveria ser uma aposta".*
- [ ] Escolher os Big Numbers (candidatos tirados dos dados do repositório, a conferir antes de usar: 274.990 BOs de roubo/furto na capital em 2026; 39,8% dos BOs do recorte sem hora utilizável; 47% dos bairros com menos de 10 BOs em 2026). Não usar nenhum número como rótulo de bairro ou rua. *15/11: o roteiro v1 usa outros números (IBGE e FBSP/Datafolha), sem fonte registrada na base (T23, PT-02 a PT-05).*
- [ ] Escolher as entregas que entram (app, API, ML, dashboard de Cybersecurity, circuito ESP32), de acordo com o que estiver pronto. *15/11: o roteiro v1 não mostra nenhuma entrega (T23, PT-25).*
- [ ] Montar o roteiro com tempos por bloco, somando no máximo 4 min. *15/11: v1 recebida, com cerca de 3min56s só de fala, estimados por contagem de palavras (`src/qa/pitch/ROTEIRO_PITCH.md`). Falta medir num ensaio e abrir espaço para as entregas (T23, PT-24).*
- [ ] Storyboard simples (telas e demonstrações a gravar)
- [ ] Modelo de receita no pitch: depende da **T22** (feature premium e modelo financeiro); entra como "modelo a validar"
- [ ] Decidir a paleta dos slides (preto e laranja da apresentação ou dourado da marca; ver T15)
- [ ] Gravar, editar, subir no YouTube e conferir o link
- [ ] Colocar o link na tarefa de Testing (ver T18)

**Depende de:** marca (T15), protótipo do app (T07), entregas de ML (T04) e Cybersecurity (T11), modelo de negócio (T22) e alinhamento do roteiro com a base (T23).
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

## T22 — Decidir a feature premium e o modelo financeiro

**Status:** PENDENTE
**Responsável:** grupo
**Prazo:** antes do pitch (T03)
**Tipo:** Core do projeto
**Referência:** proposta em `Claude outputs/proposta_premium_voltasegura.md` (fora do git); `docs/03` §8; `docs/10` §4 e §9; `docs/05` (o que pode ser prometido).

**Contexto (13/11/2026):** o grupo concordou que o B2B2C só com universidades é nichado demais (muitas não pagariam, sobretudo as públicas). A proposta em discussão é uma assinatura individual (freemium). O princípio proposto é "o grátis informa e o premium poupa trabalho": comparação de exposição, transparência dos dados, acessibilidade e compartilhamento de localização ficam grátis.

- [ ] Decidir qual é a feature premium. Candidata principal: **"Rotina da semana"** (trajetos fixos com aviso antes de sair). Outras opções: preferências de conforto, "Volta ao vivo" (depende de fonte de tempo real) e extras do compartilhamento
- [ ] Decidir se os extras do compartilhamento entram no premium ou se tudo do compartilhamento fica grátis (o compartilhamento básico já é nativo e gratuito, D-19)
- [ ] Decidir o modelo financeiro: assinatura individual como receita principal? Quais canais complementares entram (empresas com turno noturno, eventos, universidades como um dos canais, painéis agregados depois)?
- [ ] Definir como o modelo aparece no pitch e nos slides (sempre como "modelo a validar"; sem preço inventado; sem prometer segurança no premium)
- [ ] Registrar a decisão como `[HIPÓTESE]` em `docs/03` §8, `docs/10` §4 e §9 e `docs/06` (com histórico)

**Pronto quando:** feature premium e modelo financeiro decididos pelo grupo e registrados nas docs acima, com o status de hipótese.

---

## T23 — Alinhar a base de conhecimento ao roteiro do pitch

**Status:** EM DESENVOLVIMENTO (mapeamento e 1ª rodada de perguntas feitos em 15/11/2026; vídeo já gravado e fechado, então só legenda, narração e descrição se ajustam)

**Resultado da 1ª rodada (15/11/2026; registro em `docs/06` 1.44):**

| Itens | Resposta | Aplicado em |
|---|---|---|
| PT-01 | `[DECISÃO]` Público amplo: quem volta à noite (estudantes e trabalhadores) | `docs/03` §3, `docs/10` §2, README (Ficha), AGENTS.md |
| PT-02 a PT-04 | Fichas pesquisadas; conferência na fonte primária `[EM ABERTO]`; IBGE é de 2021 | `docs/03` §10, `ROTEIRO_PITCH.md` |
| PT-05 | Números do pitch principais; os antigos de reserva | `docs/03` §10 |
| PT-06 | Construir até 19/11; só afirmar se estiver pronto | `docs/06` 1.44; depende de T07 |
| PT-10 | Infosiga e GeoSampa citados como fontes do projeto (app + ML), sem prometer no app | `ROTEIRO_PITCH.md` (ressalvas) |
| PT-12, PT-16 | `[HIPÓTESE]` Freemium individual + empresas; universidades saem; "sempre gratuito" mantido sem a ressalva no vídeo | `docs/03` §8, `docs/10` §4 |
| PT-13, PT-14 | `[DECISÃO]` VoltaSegura+ no MVP em versão mínima, rotina só no aparelho, "Depende do tempo" | `docs/10` F7.1/US-22, `docs/03` §6, app-map D-31 |
| PT-17 a PT-20 | `[HIPÓTESE]` Relatos de infraestrutura como exceção de roadmap; agente e integrações a partir do VoltaSegura+ | `docs/03` §9, `docs/10` DT-10, P-07, P-08, `docs/05` |
| PT-21 a PT-23 | Verificação do Waze, Google Maps e Moovit fica com o grupo (T17) | T17 |
| PT-24 a PT-27 | Superados ou abertos pelo vídeo já gravado (tempo, entregas mostradas, ODS, responsáveis): confirmar com o grupo | `[EM ABERTO]` |
| PT-07, PT-08, PT-09, PT-11, PT-15 | Não perguntados: ajustes de fala; vão como ressalva na descrição se necessário | `[EM ABERTO]` |

**Faltam:** mapear o VoltaSegura+ em `docs/app-map/` (fluxo, tela, funcionalidade, rastreabilidade), implementar F7.1 e FN-15 se o tempo permitir, conferir as estatísticas na fonte primária, decidir o que o plano grátis inclui, fechar PT-24 a PT-27 e os itens não perguntados.
**Responsável:** grupo
**Prazo:** antes de gravar o pitch (T03)
**Tipo:** Core do projeto
**Referência:** roteiro v1 em [`src/qa/pitch/ROTEIRO_PITCH.md`](src/qa/pitch/ROTEIRO_PITCH.md); conferido contra `docs/01` a `docs/10`, `README.md`, `AGENTS.md`, `docs/app-map/01_decisoes.md` e `src/mobile-app/todo-mobile.md`.

**Como fazer:** passar pelos itens PT-01 a PT-27 numa onda de perguntas, um tema por vez. Cada resposta vira `[DECISÃO]` ou `[HIPÓTESE]`, ou fica `[EM ABERTO]`, e tem dois efeitos possíveis: **atualizar a base** (o pitch passa a valer) ou **ajustar a fala** (a base continua valendo). Registrar em `docs/06` com histórico e em `prompts.md`, aplicar nos documentos da tabela final e só então liberar a gravação.

### O que já está alinhado (não precisa de pergunta)

Exposição estimada como conceito; "não prometemos segurança"; não classificar bairros como perigosos; "quando faltam dados, deixamos isso claro" (dados insuficientes); exposição estimada só nos trechos a pé; origem, destino e horário; comparação por tempo, conexões e confiabilidade dos dados; ida e volta; piloto no município de São Paulo; não vender dados pessoais; SSP-SP e SPTrans como origem dos dados; Waze citado como precedente de alertas.

### Divergências e lacunas

Tipo: **Conflito** = o pitch contradiz uma decisão registrada · **Novo** = conceito que não está na base · **Ajuste** = fala imprecisa diante do que a base define.

**A. Público**

| ID | Tipo | O que o pitch diz | O que a base diz | Pergunta da onda |
|---|---|---|---|---|
| PT-01 | Conflito | Fala de quem sai "da aula **ou do trabalho**", cita 8,6 milhões de trabalhadores noturnos e empresas com turno noturno; não cita estudantes universitários nem a persona | Público inicial = estudantes universitários do período noturno; trabalhadores noturnos são "público futuro, não priorizar agora"; persona Ágatha Santos, 24 (`docs/03` §3, `docs/10` §2, Ficha do `README.md`, `AGENTS.md`) | Ampliar o público inicial para estudantes **e** trabalhadores noturnos, ou manter estudantes e ajustar a fala? A persona aparece no vídeo? |

**B. Estatísticas** (`docs/05` exige fonte, público, amostra, período e o que o número mede)

| ID | Tipo | O que o pitch diz | O que a base diz | Pergunta da onda |
|---|---|---|---|---|
| PT-02 | Novo | IBGE: "mais da metade" se sente insegura andando sozinha à noite; "um em cada cinco" de dia | Não consta. `docs/03` §10 tem só Ipsos-Ipec/Rede Nossa São Paulo (71%) e Patrícia Galvão/Locomotiva (63%, 35%, 42%) | Qual pesquisa e qual ano (ex.: módulo de vitimização da PNAD)? Público, amostra, o que mede? |
| PT-03 | Novo | 8,6 milhões de brasileiros trabalham à noite, total ou parcialmente | Não consta | Mesma ficha: fonte exata, ano e definição de "trabalho noturno" |
| PT-04 | Novo | FBSP + Datafolha, março de 2026: 35,6% deixaram de sair à noite por medo; 36,5% mudaram seus percursos | Não consta | Nome da pesquisa, público, amostra, abrangência (Brasil?) e link |
| PT-05 | Conflito | Não usa os Big Numbers da base | `docs/03` §10 (71%; 63/35/42) e candidatos da T03 (274.990 BOs etc.) | Os números do pitch substituem os de `docs/03` §10 ou os antigos ficam como reserva para os slides (T16)? |

**C. Solução e funcionalidades**

| ID | Tipo | O que o pitch diz | O que a base diz | Pergunta da onda |
|---|---|---|---|---|
| PT-06 | Conflito | "Você ainda pode compartilhar seu trajeto com quem espera por você" (como recurso disponível) | F2.5 é MVP **"Depende do tempo"** (D-22); FN-15 e FN-16 estão `PENDENTE`, 0% (`docs/10` F2.5, `src/mobile-app/todo-mobile.md`) | Construir o compartilhamento até 19/11, ou mudar a fala para roadmap? O vídeo não pode mostrar como pronto o que não existe |
| PT-07 | Ajuste | "Tudo em uma única tela" | Resultado = mapa + container (D-01); "Por que esta rota?", "Sobre os dados" e "Dados considerados" abrem outras telas | Aceitar a simplificação ou trocar por "tudo no mesmo app"/"na mesma comparação"? |
| PT-08 | Ajuste | Pessoa 3: "comparamos apenas os trechos a pé" | Só a contagem de registros usa os trechos a pé; tempo e conexões valem para a rota inteira (`docs/08`). A Pessoa 2 já fala certo: "exposição estimada nos trechos a pé" | Trocar por "a exposição estimada considera apenas os trechos a pé"? |
| PT-09 | Ajuste | "escolher o **melhor** caminho"; "a tecnologia [...] ajuda a se **antecipar** a [riscos]" | O app não elege a melhor rota (F3.2 AC5); `docs/05` proíbe sugerir previsão ("prevemos crimes") | Manter, ou trocar por "comparar caminhos" e "decidir com antecedência"? |

**D. Dados e viabilidade**

| ID | Tipo | O que o pitch diz | O que a base diz | Pergunta da onda |
|---|---|---|---|---|
| PT-10 | Conflito | "Utilizamos dados públicos da **SSP-SP e do Infosiga**" | O app usa SSP-SP (furto e roubo na comparação; trânsito pela natureza da própria SSP), GTFS da SPTrans e OpenStreetMap. O Infosiga só entra na entrega de ML (`docs/04`, `docs/07`, `docs/08`, `docs/10` DT-03) | Trocar a fala por "SSP-SP e SPTrans", ou decidir usar o Infosiga no produto (nova decisão em `docs/07` e `docs/08`)? |
| PT-11 | Ajuste | "A informação já existe. Está na SSP-SP, na SPTrans e no **GeoSampa**" | A iluminação do GeoSampa é indicador de fase 3 (P-03), fora do MVP | Manter (é descrição do problema, não do app) ou tirar o GeoSampa para não sugerir que o app já o usa? |

**E. Negócio e privacidade** (liga com a T22)

| ID | Tipo | O que o pitch diz | O que a base diz | Pergunta da onda |
|---|---|---|---|---|
| PT-12 | Conflito | Freemium: comparar e consultar "será sempre gratuito"; receita pelo VoltaSegura+; empresas com turno noturno oferecem como benefício. Universidades não aparecem | Modelo = B2B2C começando por universidades `[HIPÓTESE]` (`docs/03` §8, `docs/10` §4, `docs/06` §2, `AGENTS.md`); a T22 discute o freemium, sem decisão | Freemium individual vira o modelo principal? Universidades saem ou ficam como canal? Empresas entram como canal B2B2C? |
| PT-13 | Novo | **VoltaSegura+**: "cadastrar sua rotina e receber avisos antes de sair" | Nome e recurso não constam; é a candidata "Rotina da semana" da T22. Atenção: "premium" já nomeia o redesign visual do app (D-28), o que pode confundir | Confirmar nome e escopo. O que diz o aviso (horário de saída? mudança de resultado?). Entra no MVP ou é fase posterior? |
| PT-14 | Conflito | Cadastrar rotina e receber avisos (VoltaSegura+) | Consultas não são guardadas; histórico só no aparelho; histórico no servidor (opção C) foi rejeitado (`docs/03` §6, DT-08) | A rotina fica só no aparelho, com notificação local (compatível com a decisão atual), ou no servidor (revê DT-08 e contradiz a fala da PT-15)? |
| PT-15 | Ajuste | "Não armazenamos históricos de buscas nem vendemos dados pessoais" | Correto para o servidor. Existem histórico opcional e lugares salvos **no aparelho** (F1.4, D-29) e guarda temporária durante o compartilhamento (D-21) | Trocar por "não guardamos suas buscas em nossos servidores"? |
| PT-16 | Conflito | Modelo apresentado como certo ("será sempre gratuito", "poderão oferecer") | Pitch e slides devem apresentar o modelo como "a validar", sem preço (T22; `docs/06` §2) | Assumir "sempre gratuito" como compromisso público? Incluir "modelo a validar" na fala ou na tela? |

**F. Roadmap**

| ID | Tipo | O que o pitch diz | O que a base diz | Pergunta da onda |
|---|---|---|---|---|
| PT-17 | Conflito | 1º passo: usuários reportam problemas (postes apagados, calçadas sem acessibilidade) e ganham 3 dias de VoltaSegura+; "dados anônimos" ajudam a melhorar a cidade | Relatos de usuários estão fora: "nenhum relato vira dado no app" (DT-10, `docs/06` §3, `docs/10` §8), por viés, estigmatização, privacidade e moderação. O roadmap (`docs/03` §9) não tem relatos | Relato de infraestrutura é diferente de percepção de segurança: o grupo abre essa exceção? Os relatos aparecem no app ou entram na comparação? Quem recebe os dados (prefeitura, SP156)? Como moderar e evitar relato falso para ganhar o premium? Como anonimizar a localização? |
| PT-18 | Ajuste | Depois: "agente inteligente para reorganizar trajetos diante de atrasos" | Fase 2: replanejamento com tempo real de fonte confiável (P-01, depende da Olho Vivo, T01.8); fase 3: assistente de orientação após validação (sem ID no backlog) | Registrar o agente como item do roadmap? Em que fase? Ele depende do tempo real |
| PT-19 | Novo | "Integrações com aplicativos de mobilidade" | Fase 4 só cita integrações institucionais e API | Quais aplicativos (transporte por app, Moovit)? Em que fase? |
| PT-20 | Ajuste | Ordem: relatos → agente e integrações | Fases 2 (tempo real, compartilhamento) → 3 (indicadores, preferências, assistente) → 4 (parcerias, API, outras cidades) | Reordenar o roadmap de `docs/03` §9 e `docs/10` §9 para seguir o pitch? |

**G. Concorrência e diferencial**

| ID | Tipo | O que o pitch diz | O que a base diz | Pergunta da onda |
|---|---|---|---|---|
| PT-21 | Ajuste | Waze "é voltado a motoristas e depende de relatos dos usuários" | Benchmarking funcional pendente (T17); `docs/03` §7 e `docs/05` pedem testar os concorrentes antes de afirmar | Verificar o Waze hoje (alertas de insegurança, origem dos dados, modo a pé) antes de gravar? |
| PT-22 | Ajuste | Só o Waze é citado | O feedback do professor pede reconhecer Google Maps, Waze e Moovit (`docs/03` §2) | Acrescentar uma frase sobre Google Maps e Moovit (planejam pelo tempo, sem exposição estimada)? |
| PT-23 | Novo | Diferencial: "pensado para quem caminha e usa transporte público", "partimos de registros oficiais", "outras soluções alertam durante o caminho, nós ajudamos a escolher antes de começar" | Frase em teste: "não mostramos apenas informações sobre riscos; organizamos essas informações para apoiar uma decisão prática de mobilidade" `[HIPÓTESE]` (`docs/03` §4 e §7, `docs/10` §1) | Adotar a frase do pitch como diferencial `[HIPÓTESE]`? "Outras soluções" generaliza: Google Maps e Moovit também planejam antes da saída. E "partimos de registros oficiais" choca com os relatos da PT-17 |

**H. Exigências da GS para o vídeo**

| ID | Tipo | O que o pitch diz | O que a base diz | Pergunta da onda |
|---|---|---|---|---|
| PT-24 | Conflito | ~629 palavras faladas, ou ~3min56s (3min42s a 4min12s) | Limite de 4 min (`docs/01` §3) | Cortar falas para abrir tempo para as demonstrações? Meta de tempo de fala? |
| PT-25 | Conflito | Nenhuma entrega aparece (app, API, ML, dashboard) | O vídeo deve mostrar "as entregas que mais somaram (dashboard incluído)" (`docs/02`, seção Pitch) | Quais entregas entram, com imagem sobre a fala ou em bloco próprio? |
| PT-26 | Ajuste | ODS não é citado | ODS 11 (metas 11.2 e 11.7) na Ficha (`docs/01` §7) | Citar o ODS 11 numa frase ou num letreiro? |
| PT-27 | Lacuna | Falas de "Pessoa 1" a "Pessoa 5" | T03 pede responsáveis | Quem faz cada fala, quem grava e quem edita? |

### Produtos e funcionalidades do pitch que não existem no app hoje (PF-01 a PF-12)

Levantamento de 15/11/2026, com as respostas da 1ª rodada já aplicadas. **Evidência da situação no app:** rotas em `src/mobile-app/src/app/` (só há as telas TL-01 a TL-13; `compartilhar/[rotaId].tsx` e `acompanhar/[token].tsx` são `TelaProvisoria`), `src/mobile-app/todo-mobile.md` (FN-15 e FN-16 `PENDENTE`) e `docs/app-map/06_funcionalidades.md` (FN-01 a FN-16, sem VoltaSegura+, relatos nem agente). Não rodei o app para este levantamento. Regra do pitch: **recurso que não existe não é mostrado nem dito como disponível** (`docs/05`).

| ID | O que o pitch diz | Atualização combinada (1ª rodada) | Situação no app hoje | Onde está mapeado | Próximo passo |
|---|---|---|---|---|---|
| PF-01 | "Você ainda pode compartilhar seu trajeto com quem espera por você" | PT-06: construir até 19/11 e só afirmar se estiver pronto | **Não existe.** TL-14 é tela provisória; sem endpoint, link temporário nem GPS em segundo plano | FN-15, US-21, D-22 ("Depende do tempo"), PL-18, PL-24 | Decidir se entra antes do prazo (T07); se não, ressalva na descrição do vídeo |
| PF-02 | (implícito) a pessoa que espera acompanha o trajeto | Mesma decisão da PF-01 | **Não existe.** TL-15 é tela provisória; deep link `voltasegura://acompanhar/<token>` só configurado | FN-16, US-21 AC6–AC8, PL-23 | Segue a PF-01 |
| PF-03 | **VoltaSegura+**: "cadastrar sua rotina e receber avisos antes de sair" | PT-13/PT-14 `[DECISÃO]`: MVP em versão mínima; rotina **só no aparelho**, notificação local; "Depende do tempo" | **Não existe.** Sem tela, sem função em `06_funcionalidades.md`, sem notificação local; registrado só nos docs | D-31, `docs/10` F7.1/US-22; **falta** FL, TL e FN no app-map | Mapear em `docs/app-map/` (fluxo, tela, FN, rastreabilidade) e definir o texto do aviso e o gatilho (horário de saída? mudança no resultado?) |
| PF-04 | Plano gratuito x VoltaSegura+ (comparar e consultar "sempre gratuito") | PT-12/PT-16 `[HIPÓTESE]`: freemium individual; "sempre gratuito" mantido no vídeo | **Não existe.** Sem plano, assinatura nem cobrança; todo o app é gratuito hoje | `docs/03` §8, `docs/10` §4, T22 | Definir o que o plano grátis inclui (`[EM ABERTO]`); cobrança real fica fora do protótipo |
| PF-05 | Empresas com turno noturno oferecem o VoltaSegura+ como benefício | PT-12 `[HIPÓTESE]`: empresas como canal; universidades saem | **Não existe.** Sem conta de empresa, código de benefício nem painel | `docs/03` §8, T22 | Só hipótese de negócio: validar com empresas (T14 ampliada); nada a construir no protótipo |
| PF-06 | Usuários **reportam** postes apagados e calçadas sem acessibilidade | PT-17 `[HIPÓTESE]`: exceção de roadmap só para infraestrutura; crime e percepção de segurança seguem fora (DT-10) | **Não existe.** Sem formulário, foto, mapa de relatos nem moderação; DT-10 diz que nenhum relato vira dado no app | `docs/10` DT-10, P-07; `docs/03` §9 (roadmap) | Roadmap. Em aberto: moderação, antifraude, anonimização da localização, destino dos dados |
| PF-07 | Quem reporta ganha **3 dias de VoltaSegura+** | Depende da PF-03 e da PF-06 | **Não existe.** Sem recompensa nem controle de período do plano | `docs/10` P-07 | Roadmap. Risco: relato falso para ganhar o plano (antifraude em aberto) |
| PF-08 | "Dados anônimos poderão ajudar a melhorar a cidade" | PT-17: destino dos dados `[EM ABERTO]` | **Não existe.** Sem exportação, painel para prefeitura nem canal com o SP156 | `docs/10` P-07 | Roadmap. Definir quem recebe e como anonimizar antes de afirmar |
| PF-09 | **Agente inteligente** para reorganizar trajetos diante de atrasos | PT-18/PT-20 `[HIPÓTESE]`: roadmap, a partir do VoltaSegura+; depende de tempo real | **Não existe.** O app compara antes da saída; não replaneja nem usa tempo real | `docs/03` §9, `docs/10` P-08; depende da Olho Vivo (T01.8) | Roadmap. Não mostrar no vídeo como pronto |
| PF-10 | **Integrações com aplicativos de mobilidade** | PT-19 `[HIPÓTESE]`: roadmap, a partir do VoltaSegura+ | **Não existe.** Sem integração, deep link para outros apps nem API pública | `docs/03` §9 | Roadmap. Quais aplicativos: `[EM ABERTO]` |
| PF-11 | Dados do **Infosiga** ("utilizamos dados públicos da SSP-SP e do Infosiga") | PT-10: fonte do projeto (ML), sem prometer no app | **Não está no app.** O app usa SSP-SP, GTFS da SPTrans e OpenStreetMap; o Infosiga só entra no estudo de ML | `docs/04`, `docs/07`, `docs/08`, DT-03 | Manter a ressalva na descrição do vídeo; só entra no app por nova decisão em `docs/07` e `docs/08` |
| PF-12 | Dados do **GeoSampa** ("está na SSP-SP, na SPTrans e no GeoSampa") | PT-10: fonte futura, sem prometer no app | **Não está no app.** Iluminação do GeoSampa é indicador de fase 3 | `docs/04`, P-03 | Mesma ressalva da PF-11 |

**Existe só em parte (conferir antes de mostrar no vídeo):** "tudo em uma única tela" (o resultado é mapa + container, mas "Por que esta rota?", "Sobre os dados" e "Dados considerados" abrem outras telas: PT-07); "cruzamos dados de transporte e ocorrências" (o app tem a comparação, mas conferir se a consulta roda com dados reais ou ainda em `mock`; `todo-mobile.md` I-08 e FN-07 indicam troca `mock|api`).

**Ordem sugerida para a decisão do grupo:** PF-03 (já é decisão do MVP e não está mapeada), PF-01/PF-02 (afirmadas no vídeo como disponíveis), PF-04 (define o plano grátis); PF-05 a PF-12 são roadmap ou fonte e entram só como ressalva na descrição do vídeo, nos slides e no `docs/03` §9.

### Documentos a atualizar depois da onda

Cada linha só é aplicada se a resposta da onda mudar a base. Quando a decisão for ajustar a fala, a alteração é só no roteiro.

| Documento | Seções | Itens |
|---|---|---|
| `docs/03_projeto_documento_vivo.md` | §3 público; §6 privacidade; §7 concorrência e diferenciação; §8 modelo de negócio; §9 roadmap; §10 estatísticas; §11 estrutura da apresentação (passa a seguir o roteiro) | PT-01, PT-02 a PT-05, PT-12 a PT-17, PT-18 a PT-20, PT-21 a PT-23 |
| `docs/04_dados_fontes.md` | Papel do Infosiga e do GeoSampa no produto; relatos de usuários como fonte futura | PT-10, PT-11, PT-17 |
| `docs/05_regras_linguagem_etica.md` | Frases novas ("antecipar riscos", "melhor caminho", "sempre gratuito"); regra "recurso não construído não aparece como disponível"; linguagem dos relatos de infraestrutura | PT-06, PT-09, PT-16, PT-17 |
| `docs/06_estado_atual.md` | Decisões e hipóteses novas; revisão de DT-10 (relatos); hipótese das universidades (§2); histórico | todos os que virarem decisão |
| `docs/07` e `docs/08` | Só se o Infosiga entrar no produto | PT-10 |
| `docs/10_backlog_produto.md` | §1 diferenciação; §2 público; §3 benchmarking; §4 modelo; nova feature do VoltaSegura+ (rotina e avisos); DT-08 e DT-10; §8 fora do escopo; §9 roadmap (relatos, agente, integrações); status de F2.5 | PT-01, PT-06, PT-12 a PT-14, PT-17 a PT-23 |
| `docs/app-map/` | Nova decisão D-xx se o VoltaSegura+ ou o compartilhamento mudarem o app | PT-06, PT-13, PT-14 |
| `README.md` (Ficha) | Cidadão beneficiado; como funciona (compartilhamento); indicador de impacto, se o pitch o definir | PT-01, PT-06 |
| `AGENTS.md` | Linhas "Público inicial" e "Modelo comercial a validar" | PT-01, PT-12 |
| `src/qa/pitch/ROTEIRO_PITCH.md` | Falas ajustadas, ficha das estatísticas preenchida, tempos medidos no ensaio, storyboard das entregas | todos os de "ajustar a fala", PT-24, PT-25 |
| `TODO.md` | T03, T16 (slides seguem o pitch), T17 (Waze), T22 (fechada pela PT-12 a PT-16) | PT-12 a PT-16, PT-21, PT-24, PT-25 |

**Pronto quando:** PT-01 a PT-27 respondidos, decisões registradas em `docs/06`, documentos da tabela atualizados e roteiro v2 sem nenhuma fala que contradiga a base.

## T24 — Seguir rota (navegação no trajeto)

- **Tipo:** Core do projeto (decisão de produto D-34). A entrega de Mobile (T07) depende dela para a demo.
- **Status geral:** EM DESENVOLVIMENTO
- **Decisão:** `docs/app-map/01_decisoes.md` D-34 (`[DECISÃO — 18/11/2026]`, revê D-04 e US-05 AC3); `docs/10` F2.6 / US-23; `docs/app-map` FL-18 e TL-18.
- **Prazo:** a definir. Se o prazo de 19/11 apertar, a construção pode ficar para depois (D-22).
- **Responsável:** a definir

| Item | Status | Evidência |
|---|---|---|
| T24.1 Fase 1, primeiro plano: leitura só depois de "Começar", com a tela ligada e o app aberto | VALIDADO NO CELULAR (Lucas, 18/11/2026). Relato: a primeira busca demorou mais que o normal (ver PL-33) | `src/mobile-app/src/seguir/useSeguirRota.ts`, `src/mobile-app/src/services/seguirRota.ts`, `src/mobile-app/src/app/(app)/seguir/[rotaId].tsx`. Testes: `npx jest src/seguir src/services/seguirRota`. |
| T24.2 Fase 2, recálculo ao desviar | EM DESENVOLVIMENTO (pronto no código e nos testes; regras decididas em 18/11/2026; falta validar no aparelho, PL-26) | `src/mobile-app/src/seguir/recalculo.ts` e `useSeguirRota.ts`; testes em `recalculo.test.ts` (9) e `useSeguirRota.test.tsx`. Decisões: mesma sequência de modos e mesmo destino (até 100 m), resposta substitui a anterior (D-34 item 5; PL-28 e PL-29 resolvidas ou parciais). Exceção à D-21 registrada (D-34 item 6; PL-31). Em aberto: PL-30 (horário do recálculo) e logs do roteador. |
| T24.3 Fase 3, segundo plano com sessão ativa | VALIDADO NO CELULAR (Lucas, 18/11/2026), no que foi testado. Build de desenvolvimento (PL-27) segue como decisão em aberto | `src/mobile-app/src/seguir/segundoPlano.ts`; testes em `segundoPlano.test.ts` e `segundoPlano.expoGo.test.ts`. |
| T24.4 Documentação: D-34, D-04 revista, US-05 AC3, US-23 / F2.6, FL-18, TL-18, FN-20, PL-26 a PL-32, índices, `docs/06` 1.46 e `prompts.md` | EM DESENVOLVIMENTO | `docs/app-map/01_decisoes.md`, `docs/10_backlog_produto.md` v1.11, `docs/app-map/03_fluxogramas/FL-18_seguir_rota.md`, `docs/app-map/04_telas/TL-18_seguir.md`, `docs/app-map/06_funcionalidades.md` (FN-20), `docs/app-map/12_pendencias_e_lacunas.md`, `docs/06_estado_atual.md` 1.46, `prompts.md`. Revisão humana pendente. |
| T24.5 Decisões em aberto: rótulo do botão ("Parar" na D-20 × "Encerrar" no app) | PENDENTE | D-34 item 8. Tempo máximo decidido: sem tempo máximo na Seguir rota, encerra por Encerrar ou chegada (D-34 item 7; PL-32 parcial). |
| T24.6 Commit das alterações | CONCLUÍDO (19/11/2026, a pedido do Lucas) | Commits separados por contexto na branch `feat/redesign-t25`, sem coautoria de IA. |

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

**Status:** EM DESENVOLVIMENTO (18/11/2026: pacote de demonstração regularizado e validado; publicação, acesso do professor e envio pendentes)
**Tipo:** Entrega de disciplina (SOA & Web Services)
**Referência:** `docs/02` §1; `src/soa-backend/README.md`; `src/soa-backend/evidencias/README.md`.

[DECISÃO de implementação da entrega] Demonstração autônoma com SQLite real, migrações e API reais, roteamento mock e 80 registros sintéticos explicitamente identificados. Não altera a escolha OTP2/SSP do produto nem afirma integração ao vivo. O PDF p. 27 não exige OTP nominalmente.

- [x] Arquitetura .NET compartilhada e domínio, EF Core/SQLite, endpoints e Swagger implementados.
- [x] Corrigidos corredor por segmento (caminhadas separadas), margem de longitude, cobertura com ambas as coordenadas/faixa, `L = 0` anulável, limite estrito de significância e validações de entrada.
- [x] Horário de saída com fuso, faixa por caminhada, até cinco candidatas e retorno de alternativa única sem comparação.
- [x] Adaptador opcional OTP GraphQL atualizado e testado com respostas controladas; mock segue padrão da entrega.
- [x] **46 testes aprovados**, zero falhas; aviso de descarte resolvido. Testes incluem regressões, migrações reais e API HTTP.
- [x] Migração de proveniência adicionada; ambas aplicadas em banco novo e reaplicadas sem mudanças. Carga sintética idempotente e separada da SSP.
- [x] API executada por HTTP: situação do banco, comparação, validação 400 e auditoria sem localização; persistência confirmada após reinício. Logs, JSONs e prints reais em `src/soa-backend/evidencias/`.
- [x] README com integrantes/RMs fornecidos pelo usuário, scripts Windows, instruções manuais, rubrica, exemplos e limites. `DADOS_REAIS.md` explica obtenção da SSP e conexão OTP opcional.
- [x] Empacotamento corrigido: solution completa nos dois espelhos; Ficha atual, registro de IA, links corretos e exclusão de artefatos. Preparador local `scripts/preparar_entregas_backend.py`, sem push; `sync_mirrors.sh` corrigido e sintaxe Bash conferida.
- [x] Pacote SOA independente testado em pasta limpa pelo comando do README: restore, build, 46 testes, migrações e carga passaram. Links principais conferidos.
- [ ] Publicar monorepo e espelhos SOA/C#; conferir acesso do professor e enviar link na tarefa SOA (T18). Não houve commit/push nesta regularização.
- [ ] [EM ABERTO — integração real, fora da demonstração validada] Planilha SSP e servidor OTP indisponíveis ao usuário; carga real, OTP ao vivo, autenticação/contrato completo do app seguem não validados. Não apresentar como concluídos. Script ETL atualizado para caminho configurável e proveniência; execução com base real pendente.

O diagnóstico anterior foi preservado em `src/soa-backend/PLANO_ENTREGA.md`, marcado como histórico.

---

## T06 — C# Software Development

**Status:** EM DESENVOLVIMENTO (18/11/2026: solution compartilhada compilada, 46 testes aprovados e API C# exercitada por HTTP; publicação/envio pendentes)
**Tipo:** Entrega de disciplina (C# Software Development)
**Referência:** `docs/02` §3; `src/csharp-backend/README.md`; evidências compartilhadas em `src/soa-backend/evidencias/`.

- [x] Arquitetura compartilhada com API própria, POO, interfaces, DI, EF Core/LINQ e async/await.
- [x] Correções e testes da T05 aplicam-se ao domínio/infra compartilhados; consulta agregada C# retornou HTTP 200 e identificou acervo sintético.
- [x] Histórico pessoal no servidor desativado por padrão (GET/POST de trajetos retornam 403), em conformidade com a decisão de histórico só no aparelho. Código legado fica apenas para demonstração fictícia explicitamente habilitada.
- [x] README, integrantes/RMs, Swagger, scripts e evidências; pacote completo inclui a solution e a documentação compartilhada.
- [ ] Publicar espelho C#, conferir acesso do professor e enviar na tarefa própria (T18).
- [ ] Integração real com dados/roteador/app permanece [EM ABERTO], conforme T05; não foi validada com usuários.

---

## T07 — Mobile & IoT

**Status:** EM DESENVOLVIMENTO (14/11/2026: 13 telas reais, serviços mock/API, Neon Auth e sessão implementados; 312 testes, typecheck, lint, exportações web/Android e Expo Doctor 20/20 passando. Celular, acessibilidade, prints/vídeo e sync do espelho pendentes; FN-13 em aberto.)
**Responsável:** Lucas Simidu (indicado em 11/11/2026)
**Tipo:** Entrega de disciplina (Mobile & IoT)
**Referência:** `docs/02` §5; plano `docs/plano_app.md`; mapeamento `docs/app-map/`; **painel detalhado de status e progresso em `src/mobile-app/todo-mobile.md`** (entregas da disciplina, infraestrutura, FN-01 a FN-16, telas, fixtures, RNF).

**Escopo previsto:** app React Native (TypeScript) com Expo Router para a jornada ida e volta do estudante noturno; consumir API ou mock; salvar em banco; acessibilidade.
- [x] Mapeamento, Fase 0: decisões D-00 a D-07 registradas (`docs/app-map/01_decisoes.md`, 13/11)
- [x] Mapeamento, Fase 1: story map e fluxogramas FL-01 a FL-14 em rascunho, com os 17 diagramas Mermaid validados (`docs/app-map/02_story_map.md`, `docs/app-map/03_fluxogramas/`, 13/11)
- [x] Mapeamento, Fase 2: telas, navegação, funcionalidades (com o contrato esperado de conta, D-03) e dados por tela. *13/11: TL-01 a TL-13, `05_navegacao.md`, `06_funcionalidades.md` (FN-01 a FN-14 e contrato esperado da API, PL-18) e `09_dados_por_tela.md`; aprovados pelo Lucas (D-17), telas `pronta`.*
- [x] Mapeamento, Fase 3: design (tokens, componentes, acessibilidade, mockups) e microcopy, com varredura de termos. *13/11: `07_design/` e `08_microcopy.md`; varredura com 0 termos proibidos em 762 linhas; validados pelo Lucas (D-18), com pontos de design a rever (PL-19).*
- [x] Mapeamento, Fase 4: rastreabilidade e fechamento. *13/11: `docs/app-map/10_rastreabilidade.md` (76 AC + 9 RNF, conferido por script) e `00_LEIA-ME.md` com a definição de pronto; backlog revisado (`docs/10` v1.5). Roteiro do vídeo adiado por decisão do Lucas (D-18).*
- [x] Esqueleto do app (Frente 2, `docs/plano_app.md` §5.1). *13/11: Expo SDK 58 + TypeScript + Expo Router em `src/mobile-app/`, árvore de rotas de `05_navegacao.md` (em `src/app/`) com telas provisórias e guarda de sessão, tokens de `07_design/tokens.md`, modo `mock|api` por `EXPO_PUBLIC_API_MODE`, ESLint. Lint, typecheck e `expo-doctor` (18/18) passando; bundles Android e web compilam (`expo export`). Ainda não aberto no celular. Evidência: `src/mobile-app/ARQUITETURA.md`.*
- [ ] Atualizar o Node.js para 22.13 ou mais novo na máquina de desenvolvimento (o Expo SDK 58 não suporta o Node 20.17 instalado hoje; o CLI roda com aviso) e abrir o app vazio no celular pelo Expo Go
- [ ] Camada `services/` com modo `mock|api` e fixtures por caso do FL-07; sessão no `expo-secure-store`; banco local `expo-sqlite` (FN-13)
- [ ] Revisão de pontos de design com o Lucas antes de estilizar as telas (PL-19). *13/11: revisão feita com a skill `frontend-design` e aplicada a `docs/app-map/07_design/` (tokens R-01 a R-15, componentes, acessibilidade, mockups), `08_microcopy.md` e TL-07; falta a aprovação visual do Lucas. Nova pendência PL-25 (mapa base e atribuição).*
- [ ] Conciliar o contrato da API esperado pelo app com o backend (PL-18)
- [ ] **Compartilhar trajeto e localização ao vivo** (F2.5/US-21, D-19 a D-22). **15/11: protótipo no app com serviço mock** (TL-14, TL-15, indicador global, deep link; testes verdes). Faltam backend real (PL-18), GPS em segundo plano (PL-24) e validação no aparelho; não afirmar como recurso real no pitch. Histórico do que estava planejado: **Depende do tempo:** construir por último; se o prazo apertar, fica para depois. Mapeamento feito em 13/11 (FL-15, FL-16, TL-14, TL-15, FN-15, FN-16); faltam a revisão do Lucas das telas novas, a checagem do GPS em segundo plano no Expo Go (PL-24) e o endpoint no backend (PL-18)
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

**Status:** EM DESENVOLVIMENTO (16/11/2026: rascunhos em [`src/qa/FEATURES.md`](src/qa/FEATURES.md) e [`src/qa/TEST_CASES.md`](src/qa/TEST_CASES.md); falta o projeto no Azure Boards, rodar os casos e o PDF)
**Tipo:** Entrega de disciplina (Testing, Compliance & QA)
**Referência:** `docs/02` §8; `docs/03` (Fase 1 do roadmap).

**Escopo previsto:** Features com critérios de aceite e Test Cases funcionais (positivos e negativos) no Azure Boards. Peso: 50% Features, 50% Test Cases.
- [ ] Criar o projeto no Azure Boards e incluir o professor como Admin
- [ ] *(17/11: CSVs de importação prontos em `src/qa/azure/` (processo Scrum); falta importar, conferir e ligar os Test Cases às Features. 19/11: CSV de teste com 1 caso (TC-01.1) em `src/qa/azure/test_cases_teste_import.csv` para testar o import no Test Plans; ainda não importado.)*
- [ ] Features do MVP com critérios de aceite, a partir de `docs/10_backlog_produto.md` (seção 11 explica a conversão). *13/11: a matriz `docs/app-map/10_rastreabilidade.md` já lista um teste previsto (positivo ou negativo) por AC, base para os Test Cases.*
- [ ] Test Cases com objetivo, preparação, inputs, outputs esperados e passos *(16/11: rascunho de 71 casos em `src/qa/TEST_CASES.md`; falta rodar o app para conferir cada um e cadastrar no Azure.)*
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
| 13/11/2026 | Criada a T22 (Core do projeto): decidir a feature premium e o modelo financeiro do VoltaSegura, a partir da proposta de freemium enviada ao grupo. Item de receita da T03 passa a depender dela. | assistente (a pedido do Lucas) |
| 13/11/2026 | T07: esqueleto do app criado em `src/mobile-app/` (Expo SDK 58, TypeScript, Expo Router, rotas de `05_navegacao.md` com telas provisórias, tokens, modo `mock\|api`, ESLint); lint, typecheck e `expo-doctor` ok. Novas pendências: Node 22.13+ na máquina e camada de serviços/banco/sessão. | assistente (a pedido do Lucas) |
| 13/11/2026 | T07: criado o painel `src/mobile-app/todo-mobile.md` com o status detalhado do app (entregas da disciplina, infraestrutura, funcionalidades, telas, fixtures, RNF, pendências e cronograma); a T07 passa a apontar para ele. | assistente (a pedido do Lucas) |
| 13/11/2026 | T07: revisão de design PL-19 feita com a skill `frontend-design` e aplicada aos documentos de design e ao mockup (proposta, aguarda a aprovação visual do Lucas); criada a PL-25. | assistente (a pedido do Lucas) |
| 14/11/2026 | T07: handoff do app retomado; regressões corrigidas e verificadas (312 testes em 24 suítes, `tsc`, `eslint`, web/Android exportados, Expo Doctor 20/20). Próximas evidências: celular, acessibilidade e entregáveis. | Codex |
| 14/11/2026 | T07: README mobile atualizado com Ficha completa, estado real do protótipo e execução; script de sync ajustado para preservar o conteúdo no espelho. Prints e vídeo ainda pendentes. | Codex |
| 15/11/2026 | Roteiro do pitch v1 (5 pessoas) recebido e guardado em `src/qa/pitch/` (`.txt` original e `ROTEIRO_PITCH.md`); T03 → EM DESENVOLVIMENTO (fio da história escolhido). Criada a T23 com o mapeamento pitch × base (PT-01 a PT-27) e a lista de documentos a atualizar depois da onda de perguntas. T22 anotada. | assistente (a pedido do Lucas) |
| 15/11/2026 | T23, 1ª rodada de perguntas respondida: público amplo, freemium individual + empresas, VoltaSegura+ no MVP (rotina só no aparelho, D-31), relatos de infraestrutura e agente no roadmap, vídeo já gravado. Aplicado em `docs/03`, `docs/05`, `docs/06` (1.44), `docs/10` (v1.9, F7.1), README, AGENTS.md e `ROTEIRO_PITCH.md`. T22 → EM DESENVOLVIMENTO. | assistente (a pedido do Lucas) |
| 15/11/2026 | T23: acrescentada a lista PF-01 a PF-12 (produtos e funcionalidades do pitch que não existem no app hoje, com a atualização combinada, a situação no app e o próximo passo). Só leitura de rotas, `todo-mobile.md` e `06_funcionalidades.md`; app não executado. | assistente (a pedido do Lucas) |
| 15/11/2026 | T07/T23: Onda 5 (3 workers): correções do vídeo da onda 3 (teclado `pan`, carrossel de lugares, margens de área segura), VoltaSegura+ mínimo (rotina da semana com lembrete local, F7.1/FN-17, `[DECISÃO]` em `docs/06` 1.45) e compartilhar trajeto como protótipo com mock (PF-01/02/03 no app, sem backend). `tsc`, ESLint e 499 testes em 41 suítes verdes. Pendente: validação no aparelho. | assistente (a pedido do Lucas) |
| 17/11/2026 | T07: análise dos 4 vídeos `docs/app-map/mapa-funcional/` (roteamento real no celular funciona; trajeto por trecho e "Só roteamento" confirmados). Corrigidos: tempo limite do OTP2 (20→45 s) e aviso de espera longa, chips comparativos com opção única, botões ±15 min na saída. Em aberto (em `src/mobile-app/todo-mobile.md`): campo de saída perde o foco, possível +1 h no fuso, regravar às 18h, mapa vazio inicial, folha máxima. **Depende do tempo:** cruzar rota × ocorrências (B-14/B-15/B-30); sem adaptador no aparelho até a manhã de 18/11, congela em "Só roteamento" (B-40). |
| 16/11/2026 | T10: gerados os rascunhos `src/qa/FEATURES.md` (22 Features, ACs copiados de `docs/10` §6) e `src/qa/TEST_CASES.md` (71 casos, ≥1 positivo e ≥1 negativo por Feature do MVP). Nada executado; Azure Boards, execução dos casos e PDF seguem pendentes. T10 → EM DESENVOLVIMENTO. | assistente (a pedido do Lucas) |
| 17/11/2026 | T10: gerados `src/qa/azure/features.csv` (21 Features) e `test_cases.csv` (71 casos com passos) para importar no Azure DevOps (Scrum), com `LEIA-ME.md`. Importação ainda não testada; vínculos Test Case–Feature são manuais. | assistente (a pedido do Lucas) |
| 17/11/2026 | T10: importar `test_cases.csv` em Boards > Work items deu "Invalid column headers: Test Step, Step Action, Step Expected" (esse formato só vale no Test Plans). Gerado `src/qa/azure/test_cases_boards.csv` (passos no campo `Steps`, XML) para o Boards; não testado. | assistente (a pedido do Lucas) |
| 17/11/2026 | T10: o Boards recusa Test Case no CSV ("Forbidden work item type"); removido `test_cases_boards.csv`. Test Cases só pelo Test Plans (`test_cases.csv`) ou à mão. | assistente (a pedido do Lucas) |
| 19/11/2026 | T10: criado `src/qa/azure/test_cases_teste_import.csv` com 1 Test Case (TC-01.1, UTF-8 com BOM, colunas Work Item Type, Title, Test Step, Step Action, Step Expected) para testar a importação pelo Test Plans antes de gerar os 71. Formato não validado no Azure; importação pendente. | assistente (a pedido do Lucas) |
| 19/11/2026 | T10: 1ª tentativa de import no Test Plans recusou os cabeçalhos ("Invalid column headers: Test Step, Step Action, Step Expected"). Conferido na documentação oficial (learn.microsoft.com, bulk-import-export-test-cases): cabeçalhos obrigatórios ID, Work Item Type, Title, Test Step, Step Action, Step Expected, Area Path, Assigned To, State. CSV regerado com os 9 cabeçalhos; Area Path=VoltaSegura (placeholder, confirmar o nome do projeto) e Assigned To vazio, a confirmar. Import ainda não repetido.
| 19/11/2026 | T10: 2ª e 3ª tentativas (CSV com BOM e sem BOM, Area Path VOLTASEGURA, como na tela do Boards) deram o mesmo erro de cabeçalhos. Gerado `src/qa/azure/test_cases_teste_import.xlsx` (mesmo conteúdo, aba Test Cases) como alternativa; import não testado.
| 19/11/2026 | T10: revisão dos Test Cases contra `docs/app-map/` e `docs/10` (v1.11). TC-04 reescrito (histórico "Recentes" não existe nesta versão; virou TC-04.1 negativo e TC-04.2 com lugares salvos); TC-22.1 atualizado (rotina também pela aba Plus, dois lugares salvos, folha de horário); 29 casos novos para F2.6 (Seguir rota, US-23), FN-21 (Plus em simulação), FN-22 (contatos) e FN-13 (lugares salvos). F2.6 incluída em `src/qa/FEATURES.md`. Total: 100 Test Cases. Criados no Azure via API (projeto VOLTASEGURA, área VOLTASEGURA): 99 novos e o TC-01.1 (item 258) recebeu passos e descrição. Log em `scratchpad/upload_log.tsv`. Pendente: vínculos Test Case–Feature (manuais); FN-13, FN-21 e FN-22 não têm Feature no Azure (decidir se viram Features); casos não executados no app; PAT usado no chat deve ser revogado. |
| 15/11/2026 | T07: Plano B (dados reais) começou na branch `feat/plano-b`: validação do JSON, `fontes` no contrato, seleção `mock|api|otp2` e adaptador OTP2 ligado com tempo limite e cancelamento (B-01, B-02, B-04, B-05; `src/mobile-app/todo-mobile.md` bloco 11). Depende do Lucas para o OTP2 no ar (T12) e o Neon `dev`. | Claude Code (a pedido do Lucas) |
| 15/11/2026 | T07: Plano B B-06 (SQL da exposição estimada, ainda não executado no Neon) e B-07 (importador da SSP, rodado na planilha real; 94 circunscrições, cobertura média 90,8%) em `src/mobile-app/scripts/sql` e `scripts/ssp`, feitos por workers no Alethe e conferidos. Carga e testes SQL dependem do Neon `dev` (B-13 a B-15). | Claude Code (a pedido do Lucas) |
| 16/11/2026 | T12/T07: OTP2 rodando no notebook do Lucas (grafo de 1,1 GB montado em 9 min 46 s com `-Xmx10G`; teste 1 devolveu itinerários com geometria nos trechos a pé) e acessível na LAN (B-10 e B-11 do Plano B; detalhes em `docs/dados-reais/04_plano_implementacao.md` §8). Pico de memória da montagem não medido; ida/volta ainda sem conferência de plausibilidade. Pendentes: B-12 (HTTP no aparelho) e B-13 (Neon `dev`). | Claude Code (a pedido do Lucas) |
| 16/11/2026 | T07: B-13 respondido (Neon `dev`: sa-east-1, Free 1 GB, PostGIS 3.6.4 disponível, Data API ativável; ver `docs/dados-reais/06_neon_dev_verificacao.md`). B-12 e B-20 adiados para depois do merge com o redesign. Próximo: B-14 (JWT na RPC). | Claude Code (a pedido do Lucas) |
| 17/11/2026 | T07: B-57 corrigido no app. A exposição estimada nunca entrava com rotas reais do OTP2 (vértices repetidos tornavam a polyline não canônica e a `comparar_exposicao` recusava a consulta). Com a correção, a função na `dev` devolve `MISTOS` (`proxy_pontos`) para rotas reais; falta confirmar no aparelho (`src/mobile-app/todo-mobile.md`). | Claude Code (a pedido do Lucas) |
| 17/11/2026 | T07: B-58 (D-32). Com as alternativas do OTP2, a menor exposição estimada nunca aparecia (0 de 30 trajetos reais); o app passou a gerar variações de caminhada e a comparar rotas com a mesma caminhada uma vez. Com dados reais, 3 de 24 trajetos de 1,5 a 3 km deram CONCLUSIVO, com a vencedora em primeiro (D-23). Falta validar no aparelho (`src/mobile-app/todo-mobile.md`). | Claude Code (a pedido do Lucas) |
| 17/11/2026 | T07: B-59 (D-33). Os registros da SSP-SP passam a desenhar o caminho a pé (busca guiada pelos dados) e a rota de menos registros tem prioridade, com a confiança ao lado ("diferença clara" ou "pequena"); revê o destaque do docs/08. Com dados reais, 10 de 13 trajetos tiveram destaque. Falta validar no aparelho (`src/mobile-app/todo-mobile.md`). | Claude Code (a pedido do Lucas) |
| 18/11/2026 | T07: rastro do OTP2 no terminal do Metro, só em desenvolvimento: URL, tempo e desfecho, sem coordenadas da pessoa (`src/mobile-app/src/services/otp2.ts`). Ajuda a diagnosticar o "servidor demorou para responder", que vinha de um IP antigo no `.env.local`. | Claude Code (a pedido do Lucas) |
| 18/11/2026 | T07: setup automatizado do app em `src/mobile-app/scripts/setup/` (`npm run setup`, `npm run otp2`, `npm run celular`): instala dependências, detecta o IP da rede local, grava o `.env.local` só com `EXPO_PUBLIC_*`, procura ou instala o Java 25 e prepara e sobe o OTP2 com o grafo. Testado nesta máquina: IP, `.env.local`, Java, reaproveitamento do grafo e subida na porta 8090 respondendo pelo IP do Wi-Fi. Máquina limpa (downloads, recorte do OSM, montagem do grafo, winget) não testada. | Claude Code (a pedido do Lucas) |
| 18/11/2026 | T24: Seguir rota (D-34, US-23, FL-18, TL-18). Revisa D-04 e US-05 AC3 (leitura só depois de "Começar", com a tela ligada na Fase 1; segundo plano só com sessão ativa, como na D-20). Fase 1 no código, sem commit; 25 testes de `seguir` passam; validação no aparelho pendente. Fases 2 (recálculo, com conflito com a D-21 em aberto) e 3 em andamento. | assistente (a pedido do Lucas) |
| 18/11/2026 | T24: FN-20 e PL-26 a PL-32 em `docs/app-map`. Verificado no código e nos testes: Fases 1, 2 e 3 implementadas (5 suítes e 71 testes passam), ainda sem validação no aparelho e sem commit. Itens de decisão em PL-28 a PL-32 (efeito do recálculo sobre a consulta, modos, horário, posição ao roteador × D-21, tempo máximo). Status mantido em EM DESENVOLVIMENTO: a regra 5 pede validação antes de CONCLUÍDO. | assistente (a pedido do Lucas) |
| 18/11/2026 | T24: decisões do Lucas registradas. Exceção à D-21 no recálculo (D-34 item 6), resposta do recálculo só com mesma sequência de modos e mesmo destino (até 100 m) (D-34 item 5), sem tempo máximo na Seguir rota (D-34 item 7). Código ajustado e verificado: suíte completa com 826 testes, typecheck e lint limpos. T24 segue EM DESENVOLVIMENTO: falta validar no aparelho (PL-26) e decidir o rótulo do botão (D-34 item 8). Sem commit. | assistente (a pedido do Lucas) |
| 18/11/2026 | T24: Lucas validou Seguir rota no celular (T24.1 e T24.3). Relato: a primeira busca de rota demorou mais que o normal; sugerido aumentar o timeout. Investigação pendente antes de mudar valor (PL-33): exposição tem limite de 10 s (`exposicao.ts`), OTP 45 s (`otp2.ts`), motor de dados 20 s (`rotaDosDados.ts`), variantes 15 s (`variantesCaminhada.ts`). Sem alteração de código nesta entrada. | assistente (a pedido do Lucas) |
| 18/11/2026 | T25 criada: redesign pelos 16 mockups (`novas-telas`) e novo seletor de horário sem teclado. Plano em `~/.claude/plans/quero-que-organize-e-logical-lynx.md`. Decisões do Lucas: VoltaSegura+ 08/09/15 como simulação sem cobrança (nova D-nn revendo D-31 item 3); barra com 5 abas; horário por folha com rodas HH:MM. Causa do bug do teclado em `SeletorHorario.tsx:33` (remount por `key`+`autoFocus`, `onBlur` atualiza contexto). | assistente (a pedido do Lucas) |
| 18/11/2026 | T25 · worker #6 (Resultado e dados), parcial, sem commit: `(auth)/entrar.tsx` sem Hero (botão voltar redondo, marca, subtítulo; textos `entrar.marca`/`entrar.subtitulo`), `por-que` com `Cabecalho` (Fechar à direita) e `BarraCobertura` novo em `components/resultado`. Docs: TL-03, TL-09, 08_microcopy. Pendente: 03 Alternativas e 04 Dados insuficientes (TL-07), propagação às telas de dados (TL-10, TL-11, aviso) e buscando (TL-06). Frase de privacidade do mockup 06 **não** aplicada (histórico `[EM ABERTO]`, D-24). `tsc` ok; jest: 1 falha em `planejar/componentes.test.tsx` (teste de rodas do SeletorHorario, worker #5). | Claude Code #4 (worker #6) |
| 19/11/2026 | T25 · worker #6, rodada 2 (sem commit): `resultado/index.tsx` mostra o cartão **Dados insuficientes** (`CartaoInsuficiente`, mockup 04) quando o caso é `INSUFICIENTE` e há 2+ opções, com "Entender o resultado" (→ sobre-os-dados) e "Outro horário" (→ planejar). Cabeçalho do app em sobre-os-dados, dados-considerados e aviso-privacidade (sem cabeçalho nativo; "Voltar" duplicado do panorama removido). Docs: TL-07 (parcial, pendências listadas), TL-10, TL-11, TL-13, 08_microcopy. Frase do mockup 06 sobre o histórico continua **não** aplicada (decisão pendente do Lucas). Pendente: pílula escura e "Sua ida · 15 nov" do mockup 03 (depende de token/fundação), `buscando` já tinha `Cabecalho`. `tsc`: sem erros nos meus arquivos (erros só em `plus/*`, worker #7). Jest: 81/81 nas pastas tocadas; uma falha intermitente de TL-12 não reproduziu. | Claude Code #4 (worker #6) |
| 19/11/2026 | T25-B · Frente C (itens 6 e 7, worker #6, sem commit). Item 6: folha de alternativas com alturas 45/68/90% e nível inicial 1; cartão sem horário de saída e número selecionado 30 pt; sem "Planejar a volta/ida" no fim da lista; linha de fonte vira link "Entenda de onde vem nossos dados e fontes" (→ TL-10). Item 7: detalhe da rota sem "Compartilhar minha volta" e "Planejar a volta" (termina em "Seguir rota"). Testes ajustados: `telas/resultado`, `telas/detalhes`. Docs: D-39 em 01_decisoes, TL-07, TL-08, FL-06, FL-07, FL-08 (`[EM ABERTO]` a entrada da volta), FL-15 e FL-18 (só compartilhamento), 08_microcopy. **Para o lead:** (a) incluir o compartilhamento em `seguir/[rotaId].tsx` (cartão MapaAcompanhando, onde era o botão da TL-08); (b) decidir o caminho da volta (US-07 AC1), que perdeu a entrada pelo resultado. `tsc` sem erros nos meus arquivos (erros restantes em `planejar/` e `locais.tsx`, de outros workers). | Claude Code #4 (worker #6) |
| 19/11/2026 | T25 (worker Planejar, Claude Code #5): `SeletorHorario` reescrito em folha com rodas HH:MM (horas 00–23, minutos 00–59, sem `TextInput`); removidos `focar`, `onValidadeChange` e o aviso de formato HH:mm; `planejar.tsx` sem `Hero` (cabeçalho de texto, ícone `tune-variant`) e seção "Saída"; testes de planejar: 29/29 verdes (folha, confirmar, cancelar, ±15 min). Docs: TL-04, FL-04, FN-05, 08_microcopy, 07_design/componentes, D-35 (minutos de 1 em 1 em vez de 5 em 5). Pendente: `rotina/editar.tsx` ainda usa campo HH:mm; TL-05 não mudou; `escolher-ponto` já segue o mockup 02 sem alteração. Claude Code #5 |
| 19/11/2026 | T25 (worker #7, Plus e abas): TL-19 a TL-25 (Plus em simulação sem cobrança e exemplos com EXEMPLO; D-36), TL-26 Locais e TL-27 Contatos (só nomes, no aparelho), `(app)/perfil` reaproveita configurações. Docs: TL-16 e TL-17 revistas, FL-19, FN-21 e FN-22, 05, 08, 09, 12 (PL-34 a PL-37), `hipotesesAviso` (contatos), 01 (D-36). Testes: `src/plus`, `src/contatos`, `src/__tests__/telas/plus`; `tsc` e `jest` (841) passam. Sem commit. Pendente: `_layout` com as abas (lead), validação no aparelho e revisão do Lucas | Claude Code (Haiku 5.5), worker #7
| 19/11/2026 | T25-B Frente A (worker #7): configurações removidas (botão em planejar, rota e tela); aba Perfil com conta, status do Plus, atalho da rotina, tema (Sistema/Claro/Escuro, gravado) e sair; aba Locais com renomear e desfazer de 5 s; `Tela` com `abas` e `medidas.alturaBarraAbas`; assinatura simulada guardada (`voltasegura.plus`), cancelar real e aba Plus como portão; home do Plus lista todas as rotinas. Docs: TL-04, TL-12, TL-19 a TL-26, 05, 06 (FN-13 e FN-21), 08, 09, 12 (PL-35), 01 (D-38), ARQUITETURA e todo-mobile. Pendente: lead liga os providers e remove a rota `configuracoes` no layout; `Tela abas` em contatos (worker #5); validação no aparelho | Claude Code (Haiku 5.5), worker #7 |
| 19/11/2026 | T25: integração do lead. Telas de abas movidas para `src/app/(app)/(abas)/` (planejar, locais, contatos, plus, perfil) com `Tabs` e `BarraAbas`; `_layout` do app com `(abas)` na pilha; testes atualizados para os novos caminhos. `tsc` e ESLint limpos; Jest 841/841 (timeout intermitente de 5 s em um teste sob carga, passa isolado). Pendente: validação no aparelho e commit (só com pedido). | Claude Code (a pedido do Lucas) |
| 19/11/2026 | T25-B, item 8 e 9 (Seguir rota): caixa "Entendi e não mostrar de novo" com preferência local (`src/seguir/armazenamento.ts`) e Fechar leva direto à home. Docs TL-18, FL-18 e 08_microcopy atualizados. Sem commit; validação no aparelho pendente. | Claude Code (a pedido do Lucas) |
| 19/11/2026 | T25-B Frente B, itens 4 e 10 (Claude Code #5): `AtalhosHorario` removido (arquivo, export e textos `atalhosSaida`/`agora`/`em15`/`em30`/`em1h`/`menos15`/`mais15`); `SeletorHorario` vira cartão grande (relógio, hora em destaque, dia) que abre a folha de rodas, `testID="hora-saida"` mantido; `Stack.Screen` removido de `contatos`, `locais`, `plus` e `planejar`; `(abas)/contatos.tsx` usa `components/contatos/FormularioContato` (memo, nome e erro próprios, `minHeight` para o campo); `Tela abas` em contatos. Testes: `telas/planejar` e `componentes` atualizados (cartão → folha → confirmar; cancelar; sem atalhos). Docs: TL-04, FL-04, FN-05, 07_design/componentes, 08_microcopy, 09_dados_por_tela, D-37 (revê a D-35 nos atalhos). Pendências: `plus.test` (D-36) falha por `useAssinatura` sem `AssinaturaProvider` (worker #7); TL-22 ainda tem atalhos próprios (worker #7). Sem commit. | Claude Code #5 |
| 19/11/2026 | T25-B integrada pelo lead: 12 itens pós-teste implementados (perfil como configurações, barra sem cobrir conteúdo, tema claro/escuro, assinatura simulada, várias rotinas, teclado de Contatos, cartão de horário, resultado compacto, detalhe sem Compartilhar/Planejar volta, aviso de Seguir rota com 'não mostrar de novo', Fechar direto à home). Providers montados (ModoTemaProvider, AssinaturaProvider) e rota configurações removida. `tsc` limpo, ESLint limpo, Jest 856/856 (63 suítes). Sem commit; validação no aparelho pendente. Decisão aberta: caminho para 'Planejar a volta' (US-07 AC1, FL-08). | Claude Code (a pedido do Lucas) |
| 19/11/2026 | T25: correção do teclado que abria e fechava em Locais (renomear) e Contatos. Causa: `CampoTexto.tsx` acrescentava sombra (`brilho`) à caixa só no foco; no Android isso recria a view e o campo perde o foco (com erro na tela a sombra era suprimida, por isso dava para digitar 1 caractere). Foco agora só na borda; `locais.tsx` sem rolagens extras no foco; teste de regressão em `componentes.test.tsx` (falha com o código antigo, passa com a correção). `tsc`, ESLint e Jest 857/857. Falta confirmar no aparelho. Sem commit. | Claude Code (a pedido do Lucas) |

| 19/11/2026 | T25 marcada CONCLUÍDA: Lucas validou no aparelho ("tudo muito certo" e, depois da correção, o teclado). Docs auditados e corrigidos: D-39 renumerada (era uma segunda D-36) e movida para depois da D-38; `05_navegacao` (abas ligadas, Seguir com compartilhar e Fechar → home); índice de telas e `ARQUITETURA.md` com as rotas em `(abas)`; `todo-mobile` com a pendência do foco resolvida; `docs/06` 1.49; evidência em `docs/app-map/redesign/13_t25b_ajustes_e_teclado.md`. | Claude Code (a pedido do Lucas) |
| 19/11/2026 | Pasta `docs/redesign/` movida para `docs/app-map/redesign/` (referências atualizadas em TODO, prompts, app-map, dados-reais, HANDOFF e docs do mobile). Commits das alterações pendentes (B-58/B-59, setup, T24, T25, docs, QA) separados por contexto na branch `feat/redesign-t25`, sem coautoria de IA; T24.6 concluída. Espelho `VoltaSegura/mobile-app` sincronizado. | assistente (a pedido do Lucas) |
| 19/11/2026 | T07: README do app (`src/mobile-app/README.md`, que gera o README do espelho) reescrito: resumo do VoltaSegura, tabela de integrantes (RM e nome), modos mock e real, diagrama das peças, por que cada dependência é instalada (Java/OTP2, GTFS, OSM, Python/osmium, Neon), passo a passo de `npm run setup`, `npm run otp2` e `npm run celular`, opções e problemas comuns; contagem de testes atualizada (857/63). Espelho sincronizado. | assistente (a pedido do Lucas) |
| 18/11/2026 | T05: diagnóstico contra PDF p. 27 e roteiro em `src/soa-backend/PLANO_ENTREGA.md`; solution compilada e 20 testes aprovados. Status detalhado corrigido para EM DESENVOLVIMENTO; pendentes migrações/HTTP/carga local, correções de cálculo/integração, evidências, integrantes e empacotamento completo do espelho. Nenhum código alterado ou publicado. | assistente, a pedido do usuário |

| 18/11/2026 | T05/T06: regularização autorizada pelo usuário; correções de domínio/geometria/validação, comparação de até cinco rotas, adaptador GraphQL opcional, proveniência e carga fictícia, scripts Windows, 46 testes aprovados, migrações/HTTP/persistência e prints reais. Pacote independente testado em pasta limpa; READMEs com integrantes/RMs e empacotamento completo. Publicação/envio e validação com SSP/OTP reais seguem pendentes. | Codex, a pedido do usuário |

| 18/11/2026 | T05/T06: guia de publicação em `src/soa-backend/PUBLICACAO.md` e pacotes independentes em `output/entregas/`; upload e envio ao portal permanecem com o grupo. | Codex, a pedido do usuário |
