# TL-08 · Detalhes da rota (trechos e passo a passo)

- **Status:** pronta (aprovada por Lucas Simidu em 13/11/2026) · **Rota Expo Router prevista:** `/(app)/resultado/[rotaId]` (container expandido da TL-07; voltar recolhe)
- **Objetivo:** mostrar a rota dividida em trechos, em ordem, com embarque e desembarque. É o passo a passo **só de leitura** (D-04). Os trechos a pé têm o botão "Por que esta rota?" (D-08).
- **US/AC e funcionalidades cobertas:** US-09 AC1; US-08 AC1, AC3; US-10 AC5 · FN-09 · **RNF aplicáveis:** RNF-01, RNF-07, RNF-08
- **Entradas:** TL-07 (toque em › num card). Parâmetro: `rotaId`.
- **Saídas:** TL-09 (por que esta rota?), TL-07 (voltar), TL-04 (planejar a volta).

## Wireframe

**Estado padrão** (rota C do exemplo, EXEMPLO)

```
┌──────────────────────────────┐
│┌────────────────────────────┐│
││ MAPA (faixa)  trecho 1 em  ││
││ destaque  ●━━┓┄┄┄┄┄■       ││
│└────────────────────────────┘│
│ ←  Menos caminhada  EXEMPLO  │
│ 35 min · 0,6 km a pé · 1 troca│
│                              │
│ ① A pé · 250 m · 4 min       │
│   Da origem até o ponto      │
│   Rua Exemplo, 100           │
│   [ Por que esta rota? ]     │
│ │                            │
│ ② Ônibus 702U · 9 min        │
│   Embarque 23:02 (previsto)  │
│   Ponto Exemplo A → Ponto    │
│   Exemplo B                  │
│ │                            │
│ ③ Metrô L2 · 14 min          │
│   Embarque 23:15 (previsto)  │
│   Estação Exemplo 1 → Estação│
│   Exemplo 2 · 1 troca        │
│ │                            │
│ ④ A pé · 350 m · 6 min       │
│   Até o destino              │
│   [ Por que esta rota? ]     │
│                              │
│ Horários previstos (GTFS)    │
│ Dados: SSP-SP, jan–set/2026 ›│
│ [ Planejar a volta ]         │
└──────────────────────────────┘
```

**Estado trecho selecionado:** ao tocar num trecho, o mapa destaca só aquele trecho e o item ganha a marca "selecionado".

**Estado rota sem trecho a pé** (`L = 0`): nenhum botão "Por que esta rota?"; no fim, a nota "Esta opção não tem trecho a pé." e a linha "Sobre os dados".

**Estado parada sem nome na resposta:** mostra o modo e a linha, sem o nome da parada (`[HIPÓTESE]`, FL-14).

## Estrutura e componentes

`MapaTrajeto` (faixa) · `Cabecalho` com voltar, rótulo(s) de foco e resumo · `ListaTrechos` com `ItemTrecho` (ícone do modo, número, linha, duração, distância a pé, embarque e desembarque, horário previsto) · `BotaoPorQue` (só em trecho a pé) · `Texto` horários previstos · `LinhaSobreOsDados` · `Botao` secundário.

## Conteúdo e dados

Trechos da rota selecionada (`09_dados_por_tela.md`, TL-08). Nenhum número de ocorrência.

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Toca num trecho | Destaca no mapa | TL-08 |
| "Por que esta rota?" (trecho a pé) | Abre os motivos | TL-09 |
| Linha "Dados: …" | Abre o bloco | TL-10 |
| "Planejar a volta" | Inverte e muda o sentido | TL-04 |
| Voltar | Recolhe o container | TL-07 |

## Estados

padrão · trecho selecionado · rota sem trecho a pé · parada sem nome.

## Validações e mensagens de erro

Nenhuma.

## Textos

`detalhes.*`, `modo.*` (catálogo em `08_microcopy.md`).

## Acessibilidade

- Lista ordenada: o leitor de tela anuncia "Trecho 1 de 4, a pé, 250 metros, 4 minutos".
- `BotaoPorQue` com rótulo "Por que esta rota? Trecho 1, a pé".
- Ícones de modo sempre acompanhados de texto ("Ônibus", "Metrô").

## Privacidade e linguagem

- **Só leitura:** sem acompanhar a posição nem navegação ao vivo (D-04, US-05 AC3).
- Nenhum número de ocorrência por trecho (D-08, US-20 AC2).
- Nenhum rótulo de risco no trecho (RNF-02).
- Nomes de ruas e paradas nos wireframes são de exemplo (RNF-08).

## Critérios de pronto da tela

- [ ] Trechos em ordem, com embarque e desembarque (US-09 AC1).
- [ ] Modo, linha e horário previsto em cada trecho de veículo (US-08 AC1, AC3).
- [ ] "Por que esta rota?" só nos trechos a pé (D-08).
- [ ] Rota sem trecho a pé sem o botão, com a nota (US-10 AC5).
