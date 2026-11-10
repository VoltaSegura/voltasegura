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
- [x] **1ª auditoria de fontes (Fase 0, 10/11/2026)**: GeoSampa/IP verificada ao vivo (WFS, 662.945 pontos, mensal); SPTrans GTFS vs.Ne podem baixados (1.365 rotas: 1.349 ônibus + 9 Metrô + 7 CPTM; 22.273 paradas; sem login); API Olho Vivo v2.1 documentada (token/free, ~85 s); SSP-SP CC-BY-4.0 no CKAN estadual; Infosiga CC-BY-4.0. Resultados na `docs/04_dados_fontes.md`. Pendências: download manual no site SSP (crawlers bloqueados), histórico Infosiga.
- [x] **Token Olho Vivo validado ao vivo (10/11/2026)**: conta/app criados no portal SPTrans; token em `.env` (`OLHO_VIVO`, fora do git). Autenticação retorna `true` + cookie (detalhe: exige `Content-Length` → body vazio, senão HTTP 411). Endpoints `/Linha/Buscar`, `/Corredor` (singular) e `/Posicao` testados: 1.730 linhas, 4.218 veículos às 04h38, com flag de acessibilidade por veículo (`a`). Verificação reproduzível: `bash scripts/olhovivo_check.sh`. Restam: medir cadência (~85 s) e limites/termos de uso.
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
| IA & ML | Pergunta de ML sobre dados reais de ocorrências/mobilidade (Infosiga, SSP-SP, Metrô SP, SP156, IBGE) | dados a auditar |
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

> Próximas versões: registrar data, mudança realizada, motivo, evidência utilizada, decisão tomada e responsável. Não apagar decisões antigas sem registrar o que mudou e por quê.
