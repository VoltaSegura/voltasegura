# Redesign do app: síntese e prioridades

**Data:** 14/11/2026 · **Origem:** 5 análises em `docs/redesign/01` a `05` (feitas por workers Codex) sobre o guia `00_guia_original.md`, mais conferência do lead.
**Status:** `[HIPÓTESE]` tudo aqui é **proposta**. Nada foi implementado. Nenhuma ferramenta do guia foi instalada. Entrega: **19/11/2026, 23h55**; código congelado na **noite de 18/11**.

## 1. Como o guia deve ser usado
O guia é um **processo** (tela por tela, estados, áreas de toque, "reduzir movimento", checklist da seção 8), não uma lista de pacotes a instalar. Recomendação do plano `05`, com a qual concordo:

| Ferramenta do guia | Veredito `[HIPÓTESE]` | Por quê |
|---|---|---|
| Impeccable (critique, audit, shape, typeset...) | **ADAPTAR** | Usar o vocabulário e a revisão por leitura. Instalar escreveria `PRODUCT.md`/`DESIGN.md` paralelos a `docs/`. |
| Expo `building-native-ui`, Callstack `react-native-best-practices` | **ADAPTAR** como referência | Úteis por leitura; aplicar snippets pode trazer Reanimated e exigir build. |
| UI/UX Pro Max | **PULAR até 18/11** | Gera `MASTER.md` que rivalizaria com `docs/app-map/07_design/tokens.md` e pode sugerir paleta e fonte contrárias à marca (D-06). Exige Python. |
| Reacticx, AniUI, CraftReactNative | **PULAR** | Exigem Reanimated/Skia, NativeWind ou Unistyles, nenhum instalado; risco no Expo Go. |
| Taste Skill, React Bits | **PULAR** | São para web/landing page, não servem nas telas nativas. |
| Transitions.dev | **Só referência** | Receitas CSS; recriar com o `Animated` do próprio RN. |

Etapa 2 do guia (`git add -A && git commit` e branch antes de redesenhar) **conflita** com a regra "nada de commit sem o Lucas pedir" e com o estado atual (dezenas de arquivos não commitados). A regra do projeto prevalece; ver decisão 5.

## 2. O que está errado hoje (por impacto)
Marcado como **confirmado** quando o lead conferiu no código; os demais vêm da leitura dos analistas (cada plano cita `arquivo:linha`).

**Conteúdo e regras (corrigir primeiro)**
1. **Aviso de privacidade (TL-13) descreve o que não existe** (confirmado, `src/mobile-app/src/textos/aviso.ts:20-21`): manda "Excluir conta" em Configurações (D-25 retirou), cita o identificador do Google (PL-06, fora) e o compartilhamento (TL-14 não existe). Plano `01`. Texto novo precisa da sua aprovação.
2. **Painel de resultado não expande** (confirmado, `resultado/index.tsx:57,76` e `resultado.tsx:195`): o botão só muda a altura do mapa. Plano `03`.
3. **"Cancelar" a busca** sai da tela e ignora a resposta, mas **não aborta a requisição** (confirmado, `buscando.tsx:29` e `ConsultaContext.tsx:51`). Plano `02`.
4. **Indicativo e "Planejar a volta" na TL-07**: o indicativo precisa variar com a opção selecionada, e o sentido da volta precisa ficar coerente. Plano `03` (não conferido por mim).
5. **Estado `INDISPONIVEL` e geometria ausente** na TL-07/TL-06 não distinguem falha de "sem serviço". Planos `02` e `03`.

**Experiência**
6. **Origem e destino:** falta mostrar *como* escolher e *qual* ponto foi escolhido, confirmação inequívoca ("Usar este ponto") e um estado claro para o mapa indisponível. Plano `02`.
7. **Entender os caminhos:** a TL-07 e a TL-08 precisam ler a sequência real de trechos (embarque, desembarque, onde caminha) e ligar card e traço no mapa. Planos `03` e `04`.
8. **Formulários:** levar o foco ao primeiro campo com erro; mensagem específica por tipo de falha (senha curta, rede, servidor). Plano `01`.

**Transversal (plano `05`)**
9. **Cabeçalhos e "voltar" inconsistentes** entre as telas (cabeçalho do layout vs `Cabecalho` do componente); títulos fixos em layout.
10. **Medidas duplicadas** (`components/medidas.ts` e `components/resultado/medidas.ts`) e tokens que faltam (raio de botão, mapa, movimento). A fonte desenhada (Atkinson) **não está carregada**: o app usa a fonte do sistema.
11. **Acessibilidade nunca foi verificada em aparelho** (checklist sem nenhum item marcado) e o app nunca foi testado em iPhone.

## 3. Decisões que são suas (recomendações dos analistas, consolidadas)
| # | Decisão | Recomendação `[HIPÓTESE]` |
|---|---|---|
| 1 | **PL-19**: aprova o visual do mockup (hierarquia, painel fixo, "rota acesa")? | Aprovar hierarquia e tokens já usados; adiar halo, selos coloridos e cena animada. |
| 2 | Dependências novas antes de 18/11 | **Nenhuma.** Tudo do plano mínimo cabe no React Native atual. |
| 3 | Fonte Atkinson | Fonte do sistema na entrega; Atkinson depois (`expo-font` + pacote da fonte). |
| 4 | Animações | Só feedback curto com `Animated` do RN, respeitando "reduzir movimento"; sem Reanimated, sem cena de 1,6 s. |
| 5 | Branch e commits | Branch a partir do HEAD atual, commits só de caminhos escolhidos e só quando você pedir; nunca `git add -A`. |
| 6 | **Texto do aviso (TL-13)**: o que substitui "Excluir conta", Google e compartilhamento | Citar só o que o app faz hoje; marcar o resto como futuro. |
| 7 | Mensagem para senha curta ou longa (PL-07) | Mensagem específica do erro real, sem anunciar o tamanho até a regra existir. |
| 8 | Indicativo curto na TL-07 ou só na TL-09 | Só na TL-09 (D-01) até você decidir. |
| 9 | Mapa base e atribuição (PL-25) | Manter Google/Apple no Expo Go e corrigir o crédito; não escrever crédito errado. |
| 10 | Sem rede: bloquear "Ver alternativas" ou deixar tentar? | Deixar tentar e explicar a falha (PL-12). |
| 11 | D-02 sem busca de endereço | Manter até depois da entrega; avaliar lista embarcada de lugares públicos, sem serviço externo. |
| 12 | Aparelhos para teste (iPhone e Android) | Reservar os dois; o que faltar fica "não verificado" no README. |

## 4. Proposta de ondas de implementação
Esforço total do plano mínimo: **13 a 20 h** de implementação e validação, até 18/11 (estimativa relativa dos analistas, não promessa). O plano completo (35 a 55 h) fica para depois.

- **Onda 1 · sem texto novo e sem decisão sua** (pode começar já): expansão real do painel (TL-07), abortar a busca de verdade (`AbortController` no serviço), coerência de ida e volta, estados `INDISPONIVEL`/geometria ausente, foco no primeiro campo com erro, "Usar este ponto" e estados do mapa na TL-05, padronizar cabeçalho e "voltar". Pastas separadas por worker.
- **Onda 2 · depende da sua aprovação de texto:** aviso de privacidade (decisão 6), mensagens de senha (7), resumo de embarque e desembarque, clareza das TL-09, TL-10 e TL-11.
- **Onda 3 · validação no celular:** checklist de acessibilidade, fonte a 200%, leitor de tela, Expo Go em iPhone e Android, prints. Parte é humana (você).
- **Depois de 18/11:** fonte, Reanimated, cena da entrada, `MASTER.md`, auditoria de desempenho medida.

## 5. Onde está o detalhe
`01_entrada_e_conta.md` (TL-01, 02, 03, 13) · `02_planejar_ponto_busca.md` (TL-04, 05, 06) · `03_resultado.md` (TL-07) · `04_detalhes_dados_config.md` (TL-08 a TL-12) · `05_sistema_navegacao_guia.md` (design system, navegação, movimento, acessibilidade, adoção do guia). Cada um traz rubrica do checklist, análise **função por função**, critérios de aceite, esforço, dependência nova? e texto novo?
