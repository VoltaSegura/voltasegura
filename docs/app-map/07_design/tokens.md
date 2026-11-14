# Tokens de design

- **Status:** revisado (Fase 3 de 13/11/2026; **revisão de design PL-19 aplicada em 13/11/2026**, proposta `[HIPÓTESE]` aguardando a aprovação visual do Lucas no `mockups/index.html`)
- **Marca:** v10 (D-06, `[HIPÓTESE]` até a aprovação formal do grupo, T15): dourado `#FFC53D`, azul-marinho `#0D1B2A`, off-white `#F8F9FA`. O ciano `#4ECDC4` é cor funcional de dados e confiança (`docs/06` §3, paleta v7).
- **Contraste:** todas as razões abaixo foram **calculadas** com a fórmula de luminância relativa da WCAG 2.x (script local, 13/11/2026). Alvos: **4,5:1** para texto, **3:1** para elementos não textuais (bordas, traços do mapa, ícones).

## Revisão de design PL-19 (13/11/2026)

Feita com a skill `frontend-design` (plugin oficial), a pedido do Lucas. Ela trabalha em duas passadas: um plano de design ligado ao assunto e, depois, uma revisão do plano contra os padrões genéricos de interface.

**Assunto e trabalho principal.** Estudante voltando da faculdade à noite em São Paulo, celular na mão, pouca luz, às vezes em movimento. O trabalho da tela é **comparar 2 ou 3 trajetos em poucos segundos** e escolher.

**Conceito: "rota acesa".** O mapa da cidade fica apagado, e só a rota selecionada acende, como um fio de luz de poste. É a tradução visual da marca "Noite + Luz do caminho". **A ousadia fica num lugar só**, o traço da rota selecionada (com halo dourado) e a cena da abertura; todo o resto da interface fica quieto. O halo marca **seleção**, nunca exposição: qualquer rota selecionada acende do mesmo jeito.

**O que mudou e por quê**

| # | Antes | Agora | Motivo |
|---|---|---|---|
| R-01 | Fonte do sistema | **Atkinson Hyperlegible Next**, uma família só | A fonte do sistema era um padrão, não uma escolha. A Atkinson foi desenhada pelo Braille Institute para legibilidade em baixa visão, o que conversa com a leitura à noite e com o critério de acessibilidade da rubrica |
| R-02 | Duração em 18 pt no meio do texto | **Duração como número principal da opção** (`tipo.duracao`, 30 pt, 800, algarismos tabulares) | É o primeiro dado que a pessoa compara; o resto (km a pé, trocas, saída) fica em coluna ao lado |
| R-03 | Cards iguais com borda e raio único | **Linhas de lista com divisória**; a selecionada ganha fundo `cor.superficie2`, barra dourada de 4 px e o texto "selecionada" | Cards idênticos são o "kit SaaS" genérico; a lista lê mais rápido e aguenta fonte a 200% |
| R-04 | Metadados "38 min · 0,9 km a pé · 0 troca" | Colunas: "**0,9 km** a pé" / "Sem troca" / "Sai às 23:04 (previsto)" | Strings com ponto do meio são vício de template; "0 troca" vira "Sem troca" |
| R-05 | Modos em texto ("a pé → Ônibus 875A → a pé") | **Sequência de ícones + selos de linha** (a pé 5 min — ônibus 875A — a pé 4 min) | Vocabulário do transporte de SP: é assim que a pessoa reconhece a linha na plataforma |
| R-06 | — | **Selos de linha com as cores oficiais** do Metrô e da CPTM (seção "Linhas de transporte") | Reconhecimento imediato. Regra: a cor fica **só no selo, sempre com o número da linha**, e nunca pinta o traço da rota, o card ou um número |
| R-07 | Mapa claro demais para o halo | Mapa mais escuro e dessaturado (`cor.mapa.*`), com quadras e ruas | Para a rota acesa se destacar; traços conferidos de novo (ver tabelas) |
| R-08 | Container arrastável com 3 alturas | **Painel fixo**: mapa em cima, lista embaixo, botão "Expandir lista" | Arrastar pede bibliotecas de gesto que não estão instaladas, é a parte mais cara de construir e exige alternativa acessível. `[HIPÓTESE]` (resposta ao ponto 8 da lista do Lucas) |
| R-09 | "Sobre os dados" no fim da lista, podia sair da tela | **Linha fixa no rodapé do painel**, sempre visível | Cumpre a D-09 de verdade (o mockup antigo empurrava a linha para fora com 3 opções) |
| R-10 | "VS" em texto na abertura | **Cena da rota acesa** + nome + frase; único movimento automático do app | A abertura passa a mostrar o assunto. O movimento acontece uma vez e desliga com "reduzir movimento" |
| R-11 | Selo EXEMPLO com borda contínua | **Borda tracejada** | Tracejado = provisório. O texto continua em caixa alta porque é um carimbo exigido pela RNF-08, não um rótulo decorativo |
| R-12 | Links com "›" no fim | Chevron só em **linhas que navegam** para outra tela | Seta pendurada em link é vício de template |
| R-13 | Cabeçalho "Volta · saída 23:00" | Título "Sua volta" + subtítulo "Saída às 23:00" | Linguagem simples, sem ponto do meio |
| R-14 | Aviso de erro com borda | Aviso de erro com **filete lateral** `cor.erro` + ⚠; minuta com borda tracejada | Separa os três tipos de aviso sem pintar o fundo |
| R-15 | Ícones de traço sem família definida | **MaterialCommunityIcons** (`@expo/vector-icons`), uma família só | É a família do Expo com ícones de a pé, ônibus, metrô e trem |

**O que foi revisto e ficou como estava.** A paleta da marca: azul-marinho + dourado lembra o padrão genérico "fundo escuro + um acento", mas foi escolhida pelo grupo (D-06), e o briefing vence. Para não parecer genérica, o marinho é azulado (noite, não preto), o dourado aparece quase só como **luz** (rota selecionada, ação principal, foco de exposição) e o ciano tem papel próprio. Também ficaram o tema escuro como padrão com o claro seguindo o sistema, o destaque do foco de exposição (D-23), o vermelho-salmão de erro e o indicativo sem cor por caso.

**Continua em aberto:** mapa base e atribuição (PL-25); aprovação da marca (T15); cores oficiais das linhas a conferir nos manuais de identidade do Metrô e da CPTM; disponibilidade da Atkinson no Expo (pacote `@expo-google-fonts/atkinson-hyperlegible-next`, a confirmar na construção, com a fonte do sistema como reserva).

## Princípios deste produto

1. **Sem semântica de segurança na cor.** Não existe verde de "seguro" nem vermelho de "perigoso"; nenhuma rota, trecho ou número usa cor de alerta (RNF-04, `docs/plano_app.md` §4.5). **Exceção controlada (R-06):** as cores oficiais das linhas de Metrô e CPTM aparecem só dentro do selo da linha, sempre com o número, como identidade da linha.
2. **O foco de exposição tem prioridade visual (D-23).** "Menor exposição estimada" usa o rótulo **em destaque**: preenchido com `cor.acao`, texto `cor.acao.texto` e ícone ◆. Ele aparece na primeira opção, já selecionada. "Menor tempo", "Menos caminhada" e "Outra opção" ficam neutros (borda `cor.borda`). O destaque é de prioridade, não de segurança: nada de verde, check, escudo ou "recomendada".
3. **A cor nunca carrega sozinha um significado.** Sempre há texto ou ícone junto.
4. **Dourado é luz e ação, ciano é dado.** O dourado indica ação principal, a rota selecionada no mapa (com halo) e o foco de exposição. O ciano indica informação sobre os dados (linha "Sobre os dados", links de dados, ⓘ).
5. **A cor de erro serve só para erro de formulário e de sistema**, nunca para rota, trecho ou registro de ocorrência.
6. **Uma coisa acesa por tela (R-01 a R-10).** A rota selecionada (ou o botão principal, em telas sem mapa) é o único elemento em destaque. Nada de caixas, sombras ou cores sem função.

## Temas

`[HIPÓTESE]` **Tema escuro como padrão** (coerente com a marca "Noite + Luz do caminho" e com o uso noturno), e **tema claro** quando o sistema estiver em modo claro. Os dois temas atendem aos mesmos alvos de contraste. No claro, a rota selecionada é azul-marinho com halo dourado mais forte, como um marca-texto.

## Cores

### Tema escuro (padrão)

| Token | Valor | Uso | Contraste verificado |
|---|---|---|---|
| `cor.fundo` | `#0D1B2A` | Fundo das telas | — |
| `cor.superficie` | `#15263A` | Painel do resultado, folhas | — |
| `cor.superficie2` | `#1E3350` | Campo de texto, opção selecionada, aviso, item pressionado | — |
| `cor.divisoria` | `#24384F` | Divisórias de lista e de tabela (decorativas) | — |
| `cor.mapa.fundo` | `#16263A` | Fundo do mapa escuro | — |
| `cor.mapa.quadra` | `#1A2C41` | Quadras (referência do estilo de mapa) | — |
| `cor.mapa.rua` | `#22364F` | Ruas (decorativas, 1,24:1 de propósito: o mapa fica apagado) | — |
| `cor.texto` | `#F8F9FA` | Texto principal | 16,50:1 no fundo · 14,54:1 na superfície |
| `cor.texto2` | `#B8C2CC` | Texto secundário, legendas | 9,63:1 no fundo · 8,49:1 na superfície · 7,07:1 na superfície2 |
| `cor.acao` | `#FFC53D` | Botão primário (preenchimento), links de ação, foco do teclado | 11,02:1 no fundo · 9,71:1 na superfície · 8,09:1 na superfície2 |
| `cor.acao.texto` | `#0D1B2A` | Texto sobre `cor.acao` | 11,02:1 |
| `cor.dado` | `#4ECDC4` | Linha "Sobre os dados", links de dados, ícone ⓘ | 8,99:1 no fundo · 7,92:1 na superfície · 6,60:1 na superfície2 |
| `cor.erro` | `#FF9B8F` | Mensagem de erro de formulário e sistema | 7,54:1 na superfície |
| `cor.borda` | `#5A7393` | Bordas de campo, botão secundário, rótulo neutro | 3,57:1 no fundo |
| `cor.rota.selecionada` | `#FFC53D` | Traço da rota selecionada (6 px, contínuo) | **9,69:1** no mapa |
| `cor.rota.halo` | `#FFC53D` a 28% | Halo de 16 px sob a rota selecionada (decorativo) | — |
| `cor.rota.outra` | `#8FA3B8` | Traço das outras rotas (4 px, tracejado) | **5,90:1** no mapa |

### Tema claro

| Token | Valor | Uso | Contraste verificado |
|---|---|---|---|
| `cor.fundo` | `#F8F9FA` | Fundo | — |
| `cor.superficie` | `#FFFFFF` | Painel, folhas | — |
| `cor.superficie2` | `#EEF1F4` | Campo de texto, opção selecionada, aviso | — |
| `cor.divisoria` | `#DDE3E9` | Divisórias (decorativas) | — |
| `cor.mapa.fundo` | `#E9EDF1` | Fundo do mapa claro | — |
| `cor.mapa.quadra` | `#DFE5EB` | Quadras | — |
| `cor.mapa.rua` | `#FFFFFF` | Ruas | — |
| `cor.texto` | `#0D1B2A` | Texto principal | 16,50:1 no fundo · 17,39:1 na superfície |
| `cor.texto2` | `#4A5A6A` | Texto secundário | 6,73:1 no fundo · 7,09:1 na superfície |
| `cor.acao` | `#FFC53D` | **Só preenchimento** de botão primário e do rótulo de foco | 1,58:1 em branco: **não usar como texto** |
| `cor.acao.texto` | `#0D1B2A` | Texto sobre `cor.acao` | 11,02:1 |
| `cor.acao.link` | `#8A5A00` | Links de ação (dourado escuro) | 5,93:1 na superfície |
| `cor.dado` | `#0B6E69` | Linha "Sobre os dados", links de dados | 6,09:1 na superfície · 5,78:1 no fundo |
| `cor.erro` | `#B3261E` | Erro de formulário e sistema | 6,54:1 na superfície |
| `cor.borda` | `#8796A6` | Bordas | 3,02:1 na superfície |
| `cor.rota.selecionada` | `#0D1B2A` | Traço da rota selecionada | **14,78:1** no mapa claro |
| `cor.rota.halo` | `#FFC53D` a 55% | Halo sob a rota selecionada (marca-texto, decorativo) | — |
| `cor.rota.outra` | `#6B7E93` | Traço das outras rotas (tracejado) | **3,55:1** no mapa claro |

O estilo do mapa base depende do provedor (PL-25). Os traços de rota ganham contorno de 2 px na cor do fundo para manter o contraste sobre qualquer mapa `[HIPÓTESE]`.

### Linhas de transporte (R-06)

`[HIPÓTESE]` Cores aproximadas das identidades oficiais, **a conferir** nos manuais do Metrô e da CPTM. O texto do selo é o que passa de 4,5:1 (branco, azul-marinho ou preto). Linhas de ônibus usam selo neutro: borda `cor.borda`, texto `cor.texto`.

| Linha | Fundo | Texto | Contraste |
|---|---|---|---|
| L1 Azul | `#0455A1` | branco | 7,45:1 |
| L2 Verde | `#007E5E` | branco | 5,07:1 |
| L3 Vermelha | `#EE372F` | **preto** `#000000` | 5,2:1 (branco 4,02 e marinho 4,33 não passam) |
| L4 Amarela | `#FFD400` | marinho | 12,15:1 |
| L5 Lilás | `#9B3894` | branco | 6,20:1 |
| L15 Prata | `#9E9E9E` | marinho | 6,49:1 |
| L7 Rubi | `#CA016B` | branco | 5,63:1 |
| L8 Diamante | `#97A098` | marinho | 6,46:1 |
| L9 Esmeralda | `#01A9A7` | marinho | 5,99:1 |
| L10 Turquesa | `#049FC3` | marinho | 5,59:1 |
| L11 Coral | `#F68368` | marinho | 6,93:1 |
| L12 Safira | `#133C8D` | branco | 10,20:1 |
| L13 Jade | `#00B352` | marinho | 6,27:1 |

Regras: o selo sempre traz o identificador ("L4"); o leitor de tela lê o nome completo ("Linha 4-Amarela do metrô"); as cores das linhas **não** pintam traços de rota, cards, números nem indicativos.

## Tipografia

`[HIPÓTESE]` **Atkinson Hyperlegible Next** (R-01), uma família só, pesos 400, 600, 700 e 800. Reserva: fonte do sistema (San Francisco no iOS, Roboto no Android). Os tamanhos são em pontos independentes e **escalam com a configuração de fonte do sistema** (RNF-07).

| Token | Tamanho / linha | Peso | Uso |
|---|---|---|---|
| `tipo.marca` | 30 / 36 | 800 | Nome na abertura (TL-01) |
| `tipo.duracao` | 30 / 32 | 800, algarismos tabulares | Duração na opção ("32 min", com "min" em 15 / 700) |
| `tipo.titulo` | 24 / 32 | 700 | Título de tela aberta |
| `tipo.secao` | 20 / 28 | 700 | Títulos de seção |
| `tipo.cabecalho` | 17 / 22 | 700 | Título no cabeçalho (com subtítulo em `tipo.apoio`) |
| `tipo.corpo` | 16 / 24 | 400 | Texto padrão, campos |
| `tipo.corpo.forte` | 16 / 24 | 700 | Botões, rótulos importantes |
| `tipo.apoio` | 14 / 20 | 400 | Texto secundário, rótulos de campo (600) |
| `tipo.rotulo` | 13 / 18 | 600 | Rótulo de foco, legenda |
| `tipo.selo` | 11 / 16 | 700 | Selo EXEMPLO (carimbo) |

Nenhum texto corrido abaixo de 13 pt; o selo EXEMPLO (11 pt, caixa alta, 700) é a única exceção, por ser um carimbo curto. Números de tempo, distância e contagem usam algarismos tabulares. Linhas de texto corrido com no máximo ~70 caracteres.

## Espaçamento, raio e elevação

| Token | Valor | Uso |
|---|---|---|
| `esp.1` | 4 | Ajuste fino |
| `esp.2` | 8 | Entre rótulo e campo |
| `esp.3` | 12 | Dentro da opção |
| `esp.4` | 16 | Margem lateral das telas |
| `esp.6` | 24 | Entre seções |
| `esp.8` | 32 | Respiro de telas abertas (TL-01) |
| `raio.pequeno` | 6 | Rótulo de foco, selo EXEMPLO |
| `raio.medio` | 12 | Campo, aviso, segmentado |
| `raio.botao` | 14 | Botões |
| `raio.pilula` | metade da altura | Selo de linha |
| `elevacao` | **sem sombra**; borda superior `cor.divisoria` no painel | Separação por cor e divisória, não por sombra (R-03) |

A hierarquia de raio é intencional: botão (14) > campo e aviso (12) > rótulo (6); selo de linha em pílula, como nas placas.

## Toque

| Token | Valor |
|---|---|
| `toque.minimo` | 48 × 48 dp (todo elemento interativo, incluindo links e ícones) |
| `toque.espaco` | 8 dp entre alvos vizinhos |

## Movimento

| Token | Valor | Uso |
|---|---|---|
| `mov.acende` | 1,6 s, curva de saída suave, uma vez | A rota se desenha na abertura (TL-01). É o **único movimento automático** do app |
| `mov.resposta` | 150 a 250 ms | Só em resposta a ação: abrir modal, expandir lista, trocar a rota selecionada |
| — | — | Com "reduzir movimento" ligado no sistema, nada se move: a rota já aparece desenhada |

## Ícones

`[HIPÓTESE]` **MaterialCommunityIcons** (R-15), de `@expo/vector-icons`, sempre com rótulo de texto ao lado ou rótulo de acessibilidade.

| Ícone | Uso | Observação |
|---|---|---|
| ◆ (losango) | Foco "Menor exposição estimada" | Sempre com o texto do foco |
| a pé, ônibus, metrô, trem | Modo do trecho e sequência de modos | Sempre com o nome do modo ou o selo da linha |
| ⓘ | Aviso informativo, linha de dados | Cor `cor.dado` |
| ⚠ | Erro de formulário ou de sistema | Cor `cor.erro`; **nunca** em rota ou trecho |
| ⚙ | Configurações | Rótulo "Configurações" |
| ⇅ | Inverter origem e destino | Rótulo "Inverter origem e destino" |
| ◎ | Usar minha localização | — |
| › | Linha que navega para outra tela | Não usar no fim de link de texto (R-12) |

**Proibido:** escudo, cadeado ou check verde associado à rota; caveira, alerta ou triângulo vermelho em trecho; estrelas, notas ou barras de nível.

## Marca de exemplo

`selo.exemplo`: texto "EXEMPLO" em `tipo.selo`, com **borda tracejada** `cor.borda` e texto `cor.texto2` (R-11). Aparece em toda opção, tabela ou número vindo de dado de exemplo (RNF-08).

> **Nota 14/11/2026 (D-28/D-29):** a identidade visual vigente está em `src/mobile-app/DESIGN.md` (Sora + Atkinson, degradê, fio de luz). Imagens com reserva em `src/theme/imagens.ts`; ícones MaterialCommunityIcons (`@expo/vector-icons`). Este arquivo segue valendo para contraste e semântica de cor.
