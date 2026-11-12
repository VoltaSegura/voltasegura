# VoltaSegura

> **A próxima grande inovação pode estar na sua rua — e agora você faz parte dela.**
>
> VoltaSegura é uma plataforma de apoio à decisão em mobilidade: compara alternativas de trajeto (ônibus, metrô, caminhada) considerando indicadores disponíveis sobre segurança, transporte e infraestrutura urbana, exibindo a **exposição estimada** de cada opção e a **confiabilidade dos dados** — na ida **e** na volta para casa.

[![FIAP](https://img.shields.io/badge/FIAP-GS_2026.2--Eng._Software-FF5722?style=flat-square)](https://www.fiap.com.br/)
![Status](https://img.shields.io/badge/status-fase_0_descoberta-gray?style=flat-square)
![Prazo](https://img.shields.io/badge/entrega-19%2F11%202023h55-212121?style=flat-square)

---

## Ficha da CitizenTech

*(formulário obrigatório da GS FIAP; preenchido com os dados do VoltaSegura)*

| Campo | Resposta |
|---|---|
| **Nome da CitizenTech** | **VoltaSegura** (ex-"CitizenTech"; produto renomeado em 10/11/2026) |
| **Cidade e bairro** | Município de São Paulo — todos os bairros no escopo planejado do piloto `[DECISÃO]`; comparação por trajeto depende de cobertura e qualidade dos dados locais |
| **Cidadão beneficiado** | Estudante universitário do período noturno que retorna para casa por transporte público e caminhadas (persona de trabalho: Marina, 22)`[validar via entrevistas]` |
| **Problema, em uma frase** | Apps de mobilidade priorizam tempo e distância, mas não oferecem visão integrada das condições urbanas que influenciam a percepção de segurança no deslocamento, dificultando a escolha consciente entre trajetos |
| **Como funciona** | O usuário informa origem, destino, horário (ida e, se aplicável, volta); a plataforma consulta fontes de mobilidade, segurança e infraestrutura; compara alternativas por tempo, conexões, indicadores de exposição e confiabilidade dos dados; e o usuário decide com contexto |
| **O que cada parte faz** | Ver tabela de disciplinas abaixo |
| **Link do repositório** | https://github.com/VoltaSegura/voltasegura |
| **Indicador de impacto** | `[EM ABERTO]` — proposições: utilidade percebida da comparação, intenção de uso recorrente, adesão ao planejamento ida-volta |
| **ODS conectados** | **ODS 11** (cidades e comunidades sustentáveis) e **ODS 10** (redução das desigualdades) — justificativas `[EM ABERTO]` |

> ⚠️ **Regra de comunicação**: o produto **não garante segurança, não prevê crimes e não classifica bairros** como seguros/perigosos. Comunica **exposições estimadas**, comparativas e contextualizadas, com indicação de confiança dos dados. Ver [`docs/05_regras_linguagem_etica.md`](docs/05_regras_linguagem_etica.md).

---

## Partes da solução por disciplina (GS)

| Disciplina | Pasta | Papel na solução |
|---|---|---|
| SOA & Web Services | [`src/soa-backend`](src/soa-backend) | API REST de rotas, comparação e exposição estimada |
| C# Software Development | [`src/csharp-backend`](src/csharp-backend) | Backend .NET (POO, EF Core, Web API) |
| IA & Machine Learning | [`src/ml`](src/ml) | Estudo de ML com dados reais e públicos (SSP-SP, Infosiga, SP156…) |
| Mobile & IoT | [`src/mobile-app`](src/mobile-app) | App (React Native/Expo) do estudante noturno |
| Operating Systems | [`src/os-infra`](src/os-infra) | Provisionamento Linux automatizado da aplicação web |
| Physical Computing | [`src/physical-computing`](src/physical-computing) | Circuito ESP32 (Wokwi) a serviço da solução |
| Testing, Compliance & QA | [`src/qa`](src/qa) | Features + test cases (Azure Boards) |
| Cybersecurity | [`src/cybersecurity`](src/cybersecurity) | Regras PII/LGPD, Taint Analysis, indicador de risco cidadão |

### Repositórios de entrega por disciplina

Espelhos privados na organização, para envio/apresentação em cada disciplina (fonte da verdade sempre aqui):

| Disciplina | Repositório de entrega |
|---|---|
| SOA & Web Services | github.com/VoltaSegura/soa-backend |
| C# Software Development | github.com/VoltaSegura/csharp-backend |
| IA & Machine Learning | github.com/VoltaSegura/ml |
| Mobile & IoT | github.com/VoltaSegura/mobile-app |
| Operating Systems | github.com/VoltaSegura/os-infra |
| Physical Computing | github.com/VoltaSegura/physical-computing |
| Testing, Compliance & QA | github.com/VoltaSegura/qa |
| Cybersecurity | github.com/VoltaSegura/cybersecurity |

## Base de conhecimento (para humanos e agentes)

Toda a documentação viva está em [`docs/`](docs/). O ponto de entrada para agentes de IA é o [`AGENTS.md`](AGENTS.md), que fixa a ordem de leitura e os guardrails de linguagem. Registro de prompts de IA: [`prompts.md`](prompts.md) (exigência da GS).

| Documento | Conteúdo |
|---|---|
| [`docs/01_gs_briefing.md`](docs/01_gs_briefing.md) | Regras da GS: prazos, equipe, calendário, ODS |
| [`docs/02_entregas_disciplinas.md`](docs/02_entregas_disciplinas.md) | Entregáveis e rubricas por disciplina |
| [`docs/03_projeto_documento_vivo.md`](docs/03_projeto_documento_vivo.md) | Documento vivo: posicionamento, persona, roadmap |
| [`docs/04_dados_fontes.md`](docs/04_dados_fontes.md) | Fontes de dados e matriz de validação |
| [`docs/05_regras_linguagem_etica.md`](docs/05_regras_linguagem_etica.md) | Guardrails: o que pode e não pode ser dito |
| [`docs/06_estado_atual.md`](docs/06_estado_atual.md) | Decisões, hipóteses e pontos em aberto |
| [`docs/07_classificacao_ssp_app.md`](docs/07_classificacao_ssp_app.md) | Categorias SSP-SP selecionadas para o app e regras de apresentação |
| [`docs/08_metodologia_comparacao_mvp.md`](docs/08_metodologia_comparacao_mvp.md) | Regra inicial de comparação de trajetos e validações pendentes |
| [`docs/09_fluxo_trabalho_ia.md`](docs/09_fluxo_trabalho_ia.md) | Fluxo para agentes, registro de decisões e verificação da base |

## Convenções da equipe

- **Simples primeiro**: função que funciona > dez pela metade.
- **IA como copiloto**: todo prompt registrado em `prompts.md`; cada integrante sabe explicar o projeto inteiro.
- **Dados com cuidado**: nada de dados pessoais reais; dados públicos/simulados com origem citada.
- **Commits**: convencional (feat/fix/docs/chore) em português, curto e descritivo.
- **Repositório organizado**: uma pasta por parte; READMEs locais com instruções de execução.
