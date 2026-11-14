# DESIGN.md: identidade visual premium do VoltaSegura (D-28)

Substitui a versão de 13/11 (fonte do sistema, listas planas). `docs/app-map/07_design/tokens.md` segue valendo para **contraste, cores e linguagem**; este arquivo manda na **identidade e no movimento**. Arquitetura e decisões: `docs/redesign/07_premium_arquitetura.md`.

## Conceito
**Fio de luz.** A cidade fica apagada e só o seu caminho acende. Premium aqui é calma e precisão: uma coisa acesa por tela, número grande, muito respiro.

## Elemento assinatura
O **fio**: linha dourada com brilho que liga origem, trechos e destino. Aparece na abertura (`FioLuz`), no resumo da rota selecionada (`SequenciaModos acesa`), no mapa e no carregamento (`FioPulsante`). Dourado = seleção e ação, nunca "melhor" ou "seguro" (docs/05).

## Tipografia
Sora 600/800 (títulos, marca, números) + Atkinson Hyperlegible Next 400/600/700 (texto). Famílias por peso, sem `fontWeight`. Hierarquia: `numero` (64) herói único por tela; `duracao` (30); `titulo` (28); resto 13 a 20. Nada abaixo de 13 pt; tudo escala até 200%.

## Cor e profundidade
Marinho `#0D1B2A`, dourado `#FFC53D`, ciano `#4ECDC4` só para dados. Profundidade por degradê de fundo (`fundoTopo` → `fundo`), degradê dourado no botão primário, brilho (`brilho()`) só em seleção/ação, painel arredondado (`raio.painel`). Sem sombra cinza, sem vidro (blur fora do escopo), sem cor de alerta em rota.

## Movimento (Reanimated, só transform e opacity)
Toque: escala 0,97 com mola. Entrada: sobe 14 pt com mola, em sequência (70 ms, teto de 6). Número: conta quando **muda** (troca de rota). Carregamento: o fio pulsa. **"Reduzir movimento" desliga tudo.** Háptica (`haptica`): leve em ações, `selecao` ao trocar opção, `sucesso`/`erro` ao fim da busca; só iOS/Android.

## Anti-genérico
Sem gradiente roxo/azul, sem cards iguais (a opção selecionada é grande e acesa, as outras ficam quietas), sem ícone em círculo colorido, sem animação de entrada decorativa em tudo.

## Imagens e ícones (D-29)
Cada espaço de imagem é `ImagemPlaceholder` (degradê + ícone) lido de `theme/imagens.ts`; trocar `null` por `require(...)` ativa a foto (guia: `assets/imagens/LEIA-ME.md`). Topo de tela com imagem usa `Hero` (borda inferior curva). Imagens são decorativas, escurecidas embaixo para o texto continuar legível, e nunca sugerem "seguro" ou "perigoso". Ícones: uma família (`MaterialCommunityIcons`), sempre com texto ao lado; o círculo atrás do ícone é neutro (`superficie2`), nunca colorido.

## Onde está no código
`theme/tokens.ts` (cores, `fonte`, `tipo`, `movimento`, `brilho`), `theme/fontes.ts`, `components/movimento/` (`useFeedbackToque`, `Entrada`, `NumeroContando`, `haptica`), `components/FioLuz.tsx`, `components/resultado/resultado.tsx` (TL-07, tela-modelo), `app/(auth)/index.tsx` (TL-01), `components/Hero.tsx`, `ImagemPlaceholder.tsx`, `Icone.tsx`, `BotaoIcone.tsx`, `GrupoLinhas.tsx`, `components/planejar/` (home e mapa), `app/(app)/escolher-ponto.tsx` (TL-05 em tela cheia).

## Pendente (Lucas)
Referências reais (P1), aprovar a direção olhando no celular, `[HIPÓTESE]` de marca (T15). Verificação visual no navegador não foi possível neste ambiente (renderizador do Chrome sem resposta).
