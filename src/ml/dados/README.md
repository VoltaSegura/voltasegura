# Dados — disciplina IA & ML (documentação de fontes)

> Exigência da GS: pergunta de ML respondida com **dados reais e públicos**, documentando **fonte, link e período**. **Dados simulados NÃO são aceitos.** Evidências coletadas na 1ª auditoria de fontes de 10/11/2026 (`docs/04_dados_fontes.md` do monorepo).

## Fontes candidatas (auditar e baixar)

| Fonte | Link | Período sugerido | Licença | Status |
|---|---|---|---|---|
| SSP-SP — Dados mensais / Consultas | https://www.ssp.sp.gov.br/estatistica/dados-mensais · https://www.ssp.sp.gov.br/estatistica/consultas | Série 2023–2026 | CC-BY-4.0 (via CKAN `dadosabertos.sp.gov.br`) | ⚠️ baixar manualmente (site bloqueia crawlers) |
| Infosiga SP — sinistros com óbitos | https://infosiga.detran.sp.gov.br/ (Dados Abertos) · CKAN org DETRAN-SP | Histórico 2023–2025 | CC-BY-4.0 | ⚠️ baixar arquivo consolidado |
| GeoSampa — iluminação pública (**feature de contexto urbano**, não alvo do modelo) | WFS: `wfs.geosampa.prefeitura.sp.gov.br/geoserver/geoportal/wfs?…typeName=geoportal:iluminacao_publica&outputFormat=application/json` | carga vigente (última carga 21/10/2026) | acesso sem restrições (uso: licença a confirmar) | ✅ verificada ao vivo (662.945 pontos) |
| GTFS SPTrans (**feature de transporte**, não alvo do modelo) | https://www.sptrans.com.br/umbraco/Surface/PerfilDesenvolvedor/BaixarGTFS?memberName=sptrans | versão 09/11/2026 | redistribuição a validar | ✅ verificado (1.365 rotas: 1.349 ônibus + 9 Metrô + 7 CPTM; 22.273 paradas) |

## Pergunta de ML candidata `[HIPÓTESE — escolher e justificar]`

> Dado município/distrito e franja temporal (dia da semana + faixa de horário) da SSP-SP, treinar um modelo (XGBoost ou Random Forest) para **estimar a frequência relativa de ocorrências relevantes para o deslocamento noturno** por recorte territorial-temporal — e avaliar onde os **dados são insuficientes** para qualquer conclusão.

**Imperativos (documento vivo + guardrails)**:
- A saída **não pode** gerar rótulos "distrito seguro/perigoso" — comparativa, contextualizada, sempre com confiança dos dados (`docs/05_regras_linguagem_etica.md`).
- Zero registros ≠ seguro (subnotificação) — tratar explicitamente na seção de limitações do relatório.
- Requisitos da disciplina: ≥10 combinações de 3 hiperparâmetros, validação cruzada **só no treino**, métricas treino/teste lado a lado com gráficos, discussão de overfitting e conclusão do significado para o cidadão em `RELATORIO_ML.md`.

## Padrão de anotação de datasets baixados

Ao baixar qualquer arquivo para esta pasta, registrar aqui. **Arquivos brutos pesados vivem em `utils/` (fora do git)**; são versionados no git apenas esta tabela, os PDFs de documentação oficial (`documentacao/`) e o código do notebook.

### DOWNLOAD 2026-11-10 (.datas brutos em `utils/infosiga/` e `utils/ssp/`)

Fonte dos links: Infosiga = `https://infosiga.detran.sp.gov.br/` → Dados Abertos e Documentos; SSP-SP = `https://www.ssp.sp.gov.br/estatistica/consultas` + `.../dados-mensais`.

| Arquivo (`utils/`) | Fonte (recurso exato) | Conteúdo / granularidade | Período | Download | SHA256 (prefixo) |
|---|---|---|---|---|---|
| `infosiga/dados_infosiga.zip` (141 MB) | Infosiga → Dados Abertos | 9 CSVs: `sinistros_`/`pessoas_`/`veiculos_` × 3 recortes (2015–2021, 2022–2024, 2025–2026); separador `;` | **2015–2026** | 10/11/2026 | `009481bd…` |
| `infosiga/Infosiga_dicionario_dados.zip` (640 KB) | Infosiga → Dados Abertos | 3 dicionários v1.8 (sinistros, pessoas, veículos) | — | 10/11/2026 | `b8cb25c6…` |
| `infosiga/Infosiga_diagrama_ER.pdf` | Infosiga → Dados Abertos | Modelo relacional das 3 tabelas | — | 10/11/2026 | `78c313a1…` |
| `infosiga/Infosiga_fluxograma_consolidacao.pdf` | Infosiga → Dados Abertos | Fluxo de consolidação dos registros | — | 10/11/2026 | `bc8d2650…` |
| `ssp/SPDadosCriminais_2026.xlsx` (140 MB) | SSP-SP → Consultas ("base criminal e produtividade") | **Registros individuais de BO** (555.405 linhas/semestre × 30 colunas): `NOME_MUNICIPIO`, `BAIRRO`, `LOGRADOURO`, `LATITUDE`, `LONGITUDE`, `RUBRICA`, `NATUREZA_APURADA`, `HORA_OCORRENCIA_BO`, `DESCR_TIPOLOCAL`, `COD IBGE`; abas "Campos da Tabela_SPDADOS", `JAN-JUN_2026`, `JUL-DEZ_2026` | **jan–dez 2026** | 10/11/2026 | `f627d84e…` |
| `ssp/DadosProdutividade_2026.xlsx` (130 MB) | SSP-SP → Consultas | Produtividade policial (presos/apreendidos + demais abas), 63 campos | 2026 | 10/11/2026 | `7ee7e5b4…` |
| `ssp/VeiculosSubtraidos_2026.xlsx` (45 MB) | SSP-SP → Consultas | Roubo/furto de veículos (abas: metodologia, dicionário, dados) | 2026 | 10/11/2026 | `b3832e93…` |
| `ssp/CelularesSubtraidos_2026.xlsx` (73 MB) | SSP-SP → Consultas | Roubo/furto de celulares | 2026 | 10/11/2026 | `078426f0…` |
| `ssp/ObjetosSubtraidos_2026.xlsx` (336 MB) | SSP-SP → Consultas | Roubo/furto de objetos | 2026 | 10/11/2026 | `d344ed8f…` |
| `ssp/OcorrenciaMensal(Criminal)-EstadoSP_20261110_045415.xlsx` | SSP-SP → Dados Mensais | Consolidado mensal por natureza (homicídios, …), métrica por município/estado | 2026 (até nov) | 10/11/2026 | `23a0290d…` |
| `ssp/OcorrenciaAnual-EstadoSP_20261110_045422.xlsx` | SSP-SP → Dados | Consolidado anual por natureza | histórico | 10/11/2026 | `c85d455d…` |
| `ssp/TaxaDelito-São Paulo_20261110_045505.xlsx` | SSP-SP → Dados | Taxas de delito (município SP), 2022–2025 | 2022–2025 | 10/11/2026 | `26affa4b…` |
| `ssp/TaxaDelito-EstadoSP_20261110_045444.xlsx` | SSP-SP → Dados | Taxas de delito (estado), 2022–2025 | 2022–2025 | 10/11/2026 | `a9c9861a…` |
| `ssp/taxa_homicidio.PNG` | SSP-SP → notícias/painel | Captura de taxa de homicídio (referência visual) | — | 10/11/2026 | `09e07b33…` |

**Implicações diretas para a pergunta de ML** (`docs/04 §1 e §4`):
- **SSP-SP tem granularidade de registro individual** (BO com bairro + lat/lon + rubrica + hora) — mais do que a granularidade por distrito que o painel não mostrava; a rubrica permite recortar os crimes de contato com a vítima (roubo/furto) relevantes ao deslocamento noturno.
- **Infosiga `sinistros` traz `logradouro` + `latitude` + `longitude` + `hora` + `dia_da_semana` + `turno`** — recorte espacial e temporal explícito.
- `qtd_pedestre`, `qtd_bicicleta`, `qtd_motocicleta`, `qtd_automovel`… nos sinistros → modo de deslocamento da vítima (exposição multimodal real).

*Ver também: `documentacao/infosiga/` (dicionários v1.8, diagrama ER, fluxograma versionados no git).*
