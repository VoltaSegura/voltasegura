# Arquitetura do app (VoltaSegura)

- **Status:** as 13 telas do MVP estão reais (14/11/2026), mais base de serviços, sessão, textos, componentes e estado da consulta. TL-14 e TL-15 (compartilhar, "Depende do tempo") seguem provisórias.
- **Especificação:** as telas, os fluxos e os textos estão em `docs/app-map/` (monorepo). Este app implementa só o que estiver com `status: pronta` lá.

## Stack

| Item | Escolha | Situação |
|---|---|---|
| Base | Expo SDK 58, React Native 0.88, React 19.3, TypeScript 6 (`strict`) | ✅ instalado |
| Navegação | Expo Router 58 (rotas em arquivos, `src/app/`), typed routes | ✅ instalado |
| Lint | ESLint 9 + `eslint-config-expo` (flat config) | ✅ instalado |
| Web | `react-native-web` + `react-dom` (para testar no navegador) | ✅ instalado |
| Banco de dados | **Neon (Postgres + Neon Auth), D-24.** O app só fala com a URL pública do Neon Auth e nunca com o Postgres; o SQLite local saiu (**locais salvos decididos na D-29**: `expo-secure-store`, só no aparelho; histórico de trajetos segue em aberto, FN-13) | ✅ Neon Auth em uso na camada `services/`; `expo-sqlite` segue instalado, sem uso |
| Neon (config) | `neon.ts` com `@neon/config` e `@neon/env`; branch `production` e branch `dev` (para testes, expira em 21/11) | ✅ |
| Sessão | `expo-secure-store`: guarda o cookie de sessão do Neon Auth (D-03, D-24) | ✅ em uso (`src/sessao/`) |
| Localização | `expo-location`, só sob demanda (US-05) | ✅ instalado, sem uso ainda |
| Mapa | `react-native-maps` | ✅ instalado, sem uso ainda |
| Testes | `jest-expo` + React Native Testing Library (`npm test`) | ✅ 312 testes em 24 suítes (14/11) |

Para instalar dependências, use sempre `npx expo install <pacote>`: ele escolhe a versão compatível com o SDK.

## Pastas

```
src/mobile-app/
├── app.json            nome, scheme "voltasegura" (deep link da TL-15), plugins, typed routes
├── .env.example        EXPO_PUBLIC_API_MODE, EXPO_PUBLIC_API_URL, EXPO_PUBLIC_OTP2_URL, EXPO_PUBLIC_NEON_AUTH_URL e EXPO_PUBLIC_NEON_AUTH_ORIGIN
├── neon.ts             serviços do Neon declarados (auth); o .env.local gerado por `neon deploy` fica fora do git
├── scripts/            e2e-neon-auth.mjs: teste real do Neon Auth contra a branch dev (o jest-expo simula o fetch); `sql/`: esquema e função de exposição estimada para o Neon (B-06); `ssp/`: importador da planilha SSP-SP (B-07). Ver o LEIA-ME de cada pasta
├── assets/             ícones e splash (ainda os padrões do Expo; trocar pela marca v10 após a T15)
└── src/
    ├── app/            SÓ rotas (cada arquivo é uma tela; _layout.tsx define a navegação)
    ├── components/     componentes base só por tokens (Tela, Botao, CampoTexto, Aviso, SeloExemplo...); `medidas.ts` guarda valores ainda fora dos tokens. Subpastas com entrada própria, importadas por caminho (`@/components/planejar`, `@/components/mapa`, `@/components/resultado`) e NÃO pelo índice: elas importam do índice, e reexportá-las criaria ciclo; o mapa fica fora para não carregar o `react-native-maps` nos testes das outras telas
    ├── config/         ambiente.ts: modo mock|api|otp2, URLs da API e do OTP2 e URL/origem do Neon Auth
    ├── consulta/       estado global da consulta em memória: reducer, validação, planejar a volta, ConsultaProvider
    ├── sessao/         SessaoProvider (SecureStore, expira sozinha; entrar() e sair() provisórios para as telas atuais)
    ├── services/       consulta (mock, api, otp2), seleção da fonte (`selecao.ts`), variações de caminhada (`variantesCaminhada.ts`, B-58), caminho desenhado pelos dados e prioridade com confiança (`rotaDosDados.ts`, B-59), validação do JSON (`validar.ts`), conta (mock, api e Neon Auth), erros, http, token; fixtures/ com os 12 casos
    ├── textos/         microcopy de 08_microcopy.md em 16 módulos; `hipoteses.ts` guarda o que o catálogo só descreve por regra (`sequenciaLeitura`, `[HIPÓTESE]`)
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
| `/perfil` (aba) | `(app)/(abas)/perfil.tsx` | TL-12 (D-38; configurações removida) |
| `/compartilhar/[rotaId]` | `(app)/compartilhar/[rotaId].tsx` | TL-14 (modal; Depende do tempo) |
| `/acompanhar/[token]` | `(app)/acompanhar/[token].tsx` | TL-15 (Depende do tempo) |

**Guarda de sessão:** feita na raiz (`src/app/_layout.tsx`) com `Stack.Protected`. Sem sessão, o grupo `(app)` redireciona para `/`; com sessão, o grupo `(auth)` redireciona para `/planejar`. Ao sair, o histórico das telas de `(app)` é descartado. Por enquanto a sessão é só um estado em memória: os botões "(provisório)" da TL-02 e da TL-03 abrem a sessão sem backend.

Pendente (05_navegacao, "Guardas"): voltar à rota guardada depois de a sessão expirar; mandar a TL-07 a TL-11 para a TL-04 quando não houver resposta em memória.

## Tema

`src/theme/tokens.ts` copia os valores de `docs/app-map/07_design/tokens.md` (cores dos dois temas, tipografia, espaçamento, raio, toque). `useTema()` usa o tema escuro como padrão e o claro quando o sistema estiver em modo claro (`app.json`: `userInterfaceStyle: "automatic"`). A marca v10 continua `[HIPÓTESE]` até a aprovação do grupo (D-06).

## Modo `mock|api|otp2`

`src/config/ambiente.ts` lê `EXPO_PUBLIC_API_MODE` (padrão `mock`), `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_OTP2_URL`. `src/services/selecao.ts` escolhe a fonte de `servicos.consulta`: `mock` (fixtures EXEMPLO), `api` (`POST /api/consultas`, contrato `[HIPÓTESE]`) ou `otp2` (OpenTripPlanner 2, só roteamento). Modo desconhecido ou sem a URL correspondente falha com `INDISPONIVEL`/`CONFIGURACAO`; nunca cai sozinho no mock. A resposta da `api` passa por `validar.ts` (formato errado no roteamento = erro; na exposição = exposição indisponível). A resposta traz `fontes` (`roteamento`, `exposicao`) para a tela tirar o selo EXEMPLO só do que é real (`docs/dados-reais/04_plano_implementacao.md`). Regras que ela cumpre (`06_funcionalidades.md`, "Regras comuns"): o app não calcula estatística; no mock, toda resposta traz `exemplo: true` e a tela mostra a marca `EXEMPLO`; nenhum log leva coordenadas, endereços ou e-mail.

## Neon (D-24)

- **O app nunca conecta no Postgres.** Só `EXPO_PUBLIC_*` vai para o pacote, e o `DATABASE_URL` fica no `.env.local` (ignorado pelo git). Conferido em 14/11: a senha e o host do Postgres aparecem em 0 arquivos do pacote exportado.
- **Contas:** `src/services/contaNeonAuth.ts` fala com o Neon Auth quando `EXPO_PUBLIC_NEON_AUTH_URL` está definida (vale para conta e sessão em qualquer modo; a consulta segue o `API_MODE`).
- **Limites verificados na branch `dev`:** a sessão é um cookie assinado de 7 dias (o token do corpo e o `Bearer` não servem); todo POST exige `Origin` de um domínio confiável (`neon neon-auth domain add`; localhost já vale); não há exclusão de conta (D-25); o aceite do aviso não é gravado no servidor.
- **Não verificado:** o comportamento no React Native (cabeçalho `Origin`, leitura do `Set-Cookie`) e o login Neon Auth no navegador (falha ao ler `Set-Cookie`). O SecureStore na web usa somente memória, coberto por teste. Teste real: `NEON_AUTH_E2E_URL=<URL da branch dev> node scripts/e2e-neon-auth.mjs`.
- **Dependências:** `overrides` de `glob` e `minimatch` no `package.json` levam o `npm audit` de 30 para 9 (só baixas, do `deepmerge`, sem correção publicada). Não rode `npm audit fix --force`: ele sugere rebaixar o Expo para o SDK 52.

## Próximos passos (plano §5.1 e §5.3)

1. Conferir a jornada rodando (celular e navegador): login pelo Neon Auth, escolher ponto, buscar e ver o resultado.
2. Decidir o histórico de trajetos (FN-13; os locais salvos já existem, D-29) e a aprovação visual do design (PL-19). Redesign 2 (D-29): home sem Ida/Volta, mapa em tela cheia com busca por texto, imagens com reserva (`theme/imagens.ts`); testes: 395 em 32 suítes.
3. Lacunas conhecidas: `CenaRotaAcesa`; hora de saída só na hora local; nome genérico do ponto (PL-09); sem estado de conectividade (PL-12); atribuição do mapa (PL-25); polígono do município (PL-11).


## Atualização D-36 (19/11/2026): VoltaSegura+ em simulação, abas e contatos

- Abas em `src/app/(app)/(abas)/` (`_layout.tsx` com `Tabs` e `BarraAbas`): `planejar`, `locais`, `contatos`, `plus` (portão: home se há assinatura simulada, senão planos) e `perfil` (tela própria; `configuracoes.tsx` foi removida, D-38). Pilha do Plus em `src/app/(app)/plus/`: `confirmacao`, `home`, `volta-pronta`, `radar`, `resumo`, `assinatura`. Provedores novos: `ModoTemaProvider` (raiz, `app/_layout.tsx`) e `AssinaturaProvider` (`(app)/_layout.tsx`). Mapa em `docs/app-map/05_navegacao.md`.
- `src/plus/`: datas da simulação (sem Intl), dados de exemplo (`exemplos.ts`) e `FundoMapa` (decorativo, feito com Views; sem SVG no projeto).
- `src/contatos/`: nomes no SecureStore (`voltasegura.contatos`), até 10; sem telefone ou conta. Não há provider: a tela carrega e grava sozinha.
- `src/textos/plus.ts` e `src/textos/abas.ts` entram no agregador `src/textos/index.ts`.
- O horário da rotina usa `SeletorHorario` (`src/components/planejar/`).
