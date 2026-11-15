# Prompt de partida: terminal do Plano B

Cole o texto abaixo na primeira mensagem do novo terminal (Claude Code), **dentro da pasta do worktree** `voltasegura-planob`.

---

Você é o agente da frente **Plano B (dados reais no app)** do VoltaSegura (app mobile, Expo SDK 58, entrega 19/11/2026 23h55, código congelado na noite de 18/11). Hoje é 15/11/2026.

**Leia, nesta ordem, antes de qualquer coisa:**
1. `AGENTS.md` da raiz (linguagem do `docs/05` tem prioridade máxima: "exposição estimada", nunca "rota segura", "perigoso" ou nota) e `src/mobile-app/AGENTS.md` (inclui a regra "mudou o fluxo, mudou a documentação").
2. `docs/dados-reais/04_plano_implementacao.md` (**o seu plano**: tarefas B-01 a B-40, dono, cronograma e corte), depois `00_plano.md` e, se precisar, `01`, `02` e `03`.
3. `docs/redesign/09_onda2_evidencia_e_plano_onda3.md` §4 (o que o vídeo mostrou sobre o traçado mockado).

**Escopo:** só Mobile. Ignore e nunca leia `src/csharp-backend`, `src/soa-backend`, `src/ml`, `src/cybersecurity`, `src/os-infra`, `src/physical-computing`, `src/qa` (decisão D-27).

**Você é dono de:** `src/mobile-app/src/services/**`, `src/mobile-app/src/config/ambiente.ts`, `scripts/**` (SQL, carga da SSP, OTP2) e `docs/dados-reais/**`. **Não edite** componentes, telas, textos e tema (`src/components`, `src/app`, `src/textos`, `src/theme`): isso é da frente de redesign, em outra branch. Zona compartilhada (combine antes): `components/mapa/MapaResultado*`, `components/resultado/**`, `services/tipos.ts` (só você altera os tipos; avise ao mudar).

**Regras:**
- Branch `feat/plano-b`, neste worktree. **Não faça commit sem o Lucas pedir.** Não faça push.
- Segredos: `src/mobile-app/.env.local` (copiado à mão) tem `DATABASE_URL` e chaves do Neon. **Nunca imprima, cole nem registre os valores.** O app nunca conecta direto no Postgres; só `EXPO_PUBLIC_*` vai para o pacote. Coordenadas e e-mail nunca vão para log.
- Neon: projeto `dark-bread-31601140`, branch `dev` (expira em 21/11). **Não mexa na `production`.**
- Não instale dependências sem registrar na `docs/app-map/01_decisoes.md`. Não rode `npm audit fix --force`.
- Dado de exemplo nunca vira "dado real": o que não for real fica `EXEMPLO`/indisponível e a tela diz isso.
- Ações que dependem do Lucas (Java, OTP2, firewall, console do Neon): **peça e espere**; não execute downloads grandes nem abra portas.
- Registre o uso de IA em `prompts.md` (acrescente linhas só ao final) e atualize `todo-mobile.md` e os docs do fluxo quando mudar comportamento.
- Verificação antes de dizer que terminou: `npx tsc --noEmit`, `npx eslint src`, `npx jest` (hoje 399 testes passando). `npx expo lint` não termina; use `npx eslint src`.

**Comece por** B-01, B-02, B-04 e B-05 (não dependem de infraestrutura). Ao terminar cada tarefa, diga o que mudou, os arquivos tocados e o resultado dos três comandos. Se esbarrar na zona compartilhada ou precisar mudar um tipo, avise o Lucas antes.

---

## Preparar o worktree (uma vez)
```powershell
cd D:\Documentos\FIAP\3ESPX\GLOBAL-SOLUTION\volta-segura\voltasegura-planob\src\mobile-app
npm install
# copie o .env.local da pasta original (não cole o conteúdo em chat):
Copy-Item ..\..\..\voltasegura\src\mobile-app\.env.local .env.local
npx expo start --port 8082
```
