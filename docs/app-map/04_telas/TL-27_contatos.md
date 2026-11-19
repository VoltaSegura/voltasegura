# TL-27 · Contatos (aba)

> **Revisão D-36 (19/11/2026):** aba nova da barra inferior. `[DECISÃO]` guarda **só o nome** de cada contato, no aparelho. A lista **não envia nada sozinha**: qualquer envio de localização é uma ação da pessoa, com confirmação (D-19, D-21). `[EM ABERTO]` como um contato entra no compartilhamento (PL-34).

- **Status:** pronta para o protótipo (19/11/2026; aguarda revisão do Lucas e decisão PL-34) · **Rota Expo Router:** `/(app)/contatos` (aba Contatos)
- **Objetivo:** guardar as pessoas de confiança com nome (ex.: Mãe), para uso futuro no compartilhamento.
- **US/AC e funcionalidades cobertas:** FN-22 · D-19, D-21 · **RNF aplicáveis:** RNF-01, RNF-05, RNF-07
- **Entradas:** aba Contatos.
- **Saídas:** nenhuma (a tela não leva a outra tela).

## Wireframe

```
┌──────────────────────────────┐
│ Contatos                     │
│ Pessoas de confiança. Ficam  │
│ só neste aparelho.           │
│ A lista não envia nada sozinha...│
│ ┌──────────────────────────┐ │
│ │ 👤 Mãe               ⌫   │ │
│ └──────────────────────────┘ │
│ Nome                         │
│ [                        ]   │
│ Use um nome que você conheça │
│ [     Salvar contato     ]   │
└──────────────────────────────┘
```

Vazio: "Nenhum contato ainda." (EstadoVazio). Limite de 10 nomes.

## Estrutura e componentes

`Tela` · `GrupoLinhas`/`LinhaGrupo` com ação de remover · `CampoTexto` (nome, máximo 30 caracteres) · `Aviso` de limite · `Botao`.

## Conteúdo e dados

- Armazenamento local `voltasegura.contatos` (SecureStore), JSON com `id` e `nome`. Sem telefone, e-mail ou conta.
- Até 10 contatos; o nome é normalizado (espaços, 30 caracteres).
- Textos de `src/textos/abas.ts` (`contatos`).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| "Salvar contato" com nome | Guarda e limpa o campo (anunciado) | TL-27 |
| "Salvar contato" sem nome | Mensagem "Informe um nome." | TL-27 |
| Ícone de lixeira | Remove (anunciado) | TL-27 |

## Estados

vazio · com contatos · erro ao salvar · limite de 10.

## Acessibilidade

- Campo com rótulo "Nome" e ajuda; erros em texto com papel de alerta.
- Remover tem rótulo com o nome da pessoa.

## Privacidade e linguagem

- Não guarda número de telefone nem e-mail, e nada é enviado. O texto diz isso na própria tela.
- `src/textos/hipotesesAviso.ts` recebe uma linha sobre o armazenamento de contatos.

## Critérios de pronto da tela

- [x] Guarda só o nome, no aparelho (teste em `src/contatos/contatos.test.ts` e `plus.test.tsx`).
- [x] Recusa nome vazio e respeita o limite.
- [ ] Decisão de como o contato entra no compartilhamento (PL-34).
