# TL-20 · VoltaSegura+: confirmação do teste (simulação)

> **Revisão D-38 (19/11/2026, T25-B):** "Começar teste grátis" grava a assinatura simulada **no aparelho**: só o plano escolhido e a data de início (SecureStore, chave `voltasegura.plus`). Nenhum valor, dado de pagamento ou chamada ao servidor. Depois, segue para a TL-21.

> **Revisão D-36 (19/11/2026):** tela nova, simulação sem cobrança. `[DECISÃO]` "Começar teste grátis" só abre a home simulada (TL-21): nenhum pagamento, nenhum valor guardado e nenhuma chamada ao servidor.

- **Status:** pronta para o protótipo (19/11/2026; aguarda revisão do Lucas) · **Simulação (D-36)** · **Rota Expo Router:** `/(app)/plus/confirmacao` (`?plano=mensal|anual`; apresentada como tela comum da pilha)
- **Objetivo:** mostrar o que começa no teste e o que cobra depois, antes de "começar".
- **US/AC e funcionalidades cobertas:** FN-21 · **RNF aplicáveis:** RNF-01, RNF-07
- **Entradas:** TL-19.
- **Saídas:** TL-21 (substitui a confirmação na pilha); voltar à TL-19.

## Wireframe

```
┌──────────────────────────────┐
│ Começar teste de 7 dias      │
│ Você usa tudo do VoltaSegura+│
│ de graça até o fim do teste. │
│ Plano ............... Mensal │
│ Teste grátis até ..... 26 nov│
│ Depois ........ R$ 9,90/mês  │
│ [   Começar teste grátis   ] │
│        Voltar                │
│ (Demonstração: nenhuma       │
│  cobrança real)              │
└──────────────────────────────┘
```

## Estrutura e componentes

`Tela` · linhas de resumo (rótulo e valor) · `Botao` primário · `Botao` de texto "Voltar" · `SeloDemo`.

## Conteúdo e dados

Data do fim do teste calculada a partir de hoje (+7 dias), sem armazenamento. Textos de `src/textos/plus.ts` (`confirmacao*`, `linha*`, `comecar`, `voltar`).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| "Começar teste grátis" | Anuncia a simulação e substitui a tela pela home simulada | TL-21 |
| "Voltar" | Volta sem alterar nada | TL-19 |

## Estados

único. Sem erro possível (não há operação real).

## Acessibilidade

- Resumo lido linha a linha (rótulo e valor).
- O selo de demonstração é lido ao final; o anúncio ao começar repete que nada é cobrado.

## Privacidade e linguagem

- Explicita "Demonstração: nenhuma cobrança real". Sem dados de cartão, e-mail ou CPF.

## Critérios de pronto da tela

- [x] Resumo com plano, data e valor depois do teste.
- [x] "Começar" não grava nem chama o servidor (teste em `plus.test.tsx`).
