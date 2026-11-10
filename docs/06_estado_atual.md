---
titulo: Estado atual — decisões, hipóteses, pontos em aberto e próximas ações
projeto: VoltaSegura (produto; ex-"CitizenTech")
versao: "0.1 (baseada no Documento Vivo de 09/11/2026)"
atualizado: 2026-11-10
tipo: estado-trabalho
atualizacao: "A cada mudança: registrar data, mudança, motivo, evidência e responsável. NÃO apagar decisões antigas sem registrar o que mudou e por quê."
---

# Estado atual do projeto

> **Como usar**: um agente antes de sugerir direções deve considerar apenas itens `[DECISÃO]` como estabelecidos, testar itens `[HIPÓTESE]` e tratar `[EM ABERTO]` como pendências reais.

## 1. Direcionamentos atuais `[DECISÃO]`

- [x] Foco inicial: **estudantes universitários que retornam para casa à noite**.
- [x] A solução **compara alternativas de ida e volta** — não apenas aponta ocorrências.
- [x] O produto **não promete rota segura**; comunica **exposição estimada** e qualidade dos dados.
- [x] Modelo comercial prioritário a validar: **B2B2C**, começando por universidades.
- [x] Identidade visual da apresentação: **preto e laranja**, menos texto e Big Numbers em destaque.
- [x] **Renomeação do produto (10/11/2026)**: de "CitizenTech" para **VoltaSegura** — elimina o conflito de identidade com o app "Citizen" e evita confusão com o nome do tema da GS.
- [x] **1ª auditoria de fontes (Fase 0, 10/11/2026)**: GeoSampa/IP verificada ao vivo (WFS, 662.945 pontos, mensal); SPTrans GTFS vs.Ne podem baixados (1.365 rotas: 1.349 ônibus + 9 Metrô + 7 CPTM; 22.273 paradas; sem login); API Olho Vivo v2.1 documentada (token/free, ~85 s); SSP-SP CC-BY-4.0 no CKAN estadual; Infosiga CC-BY-4.0. Resultados na `docs/04_dados_fontes.md`.
- [x] **Token Olho Vivo validado ao vivo (10/11/2026)**: conta/app criados no portal SPTrans; token em `.env` (`OLHO_VIVO`, fora do git). Autenticação retorna `true` + cookie (detalhe: exige `Content-Length` → body vazio, senão HTTP 411). Endpoints `/Linha/Buscar`, `/Corredor` (singular) e `/Posicao` testados: 1.730 linhas, 4.218 veículos às 04h38, com flag de acessibilidade por veículo (`a`). Verificação reproduzível: `bash scripts/olhovivo_check.sh`. Restam: medir cadência (~85 s) e limites/termos de uso.
- [x] **Datasets reais adquiridos (10/11/2026)**: grupo baixou `utils/ssp/` (11 arquivos SSP-SP: **SPDadosCriminais 2026 completo** — 555.405 BOs/semestre × 30 colunas com bairro, lat/lon, rubrica, hora — + produtividade, veículos/celulares/objetos subtraídos, consolidados e taxas) e `utils/infosiga/` (dado Infosiga 2015–2026: 9 CSVs × 3 tabelas com logradouro, lat/lon, hora, dia da semana, turno e modo de deslocamento). Arquivos brutos fora do git (140–336 MB); registro com SHA256 + documentação oficial versionada em `src/ml/dados/`.
- [x] **Fechado o bloqueio da pergunta de ML**: escala territorial-temporal individual disponível nas duas fontes principais (SSP-SP e Infosiga); granularidade por distrito era o último risco de inviabilidade da Fase 0 → superado antes do prazo da Fase 1.
- [x] **Notebook de ML executado com dados reais (10/11/2026)**: pergunta "frequência relativa de BOs de roubo/furto por bairro × dia × faixa horária (SSP-SP 2026, 274.990 BOs na capital, 375.984 células de grade)" com RandomForestRegressor sobre `log1p(contagem)`; grade de 27 combinações de 3 hiperparâmetros com TimeSeriesSplit(3) **só no treino** (treino meses 1–4, teste 5–6). Resultado: **R² teste 0,61 / RMSE teste 1,08× treino** (generalização saudável) — resposta quantitativa para comparação relativa, sem rótulo territorial. Contraprova do Infosiga por logradouro **não generaliza** (R² teste −0,41; 78% dos logradouros com <5 sinistros em ~11 anos) → achado direto para o produto: marcar "dados insuficientes", nunca silêncio. Achados de qualidade: 39,8% dos BOs do recorte sem hora utilizável; 47% dos bairros com <10 BOs/2026. Artefatos: `src/ml/` (notebook executado, `etl.py`, `RELATORIO_ML.md`, figuras).
- [x] Mockup (tempos 32 min / 38 min) permanece como **exemplo visual**, não como algoritmo validado.

## 2. Hipóteses que precisam de validação `[HIPÓTESE]`

- [ ] Estudantes noturnos percebem valor suficiente para usar a plataforma regularmente.
- [ ] Universidades reconhecem o problema e podem financiar uma solução complementar.
- [ ] As bases disponíveis permitem uma comparação útil na escala geográfica necessária.
- [ ] A combinação de indicadores gera diferenciação percebida frente aos apps existentes.
- [ ] A persona "Marina, 22" reflete o perfil real dos estudantes (outro registro do grupo: "Ágatha Santos, 24" — padronizar após pesquisa).

## 3. Pontos em aberto `[EM ABERTO]`

- [ ] Qual será a região ou campus do primeiro piloto?
- [ ] Quais tipos de ocorrência serão considerados e por quê?
- [ ] Qual é a granularidade real das bases criminais que poderemos integrar?
- [ ] Quais serão os critérios, pesos e limites da metodologia de exposição estimada?
- [x] ~~Quais dados de Metrô e CPTM podem ser integrados e em quais condições?~~ **FECHADO parcialmente (10/11/2026)**: GTFS estático da SPTrans já inclui 9 linhas de Metrô + 7 de CPTM (verificado com download em `docs/04` §2.1/§5). Tempo real de Metrô/CPTM permanece `EM ABERTO`.
- [ ] Qual mecanismo de roteamento será usado e quanto custará?
- [ ] Qual será a estratégia de privacidade, retenção e segurança dos dados de localização?
- [ ] **Marca VoltaSegura**: concluir as checagens de marca, domínio e anterioridade para o nome **VoltaSegura** (renomeado de "CitizenTech" em 10/11/2026; o conflito com o app Citizen foi eliminado pela renomeação)
- [ ] **Logo v1 gerada (10/11/2026)**: 2 rascunhos de marca — com wordmark e ícone puro (`design/logo_v1_wordmark.png`, `design/logo_v1_icone.png`) — com o conceito **"V" formado por rota terminando em pino**, paleta preto/laranja e exclusões éticas de escudo/cadeado/triângulo (guardrails de `docs/05`). Prompts versionados em `design/prompts/`. Pendente: revisão/aprovação do grupo (não apresentar como marca fechada), escolha da variante, versão vetorial (SVG) e as checagens de marca do item acima.
- [ ] **Identidade em exploração (10/11/2026, após v1)**: 5 conceitos explorados com modelo econômico (`recraft-v4.1-flash`, US$ 0,007/img: `design/v2/`, `design/v3/`); conceito escolhido para iteração: **"rotas comparadas"** (duas rotas convergindo no pino-destino). **Paleta em revisão** `[EM ABERTO]/[HIPÓTESE]`: grupo questionou "preto + laranja" (associação indesejada); proposta em avaliação: **"Noite + Luz do caminho"** — navy `#0D1B2A` (base), âmbar `#FFB627` (acento/luz), ciano `#4ECDC4` (dados/confiança), off-white `#F8F9FA` (texto). Nota: feedback positivo do professor citava preto+laranja — mudança é decisão do grupo e precisa ser registrada como tal antes de ir aos slides/repo. Favorita provísoria: `design/v3/v3_3b_rotas_bicor.webp` (bicromia âmbar × ciano). Próximo passo barato: refino do 3b (pino integrado, teste 48px) → fechamento no `gpt-image-2.5-sunburst` (PNG/wordmark) + SVG via `recraft-v4.1-vector`.
- [x] **Conceito evoluiu para monograma "VS" (10/11/2026, v4–v6)**: do "rotas comparadas" para **monograma VS** — traço esquerdo do V é pino de mapa vazado, unido à fita do S; origem: arte de referência do grupo (walker, lua, gradiente removidos no estilo minimalista). Sombra da dobra do S mantida em todos os renders — tratada como assinatura; manter/eliminar é decisão do grupo `[EM ABERTO]`. Ícone validado em 48px (`design/v6/v6_1_pino_vazado.jpg`). Gasto acumulado da marca até v6: ~US$ 0,30.
- [x] **Paleta decidida (10/11/2026, v7)**: grupo testou dourado `#FFC53D` × ciano `#4ECDC4` no acento — **dourado escolhido** ("Noite + Luz do caminho"); ciano volta como cor funcional de dados/confiança no app, fora da marca. Laranja/preto descartados (associação indesejada, v2–v3).
- [ ] **Fechamento da marca em andamento (10/11/2026, v8–v10)** `[EM ABERTO]`: lockups v8 em dourado — v8·1 limpo (escolhido pelo grupo como base do logo oficial) e v8·2 com tagline "MOBILIDADE NOTURNA" (uso em pitch); v9 readiciona a pessoa andando da referência — walker dourado em espaço negativo (v9·1) e walker em ciano como viajante destacado (v9·2, versão "storytelling" para slides/pitch; ícone do app segue v7·1 puro). **v10 — fechamento premium concluído (10/11/2026)**: PNG final 1024×1024 no `gpt-image-2.5-sunburst` (`design/v10/v10_1_premium_png.png`, adesão ao v8·1 e grafia exata) + SVG vetorial real no `recraft-v4.1-vector` (`design/v10/v10_2_premium_svg.svg`, curvas verdadeiras); teste 48px aprovado. Gasto acumulado da marca: ~US$ 0,53. Pendente: **aprovação formal do grupo** (não apresentar como marca fechada até lá) e checagens de marca/domínio do item acima.
- [ ] Qual instituição pode participar do primeiro piloto?
- [ ] ODS conectados e suas justificativas no formato exigido pela FIAP (candidatos fortes: ODS 11 e 10).
- [ ] Arquitetura: SOA e C# serão o mesmo serviço ou módulos distintos?

## 4. Próximas ações do grupo (backlog)

- [ ] Auditar bases **SSP-SP**, **SPTrans/GTFS**, **API Olho Vivo** e **GeoSampa** — registrando granularidade, atualização, licença e limitações (preencher a matriz em `04_dados_fontes.md`).
- [ ] Definir a região/campus do piloto e desenhar **2–3 trajetos reais** para testar a disponibilidade dos dados.
- [ ] Realizar entrevistas com estudantes do período noturno e potenciais parceiros universitários.
- [ ] Produzir uma **primeira metodologia simples e transparente** de comparação, sem pesos arbitrários ou rótulos absolutos.
- [ ] Benchmarking funcional atualizado: Google Maps, Waze, Moovit, Citizen e iniciativas relacionadas (Onde Fui Roubado).
- [ ] Revisar persona, modelo B2B2C e hipóteses de disposição a pagar.
- [ ] Atualizar slides: problema, Big Numbers, dados, metodologia, ética, diferencial, público, sustentabilidade.
- [ ] Definir responsáveis e prazos para cada ação acima em reunião do grupo.

## 5. Mapeamento projeto × GS (subsídio para a entrega de 19/11)

| Entrega FIAP | O que o VoltaSegura fornece | Status |
|---|---|---|
| SOA (backend) | API de rotas, comparação e exposição estimada | `[HIPÓTESE arquitetural]` |
| C#/.NET | Backend principal (POO, EF Core, Web API) | decidir sobreposição com SOA |
| IA & ML | **Entrega pronta**: notebook executado com dados reais SSP-SP + Infosiga (27 combinações, CV só no treino, R² teste 0,61; contraprova honesta) + `RELATORIO_ML.md` | ✅ notebook executado — falta vídeo do pitch |
| Mobile/Expo | App do estudante noturno: jornada ida → volta | aderência à Fase 1 do roadmap |
| Operating Systems | Host Linux da aplicação web (provisionamento automatizado) | n/a — execução |
| Physical Computing | Circuito ESP32 com valor para a solução (ex.: sensor de ambiente/parada) | integração a definir |
| Testing/QA | Features do MVP (Fase 1 do roadmap) + test cases de aceitação | requisitos a derivar do fluxo "Planejar–Analisar–Comparar–Decidir–Revisar" |
| Cybersecurity | Regras PII/LGPD, Taint Analysis sobre localização, indicador "Risco Cidadão" | alinhado aos princípios de privacidade |

## 6. Histórico de atualizações

| Data | Versão | Mudança | Evidência | Responsável |
|---|---|---|---|---|
| 09/11/2026 | 0.1 | Consolidação da ideia original, feedback do professor, novo posicionamento, público inicial, metodologia proposta, fontes de dados, riscos éticos, concorrência, modelo de negócio, roadmap e plano de validação | Documento Vivo original | grupo |
| 10/11/2026 | 0.2 | Conversão para base de conhecimento em markdown para agentes (`docs/`); **renomeação do produto: CitizenTech → VoltaSegura** (motivo: evitar conflito com o app "Citizen" e com o nome do tema da GS; por decisão do grupo) | docx v0.1 + pdf briefing + decisão do grupo | (preencher) |
| 10/11/2026 | 0.3 | **Logo v1 (2 rascunhos)**: conceito "V formado por rota com pino", paleta preto/laranja, exclusões éticas (sem escudo/cadeado — `docs/05`); prompts versionados em `design/prompts/`; geração via OpenRouter Image API registrada em `prompts.md` | `design/`, `prompts.md` | assistente + grupo |

> Próximas versões: registrar data, mudança realizada, motivo, evidência utilizada, decisão tomada e responsável. Não apagar decisões antigas sem registrar o que mudou e por quê.
