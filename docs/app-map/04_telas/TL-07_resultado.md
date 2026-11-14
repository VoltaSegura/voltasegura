# TL-07 · Resultado (mapa + container)

- **Status:** pronta (aprovada por Lucas Simidu em 13/11/2026) · **Rota Expo Router prevista:** `/(app)/resultado`
- **Objetivo:** mostrar **até 3 rotas**, cada uma com o seu foco. Em cima, um mapa com o trajeto inteiro da rota selecionada; embaixo, um container com os cards. **Prioridade: menor exposição estimada (D-23).** Quando existe, essa rota vem primeiro e já selecionada; sem ela, os cards vêm por tempo. Momento: **Comparar** e **Decidir** (`docs/03` §4).
- **US/AC e funcionalidades cobertas:** US-08 AC1, AC3–AC5; US-11 AC1–AC6; US-12 AC3; US-13 AC1–AC6; US-14 AC1 (linha fixa); US-16 AC1 · FN-08 · decisões D-01, D-09, D-12, D-13, D-16, D-23 (revê a D-10) · **RNF aplicáveis:** RNF-01 a RNF-04, RNF-06 a RNF-08
- **Entradas:** TL-06 (sucesso). Parâmetros: a resposta da consulta (rotas, focos, situação, sobre os dados).
- **Saídas:** TL-08 (detalhes da rota), TL-10 (sobre os dados), TL-04 (planejar a volta ou nova consulta).

## Exemplo usado nos wireframes (EXEMPLO, RNF-08)

Três candidatas para a volta da faculdade às 23h. Os tempos vêm do mockup e as contagens são inventadas.

| Rota | Tempo | A pé | Trocas | Trechos |
|---|---|---|---|---|
| A | 38 min | 0,9 km | 0 | a pé → ônibus 875A → a pé |
| B | 32 min | 1,4 km | 0 | a pé → metrô L4 → a pé |
| C | 35 min | 0,6 km | 1 | a pé → ônibus 702U → metrô L2 → a pé |

## Wireframe

**Estado sem foco de exposição** (o mais comum: sem diferença clara, mistos, dados insuficientes ou `L = 0`)

```
┌──────────────────────────────┐
│ ←  Volta · saída 23:00       │
│┌────────────────────────────┐│
││   MAPA                     ││
││   ●━━━━━━┓   rota B (forte)││
││          ┃                 ││
││   ┄┄┄┄┄┄┄┗━━━━━━■          ││
││   rota C (traço claro)     ││
││ © OpenStreetMap · SPTrans  ││
│└────────────────────────────┘│
│           ▔▔▔▔▔▔             │
│ 2 opções · ordenadas por tempo│
│┌────────────────────────────┐│
││▌[Menor tempo]      EXEMPLO ││
││▌32 min · 1,4 km a pé · 0 troca│
││▌a pé → Metrô L4 → a pé     ││
││▌Saída prevista 23:04      ›││
│└────────────────────────────┘│
│┌────────────────────────────┐│
││ [Menos caminhada]  EXEMPLO ││
││ 35 min · 0,6 km a pé · 1 troca│
││ a pé → 702U → Metrô L2 → a pé│
││ Saída prevista 23:02      ›││
│└────────────────────────────┘│
│ Dados: SSP-SP, jan–set/2026 ›│
│ Horários previstos (GTFS)    │
│ [ Planejar a volta ]→ ida    │
└──────────────────────────────┘
```

**Estado com foco de exposição** (CONCLUSIVO: A venceu B e C pela regra do `docs/08`, D-12). **A rota A vem primeiro, já selecionada, e o mapa abre no trajeto dela (D-23).**

```
│┌────────────────────────────┐│
││   MAPA: trajeto da rota A  ││
││   (forte); B e C claras    ││
│└────────────────────────────┘│
│ 3 opções · menor exposição   │
│ estimada primeiro            │
│┌────────────────────────────┐│
││▌[■◆ Menor exposição ■]     ││
││▌[■  estimada        ■] EXEMPLO│
││▌38 min · 0,9 km a pé · 0 troca│
││▌a pé → 875A → a pé        ›││
│└────────────────────────────┘│
│┌────────────────────────────┐│
││ [Menor tempo]      EXEMPLO ││
││ 32 min · 1,4 km a pé · 0 troca│
│└────────────────────────────┘│
│┌────────────────────────────┐│
││ [Menos caminhada]  EXEMPLO ││
││ 35 min · 0,6 km a pé · 1 troca│
│└────────────────────────────┘│
│ Dados: SSP-SP, jan–set/2026 ›│
```

`[■ … ■]` = rótulo em destaque (preenchido com `cor.acao`, texto `cor.acao.texto`). Os demais rótulos seguem neutros.

**Estado com outra opção** (B é a mais rápida e a de menos caminhada; sem foco de exposição; D-16)

```
│ 2 opções · ordenadas por tempo│
│┌────────────────────────────┐│
││▌[Menor tempo] [Menos       ││
││▌ caminhada]        EXEMPLO ││
││▌32 min · 0,5 km a pé · 0 troca│
│└────────────────────────────┘│
│┌────────────────────────────┐│
││ [Outra opção]      EXEMPLO ││
││ 35 min · 0,8 km a pé · 1 troca│
│└────────────────────────────┘│
```

**Estado uma rota** (uma candidata só, US-08 AC4)

```
│ 1 opção encontrada           │
│┌────────────────────────────┐│
││▌                   EXEMPLO ││
││▌32 min · 1,4 km a pé · 0 troca│
│└────────────────────────────┘│
│ Só uma opção neste horário:  │
│ não há comparação.           │
│ Dados: SSP-SP, jan–set/2026 ›│
```

**Estado container expandido:** ao tocar em "Expandir lista", o painel ocupa a tela e o mapa encolhe para uma faixa. O conteúdo é o mesmo. *Revisão de design PL-19 (13/11/2026, `[HIPÓTESE]`): o painel é fixo, sem alça nem gesto de arrastar (`07_design/tokens.md` R-08); a aparência atual está no `07_design/mockups/index.html`.*

## Estrutura e componentes

1. `Cabecalho` com voltar e o resumo (sentido · horário de saída; **sem** endereço)
2. `MapaTrajeto`: rota selecionada **acesa** (traço forte com halo), demais tracejadas, início ○ e fim ■, `Atribuicao` (texto do mapa base em aberto, PL-25)
3. `Container` (painel fixo, sem alça; botão "Expandir lista")
4. `Texto` "N opções · menor exposição estimada primeiro" (com o foco de exposição) ou "N opções · ordenadas por tempo" (sem ele) (D-23)
5. `CardRota` × até 3, com `RotuloFoco` (um ou dois), tempo, km a pé, trocas, sequência de modos, saída prevista e marca `EXEMPLO` quando for dado de exemplo
6. `LinhaSobreOsDados` fixa (D-09)
7. `Texto` "Horários previstos (GTFS)" (US-08 AC3)
8. `Botao` secundário "Planejar a volta" (ou "Planejar a ida", conforme o sentido)

## Conteúdo e dados

Rotas, focos, tempos, trechos e geometria vêm da resposta da API; a linha "Sobre os dados" também (`09_dados_por_tela.md`, TL-07; contrato FN-07).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Toca num card | Seleciona: o mapa destaca o trajeto (1º toque); abre os detalhes (toque em ›) | TL-07 / TL-08 |
| Toca numa rota no mapa | Seleciona o card correspondente | TL-07 |
| Toca em "Expandir lista" | Expande ou recolhe o painel | TL-07 |
| Toca na linha "Dados: …" | Abre o bloco completo | TL-10 |
| "Planejar a volta" | Inverte origem e destino, sentido volta | TL-04 |
| Voltar | Volta ao planejamento com os campos mantidos | TL-04 |

## Estados

sem foco de exposição · com foco de exposição · com outra opção · uma rota · container expandido · rota selecionada (qualquer card) · resposta sem dados da comparação (só focos de tempo e caminhada; a linha de dados diz "Comparação de registros indisponível" `[HIPÓTESE]`).

## Validações e mensagens de erro

Nenhuma validação. Erros de rede ficam na TL-06.

## Textos

`resultado.*`, `foco.*` (catálogo em `08_microcopy.md`). Rótulos de foco: "Menor tempo", "Menos caminhada", "Menor exposição estimada" (texto completo no TL-09: "Menor exposição estimada entre as alternativas avaliadas"), "Outra opção".

## Acessibilidade

- Cada `CardRota` é um único elemento para o leitor de tela, com rótulo completo. Ex.: "Opção 1 de 2. Menor tempo. 32 minutos, 1,4 quilômetro a pé, nenhuma troca. A pé, metrô linha 4, a pé. Toque duas vezes para ver os detalhes."
- **O foco não depende de cor:** é um rótulo com texto (e o ícone ◆ no foco de exposição). A barra ▌ da rota selecionada vem acompanhada de "selecionada" no rótulo.
- O mapa é complementar: tudo o que ele mostra também está nos cards.
- O container pode ser expandido por botão, além do gesto.

## Privacidade e linguagem

- **Proibidos:** "rota segura", "mais segura", "por segurança", verde/vermelho de seguro/perigoso, nota, estrelas, escala, semáforo (RNF-01, RNF-04).
- **Nenhum número de ocorrência** na tela principal (D-14); nada de marcadores de ocorrência no mapa (US-15 AC4).
- O foco de exposição só aparece no caso CONCLUSIVO (D-12); ausência de registro nunca vira foco (RNF-03, D-13).
- **Prioridade da menor exposição estimada (D-23):** com esse foco, a rota vem primeiro, já selecionada e com o rótulo em destaque. Sem ele, ordem por tempo. Em qualquer caso, todas as rotas ficam visíveis e selecionáveis, sem "recomendada", nota ou escala: o app não escolhe pela usuária (US-11 AC5).

## Critérios de pronto da tela

- [ ] Cada card mostra duração, km a pé, trocas e trechos (modo, linha, horário previsto) (US-08 AC1).
- [ ] Horários identificados como previstos (US-08 AC3).
- [ ] Até 3 rotas, cada uma com pelo menos um foco, ou "Outra opção" (D-12, D-16).
- [ ] Foco de exposição só no caso CONCLUSIVO; nunca com `L = 0` (D-12, D-13).
- [ ] Com o foco de exposição: essa rota em primeiro, selecionada, mapa no trajeto dela e rótulo em destaque; demais por tempo (D-23).
- [ ] Sem o foco de exposição: ordem por tempo com "ordenadas por tempo" (D-23).
- [ ] Uma candidata só: sem comparação (US-08 AC4).
- [ ] Linha "Sobre os dados" sempre visível (D-09, US-14 AC1).
- [ ] Tempo e registros nunca combinados numa nota (US-11 AC5, US-13 AC1).
- [ ] Varredura de termos proibidos limpa (US-13 AC3).
