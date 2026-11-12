# Catálogo de rubricas e naturezas apuradas — SSP-SP 2026

Fonte: [SP Dados Criminais 2026 — SSP-SP](https://www.ssp.sp.gov.br/assets/estatistica/transparencia/spDados/SPDadosCriminais_2026.xlsx). Extração local em 10/11/2026.

- SHA256 do arquivo: `f627d84ea8d95ae9301180d92e267610176b00d58a3eed5f7b1a8cd4e65acbaf`.
- Linhas de dados lidas: **814.900** no estado e **330.690** no município de São Paulo (`NOME_MUNICIPIO = S.PAULO`).
- Abas: `JAN-JUN_2026` (555.404 linhas) e `JUL-DEZ_2026` (259.496 linhas).
- Meses estatísticos presentes: **1, 2, 3, 4, 5, 6, 7, 8, 9** de 2026. O nome da segunda aba não indica que outubro a dezembro já estejam publicados.
- `DATA_OCORRENCIA_BO` nas células de data vai de 2006-01-01 a 2026-10-01; esse campo não equivale ao mês estatístico.
- Valores distintos: **72 rubricas**, **23 naturezas apuradas** e **129 pares**.

As contagens abaixo são **linhas da planilha**, não taxas de criminalidade nem estimativas de exposição. Os valores foram preservados como publicados, com remoção apenas de espaços nas extremidades. `NULL` e `Pendente de Validação` são textos presentes em `RUBRICA`, não rótulos criados por esta análise. A base está sujeita a subnotificação e revisões da SSP-SP.

## Significado oficial dos campos

- `RUBRICA`: Natureza jurídica da ocorrência
- `NATUREZA_APURADA`: Classificação da natureza criminal verificada e validada pela equipe da SPDados, em conjunto com as Polícias Civil e Militar, mediante processo de análise e auditoria dos registros.

Os campos não são equivalentes: a mesma rubrica pode aparecer em mais de uma natureza apurada. Por exemplo, `Roubo (art. 157)` aparece inclusive com `FURTO - OUTROS` e `LATROCÍNIO`. O arquivo [ssp_2026_rubrica_natureza.csv](ssp_2026_rubrica_natureza.csv) contém **todos os pares**, com contagens por semestre no estado e na capital.

**[EM ABERTO]** O grupo ainda não definiu quais categorias entram na metodologia do VoltaSegura, nem os critérios de suficiência dos dados. Este catálogo não atribui pesos ou rótulos de segurança a trajetos ou territórios.

Arquivos para análise: [rubricas](ssp_2026_rubricas.csv), [naturezas apuradas](ssp_2026_naturezas_apuradas.csv) e [pares rubrica × natureza](ssp_2026_rubrica_natureza.csv). As tabelas CSV preservam também as contagens de cada semestre.

## Naturezas apuradas (23 valores)

| Valor literal na planilha | Estado de SP | Município de São Paulo |
|---|---:|---:|
| APREENSÃO DE ENTORPECENTES | 4.689 | 1.139 |
| ESTUPRO | 2.605 | 599 |
| ESTUPRO DE VULNERÁVEL | 8.893 | 1.861 |
| EXTORSÃO MEDIANTE SEQUESTRO | 74 | 30 |
| FURTO - OUTROS | 378.004 | 177.797 |
| FURTO DE CARGA | 323 | 94 |
| FURTO DE VEÍCULO | 60.608 | 27.785 |
| HOMICÍDIO CULPOSO OUTROS | 86 | 21 |
| HOMICÍDIO CULPOSO POR ACIDENTE DE TRÂNSITO | 2.826 | 432 |
| HOMICÍDIO DOLOSO | 1.655 | 326 |
| HOMICÍDIO DOLOSO POR ACIDENTE DE TRÂNSITO | 26 | 11 |
| LATROCÍNIO | 67 | 23 |
| LESÃO CORPORAL CULPOSA - OUTRAS | 2.403 | 584 |
| LESÃO CORPORAL CULPOSA POR ACIDENTE DE TRÂNSITO | 52.056 | 10.359 |
| LESÃO CORPORAL DOLOSA | 131.051 | 32.626 |
| LESÃO CORPORAL SEGUIDA DE MORTE | 73 | 21 |
| PORTE DE ARMA | 4.118 | 754 |
| PORTE DE ENTORPECENTES | 10.421 | 779 |
| ROUBO - OUTROS | 101.145 | 63.305 |
| ROUBO DE CARGA | 1.798 | 905 |
| ROUBO DE VEÍCULO | 12.706 | 5.108 |
| TENTATIVA DE HOMICÍDIO | 2.803 | 528 |
| TRÁFICO DE ENTORPECENTES | 36.470 | 5.603 |

## Rubricas (72 valores)

| Valor literal na planilha | Estado de SP | Município de São Paulo |
|---|---:|---:|
| Adulteração de sinal identificador de veículo automotor (art. 311) | 10 | 6 |
| Ameaça (art. 147) | 1 | 0 |
| Associação para o tráfico (Art.35,caput) | 3.118 | 389 |
| Atropelamento | 8 | 2 |
| Capotamento | 2 | 0 |
| Captura de procurado | 1 | 1 |
| Causas de aumento | 13 | 1 |
| Choque | 2 | 2 |
| Colisão | 5 | 0 |
| Comunicação de óbito | 134 | 49 |
| Contrabando (Art 334A ) | 1 | 1 |
| Corrupção ativa (art. 333) | 1 | 0 |
| Crime contra as relações de consumo (Art. 7º) | 1 | 0 |
| Crime contra registro de marca (Art. 190) | 1 | 1 |
| Cumprimento de mandado de busca e apreensão | 18 | 5 |
| Dano (art. 163) | 5 | 1 |
| Desacato (art. 331) | 3 | 0 |
| Desobediência (art. 330) | 2 | 0 |
| Destruição, subtração ou ocultação de cadáver (art. 211) | 1 | 0 |
| Disparo de arma de fogo (Art. 15) | 4 | 2 |
| Drogas para consumo pessoal sem autorização ou em desacordo (Art.28,caput) | 4.748 | 389 |
| Entrada ilegal de aparelho movél de comunicação em estabelecimento prisional | 7 | 1 |
| Entrega de objeto localizado/apreendido | 5 | 1 |
| Entrega de veículo localizado/apreendido | 5 | 2 |
| Entregar produtos cujos componentes possam causar dependência (Art. 243) | 1 | 0 |
| Estupro - Art. 213 | 2.614 | 600 |
| Estupro de vulneravel (art.217-A) | 8.884 | 1.860 |
| Extorsão (art. 158) | 1 | 0 |
| Extorsão mediante seqüestro (art. 159) | 74 | 30 |
| Fabricação de drogas (Art.34) | 6 | 1 |
| Fals/corr/adult/alt produtos terapêuticos/medicinais (art. 273) | 1 | 1 |
| Falsa identidade (art. 307) | 1 | 0 |
| Falsa identidade, usar, como próprio, documento de identidade alheia (art. 308) | 1 | 1 |
| Falsidade ideológica (art. 299) | 1 | 1 |
| Feminicídio | 605 | 158 |
| Financiar ou custear a prática dos crimes - arts.33, caput e §1º, e 34 (Art.36) | 3 | 0 |
| Fuga de pessoa presa ou submetida a medida de segurança (art. 351) | 1 | 0 |
| Furto (art. 155) | 438.556 | 205.478 |
| Furto de coisa comum (art. 156) | 189 | 38 |
| Homicídio (art. 121) | 3.945 | 717 |
| Homicídio culposo na direção de veículo automotor (Art. 302) | 2.676 | 385 |
| ilícito extrapenal (tema 506 STF) | 5.878 | 402 |
| Incêndio (art. 250, caput) | 1 | 0 |
| Injúria (art. 140) | 1 | 0 |
| Jogo de azar (art. 50) | 1 | 0 |
| L 9.503/97 - Código de Trânsito Brasileiro - Homicídio culposo na direção de veículo automotor (Art. 302 | 1 | 1 |
| Lesão corporal (art. 129) | 133.515 | 33.224 |
| Lesão corporal culposa na direção de veículo automotor (Art. 303) | 52.069 | 10.360 |
| Localização/Apreensão de objeto | 2.279 | 337 |
| Localização/Apreensão de veículo | 7 | 3 |
| Localização/Apreensão e Entrega de objeto | 19 | 3 |
| Localização/Apreensão e Entrega de veículo | 41 | 22 |
| Morte suspeita | 18 | 12 |
| NULL | 1 | 0 |
| Outras substâncias nocivas à saúde pública (art. 278, caput) | 1 | 1 |
| Outros não criminal | 33 | 4 |
| Outros não criminal - Irregularidades Funcionais | 1 | 0 |
| Pendente de Validação | 1 | 0 |
| Porte de arma (art. 19) | 689 | 55 |
| Porte ilegal de arma de fogo de uso permitido (Art. 14) | 1.374 | 216 |
| Posse irregular de arma de fogo de uso permitido (Art.12) | 5 | 2 |
| Posse ou porte ilegal de arma de fogo de uso restrito (Art. 16) | 2.080 | 497 |
| Receptação (art. 180) | 6 | 1 |
| Resistência (art. 329) | 7 | 1 |
| Roubo (art. 157) | 115.852 | 69.474 |
| Supressão de documento (art. 305) | 1 | 1 |
| tráfico drogas (Art.33, caput) | 35.357 | 5.949 |
| Uso de documento falso (art. 304) | 1 | 1 |
| Usura pecuniária ou real (Art. 4º) | 1 | 0 |
| Vicaricídio | 1 | 1 |
| Violação de domicílio (art. 150) | 1 | 0 |
| Violência Doméstica | 3 | 0 |
