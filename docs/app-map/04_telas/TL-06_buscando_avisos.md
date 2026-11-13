# TL-06 · Buscando e avisos

- **Status:** pronta (aprovada por Lucas Simidu em 13/11/2026) · **Rota Expo Router prevista:** `/(app)/buscando` (substituída pela TL-07 no sucesso; não fica no histórico de voltar)
- **Objetivo:** mostrar que a consulta está em andamento e tratar os retornos sem resultado: sem transporte público no horário, sem rede, tempo esgotado, erro do servidor.
- **US/AC e funcionalidades cobertas:** US-08 AC2 · FN-07, FN-14 · **RNF aplicáveis:** RNF-06, RNF-07
- **Entradas:** TL-04 ("Ver alternativas").
- **Saídas:** TL-07 (sucesso), TL-04 (mudar a consulta), TL-03 (sessão expirada).

## Wireframe

**Estado buscando**

```
┌──────────────────────────────┐
│ ←  Ida · saída 23:00         │
│                              │
│            ( ◌ )             │
│   Buscando alternativas…     │
│                              │
│   Origem e destino são usados│
│   só para este cálculo.      │
│                              │
│ ┌──────────────────────────┐ │
│ │        Cancelar          │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**Estado sem transporte público no horário** (US-08 AC2)

```
┌──────────────────────────────┐
│ ←  Ida · saída 03:30         │
│                              │
│   ⓘ Não há alternativa de    │
│   transporte público neste   │
│   horário.                   │
│                              │
│ ┌──────────────────────────┐ │
│ │     Mudar o horário      │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**Estado sem rede**

```
│   ⚠ Sem conexão. Nada foi    │
│   enviado.                   │
│ ┌──────────────────────────┐ │
│ │     Tentar de novo       │ │
│ └──────────────────────────┘ │
│        Voltar ao planejamento│
```

**Estado tempo esgotado:** "O servidor demorou para responder." + "Tentar de novo".

**Estado erro do servidor:** "Não foi possível concluir agora." + "Tentar de novo".

## Estrutura e componentes

`Cabecalho` com o resumo da consulta (sentido e horário; **sem** endereço) · `Carregando` · `Texto` de privacidade · `Aviso` · `Botao` primário · `Link` secundário.

## Conteúdo e dados

Sentido e horário da consulta (locais); tipo de retorno da API (`09_dados_por_tela.md`, TL-06).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| "Cancelar" | Cancela a consulta | TL-04 |
| "Mudar o horário" | Volta com os pontos mantidos e o foco no horário | TL-04 |
| "Tentar de novo" | Reenvia a mesma consulta | TL-06 |
| Voltar | Volta ao planejamento | TL-04 |

## Estados

buscando · sem transporte público · sem rede · tempo esgotado · erro do servidor · sessão expirada (vai para TL-03 e volta).

## Validações e mensagens de erro

Ver estados. Nenhuma mensagem mostra código técnico (RNF-06).

## Textos

`buscando.*`, `erro.*` (catálogo em `08_microcopy.md`).

## Acessibilidade

O estado "buscando" é anunciado ("Buscando alternativas"); a mudança para aviso ou resultado também. "Cancelar" fica sempre alcançável.

## Privacidade e linguagem

- O cabeçalho mostra sentido e horário, não o endereço.
- Nenhuma comparação parcial nem resultado antigo é mostrado na falha (FL-13).

## Critérios de pronto da tela

- [ ] Sem serviço no horário: aviso e nenhuma comparação (US-08 AC2).
- [ ] Sem rede, tempo esgotado e erro do servidor têm "Tentar de novo" e preservam a consulta.
- [ ] O sucesso substitui esta tela pela TL-07 (voltar da TL-07 leva à TL-04).
