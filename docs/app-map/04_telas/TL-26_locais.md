# TL-26 · Locais (aba)

> **Revisão D-38 (19/11/2026, T25-B):** a aba Locais recebe as ações antes da TL-12: **renomear** tocando na linha (edição inline, mesmo teclado tratado) e **apagar sem diálogo**, com "Desfazer" disponível por 5 s, que restaura o lugar na mesma posição. Nada é enviado.

> **Revisão D-36 (19/11/2026):** aba nova da barra inferior. `[DECISÃO]` lista os lugares salvos (FN-13) com apagar com confirmação; salvar abre o mapa de escolha de ponto (TL-05). Nada é enviado.

- **Status:** pronta (19/11/2026; aguarda revisão do Lucas) · **Rota Expo Router:** `/(app)/locais` (aba Locais)
- **Objetivo:** ver, apagar e salvar os lugares (casa, trabalho, estudo, outro) usados nas buscas e nas rotinas.
- **US/AC e funcionalidades cobertas:** FN-13 (lugares salvos, D-29) · **RNF aplicáveis:** RNF-01, RNF-07
- **Entradas:** aba Locais.
- **Saídas:** TL-05 ("Salvar um lugar").

## Wireframe

```
┌──────────────────────────────┐
│ Locais                       │
│ Seus lugares salvos ficam só │
│ neste aparelho.              │
│ ┌──────────────────────────┐ │
│ │ ⌂ Casa         Endereço ⌫│ │
│ │ 💼 Trabalho     Endereço ⌫│ │
│ └──────────────────────────┘ │
│ [ Salvar um lugar ]          │
└──────────────────────────────┘
```

Vazio: "Nenhum lugar salvo ainda..." (EstadoVazio).

## Estrutura e componentes

`Tela` · `GrupoLinhas`/`LinhaGrupo` (ícone por tipo, endereço ou tipo) · ação de apagar por linha · `Aviso` de confirmação com "Sim, apagar" e "Cancelar" · `Botao`.

## Conteúdo e dados

Lugares do `LocaisContext` (só no aparelho; coordenadas nunca em log). Textos de `src/textos/abas.ts` (`locais`).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| Ícone de lixeira na linha | Apaga na hora e mostra "Desfazer" por 5 s | TL-26 |
| "Desfazer" (até 5 s) | Restaura o lugar na posição anterior (anunciado) | TL-26 |
| Tocar no nome da linha | Edita o nome na própria linha; "Salvar" ou "Cancelar" | TL-26 |
| "Salvar um lugar" | Abre o mapa | TL-05 |

## Estados

com lugares · vazio · editando nome · lugar apagado (com desfazer por 5 s).

## Acessibilidade

- Linha com rótulo "Nome, tipo"; ação de apagar com o nome do lugar.
- Confirmação em texto com papel de alerta.

## Privacidade e linguagem

- Apagar um lugar não apaga a cópia dentro das rotinas (texto avisa). Nada é enviado.

## Critérios de pronto da tela

- [x] Lista, apagar com confirmação, vazio.
- [ ] Teste automatizado desta tela (`[EM ABERTO]`).
