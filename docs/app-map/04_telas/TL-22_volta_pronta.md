# TL-22 · Sua volta está pronta (exemplo)

> **Revisão D-36 (19/11/2026):** tela nova do VoltaSegura+. `[DECISÃO]` horários, tempos e trajeto são **exemplos** (selo EXEMPLO): nada é calculado para a rotina. O botão de compartilhar fica **desabilitado** nesta tela até existir uma rota real (`[EM ABERTO]`, PL-37).

- **Status:** pronta para o protótipo (19/11/2026; aguarda revisão do Lucas) · **Exemplo (D-36)** · **Rota Expo Router:** `/(app)/plus/volta-pronta` (`?id=` da rotina; sem `id`, usa um nome de exemplo)
- **Objetivo:** mostrar, na hora de sair, a volta da rotina com um mapa decorativo e as opções de horário.
- **US/AC e funcionalidades cobertas:** FN-21 · **RNF aplicáveis:** RNF-01, RNF-02, RNF-07
- **Entradas:** TL-21 ("Abrir minha volta pronta").
- **Saídas:** voltar à TL-21; "Dados: SSP-SP" leva a TL-10.

## Wireframe

```
┌──────────────────────────────┐
│ [mapa decorativo]            │
├──────────────────────────────┤
│ Casa para Trabalho · 18:30   │
│ Sua volta está pronta [EXEMPLO]│
│ Melhor horário para sair     │
│ (Agora)(+15 min)(+30)(+1 h)  │
│ Exemplo: não calculado.      │
│ ┌──────────────────────────┐ │
│ │ 40 min                   │ │
│ │ 1,0 km a pé · 1 troca    │ │
│ │ (A pé 35 min) › (Linha 000)│
│ └──────────────────────────┘ │
│ [ Compartilhar com um toque ]│  ← desabilitado
│ Disponível pela tela da rota │
│ Dados: SSP-SP, jan–set/2026 ›│
└──────────────────────────────┘
```

## Estrutura e componentes

`Tela` (sem rolagem) · `FundoMapa` (decorativo, escondido do leitor de tela) · `SeloExemplo` · atalhos de horário (`radio`) · cartão de resultado · `Botao` desabilitado · link de rodapé.

## Conteúdo e dados

Rotina (nome e hora) do `RotinaContext`; tempos e trajeto de `VOLTA_EXEMPLO` (`src/plus/exemplos.ts`). Nada é consultado nem guardado.

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Toca num atalho | Marca o horário (anunciado); não recalcula | TL-22 |
| "Dados: SSP-SP" | Abre a explicação dos dados | TL-10 |

## Estados

com rotina (nome e hora da rotina) · sem rotina (nome de exemplo e hora atual).

## Acessibilidade

- Atalhos são botões de rádio com rótulo; o selo EXEMPLO é lido.
- O mapa decorativo não é anunciado.
- O botão desabilitado explica onde o compartilhamento acontece.

## Privacidade e linguagem

- Não há localização nesta tela. Não usa "rota segura" nem promete menos exposição: o texto diz que é exemplo.

## Critérios de pronto da tela

- [x] Selo EXEMPLO e nota de que nada é calculado.
- [x] Botão de compartilhar desabilitado (`[EM ABERTO]` PL-37).
