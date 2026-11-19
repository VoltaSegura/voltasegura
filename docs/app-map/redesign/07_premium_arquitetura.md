# Redesign premium: arquitetura (guia 5B, P0 a P3)

**Data:** 14/11/2026 · **Decisão:** D-28 · **Status:** `[HIPÓTESE]` (direção escolhida pelo lead por falta de referências; o Lucas pode trocar pelos tokens).
**Estado das etapas do guia:** as Etapas 1 a 5 **não** existiam no disco (sem `PRODUCT.md`, sem skills, sem `referencias/`). A P0 foi refeita: backup fora do repo (`backup-pre-premium-2026-11-14`), `src/mobile-app/PRODUCT.md` com "Visual identity", D-28.
**Limite:** a verificação visual no navegador (Chrome) falhou (captura de tela expirou duas vezes); `referencias/direcoes.html` existe mas **não foi visto renderizado**. A conferência real é no celular.

## 1. Diagnóstico
O app hoje é correto e acessível, mas **parece de template**: fonte do sistema, listas planas, botão chapado, sem profundidade nem resposta tátil. A rodada anterior tratou usabilidade. O premium muda a **camada visual e de interação** sem tocar em lógica, dados, navegação, linguagem (`docs/05`) e marca (D-06).

## 2. As três direções (em `referencias/direcoes.html`)
| | Conceito | Assinatura | Fontes | Risco para este produto |
|---|---|---|---|---|
| **A. Fio de luz** | A cidade apagada, uma linha de luz que só você acende | O **fio** dourado que liga origem, trechos e destino (mapa, resumo e lista) | Sora + Atkinson Hyperlegible Next | Baixo: é a "rota acesa" já aprovada (PL-19), com a marca D-06 |
| B. Painel de partidas | Sinalização do metrô de SP, papel e tinta | Duração gigante em condensada | Barlow Condensed | Médio: fundo claro por padrão contraria o uso noturno e o tema escuro da marca |
| C. Carta noturna | Instrumento de navegação à noite | Coordenadas e curvas de nível | Fraunces + JetBrains Mono | Médio: monoespaçada cansa em texto corrido e fere a leitura a 200% |

**Escolha do lead: A (Fio de luz)**, emprestando de B só o **número grande** como herói da opção. Motivos: nasce do produto (volta noturna), reaproveita a marca e o conceito já aprovado, e é a que melhor protege contraste, legibilidade e o princípio "uma coisa acesa por tela".

## 3. Sistema de design (evolui `theme/tokens.ts`, sem sistema paralelo)
- **Tipografia:** *Sora* 600/800 para números, títulos e marca; *Atkinson Hyperlegible Next* 400/600/700 para texto (acessibilidade em baixa visão). Reserva: fonte do sistema se a fonte não carregar. Escala dramática: `numero` (duração) 56/60, `titulo` 28, rótulos 13. Tamanhos seguem escalando com a fonte do sistema.
- **Cor:** mantém marinho, dourado, ciano (D-06) e as regras do `docs/05`. Acrescenta só **profundidade**: gradiente de fundo do marinho (`fundo` → `fundo2` mais profundo), superfície em vidro/degradê sutil, brilho dourado (`luz`) usado **apenas** em seleção e ação. Dourado nunca significa "melhor" ou "seguro".
- **Profundidade:** gradiente linear (`expo-linear-gradient`) em fundo de tela e botão primário; sombra suave dourada só no botão primário e no fio; sem sombra cinza padrão. Vidro (`expo-blur`) **fica fora** (instável no Expo Go/Android e custo de desempenho); usa-se superfície translúcida.
- **Movimento (Reanimated):** toque com mola (escala ~0,97), entrada em sequência (stagger curto) em listas e na tela de resultado, número da duração que conta, fio que se acende ao selecionar. Só `transform`/`opacity`. **"Reduzir movimento" desliga tudo** (hook `useReducedMotion` existente). Nenhum movimento automático além da entrada.
- **Háptica (`expo-haptics`):** leve nas ações principais e na troca de rota selecionada; `success` ao concluir; `error` em falha. Só em iOS/Android, silenciosa na web e sem erro se faltar suporte.
- **Ícones:** continua MaterialCommunityIcons (uma família).

## 4. Arquitetura de código (respeita o padrão do projeto)
Um único ponto de mudança visual: **tokens + componentes base**, que todas as telas já usam.
1. `theme/tokens.ts`: novas famílias de fonte, escala `tipo`, `fundo2`, `luz`, sombras, durações e molas. Nomes antigos continuam (retrocompatível).
2. `theme/fontes.ts` (novo) + `useFontesPremium` no `_layout.tsx` raiz: carrega Sora e Atkinson com `expo-font`; a UI renderiza com reserva do sistema enquanto carrega (sem tela branca).
3. `components/movimento/`: `useFeedbackToque` passa a usar Reanimated (mola) e háptica; novos `Entrada` (stagger), `NumeroContando`, `haptica.ts`.
4. Base: `Texto` (famílias), `Botao` (gradiente, brilho, mola, háptica), `Caixa`, `Tela` (gradiente de fundo), `Cabecalho`, `LinhaLista`, `CampoTexto` (foco com brilho), `Segmentado`.
5. **Tela-modelo (P4): TL-07 resultado** (a mais vista e a que carrega o conceito): sheet com número de duração enorme, **fio** ligando os trechos, lista de opções com a selecionada acesa. Depois **P5**: TL-01 (abertura), TL-04/05/06, TL-08 a TL-12 herdam pelos componentes base, com ajustes pontuais.
6. Testes: os 374 testes devem continuar passando; mocks de Reanimated/haptics/fonte no `jest`.

## 5. Ordem e critérios
P3 fundação → P4 TL-07 → P5 demais telas → P6 movimento transversal → P7 qualidade (`tsc`, ESLint, jest, export web/android, `expo-doctor`, varredura de linguagem, `reduzir movimento`, contraste). Cada fase fecha com todos os checks verdes. A nota de "quão premium" é **opinião**; o teste final é no celular, pelo Lucas.

## 6. O que NÃO entra
Blur de vidro, Skia, NativeWind, bibliotecas de animação prontas (Reacticx/AniUI), Atkinson como única fonte, qualquer cor de alerta em rota, cena animada longa. Referências visuais reais (P1) continuam pendentes e podem mudar a direção.
