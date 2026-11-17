# TL-04 · Planejar

> **Revisão D-30 (15/11/2026):** `[DECISÃO]` os cartões de lugares salvos mostram nome e, quando disponível, endereço legível em uma linha com reticências. Ao tocar, o nome continua sendo o rótulo de De onde/Para onde. Os campos mostram rótulos longos em uma linha com reticências. O cartão Adicionar lugar acompanha a altura dos cartões de lugar.

- **Status:** pronta, **revista pela D-29 em 14 e 15/11/2026** (sem Ida/Volta, mapa direto, lugares salvos, atalhos) · **Rota Expo Router:** `/(app)/planejar` (tela inicial com sessão)
- **Objetivo:** informar origem, destino e horário de saída e pedir as alternativas. Momento: **Planejar** e **Revisar a jornada** (`docs/03` §4).
- **US/AC e funcionalidades cobertas:** US-05 AC1–AC3, US-06 AC1–AC5, US-07 AC1–AC2, US-04 AC5, US-02 AC3 · FN-04, FN-05, FN-06, FN-13 · **RNF aplicáveis:** RNF-01, RNF-07, RNF-08
- **Entradas:** login (TL-03), cadastro (TL-02), "Planejar a volta" (TL-07/TL-08, com `sentido=volta` e pontos invertidos), lugar salvo, volta da TL-05 com o campo preenchido.
- **Saídas:** TL-05 (tocar em De onde ou Para onde, ou em "Adicionar lugar"), TL-06 (consulta enviada), TL-12 (ícone de configurações).
- **Imagens (placeholders, D-29):** `heroPlanejar` (topo), `vazioLocais` (sem lugares salvos), `localCasa`/`localTrabalho`/`localEstudo`/`localOutro` (cartões).

## Wireframe

**Estado inicial**

```
┌──────────────────────────────┐
│ [ imagem heroPlanejar     ⚙ ]│
│  VoltaSegura                 │
│  Para onde vamos?            │
│  Compare os caminhos...      │
│╭────────────────────────────╮│
││ ○ De onde                ⌖ ││   ⌖ = usar minha localização (um toque)
││   Sua localização ou um... ││
││ ─────────────────────── ⇅  ││   ⇅ = inverter
││ ● Para onde              › ││
││   Buscar destino ou ...    ││
│╰────────────────────────────╯│
│ (Agora)(Em 15 min)(Em 30)(1 h)│
│ Saída  [ 05:11 ]             │
│ Dia da saída: 15 de novembro │
│ [        Ver alternativas  ] │
│ Lugares salvos               │
│ ┌────┐ ┌────┐ ┌ ─ ─ ┐        │
│ │Casa│ │Trab│ │ +    │        │
│ └────┘ └────┘ │Adicionar│     │
└──────────────────────────────┘
```

**Vindo do resultado ("Planejar a volta")**: aparece a etiqueta "Planejando a volta", os pontos já vêm invertidos e o campo de hora se chama "Saída da volta". Não há seletor Ida/Volta.

**Sem lugares salvos:** cartão com a imagem `vazioLocais`, o texto "Salve casa, trabalho ou outro lugar..." e o botão "Adicionar lugar".

**Erros:** campo faltante, origem igual ao destino, fora da área, permissão de localização negada (aviso acima do horário), hora inválida.

## Estrutura e componentes
`Tela` com `Hero` (imagem, botão de configurações `BotaoIcone`) · painel com dois `CampoPonto` (origem com ação rápida de localização) e `BotaoIcone` inverter · `AtalhosHorario` · `SeletorHorario` · `Botao` "Ver alternativas" · faixa de `CartaoLocal` + `CartaoAdicionarLocal` · `Aviso`.

## Ações do usuário
| Gesto | Resultado | Próxima tela |
|---|---|---|
| Toca em De onde ou Para onde | Abre direto o mapa para aquele campo (não há mais menu de métodos) | TL-05 |
| Toca em ⌖ na origem | Pede a permissão (se preciso), lê a posição uma vez e preenche "Minha localização" | TL-04 |
| Toca em ⇅ | Troca origem e destino | TL-04 |
| Toca num atalho de horário | Define a saída (agora ou daqui a 15, 30 ou 60 min) | TL-04 |
| Digita a hora | Valida HH:mm ao sair do campo | TL-04 |
| Toca num lugar salvo | Preenche o destino; se o destino já está definido e falta a origem, preenche a origem | TL-04 |
| Toca em "Adicionar lugar" | Abre o mapa (destino) para marcar e salvar | TL-05 |
| Toca em "Ver alternativas" | Valida; se tudo certo, envia (campo faltante abre o mapa dele) | TL-06 |
| Toca em ⚙ | Configurações | TL-12 |

## Validações e mensagens de erro
| Campo | Regra | Mensagem | AC |
|---|---|---|---|
| Origem / destino | Obrigatórios | "Escolha a origem." / "Escolha o destino." | US-06 AC2 |
| Origem × destino | Diferentes | "Origem e destino são o mesmo lugar: não há trajeto a calcular." | US-06 AC4 |
| Origem / destino | Dentro do município (PL-11) | "Este ponto está fora da área atendida (município de São Paulo). Nada foi enviado." | US-06 AC3, D-05 |
| Horário | HH:mm; padrão agora | "Informe a hora no formato HH:mm." | US-06 AC1 |

## Acessibilidade
Cada campo é um botão com rótulo (valor) e dica (De onde / Para onde); o ícone de localização e o de inverter têm rótulo por extenso; mudança de origem, destino e inversão são anunciadas; imagens são decorativas (ocultas do leitor); alvos de 48 pt; texto até 200%.

## Privacidade e linguagem
- GPS só no toque em ⌖ (US-05 AC3). Lugares salvos só no aparelho (US-04 AC5).
- Sem rótulo de bairro ou área "de risco" (RNF-02). `[HIPÓTESE]` textos em `textos/hipotesesMapa.ts`.
- Histórico de trajetos ("Recentes") **não existe** nesta versão (FN-13, `[EM ABERTO]`).

## Critérios de pronto da tela
- [x] Origem, destino e horário preenchidos enviam a consulta (US-06 AC1).
- [x] Campo vazio não envia e abre o mapa daquele campo (US-06 AC2).
- [x] Ponto fora do município não envia (US-06 AC3); origem igual ao destino mostra o aviso (AC4).
- [x] Localização com um toque; permissão negada não bloqueia (US-05 AC1–AC2).
- [x] Sem seletor Ida/Volta; "Planejar a volta" inverte os pontos (US-07 AC1).
- [ ] Verificar no celular com fonte a 200%.
