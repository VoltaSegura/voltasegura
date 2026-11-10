---
titulo: Entregáveis e rubricas por disciplina — GS CitizenTech 2026.2
projeto: VoltaSegura (produto)
fonte: "GS CitizenTech - 3ES Fev - FIAP 2026.pdf"
atualizado: 2026-11-10
prazo_geral: 2026-11-19T23:55:00-03:00
tipo: entregas-rubricas
---

# Entregas por disciplina (todas até 19/11/2026, 23h55)

> A **mesma CitizenTech** atravessa todas as disciplinas (terminologia da FIAP — o produto do grupo é o **VoltaSegura**): cada disciplina constrói **uma parte da mesma solução**, e as partes conversam entre si. Envio por **um único integrante** no Teams/Portal.

## Visão geral

| Disciplina | Entrega principal | Entrega no Teams | Nota |
|---|---|---|---|
| SOA e Web Services | Backend (qualquer linguagem) | Link do GitHub | 10,0 |
| Cybersecurity | Módulo PII + auditoria + dashboard | Arquivo ZIP | 10,0 |
| C# Software Development | Backend C#/.NET | Link do GitHub | 10,0 |
| IA & Machine Learning | Notebook ML + relatório + vídeo | Links (repo + vídeo) | 10,0 |
| Mobile Development & IoT | App (React Native/Expo) | Link do repositório | 10,0 |
| Operating Systems | Infraestrutura Linux automatizada | Link do repositório | 10,0 |
| Physical Computing | Circuito ESP32 no Wokwi | Link Wokwi + vídeo + .txt | 10,0 |
| Testing, Compliance & QA | Features + Test Cases no Azure Boards | PDF com prints/links | 10,0 (50% Features / 50% Test Cases) |

---

## 1. Arquitetura Orientada a Serviços (SOA) e Web Services — 19/11

- **Objetivo**: projetar e implementar a **camada de backend** (em qualquer linguagem) do VoltaSegura, com estruturação de domínio, conexão com banco de dados, APIs REST e testes automatizados.
- **Entregáveis**: repositório GitHub (código completo), README (instruções de execução, descrição da solução e nomes dos integrantes), documentação de endpoints (Swagger ou equivalente), evidências da aplicação.
- **Rubrica (10,0)**:

| Critério | Pontos |
|---|---|
| Estruturação do domínio | 3,0 |
| Conexão com banco de dados | 3,0 |
| Migrações | 1,5 |
| Documentação automática | 1,5 |
| Testes automatizados | 1,0 |

## 2. Cybersecurity — 19/11

- **Entrega**: arquivo **ZIP** contendo:
  1. **Código do novo módulo** — pacote compactado com o código atualizado contendo as **regras PII**.
  2. **Auditoria do protótipo** — evidências do **Taint Analysis** em ação.
  3. **Dashboard atualizado** — vídeo com atividade e print do painel gerando o indicador de **Risco Cidadão**.

## 3. C# Software Development — 19/11

- **Objetivo**: camada de backend em **C#/.NET** com POO, Interfaces, Injeção de Dependência, Entity Framework Core, LINQ, APIs REST, programação assíncrona e testes unitários.
- **Entregáveis**: repositório GitHub (projeto C#, Web API, EF Core), README, documentação de endpoints (Swagger/Scalar ou equivalente), evidências.
- **Rubrica (10,0)**:

| Critério | Pontos |
|---|---|
| POO | 3,0 |
| Web API | 2,5 |
| EF Core + LINQ | 1,5 |
| Async/Await | 1,0 |
| Qualidade do código | 2,0 |

## 4. Inteligência Artificial & Machine Learning — 19/11

- **Objetivo**: transformar o problema do VoltaSegura em uma **pergunta de ML** e respondê-la com **dados reais e públicos** (sugestões do briefing: INMET, Metrô SP, **Infosiga SP**, SP156, IBGE, entre outros). **Dados simulados NÃO são aceitos.**
- **Ciclo exigido**: preparar os dados → treinar modelo (**XGBoost, Random Forest, MLP, LSTM ou KMeans + PCA**) com diferentes hiperparâmetros → avaliar em treino e teste → concluir o significado para o cidadão.
- **Entregáveis**:
  - Repositório GitHub: pasta `ml/` com notebook executado, `dados/README.md`, `requirements.txt`.
  - `RELATORIO_ML.md` de **2 a 4 páginas**.
  - Vídeo até **5 min** no YouTube (não listado).
- **Percurso (4 etapas)**: (1) problema + dados reais documentando fonte, link e período; (2) escolha justificada do modelo + limpeza + divisão treino/teste; (3) **≥10 combinações de 3 hiperparâmetros**, validação cruzada **só no treino**, métricas adequadas; (4) métricas de treino e teste lado a lado com gráficos, discussão de overfitting e conclusão para o cidadão.
- **Rubrica (10,0)**:

| Critério | Pontos |
|---|---|
| Problema e dados reais | 2,0 |
| Escolha justificada do modelo | 1,0 |
| Preparação e divisão treino/teste | 2,0 |
| Treino com diferentes parâmetros | 2,0 |
| Resultados em treino e teste | 2,0 |
| Conclusão e leitura para o cidadão | 1,0 |

## 5. Mobile Development & IoT — 19/11

- **Objetivo**: app funcional em **React Native (TypeScript) + Expo Router** que resolva a **jornada principal do cidadão** definida na Ficha; consumir **API ou mock**, salvar em **banco de dados**, ser simples e acessível.
- **Entregáveis**: repositório GitHub (código organizado), README com a Ficha da CitizenTech (preenchida com os dados do VoltaSegura) + instruções para rodar + prints das telas, link de vídeo até **3 min** com o app rodando.
- **Avaliação em 6 critérios** (rubrica completa na tarefa do Teams): telas e navegação, consumo de dados, banco de dados, acessibilidade, aderência ao problema, documentação.

## 6. Operating Systems — 19/11

- **Objetivo**: **infraestrutura Linux** funcional que provisione o ambiente para hospedar a aplicação web do VoltaSegura de outra disciplina, de forma **automatizada** (Shell Script), com serviços, monitoramento e resposta a falhas.
- **Percurso (4 etapas)**: (1) preparar ambiente para receber app; (2) aplicação hospedada (dependências, configurações, variáveis); (3) infraestrutura (rede, DNS, hostname, monitoramento, auditoria); (4) apresentar o provisionamento automático **dentro da VM** com a aplicação executando.
- **Entregáveis**: repositório GitHub (scripts Bash, configurações, evidências técnicas, README.md), infraestrutura funcional, scripts de monitoramento com geração de logs, teste de falha e **vídeo até 7 min**.
- **Rubrica (10,0)**:

| Critério | Pontos |
|---|---|
| Script de provisionamento de infra (redes, DNS, IP) | 2,0 |
| Script de provisionamento da aplicação (dependências, config., orquestração) | 2,0 |
| Script de monitoramento com alertas de CPU, Disco e Memória | 2,0 |
| Monitoramento como serviço tolerante a falhas | 1,0 |
| Logs de auditoria e execução dos scripts | 1,0 |
| Funcionamento completo da proposta | 2,0 |

## 7. Physical Computing: IoT & IOB — 19/11

- **Objetivo**: circuito **ESP32 no Wokwi** integrado ao problema do VoltaSegura (não é projeto paralelo — o IoT deve agregar valor à solução do grupo).
- **Entregáveis**: link do projeto no Wokwi; link de vídeo demonstrativo até **4 min** (apresenta a solução, explica a integração do circuito e demonstra funcionamento); arquivo **.txt** com nomes dos integrantes.

## 8. Testing, Compliance & QA — 19/11

- **Objetivo**: planejamento e qualificação de software — definição de **requisitos** e criação de **testes funcionais**.
- **Entregáveis**:
  - **Features** da aplicação, com descrições e **critérios de aceite**, no **Azure Boards**.
  - **Test Cases** funcionais (positivos e negativos, caixa-preta) para aceitação/homologação, com: objetivo do teste, preparação, inputs, outputs esperados e passos.
  - Incluir o professor como **'Admin'** no projeto Azure e inserir no PDF o link do projeto.
  - **Contingência**: prints de todas as telas (Features e detalhes; definição dos Test Cases) colados em um documento único → gerar **PDF** para entrega.
- **Avaliação**: Features **50%** + Test Cases **50%**.

---

## Pitch (prêmio "Melhor GS") — via disciplina de Testing

- Vídeo de até **4 minutos** no YouTube, apresentando a solução **e as entregas que mais somaram** (dashboard incluído). Enviar o link.

## Notas de integração para agentes

- O projeto **VoltaSegura** do grupo (ver `03_projeto_documento_vivo.md`) é uma **plataforma web/app**; os componentes típicos a mapear por disciplina:
  - SOA → API REST de planejamento/comparação de trajetos.
  - C# → possível backend principal em .NET (decidir se SOA e C# usam o mesmo serviço ou módulos distintos).
  - IA/ML → pergunta de ML viável: p.ex. análise de ocorrências por distrito/horário (usar **Infosiga SP** — acidentes — e SSP-SP). `ATENÇÃO`: metodologia de exposição estimada ainda `[EM ABERTO]`; a entrega de ML exige dados reais documentados.
  - Mobile → app do estudante noturno (idade/volta para casa).
  - OS → hospedar a aplicação web da solução.
  - Physical Computing → p.ex. sensor ESP32 de iluminação/ambiente em paradas `[HIPÓTESE]` — precisa conversar com a proposta.
  - Testing → features do MVP descritas em `03_projeto_documento_vivo.md` (Fase 1).
  - Cybersecurity → regras PII/LGPD e Taint Analysis sobre dados de localização.
