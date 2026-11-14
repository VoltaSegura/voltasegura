# TL-03 · Entrar

> **Revisão D-29 (14/11/2026):** topo com imagem de borda curva (`heroEntrar`), botão voltar redondo e título sobre a imagem; sem cabeçalho nativo.

- **Status:** pronta (aprovada por Lucas Simidu em 13/11/2026) · **Rota Expo Router prevista:** `/(auth)/entrar`
- **Objetivo:** abrir a sessão com e-mail e senha (ou Google). Momento: início da jornada.
- **US/AC e funcionalidades cobertas:** US-02 AC1–AC3, US-03 AC2 · FN-02 · **RNF aplicáveis:** RNF-07
- **Entradas:** TL-01; TL-02 ("Já tenho conta"); sessão expirada (FL-13), com retorno ao ponto de origem.
- **Saídas:** TL-04 (ou a tela de onde a sessão expirou); TL-02.

## Wireframe

**Estado inicial**

```
┌──────────────────────────────┐
│ ←  Entrar                    │
│                              │
│ E-mail                       │
│ ┌──────────────────────────┐ │
│ │                          │ │
│ └──────────────────────────┘ │
│ Senha                        │
│ ┌──────────────────────┬───┐ │
│ │                      │ 👁 │ │
│ └──────────────────────┴───┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │         Entrar           │ │
│ └──────────────────────────┘ │
│ ─────────── ou ───────────── │
│ ┌──────────────────────────┐ │
│ │  Continuar com Google    │ │  (PL-06)
│ └──────────────────────────┘ │
│ Não tem conta? Criar conta › │
└──────────────────────────────┘
```

**Estado acesso negado** (AC2; também conta excluída, US-03 AC2)

```
│ ┌──────────────────────────┐ │
│ │ ⚠ E-mail ou senha não     │ │
│ │ conferem.                 │ │
│ └──────────────────────────┘ │
```

**Estado campo vazio**

```
│ ⚠ Informe o e-mail.          │
│ ⚠ Informe a senha.           │
```

**Estado enviando:** botão "( ◌ ) Entrando…", desabilitado.

**Estado sem rede / erro do servidor:** igual à TL-02.

## Estrutura e componentes

`Cabecalho` · `CampoTexto` e-mail · `CampoTexto` senha · `Botao` primário · `Separador` · `Botao` Google · `Link` criar conta · `Aviso`.

## Conteúdo e dados

E-mail e senha digitados; resposta do login (`09_dados_por_tela.md`, TL-03; contrato FN-02).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Toca em "Entrar" com campos preenchidos | Envia o login | TL-04 ou tela anterior à expiração |
| Toca em "Continuar com Google" | Login com Google | TL-04 |
| Toca em "Criar conta" | Abre o cadastro | TL-02 |

## Estados

inicial · campo vazio · enviando · acesso negado · sem rede / erro do servidor · sucesso.

## Validações e mensagens de erro

| Situação | Mensagem proposta | AC |
|---|---|---|
| Campo vazio | "Informe o e-mail." / "Informe a senha." | — |
| Credenciais erradas, e-mail inexistente ou conta excluída | "E-mail ou senha não conferem." (genérica, não diz qual) | US-02 AC2, US-03 AC2 |

## Textos

`entrar.*` (catálogo em `08_microcopy.md`).

## Acessibilidade

Como na TL-02. A mensagem de acesso negado é anunciada, e o foco volta ao campo de e-mail.

## Privacidade e linguagem

A mensagem de erro nunca revela se o e-mail existe (AC2).

## Critérios de pronto da tela

- [ ] Credenciais corretas abrem TL-04 (AC1).
- [ ] Erro com mensagem genérica, igual para e-mail inexistente, senha errada e conta excluída (AC2, US-03 AC2).
- [ ] Sem sessão, qualquer tentativa de consultar leva para cá (AC3).
