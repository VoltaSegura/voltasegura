# TL-23 · Radar da rota (exemplo)

> **Revisão D-36 (19/11/2026):** tela nova do VoltaSegura+, **exemplo**. `[DECISÃO]` o radar não consulta dados nem calcula alternativa. "Manter minha rota" só volta; a rota só muda por escolha da pessoa, e nesta versão a escolha de alternativa só mostra um aviso de exemplo.

- **Status:** pronta para o protótipo (19/11/2026; aguarda revisão do Lucas e de docs/05 para o texto do aviso, PL-36) · **Exemplo (D-36)** · **Rota Expo Router:** `/(app)/plus/radar`
- **Objetivo:** mostrar como um aviso sobre o trecho a pé seria comparado com uma alternativa, sem mudar a rota sozinho.
- **US/AC e funcionalidades cobertas:** FN-21 · **RNF aplicáveis:** RNF-01, RNF-02, RNF-07
- **Entradas:** cartão "Radar da rota" (TL-21).
- **Saídas:** voltar à TL-21 ("Manter minha rota").

## Wireframe

```
┌──────────────────────────────┐
│ [mapa decorativo]            │
├──────────────────────────────┤
│ ◎ Obra recente na região [EXEMPLO]│
│ Exemplo de aviso: uma obra   │
│ recente perto do trecho a pé.│
│ ┌──────────────────────────┐ │
│ │ A sugestão é só uma      │ │
│ │ comparação. Sua rota só  │ │
│ │ muda se você escolher.   │ │
│ └──────────────────────────┘ │
│ [   Ver alternativa   ]      │  → mostra "Esta alternativa é um exemplo..."
│ [   Manter minha rota ]      │  → volta, anuncia "Sua rota foi mantida."
│ Como o Radar funciona ▾      │
└──────────────────────────────┘
```

## Estrutura e componentes

`Tela` (sem rolagem) · `FundoMapa` · `SeloExemplo` · `Aviso` (alternativa de exemplo) · `Botao` primário e secundário · texto expansível.

## Conteúdo e dados

Textos `plus.radar*` de `src/textos/plus.ts`. Nenhum dado de ocorrência, obra ou rota é lido.

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| "Ver alternativa" | Mostra o aviso de exemplo | TL-23 |
| "Manter minha rota" | Anuncia e volta | TL-21 |
| "Como o Radar funciona" | Expande a explicação | TL-23 |

## Estados

inicial · alternativa de exemplo mostrada · explicação aberta.

## Acessibilidade

- Botão de expansão informa o estado (expandido ou não).
- O aviso de alternativa é lido ao aparecer.

## Privacidade e linguagem

- Texto que diz explicitamente que é exemplo e que nada é calculado.
- **Mudança em relação ao mockup:** o mockup 13 diz "Há uma ocorrência recente perto do trecho". A palavra "ocorrência" foi trocada por "aviso" e "obra recente" para não sugerir um marcador de ocorrência no caminho, proibido pelo docs/05 e pela TL-07 (ver PL-36).

## Critérios de pronto da tela

- [x] Selo EXEMPLO e texto de que a rota só muda por escolha.
- [x] Teste de "ver alternativa" e "manter" em `plus.test.tsx`.
- [ ] Revisão do texto pelo Lucas (PL-36).
