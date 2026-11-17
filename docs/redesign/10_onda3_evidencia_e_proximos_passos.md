# Onda 3: análise da evidência (vídeo + print do teclado) e próximos passos

**Data:** 15/11/2026 · **Evidência:** `evidencia-redesign-vs/onda3/onda3-redesign-evidencia-video.mp4` (105 s, Android, Expo Go) e `teclado.jpeg`. Método: um quadro a cada 2 s e recortes ampliados dos trechos críticos (hora, teclado).
**Veredito em uma linha:** a Onda 3 resolveu 6 de 7 itens vistos; **o teclado (B1) melhorou mas ainda corta o formulário de salvar lugar**, e a Onda 3 revelou 4 refinamentos novos no mapa.

## 1. Item por item da Onda 3
| Item | Resultado no vídeo | Situação |
|---|---|---|
| **B2 hora do resultado** | Home mostra 18:10 (depois de "Em 1 h", relógio do celular 17:10), a tela Buscando diz "Saída às 18:10" e o resultado "Saída às 18:10". As três batem (antes havia +3 h) | **Resolvido** |
| **B3 botão de localização** | Pílula "Minha localização" visível em todos os quadros do mapa, acima do painel; ao tocar (26 s) o painel vira "Ponto escolhido: Minha localização" | **Resolvido** |
| **U1 abrir perto** | O mapa abriu na região do usuário (Butantã/Jardim Sarah), sem pedir permissão | **Resolvido** |
| **B4 nome do ponto** | Após "Minha localização" o nome fica; ao arrastar vira "Ponto escolhido no mapa" (28 s) como esperado; "Salvar este lugar" em linha própria, sem truncar | **Resolvido** |
| **U6 cabeçalho / U8 folha** | "3 opções · Saída às 18:10" + chip "Menor exposição estimada primeiro"; folha em três alturas (recolhida a 72 s, meia a 74 s); "Planejar a volta" no fim da lista (88 s) | **Resolvido** (ver R3) |
| **U7 câmera** | Pinos inteiros dentro do mapa nas três alturas | **Resolvido** (o traço ainda é o do mock) |
| **U9 modal** | "Por que esta rota?" só com "Fechar" (104 s) | **Resolvido** |
| **U12 tela Buscando** | Imagem, fio, "Buscando alternativas…", texto de privacidade e Cancelar visíveis (68 s) | **Resolvido** |
| **B1 teclado** | `teclado.jpeg`: com o teclado aberto o painel sobe e mostra "Ponto escolhido" e o tipo, mas **o campo do nome fica cortado ("Faculdade" pela metade) e Salvar, Cancelar e "Usar este ponto" ficam atrás do teclado** | **Parcial: ainda falha** |

## 2. Problemas que sobraram ou apareceram
**R1 · Teclado ainda corta o formulário (alta).** Com o teclado aberto sobram ~640 px para o painel (o teclado ocupa ~42% da tela e o topo ~17%), e o conteúdo do formulário passa disso: "Ponto escolhido" + "Tipo do lugar" + chips em duas linhas ("Outro" quebra para a segunda) + campo + botões. O painel subiu, mas não rola até o campo nem encolhe. O teste automatizado passa porque o mock não mede altura real (a verificação só é possível no aparelho).
→ **Correção proposta:** ao salvar, **modo compacto**: esconder "Ponto escolhido" e a alça; tipos em **uma linha** (4 chips de largura igual, texto curto, 40 pt); **campo e botões primeiro** na ordem visual (campo, [Cancelar][Salvar]), tipos logo abaixo; esconder também a ajuda "Escolher origem" e a linha da busca enquanto o teclado está aberto, liberando altura. Critério: com teclado e fonte 130%, campo e Salvar visíveis sem rolar.

**R2 · A linha "Busca usa o serviço de mapas do celular" some sobre o mapa (média).** Ela ficou fixa abaixo do campo, sem fundo, e se mistura aos nomes de rua (visível no print: "Busca usa o serviço de mapas do celular" por cima de "Av. do Rio Pequeno"). É ilegível em muitos pontos.
→ Dar **fundo de pílula** (superfície semitransparente) ou mover para dentro do campo (ajuda abaixo do texto digitado) e mostrar só quando o campo tem foco ou texto.

**R3 · "Usar este ponto" desabilitado enquanto o pino já está sobre um lugar (média).** Em 24 s e 52 s o mapa abre onde a pessoa quer, o pino aparece no centro, mas o botão só habilita depois de arrastar ou tocar (frase "Arraste o mapa para pôr o pino no ponto certo"). Para quem já está no lugar certo é um passo a mais e parece bug.
→ Considerar o **centro como escolhido** assim que o mapa assenta (primeira pausa do mapa), com rótulo "Ponto escolhido no mapa"; o botão habilita de imediato.

**R4 · Quadro preto às 76 s (a confirmar).** Um quadro do resultado aparece totalmente escuro, só com a barra de status. Pode ser a troca de tela, o app recarregando ou o grampo do vídeo. **Não confirmado**: ver no aparelho (abrir o resultado e alternar as alturas várias vezes).

**R5 · Tiles em branco no zoom rápido (36 s).** O mapa fica um instante cinza antes de carregar. É o Google Maps no Expo Go; sem ação do app, só registrar.

**R6 · Folha recolhida corta o primeiro cartão (baixa).** Na altura recolhida (72 s) aparece só o topo do cartão selecionado. É aceitável como "espiar", mas o número grande (40 min) fica escondido; vale mostrar o número na altura recolhida (por exemplo, uma linha "40 min · Menor exposição estimada") para a decisão rápida.

**R7 · Traço do mapa ainda é o do mock.** A linha amarela é uma reta esticada entre os pontos (mock). Continua dependendo do Plano B (B-03 já prevê rotular "trajeto de exemplo" ou ocultar).

## 3. O que ficou bom (manter)
- Login funcionando no celular com o gerenciador de senhas do Android (Samsung Pass), teclado sem cobrir o botão Entrar.
- Fluxo "Minha localização" → lugar salvo "Trabalho" → "Ver alternativas" em poucos toques; atalhos de horário usados e corretos.
- Estados de espera e transições sem quebra visível (exceto R4).

## 4. Plano da próxima rodada do redesign (Onda 4, todas no terminal de redesign)
| ID | Item | Tam. | Aceite |
|---|---|---|---|
| 4A-1 | **R1** modo compacto do formulário de salvar | M | campo e Salvar visíveis com teclado, no print e a 130% |
| 4A-2 | **R2** linha da busca legível (fundo ou dentro do campo) | P | legível sobre o mapa em qualquer ponto |
| 4A-3 | **R3** centro do mapa como ponto escolhido ao assentar | P | botão habilita sem arrastar; teste que cobre |
| 4A-4 | **R6** número do tempo na folha recolhida | P | uma linha com "40 min · foco" |
| 4B | **R4** investigar o quadro preto no aparelho | P | reproduzir ou descartar |
| 4C | Imagens reais (você envia) e revisão dos textos `[HIPÓTESE]` | M | 13 chaves de `theme/imagens.ts` |
| 4D | Acessibilidade: 200%, leitor de tela, contraste do chip e da linha da busca | M | checklist em `docs/app-map/07_design/acessibilidade.md` |
| 4E | D-30 (geocodificação reversa e lista de candidatos), se você liberar | M | ver `09_...md` §3 e §5 |
Dependências do Plano B (outro terminal): R7 e a geometria por trecho. A zona compartilhada `MapaResultado*` segue com aviso de merge.

## 5. Limite desta análise
Vi quadros a cada 2 s e recortes, não o movimento contínuo: gestos como o arraste da folha só aparecem como estados (recolhida, meia). O que depende de toque, animação e desempenho precisa da sua palavra no aparelho.

## 6. Onda 4: novos pedidos do Lucas e plano executado (15/11/2026)
**Novos pedidos:** (a) mostrar e guardar o **endereço** dos lugares (hoje "C6 Bank" não mostra onde fica); (b) o **ponteiro não deve se mover junto com o mapa**: tocar coloca o marcador, mexer no mapa não o move, tocar em outro lugar o move e mostra o novo endereço. Registrado como **D-30**.
**Efeito no plano:** o R3 (centro como ponto escolhido) deixa de existir, porque o botão habilita ao colocar o marcador; o R1 (teclado) e o R2 (linha da busca) entram junto, por mexerem na mesma tela.
**Divisão entre os workers (painel do Alethe, run-15; Codex; sem worktree por causa do `node_modules`):**
| Unidade | Job | O que faz | Donos |
|---|---|---|---|
| A · mapa | job-38 | marcador por toque e arrastável; endereço por geocodificação reversa (`enderecoDoPonto.ts`); rótulo da consulta com o endereço; salvar lugar com endereço; R1 modo compacto; R2 linha da busca legível | `escolher-ponto.tsx`, `components/mapa/MapaPonto*`, `BuscaEndereco`, `SalvarLugar`, `useAlturaTeclado`, `hipotesesMapa` |
| B · lugares | job-39 | `endereco?` no armazenamento (compatível com registros antigos), `atualizarEndereco`, cartões da home e Configurações mostram o endereço, "Endereço não salvo" | `src/locais/**`, `CartaoLocal`, `CampoPonto`, `configuracoes.tsx`, `planejar.tsx`, `hipotesesConfig` |
| C · resultado | job-40 | R6 resumo do tempo na folha recolhida; R4 (quadro preto, só se houver causa no código); contraste do chip e da hora | `app/(app)/resultado/**`, `components/resultado/**`, `hipotesesResultado` |
**Contrato aplicado antes:** `LocalSalvo.endereco?`, `MAX_ENDERECO = 140`, `salvar(nome, ponto, tipo, endereco?)`; o lead atualizou o texto do Aviso de privacidade (busca e lugares).

**Resultado (3 workers Codex, painel do Alethe, run-15; revisados e integrados pelo lead; `tsc` e ESLint limpos, 447 testes em 35 suítes):**
- **A (job-38):** marcador por toque e arrastável, sem pino central; mover o mapa não move o ponto; endereço por geocodificação reversa (`enderecoDoPonto.ts`, timeout de 6 s, respostas antigas descartadas, falha vira "Endereço indisponível" e o ponto segue utilizável); rótulo da consulta com o endereço; salvar lugar com endereço; R1 modo compacto do formulário; R2 linha da busca com fundo.
- **B (job-39):** `endereco?` gravado e lido (registros antigos válidos, valor inválido descartado sem perder o lugar), `atualizarEndereco`, cartões da home e Configurações mostram o endereço, "Endereço não salvo".
- **C (job-40):** resumo do tempo na folha recolhida (R6); R4 sem causa confirmada no código (fundo explícito e altura zero transitória ignorada; falta ver no aparelho); contraste do chip e da hora 14,54:1 (escuro) e 17,39:1 (claro), sem ajuste.
**Pendente no aparelho:** R1 com teclado e fonte a 130% e 200%; endereço no Android (depende do geocodificador do Google); arrastar o marcador; R4.
