# Tokens de design

- **Status:** rascunho (Fase 3, 13/11/2026)
- **Marca:** v10 (D-06, `[HIPÓTESE]` até a aprovação formal do grupo, T15): dourado `#FFC53D`, azul-marinho `#0D1B2A`, off-white `#F8F9FA`. O ciano `#4ECDC4` é cor funcional de dados e confiança (`docs/06` §3, paleta v7).
- **Contraste:** todas as razões abaixo foram **calculadas** com a fórmula de luminância relativa da WCAG 2.x (script local, 13/11/2026). Alvos: **4,5:1** para texto, **3:1** para elementos não textuais (bordas, traços do mapa, ícones).

## Princípios deste produto

1. **Sem semântica de segurança na cor.** Não existe verde de "seguro" nem vermelho de "perigoso"; nenhuma rota, trecho ou número usa cor de alerta (RNF-04, `docs/plano_app.md` §4.5).
2. **O foco de exposição tem prioridade visual (D-23).** "Menor exposição estimada" usa o rótulo **em destaque**: preenchido com `cor.acao`, texto `cor.acao.texto` e ícone ◆. Ele aparece no primeiro card, já selecionado. "Menor tempo", "Menos caminhada" e "Outra opção" ficam neutros (borda `cor.borda`). O destaque é de prioridade, não de segurança: nada de verde, check, escudo ou "recomendada".
3. **A cor nunca carrega sozinha um significado.** Sempre há texto ou ícone junto.
4. **Dourado é marca e ação, ciano é dado.** O dourado indica ação principal e a rota selecionada no mapa. O ciano indica informação sobre os dados (linha "Sobre os dados", links de dados).
5. **A cor de erro serve só para erro de formulário e de sistema**, nunca para rota, trecho ou registro de ocorrência.

## Temas

`[HIPÓTESE]` **Tema escuro como padrão** (coerente com a marca "Noite + Luz do caminho" e com o uso noturno), e **tema claro** quando o sistema estiver em modo claro. Os dois temas atendem aos mesmos alvos de contraste.

## Cores

### Tema escuro (padrão)

| Token | Valor | Uso | Contraste verificado |
|---|---|---|---|
| `cor.fundo` | `#0D1B2A` | Fundo das telas | — |
| `cor.superficie` | `#15263A` | Cards, container, folhas | — |
| `cor.superficie2` | `#1E3350` | Campo de texto, item pressionado | — |
| `cor.mapa.fundo` | `#1B2B3D` | Referência do mapa escuro | — |
| `cor.texto` | `#F8F9FA` | Texto principal | 16,50:1 no fundo · 14,54:1 na superfície |
| `cor.texto2` | `#B8C2CC` | Texto secundário, legendas | 9,63:1 no fundo · 8,49:1 na superfície |
| `cor.acao` | `#FFC53D` | Botão primário (preenchimento), links de ação, foco do teclado | 11,02:1 no fundo · 9,71:1 na superfície |
| `cor.acao.texto` | `#0D1B2A` | Texto sobre `cor.acao` | 11,02:1 |
| `cor.dado` | `#4ECDC4` | Linha "Sobre os dados", links de dados, ícone ⓘ | 8,99:1 no fundo · 7,92:1 na superfície |
| `cor.erro` | `#FF9B8F` | Mensagem de erro de formulário e sistema | 7,54:1 na superfície |
| `cor.borda` | `#5A7393` | Bordas de campo e card | 3,57:1 no fundo |
| `cor.rota.selecionada` | `#FFC53D` | Traço da rota selecionada no mapa | 9,12:1 no mapa |
| `cor.rota.outra` | `#8FA3B8` | Traço das outras rotas (com traço tracejado) | 5,55:1 no mapa |

### Tema claro

| Token | Valor | Uso | Contraste verificado |
|---|---|---|---|
| `cor.fundo` | `#F8F9FA` | Fundo | — |
| `cor.superficie` | `#FFFFFF` | Cards, container | — |
| `cor.superficie2` | `#EEF1F4` | Campo de texto; referência do mapa claro | — |
| `cor.texto` | `#0D1B2A` | Texto principal | 16,50:1 no fundo · 17,39:1 na superfície |
| `cor.texto2` | `#4A5A6A` | Texto secundário | 6,73:1 no fundo · 7,09:1 na superfície |
| `cor.acao` | `#FFC53D` | **Só preenchimento** de botão primário | 1,58:1 em branco: **não usar como texto** |
| `cor.acao.texto` | `#0D1B2A` | Texto sobre `cor.acao` | 11,02:1 |
| `cor.acao.link` | `#8A5A00` | Links de ação (dourado escuro) | 5,93:1 na superfície |
| `cor.dado` | `#0B6E69` | Linha "Sobre os dados", links de dados | 6,09:1 na superfície · 5,78:1 no fundo |
| `cor.erro` | `#B3261E` | Erro de formulário e sistema | 6,54:1 na superfície |
| `cor.borda` | `#8796A6` | Bordas | 3,02:1 na superfície |
| `cor.rota.selecionada` | `#0D1B2A` | Traço da rota selecionada | 15,34:1 no mapa claro |
| `cor.rota.outra` | `#6B7E93` | Traço das outras rotas (tracejado) | 3,68:1 no mapa claro |

O mapa base (tiles) tem cores próprias. Os traços de rota ganham contorno de 2 px na cor do fundo para manter o contraste sobre ruas e áreas verdes do mapa `[HIPÓTESE]`.

## Tipografia

`[HIPÓTESE]` Fonte do sistema (San Francisco no iOS, Roboto no Android), que dispensa carregar fontes e respeita o tamanho de texto do aparelho. Os tamanhos são em pontos independentes e **escalam com a configuração de fonte do sistema** (RNF-07).

| Token | Tamanho / linha | Peso | Uso |
|---|---|---|---|
| `tipo.titulo` | 24 / 32 | 700 | Título de tela (TL-01) |
| `tipo.secao` | 20 / 28 | 600 | Cabeçalho de tela, títulos de seção |
| `tipo.destaque` | 18 / 24 | 600 | Duração no card ("32 min") |
| `tipo.corpo` | 16 / 24 | 400 | Texto padrão, campos |
| `tipo.corpo.forte` | 16 / 24 | 600 | Rótulos de campo, nome do trecho |
| `tipo.apoio` | 14 / 20 | 400 | Texto secundário, legendas, "previsto" |
| `tipo.rotulo` | 13 / 18 | 600 | Rótulo de foco, selo EXEMPLO |

Nenhum texto abaixo de 13 pt. Números de tempo e distância usam algarismos tabulares, quando disponíveis.

## Espaçamento, raio e elevação

| Token | Valor | Uso |
|---|---|---|
| `esp.1` | 4 | Ajuste fino |
| `esp.2` | 8 | Entre rótulo e campo |
| `esp.3` | 12 | Dentro do card |
| `esp.4` | 16 | Margem lateral das telas, entre cards |
| `esp.6` | 24 | Entre seções |
| `esp.8` | 32 | Respiro de telas abertas (TL-01) |
| `raio.pequeno` | 6 | Rótulo de foco, selo |
| `raio.medio` | 12 | Card, campo, botão |
| `raio.grande` | 20 | Topo do container (bottom sheet) |
| `elevacao.container` | sombra sutil ou borda superior `cor.borda` | Container sobre o mapa |

## Toque

| Token | Valor |
|---|---|
| `toque.minimo` | 48 × 48 dp (todo elemento interativo, incluindo links e ícones) |
| `toque.espaco` | 8 dp entre alvos vizinhos |

## Ícones

`[HIPÓTESE]` Conjunto de ícones de traço do próprio Expo (`@expo/vector-icons`), sempre com rótulo de texto ao lado ou rótulo de acessibilidade.

| Ícone | Uso | Observação |
|---|---|---|
| ◆ (losango) | Foco "Menor exposição estimada" | Sempre com o texto do foco |
| a pé, ônibus, metrô, trem | Modo do trecho | Sempre com o nome do modo |
| ⓘ | Aviso informativo, linha de dados | Cor `cor.dado` |
| ⚠ | Erro de formulário ou de sistema | Cor `cor.erro`; **nunca** em rota ou trecho |
| ⚙ | Configurações | Rótulo "Configurações" |
| ⇅ | Inverter origem e destino | Rótulo "Inverter origem e destino" |
| ◎ | Usar minha localização | — |

**Proibido:** escudo, cadeado ou check verde associado à rota; caveira, alerta ou triângulo vermelho em trecho; estrelas, notas ou barras de nível.

## Marca de exemplo

`selo.exemplo`: texto "EXEMPLO" em `tipo.rotulo`, com borda `cor.borda` e texto `cor.texto2`. Aparece em todo card, tabela ou número vindo de dado de exemplo (RNF-08).
