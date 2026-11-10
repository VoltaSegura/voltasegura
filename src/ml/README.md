# VoltaSegura — IA & Machine Learning

Estudo de ML sobre o problema do VoltaSegura, com **dados reais e públicos** (não simulados — requisito da disciplina).

## Entrega

- `notebook_ml.ipynb` — notebook **executado** (saídas e gráficos inclusos); gera figuras em `imagens/`;
- `etl.py` — carga/consolidação das fontes reais com cache de parquet (`dados/cache/`, fora do git, regenerável);
- `dados/README.md` — fonte, link, período e SHA256 de cada conjunto de dados;
- `requirements.txt`;
- `RELATORIO_ML.md` — relatório (2–4 páginas) com métricas treino/teste, overfitting, limitações e conclusão para o cidadão.

## Resultado em uma linha `[HIPÓTESE validada nos dados de 2026]`

RandomForestRegressor sobre `log1p(contagem)` (grade de 27 combinações, CV só no treino): **R² teste 0,61, RMSE teste 1,08× treino** na base da SSP-SP; a contraprova por logradouro do Infosiga **não generaliza** (R² −0,41) → a marcação de "dados insuficientes" é parte da resposta, nunca silêncio.

## Como executar

```bash
# brutos conforme dados/README.md; a partir da raiz do repo:
uv run --with pandas,openpyxl,pyarrow,scikit-learn,scipy,matplotlib,nbclient,nbformat,ipykernel \
  jupyter execute --inplace src/ml/notebook_ml.ipynb
```

## Pergunta de ML

> Dado um dia da semana, uma faixa horária e um bairro da capital, qual é a frequência esperada (relativa) de BOs de roubo/furto — com o Infosiga como contraprova multimodal — e onde os dados são insuficientes para qualquer conclusão?

**Guardrails** (docs/05): nunca "rota segura"/"área perigosa"; **exposição estimada** + confiança dos dados; zero registros ≠ seguro (subnotificação). Ver [`docs/02_entregas_disciplinas.md`](../../docs/02_entregas_disciplinas.md).
