# Plano: redesign "novas-telas" (16 mockups) + novo input de horário

## Context
O grupo tem 16 mockups em `docs/app-map/redesign/inspo-melhorar-design/novas-telas/` (01 Início … 15 Gerenciar assinatura, mais barra inferior flutuante e modo escuro). O app (`src/mobile-app`, Expo SDK 58, Expo Router, hoje só `Stack`) deve ser refeito nesse visual e o mesmo estilo propagado às telas existentes fora dos mockups. Entrega: 19/11/2026 23h55 (hoje 18/11), então o trabalho é paralelo. Além disso, o campo de horário da home (`SeletorHorario`) abre e fecha o teclado instantaneamente e será substituído por um seletor dedicado de relógio.

Decisões do usuário: (1) Plus Planos/Confirmação/Assinatura como **simulação sem cobrança** (selo "Demonstração: nenhuma cobrança real", nova D-nn revendo D-31 item 3); (2) **barra completa** com 5 abas; (3) horário = **folha com rodas HH:MM**, sem teclado.

## Diagnóstico do bug do horário
`SeletorHorario.tsx:33`: `key={focar ? 'foco':'padrao'}` + `autoFocus` remonta o `TextInput`; `onBlur={confirmar}` atualiza o contexto (`definirSaida`) e re-renderiza a tela; `hora` derivada de `rascunho.base === saida` descarta o rascunho no meio da digitação. Somam-se `Tela.tsx:46` (KeyboardAvoidingView + ScrollView) e a diferença pan/resize entre Expo Go e dev build. Solução: eliminar o teclado.

## Novo componente `SeletorHorario` (substitui o atual)
- Mesma API enxuta: `{ rotulo, saida (ISO), onChange(iso) }`; `onValidadeChange` e `focar` deixam de existir (valor sempre válido; "focar" vira abrir a folha; ajustar `planejar.tsx:117`, `:26`, `:51`).
- UI: linha "Saída às 17:09 · hoje, 15 de novembro" + link "Alterar" (como mockup 01) que abre uma folha (modal Reanimated/`Modal`) com duas rodas (`FlatList` + `snapToInterval`, horas 0–23 e minutos de 5 em 5), botão "Confirmar" amarelo. Sem `TextInput`.
- Reaproveitar `AtalhosHorario` (Agora/+15/+30/+1h), `Segmentado`, tokens e `useTema`.
- Também usar em `rotina/editar.tsx:143` (`testID="rotina-hora"`), mantendo `saidaDeHoje` de `rotina/AberturaPorLembrete.tsx`.
- Atualizar testes `src/__tests__/telas/planejar/componentes.test.tsx` (usa `testID="hora-saida"`) e adicionar teste da folha.

## Fundação (fazer antes dos workers, pelo lead)
1. Tokens/componentes em `src/theme/tokens.ts` e `src/components`: raios, cartão com borda, chip/pílula ("EXEMPLO", "SIMULAÇÃO"), `BarraAbas` flutuante (pílula navy com aba ativa destacada), `Cabecalho` com botão circular de voltar, `FolhaInferior` genérica (reaproveitar `resultado/useFolhaResultado.ts`).
2. Navegação: `src/app/(app)/_layout.tsx` passa a `Tabs` (Planejar, Locais, Contatos, Plus, Perfil) com `BarraAbas`; telas de fluxo (escolher-ponto, resultado, por-que, buscando, seguir, compartilhar, rotina/editar) ficam fora das abas (modais/stack). Reaproveitar `ConsultaProvider`, `LocaisProvider`, `RotinaProvider`.
3. Documentação do fluxo no mesmo trabalho (regra do `AGENTS.md`): D-nn novo em `docs/app-map/01_decisoes.md`, `05_navegacao.md`, `04_telas`, `03_fluxogramas`, `08_microcopy.md` + `src/textos/`, `todo-mobile.md`, `prompts.md`, `TODO.md`.

## Delegação (agentes já conectados: Claude Code #5, #6, #7; o maestro integra)
Cada worker recebe: PNG(s) do mockup, arquivos-alvo, regra "implementar só telas `status: pronta`, linguagem do `docs/05` (nunca 'rota segura')", dever de atualizar docs/testes/TODO e reportar via `maestri ask "Claude Code #4"`. Ordem: fundação → workers em paralelo (arquivos disjuntos) → integração.

| Worker | Telas / mockups | Arquivos principais |
|---|---|---|
| #5 · Planejar | 01 Início, 07 Início escuro, 02 Escolher destino, **novo SeletorHorario** | `planejar.tsx`, `components/planejar/*`, `escolher-ponto.tsx`, `components/mapa/MapaPonto*` |
| #6 · Resultado e dados | 03 Alternativas, 04 Dados insuficientes, 05 Por que esta rota, 06 Login; propagar a `criar-conta`, `buscando`, `sobre-os-dados`, `dados-considerados`, `aviso-privacidade` | `resultado/*`, `components/resultado/*`, `por-que/…`, `(auth)/*` |
| #7 · Plus e abas | 08 Planos, 09 Confirmação, 10 Plus Home, 11 Rotina, 12 Minha volta pronta, 13 Radar da rota, 14 Resumo da semana, 15 Gerenciar assinatura; novas abas Locais, Contatos, Perfil (reaproveita `configuracoes.tsx`) | `rotina.tsx`, `rotina/editar.tsx`, `src/rotina/*`, novas rotas `plus/*`, `locais.tsx`, `contatos.tsx`, `perfil` |
| Lead (#4) | Fundação, `_layout`, propagação a `compartilhar`, `acompanhar`, `seguir`, `configuracoes`, revisão e testes finais | `theme`, `components`, `(app)/_layout.tsx` |

Restrições de conteúdo: Radar da rota (13) e Resumo da semana (14) usam dados de exemplo locais com selo "EXEMPLO" (sem backend; dados vêm só do histórico do aparelho); nada de pagamento real; privacidade conforme `hipotesesAviso.ts`.

## Verificação
- `npx tsc --noEmit`, `npx eslint src`, `npx jest` (testes que descrevem o fluxo antigo são atualizados).
- Rodar com `npx expo start` no Android/Expo Go: abrir o horário na home e na Rotina, confirmar que não há teclado e que o valor persiste; 100/130/200% de fonte; modo claro e escuro; navegar pelas 5 abas e pelas 15 telas comparando com os PNGs.
- Checar o `TODO.md` e `docs/app-map` atualizados; sem commit até o usuário pedir.
