# Handoff do Plano B para o terminal do redesign (16/11/2026)

**Para quem lê:** o agente do redesign (`feat/redesign-onda3`) que vai trazer o Plano B (`feat/plano-b`) para a sua branch. Leia antes de mesclar. Base: `04_plano_implementacao.md` (§4 tarefas, §7 worktrees, §8 andamento).
**Verificado em 16/11 no worktree do Plano B:** `tsc --noEmit` sem erros; `jest` com 33 suítes e 504 testes passando.
**Regras que continuam:** sem commit ou push sem o Lucas pedir; segredos (`.env.local`, `DATABASE_URL`, JWT) nunca em log, chat ou commit; linguagem de `docs/05` ("exposição estimada", nunca "rota segura"/"perigoso"/nota); mudou o fluxo, mudou a documentação (`src/mobile-app/AGENTS.md`).

## 1. O que o Plano B já entregou (código)
| Tarefa | O que é | Onde |
|---|---|---|
| B-01 | Validação do JSON em tempo de execução. Roteamento/origem inválidos viram `ErroServico('INDISPONIVEL','FORMATO')`; exposição inválida mantém as rotas, números `null` e `caso` indisponível. Horário sem fuso é falha de formato | `src/services/validar.ts` (+ testes) |
| B-02 | `RespostaConsulta.fontes` (`FontesConsulta`): `roteamento: 'otp2'\|'exemplo'`, `exposicao: 'ssp'\|'exemplo'\|'indisponivel'`. `exemplo` precisa bater com `fontes` (é `true` se algum bloco for exemplo). Exposição desconhecida = **objeto com campos `null`**, não objeto nulo (decisão do Lucas, 15/11). Fixture nova `so_roteamento` | `src/services/tipos.ts`, `fixtures/` |
| B-04 | Modos `EXPO_PUBLIC_API_MODE = mock \| api \| otp2`; vazio = `mock`; valor desconhecido ou modo sem URL = `INDISPONIVEL`/`CONFIGURACAO`; sem queda silenciosa para mock | `src/config/ambiente.ts`, `services/selecao.ts`, `.env.example` |
| B-05 | Adaptador OTP2: tempo limite 20 s (`[HIPÓTESE]`), cancelamento repassado ao `fetch`, rede = `SEM_REDE`, HTTP de erro/JSON ilegível = `INDISPONIVEL`, `OUTSIDE_BOUNDS` = `FORA_DA_AREA`, zero itinerários = resposta válida com zero rotas | `src/services/otp2.ts` |
| B-06 | SQL da exposição (esquema, carga, `mobile_api.comparar_exposicao`, testes sintéticos). **Escrito, não executado no Neon** | `src/mobile-app/scripts/sql/` |
| B-07 | Importador da SSP (rodado na planilha real: 281.966 linhas válidas, 94 circunscrições). **Sem carga no banco** | `src/mobile-app/scripts/ssp/` |

Documentos tocados pelo Plano B: `TODO.md`, `prompts.md`, `docs/app-map/12_pendencias_e_lacunas.md`, `src/mobile-app/ARQUITETURA.md`, `src/mobile-app/todo-mobile.md`, `docs/dados-reais/04` e `06`. Se der conflito neles, **mantenha as duas linhas** (só acrescentamos ao final).

## 2. O que o redesign precisa fazer depois de mesclar
| ID | O quê | Observação |
|---|---|---|
| B-08 | Telas tratam `exposicao` com campos `null`, `caso = INDISPONIVEL` e `fontes.exposicao = 'indisponivel'` como **"Só roteamento"**: sem selo de exposição, sem foco de menor exposição, sem número de ocorrências, sem zero | Testar com a fixture `so_roteamento` |
| B-03 | **Geometria honesta no mock.** `ajustarAosPontos` (`services/geometria.ts`) estica a polyline fixa entre origem e destino, e o traço cruza a cidade em linha reta. No mock, desenhar só os pontos escolhidos e rotular "trajeto de exemplo" (ou ocultar o traço). **Feito (mock devolve só origem/destino; `MapaResultado` com `exemplo` não traça e rotula "trajeto de exemplo")** | Zona compartilhada: `MapaResultado*` |
| B-21 | Mapa desenha **por trecho** (a pé em pontilhado/cor neutra, ônibus em traço cheio); rota selecionada acesa; câmera encaixa a rota acima da folha | Depende do dado real (B-20) |
| — | Selo EXEMPLO por bloco: some só nas partes reais (`fontes.*`), não por `exemplo` global | Ao mexer em `components/resultado` |
| — | Horários chegam em ISO **com fuso**; formatar no fuso do aparelho | Correção de formatação é do redesign |

Confirmar em `tipos.ts` se `Trecho.geometria` e `Rota.geometria` estão como a §3 do plano pede; o B-02 registra só `fontes` e a exposição nula.

## 3. Como mesclar (ordem do plano)
1. **Redesign primeiro** (mais estável). Depois, `git rebase feat/redesign-onda3` na `feat/plano-b`; quem sabe o que mudou na geometria é o Plano B.
2. O Plano B **só tem alterações não commitadas** até o Lucas pedir o commit. Peça ao Lucas para mandar commitar a `feat/plano-b` antes de puxar; o `git merge` não traz arquivos sem commit.
3. Zona compartilhada que pode conflitar: `services/tipos.ts` (só o Plano B altera), `services/index.ts`, `components/mapa/MapaResultado*`, `components/resultado/**`.
4. Depois do merge: `npm install` em `src/mobile-app`, rodar `npm run typecheck` e `npm test` (referência: 33 suítes, 504 testes). `.env.local` não vem pelo git.

## 4. O que continua com o Plano B / com o Lucas
| ID | Estado | Detalhe |
|---|---|---|
| B-10 | feita | OTP2 2.10.0 no notebook do Lucas: Java 25.0.5, `-Xmx10G`, montagem de 9 min 46 s, `graph.obj` de 1,1 GB, servidor sobe em ~40 s. Teste 1 (`consultar_teste.py`) devolveu itinerários com geometria nos trechos a pé. Pico de memória da montagem não medido; remontar sem `sudeste-latest.osm.pbf` é opcional |
| B-11 | feita | OTP2 escuta em `0.0.0.0:8080`; firewall TCP 8080 só em rede privada; `graphiql` abre no celular pelo IP da LAN (`http://IP_DA_LAN:8080`). O IP muda com a rede; não usar o de Tailscale/Radmin |
| B-12 | **adiado** (decisão do Lucas, 16/11) | Testar o `fetch` HTTP no aparelho só depois do merge, porque as telas mudaram. `.env.local` já existe no worktree do Plano B; para testar: `EXPO_PUBLIC_API_MODE=otp2` e `EXPO_PUBLIC_OTP2_URL=http://IP_DA_LAN:8080`; `npx expo start --port 8082` se a 8081 estiver ocupada |
| B-13 | feita | `06_neon_dev_verificacao.md`: Neon `dark-bread-31601140` em `aws-sa-east-1` (sem Functions), plano Free (1 GB, 100 h), PostGIS 3.6 **instalado** na `dev`, Data API ativável (**ainda não ativada**, confirmar) |
| B-14 | **próximo** | Ativar a Data API na `dev`, criar função de teste sintética em `mobile_api`, obter o JWT em `/token` do Neon Auth (o cookie de sessão não serve como Bearer) e provar: com JWT = 200, sem JWT = 401/403. Tabelas `ssp_*` nunca expostas. Nomes de papel (`authenticated`) e exposição de schema são do PostgREST comum, **a confirmar no console** |
| B-15 | depois | Aplicar o SQL (B-06) e carregar a SSP (B-07) no `dev`; medir `pg_total_relation_size` |
| B-20 | adiado com o B-12 | Ponta a ponta no celular |
| B-30, B-31, B-40 | pendentes | Exposição real; varredura de linguagem; relatório honesto |

## 5. Cortes e prazos (do plano)
- 17/11: sem adaptador funcionando no aparelho, congelar em EXEMPLO e entregar B-03, B-08 e B-40.
- 18/11 à noite: congelar o código; se o B-30 não ficar completo, entregar "só roteamento" (rota real + exposição indisponível).
- 19/11, 23h55: entrega. Espelhos de disciplina só depois do merge final (`scripts/sync_mirrors.sh`).
- Ordem de valor: rota real (B-04/B-05/B-20) > traço pelas ruas (B-21) > exposição (B-30).

## 6. Riscos abertos
- HTTP claro (OTP2 na LAN) pode ser barrado por Android/iPhone; `app.json` não declara exceção de tráfego sem TLS. `[EM ABERTO]` (B-12)
- Os 1.657 m de caminhada da 1ª alternativa da volta (FIAP → ponto da Paulista) parecem longos; conferir a posição do ponto de origem. `[EM ABERTO]`
- Aviso de privacidade (TL-13): se o OTP2 ficar fora do aparelho do Lucas, o texto precisa dizer que o trajeto vai a um servidor do projeto. `[HIPÓTESE]`
- Licença do GTFS (SPTrans) e crédito OSM ("© OpenStreetMap contributors") antes de publicar.
