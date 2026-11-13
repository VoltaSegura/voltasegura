# TL-01 · Abertura

- **Status:** pronta (aprovada por Lucas Simidu em 13/11/2026) · **Rota Expo Router prevista:** `/(auth)/`
- **Objetivo:** apresentar o app e levar a usuária a entrar ou criar conta. É o início da jornada, quando não há sessão.
- **US/AC e funcionalidades cobertas:** US-02 AC3 (conta obrigatória) · FN-01, FN-02 · **RNF aplicáveis:** RNF-01, RNF-07, RNF-09
- **Entradas:** abertura do app sem sessão; fim da exclusão de conta (FL-12); sessão expirada (FL-13).
- **Saídas:** TL-02 (criar conta), TL-03 (entrar), TL-13 (aviso de privacidade).

## Wireframe

**Estado inicial**

```
┌──────────────────────────────┐
│                              │
│          [ logo VS ]         │
│         VoltaSegura          │
│                              │
│  Compare as opções de        │
│  trajeto antes de sair,      │
│  na ida e na volta.          │
│                              │
│  ┌────────────────────────┐  │
│  │      Criar conta       │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │        Entrar          │  │
│  └────────────────────────┘  │
│                              │
│   Aviso de privacidade ›     │
└──────────────────────────────┘
```

**Estado verificando sessão** (rápido, ao abrir)

```
┌──────────────────────────────┐
│          [ logo VS ]         │
│            ( ◌ )             │
│     Carregando…              │
└──────────────────────────────┘
```

## Estrutura e componentes

1. `Logo` (marca v10, D-06)
2. `Texto` de apresentação (título + frase curta)
3. `Botao` primário "Criar conta"
4. `Botao` secundário "Entrar"
5. `Link` "Aviso de privacidade"

## Conteúdo e dados

Só textos fixos e logo (ver `09_dados_por_tela.md`, TL-01).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Toca em "Criar conta" | Abre o cadastro | TL-02 |
| Toca em "Entrar" | Abre o login | TL-03 |
| Toca em "Aviso de privacidade" | Abre a minuta | TL-13 |

## Estados

| Estado | Quando | O que aparece |
|---|---|---|
| Verificando sessão | Ao abrir o app | Logo e indicador de carregamento; se houver sessão válida, vai direto para TL-04 |
| Inicial | Sem sessão | Wireframe acima |
| Vindo da exclusão de conta | Depois do FL-12 | Inicial + aviso "Sua conta foi excluída." |
| Sessão expirada | Depois do FL-13 | Inicial + aviso "Sua sessão terminou. Entre de novo." |

## Validações e mensagens de erro

Nenhuma.

## Textos

`abertura.titulo`, `abertura.frase`, `abertura.criar_conta`, `abertura.entrar`, `abertura.aviso`, `abertura.conta_excluida`, `abertura.sessao_expirada` (catálogo em `08_microcopy.md`).

## Acessibilidade

- Ordem de foco: logo (decorativo, sem foco), frase, "Criar conta", "Entrar", "Aviso de privacidade".
- O logo tem rótulo "VoltaSegura" para o leitor de tela.
- Os avisos de conta excluída e de sessão expirada são anunciados ao aparecer.

## Privacidade e linguagem

A frase não promete segurança. Proibidos: "rota segura", "volte em segurança" e qualquer variação de garantia. Nenhuma menção a conformidade com a LGPD.

## Critérios de pronto da tela

- [ ] Sem sessão, mostra só as duas ações e o link do aviso.
- [ ] Com sessão válida, abre TL-04 sem mostrar a abertura.
- [ ] Textos aprovados no `08_microcopy.md` e sem termos proibidos.
