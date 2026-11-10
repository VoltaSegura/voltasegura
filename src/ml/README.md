# VoltaSegura — IA & Machine Learning

Estudo de ML sobre o problema do VoltaSegura, com **dados reais e públicos** (não simulados — requisito da disciplina).

> ⚠️ Em construção. Ciclo completo: dados → modelo (XGBoost, Random Forest, MLP, LSTM ou KMeans+PCA) → treino/avaliação (≥10 combinações de hiperparâmetros, validação cruzada só no treino) → conclusão para o cidadão. Ver [`docs/02_entregas_disciplinas.md`](../../docs/02_entregas_disciplinas.md).

## Estrutura exigida

- `notebook` executado nesta pasta;
- `dados/README.md` com fonte, link e período de cada conjunto de dados;
- `requirements.txt`;
- `RELATORIO_ML.md` (2–4 páginas).

## Candidatos a pergunta de ML `[HIPÓTESE]`

- Padrões de ocorrências por distrito/horário (SSP-SP, Infosiga SP, SP156, IBGE) para classificar nascentes de dados insuficientes vs. consistentes — **sem rótulos absolutos de segurança**.
