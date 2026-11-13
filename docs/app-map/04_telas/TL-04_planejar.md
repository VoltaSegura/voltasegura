# TL-04 · Planejar

- **Status:** pronta (aprovada por Lucas Simidu em 13/11/2026) · **Rota Expo Router prevista:** `/(app)/planejar` (tela inicial com sessão)
- **Objetivo:** informar origem, destino, horário de saída e sentido (ida ou volta) e pedir as alternativas. Momento: **Planejar** e **Revisar a jornada** (`docs/03` §4).
- **US/AC e funcionalidades cobertas:** US-05 AC1–AC3, US-06 AC1–AC5, US-07 AC1–AC2, US-04 AC2–AC5, US-02 AC3 · FN-04, FN-05, FN-06, FN-13 · **RNF aplicáveis:** RNF-01, RNF-07, RNF-08
- **Entradas:** login (TL-03), cadastro (TL-02), "Planejar a volta" (TL-07/TL-08, com `sentido=volta` e pontos invertidos), um trajeto do histórico.
- **Saídas:** TL-05 (escolher no mapa), TL-06 (consulta enviada), TL-12 (configurações).

## Wireframe

**Estado inicial (ida)**

```
┌──────────────────────────────┐
│ VoltaSegura            ⚙     │
│ ┌────────────┬─────────────┐ │
│ │  ● Ida     │   ○ Volta   │ │
│ └────────────┴─────────────┘ │
│ De onde                      │
│ ┌──────────────────────────┐ │
│ │ Escolher origem        › │ │
│ └──────────────────────────┘ │
│              ⇅ inverter      │
│ Para onde                    │
│ ┌──────────────────────────┐ │
│ │ Escolher destino       › │ │
│ └──────────────────────────┘ │
│ Saída                        │
│ ┌──────────────────────────┐ │
│ │ Hoje, 23:00            › │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │     Ver alternativas     │ │
│ └──────────────────────────┘ │
│ Recentes (no aparelho)     › │
└──────────────────────────────┘
```

**Estado opções de ponto** (ao tocar em origem ou destino, FL-05)

```
┌──────────────────────────────┐
│ Escolher origem          ✕   │
│ ┌──────────────────────────┐ │
│ │ ◎ Usar minha localização │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 🗺 Escolher no mapa       │ │
│ └──────────────────────────┘ │
│ Locais salvos no aparelho    │
│  · Faculdade                 │
│  · Casa                      │
│ Pontos de exemplo  EXEMPLO   │
│  · Exemplo: Av. Paulista     │
│  · Exemplo: Estação Sé       │
└──────────────────────────────┘
```

**Estado preenchido (volta, vindo da ida)**

```
│ ┌────────────┬─────────────┐ │
│ │  ○ Ida     │   ● Volta   │ │
│ └────────────┴─────────────┘ │
│ De onde                      │
│ │ Faculdade              › │ │
│ Para onde                    │
│ │ Casa                   › │ │
│ Saída da volta               │
│ │ Hoje, 23:00            › │ │
```

**Estado campo faltante** (US-06 AC2)

```
│ Para onde                    │
│ ┌──────────────────────────┐ │
│ │ Escolher destino       › │ │
│ └──────────────────────────┘ │
│ ⚠ Escolha o destino.         │
```

**Estado origem igual ao destino** (US-06 AC4)

```
│ ┌──────────────────────────┐ │
│ │ ⓘ Origem e destino são o  │ │
│ │ mesmo lugar: não há       │ │
│ │ trajeto a calcular.       │ │
│ └──────────────────────────┘ │
```

**Estado fora da área atendida** (US-06 AC3, D-05)

```
│ ┌──────────────────────────┐ │
│ │ ⓘ Este ponto está fora da │ │
│ │ área atendida (município  │ │
│ │ de São Paulo). Nada foi   │ │
│ │ enviado.                  │ │
│ └──────────────────────────┘ │
```

**Estado permissão de localização negada** (US-05 AC2)

```
│ ⓘ Sem acesso à localização.  │
│ Escolha no mapa ou num local │
│ salvo.                       │
```

**Estado sem rede:** aviso "Sem conexão. Você ainda pode escolher locais salvos." e o botão "Ver alternativas" desabilitado.

## Estrutura e componentes

1. `Cabecalho` com marca e atalho de configurações (⚙)
2. `SeletorSentido` (ida / volta)
3. `CampoPonto` origem
4. `Botao` ícone "inverter"
5. `CampoPonto` destino
6. `SeletorHorario` saída
7. `Botao` primário "Ver alternativas"
8. `Link` "Recentes (no aparelho)" (só se o histórico estiver ligado ou houver itens)
9. `Folha` (bottom sheet) de opções de ponto: `Botao` localização, `Botao` mapa, `Lista` locais salvos, `Lista` pontos de exemplo
10. `Aviso` (informativo e erro)

## Conteúdo e dados

Origem e destino vêm de GPS, mapa, local salvo ou exemplo; horário e sentido são locais (`09_dados_por_tela.md`, TL-04).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Toca em ida/volta | Muda o sentido; ao ir para volta com ida planejada, inverte os pontos (US-07 AC1) | TL-04 |
| Toca num campo de ponto | Abre a folha de opções | TL-04 (folha) |
| "Usar minha localização" | Pede permissão (se preciso), lê a posição uma vez | TL-04 |
| "Escolher no mapa" | Abre o mapa | TL-05 |
| Toca num local salvo ou exemplo | Preenche o campo | TL-04 |
| Toca em "inverter" | Troca origem e destino | TL-04 |
| Toca no horário | Abre o seletor de data e hora | TL-04 |
| Toca em "Ver alternativas" | Valida; se tudo certo, envia | TL-06 |
| Toca em "Recentes" | Lista do histórico local; um toque preenche os campos | TL-04 |
| Toca em ⚙ | Abre configurações | TL-12 |

## Estados

inicial · opções de ponto · preenchido · campo faltante · origem igual ao destino · fora da área atendida · permissão negada · lendo localização ("Obtendo localização…") · sem rede · recentes vazio ("Nenhum trajeto salvo. Ligue o histórico em Configurações.").

## Validações e mensagens de erro

| Campo | Regra | Mensagem proposta | AC |
|---|---|---|---|
| Origem / destino | Obrigatórios | "Escolha a origem." / "Escolha o destino." | US-06 AC2 |
| Origem × destino | Diferentes | "Origem e destino são o mesmo lugar: não há trajeto a calcular." | US-06 AC4 |
| Origem / destino | Dentro do município de São Paulo (checagem no aparelho, PL-11) | "Este ponto está fora da área atendida (município de São Paulo). Nada foi enviado." | US-06 AC3, D-05 |
| Horário | Obrigatório (padrão: agora) | — | US-06 AC1 |

## Textos

`planejar.*` (catálogo em `08_microcopy.md`).

## Acessibilidade

- `SeletorSentido` anunciado como grupo de opções ("Ida, selecionado").
- Cada `CampoPonto` tem rótulo ("Origem: Faculdade. Toque para mudar").
- O botão "inverter" tem rótulo "Inverter origem e destino".
- Mensagens de validação são anunciadas, e o foco vai para o primeiro campo com problema.

## Privacidade e linguagem

- Nenhuma busca de endereço em serviço externo (D-02, US-19 AC3).
- GPS só na ação "Usar minha localização" (US-05 AC3).
- Os pontos de exemplo levam o rótulo `EXEMPLO` (RNF-08).
- "Recentes" só existe no aparelho; o texto diz "no aparelho" (US-04 AC4).
- Nenhum rótulo de bairro ou de região "de risco" (RNF-02).

## Critérios de pronto da tela

- [ ] Origem, destino e horário preenchidos enviam a consulta (US-06 AC1).
- [ ] Campo vazio não envia e indica o campo (US-06 AC2).
- [ ] Ponto fora do município não envia e mostra o aviso (US-06 AC3).
- [ ] Origem igual ao destino mostra o aviso (US-06 AC4).
- [ ] "Usar minha localização" pede permissão e preenche; com a permissão negada, as outras opções seguem disponíveis (US-05 AC1–AC2).
- [ ] Volta inverte os pontos e tem horário próprio (US-07 AC1).
- [ ] Com o histórico ligado, a consulta é salva só no aparelho (US-04 AC2).
