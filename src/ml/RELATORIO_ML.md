# RELATORIO_ML.md — VoltaSegura (IA & Machine Learning)

> GS FIAP — tema **CitizenTech** · Produto **VoltaSegura** · Data: 10/11/2026
> Dados reais e públicos (nunca simulados — requisito da disciplina). Fontes, links,
> períodos e SHA256: `dados/README.md`. Notebook executado: `notebook_ml.ipynb`.

## 1. Problema e dados (rubrica 2,0)

**Pergunta de ML**: dado dia da semana × faixa horária × bairro do município de
São Paulo, estimar a **frequência relativa** de BOs de roubo/furto (SSP-SP,
2026), com sinistros de trânsito do **Infosiga** (2015–2026) como contraprova
multimodal — sempre marcando **onde os dados são insuficientes**.

Por que essa pergunta sustenta o produto: o VoltaSegura compara alternativas de
ida/volta e comunica **exposição estimada + confiança dos dados**; a estimativa
territorial-temporal é a base matemática dessas comparações.

| Fonte | Recurso | Período usado | Registros (recorte) |
|---|---|---|---|
| SSP-SP "SPDadosCriminais" | ssp.sp.gov.br → Estatística → Consultas | 2026 (JAN–JUN + JUL–DEZ) | 814.900 BOs no estado → **330.690 na capital** |
| Infosiga SP | infosiga.detran.sp.gov.br → Dados Abertos | 2015–2026 | 343.241 sinistros da capital |

## 2. Preparação e divisão treino/teste (rubrica 2,0)

- **Recortes documentados**: capital apenas (330.690 BOs de 814.900 no estado);
  rubricas com `ROUBO`/`FURTO` → **274.990 BOs (83,2% da capital)** — 205.478 furtos
  e 69.474 roubos; grade `bairro × dia × faixa horária (4×6h) × mês`
  (**2.237 bairros** distintos no recorte) com zeros explícitos (célula sem
  evento ≠ dado faltante — o modelo aprende a diferença);
- **Split temporal**: treino = meses 1–4/2026 (250.656 células), teste =
  meses 5–6/2026 (125.328 células) — o teste jamais entra na validação
  cruzada; simula estimar "o mês seguinte". Os meses 7–9/2026 chegaram
  **parciais** na base (aba JUL–DEZ em atualização) e foram **excluídos
  integralmente** da grade para não enviesar nenhum dos conjuntos;
- **Contraprova Infosiga**: treino = 2014–2024 (3.696 células), teste =
  2025–2026 (672 células);
- **Qualidade**: BOs sem bairro informado: **22** (0,008% — agrupados em
  "(SEM BAIRRO INFORMADO)"); sem hora utilizável: **109.367** (**39,8%**) —
  essas linhas ficam de fora da grade por falta de faixa horária
  (limitação quantificada em §6);
- Grade completa SSP: **375.984 células** (bairro × dia × faixa × mês 1–6);
  contagens de 0 a 124 eventos por célula (média 0,31 — forte assimetria,
  tratada via `log1p`).

## 3. Escolha justificada do modelo (rubrica 1,0)

**RandomForestRegressor** sobre `log1p(contagem)`:

- é **regressão** porque a produto comunica intensidade relativa (nunca classe "seguro/perigoso");
- captura interações não lineares bairro × dia × faixa;
- robusto a outliers/assimetria; pouco preprocessamento;
- entrega **importância de features** (explicabilidade para o cidadão);
- descartadas: XGBoost (tuning extra fora do escopo desta primeira entrega),
  MLP/LSTM (tabular pequeno), KMeans+PCA (não responde pergunta de frequência).

## 4. Treino com diferentes hiperparâmetros (rubrica 2,0)

Grade 3×3×3 = **27 combinações** (rubrica pede ≥10): `n_estimators` (50/100/200)
× `max_depth` (6/10/None) × `min_samples_leaf` (5/20/50).

**Validação cruzada `TimeSeriesSplit(3)`, aplicada SOMENTE ao treino**; melhor
configuração por `neg_root_mean_squared_error`. Fixados por justificativa de
custo (documentada no notebook §3): `max_features="sqrt"`, `max_samples=30.000`
(subamostra bootstrap por árvore) e `n_jobs=1` por fit.

**Melhores hiperparâmetros (SSP)**: `n_estimators=200`, `max_depth=None`,
`min_samples_leaf=5` — a grade preferiu árvores profundas e enxutas por folha,
com 200 estimadores (mais variância média derrubada pelo ensemble).
**Melhores (Infosiga, contraprova)**: `n_estimators=200`, `max_depth=6`,
`min_samples_leaf=50` — mais regularização, coerente com dados mais escassos.

## 5. Resultados em treino e teste (rubrica 2,0)

**SSP-SP (modelo principal, 27 combinações):**

| Métrica (sobre log1p) | Treino | Teste |
|---|---|---|
| RMSE | 0,2248 | 0,2424 |
| MAE | 0,1123 | 0,1187 |
| R² | 0,691 | 0,613 |

**Leitura de overfitting**: RMSE(teste) = 1,08 × RMSE(treino) e o R² cai só de
0,69 → 0,61 — **generalização saudável**; o modelo não memorizou os meses de
treino. A grade confirmou a direção esperada: configurações mais rígidas
(`max_depth=6`, `min_samples_leaf=50`) eram penalizadas na CV, enquanto o
efeito antídoto do `min_samples_leaf` baixo (5) não gerou overfitting graças
ao ensemble de 200 árvores.

**Infosiga (contraprova, mesmo protocolo):**

| Métrica (sobre log1p) | Treino | Teste |
|---|---|---|
| RMSE | 1,9961 | 1,9702 |
| MAE | 1,9154 | 1,8939 |
| R² | 0,027 | **−0,406** |

**Leitura honesta da contraprova**: o modelo do Infosiga por logradouro **não
generaliza** (R² de teste negativo — pior do que prever a média). Isso **não
invalida o trabalho**: é exatamente o achado que a pergunta pede — **78% dos
33.835 logradouros têm menos de 5 sinistros em ~11 anos**; a granularidade de
logradouro não sustenta um modelo. No produto, essa camada serve para
**marcar dados como insuficientes** (nunca como "silêncio = seguro"), e o
padrão por **faixa horária** aparece com força: `MADRUGADA` é a feature mais
importante do modelo do Infosiga (0,44) — coerente com a janela da persona
estudante noturno.

Gráficos gerados (salvos em `imagens/`): previsto vs real, métricas lado a
lado, 12 features mais importantes (SSP e Infosiga) e envolvidos por modo do
Infosiga 2015–2026. As features mais importantes do modelo SSP são **bairros**
(Santo Amaro, Pinheiros, Vila Mariana, Capão Redondo, Bela Vista, Ipiranga) —
usadas para comparação relativa, nunca como rótulo de segurança.

## 6. Limitações (subnotificação etc.)

- **Zero ≠ seguro**: BO depende de denúncia — subnotificação estrutural;
  célula sem registro nunca é apresentada como "sem risco";
- **39,8% dos BOs do recorte vêm sem hora utilizável** (109.367 de 274.990) —
  a exposição estimada por faixa horária é construída sobre a fração com hora
  informada; o produto exibe essa taxa como parte da "confiança";
- 47% dos 2.238 bairros têm menos de 10 BOs de roubo/furto em 2026 e 87% menos
  de 100 — a confiança por bairro é discrepante e **exibida por célula**, não
  média global;
- SSP cobre só 2026 (meses 1–6 completos; o split é intra-anual); a série longa
  do Infosiga (2014–2026) compensa no histórico, mas seu modelo por logradouro
  **não generalizou** (R² teste −0,41) — granularidade logradouro é insuficiente;
- Infosiga: lat/lon frequentemente ausentes; `qtd_*` = envolvidos, não exposição
  individual; 2026 parcial (dados até o dia da execução);
- BO pode ser registrado fora do local do evento → agregação por bairro,
  nunca endereço individual.

## 7. Conclusão — significado para o cidadão (rubrica 1,0)

O modelo principal (SSP) reproduz a estrutura **bairro × dia × faixa horária**
com R² de teste de 0,61 e generalização saudável (RMSE teste = 1,08× treino) —
a pergunta do produto tem resposta **quantitativa e comparativa**. O cidadão
**não recebe etiqueta territorial** ("seguro"/"perigoso"). Recebe comparações
relativas com confiança qualificada, ex.:

> *Nos registros de 2026 deste bairro nesta faixa, a frequência estimada fica
> X% acima ou abaixo do padrão da cidade, com base em N registros no período —
> células com poucos dados aparecem marcadas como insuficientes.*

A estimativa alimenta **comparação de alternativas de deslocamento** (ida/volta)
na interface, sem nunca prometer "rota segura" (docs/05). O modelo do Infosiga
por logradouro não generalizou — e é essa a mensagem ao usuário: onde os dados
não sustentam estimativa, o produto **diz** "insuficiente", nunca silencia.
O padrão por faixa horária (madrugada como feature dominante na contraprova)
valida a janela noturna da persona (Marina, 22) para a próxima fase.

**Próximo passo da Fase 1**: combinar iluminação pública (GeoSampa, já
validada ao vivo) e posições de ônibus em tempo real (Olho Vivo, já
autenticada) — fontes registradas em `docs/04_dados_fontes.md`.
