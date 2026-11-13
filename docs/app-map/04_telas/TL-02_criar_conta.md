# TL-02 · Criar conta

- **Status:** pronta (aprovada por Lucas Simidu em 13/11/2026) · **Rota Expo Router prevista:** `/(auth)/criar-conta`
- **Objetivo:** criar a conta pedindo **só e-mail e senha**, com aceite do aviso de privacidade. Momento: antes do primeiro planejamento.
- **US/AC e funcionalidades cobertas:** US-01 AC1–AC6 · FN-01 · **RNF aplicáveis:** RNF-05, RNF-07, RNF-09
- **Entradas:** TL-01 ou o link "Criar conta" da TL-03.
- **Saídas:** TL-04 (conta criada), TL-13 (ler o aviso), TL-03 ("Já tenho conta").

## Wireframe

**Estado inicial**

```
┌──────────────────────────────┐
│ ←  Criar conta               │
│                              │
│ Pedimos só o necessário:     │
│ e-mail e senha.              │
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
│ [ ] Li e aceito o aviso de   │
│     privacidade (minuta      │
│     acadêmica) · Ler aviso › │
│                              │
│ ┌──────────────────────────┐ │
│ │       Criar conta        │ │
│ └──────────────────────────┘ │
│ ─────────── ou ───────────── │
│ ┌──────────────────────────┐ │
│ │  Continuar com Google    │ │  (PL-06)
│ └──────────────────────────┘ │
│ Já tenho conta · Entrar ›    │
└──────────────────────────────┘
```

**Estado erro por campo** (e-mail inválido ou senha vazia, AC4)

```
│ E-mail                       │
│ ┌──────────────────────────┐ │
│ │ agatha@exemplo           │ │
│ └──────────────────────────┘ │
│ ⚠ Informe um e-mail válido.  │
│ Senha                        │
│ ┌──────────────────────────┐ │
│ │                          │ │
│ └──────────────────────────┘ │
│ ⚠ Informe uma senha.         │
```

**Estado aviso não aceito** (AC2)

```
│ [ ] Li e aceito o aviso…     │
│ ⚠ Para criar a conta, aceite │
│   o aviso de privacidade.    │
```

**Estado e-mail já cadastrado** (AC3)

```
│ ┌──────────────────────────┐ │
│ │ ⚠ Já existe uma conta com │ │
│ │ este e-mail. Entrar ›     │ │
│ └──────────────────────────┘ │
```

**Estado enviando**

```
│ ┌──────────────────────────┐ │
│ │      ( ◌ ) Criando…      │ │  (botão desabilitado)
│ └──────────────────────────┘ │
```

**Estado sem rede / erro do servidor** (FL-13)

```
│ ┌──────────────────────────┐ │
│ │ ⚠ Sem conexão. Nada foi   │ │
│ │ enviado. Tentar de novo › │ │
│ └──────────────────────────┘ │
```

## Estrutura e componentes

1. `Cabecalho` com voltar e título
2. `Texto` de apoio
3. `CampoTexto` e-mail (teclado de e-mail, sem autocorreção)
4. `CampoTexto` senha (ocultar/mostrar)
5. `Caixa` de aceite + `Link` "Ler aviso"
6. `Botao` primário "Criar conta"
7. `Separador` "ou"
8. `Botao` secundário "Continuar com Google" (pode ficar fora da demo, PL-06)
9. `Link` "Entrar"
10. `Aviso` (erro geral)

## Conteúdo e dados

E-mail e senha digitados; resposta do cadastro (`09_dados_por_tela.md`, TL-02; contrato em `06_funcionalidades.md`, FN-01).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Toca em "Criar conta" com tudo válido | Envia o cadastro | TL-04 |
| Toca em "Ler aviso" | Abre a minuta; ao voltar, os campos continuam preenchidos | TL-13 |
| Toca em "Continuar com Google" | Autorização do Google; conta só com e-mail e identificador | TL-04 |
| Toca em "Entrar" | Abre o login | TL-03 |

## Estados

inicial · erro por campo · aviso não aceito · e-mail já cadastrado · enviando · sem rede / erro do servidor · sucesso (vai para TL-04).

## Validações e mensagens de erro

| Campo | Regra | Mensagem proposta | AC |
|---|---|---|---|
| E-mail | Formato de e-mail | "Informe um e-mail válido." | AC4 |
| Senha | Não vazia (outras regras `[EM ABERTO]`, PL-07) | "Informe uma senha." | AC4 |
| Aceite | Marcado | "Para criar a conta, aceite o aviso de privacidade." | AC2 |
| Servidor | E-mail já existe | "Já existe uma conta com este e-mail." | AC3 |

A validação roda ao tocar em "Criar conta". O primeiro campo com erro recebe o foco.

## Textos

`cadastro.*` (catálogo em `08_microcopy.md`).

## Acessibilidade

- Cada campo tem rótulo visível; a mensagem de erro fica ligada ao campo e é lida pelo leitor de tela.
- O botão de mostrar senha tem rótulo "Mostrar senha" / "Ocultar senha".
- A caixa de aceite e o texto formam um único alvo de toque (≥ 48 dp).

## Privacidade e linguagem

- **Não podem existir** campos de nome, telefone, endereço, data de nascimento ou foto (AC1).
- Com Google, o app não pede nem guarda nome ou foto (AC5).
- O aviso é chamado de **minuta acadêmica**; nenhum texto diz "em conformidade com a LGPD" (AC6, RNF-09).

## Critérios de pronto da tela

- [ ] Só e-mail e senha são pedidos (AC1).
- [ ] Sem aceite, a conta não é criada e o motivo aparece (AC2).
- [ ] E-mail repetido é recusado com mensagem clara (AC3).
- [ ] E-mail inválido ou senha vazia são recusados com o campo indicado (AC4).
- [ ] Google cria conta só com e-mail e identificador (AC5), ou o botão fica fora da demo com registro (PL-06).
- [ ] O aviso se apresenta como minuta acadêmica (AC6).
