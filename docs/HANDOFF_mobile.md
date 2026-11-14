# Passagem de bastão: app mobile (VoltaSegura)

Escrito em **14/11/2026** pelo Claude, para o Codex continuar. Prazo da entrega: **19/11/2026, 23h55**.
Leia antes: `AGENTS.md` (raiz), `src/mobile-app/AGENTS.md`, `docs/05_regras_linguagem_etica.md` (prioridade máxima),
`docs/app-map/01_decisoes.md` (D-24 e D-25 são de hoje) e `src/mobile-app/todo-mobile.md` (painel de status).

Regras fixas: nada de "rota segura", "perigoso", "área de risco"; sempre "exposição estimada" e confiança dos dados separada;
não inventar texto fora de `docs/app-map/08_microcopy.md` (o que for hipótese vai em `src/mobile-app/src/textos/hipoteses.ts`);
`null` é "dados insuficientes", nunca zero; o app não calcula estatística, não reordena rotas e não escolhe pela usuária;
nada de `console.*` com coordenadas, endereço ou e-mail. **Nada foi commitado** (não faça commit sem o Lucas pedir; sem `Co-Authored-By`).

## 1. Onde está tudo
- Código: `src/mobile-app/` (Expo SDK 58, TypeScript estrito, Expo Router em `src/app/`, alias `@/` = `src/`).
- `voltasegura-mobile-app/` (pasta irmã `mobile-app/`) é só o **espelho**; o `sync_mirrors.sh` o sobrescreve com `rsync --delete`. Trabalhe só no monorepo.
- Estrutura e decisões técnicas: `src/mobile-app/ARQUITETURA.md`.

## 2. Estado atual (resumo)
- **13 das 15 telas reais** (TL-01 a TL-13). TL-14 e TL-15 (compartilhar, "Depende do tempo", D-22) seguem provisórias.
- Base pronta: `src/services/` (mock, api e Neon Auth), `src/sessao/`, `src/textos/`, `src/consulta/`, `src/components/` (+ subpastas `planejar/`, `mapa/`, `resultado/`).
- 303 testes passavam na última rodada completa verificada (antes das edições do item 3).
- Neon: projeto `dark-bread-31601140`, org `org-twilight-shadow-49518554`, branch `production` (não mexer) e branch `dev` (testes; expira em 21/11/2026).
  `src/mobile-app/.env.local` aponta para `dev` (fora do git). Para voltar à produção: `neon checkout production`.
  Teste real do login: `NEON_AUTH_E2E_URL=<NEON_AUTH_BASE_URL da dev> node scripts/e2e-neon-auth.mjs` (12/12 passavam).

## 3. FAÇA PRIMEIRO: edições feitas e NÃO verificadas
A última rodada de checks foi interrompida. Estas mudanças foram escritas mas **tsc, eslint e jest não rodaram depois delas**:
1. `src/components/resultado/resultado.tsx`: `RotuloFoco` remove um `◆` inicial do texto (o componente já desenha o `◆`; na TL-07 o texto do catálogo
   `menorExposicao` já vinha com `◆`, causando "◆ ◆"); `SequenciaModos` não mostra o rótulo do modo nos trechos a pé (evita "A pé A pé 35 min").
2. `src/components/resultado/formatos.ts` (+ `formatos.test.ts`): `formatarPeriodo` ("jan-set/2026"), exportado em `components/resultado/index.ts`.
   Usado em `app/(app)/resultado/index.tsx` (substituiu a função local `periodo`) e em `app/(app)/resultado/[rotaId].tsx` (antes mostrava "2026-01–2026-09").
3. `app/(app)/resultado/[rotaId].tsx`: resumo passou a usar `distancia(...)` ("1 km a pé" em vez de "1 a pé").
4. `app/(app)/planejar.tsx`: `useEffect` limpa `problemas` quando origem, destino ou saída mudam (o aviso "Escolha a origem." não sumia).
5. `src/sessao/armazenamento.ts` (+ `armazenamentoWeb.test.ts`): na **web** o `expo-secure-store` é um módulo vazio (gravar lança erro e ninguém loga);
   fallback **só em memória** na web (nunca localStorage). Esta parte foi verificada (303 testes).
6. Teste novo `src/__tests__/telas/regressoes/regressoes.test.tsx` cobre os itens 1 a 4. **Pode precisar de ajuste**
   (o `rerender` do RNTL v14 é assíncrono; as expressões regulares de km e período podem precisar de afinação).

Rode, em `src/mobile-app/` (PowerShell: `;` em vez de `&&`):
`npx tsc --noEmit` · `npx eslint src` · `npx jest --runInBand`. Se algum teste antigo de `components/resultado/resultado.test.tsx` ou
`__tests__/telas/resultado` assumir o `◆` duplicado ou o "A pé" repetido, ajuste o teste (o comportamento antigo era o defeito).
Depois: `npx expo export --platform web --output-dir $env:TEMP/vs-web` e o mesmo com `--platform android`; `npx expo-doctor` (deve dar 20/20).
Atualize `todo-mobile.md` (linha de Histórico e contagem de testes) e `ARQUITETURA.md` (contagem).

## 4. O que foi descoberto ao rodar o app no navegador (modo mock, 14/11)
Jornada exercitada com sucesso: TL-01 → TL-02 (validação) → TL-03 → TL-04 → TL-05 (ponto de exemplo) → TL-06 → TL-07 → TL-08 → TL-09 → TL-11 → TL-12 → sair.
Regras do produto conferidas na tela: menor exposição primeiro e selecionada (D-23), selo EXEMPLO, linha "Sobre os dados" fixa, botão "Por que esta rota?" só em trecho a pé,
sem exclusão de conta nem histórico na TL-12.
Defeitos: os 4 corrigidos no item 3 e o seguinte, **ainda aberto**:
- **Login pelo Neon Auth não completa no navegador**: o servidor cria a conta, mas o JS do navegador não consegue ler o `Set-Cookie`
  (`src/services/contaNeonAuth.ts` falha com `SEM_COOKIE` e a tela mostra "Não foi possível concluir agora"). No celular deve funcionar, **mas isso nunca foi testado em aparelho**.
  Para exercitar o app no navegador use o modo mock (sem `EXPO_PUBLIC_NEON_AUTH_URL`): `cd src/mobile-app; $env:CI=1; npx expo start --web --port 8081`.
Outros pontos vistos (decidir com o Lucas): aviso de mapa indisponível na web cita "local salvo" (FN-13 em aberto); na TL-05 aparece a dica de arrastar o mapa mesmo sem mapa (web);
o mock mostra "Saída às 05:06" (hora real) e os cards "Sai às 23:00" (fixture); o ponto de exemplo aparece como "Ponto escolhido no mapa" (PL-09).

## 5. Próximos passos (ordem sugerida)
1. Item 3 acima (verificar e fechar).
2. **Testar no celular (Expo Go)**: login/cadastro pelo Neon Auth (cabeçalho `Origin` e leitura do `Set-Cookie` no React Native), permissão de localização,
   mapa (`react-native-maps`), jornada completa. Defina `EXPO_PUBLIC_NEON_AUTH_URL` (valor de `NEON_AUTH_BASE_URL` em `.env.local`) e, se preciso, `EXPO_PUBLIC_NEON_AUTH_ORIGIN`
   (domínio confiável: `neon neon-auth domain add <origem>`; localhost já é aceito). No celular, a API local usa o IP da máquina, não `localhost`.
3. Acessibilidade por tela (checklist de `docs/app-map/07_design/acessibilidade.md`; hoje todas as colunas A11y do painel estão `⬜`).
4. Entregáveis da disciplina (`todo-mobile.md` bloco 1): README com a **Ficha completa**, prints (`docs/prints/`), vídeo ≤ 3 min, **`prompts.md` do monorepo e do espelho com o registro de uso de IA**
   (**não foi atualizado com o trabalho de hoje**: exigência da GS), `DRY_RUN=1 bash scripts/sync_mirrors.sh mobile-app` e depois o real, envio no Teams (um integrante).
5. Só se sobrar prazo: TL-14 e TL-15 (compartilhar, FN-15/16; GPS em segundo plano, PL-24).

## 6. Decisões abertas (do Lucas; não decida por ele)
FN-13 (onde ficam histórico e locais salvos sem SQLite; US-04 AC4 e DT-08 pedem "só no aparelho") · aprovação visual do design (PL-19) · mapa base e atribuição (PL-25) ·
polígono do município (PL-11) · comportamento sem rede (PL-12) · posição do indicativo (TL-07 ou só TL-09) · `CenaRotaAcesa` (sem biblioteca de desenho) ·
texto para senha curta (`SENHA_CURTA`) e para o aceite do aviso (o Neon Auth não grava o aceite) · API que grava no Neon e conciliação do contrato (PL-05, PL-18) ·
dono do backend: o `src/csharp-backend` (EF Core + SQLite) é de outras pessoas; **não** trocar o banco dele sem o aval delas.

## 7. Armadilhas deste ambiente (Windows)
- `npx expo lint` **não termina**: use `npx eslint src`.
- No `jest-expo` o `fetch` global é **simulado**: teste de rede real é script Node (veja `scripts/e2e-neon-auth.mjs`).
- Arquivos dentro de `src/app/` viram **rota**: nunca ponha teste lá (use `src/__tests__/telas/...`).
- Componentes de `components/planejar|mapa|resultado` importam de `@/components`; **não** os reexporte pelo índice (ciclo). O mapa também fica fora do índice (`react-native-maps` só no nativo; há `.web.tsx`).
- Variáveis `EXPO_PUBLIC_*` vão para o pacote: nunca ponha `DATABASE_URL` ou segredo nelas. O app **nunca** conecta no Postgres (só no Neon Auth, por HTTPS).
- `npm audit`: 9 vulnerabilidades baixas (do `deepmerge`, sem correção). Há `overrides` de `glob` e `minimatch` no `package.json`; **não** rode `npm audit fix --force` (rebaixa o Expo para o SDK 52).
- Em modo CI o Metro pode não ver mudanças: reinicie o servidor depois de editar.
- Workers via Alethe: use `cwd` na **raiz do monorepo** (documentos dentro do escopo) e sem `askForApproval`; o Codex travava por causa disso. Chamadas `alethe_check` bloqueantes expiram.

## 8. Redesign (14/11)
O Lucas pediu melhorar design e experiência. Há **5 planos prontos** em `docs/redesign/` (`01` entrada e conta, `02` planejar/ponto/busca, `03` resultado, `04` detalhes/dados/configurações, `05` sistema/navegação/guia) e a **síntese** em `docs/redesign/06_sintese_e_prioridades.md` (comece por ela). Nada foi implementado. A **Onda 1** da síntese não depende de decisão nova e pode começar; as ondas 2 e 3 dependem de aprovação de texto, do PL-19 e de teste em celular. Não instale as ferramentas do guia antes de 18/11 (ver o veredito por ferramenta na síntese). Estado do código antes do redesign: `tsc` e ESLint limpos, 338 testes em 26 suítes.

## Atualização 14/11/2026 (Redesign 2, D-29)
- Home sem seletor Ida/Volta; tocar em origem ou destino abre direto o mapa em tela cheia (TL-05) com busca por texto, localização, lugares salvos e salvar lugar. Sem pontos de exemplo na interface.
- Lugares salvos: `src/locais/` (SecureStore, até 10, só no aparelho). Busca: `src/services/geocodificacao.ts` (geocodificador do sistema, só ao tocar em Buscar).
- Imagens: todas placeholders; trocar em `src/theme/imagens.ts` (guia em `assets/imagens/LEIA-ME.md`).
- Verificação: `tsc`, ESLint, 395 testes em 32 suítes, exportações web/Android e `expo-doctor` 20/20. Nada commitado.
- Pendente: o Lucas testar a busca no celular e informar as imagens; citar a busca no aviso de privacidade `[HIPÓTESE]`; histórico de trajetos `[EM ABERTO]`.
