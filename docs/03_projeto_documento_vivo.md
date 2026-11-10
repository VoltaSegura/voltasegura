---
titulo: VoltaSegura — Documento Vivo do Projeto (consolidado)
projeto: VoltaSegura (produto; ex-"CitizenTech", renomeado em 10/11/2026)
versao_origem: "0.1 — 09/11/2026"
atualizado: 2026-11-10
tipo: referencia-produto-estrategia
convencao_status: "[DECISÃO] direcionamento atual do grupo · [HIPÓTESE] precisa ser testada · [EM ABERTO] não apresentar como feito"
---

# VoltaSegura — Documento Vivo do Projeto

> **Nome**: o produto chama-se **VoltaSegura** (decisão de 10/11/2026). O nome anterior de trabalho era "CitizenTech", que ficou confuso com o tema da GS e com o app "Citizen". "CitizenTech" ainda aparece em alguns arquivos como nome de fonte histórica ou do tema da FIAP — não é o nome do produto.

> **Regra de leitura**: decisões tomadas são direcionamentos atuais do grupo; hipóteses precisam ser testadas; pontos em aberto `NÃO` devem ser apresentados como funcionalidades ou capacidades já comprovadas.

## 1. Resumo executivo

- **Origem** `[DECISÃO]`: a dor nasceu da pergunta prática — "quando o Google Maps sugere uma rota, como o usuário sabe se aquele caminho é adequado também em relação à segurança?"
- **Evolução** `[DECISÃO]`: de um mapa de ocorrências para uma **plataforma de apoio à decisão de mobilidade** que compara alternativas de deslocamento (ônibus, metrô, caminhada) considerando criminalidade, transporte público, infraestrutura urbana e horário — mostrando **exposição estimada** e **confiabilidade dos dados**.
- **Posicionamento** `[DECISÃO]`: "uma plataforma que transforma dados urbanos em informações compreensíveis para ajudar pessoas a comparar trajetos e tomar decisões mais conscientes sobre seus deslocamentos, tanto na ida quanto na volta."
- **Promessa responsável** `[DECISÃO]`: oferecer mais contexto e autonomia. O produto **não garante segurança, não prevê crimes e não declara** que uma rua ou bairro é seguro ou perigoso.

## 2. Feedback do professor

### Pontos fortes reconhecidos
- Identidade visual consistente (preto e laranja), traçado de rota recorrente, boa hierarquia de texto.
- Narrativa bem organizada: gancho, problema, dados, solução, funcionamento, modelo de negócio, roadmap.
- Mockup demonstrando comparação entre rota mais rápida e rota com menor exposição estimada.
- Uso de fontes para sustentar as estatísticas.

> **Nota sobre o mockup** `[DECISÃO]`: os tempos de 32 min e 38 min são **exemplos visuais** — não devem ser apresentados como resultados de algoritmo implementado ou validado.

### Pontos que exigem aprofundamento
- **Dados e cálculo de exposição**: especificar bases, granularidade, frequência de atualização, critérios de classificação e tratamento de subnotificação.
- **Riscos éticos e jurídicos**: evitar estigmatização territorial, vieses, falsas garantias e uso indevido de dados pessoais.
- **Concorrência**: reconhecer Google Maps, Waze e Moovit; demonstrar diferenciação concreta.
- **Estatísticas**: informar separadamente fonte, público, amostra, período e o que cada percentual mede.
- **Público-alvo**: começar com um perfil prioritário.

## 3. Problema, proposta e público

### Problema que queremos resolver
Aplicativos de mobilidade priorizam tempo, distância e conveniência, mas não oferecem visão integrada e transparente das condições urbanas que influenciam a percepção de segurança durante todo o deslocamento. Isso dificulta comparar trajetos e pode limitar a liberdade de circular, especialmente à noite ou em regiões desconhecidas.

### Proposta de valor
Ajudar o usuário a entender as diferenças entre trajetos possíveis — não apenas tempo, mas indicadores disponíveis sobre os trechos, meios de transporte, horário e confiabilidade dos dados.

### Público inicial `[DECISÃO]`
**Estudantes universitários que retornam para casa à noite**, usando transporte público e caminhadas. Justificativa: rotina recorrente e previsível, testável em uma região delimitada, e conecta público de impacto ao modelo de negócio (universidades como clientes institucionais).

### Persona de trabalho: **Marina, 22 anos** `[HIPÓTESE — validar via entrevistas]`
- Estudante universitária do período noturno; usa ônibus, metrô e caminhadas; sai da faculdade tarde; nem sempre conhece bem todos os trechos.
- **Necessidade principal**: entender as diferenças entre rotas e escolher com mais informação, sem depender só do menor tempo/distância.
- Obs.: a ficha inicial registrava "Ágatha Santos, 24 anos" — padronizar nome/idade após pesquisa com estudantes.

### Públicos futuros (não priorizar agora)
Trabalhadores noturnos · frequentadores de eventos · turistas · outros usuários de transporte público.

## 4. Como a solução deve funcionar `[DECISÃO — fluxo]`

1. **Planejar**: usuário informa origem, destino, horário de saída/chegada e, quando aplicável, horário previsto de retorno.
2. **Analisar**: plataforma consulta fontes de mobilidade, segurança e infraestrutura para os trechos.
3. **Comparar**: sistema apresenta alternativas com tempo, caminhada, conexões, disponibilidade de transporte, indicadores de exposição e confiabilidade dos dados.
4. **Decidir**: usuário visualiza os fatores considerados e escolhe.
5. **Revisar a jornada**: ida e volta são planejadas separadamente quando horários e condições diferem.

**Frase de diferenciação em desenvolvimento** `[HIPÓTESE]`: "não mostramos apenas informações sobre riscos; organizamos essas informações para apoiar uma decisão prática de mobilidade."

## 5. Metodologia de exposição estimada `[EM ABERTO — não definir pesos ainda]`

- A classificação **não está definida**. Não inventar pesos nem apresentar índice numérico como validado. **Primeiro auditar as bases** (ver `04_dados_fontes.md`).
- **Abordagem proposta para o MVP**:
  1. Dividir cada rota em segmentos respeitando a granularidade das fontes.
  2. Considerar indicadores disponíveis: ocorrências, período, iluminação, caminhada, conexões, oferta de transporte.
  3. Comparar alternativas com critérios explícitos — **sem classificar bairros inteiros**.
  4. Exibir origem, data e cobertura dos dados.
  5. Apresentar indicação de qualidade/confiança dos dados **separada** da exposição estimada.
- **Linguagem de resultado recomendada** (comparativa e contextualizada):
  - "Menor exposição estimada" — indicadores apontam condições relativamente mais favoráveis entre as alternativas avaliadas.
  - "Atenção a determinados fatores" — indicadores que merecem consideração.
  - "Dados insuficientes" — informação insuficiente para comparação confiável.
- **Evitar rótulos absolutos**: "rota segura", "rua perigosa", "bairro seguro".
- **Subnotificação** `[DECISÃO conceitual]`: zero ocorrência ≠ segurança. Poucos boletins podem refletir subnotificação, barreiras de acesso, baixa confiança institucional ou diferenças de registro. Medidas a investigar: indicar cobertura/limitações, não concluir com amostra insuficiente, comparar períodos com cuidado, buscar fontes complementares (percepção e infraestrutura), nunca transformar ausência de dados em pontuação positiva.

## 6. Ética, privacidade e responsabilidade

Riscos documentados em sistemas que rotulam territórios (stigma, vieses) — princípios que **devem orientar o produto**:

1. Não estigmatizar bairros, comunidades ou grupos sociais.
2. Não classificar territórios inteiros como perigosos com base em contagens brutas.
3. Explicar quais indicadores influenciaram a comparação e quando os dados foram atualizados.
4. Sinalizar incerteza, cobertura insuficiente e possíveis vieses.
5. Não prometer segurança nem garantir ausência de ocorrências.
6. Privacidade desde a concepção; minimização de dados; controles LGPD.
7. Não vender histórico individual de localização; patrocinadores não alteram classificações.
8. Avaliar periodicamente resultados desproporcionais contra determinadas regiões.

> A plataforma apoia a decisão do usuário; **não transfere a ele a responsabilidade por uma ocorrência**. Avisos e termos de uso não substituem projeto responsável, segurança da informação e análise jurídica.

## 7. Concorrência e diferenciação `[HIPÓTESE de diferenciação — testar]`

- Google Maps: navegação, alternativas, caminhada, transporte público.
- Waze: alertas colaborativos; associado a iniciativas de alertas de insegurança.
- Moovit: planejamento de transporte público multimodal.
- **Onde Fui Roubado**: mapa colaborativo brasileiro (verificar situação atual).
- **Citizen**: app de alertas de ocorrências (também relevante para o nome).
- **SketchFactor e patente da Microsoft ("avoid ghetto")**: precedentes históricos de estigmatização.

**Hipótese de diferenciação**: a oportunidade não é mostrar onde houve ocorrências, mas **integrar** comparação de alternativas de mobilidade + indicadores de exposição + qualidade dos dados + contexto de horário + planejamento de ida e volta. **Testar funcionalidades atuais dos concorrentes, cobertura e usuários antes de afirmar que nenhum oferece algo semelhante.**

### Contexto regulatório `[verificar antes de usar em slides]`
- **PL 1.169/2025**: propõe regras para identificação de áreas de alto risco em apps de navegação. Tramitação encerrada no Senado e enviada à Câmara em 05/11/2025 — **verificar novamente a tramitação; não descrever como lei vigente**.

### Nome do projeto `[DECISÃO — renomeado em 10/11/2026]`
O produto passa a se chamar **VoltaSegura**. O nome resolve o conflito de identidade com o app **Citizen** e dialoga com o propósito (planejamento da **volta** para casa com **segura**nça informacional). Checagens de marca, domínio e busca de anterioridade para "VoltaSegura" continuam `EM ABERTO` — confirmar antes de uso comercial.

## 8. Modelo de negócio `[HIPÓTESE — não validado financeiramente]`

- **Modelo proposto**: **B2B2C** — o estudante usa a solução; instituições contratam para a comunidade.
- **Primeiro cliente potencial**: universidades/centros universitários com estudantes do período noturno (licença institucional, divulgação, piloto em campus/região).
- **Fontes de receita a validar**: licença institucional recorrente · planos para empresas (turnos noturnos) · pacotes por evento · posteriormente, licenciamento de API/painéis agregados.
- **Princípio comercial**: **não vender** dados pessoais ou trajetos individuais; relatórios institucionais agregados, anonimizados, com controles de privacidade.
- **Custos a incluir**: infraestrutura em nuvem, banco, processamento e monitoramento; serviços de mapas/geocodificação/roteamento; integração e manutenção das bases; desenvolvimento, suporte, segurança e LGPD; auditoria da metodologia, testes e atendimento institucional.
- **Antes de projetar receita**: entrevistar universidades, entender orçamento e processo de contratação, testar disposição a pagar, estimar custo por usuário/campus.

## 9. Roadmap `[HIPÓTESE de evolução — prazos só após auditoria de dados]`

| Fase | Escopo |
|---|---|
| **Fase 0 — Viabilidade e descoberta** | Auditar fontes/formatos/granularidade/atualização/licenças; entrevistar estudantes noturnos e universidades; escolher região ou campus do piloto; definir princípios de ética, privacidade e comunicação de incerteza |
| **Fase 1 — MVP** | Planejamento de **ida e volta**; rotas multimodais com integração validada; comparação de alternativas por tempo, conexões e indicadores de exposição disponíveis; explicação de fontes, datas e qualidade; orientação passo a passo; indicação de "dados insuficientes" quando aplicável |
| **Fase 2 — Acompanhamento** | Tempo real de transporte (com fonte confiável); replanejamento diante de mudanças operacionais; compartilhamento opcional de trajeto com consentimento e controles de privacidade |
| **Fase 3 — Inteligência e personalização** | Indicadores urbanos adicionais; preferências de mobilidade e acessibilidade; assistente de orientação após validação |
| **Fase 4 — Expansão** | Parcerias (universidades, empresas, eventos); integrações institucionais e API se houver demanda comprovada; outras cidades após validar dados e metodologia localmente |

**Fora do escopo inicial**: garantia de segurança, previsão de crimes, lotação de ônibus sem fonte validada, monitoramento individual contínuo, replanejamento em tempo real sem integração confirmada.

## 10. Estatísticas utilizadas (Big Numbers — com contexto obrigatório)

| Indicador | Fonte | Amostra/período |
|---|---|---|
| 71% | Ipsos-Ipec / Rede Nossa São Paulo — qualidade de vida em SP (2026) | 700 internautas 16+, moradores da capital há 2+ anos; entrevistas em dez/2025 |
| 63% · 35% · 42% | Instituto Patrícia Galvão / Locomotiva — mulheres e mobilidade noturna (2025) | 1.200 mulheres 18–59 anos que saem à noite para lazer ≥2×/mês |

## 11. Estrutura da apresentação (slides) `[DECISÃO]`

Estilo: clean, direta, visual; identidade preto e laranja; uma mensagem principal por slide; pouco texto; números grandes.

Ordem: Abertura (pergunta de impacto) → Problema → Evidências (Big Numbers com fonte/amostra/período) → Público inicial (estudante noturno + persona validável) → Solução (proposta de valor + mockup) → Fontes de dados → Metodologia → Ética e responsabilidade → Concorrência → Modelo de negócio e roadmap.

## 12. Plano de validação

- **Usuários**: entrevistar estudantes noturnos; investigar como planejam hoje, apps usados, decisões tomadas, o que fazem desconhecendo o trajeto; descobrir se a preocupação afeta destino/horário/transporte/saída; testar protótipo de comparação e observar compreensão.
- **Potenciais clientes**: conversar com responsáveis por estudantil, segurança, mobilidade e inovação nas universidades; validar problema, orçamento, processo de compra, requisitos de privacidade e interesse em piloto.
- **Indicadores de sucesso do piloto**: completude/atualidade/cobertura das bases; compreensão de "exposição estimada" e "confiança dos dados"; utilidade percebida da comparação; intenção de uso recorrente e adesão ao planejamento ida-volta; interesse institucional e disposição a pagar.
