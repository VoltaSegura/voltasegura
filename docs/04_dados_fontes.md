---
titulo: Fontes de dados — disponibilidade, limitações e matriz de validação
projeto: VoltaSegura
fontes: "CitizenTech_Documento_Vivo.docx v0.1 · GS CitizenTech FIAP 2026.pdf"
atualizado: 2026-11-10
tipo: catalogo-dados
status_auditoria: "1ª auditoria executada em 10/11/2026 (Fase 0) — SSP-SP parcial, GeoSampa verificada ao vivo, SPTrans/GTFS verificado com download, Infosiga parcial, Metrô/CPTM via GTFS confirmado"
regra_geral: "NÃO afirmar que uma informação será usada no MVP sem confirmar acesso, formato, licença, granularidade, data de atualização e viabilidade técnica de integração"
---

# Fontes de dados — VoltaSegura

## Regra da casa

O produto depende da qualidade e cobertura das bases. **Antes de constar no MVP**: confirmar acesso, formato, licença, granularidade, data de atualização e possibilidade técnica de integração. Agentes **não devem presumir** granularidade por rua/coordenada, lotação de ônibus, ou permissão de redistribuição de dados. **Toda evidência abaixo foi verificada em 10/11/2026** (links testados nas respectivas fontes).

---

## 1. Segurança pública — SSP-SP `[AUDITADA COMPLETA — 10/11/2026]`

| Campo | Evidência (10/11/2026) |
|---|---|
| Nome / órgão | "NÚMEROS SEM MISTÉRIO" (SISEC — Sistema Estadual de Coleta de Estatística Criminal) e "Base de Dados da SSP" — Secretaria da Segurança Pública do Estado de SP (Prodesp opera o portal) |
| Onde | CKAN estadual: `dadosabertos.sp.gov.br` (org. secretaria-da-seguranca-publica, 2 datasets) + páginas `ssp.sp.gov.br/estatistica` |
| Recursos do dataset | NOTAS TÉCNICAS · DADOS MENSAIS · DADOS TRIMESTRAIS · PAINEL DE DADOS ESTATÍSTICOS · **CONSULTAS (download da base criminal e de produtividade)** · Bombeiros (2016–2025) · SP Vida · Violência contra mulher (2011–2025) |
| Licença | **CC-BY 4.0** (portal declara Open Definition) |
| Tipos de arquivo | Páginas dinâmicas ASP.NET no próprio `ssp.sp.gov.br` (downloads via menu) — o CKAN é catálogo/redirecionador |
| Granularidade | **CONFIRMADA (arquivo oficial, SHA256 `f627d84e…`)**: a base "SPDadosCriminais" tem **registros individuais de BO** em 30 colunas, incluindo `NOME_MUNICIPIO`, `BAIRRO`, `LOGRADOURO`, `LATITUDE`, `LONGITUDE`, `RUBRICA`, `NATUREZA_APURADA`, `HORA_OCORRENCIA_BO`, `DESCR_TIPOLOCAL`, delegacia/seccional e `COD IBGE`. Há **555.404 linhas de dados** na aba `JAN-JUN_2026` e **259.496** na aba `JUL-DEZ_2026` (o segundo semestre está parcial) |
| Cadência | Mensal (páginas "Dados Mensais"); base criminal "SPDadosCriminais" por **semestre-ano** no "Consultas" |
| Limitações | Subnotificação; a planilha 2026 consultada cobre meses estatísticos até setembro; ~140 MB por arquivo (não versionar no git — registro em `src/ml/dados/README.md` com SHA256) |
| Catálogo / recorte | [x] Lidas as definições oficiais de `RUBRICA` e `NATUREZA_APURADA` na aba "Campos da Tabela_SPDADOS" e catalogados **72 valores de rubrica, 23 de natureza apurada e 129 pares** em `src/ml/dados/CATALOGO_SSP_2026.md` (10/11/2026). [x] Recorte e apresentação do app definidos em `docs/07_classificacao_ssp_app.md`, com classificação por `NATUREZA_APURADA`. O recorte por `RUBRICA` do notebook é específico da entrega de ML; o cálculo de exposição por trecho ainda não foi validado |

> **Insight para ML (disciplina IA&ML)**: com registro por BO (bairro + lat/lon + rubrica + hora do BO de 2026) a pergunta de ML deixa de depender de agregado do painel. A utilidade na escala de trechos do produto ainda precisa de validação. Base disponível em `utils/ssp/SPDadosCriminais_2026.xlsx` (registro em `src/ml/dados/README.md`). A versão catalogada contém meses estatísticos de **janeiro a setembro de 2026**, não o ano completo.

## 2. Transporte público (ônibus) — SPTrans GTFS + API Olho Vivo `[AUDITADA]`

### 2.1 GTFS estático `[VERIFICADO COM DOWNLOAD EM 10/11/2026]`

| Campo | Evidência |
|---|---|
| URL de download | `https://www.sptrans.com.br/umbraco/Surface/PerfilDesenvolvedor/BaixarGTFS?memberName=sptrans` — **sem login direto** |
| Conteúdo baixado (14,3 MB zip) | 10 arquivos GTFS padrão; **1.365 rotas**: 1.349 ônibus (route_type 3) + **9 linhas de Metrô (1)** + **7 linhas de trem/CPTM (2)**; **22.273 paradas**; shapes, stop_times, calendário |
| Versão | 09/11/2026 (mandato `agency_url ?versao=091126`) — atualização recorrente |
| Órgão | SPTRANS (agency_id 1, fuso America/Sao_Paulo) |
| Uso no produto | Cadastro de linhas/paradas/itinerários + rotas multimodais programadas constitui a base do MVP (sem requisição autenticada) |
| Limitações | GTFS estático: não tem posição/retardo; IDs do GTFS vs. API exigem join validado (hipóteses H1–H3 verificadas por projeto comunitário andalogo) |
| Pendências | [ ] Testar download recorrente automático (semanal) no repo · [ ] Confirmar condições/licença de redistribuição de trechos do GTFS no produto |
| Verificação de 11/11/2026 | **Atualização**: novo download trouxe a versão `?versao=101126` (na véspera era `091126`), com arquivos gerados em 10/11/2026; o feed é regenerado com frequência, pelo menos diariamente nesses dois dias. **Estrutura dos horários**: as 2.268 viagens (uma por linha e sentido) usam `frequencies.txt`. O feed descreve **intervalos entre partidas**, não horários exatos, e o `calendar.txt` tem 6 padrões genéricos válidos de 01/10/2023 a 01/06/2027. Consequência: tempos de espera calculados são estimativas a partir dos intervalos. **Serviço noturno**: 1.010 linhas operam às 23h, 915 às 00h30 e 155 às 02h (151 linhas com prefixo "N"). **Termos de redistribuição**: não publicados nas páginas públicas de desenvolvedores (`sptrans.com.br/desenvolvedores` e guia da API, consultados em 11/11/2026). Podem estar no termo aceito no cadastro da área logada; conferir com quem tem a conta ou pelo SP156. **Ligação de IDs com a Olho Vivo**: o `route_id` segue o formato `<letreiro>-<tipo>` (ex.: `1012-10`), compatível com os campos `lt` e `tl` da API. Teste efetivo pendente porque o `.env` com o token não está nesta cópia do repositório |

### 2.2 API Olho Vivo `[VERIFICADA AO VIVO — 10/11/2026]`

| Campo | Evidência |
|---|---|
| Base URL | `https://api.olhovivo.sptrans.com.br/v2.1` (v0 legado) |
| Autenticação | POST `/Login/Autenticar?token=<key>` — **confirmado ao vivo: retorna `true` + cookie de sessão**. Detalhe técnico obrigatório: a API exige `Content-Length` → enviar `-d ""` (sem body a requisição responde **HTTP 411**) |
| Endpoints confirmados ao vivo | `/Linha/Buscar?termosBusca=<termo>` (ex.: linha 8000 → 4 variantes com `cl`, `lt`, `sl`, `tp`, `ts`) · `/Corredor` (singular na v2.1, `Corredores` plural dá 404; retornou os 7 corredores: Campo Limpo, Expresso Tiradentes, Inajar de Souza, Parelheiros, Pirituba, Santo Amaro, Paes de Barros) · `/Posicao` (frota toda) · `/Posicao/Linha?codigoLinha=<cl>` |
| Teste da frota toda (04h38, 10/11/2026) | **1.730 linhas ativas, 4.218 veículos**; campos do veículo: `p` (prefixo), `a` (**acessível para pessoas com deficiência** — útil como dado de acessibilidade), `py`/`px` (lat/lon), `ta` (hora de atualização) |
| Nota teste | `/Posicao/Linha?codigoLinha=2506` às 04h38 retornou `vs` vazio (janela noturna sem frota na linha) — comportamento normal; retestar em horário comercial |
| Cadência de posições | ~85 s (documentado por usuários/projetos; confirmar medindo 2 amostras espaçadas) |
| Ambientes | Produção + sandbox — `[EM ABERTO: limites de requisição, termos de uso e política de redistribuição da produção]` |
| Credencial | Token em `.env` local (variável `OLHO_VIVO`), fora do git (`.gitignore` cobre `.env`); verificação reproduzível: `bash scripts/olhovivo_check.sh` |
| Limitação crítica `[DECISÃO]` | **Posição/previsão ≠ lotação.** Não prometer indicador de lotação no MVP sem fonte validada |
| Pendências | [ ] Medir cadência real (~85 s) com 2 amostras · [ ] Limites de requisição e termos de redistribuição |
| Verificação de 11/11/2026 | **Limites e termos**: não constam na página de desenvolvedores nem no guia de referência públicos. A busca na web não encontrou termos oficiais, só projetos de terceiros. **Cadência**: não medida porque o `.env` com `OLHO_VIVO` não está nesta cópia do repositório. Script pronto para a medição: `python scripts/olhovivo_cadencia.py <routes.txt do GTFS>` (4 amostras de `/Posicao` a cada 45 s, comparando o campo `ta` por veículo, mais o teste de ligação com o GTFS). Rodar quando o token estiver no `.env` |

## 3. Infraestrutura urbana — GeoSampa Iluminação Pública `[VERIFICADO AO VIVO]`

| Campo | Evidência (metadados completos + teste WFS real) |
|---|---|
| Camada | **"Pontos de iluminação pública"** (featuretype `geoportal:iluminacao_publica`) — ID da versão `1a0c8fd5-9273-4d71-8e20-440f9ccc7b5e` |
| Órgão responsável | PMSP/**SPRegula** (IluminaSP) — Coordenadoria de Gestão da Rede de Iluminação Pública; distribuidor SMUL/Geoinfo (contato `geosampa@prefeitura.sp.gov.br`). Regulação: Decreto nº 61.172/2022 |
| Registros | **662.945 pontos** servidos pela WFS (10/11/2026) |
| Campos observados | id, `cd_placa`, tipo de luminária ("LED"…), `dt_carga` (última carga: **2026-10-21**), fonte ("SMUL/ILUME"), endereço — suficiente para "trecho iluminado/não-iluminado" heurístico |
| Granularidade | **Ponto** (EPSG:31983, SIRGAS2000/UTM 23S); escala declarada 1:5000; cobertura total do município |
| Frequência | **Mensal** (metadados) + atualizações pontuais por OS manual |
| Acesso | Portais: download SP (SHP/KMZ/DXF/GPKG/JPG) + **WFS/WMS públicos sem autenticação** (`wfs.geosampa.prefeitura.sp.gov.br/geoserver/geoportal/wfs`) + conteúdo interno PostGIS |
| Restrições | Acesso: semRestrições; uso: declaração "License" `[CONFIRMAR qual licença formal na página de metadados/dados abertos]` |
| Licença (verificada em 11/11/2026) | **CC-BY-SA 4.0** (Creative Commons Atribuição-CompartilhaIgual), conforme a página oficial "Licença para uso de dados do GeoSampa" (`prefeitura.sp.gov.br/web/licenciamento/w/licença-para-uso-de-dados-do-geosampa`; definição tratada no processo SEI 6066.2020/0003044-4). Exige **reconhecimento da fonte**, sem texto de crédito padronizado. Exige que dados republicados e **resultados derivados** mantenham licença semelhante. A página diz que os dados não são de domínio público. Consequência: qualquer base derivada que o VoltaSegura publique (por exemplo, densidade de iluminação por trecho) deve ser distribuída sob CC-BY-SA 4.0 com crédito ao GeoSampa/PMSP. Verificar a compatibilidade ao combiná-la com dados do OpenStreetMap (ODbL) |
| Pendências | [ ] Consultar a camada de "Bueiros/buracos" e "Calçadas" se tiver; [ ] Confirmar que os downloads diários de SP não apresentam variação sem licença explícita |

**Uso proposto MVP** `[HIPÓTESE]`: raio de busca (buffer) ao redor do segmento de caminhada → **densidade de pontos de iluminação** como indicador de infraestrutura — nunca como "segurança", apenas como cobertura de iluminação documentada pela Prefeitura.

## 4. Trânsito — Infosiga SP `[AUDITADA COMPLETA — 10/11/2026]`

- Portal: `infosiga.detran.sp.gov.br` → Dados Abertos e Documentos; + CKAN `governoaberto.sp.gov.br` (org DETRAN-SP).
- Licença declarada no CKAN: **CC-BY-4.0**.
- **Granularidade CONFIRMADA (download real 10/11/2026, `utils/infosiga/dados_infosiga.zip`, 141 MB)**: 9 CSVs (`sinistros_`/`pessoas_`/`veiculos_` × 3 recortes: 2015–2021, 2022–2024, 2025–2026), separador `;`. A tabela `sinistros` traz **`logradouro`, `latitude`, `longitude`, `hora_sinistro`, `dia_da_semana`, `turno`, `tp_sinistro_primario`, `qtd_pedestre`, `qtd_bicicleta`, `qtd_motocicleta`, `qtd_automovel`…** — recorte espacial+temporal+modal real. `pessoas` complementa com sexo, idade, gravidade da lesão, meio de transporte da vítima. Dicionários oficiais v1.8 versionados em `src/ml/dados/documentacao/infosiga/`.
- **Papel**: dados REAIS de sinistros graves/fatais — fonte primária da pergunta de ML `[COMPLETO]`.
- Pendências: definir janela (ex.: 2022–2026) e recorte territorial (município de SP) para o notebook.

## 4.1 Comparação das fontes de segurança/sinistro (para escolha do modelo) — `10/11/2026`

| Dimensão | SSP-SP (SPDadosCriminais) | Infosiga (sinistros) |
|---|---|---|
| Escala territorial | registro individual (BO): bairro + lat/lon | registro individual: logradouro + lat/lon (+ `cod_ibge` do município) |
| Escala temporal | hora do BO + data de ocorrência; **corrente (2026 por semestre)** | hora + dia da semana + turno + data; **série longa (2015–2026)** |
| Evento coberto | todos os crimes com BO (rubrica/natureza) | sinistros de trânsito graves/fatais |
| Uso no VoltaSegura | comparação de "exposição a crimes contra a vítima" por recorte territorial-temporal | contraprova de trânsito por via (`logradouro`): gravidade e modo de deslocamento (pedestre/bicicleta/motocicleta + `qtd_*`) |
| Cobertura do período | Meses estatísticos jan–set/2026 (**814.900 linhas de dados** no estado; **330.690** no município de São Paulo) | 2015–2026 (contínuo) |

> Ambas são complementares, não concorrentes — SSP-SP para crime contra a vítima (roubo/furto); Infosiga para risco de trânsito por modo de deslocamento. A hipótese de "exposição estimada" pode combinar as duas sob os guardrails éticos (`05`).

## 5. Metrô e CPTM `[FECHADO (ESTÁTICO) · EM ABERTO (TEMPO REAL)]`

- **FECHADO — parte estática**: linhas, paradas e horários programados de Metrô e CPTM **já vêm integrados no GTFS da SPTrans** (verificado em 2.1, download de 10/11/2026). Isso valida a "fonte cuja integração esteja validada" exigida pela Fase 1 do roadmap para rotas multimodais programadas.
- **EM ABERTO — tempo real**: estado operacional de Metrô/CPTM (sistema funcionando/atrasos, como o "status de operações") ainda **sem fonte de dados aberta confirmada** — não incluir no MVP; reservar para a Fase 2 com fonte validada.
- Nota: o GTFS de rail pode ter cobertura de headways incompleta (frequências.txt) — validar per-line durante o planejamento do roteamento.
- **Verificação de 11/11/2026 (feed `101126`)**: as 16 linhas de trilho (7 CPTM, 9 Metrô) têm viagens com `stop_times` e `frequencies.txt`.
  - Janela declarada de 04h00 a 23h59 para as linhas CPTM 07–13 e Metrô 1–4 e 15; o Metrô 5 começa às 00h00.
  - Intervalos declarados: de 1 a 15 min no Metrô 1/2, de 4 a 8 min na CPTM 09/11 e de 20 a 30 min na CPTM 13.
  - **Exceções**: **Metrô 6** só tem janela das 10h00 às 14h59; **Metrô 17 (17A/17W)**, das 09h00 às 15h59. À noite, o roteamento não oferecerá essas linhas.
  - `[EM ABERTO]` Conferir se essas janelas refletem a operação real (por exemplo, operação parcial de linhas recentes) ou uma lacuna do feed. Até lá, trajetos noturnos que dependeriam delas podem sair diferentes da realidade.

## 6. Roteamento multimodal `[DECISÃO de direção — 11/11/2026 · validação técnica EM ABERTO]`

> Texto anterior (10/11/2026), preservado: "recomendação para a Fase 1 é um mecanismo de roteamento open-source self-hosted (OpenTripPlanner ou OSRM com GTFS)…". **Correção**: o OSRM não processa GTFS nem roteia transporte público; ele calcula rotas viárias (carro, bicicleta, a pé). Ver a tabela abaixo.

### 6.1 O que o VoltaSegura exige do roteamento

1. Alternativas para a mesma origem, destino e horário, com ônibus, Metrô e CPTM, baldeações e caminhada.
2. **Geometria de cada trecho a pé** (linha com coordenadas), indispensável para traçar o corredor de ±100 m e calcular `N`, `L` e `D` (`docs/08`).
3. Horários programados a partir do GTFS da SPTrans já verificado (§2.1). Tempo real fica fora do MVP.
4. Uso dos resultados combinados com dados da SSP-SP, sem restrição contratual a armazenar ou cruzar o itinerário.
5. Custo previsível, sem cobrança por consulta no piloto.

### 6.2 Decisão

`[DECISÃO — 11/11/2026]` **OpenTripPlanner 2 (OTP2), servidor próprio**, alimentado pelo GTFS da SPTrans (inclui Metrô/CPTM) e por um extrato do OpenStreetMap (OSM) do município. É a opção que atende os cinco requisitos sem custo por consulta. Integrações com as entregas das disciplinas (SOA/C#) **não** fazem parte desta decisão.

`[EM ABERTO — evidência necessária]` Antes de depender do OTP2, executar um teste local:

- [ ] Instalar o Java exigido pela versão do OTP2 escolhida. As versões recentes pedem Java 21 (confirmar na documentação oficial). A máquina de testes tem Java 8 e 16 GB de RAM.
- [ ] Montar o grafo com o GTFS da SPTrans e o OSM de São Paulo; medir memória, tempo de montagem e tamanho do grafo.
- [ ] Consultar 2–3 trajetos reais em regiões diferentes; conferir se o itinerário traz a geometria dos trechos a pé, as baldeações e horários plausíveis.
- [ ] Registrar a atribuição exigida pela licença do OSM (ODbL) e confirmar a licença do OTP2 na versão usada.
- [ ] Definir a hospedagem do piloto a partir do consumo medido; o custo será o da máquina, a estimar só depois da medição.

### 6.3 Alternativas avaliadas (para eventual revisão da decisão)

| Opção | Tipo | Transporte público (GTFS) | Geometria dos trechos a pé | Custo | Pontos fortes | Limitações / riscos | Situação |
|---|---|---|---|---|---|---|---|
| **OpenTripPlanner 2** | Software livre, servidor próprio | Sim, nativo, com baldeações | Sim, por trecho do itinerário | Só infraestrutura | Feito para planejamento multimodal; várias alternativas por consulta; uso amplo por agências de transporte | Precisa de Java recente e memória proporcional à área; montar e atualizar o grafo é tarefa de operação | **Escolhida** |
| **r5 / r5py** (Conveyal) | Motor livre; r5py é a interface Python | Sim | Sim, em itinerários detalhados | Só infraestrutura | Ótimo para análises em lote, como testar a regra de `docs/08` em milhares de pares origem–destino | Pensado para análise de acessibilidade, não para atender um app consulta a consulta; também pede Java recente | **Complementar**: candidato para validar a calibração em lote |
| **GraphHopper** (módulo de transporte público) | Software livre, servidor próprio | Sim, módulo específico | Sim | Só infraestrutura (versão hospedada é paga) | Roteamento viário maduro e rápido | Transporte público menos difundido que o do OTP; conferir a maturidade do módulo para feeds grandes | Reserva |
| **Valhalla** (modo multimodal) | Software livre, servidor próprio | Sim, com GTFS | Sim | Só infraestrutura | Bom roteamento a pé e por bicicleta | Suporte a transporte público menos maduro que o do OTP; validar com o GTFS da SPTrans | Reserva |
| **OSRM** | Software livre, servidor próprio | **Não** | Sim, só para rotas viárias | Só infraestrutura | Muito rápido para carro, bicicleta e a pé | Não roteia transporte público; serviria apenas para os trechos a pé de itinerários vindos de outra fonte | **Descartado como motor principal** |
| **Google Maps Platform** (Routes/Directions, modo transporte público) | API comercial | Sim (fonte própria) | Sim | Cobrança por consulta | Cobertura e qualidade conhecidas; sem servidor | Termos de uso restringem armazenar resultados e exibi-los fora de um mapa Google, o que conflita com o requisito 4 (verificar os termos vigentes); dependência externa e custo variável | Descartado no MVP |
| **HERE** (Public Transit API) | API comercial | Sim (fonte própria) | Sim | Plano gratuito com limite; depois, por consulta (verificar) | Sem servidor | Termos de armazenamento e combinação a verificar; dependência externa | Reserva comercial |
| **Moovit** (soluções corporativas) | API/licença comercial | Sim | A verificar | Contrato | Forte em transporte público no Brasil | Acesso por contrato corporativo; inviável no prazo e no orçamento do piloto | Descartado no MVP |
| **Rotas pré-calculadas** | Itinerários fixos salvos (gerados uma vez, por exemplo no próprio OTP2) | Depende da fonte usada | Sim | Nenhum | Garante uma demonstração estável | Não atende origem e destino quaisquer; não é produto | Plano de contingência para demonstrações |

> Os custos e termos das opções comerciais **não foram consultados nesta data**; a tabela registra o critério de avaliação, não preços. Confirmar nas páginas oficiais antes de qualquer reconsideração.
>
> Fontes adicionais de GTFS a avaliar, se necessárias: EMTU (ônibus intermunicipais), via `dadosabertos.artesp.sp.gov.br`. Fora do MVP municipal até haver necessidade.

---

## Matriz de validação (estado em 10/11/2026)

| # | Campo | SSP-SP | GTFS SPTrans | Olho Vivo | GeoSampa/IP | Infosiga | Roteamento |
|---|---|---|---|---|---|---|---|
| 1 | Órgão responsável | ✅ SSP-SP/Prodesp | ✅ SPTRANS | ✅ SPTRANS | ✅ PMSP/SPRegula | ✅ DETRAN-SP | — |
| 2 | Variáveis disponíveis | ✅ 30 colunas/BO: rubrica, natureza, bairro, lat/lon, hora, delegacia, COD IBGE (dados em `utils/ssp/`) | ✅ linhas/paradas/horários/shape (3 modos) | ✅ posição/previsão/linhas/corredores | ✅ ponto + tipo + carga | ✅ 3 tabelas (sinistros/pessoas/veículos): logradouro+lat/lon+hora+dia+turno + `qtd_*` por modo | — |
| 3 | Granularidade | ✅ **registro individual de BO** (814.900 linhas, meses estatísticos jan–set/2026; 30 colunas) | ✅ por parada/route/shape | ✅ por veículo/parada | ✅ ponto (662.945 registros) | ✅ registro individual (2015–2026, `;`-CSV) | — |
| 4 | Frequência / última atualização | ✅ dados mensais + planilha anual em duas abas (versão consultada: jan–set/2026) | ✅ 09/11/2026 | ✅ teste ao vivo 04h38 10/11/2026 (~85 s a medir) | ✅ mensal; última carga 21/10/2026 | ✅ 2015–2026 contínuo (recorte em 3 arquivos) | — |
| 5 | Licença / autenticação / limites | ✅ CC-BY-4.0; site manual | ⚠️ GTFS download livre; redistrib. a validar (termos não públicos) | ✅ token testado ao vivo (login OK); limites/termos `EM ABERTO` (não públicos) | ✅ CC-BY-SA 4.0 (verificada em 11/11/2026) | ✅ CC-BY-4.0 | — |
| 6 | Lacunas / vieses | ✅ subnotificação (ver 03 §5) | ✅ estático, sem atraso | ✅ sem lotação | ✅ sem estado da lâmpada (só cadastro) | ✅ apenas óbitos, não acidentes | — |

**Legenda**: ✅ verificado · ⚠️ parcial — ação pendente · — n/a

## Ações imediatas da Fase 0 (atualizada)

1. ~~`[PESSOA DO GRUPO]` Baixar manualmente no `ssp.sp.gov.br`~~ **CONCLUÍDO (10/11/2026)**: 11 arquivos originalmente baixados para `utils/ssp/` (SPDadosCriminais 2026 com 30 colunas/BO, produtividade, veículos/celulares/objetos subtraídos, consolidados anual/mensal, taxas de delito) — granularidade real: registro individual. O arquivo criminal de mesmo SHA256 foi obtido novamente para o catálogo; contém meses estatísticos jan–set/2026. Registro de fontes em `src/ml/dados/README.md`.
2. ~~`[PESSOA DO GRUPO]` Criar conta/app no portal SPTrans → token~~ **CONCLUÍDO (10/11/2026)**: token criado e guardado em `.env` (`OLHO_VIVO`, fora do git); autenticação + 4 endpoints testados ao vivo (ver §2.2). Restam as medições de cadência e os termos de uso.
3. ~~`[TÉCNICO]` Baixar histórico Infosiga (2024)~~ **CONCLUÍDO (10/11/2026)**: dado melhor que o esperado — `dados_infosiga.zip` com 9 CSVs cobrindo **2015–2026** em 3 tabelas (sinistros/pessoas/veículos), com logradouro+lat/lon+hora+turno; dicionários v1.8 + diagrama ER + fluxograma versionados em `src/ml/dados/documentacao/infosiga/`.
4. `[TÉCNICO]` Definir licença formal da camada GeoSampa (página Dados Abertos ↦ metadados) e anotar.
5. `[DECISÃO DE ARQUITETURA — 11/11/2026]` Roteamento: **OpenTripPlanner 2** com GTFS SPTrans + OSM; executar o teste local listado na §6.2. (Texto anterior: "abrir conta/projeto de OTP/OSRM"; o OSRM foi descartado por não rotear transporte público.)

## Referências (links testados em 10/11/2026)

- CKAN estadual SSP: `dadosabertos.sp.gov.br/dataset/numeros-sem-misterio` (CC-BY-4.0) e `/dataset/dados-seguranca-publica`.
- SSP páginas: `ssp.sp.gov.br/estatistica` (notas técnicas, dados mensais, painel ArcGIS `apps/dashboards/6e54b8f1042949fa9f762eca11124d11`).
- SPTrans: `sptrans.com.br/desenvolvedores` (dev portal) · guia de referência: `sptrans.com.br/desenvolvedores/api-do-olho-vivo-guia-de-referencia` · API: `api.olhovivo.sptrans.com.br/v2.1`.
- GTFS SPTrans (download direto): `sptrans.com.br/umbraco/Surface/PerfilDesenvolvedor/BaixarGTFS?memberName=sptrans`.
- GeoSampa IP: `metadados.geosampa.prefeitura.sp.gov.br/geonetwork/…#1a0c8fd5-…` · WFS: `wfs.geosampa.prefeitura.sp.gov.br/geoserver/geoportal/wfs?…typeName=geoportal:iluminacao_publica`.
- Infosiga: `infosiga.detran.sp.gov.br` (+ CKAN DETRAN gov.br, CC-BY-4.0).
- (fontes complementares de referência para a entrega de ML): IBGE, SP156 — a validar oportunamente.
- Lotação de ônibus: **sem fonte validada** — permanece `EM ABERTO`; nada de "previsão de lotação" no MVP (ver §2.2).
