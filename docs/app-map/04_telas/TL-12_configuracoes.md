# TL-12 · Configurações

> **Revisão D-29 (14/11/2026):** configurações em grupos (Conta, Lugares salvos, Privacidade) com ícone redondo por linha. **Lugares salvos** listados com apagar (só no aparelho). Histórico de trajetos segue `[EM ABERTO]`.

- **Status:** pronta (aprovada por Lucas Simidu em 13/11/2026) · **Rota Expo Router prevista:** `/(app)/configuracoes`
- **Objetivo:** controlar o histórico local e os locais salvos, ler o aviso de privacidade, sair e excluir a conta. **Excluir conta: adiado (D-25), fora do MVP por ora.**
> **Adiado (D-25).** `[DECISÃO — 14/11/2026]` O botão e o fluxo "Excluir conta" (wireframes, estados, ações e critérios de US-03 abaixo) saem do MVP por ora; o texto fica preservado para retomada. O restante da tela segue pronto.
- **US/AC e funcionalidades cobertas:** US-03 AC1–AC3; US-04 AC1–AC5 · FN-03, FN-12, FN-13 · **RNF aplicáveis:** RNF-05, RNF-07, RNF-09
- **Entradas:** ⚙ na TL-04.
- **Saídas:** TL-13, TL-01 (sair ou conta excluída), TL-04 (usar um trajeto salvo).

## Wireframe

**Estado padrão** (histórico desligado, que é o padrão)

```
┌──────────────────────────────┐
│ ←  Configurações             │
│ Conta                        │
│ agatha@exemplo.com  EXEMPLO  │
│                              │
│ No aparelho                  │
│ Guardar histórico     [ ○ ]  │
│ Os trajetos ficam só neste   │
│ celular. Desligado: nada é   │
│ salvo.                       │
│ Locais salvos (2)          › │
│                              │
│ Privacidade                  │
│ Aviso de privacidade       › │
│                              │
│ ┌──────────────────────────┐ │
│ │          Sair            │ │
│ └──────────────────────────┘ │
│ Excluir conta                │
└──────────────────────────────┘
```

**Estado histórico ligado**

```
│ Guardar histórico     [ ● ]  │
│ Trajetos salvos (3)        › │
│  · Faculdade → Casa          │
│  · Casa → Faculdade          │
│  · Trabalho → Faculdade      │
│ Apagar todos                 │
```

**Estado apagar todos (confirmação)**

```
│ ┌──────────────────────────┐ │
│ │ Apagar os 3 trajetos     │ │
│ │ salvos neste aparelho?   │ │
│ │ [Cancelar]  [Apagar]     │ │
│ └──────────────────────────┘ │
```

**Estado desligar com itens salvos** (`[HIPÓTESE]`, FL-11)

```
│ │ Desligar o histórico.    │ │
│ │ Apagar também os 3       │ │
│ │ trajetos já salvos?      │ │
│ │ [Manter] [Apagar]        │ │
```

**Estado excluir conta (confirmação)** (US-03)

```
┌──────────────────────────────┐
│ Excluir conta                │
│ Isto apaga do servidor seu   │
│ e-mail e identificador e     │
│ encerra a sessão. Histórico e│
│ locais salvos neste aparelho │
│ também são apagados.         │
│ ┌──────────────────────────┐ │
│ │      Excluir conta       │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │        Cancelar          │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**Estado excluindo:** botão "( ◌ ) Excluindo…".

**Estado erro ao excluir:** "Não foi possível excluir a conta agora. Nada foi apagado. Tentar de novo ›".

**Estado lista vazia:** "Nenhum trajeto salvo." / "Nenhum local salvo."

## Estrutura e componentes

`Cabecalho` · seção Conta (`Texto` com o e-mail) · seção No aparelho (`Interruptor`, `Texto` de apoio, `ListaItens` com apagar por item, `Link` apagar todos, `Link` locais salvos) · seção Privacidade (`Link`) · `Botao` secundário Sair · `Link` destrutivo Excluir conta · `DialogoConfirmacao`.

## Conteúdo e dados

E-mail da sessão; histórico e locais do banco local (`09_dados_por_tela.md`, TL-12); exclusão pelo contrato FN-03.

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Liga ou desliga o histórico | Muda a preferência local | TL-12 |
| Toca num trajeto salvo | Preenche o planejamento | TL-04 |
| Desliza ou toca em apagar num item | Apaga do aparelho | TL-12 |
| "Apagar todos" | Pede confirmação; apaga | TL-12 |
| "Locais salvos" | Lista com renomear e apagar | TL-12 (subtela) |
| "Aviso de privacidade" | Abre | TL-13 |
| "Sair" | Encerra a sessão; dados locais mantidos | TL-01 |
| "Excluir conta" → confirmar | Exclui no servidor e apaga os dados locais | TL-01 (aviso "conta excluída") |
| "Excluir conta" → cancelar | Nada é apagado | TL-12 |

## Estados

padrão · histórico ligado · apagar todos · desligar com itens · excluir conta · excluindo · erro ao excluir · lista vazia.

## Validações e mensagens de erro

Ver estados.

## Textos

`config.*`, `excluir.*` (catálogo em `08_microcopy.md`).

## Acessibilidade

- O interruptor é anunciado com o estado ("Guardar histórico, desligado").
- Diálogos de confirmação recebem o foco; "Cancelar" é a ação padrão do leitor de tela.
- "Excluir conta" é diferenciado por texto e posição, não só por cor.

## Privacidade e linguagem

- Histórico desligado por padrão (US-04 AC1); o texto diz "só neste celular" (US-04 AC4).
- A exclusão explica o que é apagado; nenhum texto afirma conformidade com a LGPD (RNF-09).
- Apagar dados locais na exclusão é `[HIPÓTESE]` (FL-12).

## Critérios de pronto da tela

- [ ] Histórico desligado por padrão; ligado, salva só no aparelho (US-04 AC1–AC2).
- [ ] Apagar um ou todos remove do aparelho (US-04 AC3).
- [ ] Excluir com confirmação apaga e encerra a sessão; cancelar não apaga (US-03 AC1, AC3).
- [ ] Depois de excluir, o login com o mesmo e-mail é negado (US-03 AC2, verificado na TL-03).
