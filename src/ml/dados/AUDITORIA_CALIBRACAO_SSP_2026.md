---
titulo: Auditoria SSP-SP 2026 para calibrar a comparação de trajetos
projeto: VoltaSegura
atualizado: 2026-11-11
tipo: evidencia-dados
fonte: "SPDadosCriminais_2026.xlsx (SHA256 f627d84e…, meses estatísticos jan–set/2026), registro em src/ml/dados/README.md"
script: "python src/ml/auditar_calibracao_ssp.py utils/ssp/SPDadosCriminais_2026.xlsx"
---

# Auditoria SSP-SP 2026 para a calibração (`docs/08`)

> Evidência descritiva para as decisões de calibração pendentes em `docs/06` §3. **Não define parâmetros** — cada um depende de decisão do grupo — e não valida a metodologia. Recorte: município de São Paulo (`NOME_MUNICIPIO = S.PAULO`), `NATUREZA_APURADA` ∈ {`FURTO - OUTROS`, `ROUBO - OUTROS`}: **241.102 linhas** (177.797 furtos, 63.305 roubos).

## 1. Unidade de registro e deduplicação

- A chave `NUM_BO` + `ANO_BO` + `NOME_DELEGACIA` identifica **241.060** boletins; a chave sem a delegacia dá o mesmo número.
- **42 boletins** aparecem em duas linhas: uma `FURTO - OUTROS` e outra `ROUBO - OUTROS`, sempre com a mesma coordenada e a mesma hora. Contar linhas contaria esses fatos duas vezes.
- Não há linhas inteiramente idênticas.
- Consequência para `N`: contar **boletins distintos** pela chave acima. Um BO pode envolver mais de uma vítima ou fato; a base não permite contar vítimas.

## 2. Coordenadas

| Medida | Valor |
|---|---:|
| Com coordenada válida no município | 90,90% |
| Boletins de delegacia eletrônica (registro pela internet) | 82,45% |
| Latitude com ≤ 4 casas decimais | 1,34% |
| Registros em pontos repetidos ≥ 10 vezes | 29,41% (2.804 pontos) |
| Registros em pontos repetidos ≥ 100 vezes | 4,14% (53 pontos) |

- Os pontos mais repetidos são praças e terminais: Praça da Luz (698), entorno do Terminal Barra Funda (Av. Auro Soares de Moura Andrade, R. Bento Teobaldo Ferraz, R. da Várzea), Av. Prestes Maia, Praça da Sé e Rua do Arouche. Isso sugere **geocodificação para um ponto de referência** do logradouro ou da praça, e não o local exato do fato.
- Na exploração, os registros com coordenada e hora utilizáveis somaram 71% fora da delegacia eletrônica e 51% nela. A falta de dados **não é aleatória**: depende do canal de registro.
- Consequência: o corredor precisa absorver o deslocamento até esses pontos de referência, e 9,1% dos registros não podem entrar em nenhuma conta espacial.

## 3. Tipo de local (`DESCR_TIPOLOCAL`)

| Tipo | Participação |
|---|---:|
| Via Pública | 85,96% |
| Terminal/Estação | 4,67% |
| Outros | 2,92% |
| Residência | 1,70% |
| Comércio e Serviços | 1,17% |
| Demais tipos (estacionamento, restaurante, shopping, condomínio, banco, lazer…) | < 0,4% cada |

Dentro de "Via Pública", 98,3% tem subtipo também "Via Pública". O subtipo não ajuda a distinguir pedestres de ocupantes de veículos.

## 4. Hora e período

- Hora utilizável em **58,26%**: 51,3% dos furtos e 77,7% dos roubos.
- `DESC_PERIODO` cobre quase todos os que não têm hora. Somando os dois, **99,14%** dos registros têm faixa do dia.
- Nas 16.077 linhas com hora e período, a correspondência é exata e sem conflito: madrugada 0–5h, manhã 6–11h, tarde 12–17h, noite 18–23h.
- Isso corrige a leitura de que ~40% dos registros não teriam horário: o estudo de ML usou apenas a hora.
- **31,59%** das horas utilizáveis são horas cheias (minuto 00). Há arredondamento declarado pela vítima, o que torna frágeis recortes horários mais finos que o período.

## 5. Datas

- 97,58% das ocorrências são de 2026 (jan–set). Restam registros tardios de 2025 e alguns de anos anteriores.
- O atraso entre ocorrência e registro tem mediana de 1 dia; p90 = 8 dias; p99 = 132 dias.
- Setembro tem menos ocorrências (22.073) que os meses anteriores (24.804–28.550), o que é compatível com registros ainda não feitos. O mês mais recente da base fica **incompleto**.
- Período máximo disponível nesta base: **9 meses**. Uma janela maior exigiria baixar o arquivo de 2025 da SSP (não auditado).

## 6. Quantos registros noturnos um trecho de 1 km captaria

Aproximação: grade de 50 m, janelas retas de 1 km (horizontais e verticais), registros noturnos (hora 18–23h ou período "A noite"), 9 meses, todos os tipos de local, restrita a áreas com algum registro.

| Corredor (meia-largura) | p10 | p25 | mediana | p75 | p90 | `N = 0` | `N < 5` |
|---|---:|---:|---:|---:|---:|---:|---:|
| ±50 m | 0 | 1 | 3 | 7 | 15 | 13,5% | 61,0% |
| ±100 m | 1 | 3 | 7 | 13 | 27 | 8,9% | 38,1% |
| ±150 m | 1 | 4 | 10 | 19 | 39 | 7,9% | 28,4% |
| ±250 m | 1 | 6 | 16 | 31 | 61 | 7,3% | 22,5% |

- Os valores são pequenos. Com contagens dessa ordem, a variação casual (da ordem de √N) é comparável às diferenças entre rotas. Isso reforça a regra de `docs/08`: só apontar alternativa com folga suficiente e retornar "dados insuficientes" quando não houver.
- **Limitações**: janelas retas não são trajetos reais; "áreas com algum registro" é só uma aproximação da área urbana; não há filtro por tipo de local; os números servem para dimensionar ordens de grandeza, não para fixar limiares.

## 6.1 Cobertura por circunscrição de delegacia

Fração dos boletins elegíveis com coordenada válida e período informado, por `NOME_DELEGACIA_CIRCUNSCRICAO` (94 circunscrições com ≥ 100 boletins): média **90,6%**, mínimo 77,6% (65º DP Artur Alvim), quartis 88,9% / 90,9% / 92,5%, máximo 97,9%. Só uma circunscrição fica abaixo de 80%.

## 7. O que esta auditoria não responde

- A precisão espacial real (distância entre o ponto e o local do fato) não pode ser medida só com esta base.
- Não há como identificar se a vítima estava caminhando: "Via Pública" inclui ocupantes de veículos.
- A estabilidade da ordem entre rotas reais só pode ser testada com trajetos reais calculados pelo roteamento, que ainda está em aberto.
