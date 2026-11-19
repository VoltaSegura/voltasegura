# TL-21 · VoltaSegura+: home (simulação e rotina do aparelho)

> **Revisão D-38 (19/11/2026, T25-B):** a home lista **todas** as rotinas do aparelho (até 5), em um cartão cada, com "Editar" e "Abrir minha volta pronta" por rotina. Há "Nova rotina" e "Gerenciar rotinas" (leva à TL-16). Sem rotina, convida a cadastrar uma. A mesma home aparece na aba Plus quando há assinatura simulada; o badge "Teste grátis · até DD MMM" usa a data de início gravada.

> **Revisão D-36 (19/11/2026):** tela nova, aba Plus depois do teste simulado. `[DECISÃO]` mostra a **rotina salva no aparelho** (D-31); o cartão de radar e o resumo são **exemplos** (selo EXEMPLO, TL-23 e TL-24). Sem backend.

- **Status:** pronta para o protótipo (19/11/2026; aguarda revisão do Lucas) · **Simulação e exemplo (D-36)** · **Rota Expo Router:** `/(app)/plus/home`
- **Objetivo:** reunir a volta do dia (rotina), o radar e o resumo em uma tela, e dar acesso à volta pronta e à assinatura simulada.
- **US/AC e funcionalidades cobertas:** US-22 (rotina, FN-17) · FN-21 · **RNF aplicáveis:** RNF-01, RNF-05, RNF-07
- **Entradas:** TL-20 ("Começar teste grátis").
- **Saídas:** TL-22 (volta pronta), TL-17 (editar ou cadastrar rotina), TL-23 (radar), TL-24 (resumo), TL-25 (assinatura).

## Wireframe

```
┌──────────────────────────────┐
│ VoltaSegura+  [Teste grátis  │
│               · até 26 nov]  │
│ [DEMONSTRAÇÃO]               │
│ ┌──────────────────────────┐ │
│ │ HOJE · QUARTA-FEIRA Editar│
│ │ Casa para Trabalho        │
│ │ Origem › Destino          │
│ │ (Saída 18:30) (Lembrete 15)│
│ │ [ Abrir minha volta pronta]│
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ ◎ Radar da rota  [EXEMPLO]│
│ │ texto de exemplo          │
│ └──────────────────────────┘ │
│ Resumo da semana    Ver tudo │
│ [9] [2 h 40] [18h30]  [EXEMPLO]│
│ Gerenciar assinatura      ›  │
└──────────────────────────────┘
```

Sem rotina salva: "Você ainda não tem rotina..." e botão "Cadastrar rotina".

## Estrutura e componentes

`Tela` · cartão da rotina (primeira ativa, ou a primeira) · `Icone` · chips de saída e lembrete · `Botao` · cartão de radar (`Pressable`) · três números do resumo · `SeloDemo`, `SeloExemplo`.

## Conteúdo e dados

- Rotina: `RotinaContext` (só no aparelho; FN-17).
- Radar e resumo: `src/plus/exemplos.ts` (fixos, EXEMPLO).
- Data do teste: calculada de hoje (+7 dias), sem armazenamento.

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| "Editar" (cartão da rotina) | Abre a rotina | TL-17 |
| "Abrir minha volta pronta" | Abre a volta com a rotina | TL-22 |
| "Cadastrar rotina" (vazio) | Cria uma rotina | TL-17 |
| Cartão do radar | Abre o radar | TL-23 |
| "Ver tudo" ou os números | Abre o resumo | TL-24 |
| "Gerenciar assinatura" | Abre a assinatura | TL-25 |

## Estados

com rotina · sem rotina · carregando (a rotina ainda não foi lida: sem texto de vazio).

## Acessibilidade

- O cartão do radar é um botão com o texto completo do aviso de exemplo.
- Os números do resumo são lidos com o rótulo; o selo EXEMPLO é anunciado.

## Privacidade e linguagem

- Nada sai do aparelho. "Teste grátis" é um rótulo de simulação, sem cobrança.
- O aviso de radar não fala em ocorrência nem em área: é um exemplo de "obra recente" (ver PL-36).

## Critérios de pronto da tela

- [x] Mostra a rotina salva ou o estado vazio (teste de navegação em `plus.test.tsx` não cobre esta tela: `[EM ABERTO]`).
- [ ] Teste automatizado da home (rotina presente e vazia) ainda não existe.
