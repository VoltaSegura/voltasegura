# TL-25 · Gerenciar assinatura (simulação)

> **Revisão D-38 (19/11/2026, T25-B):** "Cancelar plano" agora **cancela de verdade a simulação**: apaga o registro do aparelho, anuncia "Assinatura simulada cancelada. Nada foi cobrado." e volta para a aba Plus (planos). "Trocar para o plano anual" continua só aviso. O botão de cancelar só aparece com assinatura ativa.

> **Revisão D-36 (19/11/2026):** tela nova, **simulação sem cobrança**. `[DECISÃO]` trocar de plano e cancelar só mostram um aviso: nada é cancelado, cobrado ou guardado. Selo "Demonstração: nenhuma cobrança real".

- **Status:** pronta para o protótipo (19/11/2026; aguarda revisão do Lucas) · **Simulação (D-36)** · **Rota Expo Router:** `/(app)/plus/assinatura`
- **Objetivo:** mostrar o estado simulado da assinatura e o que acontece ao cancelar.
- **US/AC e funcionalidades cobertas:** FN-21 · **RNF aplicáveis:** RNF-01, RNF-07
- **Entradas:** "Gerenciar assinatura" (TL-21).
- **Saídas:** voltar à TL-21.

## Wireframe

```
┌──────────────────────────────┐
│ ← Assinatura                 │
│ ┌──────────────────────────┐ │
│ │ VoltaSegura+ Mensal (Teste grátis)│
│ │ Teste grátis até ... 26 nov│
│ │ Depois ........ R$ 9,90/mês│
│ └──────────────────────────┘ │
│ Trocar para o plano anual ›  │  → aviso de simulação
│ [      Cancelar plano     ]   │  → aviso de simulação
│ Ao cancelar, suas rotinas... │
│ (Demonstração: nenhuma       │
│  cobrança real)              │
└──────────────────────────────┘
```

## Estrutura e componentes

`Tela` · cartão do plano · link de troca · `Botao` secundário · `Aviso` de simulação · `SeloDemo`.

## Conteúdo e dados

Data do teste calculada de hoje (+7 dias). Nenhum estado de assinatura é guardado: ao sair e voltar, a tela é a mesma.

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| "Trocar para o plano anual" | Aviso: "Simulação: nenhum plano foi trocado." | TL-25 |
| "Cancelar plano" | Aviso: "Simulação: nenhum plano foi cancelado." | TL-25 |

## Estados

padrão · com aviso de simulação.

## Acessibilidade

- O aviso é anunciado ao aparecer.
- O texto de rotinas bloqueadas (após cancelar) é lido como texto corrido.

## Privacidade e linguagem

- Nenhuma cobrança, nenhum dado de pagamento. Texto explica que as rotinas continuam no aparelho.
- O texto "ficam bloqueadas" descreve o cenário real de cancelamento de um produto futuro: `[HIPÓTESE]`, a validar (PL-35).

## Critérios de pronto da tela

- [x] Simulação sem gravação (teste em `plus.test.tsx`).
- [ ] Texto de cancelamento revisado pelo Lucas (PL-35).
