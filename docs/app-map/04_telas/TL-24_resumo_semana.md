# TL-24 · Resumo da semana (exemplo)

> **Revisão D-36 (19/11/2026):** tela nova do VoltaSegura+, **exemplo**. `[DECISÃO]` os números são fixos e marcados EXEMPLO; não são lidos do histórico do aparelho nesta versão (`[EM ABERTO]`, PL-35). Sem nota nem pontuação.

- **Status:** pronta para o protótipo (19/11/2026; aguarda revisão do Lucas) · **Exemplo (D-36)** · **Rota Expo Router:** `/(app)/plus/resumo`
- **Objetivo:** mostrar, em números simples, o que a pessoa fez na semana.
- **US/AC e funcionalidades cobertas:** FN-21 · **RNF aplicáveis:** RNF-01, RNF-07
- **Entradas:** "Ver tudo" e os números da home (TL-21).
- **Saídas:** voltar à TL-21.

## Wireframe

```
┌──────────────────────────────┐
│ ← Resumo da semana           │
│ 10 a 16 de novembro [EXEMPLO]│
│ Voltas feitas ............ 9 │
│ Tempo a pé ........ 2 h 40 min│
│ Horário mais usado ..... 18h30│
│ ┌──────────────────────────┐ │
│ │ Voltas por dia           │ │
│ │ 2  1  2  2  2 (Seg–Sex)  │ │
│ └──────────────────────────┘ │
│ Números de exemplo. Sem nota │
│ nem pontuação.               │
└──────────────────────────────┘
```

## Estrutura e componentes

`Tela` · linhas de resumo · cartão com colunas de barras (`accessible` com o texto completo) · `SeloExemplo`.

## Conteúdo e dados

`RESUMO_EXEMPLO` em `src/plus/exemplos.ts` (fixo). Nada é guardado.

## Ações do usuário

Nenhuma ação além de voltar.

## Estados

único (exemplo).

## Acessibilidade

- O gráfico é um único elemento com o texto de todos os dias (ex.: "Seg: 2, Ter: 1...").
- Os valores das linhas são lidos com o rótulo.

## Privacidade e linguagem

- Explica que são números de exemplo. Não dá nota, pontuação nem "mais seguro" (docs/05).

## Critérios de pronto da tela

- [x] Selo EXEMPLO e nota de que não há pontuação.
- [ ] Ligação com o histórico do aparelho (PL-35).
