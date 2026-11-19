# TL-16 · Rotina da semana (lista)

> **Revisão D-36 (19/11/2026):** a lista não mudou de conteúdo; a entrada também chega pela home do VoltaSegura+ (TL-21). Visual revisto junto com a aba Plus.
>
> **Revisão D-31 (15/11/2026):** tela nova do VoltaSegura+ em versão mínima. `[DECISÃO]` rotina só no aparelho, lembrete local por horário, recurso em validação e sem preço. Textos `[HIPÓTESE]`.

- **Status:** rascunho (nova, 15/11/2026; aguarda revisão do Lucas) · **Depende do tempo (D-31)** · **Rota Expo Router:** `/(app)/rotina` (arquivo `rotina.tsx`; `?aviso=sem_permissao|erro_aviso` quando volta da TL-17)
- **Objetivo:** listar as rotinas da semana, ligar ou desligar o lembrete de cada uma e chegar à criação e à edição.
- **US/AC e funcionalidades cobertas:** US-22 AC1, AC3–AC5 · FN-17 · **RNF aplicáveis:** RNF-01, RNF-05, RNF-07
- **Entradas:** Configurações (TL-12), grupo "VoltaSegura+ · recurso em validação".
- **Saídas:** TL-17 (nova ou editar); voltar à TL-12.

## Wireframe

**Estado com rotinas**

```
┌──────────────────────────────┐
│ ←  Rotina da semana          │
│ VoltaSegura+ · recurso em    │
│ validação                    │
│ Cadastre um trajeto fixo...  │
│ Sem cobrança durante a       │
│ validação. O lembrete avisa  │
│ só o horário...              │
│ A rotina fica só neste       │
│ aparelho...                  │
│ SUAS ROTINAS                 │
│ ┌──────────────────────────┐ │
│ │ ◷ Casa para Trabalho   › │ │
│ │   Dias úteis, saída às   │ │
│ │   07:45                  │ │
│ │ Lembrete de Casa para... │ │
│ │ [switch]                 │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │      Nova rotina         │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**Estado vazio:** "Você ainda não tem uma rotina. Crie uma para receber o lembrete antes de sair."

**Estado permissão negada** (ao ligar o lembrete sem permissão, US-22 AC4): aviso informativo "As notificações estão desativadas neste aparelho, então o lembrete não será enviado. A rotina continua salva..."; o interruptor continua ligado e a rotina mantida.

**Estado limite:** com 5 rotinas, "Você já tem 5 rotinas. Apague uma para criar outra." e "Nova rotina" desabilitado.

## Estrutura e componentes

`Tela` · `Texto` (selo, introdução, privacidade) · `Aviso` · `EstadoVazio` · `GrupoLinhas`/`LinhaGrupo` (uma por rotina) · `Interruptor` (lembrete) · `Botao` primário "Nova rotina".

## Conteúdo e dados

Rotinas do armazenamento local (FN-17). Ver `09_dados_por_tela.md`, TL-16.

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Toca na rotina | Abre a edição | TL-17 |
| Liga ou desliga o interruptor | Programa ou cancela os lembretes; pede a permissão só ao ligar a primeira vez | TL-16 |
| "Nova rotina" | Abre o formulário vazio | TL-17 |

## Estados

com rotinas · vazio · permissão negada · erro ao programar · limite de 5 · carregando (lista vazia até ler o aparelho).

## Validações e mensagens de erro

"As notificações estão desativadas..." (permissão) · "A rotina foi salva, mas não foi possível programar o lembrete agora. Tente salvar de novo."

## Textos

`rotina.*` (`src/textos/rotina.ts`; catálogo em `08_microcopy.md`).

## Acessibilidade

- Cada rotina é um botão com rótulo completo ("Editar rotina. Casa para Trabalho. Dias úteis, saída às 07:45").
- O interruptor tem rótulo próprio ("Lembrete de Casa para Trabalho") e estado "ligado"; ligar ou desligar é anunciado.
- Alvos de toque de pelo menos 48 dp.

## Privacidade e linguagem

- Selo "VoltaSegura+ · recurso em validação" e "Sem cobrança durante a validação": sem preço.
- Diz que a rotina fica só no aparelho e que o lembrete não usa tempo real.
- **Proibido:** "rota segura", "por segurança", promessa de proteção ou de mudança no resultado (US-22 AC5, RNF-01).

## Critérios de pronto da tela

- [ ] Lista, liga, desliga e leva à edição (US-22 AC3).
- [ ] Permissão negada: aviso e rotina mantida (US-22 AC4).
- [ ] Selo de recurso em validação, sem preço (US-22 AC5).
- [ ] Varredura de termos limpa.
