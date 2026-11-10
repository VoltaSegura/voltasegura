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

## 1. Segurança pública — SSP-SP `[AUDITADA PARCIAL]`

| Campo | Evidência (10/11/2026) |
|---|---|
| Nome / órgão | "NÚMEROS SEM MISTÉRIO" (SISEC — Sistema Estadual de Coleta de Estatística Criminal) e "Base de Dados da SSP" — Secretaria da Segurança Pública do Estado de SP (Prodesp opera o portal) |
| Onde | CKAN estadual: `dadosabertos.sp.gov.br` (org. secretaria-da-seguranca-publica, 2 datasets) + páginas `ssp.sp.gov.br/estatistica` |
| Recursos do dataset | NOTAS TÉCNICAS · DADOS MENSAIS · DADOS TRIMESTRAIS · PAINEL DE DADOS ESTATÍSTICOS · **CONSULTAS (download da base criminal e de produtividade)** · Bombeiros (2016–2025) · SP Vida · Violência contra mulher (2011–2025) |
| Licença | **CC-BY 4.0** (portal declara Open Definition) |
| Tipos de arquivo | Páginas dinâmicas ASP.NET no próprio `ssp.sp.gov.br` (downloads via menu) — o CKAN é catálogo/redirecionador |
| Granularidade | `ATENÇÃO`: o Painel Estatístico (ArcGIS) filtrável por **cidade, tipo de crime, dia da semana e horário** — indicativo de agregados por município com recorte temporal. **Granularidade por distrito/unidade policial: CONFIRMAR baixando "CONSULTAS" manualmente** (o site bloqueia crawlers) |
| Cadência | Mensal (páginas "Dados Mensais"; painel atualizado por release mensal) `[CONFIRMAR data exata do release]` |
| Limitações | Subnotificação e mudanças de naturezas ao longo do tempo (ver `03` §5) ; downloads manuais (sem API pública JSON/CSV documentada) |
| Pendências | [ ] Baixar 2–3 meses de "Dados Mensais" + 1 arquivo de "CONSULTAS" e registrar granularidade real por distrito · [ ] Ler NOTAS TÉCNICAS para definições das naturezas · [ ] Confirmar periodicidade de revisão retroativa |

> **Insight para ML (disciplina IA&ML)**: o recorte "dia da semana + horário" do painel é exatamente o tipo de agregado útil para pergunta de ML por distrito/hora (`src/ml/README.md`). Dados simulados NÃO são aceitos pela disciplina — usar essa base real.

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

### 2.2 API Olho Vivo `[VERIFICADO — DOCUMENTAÇÃO]`

| Campo | Evidência |
|---|---|
| Base URL | `https://api.olhovivo.sptrans.com.br/v2.1` (v0 legado) |
| Autenticação | POST `/Login/Autenticar?token=<key>` — cookie de sessão para chamadas seguintes; **cadastro em "Meus Aplicativos" no portal desenvolvedores: `sptrans.com.br/desenvolvedores`** |
| Endpoints-chave | Linhas (busca por termo/sentido), Paradas (por linha/corredor), Corredores, Empresas, **Posição da frota em tempo real** (por linha), **Previsão de chegada por parada** |
| Cadência de posições | ~85 s (documentado por usuários/projetos; confirmar no sandbox) |
| Ambientes | Produção + sandbox → em sandbox há uso comercial — `[CONFIRMAR termos de uso e limites de requisição de produção]` |
| Limitação crítica `[DECISÃO]` | **Posição/previsão ≠ lotação.** Não prometer indicador de lotação no MVP sem fonte validada |
| Pendências | [ ] Criar conta e app no portal (uma pessoa do grupo) para obter token e testar endpoints reais · [ ] Verificar limite de requisições e política de redistribuição |

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
| Pendências | [ ] Consultar a camada de "Bueiros/buracos" e "Calçadas" se tiver; [ ] Confirmar que os downloads diários de SP não apresentam variação sem licença explícita |

**Uso proposto MVP** `[HIPÓTESE]`: raio de busca (buffer) ao redor do segmento de caminhada → **densidade de pontos de iluminação** como indicador de infraestrutura — nunca como "segurança", apenas como cobertura de iluminação documentada pela Prefeitura.

## 4. Trânsito — Infosiga SP `[AUDITADA PARCIALMENTE]`

- Portal: `infosiga.detran.sp.gov.br` → Dados Abertos e Documentos; + CKAN `governoaberto.sp.gov.br` (org DETRAN-SP).
- Licença declarada no CKAN: **CC-BY-4.0**; formatos CSV/ZIP; presença de tags por categoria de dados (sinistro fatal, atropelamentos, código IBGE, região administrativa, dia do falecimento).
- **Papel**: dados REAIS de sinistros (óbitos) — pergunta de ML viável; granularidade municipal + logradouro `[CONFIRMAR]`.
- Pendências: baixar 1 dataset consolidado histórico (ex.: óbitos 2024) e registrar campos + cobertura + período real em `src/ml/dados/README.md`.

## 5. Metrô e CPTM `[FECHADO (ESTÁTICO) · EM ABERTO (TEMPO REAL)]`

- **FECHADO — parte estática**: linhas, paradas e horários programados de Metrô e CPTM **já vêm integrados no GTFS da SPTrans** (verificado em 2.1, download de 10/11/2026). Isso valida a "fonte cuja integração esteja validada" exigida pela Fase 1 do roadmap para rotas multimodais programadas.
- **EM ABERTO — tempo real**: estado operacional de Metrô/CPTM (sistema funcionando/atrasos, como o "status de operações") ainda **sem fonte de dados aberta confirmada** — não incluir no MVP; reservar para a Fase 2 com fonte validada.
- Nota: o GTFS de rail pode ter cobertura de headways incompleta (frequências.txt) — validar per-line durante o planejamento do roteamento.

## 6. Roteamento multimodal `[EM ABERTO]`

- O GTFS permite calcular **horários programados** — a recomendação para a Fase 1 é um mecanismo de roteamento **open-source self-hosted** (OpenTripPlanner ou OSRM com GTFS, sem custo de licenciamento), alimentado pelos feeds verificados (SPTrans incl. Metrô/CPTM; EMTU via `dadosabertos.artesp.sp.gov.br`).
- Alternativa comercial (APIs de mapas/roteamento pagas) fica como opção da Fase 2, se a cobertura self-hosted se mostrar insuficiente.
- Questões a decidir: requisitos de hardware/hosting do OTP/OSRM, custo de infraestrutura, limite de `partida` (e.g. viagem multimodal com transferência), e integração com o backend SOA. Esperamos essas balizas no desenho de arquitetura.

---

## Matriz de validação (estado em 10/11/2026)

| # | Campo | SSP-SP | GTFS SPTrans | Olho Vivo | GeoSampa/IP | Infosiga | Roteamento |
|---|---|---|---|---|---|---|---|
| 1 | Órgão responsável | ✅ SSP-SP/Prodesp | ✅ SPTRANS | ✅ SPTRANS | ✅ PMSP/SPRegula | ✅ DETRAN-SP | — |
| 2 | Variáveis disponíveis | ⚠️ por confirmar em download | ✅ linhas/paradas/horários/shape (3 modos) | ✅ posição/previsão/linhas/corredores | ✅ ponto + tipo + carga | ⚠️ por confirmar | — |
| 3 | Granularidade | ⚠️ município via painel; distrito? (baixar "Consultas") | ✅ por parada/route/shape | ✅ por veículo/parada | ✅ ponto (662.945 registros) | ⚠️ município; logradouro? | — |
| 4 | Frequência / última atualização | ⚠️ mensal (declarado) | ✅ 09/11/2026 | ✅ ~85 s (confirmar ao vivo) | ✅ mensal; última carga 21/10/2026 | ⚠️ confirmar | — |
| 5 | Licença / autenticação / limites | ✅ CC-BY-4.0; site manual | ⚠️ GTFS download livre; redistrib. a validar | ⚠️ token grátis; limite/termos a validar | ✅ semRestrição; uso="License" (qual?) | ✅ CC-BY-4.0 | — |
| 6 | Lacunas / vieses | ✅ subnotificação (ver 03 §5) | ✅ estático, sem atraso | ✅ sem lotação | ✅ sem estado da lâmpada (só cadastro) | ✅ apenas óbitos, não acidentes | — |

**Legenda**: ✅ verificado · ⚠️ parcial — ação pendente · — n/a

## Ações imediatas da Fase 0 (atualizada)

1. `[PESSOA DO GRUPO]` Baixar manualmente no `ssp.sp.gov.br`: dados mensais (2 meses) + 1 consulta distrital → registrar granularidade real.
2. `[PESSOA DO GRUPO]` Criar conta/app no portal SPTrans → token → testar `/Login/Autenticar` e `/Posicao/Linha` (registrar no `prompts.md`/`docs`).
3. `[TÉCNICO]` Baixar histórico Infosiga (2024) → `src/ml/dados/` → preencher campos/período.
4. `[TÉCNICO]` Definir licença formal da camada GeoSampa (página Dados Abertos ↦ metadados) e anotar.
5. `[DECISÃO DE ARQUITETURA]` Roteamento: abrir conta/projeto de OTP/OSRM na Fase 1 com GTFS (sem custo) — ver seção 6.

## Referências (links testados em 10/11/2026)

- CKAN estadual SSP: `dadosabertos.sp.gov.br/dataset/numeros-sem-misterio` (CC-BY-4.0) e `/dataset/dados-seguranca-publica`.
- SSP páginas: `ssp.sp.gov.br/estatistica` (notas técnicas, dados mensais, painel ArcGIS `apps/dashboards/6e54b8f1042949fa9f762eca11124d11`).
- SPTrans: `sptrans.com.br/desenvolvedores` (dev portal) · guia de referência: `sptrans.com.br/desenvolvedores/api-do-olho-vivo-guia-de-referencia` · API: `api.olhovivo.sptrans.com.br/v2.1`.
- GTFS SPTrans (download direto): `sptrans.com.br/umbraco/Surface/PerfilDesenvolvedor/BaixarGTFS?memberName=sptrans`.
- GeoSampa IP: `metadados.geosampa.prefeitura.sp.gov.br/geonetwork/…#1a0c8fd5-…` · WFS: `wfs.geosampa.prefeitura.sp.gov.br/geoserver/geoportal/wfs?…typeName=geoportal:iluminacao_publica`.
- Infosiga: `infosiga.detran.sp.gov.br` (+ CKAN DETRAN gov.br, CC-BY-4.0).
- (fontes complementares de referência para a entrega de ML): IBGE, SP156 — a validar oportunamente.
- Lotação de ônibus: **sem fonte validada** — permanece `EM ABERTO`; nada de "previsão de lotação" no MVP (ver §2.2).
