# PRODUCT.md: VoltaSegura (app mobile)

Contexto para qualquer agente de design. Fonte de verdade: `docs/` (em especial `docs/05_regras_linguagem_etica.md`, prioridade máxima) e `docs/app-map/`.

## Produto
App para quem volta para casa à noite em São Paulo (estudante, celular na mão, pouca luz, às vezes em movimento). Compara de 2 a 3 trajetos de transporte público e mostra a **exposição estimada** a ocorrências de furto e roubo perto dos trechos a pé, com a **confiança dos dados** separada. O trabalho da tela principal é comparar trajetos em poucos segundos. O app **não escolhe pela pessoa**.

## Linguagem (inegociável)
"Exposição estimada", "menor exposição estimada entre as alternativas avaliadas". Nunca "rota segura", "perigoso", "área de risco", nota, estrela, semáforo ou cor de alerta em rota/trecho. A cor nunca carrega significado sozinha. Dado de exemplo sempre com o selo EXEMPLO.

## Visual identity
Objetivo: experiência premium com identidade visual própria e reconhecível.
Convenções de plataforma (HIG / Material 3) valem para interação, navegação e acessibilidade, não para a estética.
Marca v10 (D-06): marinho `#0D1B2A`, dourado `#FFC53D`, off-white `#F8F9FA`; ciano `#4ECDC4` é cor de dados. Conceito herdado: **"rota acesa"** (só a rota selecionada acende). O premium evolui este conceito.
O visual da rodada anterior (fonte do sistema, linhas de lista simples, `docs/app-map/07_design/tokens.md` v. de 13/11) é a versão antiga e será substituído por `DESIGN.md`.
O backup do código antes do premium está em `../../../backup-pre-premium-2026-11-14` (fora do repositório).

## Limites
Expo SDK 58, Expo Go (sem build nativo próprio), iOS, Android e web. Sem commit sem o Lucas pedir. Acessibilidade: contraste WCAG (4,5:1 texto, 3:1 elementos), toque mínimo 48 dp, fonte a 200%, "reduzir movimento".
