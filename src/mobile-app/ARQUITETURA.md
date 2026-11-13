# Arquitetura do app (VoltaSegura)

- **Status:** esqueleto (13/11/2026). Este arquivo acompanha a construção (Frente 2 de `docs/plano_app.md`) e deve ser atualizado a cada fatia.
- **Especificação:** as telas, os fluxos e os textos estão em `docs/app-map/` (monorepo). Este app implementa só o que estiver com `status: pronta` lá.

## Stack

| Item | Escolha | Situação |
|---|---|---|
| Base | Expo SDK 58, React Native 0.88, React 19.3, TypeScript 6 (`strict`) | ✅ instalado |
| Navegação | Expo Router 58 (rotas em arquivos, `src/app/`), typed routes | ✅ instalado |
| Lint | ESLint 9 + `eslint-config-expo` (flat config) | ✅ instalado |
| Web | `react-native-web` + `react-dom` (para testar no navegador) | ✅ instalado |
| Banco local | `expo-sqlite` (FN-13) | ✅ instalado, sem uso ainda |
| Sessão | `expo-secure-store` (token, D-03) | ✅ instalado, sem uso ainda |
| Localização | `expo-location`, só sob demanda (US-05) | ✅ instalado, sem uso ainda |
| Mapa | `react-native-maps` | ✅ instalado, sem uso ainda |
| Testes | `jest-expo` + React Native Testing Library (`npm test`) | ✅ configurado, sem testes ainda |

Para instalar dependências, use sempre `npx expo install <pacote>`: ele escolhe a versão compatível com o SDK.

## Pastas

```
src/mobile-app/
├── app.json            nome, scheme "voltasegura" (deep link da TL-15), plugins, typed routes
├── .env.example        EXPO_PUBLIC_API_MODE e EXPO_PUBLIC_API_URL
├── assets/             ícones e splash (ainda os padrões do Expo; trocar pela marca v10 após a T15)
└── src/
    ├── app/            SÓ rotas (cada arquivo é uma tela; _layout.tsx define a navegação)
    ├── components/     componentes reutilizáveis (hoje: TelaProvisoria)
    ├── config/         ambiente.ts: modo mock|api e URL da API
    ├── sessao/         SessaoContext (provisório, em memória)
    └── theme/          tokens.ts (de 07_design/tokens.md) e useTema()
```

O alias `@/` aponta para `src/` (ex.: `import { useTema } from '@/theme/useTema'`).

## Rotas

Seguem a árvore de `docs/app-map/05_navegacao.md`. A única diferença é a pasta: as rotas ficam em `src/app/` e não em `app/` (o Expo Router aceita as duas; assim o código que não é rota fica fora da pasta de rotas).

| Rota (URL) | Arquivo | Tela |
|---|---|---|
| `/` | `(auth)/index.tsx` | TL-01 Abertura |
| `/criar-conta` | `(auth)/criar-conta.tsx` | TL-02 |
| `/entrar` | `(auth)/entrar.tsx` | TL-03 |
| `/aviso-privacidade` | `aviso-privacidade.tsx` | TL-13 (com ou sem sessão) |
| `/planejar?sentido=ida\|volta` | `(app)/planejar.tsx` | TL-04 |
| `/escolher-ponto?campo=origem\|destino` | `(app)/escolher-ponto.tsx` | TL-05 (modal) |
| `/buscando` | `(app)/buscando.tsx` | TL-06 |
| `/resultado` | `(app)/resultado/index.tsx` | TL-07 |
| `/resultado/[rotaId]` | `(app)/resultado/[rotaId].tsx` | TL-08 |
| `/por-que/[rotaId]/[trechoId]` | `(app)/por-que/[rotaId]/[trechoId].tsx` | TL-09 (modal) |
| `/sobre-os-dados` | `(app)/sobre-os-dados.tsx` | TL-10 |
| `/dados-considerados?rotaId=` | `(app)/dados-considerados.tsx` | TL-11 |
| `/configuracoes` | `(app)/configuracoes.tsx` | TL-12 |
| `/compartilhar/[rotaId]` | `(app)/compartilhar/[rotaId].tsx` | TL-14 (modal; Depende do tempo) |
| `/acompanhar/[token]` | `(app)/acompanhar/[token].tsx` | TL-15 (Depende do tempo) |

**Guarda de sessão:** feita na raiz (`src/app/_layout.tsx`) com `Stack.Protected`. Sem sessão, o grupo `(app)` redireciona para `/`; com sessão, o grupo `(auth)` redireciona para `/planejar`. Ao sair, o histórico das telas de `(app)` é descartado. Por enquanto a sessão é só um estado em memória: os botões "(provisório)" da TL-02 e da TL-03 abrem a sessão sem backend.

Pendente (05_navegacao, "Guardas"): voltar à rota guardada depois de a sessão expirar; mandar a TL-07 a TL-11 para a TL-04 quando não houver resposta em memória.

## Tema

`src/theme/tokens.ts` copia os valores de `docs/app-map/07_design/tokens.md` (cores dos dois temas, tipografia, espaçamento, raio, toque). `useTema()` usa o tema escuro como padrão e o claro quando o sistema estiver em modo claro (`app.json`: `userInterfaceStyle: "automatic"`). A marca v10 continua `[HIPÓTESE]` até a aprovação do grupo (D-06).

## Modo `mock|api`

`src/config/ambiente.ts` lê `EXPO_PUBLIC_API_MODE` (padrão `mock`) e `EXPO_PUBLIC_API_URL`. A camada `services/` que usa essa configuração ainda não existe. Regras já fixadas para ela (`06_funcionalidades.md`, "Regras comuns"): o app não calcula estatística; no mock, toda resposta traz `exemplo: true` e a tela mostra a marca `EXEMPLO`; nenhum log leva coordenadas, endereços ou e-mail.

## Próximos passos (plano §5.1 e §5.3)

1. Camada `services/` com interface única e fixtures para cada caso do FL-07.
2. `expo-secure-store` na sessão e `expo-sqlite` com o modelo da FN-13.
3. Fatia 1: entrar/criar conta → planejar → alternativas (com mock).
