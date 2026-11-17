# Importador SSP-SP → CSVs de carga (B-07)

Lê a planilha pública `SPDadosCriminais_2026.xlsx` da SSP-SP (licença CC-BY 4.0) e gera CSVs prontos para carga no Postgres/PostGIS (Neon) do VoltaSegura, com relatório de cobertura. **Não conecta em banco**: só grava arquivos.

> `[EM ABERTO]` **A carga no Neon ainda não foi feita.** O método (`psql \copy`, `COPY FROM STDIN` por um cliente, painel do Neon ou outro) não está definido: nesta máquina não há `psql` nem `psycopg`. O esquema SQL de destino é tarefa de outro worker (B-06, `scripts/sql/`); este importador apenas respeita o contrato de colunas abaixo.

## Como rodar

Requisitos: Python 3.12 e `openpyxl` (3.1.5 testado). Só biblioteca padrão além disso.

```bash
# Testes (planilha SINTÉTICA gerada na hora; nenhum dado real)
python -m unittest discover -s src/mobile-app/scripts/ssp -p "test_*.py" -v

# Teste rápido com as primeiras 50 mil linhas
python src/mobile-app/scripts/ssp/importar_ssp.py --xlsx <caminho>/SPDadosCriminais_2026.xlsx \
  --saida src/mobile-app/scripts/ssp/saida --limite 50000

# Execução completa (padrões: 2026-01-01 a 2026-09-30, IBGE 3550308)
python src/mobile-app/scripts/ssp/importar_ssp.py --xlsx <caminho>/SPDadosCriminais_2026.xlsx \
  --saida src/mobile-app/scripts/ssp/saida \
  --periodo-inicio 2026-01-01 --periodo-fim 2026-09-30 --ibge 3550308
```

- A planilha é aberta só para leitura (`load_workbook(read_only=True, data_only=True)`), em streaming; o arquivo nunca é copiado nem alterado. O SHA256 é calculado em blocos de 1 MiB.
- O terminal mostra apenas contagens agregadas, progresso a cada 100 mil linhas e os caminhos dos arquivos. Nunca mostra linhas, coordenadas ou números de boletim.
- Erro de esquema (coluna obrigatória ausente, nenhuma aba de dados) encerra com código 2 e mensagem que nomeia a aba e as colunas faltantes. Nesse caso nenhum `ssp_bo.csv` é deixado (o arquivo é gravado como `.parcial` e só renomeado no fim).
- `--limite N` marca o relatório como execução de teste: **não use essa saída para carga**.
- A pasta `saida/` e qualquer `*.csv`, `importacao.json`, `relatorio.md` ou `*.xlsx` desta pasta são ignorados pelo git (`.gitignore` local). Nada gerado a partir da planilha real deve ser versionado.

## Contrato das saídas

Todos em UTF-8 **sem BOM**, separador vírgula, aspas do módulo `csv` (`QUOTE_MINIMAL`), fim de linha `\n`, cabeçalho na primeira linha. **Campo vazio = NULL.**

| Arquivo | Colunas (exatas, nesta ordem) | Conteúdo |
|---|---|---|
| `ssp_bo.csv` | `chave_bo,natureza,data_ocorrencia,faixa,lat,lon,circunscricao,tipo_local` | Uma linha por (boletim, natureza) das 8 naturezas de linha. `data_ocorrencia` = `AAAA-MM-DD`; `faixa` ∈ `MADRUGADA`, `MANHA`, `TARDE`, `NOITE` ou vazio; `lat`/`lon` em graus decimais WGS84 como publicados, ou ambos vazios; `circunscricao` = `NOME_DELEGACIA_CIRCUNSCRICAO`; `tipo_local` = `DESCR_TIPOLOCAL`. Chave única: `(chave_bo, natureza)`. |
| `ssp_cobertura.csv` | `circunscricao,elegiveis_total,elegiveis_coord_faixa` | Por circunscrição, boletins **distintos** de `FURTO - OUTROS` ou `ROUBO - OUTROS` no período (denominador) e os que têm coordenada válida **e** faixa (numerador). Ordenado por nome. Uma circunscrição vazia (se existir) sai com nome vazio. |
| `ssp_panorama.csv` | `natureza,total` | Boletins distintos no município e no período das 4 naturezas de panorama. Sempre 4 linhas, na ordem do docs/07. |
| `importacao.json` | `fonte, arquivo_sha256, periodo_inicio, periodo_fim, linhas_lidas, linhas_validas, gerado_em` | `fonte` = `SSP-SP SPDadosCriminais_2026`; `gerado_em` em ISO 8601 com fuso. `linhas_lidas` = linhas de dados lidas nas abas de dados (sem o cabeçalho). `linhas_validas` = linhas que passaram em município, natureza, data e chave, **antes** da deduplicação e **incluindo** as do panorama. |
| `relatorio.md` | — | Contagens por aba e por natureza, formato do COD IBGE, descartes por motivo, duplicatas, divergências, origem da faixa, situação das coordenadas e cobertura por circunscrição. |

`[DECISÃO]` Minimização (LGPD, `docs/05`): os CSVs não levam `NUM_BO`, `LOGRADOURO`, `NUMERO_LOGRADOURO`, `BAIRRO`, `RUBRICA`, `DESCR_CONDUTA`, nome de pessoa ou qualquer coluna além das listadas. As naturezas de panorama nunca viram linha com coordenada ou data (`docs/07`). Os testes verificam que nenhum número de BO, logradouro ou bairro sintético aparece nas saídas ou no terminal.

## Regras aplicadas

| Regra | Status | Origem / observação |
|---|---|---|
| Abas de dados = todas cujo nome não começa com `Campos`; na planilha 2026, `JAN-JUN_2026` e `JUL-DEZ_2026`. A aba `Campos da Tabela_SPDADOS` é documentação e é ignorada. | `[DECISÃO]` | `docs/dados-reais/03_exposicao_neon.md` §4 |
| Colunas localizadas pelo **nome** do cabeçalho (espaços normalizados, maiúsculas); faltando alguma das 16 obrigatórias, a importação para. | `[DECISÃO]` | §4 do doc 03 |
| O texto literal `NULL` é tratado como vazio, assim como célula vazia. | `[DECISÃO]` | Nota da aba `Campos da Tabela_SPDADOS`: "Resultado Null indica que o campo se encontrava vazio". |
| Município: `COD IBGE` comparado com `--ibge` (padrão `3550308`). Na planilha 2026 a coluna vem como **número inteiro de 7 dígitos** (`3550308`, com dígito verificador). O código aceita também texto e a forma de 6 dígitos (`355030`), comparada com os 6 primeiros dígitos. O relatório lista os formatos encontrados. | `[DECISÃO]` (filtro por IBGE) / `[HIPÓTESE]` (aceitar 6 dígitos) | `NOME_MUNICIPIO` vem abreviado (`S.PAULO`), por isso não é usado no filtro. |
| Naturezas: comparação **literal** de `NATUREZA_APURADA` após normalizar espaços (pontas e espaços repetidos), sem mudar maiúsculas/acentos e sem aproximação textual. Linhas: `FURTO - OUTROS`, `FURTO DE CARGA`, `FURTO DE VEÍCULO`, `ROUBO - OUTROS`, `ROUBO DE CARGA`, `ROUBO DE VEÍCULO`, `LATROCÍNIO`, `LESÃO CORPORAL CULPOSA POR ACIDENTE DE TRÂNSITO`. Só panorama: `HOMICÍDIO DOLOSO`, `TENTATIVA DE HOMICÍDIO`, `ESTUPRO`, `ESTUPRO DE VULNERÁVEL`. | `[DECISÃO]` | `docs/07` |
| Data pela `DATA_OCORRENCIA_BO` (não pelo mês estatístico), dentro de `[periodo-inicio, periodo-fim]`, extremos incluídos; fora = descarte com motivo. Padrão jan–set/2026. | `[DECISÃO]` | `docs/08` §1 |
| Faixa: hora do BO quando válida (madrugada 0–5, manhã 6–11, tarde 12–17, noite 18–23); senão `DESC_PERIODO`. | `[DECISÃO]` | `docs/08` §1 |
| Mapeamento de `DESC_PERIODO` (textos reais da planilha 2026): `De madrugada` → `MADRUGADA`; `Pela manhã` → `MANHA`; `A tarde` → `TARDE`; `A noite` → `NOITE`; `Em hora incerta`, `NULL` ou vazio → sem faixa. Texto não reconhecido → sem faixa, contado à parte no relatório. | `[DECISÃO]` (faixa) / `[HIPÓTESE]` (lista fechada de textos, conferida só na planilha 2026) | Valores `MADRUGADA`/`MANHA`/`TARDE`/`NOITE` iguais ao tipo `FaixaDoDia` do app (`src/services/otp2.ts`). |
| Hora: aceita `time`, `datetime`, `timedelta` < 24 h e texto `HH:MM[:SS]`. Na planilha 2026, quando não há hora, a célula traz o texto `NULL`. Quando há hora e `DESC_PERIODO`, vale a hora; as divergências entre as duas são contadas no relatório. | `[DECISÃO]` | `docs/08` §1 |
| Coordenada usada **como publicada**, sem correção. Fica vazia (lat e lon) se ausente (`NULL`, `-`, vazio), não numérica, zero ou fora do retângulo amplo lat −24,10 a −23,30 e lon −46,90 a −46,30. Coordenada vazia fica fora da conta espacial e **dentro** do denominador de cobertura. | `[DECISÃO]` (usar como publicada) / `[HIPÓTESE]` (limites do retângulo) | `docs/08` (coordenadas). A planilha 2026 tem inteiros como `-235091`, aparentemente sem o ponto decimal: **não são corrigidos** e caem como "fora do retângulo". |
| `chave_bo` = SHA256 (hex minúsculo) de `NUM_BO|ANO_BO|NOME_DELEGACIA`, cada parte normalizada: espaços das pontas removidos, espaços internos colapsados em um, maiúsculas; números viram o texto do inteiro (`2026.0` → `2026`); zeros à esquerda de texto são preservados. Linha sem alguma das três partes é descartada (`chave_bo_incompleta`). | `[DECISÃO]` (componentes da chave) / `[HIPÓTESE]` (normalização) | `docs/08` (unidade = boletim distinto) |
| Deduplicação por `(chave_bo, natureza)`: mantém a primeira linha lida; as repetidas são contadas, e as repetidas com algum valor diferente são contadas à parte. | `[HIPÓTESE]` | Não há regra no docs para escolher entre repetições da mesma natureza. |
| Naturezas diferentes do mesmo BO: cada uma mantém seus valores (nada é escolhido); o relatório conta BOs com coordenada, faixa, data ou circunscrição divergentes. Para `N`, o consumidor deve usar `COUNT(DISTINCT chave_bo)`. | `[DECISÃO]` | §4 do doc 03 |
| Cobertura por `NOME_DELEGACIA_CIRCUNSCRICAO`, boletins distintos de `FURTO - OUTROS`/`ROUBO - OUTROS`. Se um BO tiver as duas naturezas, conta uma vez; entra no numerador se **ao menos uma** de suas linhas elegíveis tiver coordenada válida e faixa (o relatório conta quantos casos dependem disso). Média = média simples entre circunscrições. | `[DECISÃO]` (unidade e recorte) / `[HIPÓTESE]` (regra "ao menos uma" e média simples) | `docs/08` (cobertura mínima) |
| Panorama: boletins distintos por natureza. Natureza sem nenhum registro no período sai com `total = 0`, para distinguir "importado sem registro" de "não importado". Zero registro não significa ausência de ocorrência. | `[HIPÓTESE]` | `docs/07` (panorama municipal) |
| Todos os tipos de local entram (`tipo_local` vai no CSV para transparência). | `[DECISÃO]` | `docs/08` |

## Execução de referência (15/11/2026, só agregados)

Planilha `SPDadosCriminais_2026.xlsx`, SHA256 `f627d84ea8d95ae9301180d92e267610176b00d58a3eed5f7b1a8cd4e65acbaf`, período 2026-01-01 a 2026-09-30, cerca de 3,6 min. Saída em `saida/` (não versionada). Serve para conferir a carga (B-15): as contagens no banco devem bater com estas.

- 814.900 linhas lidas; 281.966 válidas; 279.048 linhas em `ssp_bo.csv`; 0 duplicatas; 95 boletins com mais de uma natureza, nenhum com coordenada, faixa, data ou circunscrição divergente.
- Cobertura: 94 circunscrições, média 90,8%, mínimo 78,1% (65º D.P. Artur Alvim), 1 com cobertura abaixo de 80%.
- Diferença em relação ao `docs/08` (média 90,6%, mínimo 77,6%): a auditoria anterior não filtrava pela data da ocorrência. Rodando o importador sem filtro de data, os números do `docs/08` são reproduzidos exatamente. As 6.990 linhas com ocorrência fora de jan–set/2026 têm cobertura menor.

## Pontos em aberto

- `[EM ABERTO]` **Carga no Neon**: método, branch (`dev` antes de `production`), transação/staging e troca do `importacao_id` ativo (doc 03 §4, passo 5). Nada foi carregado.
- `[EM ABERTO]` **Pseudonimização da chave**: SHA256 sem segredo de `NUM_BO|ANO_BO|NOME_DELEGACIA` é estável entre cargas, mas **não é anonimização**. O espaço de números de BO é pequeno, então quem tiver a lista de delegacias pode recalcular a chave por força bruta e recuperar o `NUM_BO`. Alternativa a decidir com o grupo: HMAC-SHA256 com segredo guardado fora do repositório (perde a reprodutibilidade sem o segredo). Até lá, `ssp_bo` não deve ser exposto fora do banco (o app só recebe agregados, `docs/08`).
- `[EM ABERTO]` Vínculo entre trecho a pé e circunscrição: o nome no BO não basta; é preciso geometria das circunscrições (doc 03 §4).
- `[EM ABERTO]` Completar 12 meses com `SPDadosCriminais_2025` (`docs/08` §1).
- `[HIPÓTESE]` Os textos de `DESC_PERIODO`, o formato do `COD IBGE` e os formatos de hora/coordenada foram conferidos só na planilha 2026. Uma nova planilha deve ser auditada (o relatório mostra formatos de IBGE e textos de período não reconhecidos).
