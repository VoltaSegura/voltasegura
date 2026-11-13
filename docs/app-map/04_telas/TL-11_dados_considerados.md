# TL-11 · Dados considerados

- **Status:** pronta (aprovada por Lucas Simidu em 13/11/2026) · **Rota Expo Router prevista:** `/(app)/dados-considerados`
- **Objetivo:** mostrar os totais de Furto, Roubo e Ocorrências de trânsito **de cada rota**, no corredor dos trechos a pé, com as parcelas, e o panorama municipal de outras ocorrências contra a pessoa, só por ação deliberada (D-14, `docs/07`).
- **US/AC e funcionalidades cobertas:** US-15 AC1–AC4 · FN-11 · **RNF aplicáveis:** RNF-02, RNF-03, RNF-07
- **Entradas:** TL-09, TL-10.
- **Saídas:** voltar.

## Wireframe

**Estado padrão** (EXEMPLO)

```
┌──────────────────────────────┐
│ ←  Dados considerados        │
│ ┌────────────┬─────────────┐ │
│ │●Menor tempo│ Menos camin.│ │
│ └────────────┴─────────────┘ │
│ Registros perto dos trechos a│
│ pé desta opção · SSP-SP,     │
│ jan–set/2026, noite  EXEMPLO │
│                              │
│ Furto                    7 › │
│ Roubo                    3 › │
│ Ocorrências de trânsito  1   │
│                              │
│ ⓘ Só "furto – outros" e      │
│ "roubo – outros" entram na   │
│ comparação. Os totais acima  │
│ incluem outros tipos.        │
│                              │
│ Outras ocorrências contra a  │
│ pessoa (município)         › │
└──────────────────────────────┘
```

**Estado detalhes de Furto** (ao tocar em ›)

```
│ Furto                    7 ˅ │
│   Furto – outros         4   │  ← entra na comparação
│   Furto de carga         0   │
│   Furto de veículo       3   │
```

**Estado detalhes de Roubo**

```
│ Roubo                    3 ˅ │
│   Roubo – outros         2   │  ← entra na comparação
│   Roubo de carga         0   │
│   Roubo de veículo       1   │
│   Latrocínio             0   │
```

**Estado panorama municipal** (ação deliberada, US-15 AC3)

```
┌──────────────────────────────┐
│ ←  Outras ocorrências contra │
│    a pessoa                  │
│ ┌──────────────────────────┐ │
│ │ ⓘ Total do município de   │ │
│ │ São Paulo, jan–set/2026.  │ │
│ │ Não descreve a rua nem o  │ │
│ │ trajeto consultado.       │ │
│ └──────────────────────────┘ │
│ Homicídio doloso      [n]    │
│ Tentativa de homicídio[n]    │
│ Estupro               [n]    │
│ Estupro de vulnerável [n]    │
│ Fonte: SSP-SP (CC-BY 4.0)    │
└──────────────────────────────┘
```

`[n]` = valor real da base (a definir na construção; não inventar números).

**Estado contagem insuficiente:** em vez do número, "dados insuficientes" (risco de identificação ou recorte pequeno, `docs/07`).

**Estado grupo indisponível:** "indisponível", nunca zero.

## Estrutura e componentes

`Cabecalho` · `SeletorRota` (abas com o rótulo de foco de cada rota exibida) · `Texto` de contexto (área, fonte, período, faixa do dia) · `LinhaCategoria` × 3, expansível · `Aviso` informativo do recorte · `Link` panorama municipal · tela do panorama com `Aviso` fixo.

## Conteúdo e dados

Totais e parcelas por rota, panorama municipal, fonte e período, todos vindos da API (`09_dados_por_tela.md`, TL-11).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Toca numa aba | Mostra os totais daquela rota | TL-11 |
| Toca em Furto ou Roubo | Expande as parcelas | TL-11 |
| "Outras ocorrências contra a pessoa" | Abre o panorama municipal | TL-11 (subtela) |
| Voltar | Volta | origem |

## Estados

padrão · detalhes de Furto · detalhes de Roubo · panorama municipal · contagem insuficiente · grupo indisponível.

## Validações e mensagens de erro

Nenhuma.

## Textos

`dados_considerados.*` (catálogo em `08_microcopy.md`). Nomes das naturezas conforme `docs/07`.

## Acessibilidade

Linhas expansíveis anunciadas como "Furto, 7 registros, recolhido. Toque para ver os detalhes". A parcela que entra na comparação é dita em texto, não só por marca visual.

## Privacidade e linguagem

- **Não pode:** marcador no mapa, filtro por rua, endereço ou data exata (US-15 AC4); panorama municipal fora desta subtela ou ligado ao trajeto (US-15 AC3); o nome "crimes hediondos" (`docs/07`).
- Os totais dos grupos **não** aparecem como o valor comparado (US-15 AC2).
- Trânsito não é equiparado a crime intencional (`docs/07`).
- Zero não quer dizer que nada aconteceu (RNF-03).

## Critérios de pronto da tela

- [ ] Furto, Roubo e Trânsito por rota, com "Ver detalhes" (US-15 AC1, D-14).
- [ ] Aviso de que só os "outros" entram na comparação (US-15 AC2).
- [ ] Panorama municipal só por ação deliberada, com o aviso (US-15 AC3).
- [ ] Sem filtros finos nem marcadores (US-15 AC4).
