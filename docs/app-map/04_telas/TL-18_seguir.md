# TL-18 · Seguir rota

- **Status:** rascunho (18/11/2026, aguarda revisão do Lucas) · **implementada no código, sem commit e sem validação no aparelho** (`src/mobile-app/src/app/(app)/seguir/[rotaId].tsx`, `src/mobile-app/src/seguir/`) · **Rota Expo Router:** `/(app)/seguir/[rotaId]`
- **Objetivo:** acompanhar, no trajeto escolhido, a posição da pessoa e o próximo passo, enquanto ela segue a rota.
- **US/AC e funcionalidades cobertas:** US-23 AC1–AC8 · **RNF aplicáveis:** RNF-01, RNF-05, RNF-06, RNF-07
- **Decisão:** D-34 (revê D-04 e US-05 AC3); regime de sessão e indicador da D-20; posição só no aparelho (D-21).
- **Entradas:** TL-08 (botão "Seguir esta rota").
- **Saídas:** voltar ao resultado (TL-07).

## Wireframe

**Intro** (antes de começar)

```
┌──────────────────────────────┐
│ ←  Seguir rota               │
│┌────────────────────────────┐│
││   MAPA do trajeto          ││
││   ●━━━━━━┓                 ││
││          ┗━━━━━━■ destino   ││
│└────────────────────────────┘│
│ O mapa acompanha sua posição │
│ no trajeto enquanto o app    │
│ estiver aberto e a tela      │
│ ligada. Você pode encerrar   │
│ a qualquer momento.          │
│                              │
│ Sua posição fica neste       │
│ aparelho, a não ser que você │
│ esteja compartilhando.       │
│                              │
│ [        Começar        ]    │
└──────────────────────────────┘
```

**Acompanhando** (sessão ativa; o indicador fica fixo no topo e não pode ser ocultado)

```
│ ● Acompanhando sua posição   [Parar] │
│┌────────────────────────────┐        │
││   MAPA do trajeto          │        │
││   ●━━━━━━┓  trecho atual    │        │
││          ◉ Você está aqui   │        │
││          ┗━━━━━━■ destino   │        │
│└────────────────────────────┘        │
│ Próximo passo                        │
│ Caminhe 300 m até o ponto de         │
│ embarque                             │
│ 1,2 km · cerca de 14 min restantes   │
│ Chegada prevista às 23:36            │
```

**Procurando posição**

```
│ Procurando sua posição…      │
```

**Sem permissão**

```
│ Sem acesso à localização não │
│ dá para acompanhar o trajeto.│
│ Você pode liberar o acesso   │
│ nas configurações do aparelho│
│ [ Tentar de novo ]           │
```

**Fora do trajeto**

```
│ Você saiu do trajeto. Volte  │
│ ao resultado para planejar   │
│ de novo a partir daqui.      │
│ [ Voltar ao resultado ]      │
```

**Chegou**

```
│ ✓ Você chegou ao destino.    │
│ Acompanhamento encerrado.    │
```

**Encerrado** (por "Parar"): "Acompanhamento encerrado."

**Sem trajeto desenhado:** "Esta rota não tem trajeto desenhado para acompanhar." (sem mapa, sem botão de começar)

**Versão web:** "O acompanhamento do trajeto está disponível no app do celular."

## Estrutura e componentes

`Cabecalho` · `MapaSeguir` (trajeto + marcador "Você está aqui" + destino; botão recentrar) · `IndicadorAcompanhando` (fixo no topo, com "Parar") · `Texto` do próximo passo e do restante · `Aviso` (sem permissão, fora do trajeto, erro de GPS) · `Botao`.

## Conteúdo e dados

Trajeto e trechos vêm da rota escolhida (TL-08). A posição vem do GPS do aparelho e não é guardada depois do fim da sessão (D-34, item 3).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| "Seguir esta rota" | Mostra a intro | TL-18 (intro) |
| "Começar" | Pede permissão e inicia a leitura | TL-18 (acompanhando) |
| "Parar" (indicador) | Encerra a leitura | TL-18 (encerrado) → TL-07 |
| Chegar ao destino | Mostra "Você chegou" e encerra sozinho | TL-07 |
| "Voltar ao resultado" | Sai da sessão | TL-07 |
| "Recentrar" | Volta o mapa para a posição | TL-18 |

## Estados

pronto (intro) · pedindo permissão · sem permissão · buscando GPS · acompanhando · fora do trajeto · chegou · encerrado · erro de GPS · sem trajeto desenhado.

## Validações e mensagens de erro

- Sem permissão: "Sem acesso à localização não dá para acompanhar o trajeto. Você pode liberar o acesso nas configurações do aparelho."
- Erro de GPS: "Não foi possível ler sua posição agora. Tente de novo."

## Textos

`seguir.*` (`src/mobile-app/src/textos/seguir.ts`; catálogo em `08_microcopy.md` a revisar).

## Acessibilidade

- O estado ("Acompanhando sua posição", "Você chegou") é texto e é anunciado quando muda.
- O botão "Parar" tem alvo de pelo menos 48 × 48 dp e rótulo para leitor de tela.
- A posição no mapa tem equivalente em texto ("Você está aqui").
- O ✓ de chegada vem sempre com o texto.

## Privacidade e linguagem

- Leitura só depois de "Começar", com o indicador visível (US-23 AC1 e AC3).
- Posição fica no aparelho (D-21); nada é guardado depois do fim da sessão (US-23 AC5).
- **Proibido:** "rota segura", "trajeto seguro", "você está protegida", "área perigosa" e qualquer texto que diga que a navegação garante segurança (`docs/05`, RNF-01).
- **Nome do botão:** a D-20 usa "Parar"; o app usa "Encerrar" hoje. `[EM ABERTO]` (D-34, item 8).

## Critérios de pronto da tela

- [ ] Nenhuma leitura de posição antes de "Começar" (US-23 AC1).
- [ ] Permissão negada não inicia a leitura e explica como liberar (US-23 AC1).
- [ ] Indicador visível com botão de parar, sem possibilidade de ocultar (US-23 AC3).
- [ ] Encerra sozinho na chegada (US-23 AC4).
- [ ] Nada do trajeto fica guardado depois do fim (US-23 AC5).
- [ ] Sem texto proibido pelo `docs/05` (US-23 AC8).
- [ ] Validado no aparelho (`[EM ABERTO]`; sem teste no celular ainda).

## Revisão de 19/11/2026 — pós-teste no aparelho (itens 8 e 9)
- **Aviso de início:** a intro "O mapa acompanha sua posição…" ganha a caixa "Entendi e não mostrar de novo" (`checkbox-nao-mostrar-intro`). Marcada e com "Começar", a preferência é gravada no aparelho (`voltasegura.seguir.introOculta`, `src/seguir/armazenamento.ts`) e a intro não aparece nas próximas vezes. Permissão, erros e a informação "Sua posição fica neste aparelho…" continuam visíveis.
- **Encerrar/Fechar:** volta direto para a home (Planejar) com `dismissAll()` + `replace('/planejar')`, em vez de um `back()` por tela.
