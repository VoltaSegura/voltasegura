# TODO Mobile — VoltaSegura

Painel de status do desenvolvimento do app (disciplina **Mobile Development & IoT**). Entrega: **19/11/2026, 23h55**, com o link do repositório no Teams.

**Última atualização:** 13/11/2026

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
| 2. Infraestrutura do app | 6 | 16 | ▓▓▓▓░░░░░░ 38% |
| 3. Funcionalidades do MVP (FN-01 a FN-14) | 0 | 14 | ░░░░░░░░░░ 0% |
| 3b. Depende do tempo (FN-15, FN-16) | 0 | 2 | ░░░░░░░░░░ 0% |
| 4. Telas implementadas (TL-01 a TL-15) | 0 | 15 | ░░░░░░░░░░ 0% (15/15 com rota provisória) |
| 5. Fixtures do mock | 0 | 11 | ░░░░░░░░░░ 0% |
| 6. Requisitos não funcionais verificados | 0 | 9 | ░░░░░░░░░░ 0% |

**Fase atual:** esqueleto pronto (plano §5.1). **Próximo:** Node 22.13+, camada de serviços com fixtures, sessão e banco local; depois a Fatia 1.

---

## 1. Entregas da disciplina (`docs/02` §5)

### 1.1 Entregáveis

| # | Entregável | Status | Evidência / o que falta |
|---|---|---|---|
| E-01 | Repositório GitHub com o código organizado (espelho `VoltaSegura/mobile-app`) | PENDENTE | O código existe só no monorepo (`src/mobile-app/`). Falta o sync: `DRY_RUN=1 bash scripts/sync_mirrors.sh mobile-app` e depois o real |
| E-02 | README com a **Ficha da CitizenTech** preenchida com os dados do VoltaSegura, **copiada no corpo** | PENDENTE | Hoje o README do espelho é regenerado pelo sync com um **resumo** da Ficha e um link para o monorepo. A Ficha completa está só no `README.md` da raiz do monorepo. Copiar a Ficha completa para `src/mobile-app/README.md` ou ajustar o `regenerate_readme` do sync (decisão do grupo) |
| E-03 | README com instruções para rodar o app | CONCLUÍDO | `src/mobile-app/README.md`, seção "Como rodar" (13/11). Revisar no fim, quando houver modo `api` e banco |
| E-04 | README com prints das telas | PENDENTE | Depende das telas reais (bloco 4). Sugestão: uma pasta `docs/prints/` no app com o fluxo TL-01 → TL-11 e as variantes do resultado |
| E-05 | Link de vídeo de **até 3 min** com o app rodando | PENDENTE | O roteiro (`docs/app-map/11_roteiro_demo.md`) foi adiado pela D-18. Gravar com o código congelado (quarta à noite) |
| E-06 | Registro de uso de IA no `prompts.md` **do espelho** | PENDENTE | O sync **não** copia o `prompts.md`. O do espelho está vazio; copiar as linhas de Mobile do `prompts.md` do monorepo antes da entrega |
| E-07 | `ARQUITETURA.md` (documentação técnica, plano §5.1) | EM DESENVOLVIMENTO | Criado no esqueleto (13/11). Atualizar a cada fatia |
| E-08 | Envio do link do repositório na tarefa do Teams (um integrante) | PENDENTE | Até 19/11, 23h55, com folga. Responsável pelo envio: a definir |

### 1.2 Critérios de avaliação

A FIAP avalia em 6 critérios. **Os pesos estão `[EM ABERTO]`**: a rubrica completa está na tarefa do Teams e ainda não foi copiada para `docs/02`.

| Critério | O que conta como evidência neste app | Blocos | Status |
|---|---|---|---|
| Telas e navegação | Telas TL-01 a TL-13 conforme as especificações; navegação de `05_navegacao.md` (pilha, modais, guarda de sessão, voltar) | 2, 4 | EM DESENVOLVIMENTO (navegação provisória pronta) |
| Consumo de dados | Camada `services/` no modo `mock` com as fixtures e no modo `api` com o backend real (FN-07) | 2, 3, 5 | PENDENTE |
| Banco de dados | `expo-sqlite` com histórico opcional e locais salvos, apagáveis (FN-13) | 2, 3 | PENDENTE |
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
| I-05 | ESLint (`eslint-config-expo`), typecheck e `expo-doctor` passando | CONCLUÍDO | 13/11: lint e `tsc` sem erros, `expo-doctor` 18/18, `expo export` Android e web compilam |
| I-06 | `ARQUITETURA.md` inicial | CONCLUÍDO | `src/mobile-app/ARQUITETURA.md` (13/11) |
| I-07 | Node.js 22.13+ na máquina e app vazio aberto no celular pelo Expo Go | PENDENTE | A máquina tem o Node 20.17 (o Expo roda com aviso, sem suporte). `winget install OpenJS.NodeJS.LTS` |
| I-08 | Camada `services/` com interface única (conta, consulta, compartilhamento) e troca `mock\|api` | PENDENTE | Segue o contrato `[HIPÓTESE]` de `06_funcionalidades.md` até a conciliação (PL-18) |
| I-09 | Fixtures do mock, uma por caso do FL-07, com `exemplo: true` | PENDENTE | Lista no bloco 5 |
| I-10 | Sessão no `expo-secure-store` (substitui a sessão provisória em memória) | PENDENTE | D-03, FN-02 |
| I-11 | Banco local `expo-sqlite` com as tabelas da FN-13 (`preferencias`, `locais_salvos`, `historico`) | PENDENTE | Nada é sincronizado com o servidor (US-04 AC4) |
| I-12 | Componentes base de `07_design/componentes.md` (estrutura, ações, entradas, resultado, feedback) | PENDENTE | Esperar a revisão de design (PL-19) antes de estilizar |
| I-13 | Textos centralizados a partir de `08_microcopy.md` | PENDENTE | Facilita a varredura de termos (I-15) |
| I-14 | Testes com `jest-expo` + React Native Testing Library | PENDENTE | Os testes previstos estão em `10_rastreabilidade.md` (T-xx.y) |
| I-15 | Teste automático que varre os textos do app contra os termos proibidos do `docs/05` | PENDENTE | Cobre RNF-01 e RNF-09 (T-R01, T-R09) |
| I-16 | Sync com o espelho conferido (`DRY_RUN` e real) | PENDENTE | O plano recomenda um `DRY_RUN` cedo, já com o esqueleto |

---

## 3. Funcionalidades (`docs/app-map/06_funcionalidades.md`)

Fatias de construção do plano §5.3: **F1** conta → planejar → alternativas (mock) · **F2** comparação com todas as variantes, "Sobre os dados", detalhes e fontes · **F3** histórico local, configurações, exclusão, GPS e escolha de ponto, ida e volta, API real · **F4** acessibilidade, varredura, testes e README.

| FN | Funcionalidade | Telas | Histórias | Fatia | Depende de | Status |
|---|---|---|---|---|---|---|
| FN-01 | Cadastro com aviso de privacidade | TL-02, TL-13 | US-01 AC1–AC6 | F1 | Endpoint de conta (PL-05); Google opcional (PL-06); regras de senha em aberto (PL-07) | PENDENTE |
| FN-02 | Login, sessão e saída | TL-01, TL-03, TL-12 | US-02 AC1–AC3 | F1 | Endpoint de sessão (PL-05); I-10 | PENDENTE (guarda de sessão provisória pronta) |
| FN-03 | Excluir conta | TL-12 | US-03 AC1–AC3 | F3 | Endpoint de conta (PL-05) | PENDENTE |
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
| TL-01 | Abertura | pronta | ✅ | ⬜ | ⬜ |
| TL-02 | Criar conta | pronta | ✅ | ⬜ | ⬜ |
| TL-03 | Entrar | pronta | ✅ | ⬜ | ⬜ |
| TL-04 | Planejar | pronta | ✅ | ⬜ | ⬜ |
| TL-05 | Escolher ponto no mapa (modal) | pronta | ✅ | ⬜ | ⬜ |
| TL-06 | Buscando e avisos | pronta | ✅ | ⬜ | ⬜ |
| TL-07 | Resultado (mapa + container) | pronta (D-23) | ✅ | ⬜ | ⬜ |
| TL-08 | Detalhes da rota (trechos) | pronta | ✅ | ⬜ | ⬜ |
| TL-09 | Por que esta rota? (modal) | pronta | ✅ | ⬜ | ⬜ |
| TL-10 | Sobre os dados | pronta | ✅ | ⬜ | ⬜ |
| TL-11 | Dados considerados | pronta | ✅ | ⬜ | ⬜ |
| TL-12 | Configurações | pronta | ✅ | ⬜ | ⬜ |
| TL-13 | Aviso de privacidade | pronta | ✅ | ⬜ | ⬜ |
| TL-14 | Compartilhar minha volta (Depende do tempo) | **rascunho**, aguarda revisão | ✅ | ⬜ | ⬜ |
| TL-15 | Acompanhar viagem (Depende do tempo) | **rascunho**, aguarda revisão | ✅ | ⬜ | ⬜ |

---

## 5. Fixtures do mock (FN-07, `10_rastreabilidade.md`)

Cada fixture traz `exemplo: true`, e as telas mostram o selo `EXEMPLO` (RNF-08).

- [ ] `conclusivo`: uma rota recebe o foco de menor exposição estimada (vem primeiro e já selecionada, D-23)
- [ ] `sem_diferenca`: sem foco de exposição, ordem por tempo
- [ ] `mistos`: mesmo indicativo de "sem diferença clara" (D-11)
- [ ] `insuficiente_amostra`
- [ ] `insuficiente_cobertura`
- [ ] `insuficiente_largura`
- [ ] `nao_aplicavel`: alguma candidata sem trecho a pé, `L = 0` (D-13)
- [ ] `uma_rota`: só uma candidata
- [ ] `outra_opcao`: os focos dão uma rota só, e o app mostra a segunda mais rápida (D-16)
- [ ] `sem_servico`: sem transporte público no horário (US-08 AC2)
- [ ] `indisponivel`: serviço fora do ar (FL-13)

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
| PL-05 | Endpoints de conta no backend (cadastro, login, exclusão) | FN-01 a FN-03 no modo `api` (o mock simula) | ABERTA |
| PL-19 | Revisão de pontos de design com o Lucas | Estilo das telas (I-12); serviços e banco não dependem | ABERTA |
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
| Sáb 14/11 | Banco local, `ARQUITETURA.md`, app vazio rodando no celular | `ARQUITETURA.md` iniciado ✅ |
| Dom 15/11 | Fatia 1 | — |
| Seg 16/11 | Fatia 2 | — |
| Ter 17/11 | Fatia 3 (integração com a API real) | — |
| Qua 18/11 | Fatia 4; **congelar o código à noite** | — |
| Qui 19/11 | Prints, README, vídeo, envio com folga antes de 23h55 | — |

---

## Histórico

| Data | Mudança | Responsável |
|---|---|---|
| 13/11/2026 | Criação do painel: entregas da disciplina, infraestrutura (esqueleto concluído), FN-01 a FN-16, TL-01 a TL-15, fixtures, RNF, pendências e cronograma | assistente (a pedido do Lucas) |
