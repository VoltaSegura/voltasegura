# TL-19 · VoltaSegura+: planos (simulação)

> **Revisão D-38 (19/11/2026, T25-B):** a aba Plus é um **portão**. Com assinatura simulada ativa, mostra a home do VoltaSegura+ (TL-21); sem ela, os planos desta tela. Trocar de aba não volta aos planos depois do teste.

> **Revisão D-36 (19/11/2026):** tela nova, aba Plus. `[DECISÃO]` simulação **sem cobrança**: mostra os dois planos com preço, mas não cobra, não guarda valor e não envia nada. Selo "Demonstração: nenhuma cobrança real". Revê o item 3 da D-31.

- **Status:** pronta para o protótipo (19/11/2026; aguarda revisão do Lucas) · **Simulação (D-36)** · **Rota Expo Router:** `/(app)/plus/index` (aba Plus)
- **Objetivo:** apresentar o VoltaSegura+ (mensal e anual) e levar ao teste de 7 dias simulado.
- **US/AC e funcionalidades cobertas:** FN-21 · sem US próprio no backlog (`[EM ABERTO]`, ver PL-35) · **RNF aplicáveis:** RNF-01, RNF-07
- **Entradas:** aba Plus da barra inferior.
- **Saídas:** TL-20 (confirmação), com o plano escolhido como parâmetro de navegação.

## Wireframe

```
┌──────────────────────────────┐
│ VoltaSegura+   [DEMONSTRAÇÃO] │
│ A volta de todo dia, já      │
│ pronta.                      │
│ Cadastre sua rotina...       │
│ [ Mensal R$ 9,90/mês ] [Anual]│   ← carrossel, um marcado
│ ● ○                          │
│ INCLUÍDO NOS DOIS PLANOS     │
│ ✓ Rotina da semana...        │
│ ✓ Minha volta pronta...      │
│ ✓ Compartilhar com um toque  │
│ ✓ Melhor horário para sair   │
│ ✓ Radar da rota              │
│ ✓ Resumo da semana           │
│ [   Testar 7 dias grátis   ] │
│ Depois, R$ 9,90/mês. Cancele │
│ quando quiser.               │
└──────────────────────────────┘
```

## Estrutura e componentes

`Tela` · `SeloDemo` (selo tracejado) · cartões de plano (`radio`, um marcado) em `ScrollView` horizontal com indicador de página · lista de itens com ícone de check · `Botao` primário.

## Conteúdo e dados

Textos de `src/textos/plus.ts`. Nenhum dado pessoal; a escolha do plano vive só na navegação (parâmetro `plano`), sem armazenamento.

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Desliza ou toca num plano | Marca o plano (anunciado) | TL-19 |
| "Testar 7 dias grátis" | Leva à confirmação com o plano | TL-20 |

## Estados

padrão · plano anual marcado. Sem estado de erro (nada é consultado).

## Acessibilidade

- Cada plano é um botão de rádio com nome e preço completos ("Mensal, R$ 9,90/mês. Renova todo mês...").
- O selo de demonstração é lido pelo leitor de tela.
- Alvos de toque de pelo menos 48 dp.

## Privacidade e linguagem

- Não há cobrança, cartão ou conta de pagamento. Nada do que é escolhido sai do aparelho.
- Proibido: "garantia", "segurança garantida" ou qualquer promessa de proteção (docs/05).

## Critérios de pronto da tela

- [x] Mostra o selo "Demonstração: nenhuma cobrança real" (D-36).
- [x] "Testar 7 dias grátis" não grava nem envia nada (teste em `src/__tests__/telas/plus/plus.test.tsx`).
- [ ] Revisão do Lucas dos preços e do texto do plano anual (PL-35).
