# Biblioteca de componentes

- **Status:** rascunho (Fase 3, 13/11/2026)
- **Base:** os componentes citados em `04_telas/`. Cada um tem variantes, estados, tokens e regras de acessibilidade. Os nomes viram os nomes dos componentes React Native na Frente 2.
- **Tokens:** `tokens.md`. Estados comuns a todo elemento interativo: **normal · pressionado** (`cor.superficie2`) **· foco do teclado** (contorno de 2 px em `cor.acao`) **· desabilitado** (opacidade 0,5 + `acessibilidade: desabilitado`).

## Estrutura

| Componente | Variantes | Estados | Tokens principais | Acessibilidade | Telas |
|---|---|---|---|---|---|
| `Cabecalho` | com voltar · com fechar (modal) · com ação à direita (⚙) | — | `tipo.secao`, `cor.texto` | Título como cabeçalho; botões com rótulo "Voltar", "Fechar" | Todas |
| `Container` (bottom sheet) | recolhido · meio · expandido | arrastando | `cor.superficie`, `raio.grande` | Alternativa ao gesto: botão "Expandir lista"; alça com rótulo | TL-07, TL-08 |
| `Folha` | opções · confirmação | aberta · fechando | `cor.superficie` | Foco vai para o título ao abrir; fecha com voltar | TL-04, TL-05 |
| `DialogoConfirmacao` | neutro · destrutivo | — | `cor.superficie`, `cor.erro` (só no texto da ação destrutiva) | Foco inicial em "Cancelar"; título lido ao abrir | TL-12 |

## Ações

| Componente | Variantes | Estados | Tokens | Acessibilidade | Telas |
|---|---|---|---|---|---|
| `Botao` | primário (preenchido `cor.acao`, texto `cor.acao.texto`) · secundário (borda `cor.borda`, texto `cor.texto`) · destrutivo (texto `cor.erro`, sem preenchimento) | normal · pressionado · carregando ("( ◌ ) Criando…") · desabilitado | `raio.medio`, `tipo.corpo.forte`, altura ≥ 48 | Rótulo = texto; carregando anuncia "Carregando" | Todas |
| `Link` | ação (`cor.acao` no escuro, `cor.acao.link` no claro) · dado (`cor.dado`) | normal · pressionado | `tipo.corpo` com sublinhado | Papel "link"; alvo ≥ 48 dp mesmo com texto curto | TL-01, TL-02, TL-09, TL-10 |
| `BotaoPorQue` | — | normal · pressionado | Botão secundário pequeno, ícone ⓘ, `cor.dado` | Rótulo "Por que esta rota? Trecho N, a pé" | TL-08 |
| `Interruptor` | — | ligado · desligado · desabilitado | `cor.acao` quando ligado | Papel "interruptor" com estado | TL-12 |
| `SeletorSentido` | ida · volta | selecionado | Segmentado, `cor.acao` no selecionado + texto | Grupo de opções; "Ida, selecionado" | TL-04 |
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
| `MapaTrajeto` | resultado (rotas) · seleção (mira fixa) · faixa (TL-08) | carregando · erro de carregamento | `cor.rota.selecionada` (traço contínuo, 6 px), `cor.rota.outra` (tracejado, 4 px), início ● e fim ■ | Rótulo-resumo do mapa; **tudo o que o mapa mostra também está em texto** | TL-05, TL-07, TL-08 |
| `Atribuicao` | mapa · fontes | — | `tipo.apoio`, `cor.texto2` | Texto legível, não imagem | TL-05, TL-07, TL-10 |
| `CardRota` | normal · selecionado (barra lateral `cor.acao` 4 px + texto "selecionada" no rótulo) | pressionado | `cor.superficie`, `raio.medio`, `tipo.destaque` (duração) | Um único elemento para o leitor de tela, com rótulo completo (TL-07) | TL-07 |
| `RotuloFoco` | Menor tempo · Menos caminhada · ◆ Menor exposição estimada · Outra opção | — | **Mesmo estilo para todos**: borda `cor.borda`, texto `cor.texto`, `tipo.rotulo`, `raio.pequeno` | Lido como parte do card ("Menor tempo") | TL-07, TL-08, TL-09, TL-11 |
| `ListaTrechos` / `ItemTrecho` | a pé · ônibus · metrô · trem | selecionado | Linha vertical de ligação; ícone + nome do modo | Lista ordenada: "Trecho 1 de 4, a pé, 250 metros" | TL-08 |
| `Indicativo` | conclusivo (rota com foco) · conclusivo (rota sem foco) · sem diferença · insuficiente · não aplicável · indisponível | — | `cor.superficie2`, borda `cor.borda`; **sem cor de alerta, sem ícone de perigo** | Lido logo depois do título | TL-09 |
| `TabelaNumeros` | — | valor ausente ("não aplicável", "dados insuficientes") | Rótulo à esquerda (`cor.texto2`), valor à direita (`cor.texto`) | Lido como pares "rótulo: valor" | TL-09, TL-10 |
| `LinhaSobreOsDados` | — | normal · indisponível | `cor.dado`, ícone ⓘ, › | "Dados: SSP-SP, janeiro a setembro de 2026. Abrir Sobre os dados" | TL-07, TL-08 |
| `LinhaCategoria` | com detalhes (expansível) · simples | recolhida · expandida | `tipo.corpo`; parcela da comparação marcada em texto | "Furto, 7 registros, recolhido" | TL-11 |

## Feedback

| Componente | Variantes | Estados | Tokens | Acessibilidade | Telas |
|---|---|---|---|---|---|
| `Aviso` | informativo (ⓘ, `cor.dado`) · erro (⚠, `cor.erro`) · minuta (ⓘ, borda `cor.borda`) | com ação ("Tentar de novo ›") · sem ação | `cor.superficie2`, `raio.medio` | Anunciado ao aparecer (região ao vivo) | TL-01 a TL-06, TL-12, TL-13 |
| `Carregando` | tela inteira · em botão | — | Indicador nativo | Anuncia "Carregando" ou o texto ao lado | TL-01, TL-06 |
| `EstadoVazio` | — | — | `cor.texto2`, texto + ação sugerida | Texto lido normalmente | TL-04, TL-12 |
| `SeloExemplo` | — | — | `selo.exemplo` (`tokens.md`) | Lido como "exemplo" | Todos os dados de exemplo |

## Proibições de componente (valem para todos)

- Nenhum componente de **nota, estrela, barra de nível, termômetro ou semáforo** (RNF-04).
- Nenhum **marcador de ocorrência** ou mancha de calor no `MapaTrajeto` (US-15 AC4).
- `Indicativo`, `RotuloFoco` e `CardRota` **não** mudam de cor conforme o caso da comparação.
- `cor.erro` só em `Aviso` de erro, `CampoTexto` com erro e ação destrutiva.
