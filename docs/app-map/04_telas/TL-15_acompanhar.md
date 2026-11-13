# TL-15 · Acompanhar viagem

- **Status:** rascunho (nova, 13/11/2026; aguarda revisão do Lucas) · **Depende do tempo (D-22)** · **Rota Expo Router prevista:** `/(app)/acompanhar/[token]` (aberta pelo link; exige sessão, PL-23)
- **Objetivo:** permitir que o contato acompanhe a viagem de quem compartilhou: trajeto, última posição, chegada estimada e estado.
- **US/AC e funcionalidades cobertas:** US-21 AC6–AC8 · FN-16 · **RNF aplicáveis:** RNF-01, RNF-02, RNF-06, RNF-07
- **Entradas:** link temporário (com o app instalado e sessão; senão, passa por TL-03).
- **Saídas:** voltar (para TL-04 do contato, se ele quiser usar o app).

## Wireframe

**Estado em andamento** (EXEMPLO)

```
┌──────────────────────────────┐
│ ←  Acompanhando uma viagem   │
│┌────────────────────────────┐│
││   MAPA                     ││
││   ●━━━━━━┓  trajeto        ││
││          ◉ posição (23:12) ││
││          ┗━━━━━━■          ││
││ © OpenStreetMap · SPTrans  ││
│└────────────────────────────┘│
│ Em andamento        EXEMPLO  │
│ Chegada estimada 23:36       │
│ Última atualização 23:12     │
│ (há 1 min)                   │
│                              │
│ Trajeto                      │
│ a pé → Metrô L4 → a pé       │
│ Horários previstos (GTFS)    │
└──────────────────────────────┘
```

**Estado só trajeto** (quem compartilha não liberou a posição ao vivo)

```
│ Em andamento                 │
│ ⓘ Esta viagem foi            │
│ compartilhada sem a posição  │
│ ao vivo: você vê o trajeto e │
│ a chegada estimada.          │
```

**Estado sem posição recente**

```
│ Última atualização 23:12     │
│ (há 9 min)                   │
```

Sem alerta e sem cor de perigo: o app não supõe o motivo (RNF-06).

**Estado chegou**

```
│ ✓ Chegou ao destino às 23:35 │
│ O acompanhamento terminou.   │
```

**Estado encerrado por quem compartilhou:** "O compartilhamento foi encerrado."

**Estado link expirado ou inválido:** "Este compartilhamento terminou." (sem mapa).

**Estado sem rede:** aviso "Sem conexão" e a última informação com o horário dela.

**Estado sem o app** (fora do app, página simples): "Para acompanhar esta viagem, instale o VoltaSegura." + links das lojas.

## Estrutura e componentes

`Cabecalho` · `MapaTrajeto` em modo acompanhamento (trajeto + `MarcadorPosicao` de quem compartilha; **não é marcador de ocorrência**) · `Texto` de estado · `TabelaNumeros` (chegada, última atualização) · `Texto` do trajeto · `Aviso`.

## Conteúdo e dados

Trajeto, última posição com horário, chegada estimada e estado vêm da API (FN-16; `09_dados_por_tela.md`, TL-15).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Abre o link | Abre o app nesta tela (login antes, se preciso) | TL-15 |
| Voltar | Sai do acompanhamento (pode reabrir pelo link enquanto ativo) | TL-04 |

## Estados

em andamento · só trajeto · sem posição recente · chegou · encerrado · link expirado · sem rede · sem o app (página externa).

## Validações e mensagens de erro

Nenhuma.

## Textos

`acompanhar.*` (catálogo em `08_microcopy.md`).

## Acessibilidade

- O estado ("Em andamento", "Chegou") é texto e é anunciado quando muda.
- A posição no mapa tem equivalente em texto ("Última atualização 23:12, há 1 minuto").
- O ícone ✓ de chegada vem sempre com o texto.

## Privacidade e linguagem

- O contato **não** vê o e-mail de quem compartilha, o histórico nem os números da comparação de exposição (US-21 AC8, `[HIPÓTESE]`).
- O trajeto e a posição não ficam guardados no aparelho do contato depois do fim `[HIPÓTESE]`.
- Sem marcadores de ocorrência nem rótulos de bairro (US-15 AC4, RNF-02).
- **Proibido:** "ela está segura", "risco", "alerta de perigo", e qualquer texto que responsabilize o contato (RNF-01, RNF-06).

## Critérios de pronto da tela

- [ ] O link só abre no app; sem o app, orienta a instalar (US-21 AC6).
- [ ] Mostra trajeto, última posição com horário, chegada estimada e estado (US-21 AC6).
- [ ] Link expirado mostra "terminou", sem dados (US-21 AC7).
- [ ] Nada da conta nem da comparação de quem compartilha (US-21 AC8).
