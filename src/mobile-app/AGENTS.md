> **VoltaSegura:** antes de tudo, siga o `AGENTS.md` da raiz do monorepo (regras de linguagem do `docs/05` têm prioridade máxima) e implemente só telas com `status: pronta` em `docs/app-map/04_telas/`. Este arquivo traz apenas as orientações gerais do Expo, geradas pelo `create-expo-app`.

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## VoltaSegura: mudou o fluxo, mudou a documentação (regra permanente)

Toda alteração que muda **o que a pessoa vê ou faz** (tela, passo de um fluxo, texto, regra, dado guardado ou enviado, dependência com efeito de privacidade) só está pronta quando a documentação **do mesmo fluxo** foi atualizada **no mesmo trabalho** (mesmo commit ou mesma entrega). Nunca deixe "docs depois".

| Se você mudou... | Atualize, em `docs/app-map/` (monorepo) |
|---|---|
| Uma tela (layout, estados, ações, acessibilidade) | `04_telas/TL-nn_*.md` e a linha de `04_telas/00_indice.md` |
| Um passo ou caminho de um fluxo | `03_fluxogramas/FL-nn_*.md` (diagrama Mermaid, passos, erros, regras) e `03_fluxogramas/00_indice.md` |
| Navegação (rota, modal, parâmetro, o que volta para onde) | `05_navegacao.md` |
| Uma função ou regra de negócio | `06_funcionalidades.md` (FN-nn) |
| Qualquer texto da interface | `08_microcopy.md` **e** `src/textos/` (a fonte do código) |
| Dado exibido, de onde vem ou onde fica guardado | `09_dados_por_tela.md` |
| Um critério de aceite ou o teste que o cobre | `10_rastreabilidade.md` |
| Uma tarefa do mapa da jornada | `02_story_map.md` |
| Uma decisão (ela contradiz ou revê outra) | `01_decisoes.md` (nova decisão D-nn, marcando a revista) e `12_pendencias_e_lacunas.md` (histórico) |
| Cor, tipografia, componente, imagem, movimento | `src/mobile-app/DESIGN.md`, `docs/app-map/07_design/componentes.md` e `tokens.md`, e `src/theme/imagens.ts` + `assets/imagens/LEIA-ME.md` se houver imagem |
| Privacidade (o que sai do aparelho, o que fica) | `src/textos/hipotesesAviso.ts` (TL-13) e `docs/05_regras_linguagem_etica.md` se tocar em linguagem |

Ao terminar qualquer mudança de fluxo, faça também:
1. Atualize `todo-mobile.md` (marque o que foi feito e o que ficou) e, se houve mudança de estrutura, `ARQUITETURA.md`.
2. Registre o uso de IA em `prompts.md` (monorepo).
3. Se o fluxo mudou por decisão do Lucas, cite a decisão (D-nn) e a data na faixa de revisão da tela e do fluxo.
4. Rode `npx tsc --noEmit`, `npx eslint src` e `npx jest`; os testes que descrevem o fluxo devem ser atualizados junto (um teste que ainda descreve o fluxo antigo é um bug de documentação).
5. Não commite sem o Lucas pedir. O monorepo é a fonte da verdade; o espelho recebe a cópia pelo `scripts/sync_mirrors.sh` (não edite código no espelho).
6. Para mudanças grandes, escreva ou atualize o plano em `docs/app-map/redesign/` ou `docs/dados-reais/` antes de implementar.
