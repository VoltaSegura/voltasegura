# TL-13 · Aviso de privacidade

- **Status:** pronta (aprovada por Lucas Simidu em 13/11/2026) · **Rota Expo Router prevista:** `/aviso-privacidade` (acessível com ou sem sessão)
- **Objetivo:** mostrar a **minuta acadêmica** do aviso de privacidade: o que é coletado, o que fica no aparelho e como excluir a conta.
- **US/AC e funcionalidades cobertas:** US-01 AC6 · FN-12 · **RNF aplicáveis:** RNF-05, RNF-07, RNF-09
- **Entradas:** TL-01, TL-02, TL-12.
- **Saídas:** volta à tela de origem.
- **Revisão de 13/11/2026 (D-20, D-21):** acrescentada a seção "Compartilhar minha volta" e ajustada a seção "Localização". Cobre também US-21 AC2 e US-19 AC4.

## Wireframe

**Estado único**

```
┌──────────────────────────────┐
│ ←  Aviso de privacidade      │
│ ┌──────────────────────────┐ │
│ │ Minuta acadêmica, sem     │ │
│ │ revisão jurídica.         │ │
│ └──────────────────────────┘ │
│ O que pedimos                │
│ Só e-mail e senha (ou o      │
│ identificador do Google).    │
│                              │
│ O que não guardamos          │
│ Origens, destinos e horários │
│ das consultas: usados só     │
│ para calcular e descartados. │
│                              │
│ O que fica só no celular     │
│ Histórico e locais salvos,   │
│ se você ligar.               │
│                              │
│ Localização                  │
│ Só quando você toca em "usar │
│ minha localização" ou        │
│ enquanto compartilha sua     │
│ volta.                       │
│                              │
│ Compartilhar minha volta     │
│ Se você compartilhar, o      │
│ trajeto e sua última posição │
│ ficam no servidor só durante │
│ o compartilhamento e são     │
│ apagados ao terminar. Só quem│
│ tem o link e o app vê.       │
│                              │
│ Mapa                         │
│ O mapa de fundo é carregado  │
│ de um serviço externo, que   │
│ vê a região exibida.         │
│                              │
│ Excluir a conta              │
│ Em Configurações › Excluir   │
│ conta.                       │
└──────────────────────────────┘
```

## Estrutura e componentes

`Cabecalho` · `Aviso` informativo (minuta) · seções com `Titulo` e `Texto`.

## Conteúdo e dados

Texto fixo. O conteúdo deriva da DT-08 e do `docs/03` §6. A redação jurídica está fora do escopo (RNF-09); a seção "Mapa" vem do PL-03 (`[HIPÓTESE]`).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Voltar | Fecha | Tela de origem (TL-02 mantém os campos) |

## Estados

Único (texto fixo, disponível sem rede).

## Validações e mensagens de erro

Nenhuma.

## Textos

`aviso.*` (catálogo em `08_microcopy.md`).

## Acessibilidade

Títulos de seção marcados como cabeçalhos para navegação por leitor de tela; texto escalável; sem textos em imagem.

## Privacidade e linguagem

- **Não pode** dizer "em conformidade com a LGPD", "garantimos sua privacidade" ou equivalentes (RNF-09, `docs/05`).
- Não cita base legal (`[EM ABERTO]`, `docs/10` F1.1).

## Critérios de pronto da tela

- [ ] A primeira coisa visível é "Minuta acadêmica, sem revisão jurídica" (US-01 AC6).
- [ ] Cobre coleta, descarte das consultas, histórico local, GPS sob demanda, mapa externo e exclusão.
- [ ] Abre sem rede.
