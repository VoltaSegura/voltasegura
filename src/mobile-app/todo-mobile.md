# TODO Mobile — VoltaSegura

Painel de status do desenvolvimento do app (disciplina **Mobile Development & IoT**). Entrega: **19/11/2026, 23h55**, com o link do repositório no Teams.

**Última atualização:** 14/11/2026

## Como usar este arquivo

- **Escopo:** detalha a tarefa **T07** do `TODO.md` da raiz do monorepo. O `TODO.md` guarda o resumo e aponta para cá. Quando um bloco daqui mudar de status, atualizar também a linha da T07.
- **Fontes:** entregas e critérios da FIAP em `docs/02` §5; funcionalidades e telas em `docs/app-map/` (FN, TL, PL e D são os IDs de lá, não renumerar); ordem de construção em `docs/plano_app.md` §5 e §6.
- **Status:** `CONCLUÍDO` · `EM DESENVOLVIMENTO` · `PENDENTE` · `BLOQUEADO` (depende de algo fora do app). A marca **Depende do tempo** indica o que pode ser cortado se o prazo apertar (D-22).
- **Regras:** não marcar `CONCLUÍDO` sem evidência (arquivo, commit, print). Não inventar responsável nem prazo: escrever `a definir`. Atualizar o painel e o **Histórico** sempre que algo mudar.
- **Pronto de uma funcionalidade:** a tela segue a especificação `pronta` de `docs/app-map/04_telas/`, os textos são os de `08_microcopy.md`, funciona no modo mock, a checklist de acessibilidade da tela está marcada e os testes previstos em `10_rastreabilidade.md` passam.

## Painel de progresso

| Bloco | Feito | Total | Progresso |
|---|---|---|---|
| 1. Entregas da disciplina | 1 | 8 | ▓░░░░░░░░░ 13% |
| 2. Infraestrutura do app | 12 | 17 | ▓▓▓▓▓▓▓░░░ 71% |
| 3. Funcionalidades do MVP (FN-01 a FN-14) | 0 | 14 | ░░░░░░░░░░ 0% |
| 3b. Depende do tempo (FN-15, FN-16) | 0 | 2 | ░░░░░░░░░░ 0% |
| 4. Telas implementadas (TL-01 a TL-15) | 13 | 15 | ▓▓▓▓▓▓▓▓▓░ 87% (TL-14 e TL-15, "Depende do tempo", seguem com tela provisória) |
| 5. Fixtures do mock | 11 | 11 | ▓▓▓▓▓▓▓▓▓▓ 100% |
| 6. Requisitos não funcionais verificados | 0 | 9 | ░░░░░░░░░░ 0% |

**Fase atual (14/11):** as 13 telas do MVP estão reais (TL-01 a TL-13), do login ao resultado, detalhes e "por que esta rota?". Componentes do resultado e mapa prontos (sem a `CenaRotaAcesa`). 300 testes. **Próximo:** conferir a jornada rodando (celular e navegador), decidir a FN-13, aprovar o design (PL-19), cobrir a acessibilidade por tela e o que sobrou do README (prints, vídeo, Ficha) e do sync. TL-14 e TL-15 só se o prazo permitir (D-22).

---

## 1. Entregas da disciplina (`docs/02` §5)

### 1.1 Entregáveis

| # | Entregável | Status | Evidência / o que falta |
|---|---|---|---|
| E-01 | Repositório GitHub com o código organizado (espelho `VoltaSegura/mobile-app`) | PENDENTE | O código existe só no monorepo (`src/mobile-app/`). Falta o sync: `DRY_RUN=1 bash scripts/sync_mirrors.sh mobile-app` e depois o real |
| E-02 | README com a **Ficha da CitizenTech** preenchida com os dados do VoltaSegura, **copiada no corpo** | CONCLUÍDO | Ficha completa em `src/mobile-app/README.md` e no README local do espelho; `sync_mirrors.sh` preserva a versão completa no próximo sync |
| E-03 | README com instruções para rodar o app | CONCLUÍDO | `src/mobile-app/README.md`, seção "Como rodar" revista em 14/11 para modo mock, Neon Auth e limitações atuais |
| E-04 | README com prints das telas | PENDENTE | Depende das telas reais (bloco 4). Sugestão: uma pasta `docs/prints/` no app com o fluxo TL-01 → TL-11 e as variantes do resultado |
| E-05 | Link de vídeo de **até 3 min** com o app rodando | PENDENTE | O roteiro (`docs/app-map/11_roteiro_demo.md`) foi adiado pela D-18. Gravar com o código congelado (quarta à noite) |
| E-06 | Registro de uso de IA no `prompts.md` **do espelho** | EM DESENVOLVIMENTO | Registros retrospectivos do handoff e da retomada incluídos no monorepo e no espelho em 14/11; conferir completude antes da entrega |
| E-07 | `ARQUITETURA.md` (documentação técnica, plano §5.1) | EM DESENVOLVIMENTO | Criado no esqueleto (13/11). Atualizar a cada fatia |
| E-08 | Envio do link do repositório na tarefa do Teams (um integrante) | PENDENTE | Até 19/11, 23h55, com folga. Responsável pelo envio: a definir |

### 1.2 Critérios de avaliação

A FIAP avalia em 6 critérios. **Os pesos estão `[EM ABERTO]`**: a rubrica completa está na tarefa do Teams e ainda não foi copiada para `docs/02`.

| Critério | O que conta como evidência neste app | Blocos | Status |
|---|---|---|---|
| Telas e navegação | Telas TL-01 a TL-13 conforme as especificações; navegação de `05_navegacao.md` (pilha, modais, guarda de sessão, voltar) | 2, 4 | EM DESENVOLVIMENTO (navegação provisória pronta) |
| Consumo de dados | Camada `services/` no modo `mock` com as fixtures e no modo `api` com o backend real (FN-07) | 2, 3, 5 | EM DESENVOLVIMENTO (camada e 11 fixtures prontas em 14/11; nenhuma tela consome ainda; modo `api` depende da PL-18) |
| Banco de dados | **Neon (Postgres + Neon Auth), D-24 (14/11):** contas e sessão no Neon Auth; o app não conecta no Postgres. O SQLite local saiu (a rubrica pede "salvar em banco de dados", sem exigir banco no aparelho, `docs/02` §5). Histórico e locais salvos (FN-13): `[EM ABERTO]` | 2, 3 | EM DESENVOLVIMENTO (Neon Auth provado de ponta a ponta no servidor, branch `dev`; falta tela, teste no celular e a decisão da FN-13) |
| Acessibilidade | Checklist por tela de `07_design/acessibilidade.md`, contraste dos tokens, alvo de 48 dp, fonte a 200%, leitor de tela no fluxo TL-04 → TL-09 | 4, 6 | PENDENTE (tokens com contraste calculado já no código) |
| Aderência ao problema | Jornada ida e volta do estudante noturno; comparação com exposição estimada e confiança dos dados; linguagem do `docs/05` | 3, 6 | PENDENTE |
| Documentação | README (Ficha, como rodar, prints, vídeo) + `ARQUITETURA.md` | 1 | EM DESENVOLVIMENTO |

---

## 2. Infraestrutura do app (plano §5.1 e §5.2)

| # | Item | Status | Evidência / observação |
|---|---|---|---|
| I-01 | Projeto Expo SDK 58 + TypeScript (strict) + Expo Router | CONCLUÍDO | `package.json`, `app.json` (13/11) |
| I-02 | Árvore de rotas de `05_navegacao.md` com telas provisórias e guarda de sessão (`Stack.Protected`) | CONCLUÍDO | `src/app/` (13/11). Rotas em `src/app/` e não em `app/`, anotado no `05_navegacao.md` |
| I-03 | Tokens de design (`07_design/tokens.md`) e `useTema()` com tema escuro padrão | CONCLUÍDO | `src/theme/` (13/11) |
| I-04 | Configuração `mock\|api` por `EXPO_PUBLIC_API_MODE` e `.env.example` | CONCLUÍDO | `src/config/ambiente.ts` (13/11) |
| I-05 | ESLint (`eslint-config-expo`), typecheck e `expo-doctor` passando | CONCLUÍDO | 13/11: lint e `tsc` sem erros, `expo-doctor` 18/18, `expo export` Android e web compilam. 14/11: `npm audit` de 30 para 9 vulnerabilidades (só baixas, do `deepmerge`, sem correção publicada) com `overrides` de `glob` e `minimatch`; `expo-doctor` 20/20 e exportação Android e web ok |
| I-06 | `ARQUITETURA.md` inicial | CONCLUÍDO | `src/mobile-app/ARQUITETURA.md` (13/11) |
| I-07 | Node.js 22.13+ na máquina e app vazio aberto no celular pelo Expo Go | EM DESENVOLVIMENTO | 13/11: o `node` da máquina já é a v26.13.1 (atualizado). Falta abrir o app no celular pelo Expo Go |
| I-08 | Camada `services/` com interface única (conta, consulta, compartilhamento) e troca `mock\|api` | CONCLUÍDO | `src/services/` (`consulta`, `conta`, `contaNeonAuth`, `erros`, `http`, `token`), troca por `ambiente.modoApi`; testes passando em 14/11. O contrato segue `[HIPÓTESE]` até a PL-18. Compartilhamento (FN-15, FN-16) fica fora por ora |
| I-09 | Fixtures do mock, uma por caso do FL-07, com `exemplo: true` | CONCLUÍDO | 11 fixtures em `src/services/fixtures/` com testes de coerência (focos, tempos, horários, taxas) em `fixtures.test.ts` (14/11). Os casos que o contrato não fecha (`uma_rota`, `outra_opcao`, `sem_servico`, `indisponivel`) estão como `[HIPÓTESE]` |
| I-10 | Sessão no `expo-secure-store` (substitui a sessão provisória em memória) | CONCLUÍDO | `src/sessao/` (SecureStore, expiração, JSON inválido vira "sem sessão"). Os botões provisórios das telas seguem funcionando. Não testado na web nem no celular |
| I-11 | Banco local `expo-sqlite` com as tabelas da FN-13 (`preferencias`, `locais_salvos`, `historico`) | BLOQUEADO | **Revisto pela D-24 (14/11):** o SQLite saiu do app. A FN-13 (histórico e locais salvos, só no aparelho: US-04 AC4 e DT-08) está `[EM ABERTO]`: falta decidir onde guardar. O `expo-sqlite` segue instalado até lá |
| I-12 | Componentes base de `07_design/componentes.md` (estrutura, ações, entradas, resultado, feedback) | EM DESENVOLVIMENTO | 14/11: `src/components/` (14 componentes base), `src/components/planejar/` (`CampoPonto`, `SeletorHorario`), `src/components/mapa/` (`MapaPonto` e `MapaResultado`, nativos e web, pontos de exemplo, decodificador de polyline) e `src/components/resultado/` (`SeloLinha`, `SequenciaModos`, `RotuloFoco`, `CardRota`, `LinhaSobreOsDados`, `BotaoPorQue`, `ItemTrecho`, `ListaTrechos`, `PainelResultado`, `Indicativo`, `TabelaNumeros`, `LinhaCategoria`). Importe as subpastas por caminho próprio (não passam pelo índice: importam dele, e reexportar criaria ciclo). Faltam `CenaRotaAcesa` (sem biblioteca de desenho instalada), `Folha` e `DialogoConfirmacao`. As cores das linhas e as medidas ausentes dos tokens estão em `medidas.ts` (migrar na aprovação do PL-19) |
| I-13 | Textos centralizados a partir de `08_microcopy.md` | CONCLUÍDO | `src/textos/` (16 módulos). Conferência contra o catálogo: 264 strings, 0 divergências. `resultado.sequencia_leitura` está em `src/textos/hipoteses.ts` como `[HIPÓTESE]` (regra de caixa tirada do único exemplo do catálogo); o anúncio numerado dos trechos não existe no catálogo |
| I-14 | Testes com `jest-expo` + React Native Testing Library | CONCLUÍDO | `npx jest --runInBand --silent`: 312 testes em 24 suítes (14/11), incluindo regressões de validação, rótulos, unidades e período; `tsc`, `eslint`, exportações web/Android e Expo Doctor 20/20 passaram |
| I-15 | Teste automático que varre os textos do app contra os termos proibidos do `docs/05` | CONCLUÍDO | `src/__tests__/linguagem.test.ts` (27 testes, varre `src/**`, 0 violações em 14/11). Limite: heurística sem AST, não pega concatenação como `"rota " + "segura"`. Cobre RNF-01 e RNF-09 (T-R01, T-R09) |
| I-16 | Sync com o espelho conferido (`DRY_RUN` e real) | PENDENTE | O plano recomenda um `DRY_RUN` cedo, já com o esqueleto |
| I-17 | Neon (Postgres + Neon Auth) para contas e login, D-24 | EM DESENVOLVIMENTO | `neon.ts`, `src/services/contaNeonAuth.ts`, `scripts/e2e-neon-auth.mjs` (12 de 12 verificações contra a branch `dev`, 14/11). Falta: telas de conta, teste no celular (cabeçalho `Origin` e cookie de sessão no React Native não verificados), cadastrar o domínio confiável de produção e a decisão da FN-13 |

---

## 3. Funcionalidades (`docs/app-map/06_funcionalidades.md`)

Fatias de construção do plano §5.3: **F1** conta → planejar → alternativas (mock) · **F2** comparação com todas as variantes, "Sobre os dados", detalhes e fontes · **F3** histórico local, configurações, exclusão, GPS e escolha de ponto, ida e volta, API real · **F4** acessibilidade, varredura, testes e README.

| FN | Funcionalidade | Telas | Histórias | Fatia | Depende de | Status |
|---|---|---|---|---|---|---|
| FN-01 | Cadastro com aviso de privacidade | TL-02, TL-13 | US-01 AC1–AC6 | F1 | Endpoint de conta (PL-05); Google opcional (PL-06); regras de senha em aberto (PL-07) | PENDENTE |
| FN-02 | Login, sessão e saída | TL-01, TL-03, TL-12 | US-02 AC1–AC3 | F1 | Endpoint de sessão (PL-05); I-10 | PENDENTE (guarda de sessão provisória pronta) |
| FN-03 | Excluir conta | TL-12 | US-03 AC1–AC3 | F3 | Endpoint de conta (PL-05) | ADIADO (D-25, 14/11): fora do MVP por ora; o Neon Auth gerenciado não oferece exclusão |
| FN-04 | Escolher ponto (GPS, mapa, local salvo, exemplo) | TL-04, TL-05 | US-05 AC1–AC3, US-06 | F3 | `expo-location`, `react-native-maps`; nome do ponto (PL-09); tiles externos (PL-03) | PENDENTE |
| FN-05 | Planejar e validar a consulta | TL-04 | US-06 AC1–AC4 | F1 | Limite do município sem serviço externo (PL-11) | PENDENTE |
| FN-06 | Planejar a volta | TL-04, TL-07, TL-08 | US-07 AC1–AC2 | F3 | FN-05 | PENDENTE |
| FN-07 | Buscar alternativas e focos | TL-06, TL-07 | US-08 AC1–AC4, US-11 | F1 (mock) / F3 (API) | I-08, I-09; endpoint de consulta (PL-18) | PENDENTE |
| FN-08 | Exibir o resultado (mapa + container, prioridade da menor exposição estimada) | TL-07 | US-08, US-11 AC5, US-13 | F1 (básico) / F2 (variantes) | FN-07; D-01, D-09, D-23 | PENDENTE |
| FN-09 | Detalhes da rota (passo a passo, só leitura) | TL-08 | US-09 AC1 | F2 | FN-07; D-04 | PENDENTE |
| FN-10 | Por que esta rota? (só trechos a pé) | TL-09 | US-10, US-11 AC1–AC4, US-12 | F2 | FN-07; D-08, D-11, D-13 | PENDENTE |
| FN-11 | Sobre os dados e Dados considerados | TL-10, TL-11 | US-14, US-15, US-16, US-18 AC3 | F2 | FN-07; D-14 | PENDENTE |
| FN-12 | Aviso de privacidade (minuta acadêmica, sem afirmar LGPD) | TL-13 | US-01 AC6, RNF-09 | F1 | — | PENDENTE |
| FN-13 | Histórico local e locais salvos | TL-04, TL-05, TL-12 | US-04 AC1–AC4 | F3 | I-11 | PENDENTE |
| FN-14 | Erros globais e sem rede | TL-02, TL-03, TL-04, TL-06, TL-12 | FL-13 | F3 | Comportamento offline em aberto (PL-12) | PENDENTE |

### 3b. Depende do tempo (D-22: construir por último; se o prazo apertar, fica para depois sem afetar o resto)

| FN | Funcionalidade | Telas | Histórias | Depende de | Status |
|---|---|---|---|---|---|
| FN-15 | Compartilhar minha volta (rota + localização ao vivo) | TL-08, TL-14, indicador global | US-21 AC1–AC5, AC7, AC9 | GPS em segundo plano no Expo Go (PL-24); endpoint (PL-18); PL-20 a PL-22; revisão das telas TL-14 e TL-15 | PENDENTE |
| FN-16 | Acompanhar viagem (link temporário) | TL-15 | US-21 AC6–AC8 | FN-15; deep link `voltasegura://acompanhar/<token>` (scheme já configurado); PL-23 | PENDENTE |

---

## 4. Telas (`docs/app-map/04_telas/`)

"Rota" = a rota do Expo Router existe com tela provisória. "Tela real" = implementada conforme a especificação. "A11y" = checklist da tela em `07_design/acessibilidade.md` toda marcada.

| Tela | Nome | Especificação | Rota | Tela real | A11y |
|---|---|---|---|---|---|
| TL-01 | Abertura | pronta | ✅ | ✅ | ⬜ |
| TL-02 | Criar conta | pronta | ✅ | ✅ | ⬜ |
| TL-03 | Entrar | pronta | ✅ | ✅ | ⬜ |
| TL-04 | Planejar | pronta | ✅ | ✅ | ⬜ |
| TL-05 | Escolher ponto no mapa (modal) | pronta | ✅ | ✅ | ⬜ |
| TL-06 | Buscando e avisos | pronta | ✅ | ✅ | ⬜ |
| TL-07 | Resultado (mapa + container) | pronta (D-23) | ✅ | ✅ | ⬜ |
| TL-08 | Detalhes da rota (trechos) | pronta | ✅ | ✅ | ⬜ |
| TL-09 | Por que esta rota? (modal) | pronta | ✅ | ✅ | ⬜ |
| TL-10 | Sobre os dados | pronta | ✅ | ✅ | ⬜ |
| TL-11 | Dados considerados | pronta | ✅ | ✅ | ⬜ |
| TL-12 | Configurações | pronta | ✅ | ✅ | ⬜ |
| TL-13 | Aviso de privacidade | pronta | ✅ | ✅ | ⬜ |
| TL-14 | Compartilhar minha volta (Depende do tempo) | **rascunho**, aguarda revisão | ✅ | ⬜ | ⬜ |
| TL-15 | Acompanhar viagem (Depende do tempo) | **rascunho**, aguarda revisão | ✅ | ⬜ | ⬜ |

---

## 5. Fixtures do mock (FN-07, `10_rastreabilidade.md`)

Cada fixture traz `exemplo: true`, e as telas mostram o selo `EXEMPLO` (RNF-08).

- [x] `conclusivo`: uma rota recebe o foco de menor exposição estimada (vem primeiro e já selecionada, D-23)
- [x] `sem_diferenca`: sem foco de exposição, ordem por tempo
- [x] `mistos`: mesmo indicativo de "sem diferença clara" (D-11)
- [x] `insuficiente_amostra`
- [x] `insuficiente_cobertura`
- [x] `insuficiente_largura`
- [x] `nao_aplicavel`: alguma candidata sem trecho a pé, `L = 0` (D-13)
- [x] `uma_rota`: só uma candidata
- [x] `outra_opcao`: os focos dão uma rota só, e o app mostra a segunda mais rápida (D-16)
- [x] `sem_servico`: sem transporte público no horário (US-08 AC2)
- [x] `indisponivel`: serviço fora do ar (FL-13)

---

## 6. Requisitos não funcionais no app (`docs/10` §7, testes em `10_rastreabilidade.md`)

| RNF | Requisito | Como verificar no app | Status |
|---|---|---|---|
| RNF-01 | Linguagem: "exposição estimada", sempre comparativa; nada de "rota segura" ou "por segurança" | T-R01: varredura automática dos textos (I-15) | PENDENTE |
| RNF-02 | Não rotular bairros nem territórios | T-R02: nenhum texto ou camada nomeia bairro com qualificação | PENDENTE |
| RNF-03 | Ausência de registro nunca vira vantagem | T-R03 (= T-12.3 + T-10.5) | PENDENTE |
| RNF-04 | Confiança dos dados separada da exposição estimada | T-R04: linha "Sobre os dados" fixa em toda comparação; sem cor de alerta | PENDENTE |
| RNF-05 | Privacidade e minimização | T-R05 (= T-01.1, T-03.1, T-04.4, T-19.2); nenhum log com coordenadas, endereço ou e-mail | PENDENTE |
| RNF-06 | Nenhum texto culpa a usuária | T-R06: revisão dos textos de erro e de resultado | PENDENTE |
| RNF-07 | Acessibilidade | T-R07: checklist por tela + leitor de tela no fluxo TL-04 → TL-09 | PENDENTE |
| RNF-08 | Dados de exemplo rotulados | T-R08: toda fixture mostra "EXEMPLO" em cards e números | PENDENTE |
| RNF-09 | Não afirmar conformidade com a LGPD | T-R09: varredura de "conformidade" e "LGPD" em contexto afirmativo | PENDENTE |

---

## 7. Pendências que afetam o app (`docs/app-map/12_pendencias_e_lacunas.md`)

| PL | Assunto | Bloqueia | Status |
|---|---|---|---|
| PL-18 | Conciliar o contrato da API esperado pelo app com o backend | Modo `api` (FN-01 a FN-03, FN-07, FN-15, FN-16) | ABERTA |
| PL-05 | Endpoints de conta no backend (cadastro, login, exclusão) | FN-01 e FN-02 no modo `api` | ABERTA, em parte atendida: cadastro e login pelo Neon Auth (D-24, 14/11); exclusão fora do MVP (D-25) |
| D-24 | Onde ficam histórico e locais salvos (FN-13), já que o SQLite saiu | FN-13, TL-04, TL-05, TL-12 | `[EM ABERTO]` (US-04 AC4 e DT-08 pedem só no aparelho) |
| D-24 | Neon Auth no React Native: cabeçalho `Origin`, leitura do `Set-Cookie` e `expo-secure-store` na web não foram verificados; domínio confiável de produção a cadastrar | FN-01, FN-02 | ABERTA (precisa de teste no celular) |
| PL-19 | Revisão de design (skill `frontend-design`, R-01 a R-15 em `tokens.md`) | Estilo das telas (I-12); serviços e banco não dependem | PROPOSTA (aguarda a aprovação visual) |
| PL-25 | Mapa base (Google/Apple no Expo Go × tiles OSM) e texto da atribuição | `MapaTrajeto`, `Atribuicao`, aviso de privacidade | ABERTA |
| PL-11 | "Fora do município" sem serviço externo (polígono embarcado?) | FN-05 | ABERTA |
| PL-09 | Nome exibido de um ponto escolhido no mapa | FN-04 | ABERTA |
| PL-06 | "Entrar com Google" fora do Expo Go | FN-01 (opcional na demo) | ABERTA |
| PL-07 | Regras de senha | FN-01 (valida só senha vazia) | ABERTA |
| PL-12 | Comportamento sem rede | FN-14 | ABERTA |
| PL-03 | Tiles do mapa são requisição externa | FN-04, aviso de privacidade | ABERTA |
| PL-24 | GPS em segundo plano no Expo Go | FN-15 | ABERTA |
| PL-20 a PL-23 | Tempo máximo, frequência, chegada e login do contato no compartilhamento | FN-15, FN-16 | ABERTA |
| PL-10 | Copiar `docs/app-map/` para o espelho (D-07) | Documentação no espelho | ABERTA |

---

## 8. Cronograma (plano §6)

| Dia | Meta | Situação |
|---|---|---|
| Sex 13/11 | Esqueleto, serviços mock, contrato da API | Esqueleto ✅; serviços e contrato pendentes |
| Sáb 14/11 | Banco local, `ARQUITETURA.md`, app vazio rodando no celular | `ARQUITETURA.md` atualizado ✅; serviços, sessão, textos, componentes base, estado da consulta e Neon Auth ✅; banco local cancelado (D-24); app no celular pendente |
| Dom 15/11 | Fatia 1 | — |
| Seg 16/11 | Fatia 2 | — |
| Ter 17/11 | Fatia 3 (integração com a API real) | — |
| Qua 18/11 | Fatia 4; **congelar o código à noite** | — |
| Qui 19/11 | Prints, README, vídeo, envio com folga antes de 23h55 | — |

---

## 9. Experiência de uso (achados do teste no celular, 14/11/2026)

Quem testou no Expo Go viu o mapa, mas relatou: não sabe como selecionar os caminhos, o trajeto não aparece no mapa, não entende os caminhos mostrados e acha que nenhum dado vem de lugar nenhum. Isso não estava no painel; passa a estar aqui.

| # | Item | Status | Evidência / observação |
|---|---|---|---|
| U-01 | TL-07: tocar no card só **seleciona**; os detalhes abrem pelo "›" (spec de `TL-07_resultado.md`, tabela de ações) | EM DESENVOLVIMENTO | Hoje o card abre os detalhes direto e não há o "›" |
| U-02 | Trajeto visível no mapa no modo mock: fixtures com polyline válida, ajustada aos pontos que a pessoa escolheu | EM DESENVOLVIMENTO | As geometrias das fixtures eram texto de exemplo; o mapa ignora geometria inválida |
| U-03 | Mapa do resultado com marcadores de origem e destino e enquadrando a rota selecionada | EM DESENVOLVIMENTO | |
| U-04 | TL-05: centralizar no GPS depois de "Usar minha localização", marcador do ponto escolhido, abrir no ponto já escolhido, exemplos com rótulo claro | EM DESENVOLVIMENTO | Hoje só aparece um texto e o mapa não se mexe |
| U-05 | Dicas curtas de uso (como selecionar, o que é o "›") | PENDENTE | Textos novos entram como `[HIPÓTESE]` em `src/textos/hipotesesResultado.ts` e `hipotesesPonto.ts`; o Lucas aprova ou ajusta |
| U-06 | **Dados reais no app (modo `api`)**: adaptador para `POST /api/comparacoes/trajetos` do backend (`VoltaSegura.Servicos`) | PENDENTE | Não casa com o contrato do app (PL-18): o backend compara **2** alternativas (o app espera até 3 com focos), a geometria vem como `[[lat,lon],...]` (o app espera polyline) e os focos "menor tempo" e "menos caminhada" teriam que vir do backend, porque o app não calcula. Precisa do backend rodando e acessível pelo celular (IP da máquina) e de roteamento (OTP2 ou o simulador do backend). Dono: quem cuida do backend. Fatia 3 do cronograma (17/11) |
| U-07 | Teste de uso com 1 ou 2 pessoas do público (estudante do período noturno) antes do vídeo | PENDENTE | Responsável: a definir |
| U-08 | Mapa na web (Leaflet com tiles do OpenStreetMap) | ADIADO | O teste é no celular; a web segue sem mapa. Se voltar: PL-25, opção (b), com atribuição "© OpenStreetMap contributors" |
| U-09 | **Redesign** tela por tela e função por função, a partir do guia (`docs/redesign/`) | PLANEJADO | 5 planos e a síntese `06_sintese_e_prioridades.md` (14/11). Nada implementado. Onda 1 (sem decisão sua) pode começar; ondas 2 e 3 dependem de aprovação de texto, do PL-19 e de teste em celular. Esforço do plano mínimo: 13 a 20 h |

---

## Histórico

| Data | Mudança | Responsável |
|---|---|---|
| 13/11/2026 | Criação do painel: entregas da disciplina, infraestrutura (esqueleto concluído), FN-01 a FN-16, TL-01 a TL-15, fixtures, RNF, pendências e cronograma | assistente (a pedido do Lucas) |
| 13/11/2026 | Revisão de design PL-19 aplicada aos documentos e ao mockup (proposta); I-07 em andamento (Node atualizado para v26.13.1); nova PL-25 | assistente (a pedido do Lucas) |
| 14/11/2026 | Serviços (mock, api e Neon Auth), 11 fixtures, sessão no SecureStore, textos centralizados e varredura de linguagem concluídos; componentes base (14) e estado da consulta criados; D-24 (Neon como banco principal; SQLite fora) e D-25 (exclusão de conta adiada); `npm audit` de 30 para 9 | assistente (a pedido do Lucas) |
| 14/11/2026 | 7 telas reais (TL-01, TL-02, TL-03, TL-13, TL-10, TL-11, TL-12) feitas por workers Codex e conferidas pelo lead (tsc, eslint, 232 testes, exportação web e Android); `ConsultaProvider` montado em `(app)/_layout.tsx` e token da sessão ligado aos serviços na raiz. Lacunas: texto para senha curta (`SENHA_CURTA`) não existe no catálogo; logo da TL-01 e botão Google (PL-06) fora; foco no primeiro campo com erro não implementado | assistente (a pedido do Lucas) |
| 14/11/2026 | TL-04, TL-05 e TL-06 (planejar, escolher ponto, buscar) e os componentes do grupo "resultado" feitos por workers Codex e conferidos pelo lead (tsc, eslint, 264 testes, exportação web e Android, `expo-doctor` 20/20); `expo-location` acrescentado ao `app.json`. Lacunas: hora de saída só editável na hora local (sem seletor de data), nome do ponto escolhido é genérico (PL-09), sem estado de conectividade (PL-12), atribuição do mapa a definir (PL-25), "fora do município" sem polígono (PL-11); o aviso de mapa indisponível na web cita locais salvos (FN-13 em aberto); faltam modelos de texto no catálogo para a sequência de modos com minutos a pé e o anúncio numerado dos trechos | assistente (a pedido do Lucas) |
| 14/11/2026 | TL-07 (resultado com mapa), TL-08 (detalhes) e TL-09 (por que esta rota) feitas por workers Codex e conferidas pelo lead (tsc, eslint, 300 testes, exportação web e Android, `expo-doctor` 20/20; varredura: rotas nunca reordenadas, `null` nunca vira zero, sem `console`). Criado `src/textos/hipoteses.ts` (`sequenciaLeitura`, `[HIPÓTESE]`). Lacunas: `CenaRotaAcesa` fora (sem biblioteca de desenho); acesso ao compartilhamento (TL-14) omitido da TL-08; o mapa da TL-08 mostra a rota inteira (não destaca o trecho); a posição do indicativo (TL-07 ou só na TL-09) precisa de confirmação; geometrias das fixtures não são polylines válidas, então o mapa só mostra a linha com dados reais | assistente (a pedido do Lucas) |
| 14/11/2026 | Handoff retomado: corrigida a limpeza dos avisos da TL-04 sem efeito síncrono; testes alinhados ao rótulo visual e à fixture. Passaram `tsc`, `eslint`, 312 testes, exportações web/Android e Expo Doctor 20/20. Celular, acessibilidade e entregáveis ainda pendentes | Codex |
| 14/11/2026 | README mobile recebeu a Ficha completa, instruções atuais e pendências explícitas; o sync preservará o README completo no espelho. E-02 concluída; E-06 em conferência | Codex |
| 14/11/2026 | Teste no celular (Expo Go): o mapa aparece, mas a experiência de uso tem lacunas. Criado o bloco 9 (U-01 a U-08); onda com 3 workers Codex para U-01 a U-04. Dados reais (U-06) ficam depois, dependem do backend | assistente (a pedido do Lucas) |
| 14/11/2026 | Redesign planejado: 5 analistas (Codex) leram o guia e o app e escreveram os planos em `docs/redesign/`; síntese e decisões em `06_sintese_e_prioridades.md`. Achados confirmados pelo lead: aviso de privacidade fala de exclusão de conta que não existe; painel do resultado não expande; cancelar a busca não aborta a requisição. Registrado como U-09 | assistente (a pedido do Lucas) |

## Bloco 10 · Redesign 2 (D-29, 14/11/2026)
- [x] Home sem Ida/Volta; origem/destino com inverter; lugares salvos em cartões
- [x] TL-05 em tela cheia: busca por texto, localização, pino central, salvar lugar, chips
- [x] Lugares salvos só no aparelho (SecureStore), limite 10, apagar em Configurações
- [x] Imagens com reserva (`theme/imagens.ts`, `assets/imagens/LEIA-ME.md`) em TL-01, TL-02, TL-03 e home
- [x] Configurações em grupos; testes: 395 em 32 suítes
- [ ] **Lucas:** informar as imagens reais (ver `assets/imagens/LEIA-ME.md`)
- [ ] **Lucas:** testar no celular (busca por texto depende do geocodificador do Android) e revisar os textos `[HIPÓTESE]` de `textos/hipotesesMapa.ts`
- [ ] Citar a busca por texto no aviso de privacidade (TL-13) `[HIPÓTESE]`
- [ ] Renomear lugar na interface; histórico de trajetos (FN-13) `[EM ABERTO]`
- [ ] Barra inferior em pílula, se virar seções `[EM ABERTO]`
