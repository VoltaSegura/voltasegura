# Plano B: plano de implementação (dados reais no app)

**Data:** 15/11/2026 · **Escopo:** só Mobile (D-27) · **Prazo:** código congelado na noite de 18/11; entrega 19/11 23h55.
**Base:** `00_plano.md` (decisões B1 a B8 e riscos), `01_inventario_e_contrato.md`, `02_roteamento.md`, `03_exposicao_neon.md`, e o vídeo da Onda 2 (`docs/redesign/09_onda2_evidencia_e_plano_onda3.md` §4).
**Status das afirmações:** `[DECISÃO]` já decidido · `[HIPÓTESE]` proposta do lead · `[EM ABERTO]` depende de medir ou de decisão do Lucas.
**Regra permanente:** `src/mobile-app/AGENTS.md` ("mudou o fluxo, mudou a documentação"). Linguagem: `docs/05` (exposição estimada, nada de "rota segura"/"perigoso"/nota). Sem commit sem o Lucas pedir. Segredos (`.env.local`, `DATABASE_URL`) nunca em log, chat ou commit.

## 1. O que o app faz hoje (ponto de partida verificado)
- `EXPO_PUBLIC_API_MODE=mock` (padrão) devolve **fixtures** rotuladas `exemplo: true`. `ajustarAosPontos` (`services/geometria.ts`) **estica** a polyline fixa entre a origem e o destino escolhidos: por isso o traço no mapa cruza a cidade em linha quase reta e não segue ruas (observado no vídeo).
- `EXPO_PUBLIC_API_MODE=api` faz `POST /api/consultas` e espera um `RespostaConsulta` pronto (`services/consulta.ts`): **não existe esse servidor**. Apontar a variável para o OTP2 não funciona.
- `services/otp2.ts` existe (`mapearOtp2`, `faixaDoDia`, `criarConsultaOtp2`, `CONSULTA_OTP2`) com testes de fixture sintética, **mas não está ligado**. Exposição sai `null` e `caso` sai `INDISPONIVEL` (`exemplo: false`).
- Falta: servidor OTP2 no ar, esquema/carga da SSP no Neon, cálculo de exposição num serviço, a camada que escolhe a fonte, e as telas tratando o caso "só roteamento".

## 2. Resultado esperado (definição de pronto do Plano B)
1. Com o OTP2 no ar e `EXPO_PUBLIC_API_MODE=otp2`, escolher origem e destino reais devolve **rotas reais** (tempo, km a pé, trocas, linhas, horários do GTFS) e o **traço segue as ruas**, por trecho (a pé x ônibus).
2. A tela diz com honestidade o que é real e o que não é: **sem exposição validada**, a UI mostra "Só roteamento" (sem selo de exposição, sem foco de menor exposição, sem número de ocorrências), não zero e não exemplo.
3. Com a exposição da SSP carregada e a RPC testada, a resposta traz exposição, `caso` e cobertura reais; o selo EXEMPLO some **só** nas partes reais.
4. Qualquer falha (OTP2 fora do ar, rede, formato) vira erro tratado com "Tentar de novo"; **nunca** cai sozinho em dado de exemplo sem avisar.
5. Nenhuma coordenada ou e-mail em log (US-19 AC2); o app nunca conecta direto no Postgres (D-24).

## 3. Contrato com a frente de redesign (o único ponto de contato)
O redesign (outro terminal/branch) cuida de **telas, componentes e textos**; o Plano B cuida de **serviços e dados**. Os dois conversam por estes tipos em `src/services/tipos.ts`, que **só o Plano B altera** (o redesign lê):
- `Rota.exposicao`, `Rota.categorias`, `RespostaConsulta.caso`, `panoramaMunicipal` podem ser `null`/`INDISPONIVEL` → as telas precisam renderizar "só roteamento".
- `Trecho.geometria` (polyline 5) por trecho e `Rota.geometria` (a rota inteira) → o mapa desenha **por trecho**: a pé em pontilhado/cor neutra, ônibus em traço cheio; a rota selecionada acesa.
- `RespostaConsulta.exemplo: boolean` passa a ser **por bloco**? `[HIPÓTESE]` Manter o booleano único (`exemplo`) e acrescentar `fontes: { roteamento: 'otp2' | 'exemplo'; exposicao: 'ssp' | 'exemplo' | 'indisponivel' }`. Mudança de tipo é feita **primeiro** (tarefa B-02) e avisada ao redesign.
- Horários: `saidaPrevista`/`chegadaPrevista`/`partidaPrevista` sempre ISO **com fuso**; a tela formata no fuso do aparelho (corrige o B2 do vídeo; a correção de formatação é do redesign, o formato do dado é do Plano B).

**Pastas.** Plano B: `src/services/**`, `src/config/ambiente.ts`, `scripts/**` (SQL, carga, OTP2), `docs/dados-reais/**`. Redesign: `src/components/**`, `src/app/**`, `src/textos/**`, `src/theme/**`, docs de tela/fluxo. Zona compartilhada (combinar antes de editar): `components/mapa/MapaResultado*`, `components/resultado/**`, `services/tipos.ts`. Docs compartilhados: cada frente escreve só nas próprias seções e **não** reescreve as do outro (`01_decisoes.md`, `12_pendencias`, `todo-mobile.md`, `prompts.md`: só acrescentar linhas ao final).

## 4. Tarefas
Legenda de dono: **PB** = terminal do Plano B · **L** = Lucas · **RD** = terminal do redesign. Tamanho: P (≤1 h), M (2 a 4 h), G (≥ meio dia).

### Fase 1 · Sem infraestrutura (começa já, não depende do Lucas)
| ID | Tarefa | Onde | Dono | Tam. | Pronto quando |
|---|---|---|---|---|---|
| B-01 | **Validar o JSON em tempo de execução** (falha de formato vira `INDISPONIVEL`, nunca número inventado) | `services/validar.ts`, `consulta.ts` | PB | M | testes com JSON truncado, tipo errado e campo ausente |
| B-02 | **Tipos**: `fontes` na resposta, geometria por trecho obrigatória, exposição nula permitida; avisar o redesign | `services/tipos.ts`, fixtures | PB | P | `tsc` limpo; fixtures atualizadas; nota no PR |
| B-03 | **Geometria honesta no mock**: parar de esticar a polyline fixa; no mock, desenhar só os pontos escolhidos e **rotular "trajeto de exemplo"** (ou ocultar o traço) | `services/geometria.ts`, `MapaResultado` (zona compartilhada: combinar com RD) | PB+RD | M | com mock, o app não finge que o traço segue ruas; teste |
| B-04 | **Seleção de fonte**: `EXPO_PUBLIC_API_MODE = mock \| api \| otp2`; `EXPO_PUBLIC_OTP2_URL`; `servicos.consulta` escolhe; sem queda silenciosa para mock | `config/ambiente.ts`, `services/index.ts`, `.env.example` | PB | M | teste por modo; `.env.example` documentado |
| B-05 | **Ligar `otp2.ts` ao app**: `criarConsultaOtp2(url)` com `POST /otp/gtfs/v1`, timeout, `AbortSignal`, erros mapeados (`SEM_REDE`, `INDISPONIVEL`, `SEM_SERVICO`) | `services/otp2.ts`, `consulta.ts` | PB | M | testes com `fetch` simulado: sucesso, 5xx, timeout, resposta vazia |
| B-06 | **Esquema SQL** (`ssp_boletim`, `ssp_cobertura`, `ssp_panorama`), índices GiST, função de exposição por rota (N, L, D, p, estabilidade 50/100/150 m, cobertura, `caso`), testes SQL em arquivo | `scripts/sql/` | PB | G | arquivos aplicáveis ao `dev`; casos de teste com dados sintéticos |
| B-07 | **Script de carga da SSP** (XLSX em streaming, hash do arquivo, contagens, deduplicação por boletim, relatório de cobertura) | `scripts/importar-ssp.py` | PB | G | roda em amostra sintética; imprime contagens; não imprime dado pessoal |
| B-08 | **Casos da UI**: o redesign trata `exposicao = null` e `caso = INDISPONIVEL` como "Só roteamento" (selo, textos, "Sobre os dados") | `components/resultado`, `textos`, TL-07 a TL-11 | RD | M | fixture `so_roteamento` renderiza sem número de ocorrências nem foco de exposição |

### Fase 2 · Infraestrutura (depende do Lucas)
| ID | Tarefa | Dono | Tam. | Bloqueia | Pronto quando |
|---|---|---|---|---|---|
| B-10 | Instalar Java 25; montar o grafo OTP2 (`scripts/otp2/README.md`); anotar RAM, tempo, tamanho e latência | **L** | M | B-11, B-20 | `graphiql` responde no notebook |
| B-11 | Expor o OTP2 na LAN (IP, porta 8080, firewall só rede privada); abrir no celular | **L** | P | B-20 | `http://IP:8080/graphiql` abre no celular |
| B-12 | Testar `fetch` HTTP puro em cada aparelho (Android e iPhone); se barrar, HTTPS ou túnel | L+PB | P | B-20 | consulta do app chega ao OTP2 |
| B-13 | Neon `dev`: conferir **região**, cotas, **PostGIS** e **Data API**; não mexer em `production` | **L** (PB orienta) | P | B-14 | quatro respostas anotadas em `docs/dados-reais/` |
| B-14 | Provar no `dev`: RPC com JWT do Neon Auth (`/token`; o cookie de sessão não serve como Bearer) | PB+L | M | B-15 | chamada protegida de teste retorna 200 com o JWT |
| B-15 | **Aplicar o SQL** (B-06) e **carregar a SSP** (B-07) no `dev`; relatório de cobertura | PB+L | M | B-30 | contagens batem com o relatório do script |

### Fase 3 · Ligação e prova
| ID | Tarefa | Dono | Tam. | Pronto quando |
|---|---|---|---|---|
| B-20 | **Ponta a ponta de roteamento no celular**: origem e destino reais → rotas reais com traço pelas ruas | PB+L | M | vídeo curto do celular |
| B-21 | Mapa desenha **por trecho** (a pé/ônibus) com a geometria real; câmera encaixa a rota acima da folha (U7 do redesign) | RD (+PB para o dado) | M | pinos não cortam; traço acompanha as ruas |
| B-30 | **Exposição real**: ligar a RPC à resposta (`exposicao`, `categorias`, `caso`, `panoramaMunicipal`); `fontes.exposicao = 'ssp'` | PB | G | caso `CONCLUSIVO` ou `INSUFICIENTE` real numa consulta de teste; selo EXEMPLO some só nos blocos reais |
| B-31 | **Supressão e linguagem** (B5): sem contagem fina até revisão; textos conferem `docs/05` | PB+RD | P | varredura de linguagem passa |
| B-40 | **Relatório honesto**: o que ficou real, o que ficou EXEMPLO e por quê (para o relatório e o vídeo) | PB | P | `docs/dados-reais/` atualizado + `todo-mobile.md` |

## 5. Cronograma e corte
| Data | Meta | Corte |
|---|---|---|
| 15/11 (hoje) | B-01, B-02, B-04, B-05 (PB); **L inicia B-10 e B-13** | — |
| 16/11 | B-06, B-07, B-03, B-08; **L termina B-10 e B-11**; B-12 | **Sem itinerário com geometria até 16/11 → congelar em EXEMPLO (B7)**: entregar B-03, B-08 e B-40 |
| 17/11 | B-14, B-15, B-20, B-21 | Sem adaptador funcionando no aparelho até 17/11 → idem |
| 18/11 | B-30, B-31, B-40; congelar à noite; `DRY_RUN` do sync | B-30 incompleto → entrega "só roteamento" (dado real de rota + exposição indisponível) |
| 19/11 | Entregar até 23h55 (prints, vídeo, Teams) | — |
**Ordem de valor se o tempo apertar:** B-04/B-05/B-20 (rota real) > B-21 (traço pelas ruas) > B-30 (exposição). A exposição sem rota real não serve; a rota real sem exposição serve ("só roteamento", honesto).

## 6. Riscos e decisões que continuam abertas
- OTP2 em 16 GB de RAM com o recorte de SP: **medir antes de prometer** (B-10). `[EM ABERTO]`
- Neon em sa-east-1 pode não ter Functions e talvez nem Data API: muda B2 (API fina própria). `[EM ABERTO]`
- HTTP claro (OTP2 na LAN) pode ser bloqueado no Android/iPhone; `app.json` hoje não declara exceção de tráfego sem TLS. `[EM ABERTO]` B-12
- Trecho que atravessa a meia-noite não cabe em um só `faixaDoDia`: o serviço divide o trecho. `[HIPÓTESE]`
- Licença do GTFS (SPTrans) e crédito OSM: confirmar antes de publicar.
- **Aviso de privacidade:** a consulta com dados reais continua sem guardar origem/destino (US-19 AC1); se o OTP2 for hospedado fora do aparelho do Lucas, o aviso (TL-13) precisa dizer que o trajeto vai a um servidor do projeto. `[HIPÓTESE]`

## 7. Como trabalhar nos dois terminais (git worktree)
Duas frentes ao mesmo tempo **não** devem editar a mesma pasta. Cada uma ganha seu *worktree* (uma cópia de trabalho própria do mesmo repositório) e sua branch:

| Frente | Branch | Pasta | Terminal |
|---|---|---|---|
| Redesign (Onda 3) | `feat/redesign-onda3` | `D:\Documentos\FIAP\3ESPX\GLOBAL-SOLUTION\volta-segura\voltasegura` (a atual) | este chat |
| Plano B | `feat/plano-b` | `D:\Documentos\FIAP\3ESPX\GLOBAL-SOLUTION\volta-segura\voltasegura-planob` | novo terminal |

Regras:
1. **Cada frente só commita na própria branch.** Merge no fim, na ordem: redesign primeiro (mais estável), depois o Plano B faz `git rebase feat/redesign-onda3` e resolve conflitos (quem sabe o que mudou na geometria é o Plano B).
2. **Fora do git não vem junto:** no worktree novo, rodar `npm install` em `src/mobile-app` e **copiar o `.env.local`** à mão (ele é ignorado pelo git e tem segredos: não colar em chat). O `node_modules` do outro worktree não é compartilhado.
3. **Portas:** só um `npx expo start` por vez na 8081; o segundo usa `--port 8082`. O Expo Go no celular abre um de cada vez.
4. **Mudança de tipo em `services/tipos.ts`** (B-02): é um commit pequeno, feito primeiro no Plano B e trazido para o redesign com `git merge feat/plano-b` (ou `git cherry-pick`) assim que sair.
5. **Docs compartilhados:** só acrescentar linhas ao final (`prompts.md`, `todo-mobile.md`, `12_pendencias`); reescritas de seção ficam com a frente dona do assunto. Conflito nesses arquivos se resolve mantendo as duas linhas.
6. Ao terminar, remover o worktree: `git worktree remove ..\voltasegura-planob` (depois do merge).
7. O espelho `volta-segura/mobile-app` recebe a cópia só **depois** do merge final, pelo `scripts/sync_mirrors.sh` (não editar código no espelho).

Prompt de partida para o terminal do Plano B: `docs/dados-reais/05_prompt_terminal_plano_b.md`.

## 8. Andamento (o Plano B acrescenta aqui; não reescrever as seções acima)
| Data | Tarefa | Estado | Evidência e notas |
|---|---|---|---|
| 15/11 | B-01 | feita | `src/services/validar.ts` + `validar.test.ts`. Duas camadas: roteamento/origem inválidos → `ErroServico('INDISPONIVEL','FORMATO')`; exposição inválida → rotas mantidas, números `null`, `caso` e `fontes.exposicao` indisponíveis, sem foco `MENOR_EXPOSICAO`. Horário sem fuso é falha de formato. Aplicada ao modo `api` e à saída do OTP2 |
| 15/11 | B-02 | feita | `tipos.ts`: `FontesConsulta` e `RespostaConsulta.fontes`; `exemplo` precisa bater com `fontes` (é `true` se algum bloco for exemplo). `[DECISÃO]` do Lucas (15/11): exposição desconhecida = **objeto com campos `null`**, não objeto nulo. Fixtures com `fontes: exemplo/exemplo`; nova `so_roteamento` (`exemplo/indisponivel`) para o B-08 |
| 15/11 | B-04 | feita | `config/ambiente.ts` (`lerModo`, `urlOtp2`), `services/selecao.ts` (`selecionarConsulta`), `.env.example`. Vazio = `mock`; valor desconhecido ou modo sem URL = `INDISPONIVEL`/`CONFIGURACAO` |
| 15/11 | B-05 | feita | `services/otp2.ts`: tempo limite `[HIPÓTESE]` 20 s → `INDISPONIVEL` 504; cancelamento repassado ao `fetch`; HTTP de erro/JSON ilegível → `INDISPONIVEL`; rede → `SEM_REDE`. `routingErrors` (conferido no schema v2.10.0): `OUTSIDE_BOUNDS` → `FORA_DA_AREA`; sem itinerário por outro motivo → resposta válida com zero rotas (a busca já mostra "sem transporte" e "mudar horário"; não existe um tipo de erro `SEM_SERVICO`). `TROLLEYBUS` → ônibus. Data do GTFS sai vazia (antes saía a data de hoje) |
| 15/11 | B-06 | escrita, **não executada** | `src/mobile-app/scripts/sql/` (001 esquema, 002 carga com troca atômica da importação ativa, 003 `mobile_api.comparar_exposicao`, 004 testes sintéticos em `BEGIN…ROLLBACK`, referência Python com 13 testes contra `scipy.stats.binomtest`). Precedência de motivos `[HIPÓTESE]`: no par COBERTURA → AMOSTRA → MISTOS → SEM_DIFERENCA → LARGURA; na consulta NAO_APLICAVEL > CONCLUSIVO > INSUFICIENTE > MISTOS > SEM_DIFERENCA. Feita por worker Claude (Alethe) e conferida pelo lead. Pasta em `src/mobile-app/scripts/` (e não na raiz) para ir junto no espelho da disciplina |
| 15/11 | B-07 | feita (sem carga) | `src/mobile-app/scripts/ssp/importar_ssp.py` + 25 testes. Execução real em 15/11: SHA256 `f627d84e…acbaf`; 814.900 linhas lidas; 281.966 válidas (SP, período jan–set/2026, naturezas do docs/07); 0 duplicatas; 95 boletins com mais de uma natureza, sem divergência de coordenada/faixa; 94 circunscrições, cobertura média 90,8% e mínima 78,1% (65º DP), 1 abaixo de 80% (docs/08 registrava 90,6% e 77,6%). CSVs não versionados |
| 16/11 | B-10 | feita (com ressalvas) | Java Temurin 25.0.5; `-Xmx10G` bastou; montagem 9 min 46 s; `graph.obj` 1,1 GB; grafo 4.697.275 vértices, 22.261 paradas, 2.267 padrões; servidor sobe em ~40 s; `java` parado: 222 MB em uso e 7.885 MB reservados. **Pico da montagem não medido.** A montagem leu também `sudeste-latest.osm.pbf` (864 MB), que o README mandava apagar: remontar sem ele é opcional. Teste 1 (`consultar_teste.py`, 17/11): ida com 1 alternativa só a pé (1.638 m); volta às 23h com 3 alternativas (ônibus 7545-10, uma com baldeação); trechos a pé com geometria salva. Alternativas 1 e 2 da volta diferem em 1 min; a 1ª caminhada da volta tem 1.657 m `[EM ABERTO]` conferir a plausibilidade |
| 16/11 | B-12 e B-20 | adiados | `[DECISÃO]` do Lucas (16/11): testar o app no aparelho só depois do merge com o redesign, porque as telas mudaram muito. Ordem do merge: redesign primeiro, depois rebase do Plano B. Corte de 17/11 do cronograma segue valendo |
| 16/11 | B-13 | feita | `docs/dados-reais/06_neon_dev_verificacao.md`: região `aws-sa-east-1` (sem Functions), plano Free (1 GB, 100 h), PostGIS 3.6.4 disponível e não instalado, Data API pode ser ativada. Opção A segue de pé; falta o B-14 |
| 16/11 | handoff | feito | `07_handoff_para_redesign.md`: estado, contrato, o que o redesign faz (B-08, B-03, B-21), ordem do merge e o que fica com o Plano B. Verificação no worktree: `tsc` limpo e 504 testes passando |
| 16/11 | B-11 | feita | OTP2 escuta em `0.0.0.0:8080`; regra de firewall TCP 8080 só no perfil Privado; `graphiql` abre no celular pelo IP da LAN (não o de Tailscale/Radmin). IP da LAN não registrado aqui por mudar com a rede |
