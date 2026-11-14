# Biblioteca de componentes

- **Status:** revisado (Fase 3 de 13/11/2026; **revisão de design PL-19 aplicada em 13/11/2026**, ver `tokens.md` R-01 a R-15; proposta `[HIPÓTESE]` aguardando a aprovação visual do Lucas)
- **Base:** os componentes citados em `04_telas/`. Cada um tem variantes, estados, tokens e regras de acessibilidade. Os nomes viram os nomes dos componentes React Native na Frente 2.
- **Tokens:** `tokens.md`. Estados comuns a todo elemento interativo: **normal · pressionado** (`cor.superficie2`) **· foco do teclado** (contorno de 2 px em `cor.acao`) **· desabilitado** (opacidade 0,5 + `acessibilidade: desabilitado`).

## Estrutura

| Componente | Variantes | Estados | Tokens principais | Acessibilidade | Telas |
|---|---|---|---|---|---|
| `Cabecalho` | com voltar · com fechar (modal) · com ação à direita (⚙) · com subtítulo | — | `tipo.cabecalho` (título), `tipo.apoio` (subtítulo), `cor.texto` | Título como cabeçalho; botões de 48 dp com rótulo "Voltar", "Fechar" | Todas |
| `Container` (painel do resultado) | **fixo** (mapa em cima, lista embaixo) · lista expandida (mapa recolhido) | — | `cor.superficie`, divisória superior `cor.divisoria`, sem sombra e sem alça | Botão "Expandir lista" no cabeçalho do painel; **sem gesto de arrastar** (R-08, `[HIPÓTESE]`). A `LinhaSobreOsDados` fica fixa no rodapé (R-09) | TL-07, TL-08 |
| `Folha` | opções · confirmação | aberta · fechando | `cor.superficie` | Foco vai para o título ao abrir; fecha com voltar | TL-04, TL-05 |
| `DialogoConfirmacao` | neutro · destrutivo | — | `cor.superficie`, `cor.erro` (só no texto da ação destrutiva) | Foco inicial em "Cancelar"; título lido ao abrir | TL-12 |
| `CenaRotaAcesa` | — | desenhando (uma vez) · parada | Ruas `cor.mapa.rua` sobre `cor.mapa.fundo`; a rota se desenha com `mov.acende` (R-10) | Decorativa: oculta para o leitor; com "reduzir movimento", aparece já desenhada | TL-01 |

## Ações

| Componente | Variantes | Estados | Tokens | Acessibilidade | Telas |
|---|---|---|---|---|---|
| `Botao` | primário (preenchido `cor.acao`, texto `cor.acao.texto`) · secundário (borda `cor.borda`, texto `cor.texto`) · destrutivo (texto `cor.erro`; com borda `cor.erro` na confirmação) | normal · pressionado · carregando ("( ◌ ) Criando…") · desabilitado | `raio.botao` (14), `tipo.corpo.forte`, altura ≥ 48; ícone opcional à esquerda | Rótulo = texto; carregando anuncia "Carregando" | Todas |
| `Link` | ação (`cor.acao` no escuro, `cor.acao.link` no claro) · dado (`cor.dado`) | normal · pressionado | `tipo.apoio` com sublinhado afastado; **sem "›" no fim** (R-12) | Papel "link"; alvo ≥ 48 dp mesmo com texto curto | TL-01, TL-02, TL-09, TL-10 |
| `BotaoPorQue` | — | normal · pressionado | Botão secundário pequeno, ícone ⓘ, `cor.dado` | Rótulo "Por que esta rota? Trecho N, a pé" | TL-08 |
| `Interruptor` | — | ligado · desligado · desabilitado | `cor.acao` quando ligado | Papel "interruptor" com estado | TL-12 |
| `SeletorSentido` | ida · volta | selecionado | Segmentado em trilho `cor.superficie2`; opção selecionada preenchida `cor.acao` + texto | Grupo de opções; "Ida, selecionado" | TL-04 |
| `SeletorRota` | abas por rota | selecionada | Segmentado | Abas com o rótulo do foco | TL-11 |

## Entradas

| Componente | Variantes | Estados | Tokens | Acessibilidade | Telas |
|---|---|---|---|---|---|
| `CampoTexto` | e-mail · senha (com mostrar/ocultar) · texto | vazio · preenchido · focado · erro · desabilitado | `cor.superficie2`, `cor.borda`, `cor.erro` na mensagem, `raio.medio` | Rótulo visível acima; erro ligado ao campo e anunciado | TL-02, TL-03, TL-05 |
| `CampoPonto` | origem · destino | vazio ("Escolher origem") · preenchido (nome) · erro | Como `CampoTexto`, com › | "Origem: Faculdade. Toque para mudar" | TL-04 |
| `SeletorHorario` | — | padrão "agora" · escolhido | Usa o seletor nativo do sistema | Rótulo "Saída: hoje, 23:00" | TL-04 |
| `Caixa` (checkbox) | — | marcada · desmarcada · erro | Alvo inclui o texto | Papel "caixa de seleção" com estado | TL-02, TL-05 |

## Resultado

| Componente | Variantes | Estados | Tokens | Acessibilidade | Telas |
|---|---|---|---|---|---|
| `MapaTrajeto` | resultado (rotas) · seleção (mira fixa) · faixa (TL-08) | carregando · erro de carregamento | Mapa apagado (`cor.mapa.*`). **Rota acesa:** halo `cor.rota.halo` (16 px) + contorno `cor.fundo` + traço `cor.rota.selecionada` (6 px, contínuo); outras rotas `cor.rota.outra` (tracejado, 4 px). Início: anel ○; fim: quadrado ■ (R-07) | Rótulo-resumo do mapa; **tudo o que o mapa mostra também está em texto**. O halo marca a seleção, não a exposição | TL-05, TL-07, TL-08 |
| `Atribuicao` | mapa · fontes | — | `tipo.apoio`, `cor.texto2`, sobre `cor.fundo` | Texto legível, não imagem. **O texto do mapa depende do provedor do mapa base** (Google/Apple ou OSM), em aberto na PL-25 | TL-05, TL-07, TL-10 |
| `CardRota` (linha de opção) | normal · selecionado (fundo `cor.superficie2`, barra lateral `cor.acao` 4 px e texto "selecionada") | pressionado | **Linha de lista com divisória `cor.divisoria`, sem borda nem sombra** (R-03). Topo: `RotuloFoco` + "selecionada" + `SeloExemplo`. Meio: duração em `tipo.duracao` à esquerda; à direita, em coluna, "**{km}** a pé", trocas ("Sem troca", "1 troca", "{n} trocas") e saída prevista (R-02, R-04). Base: `SequenciaModos` (R-05) | Um único elemento para o leitor de tela, com rótulo completo (TL-07) | TL-07 |
| `RotuloFoco` | **destaque** (◆ Menor exposição estimada: preenchido `cor.acao`, texto `cor.acao.texto`) · neutro (Menor tempo · Menos caminhada · Outra opção: borda `cor.borda`, texto `cor.texto`) (D-23) | — | `tipo.rotulo`, `raio.pequeno` | Lido como parte do card ("Menor tempo") | TL-07, TL-08, TL-09, TL-11 |
| `SeloLinha` | metrô e CPTM (cor oficial da linha, `raio.pilula`) · ônibus (neutro, borda `cor.borda`) | — | Tabela "Linhas de transporte" em `tokens.md`; texto 12 / 800 na cor que passa de 4,5:1 (R-06) | Lido pelo nome completo ("Linha 4-Amarela do metrô", "Ônibus 875A"). A cor **nunca** aparece fora do selo | TL-07, TL-08, TL-15 |
| `SequenciaModos` | — | — | Ícone do modo + `SeloLinha` (ou minutos a pé), ligados por traço curto `cor.borda`; numa linha só | Lida como frase: "A pé 9 minutos, metrô linha 4-Amarela, a pé 8 minutos" | TL-07, TL-15 |
| `ListaTrechos` / `ItemTrecho` | a pé · ônibus · metrô · trem | selecionado | Lista ordenada com nó circular `cor.superficie2` e o ícone do modo, ligado por linha vertical `cor.divisoria`; ônibus, metrô e trem com `SeloLinha` | Lista ordenada: "Trecho 1 de 4, a pé, 250 metros" | TL-08 |
| `Indicativo` | conclusivo (rota com foco) · conclusivo (rota sem foco) · sem diferença · insuficiente · não aplicável · indisponível | — | `cor.superficie2`, borda `cor.borda`; **sem cor de alerta, sem ícone de perigo** | Lido logo depois do título | TL-09 |
| `TabelaNumeros` | — | valor ausente ("não aplicável", "dados insuficientes") | Rótulo à esquerda (`cor.texto2`), valor à direita (`cor.texto`) | Lido como pares "rótulo: valor" | TL-09, TL-10 |
| `LinhaSobreOsDados` | — | normal · indisponível | `cor.dado`, ícone ⓘ, chevron ›; **fixa no rodapé do painel**, com divisória acima (R-09) | "Dados: SSP-SP, janeiro a setembro de 2026. Abrir Sobre os dados" | TL-07, TL-08 |
| `LinhaCategoria` | com detalhes (expansível) · simples | recolhida · expandida | `tipo.corpo`; parcela da comparação marcada em texto | "Furto, 7 registros, recolhido" | TL-11 |

## Compartilhamento (Depende do tempo, D-22)

| Componente | Variantes | Estados | Tokens | Acessibilidade | Telas |
|---|---|---|---|---|---|
| `IndicadorCompartilhamento` | normal · sem conexão | ativo (sempre visível com a sessão) | Faixa no topo, `cor.superficie2`, ponto ● em `cor.acao` + texto, botão "Parar" | Anunciado ao aparecer; "Parar" com alvo ≥ 48 dp; **não pode ser ocultado** (D-20) | Todas as telas de `(app)` com sessão ativa |
| `MarcadorPosicao` | posição atual · posição antiga (sem atualização recente) | — | Círculo ◉ em `cor.dado` com contorno `cor.fundo`; **não é marcador de ocorrência** | Equivalente em texto ("Última atualização 23:12") | TL-15 |
| `EstadoViagem` | em andamento · chegou · encerrado · terminou | — | `tipo.corpo.forte`; ✓ só com texto | Anunciado quando muda | TL-15 |

## Feedback

| Componente | Variantes | Estados | Tokens | Acessibilidade | Telas |
|---|---|---|---|---|---|
| `Aviso` | informativo (ⓘ `cor.dado`, fundo `cor.superficie2`) · erro (⚠ `cor.erro` + filete lateral de 3 px `cor.erro`) · minuta (ⓘ, fundo transparente, borda tracejada `cor.borda`) (R-14) | com ação ("Tentar de novo") · sem ação | `raio.medio` | Anunciado ao aparecer (região ao vivo) | TL-01 a TL-06, TL-12, TL-13 |
| `Carregando` | tela inteira · em botão | — | Indicador nativo | Anuncia "Carregando" ou o texto ao lado | TL-01, TL-06 |
| `EstadoVazio` | — | — | `cor.texto2`, texto + ação sugerida | Texto lido normalmente | TL-04, TL-12 |
| `SeloExemplo` | — | — | `selo.exemplo`: borda **tracejada** (R-11) | Lido como "exemplo" | Todos os dados de exemplo |

## Proibições de componente (valem para todos)

- As cores oficiais de linha (`SeloLinha`) ficam **só dentro do selo** e nunca pintam traço de rota, `CardRota`, número ou `Indicativo` (R-06).
- Nenhum componente de **nota, estrela, barra de nível, termômetro ou semáforo** (RNF-04).
- Nenhum **marcador de ocorrência** ou mancha de calor no `MapaTrajeto` (US-15 AC4).
- `Indicativo` e `CardRota` **não** mudam de cor conforme o caso da comparação. O `RotuloFoco` só muda no foco de exposição, que tem prioridade (D-23), e usa a cor de ação, nunca verde ou vermelho.
- `cor.erro` só em `Aviso` de erro, `CampoTexto` com erro e ação destrutiva.
- `MarcadorPosicao` e `EstadoViagem` **nunca** usam cor de alerta, nem quando a posição está desatualizada (RNF-06).
