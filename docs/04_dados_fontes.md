---
titulo: Fontes de dados — disponibilidade, limitações e matriz de validação
projeto: VoltaSegura (produto)
fontes: "CitizenTech_Documento_Vivo.docx v0.1 · GS CitizenTech FIAP 2026.pdf"
atualizado: 2026-11-10
tipo: catalogo-dados
regra_geral: "NÃO afirmar que uma informação será usada no MVP sem confirmar acesso, formato, licença, granularidade, data de atualização e viabilidade técnica de integração"
---

# Fontes de dados — VoltaSegura

## Regra da casa

O produto depende da qualidade e cobertura das bases. **Antes de constar no MVP**: confirmar acesso, formato, licença, granularidade, data de atualização e possibilidade técnica de integração. Agentes **não devem presumir** granularidade por rua/coordenada, lotação de ônibus, ou permissão de redistribuição de dados.

## Catálogo de fontes

### 1. Segurança pública — SSP-SP

- Estatísticas criminais mensais + portal de dados abertos da Secretaria da Segurança Pública de SP.
- Granularidade **varia conforme a base**: não presumir coordenadas ou precisão por rua.
- **Uso proposto** `[HIPÓTESE]`: séries históricas e ocorrências relevantes ao deslocamento, respeitando a resolução disponível. Se a base permitir apenas município/área policial/distrito, o produto **trabalha nessa escala e informa a limitação**.
- Fonte complementar citada pelo briefing de ML: **Infosiga SP** (acidentes de trânsito) — útil para dados reais exigidos na entrega de IA/ML.

### 2. Transporte público — SPTrans (ônibus)

- **GTFS**: informações estáticas (linhas, paradas, horários).
- **API Olho Vivo**: informações operacionais (posição dos veículos, previsão de chegada) — **exige cadastro e chave de acesso**.
- **Limitação crítica** `[DECISÃO]`: posição/previsão ≠ dados confiáveis de **lotação**. **Não prometer indicador de lotação no MVP** sem localizar e validar uma fonte específica.

### 3. Infraestrutura urbana — GeoSampa

- Dados geográficos municipais com camadas para consulta e download; inclui camada de **pontos de iluminação pública**.
- Pendência `[EM ABERTO]`: consultar metadados da camada (data de referência, atualização, cobertura, significado dos registros).

### 4. Metrô, CPTM e roteamento `[EM ABERTO]`

- Disponibilidade, formato e condições de uso dos dados de metrô/trem **a confirmar**.
- Escolher mecanismo de **roteamento multimodal** e verificar custos, limites de uso e licença.
- **Não assumir** que uma API permite redistribuir ou armazenar todos os dados.

### 5. Demográficos/contexto (para laços institucionais e slides)

- IBGE, SP156 (sugestões do briefing de ML — dados reais e públicos).
- INMET (clima — provavelmente não central para este projeto).

## Matriz de validação obrigatória (preencher por fonte)

Antes de qualquer base entrar no produto, auditar e registrar:

| # | Campo | SSP-SP | SPTrans/GTFS | Olho Vivo | GeoSampa | Metrô/CPTM | Roteamento |
|---|---|---|---|---|---|---|---|
| 1 | Nome da base e órgão responsável | | | | | | |
| 2 | Tipo de informação e variáveis disponíveis | | | | | | |
| 3 | Granularidade espacial (coordenada / segmento / distrito / área policial / município) | | | | | | |
| 4 | Frequência real de atualização + data da última | | | | | | |
| 5 | Formato, autenticação, limites, licença, uso comercial | | | | | | |
| 6 | Lacunas, vieses e limitações conhecidas (subnotificação) | | | | | | |

> **Status da matriz**: `[EM ABERTO]` — nenhuma célula está validada. Esta é a ação nº 1 do grupo (ver `06_estado_atual.md`).

## Referências das fontes (do documento vivo)

- SSP-SP — Estatísticas criminais mensais; Portal de dados abertos.
- SPTrans — Área do desenvolvedor (GTFS); Documentação da API Olho Vivo.
- GeoSampa — Mapa Digital da Cidade de São Paulo; camada Pontos de iluminação pública.
- Senado Federal — PL 1.169/2025 (verificar tramitação na Câmara antes de citar).
- LGPD — Lei nº 13.709/2018.
- Ipsos-Ipec / Rede Nossa São Paulo (2026) e Instituto Patrícia Galvão / Locomotiva (2025) — estatísticas de percepção (ver `03_projeto_documento_vivo.md`, seção 10).
- Precedentes éticos: CBS News (patente "avoid ghetto"), ACLU, Washingtonian (SketchFactor, 2014), Gstrein & Ritsema van Eck (2017), Geografares, CNN (2015 — turista e Waze), Quartz (2016 — alertas no Waze), Jornal de Brasília (2025), Olhar Digital (2019 — lei do Rio), TecMundo (Onde Fui Roubado), Nextgov (app Citizen).
