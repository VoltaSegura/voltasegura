# TL-17 · Criar ou editar rotina

> **Revisão D-31 (15/11/2026):** tela nova do VoltaSegura+ em versão mínima. Origem e destino vêm dos **lugares salvos** (FN-13), sem digitar endereço. Textos `[HIPÓTESE]`.

- **Status:** rascunho (nova, 15/11/2026; aguarda revisão do Lucas) · **Depende do tempo (D-31)** · **Rota Expo Router:** `/(app)/rotina/editar` (`?id=` ao editar)
- **Objetivo:** cadastrar ou alterar uma rotina: origem, destino, dias da semana, horário de saída, antecedência do lembrete e se ele está ativo.
- **US/AC e funcionalidades cobertas:** US-22 AC1–AC5 · FN-17 · FN-13 (lugares) · **RNF aplicáveis:** RNF-01, RNF-05, RNF-07
- **Entradas:** TL-16 ("Nova rotina" ou toque numa rotina).
- **Saídas:** volta à TL-16 (com aviso se faltou permissão); TL-04 quando faltam lugares.

## Wireframe

```
┌──────────────────────────────┐
│ ←  Nova rotina               │
│ VoltaSegura+ · em validação  │
│ ORIGEM                       │
│ Casa, selecionado            │
│ [Casa] [Trabalho] [Estudo]   │
│ DESTINO                      │
│ [Casa] [Trabalho] [Estudo]   │
│ DIAS DA SEMANA               │
│ (Dom)(Seg)(Ter)(Qua)(Qui)... │
│ Horário de saída [ 07:45 ]   │
│  Use o formato 18:30.        │
│ Avisar antes da saída        │
│ [5 min][10][15][30 min]      │
│ Lembrete ativo        [sw]   │
│ O lembrete avisa só o        │
│ horário...                   │
│ [      Salvar rotina       ] │
│ Apagar rotina (ao editar)    │
│ Cancelar                     │
└──────────────────────────────┘
```

**Estado sem lugares suficientes:** aviso "Para criar uma rotina, salve pelo menos dois lugares (por exemplo, casa e trabalho) na tela inicial." e botão "Ir para a tela inicial".

**Estado erro de campo:** "Escolha a origem." · "Escolha o destino." · "Origem e destino precisam ser lugares diferentes." · "Escolha pelo menos um dia." · "Informe a hora no formato 18:30." Nada é salvo.

**Estado confirmar apagar:** "Apagar esta rotina? Isso não pode ser desfeito." com "Sim, apagar" e "Cancelar".

**Estado limite:** com 5 rotinas, ao criar: "Você já tem 5 rotinas. Apague uma para criar outra."

## Estrutura e componentes

`Tela` · `CartaoLocal` em faixa horizontal, com moldura de destaque no selecionado · botões de dia (`checkbox`) · `CampoTexto` (hora) · `Segmentado` (antecedência) · `Interruptor` · `Aviso` · `Botao`.

## Conteúdo e dados

Lugares do `LocaisContext`; rotina do armazenamento local. Ver `09_dados_por_tela.md`, TL-17.

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Toca num lugar | Define origem ou destino (anunciado) | TL-17 |
| Toca nos dias | Marca ou desmarca | TL-17 |
| "Salvar rotina" | Valida, salva só no aparelho; com lembrete ativo, pede a permissão (se ainda não houver) e programa | TL-16 |
| "Apagar rotina" → "Sim, apagar" | Apaga e cancela os lembretes | TL-16 |
| "Cancelar" | Descarta | TL-16 |

## Estados

novo · edição · sem lugares suficientes · erro de campo · salvando · confirmar apagar · limite.

## Validações e mensagens de erro

Origem e destino obrigatórios e diferentes; ao menos um dia; hora de 00:00 a 23:59 (aceita "7:45", guarda "07:45"). Antecedência: 5, 10, 15 (padrão) ou 30 min.

## Textos

`rotina.*` (`src/textos/rotina.ts`).

## Acessibilidade

- Cada dia é uma caixa de seleção com o nome completo ("segunda-feira") e estado marcado; cor não é o único sinal (o dia marcado também muda de cor e o estado é lido).
- O lugar escolhido é dito em texto ("Casa, selecionado") e anunciado ao tocar.
- Erros em texto, com papel de alerta; alvos de pelo menos 48 dp.

## Privacidade e linguagem

- Nada é enviado ao servidor; a tela repete que a rotina fica só no aparelho.
- Sem promessa de segurança, sem "rota segura", sem preço (US-22 AC5).

## Critérios de pronto da tela

- [ ] Salva origem, destino, dias e horário só no aparelho (US-22 AC1).
- [ ] Edita, desativa e apaga (US-22 AC3).
- [ ] Permissão só ao ativar a primeira rotina; negada mantém a rotina com aviso (US-22 AC4).
- [ ] Varredura de termos limpa (US-22 AC5).
