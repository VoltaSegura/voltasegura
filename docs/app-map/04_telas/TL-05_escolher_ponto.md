# TL-05 · Escolher ponto no mapa

> **Revisão D-29 (14/11/2026):** mapa em **tela cheia** com pino fixo no centro; por cima, busca por texto (só ao tocar em Buscar, mín. 3 letras, limitada a São Paulo, geocodificador do sistema) e voltar; botão de localização em ícone; painel inferior com ponto escolhido, **salvar este lugar** (nome + tipo, até 10, só no aparelho), lugares salvos em chips e "Usar este ponto". **Sem pontos de exemplo.** `[HIPÓTESE]` o aviso de privacidade deve citar a busca. Detalhes: `docs/redesign/08_home_busca_locais_arquitetura.md`.

- **Status:** pronta (aprovada por Lucas Simidu em 13/11/2026) · **Rota Expo Router prevista:** `/(app)/escolher-ponto` (modal; parâmetro `campo=origem|destino`)
- **Objetivo:** escolher origem ou destino tocando no mapa, sem busca de endereço externa (D-02).
- **US/AC e funcionalidades cobertas:** US-06 AC5, US-04 AC5 (salvar local no aparelho), US-16 AC1 · FN-04, FN-13 · **RNF aplicáveis:** RNF-02, RNF-07
- **Entradas:** TL-04 (folha de opções → "Escolher no mapa").
- **Saídas:** TL-04 com o campo preenchido; cancelar volta sem mudar.

## Wireframe

**Estado inicial**

```
┌──────────────────────────────┐
│ ✕  Escolher origem           │
│┌────────────────────────────┐│
││                            ││
││          MAPA              ││
││                            ││
││            ✛               ││
││     (mira fixa no centro)  ││
││                            ││
││                            ││
││       © OpenStreetMap      ││
││          contributors      ││
│└────────────────────────────┘│
│ Arraste o mapa para pôr o    │
│ ponto na mira.               │
│ ┌──────────────────────────┐ │
│ │    Usar este ponto       │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**Estado confirmar e salvar** (ao tocar em "Usar este ponto", PL-09 `[HIPÓTESE]`)

```
┌──────────────────────────────┐
│ Ponto escolhido no mapa      │
│ [ ] Salvar no aparelho como: │
│ ┌──────────────────────────┐ │
│ │ ex.: Faculdade           │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │        Confirmar         │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**Estado fora da área:** mesmo aviso da TL-04, com o botão "Usar este ponto" desabilitado enquanto a mira estiver fora do município (PL-11).

**Estado mapa não carregou (sem rede):** área do mapa com "Não foi possível carregar o mapa. Use um local salvo." e o botão "Voltar".

## Estrutura e componentes

`Cabecalho` modal (fechar) · `MapaTrajeto` em modo seleção, com mira fixa · `Texto` de instrução · `Botao` primário · `Folha` de confirmação com `Caixa` e `CampoTexto` · `Atribuicao` OSM.

## Conteúdo e dados

Coordenada do centro do mapa (só no aparelho até a consulta); nome digitado, se salvar (`09_dados_por_tela.md`, TL-05).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Arrasta ou dá zoom no mapa | Move a mira | TL-05 |
| "Usar este ponto" | Abre a confirmação | TL-05 (folha) |
| "Confirmar" | Preenche o campo; salva no aparelho se marcado | TL-04 |
| ✕ | Cancela | TL-04 |

## Estados

inicial · confirmar e salvar · fora da área · mapa não carregou.

## Validações e mensagens de erro

| Situação | Mensagem proposta |
|---|---|
| Mira fora do município | "Este ponto está fora da área atendida (município de São Paulo)." |
| Nome vazio com "Salvar" marcado | "Dê um nome para salvar o local." |

## Textos

`escolher_ponto.*` (catálogo em `08_microcopy.md`).

## Acessibilidade

- **Alternativa ao gesto no mapa:** o leitor de tela anuncia "Mapa para escolher um ponto. Use os locais salvos se preferir"; a folha de opções da TL-04 continua sendo o caminho sem mapa.
- O botão "Usar este ponto" fica fora do mapa, com alvo ≥ 48 dp.

## Privacidade e linguagem

- Sem campo de busca de endereço (D-02).
- **Nenhum marcador de ocorrência, mancha de calor ou rótulo de bairro** no mapa (US-15 AC4, RNF-02).
- O mapa base é externo (PL-03, limitação descrita na TL-13).
- O local salvo fica só no aparelho (US-04 AC4).

## Critérios de pronto da tela

- [ ] O ponto do centro do mapa preenche o campo certo (origem ou destino).
- [ ] O local salvo aparece em "Locais salvos" da TL-04 e não é enviado ao servidor.
- [ ] Atribuição OSM visível (US-16 AC1).
- [ ] Nenhum dado de ocorrência no mapa.
