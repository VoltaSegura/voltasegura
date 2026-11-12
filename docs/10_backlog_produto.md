---
titulo: Backlog do produto VoltaSegura
projeto: VoltaSegura
atualizado: 2026-11-11
tipo: backlog-produto
fonte: "Consolidação das decisões de docs/03, 04, 05, 07, 08 e 06 até a versão 1.28 de docs/06"
convencao_status: "[DECISÃO] direcionamento atual do grupo · [HIPÓTESE] precisa ser testada · [EM ABERTO] não apresentar como resolvido"
---

# Backlog do produto VoltaSegura

Este documento reúne **tudo o que define o produto**: visão, proposta de valor, público, benchmarking, modelo de negócio, decisões técnicas, requisitos e histórias de usuário com critérios de aceite. É a **base para criar as Features e os Test Cases no Azure Boards** da entrega de Testing, Compliance & QA (`TODO.md` T10).

**Como se relaciona com os outros arquivos**

- `TODO.md`: tarefas do grupo (quem faz o quê e até quando). Este backlog descreve **o que o produto é e faz**.
- `docs/03`, `docs/04`, `docs/07` e `docs/08` continuam sendo a especificação detalhada. Cada item aqui aponta para a sua origem. Em caso de conflito, vale a ordem do `AGENTS.md` (`docs/05` primeiro).
- Toda decisão nova que mude um item deste backlog deve ser registrada em `docs/06` e refletida aqui na mesma alteração.

**Legenda**

| Campo | Significado |
|---|---|
| ID | `E` = épico, `F` = feature, `US` = história de usuário, `RNF` = requisito não funcional, `DT` = decisão técnica. Os IDs são estáveis: não renumerar. |
| Fase | **MVP** = entra no protótipo da GS · **Posterior** = roadmap, fora do MVP |
| Disciplina | Entrega da GS que implementa ou demonstra o item: Mobile (T07), SOA (T05), C# (T06), Cyber (T11), ML (T04), QA (T10) |

---

## 1. Visão do produto

| Item | Conteúdo | Status | Origem |
|---|---|---|---|
| **Problema** | Aplicativos de mobilidade priorizam tempo, distância e conveniência, mas não oferecem visão integrada e transparente das condições urbanas que influenciam a percepção de segurança durante o deslocamento. Isso dificulta comparar trajetos e pode limitar a liberdade de circular, especialmente à noite. | `[DECISÃO]` | `docs/03` §3 |
| **Proposta de valor** | Ajudar o usuário a entender as diferenças entre trajetos possíveis: não só tempo, mas indicadores disponíveis sobre os trechos, meios de transporte, horário e confiabilidade dos dados. | `[DECISÃO]` | `docs/03` §3 |
| **Posicionamento** | "Uma plataforma que transforma dados urbanos em informações compreensíveis para ajudar pessoas a comparar trajetos e tomar decisões mais conscientes sobre seus deslocamentos, tanto na ida quanto na volta." | `[DECISÃO]` | `docs/03` §1 |
| **Promessa responsável** | Oferecer mais contexto e autonomia. O produto **não garante segurança, não prevê crimes e não declara** que uma rua ou bairro é seguro ou perigoso. Conceito central: **exposição estimada**, sempre comparativa. | `[DECISÃO]` | `docs/03` §1, `docs/05` |
| **Diferenciação** | Integrar comparação de alternativas de mobilidade + indicadores de exposição + qualidade dos dados + contexto de horário + planejamento de ida e volta. Frase em teste: "não mostramos apenas informações sobre riscos; organizamos essas informações para apoiar uma decisão prática de mobilidade". | `[HIPÓTESE]` | `docs/03` §4 e §7 |
| **ODS** | ODS 11 (metas 11.2 e 11.7), com justificativa na Ficha do `README.md`. | `[DECISÃO]` | `docs/01` §7 |

## 2. Público e persona

| Item | Conteúdo | Status | Origem |
|---|---|---|---|
| **Público inicial** | Estudantes universitários que voltam para casa à noite usando transporte público e caminhadas. | `[DECISÃO]` | `docs/03` §3 |
| **Abrangência** | Município de São Paulo inteiro, sem campus ou bairro obrigatório. A comparação de cada trajeto depende da cobertura dos dados. | `[DECISÃO]` | `docs/03` §3 |
| **Persona** | **Ágatha Santos, 24 anos**: estudante universitária do período noturno; usa ônibus, metrô e caminhadas; sai da faculdade tarde; nem sempre conhece todos os trechos. Necessidade principal: entender as diferenças entre rotas e escolher com mais informação, sem depender só do menor tempo ou distância. **Proto-persona**, não validada com usuários. | `[DECISÃO de nome]` · perfil `[HIPÓTESE]` | `docs/03` §3 |
| **Instituições no piloto** | Nenhuma. Não citar universidade como parceira ou candidata. | `[DECISÃO]` | `docs/06` (1.26) |
| **Públicos futuros** | Trabalhadores noturnos, frequentadores de eventos, turistas, outros usuários de transporte público. Não priorizar agora. | `[HIPÓTESE]` | `docs/03` §3 |

## 3. Benchmarking

> `[HIPÓTESE de diferenciação]` Lista registrada em `docs/03` §7. **A atualização funcional está pendente** (`TODO.md` T17): testar as funcionalidades atuais de cada concorrente antes de afirmar que nenhum oferece algo semelhante. Nunca dizer "somos os primeiros a relacionar navegação e segurança" (`docs/05`).

| Referência | O que oferece (registro atual) | Relação com o VoltaSegura |
|---|---|---|
| Google Maps | Navegação, alternativas de rota, caminhada e transporte público | Concorrente direto no planejamento; prioriza tempo e distância |
| Waze | Alertas colaborativos; associado a iniciativas de alertas de insegurança | Precedente de alertas; casos no Brasil citados nos guardrails |
| Moovit | Planejamento de transporte público multimodal | Concorrente direto no transporte público |
| Onde Fui Roubado | Mapa colaborativo brasileiro de ocorrências (verificar situação atual) | Mostra ocorrências; não compara alternativas de trajeto |
| Citizen | App de alertas de ocorrências | Alertas em tempo real; motivou a troca do nome do produto |
| SketchFactor; patente da Microsoft ("avoid ghetto") | Precedentes históricos de rotulagem de territórios | Mostram o risco de estigmatização que o produto evita |

## 4. Modelo de negócio

| Item | Conteúdo | Status | Origem |
|---|---|---|---|
| **Modelo** | B2B2C: o estudante usa; instituições contratam para a comunidade. Mantido como modelo futuro, mesmo sem instituição no piloto. No pitch: "modelo a validar". | `[HIPÓTESE]` | `docs/03` §8, `docs/06` (1.28) |
| **Receitas a validar** | Licença institucional recorrente; planos para empresas com turnos noturnos; pacotes por evento; depois, API ou painéis agregados. | `[HIPÓTESE]` | `docs/03` §8 |
| **Princípio comercial** | Não vender dados pessoais nem trajetos individuais; patrocinadores não alteram resultados. | `[DECISÃO]` | `docs/03` §6 e §8 |
| **Custos a considerar** | Infraestrutura (servidor do OTP2, banco, processamento), manutenção das bases, desenvolvimento, segurança e LGPD, auditoria da metodologia. Custo de hospedagem só depois de medir o OTP2. | `[EM ABERTO]` | `docs/03` §8, `docs/04` §6.2 |

## 5. Decisões técnicas

| ID | Decisão | Status | Origem |
|---|---|---|---|
| DT-01 | **Roteamento: OpenTripPlanner 2** em servidor próprio, com GTFS da SPTrans (inclui Metrô e CPTM) e OpenStreetMap do município. Versão atual 2.10.0, que exige Java 25. Teste local em andamento (Lucas Simidu). | `[DECISÃO]` · teste `[EM ABERTO]` | `docs/04` §6, `scripts/otp2/` |
| DT-02 | **Horários programados** do GTFS (`frequencies.txt`); **tempo real fora do MVP**. O GTFS é usado como vem, sem edição; defasagens conhecidas (Linha 17-Ouro) aparecem nas limitações. | `[DECISÃO]` | `docs/04` §5 |
| DT-03 | **Dados criminais: SSP-SP** (`SPDadosCriminais`), classificação por `NATUREZA_APURADA`, sem somar com `RUBRICA`. Só `FURTO - OUTROS` e `ROUBO - OUTROS` entram na comparação. | `[DECISÃO]` | `docs/07` |
| DT-04 | **Unidade de `N`**: boletim distinto (`NUM_BO` + `ANO_BO` + `NOME_DELEGACIA`); todos os tipos de local; coordenadas como publicadas. | `[DECISÃO]` | `docs/08` |
| DT-05 | **Período histórico**: 12 meses mais recentes pela data da ocorrência; no MVP, jan–set/2026 com aviso até auditar 2025. **Faixa do dia**: os quatro períodos da SSP (madrugada 0–5h, manhã 6–11h, tarde 12–17h, noite 18–23h); cada trecho a pé usa o período em que será percorrido. | `[DECISÃO]` | `docs/08` |
| DT-06 | **Conta**: só trechos a pé; corredor de ±100 m (sensibilidade em ±50 e ±150 m); `N` = boletins no corredor; `L` = km a pé; `D = N/L`. | `[DECISÃO]` | `docs/08` |
| DT-07 | **Regra de destaque**: cobertura ≥ 80% por alternativa e diferença ≤ 10 p.p.; `N_X + N_Y ≥ 10`; destacar só se uma alternativa tiver `N` **e** `D` menores e teste binomial exato bilateral com `p < 0,05` nas três larguras. Sem pesos arbitrários. | `[DECISÃO]` · validação em trajetos reais `[EM ABERTO]` | `docs/08` |
| DT-08 | **Privacidade**: conta obrigatória só com e-mail e identificador; login por e-mail e senha ou Google; consultas descartadas após o cálculo; logs sem coordenadas nem vínculo com a conta; histórico só no aparelho; GPS opcional; exclusão da conta pelo app; exclusão e incidentes operados só pelos desenvolvedores internos. | `[DECISÃO]` · base legal e revisão jurídica `[EM ABERTO]` | `docs/03` §6 |
| DT-09 | **Revisão de vieses automática**: script de cobertura por circunscrição e subprefeitura antes do piloto e a cada atualização; bloqueio só por "dados insuficientes"; pesos e limites nunca mudam sozinhos. | `[DECISÃO]` · script `[EM ABERTO]` (T20) | `docs/08` |
| DT-10 | **Percepção relatada por usuários fora do MVP**: nenhum relato vira dado no app. | `[DECISÃO]` | `docs/06` §3 |
| DT-11 | **App**: React Native com TypeScript e Expo Router; consome API ou mock e salva em banco (exigência da entrega Mobile). | `[DECISÃO]` (rubrica) | `docs/02` §5 |
| DT-12 | **Backends SOA e C#, ESP32 e Risco Cidadão** atendem às disciplinas e não definem o produto. Arquitetura SOA × C# despriorizada. | `[DECISÃO]` · arquitetura `[EM ABERTO]` | `docs/06` §3 |

## 6. Épicos, features e histórias de usuário

Formato das histórias: "Como [persona], quero [ação], para [benefício]". Critérios de aceite em "Dado / Quando / Então", prontos para virar Test Cases.

### E1 — Conta e privacidade

#### F1.1 — Cadastro com consentimento · MVP · Mobile, SOA, Cyber · `[DECISÃO]` (DT-08)

**US-01.** Como Ágatha, quero criar uma conta informando só e-mail e senha, para usar o app sem entregar dados pessoais além do necessário.

- **AC1.** Dado a tela de cadastro, então os únicos dados pedidos são e-mail e senha; não há campos de nome completo, telefone ou endereço.
- **AC2.** Dado o cadastro preenchido, quando o usuário não aceitar o aviso de privacidade, então a conta não é criada e o motivo é exibido.
- **AC3.** Dado um e-mail já cadastrado, quando tentar criar outra conta com ele, então o cadastro é recusado com mensagem clara.
- **AC4.** Dado um e-mail em formato inválido ou senha vazia, quando enviar, então o cadastro é recusado e o campo com problema é indicado.
- **AC5.** Dado a opção "Entrar com Google", quando o usuário autorizar, então a conta é criada só com e-mail e identificador do Google, sem nome nem foto. `[DECISÃO — 11/11/2026]`
- **AC6.** O aviso de privacidade do protótipo se apresenta como minuta acadêmica, sem revisão jurídica, e não afirma conformidade com a LGPD. `[DECISÃO — 11/11/2026]`
- `[EM ABERTO]` Regras de senha; base legal. Revisão jurídica só antes de uso real.

#### F1.2 — Login e sessão · MVP · Mobile, SOA

**US-02.** Como Ágatha, quero entrar na minha conta, para consultar trajetos.

- **AC1.** Dado e-mail e senha corretos, quando entrar, então o app abre a tela de planejamento.
- **AC2.** Dado senha incorreta ou e-mail inexistente, quando entrar, então o acesso é negado com mensagem genérica, sem revelar qual dos dois está errado.
- **AC3.** Dado um usuário sem sessão, quando tentar consultar trajetos, então o app pede login (conta obrigatória).

#### F1.3 — Exclusão da conta pelo app · MVP · Mobile, SOA, Cyber

**US-03.** Como Ágatha, quero excluir minha conta pelo próprio app, para que o servidor não guarde mais nada sobre mim.

- **AC1.** Dado um usuário logado, quando escolher excluir a conta e confirmar, então e-mail e identificador são apagados do servidor e a sessão é encerrada.
- **AC2.** Dado uma conta excluída, quando tentar entrar com o mesmo e-mail e senha, então o acesso é negado.
- **AC3.** Dado o pedido de exclusão, quando o usuário cancelar a confirmação, então nada é apagado.

#### F1.4 — Histórico de trajetos só no aparelho · MVP · Mobile

**US-04.** Como Ágatha, quero guardar meus trajetos frequentes no celular, se eu quiser, para não digitar tudo de novo, sem que fiquem no servidor.

- **AC1.** Dado o histórico desativado (padrão), quando fizer uma consulta, então nada é salvo no aparelho.
- **AC2.** Dado o histórico ativado, quando fizer uma consulta, então o trajeto é salvo só no armazenamento local do aparelho.
- **AC3.** Dado trajetos salvos, quando o usuário apagar um ou todos, então eles somem do aparelho.
- **AC4.** Em nenhum caso o histórico é enviado ao servidor ou vinculado à conta.

#### F1.5 — Localização atual opcional · MVP · Mobile

**US-05.** Como Ágatha, quero usar minha localização atual como origem só quando eu pedir, para não ser rastreada.

- **AC1.** Dado o campo de origem, quando tocar em "usar minha localização", então o app pede permissão de GPS (se ainda não concedida) e preenche a origem.
- **AC2.** Dado a permissão negada, então o usuário consegue digitar a origem normalmente.
- **AC3.** O app não lê a localização em segundo plano nem fora dessa ação.

### E2 — Planejamento do trajeto

#### F2.1 — Informar origem, destino e horário · MVP · Mobile, SOA · `[DECISÃO]` (`docs/03` §4)

**US-06.** Como Ágatha, quero informar origem, destino e horário de saída, para ver as alternativas daquele horário.

- **AC1.** Dado origem, destino e horário preenchidos, quando pedir as alternativas, então o app envia a consulta e exibe o resultado.
- **AC2.** Dado origem ou destino vazio, quando pedir as alternativas, então a consulta não é enviada e o campo faltante é indicado.
- **AC3.** Dado um ponto fora do município de São Paulo, quando pedir as alternativas, então o app informa que a consulta está fora da área atendida. `[EM ABERTO]` comportamento a confirmar pelo grupo; deriva da abrangência municipal decidida.
- **AC4.** Dado origem igual ao destino, então o app informa que não há trajeto a calcular.

#### F2.2 — Planejar ida e volta separadamente · MVP · Mobile · `[DECISÃO]`

**US-07.** Como Ágatha, quero planejar a volta com o horário em que saio da faculdade, separada da ida, porque as condições mudam conforme a hora.

- **AC1.** Dado um trajeto de ida planejado, quando escolher planejar a volta, então origem e destino são invertidos e o horário da volta pode ser definido à parte.
- **AC2.** A comparação da volta usa o período da SSP do horário da volta, não o da ida.

#### F2.3 — Receber alternativas multimodais · MVP · Mobile, SOA · `[DECISÃO]` (DT-01, DT-02)

**US-08.** Como Ágatha, quero ver as alternativas de trajeto com ônibus, metrô, trem e caminhada, para comparar opções reais.

- **AC1.** Dado uma consulta válida, então cada alternativa mostra duração total, distância a pé, número de baldeações e os trechos (modo, linha, horário previsto).
- **AC2.** Dado que o roteamento não encontra alternativa no horário (sem serviço), então o app informa que não há alternativa de transporte público e não exibe comparação.
- **AC3.** Os horários exibidos são programados (GTFS) e o app os identifica como previstos, não em tempo real.
- **AC4.** Com só uma alternativa disponível, o app a exibe sem comparação de exposição estimada.

#### F2.4 — Orientação passo a passo · MVP a confirmar · Mobile · `[HIPÓTESE]` (roadmap Fase 1)

**US-09.** Como Ágatha, quero ver o passo a passo da alternativa escolhida, para seguir o trajeto.

- **AC1.** Dado uma alternativa escolhida, então o app lista os trechos em ordem, com pontos de embarque e desembarque.
- `[EM ABERTO]` Confirmar se entra no protótipo da GS.

### E3 — Comparação de exposição estimada

#### F3.1 — Calcular N, L e D por alternativa · MVP · SOA, C# · `[DECISÃO]` (DT-03 a DT-06)

**US-10.** Como Ágatha, quero ver quantos registros de furto e roubo existem perto dos trechos a pé de cada alternativa, para entender a diferença entre elas.

- **AC1.** Para cada alternativa, o sistema calcula `N` (boletins distintos de `FURTO - OUTROS` e `ROUBO - OUTROS` no corredor de ±100 m dos trechos a pé, no período e na faixa do dia corretos), `L` (km a pé) e `D = N/L`.
- **AC2.** Um boletim dentro de corredores sobrepostos da mesma alternativa conta uma vez.
- **AC3.** Um boletim com uma linha de furto e outra de roubo conta uma vez.
- **AC4.** Registros de outras naturezas (carga, veículo, latrocínio, trânsito, homicídio, violência sexual) não alteram `N`.
- **AC5.** Alternativa sem trecho a pé (`L = 0`): o indicador aparece como "não aplicável", nunca como zero.
- **AC6.** Registros sem coordenada válida ou sem período ficam fora da conta e reduzem a cobertura informada.

#### F3.2 — Regra de destaque · MVP · SOA, C# · `[DECISÃO]` (DT-07)

**US-11.** Como Ágatha, quero que o app só destaque uma alternativa quando a diferença for clara, para não decidir com base em acaso.

- **AC1.** Dado as duas alternativas com cobertura ≥ 80%, diferença de cobertura ≤ 10 p.p., `N_X + N_Y ≥ 10`, X com `N` e `D` menores e `p < 0,05` nas três larguras, então X aparece como "menor exposição estimada entre as alternativas avaliadas".
- **AC2.** Dado `N` menor em X e `D` menor em Y, então nenhuma é destacada e aparece "indicadores mistos; não há conclusão por ocorrências registradas", com os números.
- **AC3.** Dado `p ≥ 0,05` em qualquer largura, então aparece "sem diferença clara entre os registros", com `N`, `D` e `L`.
- **AC4.** Dado que a alternativa favorecida muda com a largura do corredor, então nenhuma é destacada.
- **AC5.** O app nunca escolhe a rota pelo usuário e não mistura tempo e registros numa nota única.

#### F3.3 — Resultado "dados insuficientes" · MVP · SOA, Mobile · `[DECISÃO]`

**US-12.** Como Ágatha, quero saber quando não há dados suficientes para comparar, para não confundir falta de dado com vantagem.

- **AC1.** Dado `N_X + N_Y < 10`, então o resultado é "dados insuficientes", com o motivo "menos de 10 registros no total".
- **AC2.** Dado cobertura < 80% em alguma alternativa ou diferença > 10 p.p., então "dados insuficientes", com o motivo de cobertura.
- **AC3.** Dado zero registro numa alternativa, o app não a apresenta como vantajosa por isso.

#### F3.4 — Tela de comparação · MVP · Mobile · `[DECISÃO]`

**US-13.** Como Ágatha, quero ver lado a lado o tempo e a exposição estimada de cada alternativa, para decidir eu mesma.

- **AC1.** A tela mostra tempo, caminhada e baldeações separados da exposição estimada.
- **AC2.** Há três estados de resultado distintos: "menor exposição estimada entre as alternativas avaliadas", "sem diferença clara entre os registros" e "dados insuficientes".
- **AC3.** Nenhum texto usa "rota segura", "rua perigosa", "área de risco" ou equivalentes (RNF-01).
- **AC4.** As mensagens são redação proposta, não validada com usuários (`docs/08`); a metodologia do teste de compreensão fica registrada para fase posterior.

### E4 — Transparência dos dados

#### F4.1 — Bloco "Sobre os dados" · MVP · Mobile · `[DECISÃO]` (`docs/08`)

**US-14.** Como Ágatha, quero ver de onde vêm os dados e suas limitações, para saber o quanto confiar na comparação.

- **AC1.** O bloco fica sempre visível junto da comparação, separado da exposição estimada, sem nota, escala ou níveis.
- **AC2.** Mostra fonte e período (ex.: "SSP-SP, boletins de jan–set/2026 (9 meses)") e a data de atualização da base.
- **AC3.** Mostra a cobertura de cada alternativa em percentual.
- **AC4.** Mostra a situação da comparação numa das três frases fixas, com o motivo quando faltar dado.
- **AC5.** Mostra as limitações fixas: subnotificação (zero registro não é ausência de ocorrência); coordenadas podem ser pontos de referência; contagem inclui todos os tipos de local; só furtos e roubos "outros"; horários programados que podem não refletir mudanças recentes.

#### F4.2 — Categorias de ocorrências e detalhes · MVP · Mobile · `[DECISÃO]` (`docs/07`)

**US-15.** Como Ágatha, quero ver os totais de furto, roubo e ocorrências de trânsito com detalhes, para entender o contexto.

- **AC1.** A tela principal mostra Furto, Roubo e Ocorrências de trânsito; "Ver detalhes" abre as parcelas de cada grupo.
- **AC2.** O app informa que só `FURTO - OUTROS` e `ROUBO - OUTROS` entram na comparação; os totais dos grupos não são apresentados como o valor comparado.
- **AC3.** Homicídio doloso, tentativa de homicídio e violência sexual aparecem só em "Dados considerados / Detalhes", como total do município, com aviso de que não descrevem a rua nem o trajeto.
- **AC4.** Não há marcadores de ocorrências individuais no mapa nem filtros que reduzam o panorama a rua, endereço ou data exata.

#### F4.3 — Atribuição das fontes · MVP · Mobile · `[DECISÃO]`

**US-16.** Como Ágatha, quero ver o crédito das fontes de dados abertos, para saber quem as produz.

- **AC1.** O app credita SSP-SP (CC-BY 4.0), SPTrans (GTFS) e "© OpenStreetMap contributors" (ODbL) nas telas de mapa ou em "Sobre os dados".
- **AC2.** Se a camada de iluminação do GeoSampa for usada, crédito e licença CC-BY-SA 4.0 aparecem.

### E5 — Qualidade dos dados e vieses (backend)

#### F5.1 — Relatório automático de cobertura por região · MVP · ML, SOA · `[DECISÃO]` (DT-09)

**US-17.** Como equipe do VoltaSegura, queremos medir a cobertura dos dados por região a cada atualização, para não oferecer, sem avisar, um serviço pior a quem mora onde há menos dados.

- **AC1.** O script calcula, por circunscrição e por subprefeitura, a fração de boletins elegíveis com coordenada e período válidos.
- **AC2.** O relatório é gerado antes do piloto e a cada atualização da base e é publicado com a metodologia.
- **AC3.** O script não altera pesos nem limites; o efeito sobre o app é só o bloqueio por "dados insuficientes" (F3.3).
- `[HIPÓTESE]` Interromper a atualização se a base mudar de formato (colunas ausentes, queda brusca de cobertura, circunscrição sumida).

#### F5.2 — Atualização das bases · MVP · SOA · `[DECISÃO]`

**US-18.** Como equipe, queremos atualizar GTFS e SSP-SP de forma reprodutível, para manter as alternativas e a contagem atuais.

- **AC1.** O download do GTFS é feito por script; a cada novo arquivo, conferir as janelas das linhas Metrô 6 e 17.
- **AC2.** A base SSP-SP usada (arquivo e SHA256) fica registrada em `src/ml/dados/README.md`.
- **AC3.** O app mostra a data de atualização de cada base (F4.1).

### E6 — Segurança e proteção de dados

#### F6.1 — Consultas não armazenadas · MVP · SOA, Cyber · `[DECISÃO]` (DT-08)

**US-19.** Como Ágatha, quero que minhas origens e destinos não fiquem guardados, para que ninguém descubra onde moro ou minha rotina.

- **AC1.** O servidor usa origem, destino e horário só para calcular a resposta e não os grava em banco.
- **AC2.** Os logs técnicos não contêm coordenadas, endereços nem o identificador da conta.
- **AC3.** O roteamento roda em servidor próprio; a consulta não é enviada a serviços externos de mapas.

#### F6.2 — Nada de registros individuais no app · MVP · SOA, Cyber · `[DECISÃO]` (`docs/08`)

**US-20.** Como cidadão, quero que o app não exponha boletins individuais, para que vítimas não sejam identificáveis.

- **AC1.** A API devolve só resultados agregados (`N`, `D`, `L`, cobertura); nunca coordenadas ou dados de boletins individuais.
- **AC2.** Recortes que permitam identificar pessoas não são exibidos.

## 7. Requisitos não funcionais

| ID | Requisito | Verificação | Origem |
|---|---|---|---|
| RNF-01 | Linguagem: usar "exposição estimada" sempre comparativa; proibido "rota segura", "rua/bairro perigoso", "área de risco", "garantimos segurança", "prevemos crimes". | Revisão de todos os textos de tela contra `docs/05` | `docs/05` |
| RNF-02 | Não rotular bairros ou territórios inteiros; trabalhar só com trechos. | Nenhuma tela ou endpoint classifica bairro | `docs/05` |
| RNF-03 | Ausência de registro nunca vira pontuação positiva. | Casos com `N = 0` não geram destaque por si só | `docs/05`, `docs/08` |
| RNF-04 | Confiança dos dados exibida separada da exposição estimada. | Bloco "Sobre os dados" presente em toda comparação | `docs/05`, `docs/08` |
| RNF-05 | Privacidade desde a concepção e minimização (LGPD). | F1.1, F1.3, F1.4, F6.1 | `docs/03` §6 |
| RNF-06 | Não transferir ao usuário a responsabilidade por uma ocorrência. | Nenhum texto sugere culpa do usuário pela escolha | `docs/03` §6, `docs/05` |
| RNF-07 | Acessibilidade no app (critério da rubrica de Mobile). | Rótulos de acessibilidade, contraste e tamanho de toque nas telas | `docs/02` §5 |
| RNF-08 | Dados de exemplo identificados como tal (ex.: tempos 32/38 min do mockup). | Telas e slides com aviso de exemplo | `docs/05` |
| RNF-09 | Não afirmar conformidade com a LGPD: o aviso de privacidade é minuta acadêmica, sem revisão jurídica. | Nenhum texto do app, pitch ou slides diz "em conformidade com a LGPD" | `docs/06` (1.31) |

## 8. Fora do escopo do MVP

| Item | Motivo | Origem |
|---|---|---|
| Tempo real de ônibus, Metrô e CPTM | Sem fonte aberta confirmada para trilhos; Olho Vivo pendente (Lucas Simidu, T07) | `docs/04` §2.2 e §5 |
| Lotação de ônibus | Sem fonte validada | `docs/05` |
| Relatos de percepção dos usuários | Viés, estigmatização, privacidade e moderação | `docs/06` §3 |
| Testes de compreensão com usuários | Não serão feitos nesta fase; metodologia registrada | `docs/08` |
| Contadores agregados de uso e histórico no servidor | Opções B e C de privacidade não adotadas | `docs/03` §6 |
| IBGE e SP156 | Não necessários à comparação | `docs/06` §3 |
| Checagens de viés por resultado e por acesso ao registro | Dependem de roteamento em lote | `docs/08` |
| Garantia de segurança, previsão de crimes, monitoramento contínuo | Contrários ao posicionamento | `docs/03` §9 |

## 9. Itens de fases posteriores (roadmap)

`[HIPÓTESE de evolução]` (`docs/03` §9). Não entram nas Features do MVP no Azure Boards.

| ID | Item | Fase |
|---|---|---|
| P-01 | Tempo real de transporte com fonte confiável; replanejamento diante de mudanças operacionais | Fase 2 |
| P-02 | Compartilhamento opcional de trajeto, com consentimento e controles de privacidade | Fase 2 |
| P-03 | Indicadores urbanos adicionais (ex.: iluminação pública do GeoSampa) | Fase 3 |
| P-04 | Preferências de mobilidade e acessibilidade | Fase 3 |
| P-05 | Parcerias, integrações institucionais e API sob demanda; outras cidades | Fase 4 |
| P-06 | Teste de compreensão das mensagens com usuários (metodologia em `docs/08`) | Após o MVP |

## 10. Pontos em aberto que afetam o backlog

- Provedor de login (e-mail e senha ou Google), base legal e texto do aviso de privacidade (F1.1).
- Redação final das mensagens de resultado (F3.4).
- Validação da regra em trajetos reais, que depende do teste do OTP2 (DT-01, DT-07).
- Termos de redistribuição do GTFS e uso da Olho Vivo (Lucas Simidu, T07).
- Inclusão do passo a passo no protótipo (F2.4).
- Indicador "Risco Cidadão" e arquitetura SOA × C# (disciplinas).
- Atualização do benchmarking (seção 3, T17).

## 11. Como levar este backlog ao Azure Boards (T10)

1. **Feature** = cada `F` da seção 6 marcada como MVP. Título: ID + nome (ex.: "F3.3 — Resultado 'dados insuficientes'").
2. **Descrição da Feature** = a história de usuário (`US`) e o status entre colchetes.
3. **Critérios de aceite** = os `AC` da história, copiados como estão.
4. **Test Cases**: pelo menos um caso **positivo** e um **negativo** por Feature, a partir dos `AC`. Cada Test Case tem objetivo, preparação, inputs, outputs esperados e passos (`docs/02` §8). Exemplos:
   - Positivo (F3.2-AC1): alternativas com cobertura e diferença suficientes → destaque correto.
   - Negativo (F3.3-AC1): `N_X + N_Y = 7` → "dados insuficientes" com o motivo.
   - Negativo (F1.1-AC2): cadastro sem aceite do aviso de privacidade → conta não criada.
5. Os `RNF` viram critérios transversais ou Test Cases próprios (ex.: varredura de textos proibidos do RNF-01).
6. Itens `[EM ABERTO]` e da seção 9 **não** viram Features do MVP.

## 12. Histórico

| Data | Versão | Mudança | Responsável |
|---|---|---|---|
| 11/11/2026 | 1.0 | Criação do backlog a partir das decisões registradas até a versão 1.28 de `docs/06`: visão, público, benchmarking, negócio, decisões técnicas, 6 épicos com 20 features e 20 histórias com critérios de aceite, requisitos não funcionais, fora do escopo, roadmap e guia para o Azure Boards | Lucas Simidu + assistente |
