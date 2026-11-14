# Plano de redesign — TL-04 Planejar, TL-05 Escolher ponto, TL-06 Buscando

## 1. Resumo em 5 linhas

1. `[DECISÃO]` O fluxo aprovado permite escolher origem e destino por mapa, GPS sob demanda ou pontos locais/de exemplo; não prevê busca externa de endereço (`docs/app-map/01_decisoes.md:9`).
2. `[HIPÓTESE]` A maior melhoria é mostrar, já em Planejar, **como** escolher cada ponto e **qual** ponto foi escolhido, sem exibir coordenadas (`src/mobile-app/src/app/(app)/planejar.tsx:43-55`).
3. `[DECISÃO]` A melhoria recente do mapa já acrescentou marcador e câmera animada para GPS/exemplo; ainda faltam confirmação inequívoca e tratamento do mapa indisponível (`src/mobile-app/src/components/mapa/MapaPonto.native.tsx:25-59`).
4. `[HIPÓTESE]` Buscando precisa diferenciar progresso, ausência de alternativas e falhas, preservar a consulta e tornar o cancelamento real (`src/mobile-app/src/app/(app)/buscando.tsx:29-65`).
5. `[EM ABERTO]` Visual, limite municipal, armazenamento local e provedor do mapa aguardam Lucas; priorizar ajustes sem dependências até o congelamento de 18/11 (`docs/app-map/12_pendencias_e_lacunas.md:15-25`).

**Como ler:** ✅ evidência de implementação; ⚠️ parcial ou sem teste em aparelho; ❌ ausente. A rubrica abaixo é uma auditoria **estática**, não um teste visual ou funcional. Esforço P = algumas horas; M = até um dia; G = mais de um dia, estimativas para priorização, não prazos prometidos. Todas as propostas de texto e fluxo novas são `[HIPÓTESE]` até aprovação do Lucas. Caminhos de código nesta análise partem de `src/mobile-app/src/`.

## 2. Rubrica do guia, seção 8

| Item do checklist | TL-04 | TL-05 | TL-06 |
|---|---|---|---|
| Tema central | ✅ `components/planejar/CampoPonto.tsx:10-12` usa componentes com tokens | ⚠️ `components/mapa/MapaPonto.native.tsx:63-66` tem altura/raio literais | ✅ `components/Carregando.tsx:25-35` usa tokens |
| Objetivo e destaque | ⚠️ `app/(app)/planejar.tsx:35-64` expõe campos, sem orientação inicial | ⚠️ `app/(app)/escolher-ponto.tsx:61-79` compete mapa/GPS/exemplos | ✅ `app/(app)/buscando.tsx:51-65` separa progresso/ação |
| Alvos de toque | ✅ `components/Botao.tsx:76-83` mínimo 48 | ✅ `components/Botao.tsx:76-83` mínimo 48 | ✅ `components/Link.tsx:40-42` mínimo 48 |
| Áreas seguras | ✅ `components/Tela.tsx:35-42` usa SafeAreaView | ✅ `components/Tela.tsx:35-42` usa SafeAreaView | ✅ `components/Tela.tsx:35-42` usa SafeAreaView |
| Pequeno, grande e web | ⚠️ `components/Tela.tsx:23-55` rola e limita largura, sem teste visual | ❌ `components/mapa/MapaPonto.web.tsx:5-6` só mostra erro; nativo tem altura fixa | ⚠️ `components/Tela.tsx:23-55` adapta estrutura, sem teste visual |
| Carregando, vazio, erro | ⚠️ `app/(app)/planejar.tsx:43-63` valida, mas não mostra sem rede/recentes | ⚠️ `app/(app)/escolher-ponto.tsx:19-79` GPS carrega; mapa sem estado de carregamento | ⚠️ `app/(app)/buscando.tsx:51-65` cobre vários, mas 401 redireciona sem retorno |
| Movimento e reduzir movimento | ⚠️ `components/Segmentado.tsx:31-48` muda sem animação/feedback de movimento | ❌ `components/mapa/MapaPonto.native.tsx:25-30` anima câmera sem consulta à preferência | ⚠️ `components/Carregando.tsx:15-29` indicador nativo; sem política explícita |
| Contraste | ⚠️ `theme/tokens.ts:31-71` define temas, falta conferência em aparelho | ⚠️ `components/mapa/MapaPonto.native.tsx:56-58` mira sobre tiles variáveis | ⚠️ `components/Aviso.tsx:24-57` texto e variante, falta conferir temas |
| Lógica e navegação | ⚠️ `app/(app)/planejar.tsx:19-29,37-63` valida; sentido visual pode divergir do contexto | ⚠️ `app/(app)/escolher-ponto.tsx:51-66` confirma; mapa e GPS convergem | ❌ `app/(app)/buscando.tsx:29-63` voltar não invalida resposta pendente |
| Testes iOS/Android/web | ❌ `docs/HANDOFF_mobile.md:55-60` pede teste em celular | ❌ `docs/HANDOFF_mobile.md:55-60` pede teste em celular | ❌ `docs/HANDOFF_mobile.md:44-50` registra só jornada web mock e login web falho |

`[DECISÃO]` O guia pede `critique`, `audit`, `shape`, `typeset`, `layout`, `colorize`, `bolder`/`quieter`, `distill`, `animate`, `delight`, `polish`, `harden`, `clarify`, `adapt` e `onboard`; aqui eles são **lentes de revisão**, não ferramentas executadas (`docs/redesign/00_guia_original.md:53-79,275-292`).

## 3. TL-04 — Planejar

### Objetivo e diagnóstico

`[DECISÃO]` Objetivo: definir sentido, origem, destino e saída e pedir alternativas. O botão **Ver alternativas** é a ação principal; a escolha dos dois pontos é a tarefa que precisa ser ensinada primeiro (`docs/app-map/04_telas/TL-04_planejar.md:3-7,114-125`).

`[HIPÓTESE]` `shape/onboard/clarify`: apresentar dois campos como sequência “1. De onde” e “2. Para onde”, com ajuda curta “Toque para escolher no mapa, usar localização ou um exemplo”; após a primeira escolha, dar foco visual ao destino. O mockup oferece uma folha de opções dentro de Planejar; o código vai direto a TL-05, sem essa explicação (`docs/app-map/07_design/mockups/index.html:290-302`; `app/(app)/planejar.tsx:43-55`). O mockup é proposta visual PL-19, ainda sem aprovação (`docs/app-map/12_pendencias_e_lacunas.md:19`).

`[HIPÓTESE]` `typeset/layout/distill`: separar claramente sentido, pontos, saída e ação, usando os tokens existentes; valor do ponto deve refletir método (GPS, mapa ou exemplo) e o campo, pois hoje qualquer ponto preenchido vira “Ponto escolhido no mapa” (`app/(app)/planejar.tsx:43-55`; `docs/app-map/09_dados_por_tela.md:43-48`). Sem geocodificação externa, não prometer endereço. Se o estado da consulta só guarda `{lat,lon}`, nome/método precisam de metadados locais de apresentação, sem log e sem envio extra (`consulta/tipos.ts:7-15`).

### Função por função

| Capacidade / handler | Atual e problema | Proposta de apresentação/fluxo `[HIPÓTESE]` | Aceite verificável | Esforço; dependência nova?; texto novo? |
|---|---|---|---|---|
| Abrir tela e sentido inicial (`sentidoParam`, `sentidoEscolhido`) | Parâmetro `volta` altera o seletor visual; estado real pode continuar `ida` (`app/(app)/planejar.tsx:10-17`). | Sincronizar a indicação visual com o contexto antes de habilitar consulta; título/saída coerentes. | Ao vir de “Planejar a volta”, seletor, horário e sentido enviado concordam. | M; não; não. |
| Alternar Ida/Volta (`Segmentado.onChange`, `definirSentido`) | Só troca sentido e limpa erro; não inverte pontos (`app/(app)/planejar.tsx:37-42`). Contraria inversão prevista após ida planejada (`docs/app-map/04_telas/TL-04_planejar.md:133-136`). | Mostrar transição e valores resultantes; aplicar a regra de volta já existente no contexto quando cabível, sem misturar consultas. | Ida planejada → Volta apresenta origem/destino invertidos e saída da volta independente; sem ida, mantém campos vazios. | M; não; texto de apoio talvez. |
| Escolher origem (`CampoPonto.onPress`) | Vai direto ao mapa; nenhuma folha de métodos (`app/(app)/planejar.tsx:43-48`). | Folha com GPS, mapa e exemplos; retornar com origem preenchida e foco visível no destino. | Um toque no campo oferece as 3 formas da D-02; fechar não altera valor. | M; não para folha simples com RN; sim, ajuda curta. |
| Escolher destino (`CampoPonto.onPress`) | Mesmo caminho da origem (`app/(app)/planejar.tsx:50-55`). | Mesmo padrão; título sempre diz “Escolher destino”. | Seleção preenche apenas destino; origem permanece. | M, compartilhado com origem; não; não. |
| Valor dos pontos (`CampoPonto`) | Mostra rótulo genérico “Ponto escolhido no mapa” para GPS e exemplos (`app/(app)/planejar.tsx:45,52`; `components/planejar/CampoPonto.tsx:7-12`). | Guardar rótulo de apresentação só localmente: “Minha localização”, “Ponto escolhido no mapa”, “Exemplo: …”; indicar “Toque para mudar” ao leitor. | Após GPS ou exemplo, cada campo mostra rótulo correto, sem coordenada. | M; não; rótulos já no catálogo. |
| Inverter (`inverter`) | Duas ações `definirOrigem`/`definirDestino` e erro limpo (`app/(app)/planejar.tsx:25-29,49`). | Manter ícone+texto e anúncio do novo par; esclarecer quando um ponto falta. | Dois pontos trocam sem se perder; leitor anuncia os valores novos. | P; não; anúncio novo. |
| Saída (`SeletorHorario`, `horaLocal`, `confirmar`) | Campo de texto para HH:mm; só grava no `onBlur`, inválido é ignorado, data permanece a mesma (`components/planejar/SeletorHorario.tsx:7-29`). O mockup prevê escolha de data e hora (`docs/app-map/04_telas/TL-04_planejar.md:141`). | Exibir dia + hora de modo legível; usar controle nativo apenas se viável no Expo Go e aprovado; no mínimo indicar erro de formato e confirmar explicitamente. | Entrada inválida gera erro visível; hora escolhida persiste; volta mantém horário próprio. | M; controle nativo pode exigir pacote; texto novo para erro. |
| Validar e enviar (`verificar`, `validarConsulta`) | Valida, registra problemas e empilha TL-06; não põe foco no primeiro erro (`app/(app)/planejar.tsx:16-23`; `consulta/validacao.ts:23-47`). | Manter botão disponível para explicar o campo faltante; ao erro, rolar/focar primeiro campo e anunciar; ao sucesso, indicador de envio. | Vazio/igual/saída inválida não chama API; erro ao lado do campo ou aviso com próximo passo. | M; não; erro de saída novo. |
| Fora da área (`foraArea`) | Mostra erro local/servidor, mas checagem municipal padrão aceita tudo (`app/(app)/planejar.tsx:31-32,61-63`; `consulta/validacao.ts:3-9`). | Aviso informativo e retorno ao campo correspondente; não afirmar que bloqueio local funciona até PL-11. | Com função municipal validada, fora não envia; sem ela, erro 422 da API é compreensível. | G para polígono; não necessariamente; texto existente. |
| Configurações (`Cabecalho.acaoDireita`) | Atalho textual abre configurações (`app/(app)/planejar.tsx:35`). | Manter, com posição secundária e rótulo acessível. | Abre TL-12 e voltar preserva consulta. | P; não; não. |
| Recentes/locais salvos | Previsto na especificação, ausente em TL-04 (`docs/app-map/04_telas/TL-04_planejar.md:123-124`; `app/(app)/planejar.tsx:34-65`). Armazenamento segue aberto na D-24 (`docs/app-map/01_decisoes.md:31`). | Mostrar só quando houver solução local e dados; estado vazio honesto se entrar. | Nenhum histórico é prometido sem armazenamento local aprovado; se ativo, fica só no aparelho. | G; possivelmente armazenamento já instalado; texto existente. |

### Estados, movimento e plataformas

`[DECISÃO]` Existem estado inicial, campo faltante, pontos iguais e erro “fora da área” (`app/(app)/planejar.tsx:43-63`). `[HIPÓTESE]` Faltam estado de escolha de método, “obtendo localização” no contexto da origem/destino, erro de hora, sem rede e recentes vazio. Sem rede, manter escolha local disponível e só impedir envio se a detecção for confiável; PL-12 continua aberta (`docs/app-map/04_telas/TL-04_planejar.md:104-112,146-156`; `docs/app-map/12_pendencias_e_lacunas.md:17`).

`[HIPÓTESE]` `animate/delight/quieter`: feedback discreto de foco/valor confirmado com `Animated` (somente `opacity`/`transform`); sem animação de altura/cor. `LayoutAnimation` não é necessária para as propostas; respeitar “reduzir movimento” e mostrar mudança instantânea. `harden/adapt`: texto 200%, teclado aberto e rodapé rolável em iPhone pequeno; seletor com padrão iOS no iPhone e Material 3 no Android, mantendo a mesma regra; web só valida a estrutura, não substitui teste móvel (`docs/redesign/00_guia_original.md:53-57,241-251`; `docs/app-map/07_design/acessibilidade.md:11-25`).

## 4. TL-05 — Escolher ponto

### Objetivo e diagnóstico

`[DECISÃO]` Objetivo: selecionar o ponto para **o campo indicado**, sem busca externa (`docs/app-map/04_telas/TL-05_escolher_ponto.md:3-7`). `[HIPÓTESE]` Elemento principal: mapa + marcador/mira + ação **Usar este ponto**; métodos GPS e exemplo funcionam melhor na folha de TL-04, reduzindo concorrência aqui. O mockup mostra mapa alto, mira, instrução e confirmação (`docs/app-map/07_design/mockups/index.html:303`). O código mantém mapa de 320 dp, botão “Confirmar”, GPS e exemplos abaixo, todos na mesma tela (`app/(app)/escolher-ponto.tsx:61-79`; `components/mapa/MapaPonto.native.tsx:63-66`).

`[DECISÃO]` A melhoria recente do worker está no código atual: `Marker` para ponto existente/selecionado, `animateToRegion` ao GPS/exemplo, nomes de atalhos “Exemplo: origem/destino” (`components/mapa/MapaPonto.native.tsx:25-30,54-58`; `textos/hipotesesPonto.ts:1-5`). `[HIPÓTESE]` Rótulos “origem/destino” distinguem função, mas ainda não identificam local; coordenadas são fictícias, não endereços (`components/mapa/pontosExemplo.ts:3-7`).

### Função por função

| Capacidade / handler | Atual e problema | Proposta de apresentação/fluxo `[HIPÓTESE]` | Aceite verificável | Esforço; dependência nova?; texto novo? |
|---|---|---|---|---|
| Parâmetro `campo`, título, ponto existente | Origem é padrão se parâmetro inválido, mas confirmação bloqueia (`app/(app)/escolher-ponto.tsx:17-25,51-64`). | Se parâmetro inválido, voltar com aviso neutro; ao editar, marcador/câmera mostram ponto atual. | Nunca salva no campo errado; “Escolher origem/destino” corresponde à ação. | P; não; aviso novo. |
| Tocar no mapa (`tocar` → `escolher`) | Toque lê coordenada e põe marcador; `escolher` limpa erro e atualiza estado (`components/mapa/MapaPonto.native.tsx:31-34`; `app/(app)/escolher-ponto.tsx:27-31`). | Mostrar “Ponto marcado” e habilitar ação; diferenciar visualmente mira fixa e marcador. | Um toque cria marcador no local tocado; botão só habilita com ponto escolhido. | P; não; texto novo. |
| Arrastar/zoom (`onPanDrag`, `mover`) | Após pan, seleciona centro da região; `arrastou` evita atualização em todo movimento (`components/mapa/MapaPonto.native.tsx:35-49`). | Instrução deve explicar que arrastar posiciona a mira; deixar claro que zoom sozinho não confirma novo ponto. | Pan seleciona centro e atualiza marcador; zoom isolado preserva seleção. | P; não; texto pode usar catálogo. |
| GPS (`usarLocalizacao`) | Pede permissão, obtém uma posição, seleciona; `foco` aciona câmera animada (`app/(app)/escolher-ponto.tsx:33-49`; `components/mapa/MapaPonto.native.tsx:25-30`). | Estado “Obtendo localização…” perto do mapa; após sucesso, marcador + câmera + rótulo “Minha localização”; nunca GPS contínuo. | Com permissão, mapa enquadra ponto e botão habilita; sem permissão, mapa/exemplos continuam. | P; não; textos existentes. |
| Permissão negada/falha GPS (`catch`) | Mostra mensagem de erro, mas posicionamento e recuperação competem com lista (`app/(app)/escolher-ponto.tsx:37-47,69-78`). | Aviso junto da ação e alternativa explícita “Escolher no mapa”; não pedir permissão em loop. | Negada/falha: campo original intacto, pessoa pode tocar mapa ou exemplo. | P; não; textos existentes. |
| Exemplo (`pontosExemplo`, botões) | Dois atalhos com selo EXEMPLO; escolher também move câmera (`app/(app)/escolher-ponto.tsx:74-79`; `components/mapa/pontosExemplo.ts:3-7`). | Na folha de métodos, listar com nome compreensível e selo; no mapa, manter como opção secundária se folha ainda não existir. | Exemplo selecionado tem selo em TL-05 e rótulo em TL-04; não é confundido com endereço real. | M; não; nomes novos dependem de Lucas. |
| Foco/câmera (`useEffect`, `ultimoFoco`) | Anima para GPS/exemplo; `initialRegion` ainda usa ponto existente ou exemplo, não o usuário automaticamente (`components/mapa/MapaPonto.native.tsx:25-30,42-46`). | Manter início não invasivo; explicar “comece tocando/arrastando” e respeitar reduzir movimento na câmera (salto instantâneo quando ativo). | GPS/exemplo visível após escolha; sem escolha, nenhum marcador falso; reduzir movimento desativa animação. | M; não; ajuda nova. |
| Confirmar (`confirmar`) | Salva ponto ao tocar “Confirmar” e volta, sem folha “Usar este ponto”/nome opcional (`app/(app)/escolher-ponto.tsx:51-56,64`; `docs/app-map/04_telas/TL-05_escolher_ponto.md:35-47`). | Renomear ação para “Usar este ponto”; nomear/salvar só depois da decisão PL-09/FN-13, sem bloquear uso simples. | Confirmar preenche apenas campo pedido; fechar antes de confirmar não muda nada. | P para rótulo; G para salvar; não para rótulo, armazenamento em aberto; não / texto existente. |
| Fechar/cancelar (`Cabecalho.onPress`) | `router.back()` descarta escolha local (`app/(app)/escolher-ponto.tsx:61-66`). | Manter; devolver foco ao campo que abriu. | Fechar preserva valores prévios em Planejar; leitor volta ao campo. | M; não; não. |
| Fora da área (`fora`, `dentroDoMunicipio`) | Bloqueia confirmar se função injetada rejeitar; padrão aceita tudo (`app/(app)/escolher-ponto.tsx:15-25,64,71`). | Mensagem ligada ao marcador e ação desabilitada só quando limite validado existir; sem limite, declarar pendência, manter tratamento de resposta 422. | Fora comprovado bloqueia; sem polígono, não sinaliza “dentro” indevidamente. | G; não necessariamente; texto existente. |
| Mapa não carrega/web | `.web.tsx` só apresenta erro; TL-05 ainda mostra dica para arrastar e botão impossível de usar (`components/mapa/MapaPonto.web.tsx:5-6`; `app/(app)/escolher-ponto.tsx:66-79`). | Estado vazio próprio com ação voltar e alternativa de exemplo/local se disponível; no nativo, detectar falha de carregamento antes de instruir arraste. | Sem mapa, não há instrução impossível; é possível voltar sem perder consulta. | M; não; texto do catálogo mais ação. |

### Estados, movimento e plataformas

`[DECISÃO]` Existem escolha nula, GPS carregando/erro, marcador e seleção de exemplo (`app/(app)/escolher-ponto.tsx:19-79`). `[HIPÓTESE]` Faltam mapa carregando, falha de tiles, seleção explicitamente confirmável, estado fora da área confiável e modo acessível de escolher sem gesto. PL-03/PL-25: o mapa nativo carrega base externa Google/Apple, mas a especificação pede OSM; não inserir atribuição incorreta até Lucas decidir (`docs/app-map/12_pendencias_e_lacunas.md:11,25`; `docs/app-map/04_telas/TL-05_escolher_ponto.md:50-56`).

`[HIPÓTESE]` `animate/polish`: marcador pode entrar com `opacity`/`transform` via `Animated`; `LayoutAnimation` dispensável. A câmera do mapa usa API própria, portanto aplicar a preferência “reduzir movimento” escolhendo movimento instantâneo, sem prometer que ela é `transform/opacity` do RN. A mira deve ter contraste sobre tiles claros e escuros; não depende de SVG (`components/mapa/MapaPonto.native.tsx:25-66`). iPhone: modal, retorno e Apple Maps; Android: voltar do sistema, Google Maps; web: fallback explícito sem mapa, usado só como teste (`docs/app-map/05_navegacao.md:77-80`; `docs/app-map/12_pendencias_e_lacunas.md:25`).

## 5. TL-06 — Buscando e avisos

### Objetivo e diagnóstico

`[DECISÃO]` Objetivo: confirmar que a consulta está em andamento e resolver ausência de transporte, rede, timeout, erro ou sessão expirada; o elemento principal é o **estado atual com próxima ação** (`docs/app-map/04_telas/TL-06_buscando_avisos.md:3-7,77-79`). O mockup usa cabeçalho “Sua ida/volta” + subtítulo horário e conteúdo centrado (`docs/app-map/07_design/mockups/index.html:304-305`); o código comprime sentido+hora no título e empilha indicador, privacidade e cancelar (`app/(app)/buscando.tsx:29-55`).

### Função por função

| Capacidade / handler | Atual e problema | Proposta de apresentação/fluxo `[HIPÓTESE]` | Aceite verificável | Esforço; dependência nova?; texto novo? |
|---|---|---|---|---|
| Início automático (`iniciou`, `useEffect`, `buscar`) | Chama uma vez ao montar; `useRef` impede segunda chamada por render (`app/(app)/buscando.tsx:11-19`). | Mostrar imediatamente “Buscando alternativas…” e resumo antes da resposta; explicar que horários são previstos, sem inventar progresso percentual. | Uma entrada gera uma consulta; sem barra de porcentagem fictícia. | P; não; texto talvez. |
| Resumo (`hora`, `resumo`) | Mostra sentido + hora, sem endereço, mas não dia (`app/(app)/buscando.tsx:30-35`). | Título “Sua ida/volta”, subtítulo “Saída às HH:mm” e dia se necessário; jamais coordenada/endereço. | Resumo corresponde à consulta enviada; leitor anuncia sem dado pessoal. | P; não; texto novo de subtítulo. |
| Privacidade | Texto existente diz uso só no cálculo (`app/(app)/buscando.tsx:53-55`). | Manter discreto, sem promessa mais ampla que US-19; não há comparação parcial. | Texto permanece visível durante busca; falha não exibe resultado antigo. | P; não; não. |
| Sucesso (`useEffect`, `router.replace`) | Troca por TL-07 somente com rotas; evita TL-06 no voltar (`app/(app)/buscando.tsx:21-23`). | Anunciar “Alternativas encontradas” antes da troca se viável sem atraso artificial. | Sucesso com rotas abre TL-07; voltar da TL-07 vai a TL-04 com campos mantidos. | M; não; anúncio novo. |
| Vazio/sem transporte (`semTransporte`) | Mostra aviso de erro + “Mudar o horário” (`app/(app)/buscando.tsx:36-37,58-59`); a especificação é informativa (`docs/app-map/04_telas/TL-06_buscando_avisos.md:29-42`). | `Aviso` informativo, sem vermelho; oferecer ajuste de horário com pontos preservados e foco no horário. | Zero rotas não parece falha técnica nem comparação; ação retorna ao horário. | P/M; não; texto existente. |
| Sem rede (`mensagem`, `SEM_REDE`) | Mensagem “Nada foi enviado” e tentar de novo (`app/(app)/buscando.tsx:37-39,60-64`). | Mostrar causa e ação; manter mesma consulta, evitar afirmar “nada enviado” se queda ocorreu após envio sem confirmação. | Sem rede mostra aviso e retry; nenhuma coordenada em mensagem/log. | P; não; revisão de texto `[HIPÓTESE]`. |
| Tempo esgotado/erro servidor (`mensagem`) | `504` recebe timeout; demais erro genérico (`app/(app)/buscando.tsx:40-46`). | Manter textos simples, ações “Tentar de novo”/“Voltar ao planejamento”; não expor código técnico. | 504 e indisponível têm mensagens distintas e retry idempotente da mesma consulta. | P; não; não. |
| Validação tardia/fora da área (`mensagem`) | Traduz alguns problemas; `SAIDA_INVALIDA` cai no erro genérico (`app/(app)/buscando.tsx:39-45`). | Voltar ao campo problemático em TL-04; aviso cita ação possível. | Saída inválida não aparece como falha do servidor; fora da área não mostra rota. | M; não; texto de saída novo. |
| Sessão expirada (`useEffect`) | Faz `router.replace('/entrar')`, sem caminho explícito de retorno à consulta (`app/(app)/buscando.tsx:25-27`). | Preservar consulta só em memória ao autenticar de novo e orientar retomada, sem reenviar automaticamente. | Após login, volta ao planejamento com dados, se sessão/estado ainda existir; não repete sem escolha. | M/G; não; texto novo. |
| Cancelar/voltar (`voltar`) | `router.replace('/planejar')`, mas não invalida geração da busca; resposta tardia pode atualizar contexto (`app/(app)/buscando.tsx:29,49-55`; `consulta/ConsultaContext.tsx:56-84,87-90`). | Cancelar chama a invalidação já disponível (`limpar` hoje apaga também os campos, então precisa operação específica de cancelamento que preserve consulta), depois retorna. | Cancelar/voltar mantém campos, impede resultado tardio e não reenvia sozinho. | M; não; não. |
| Tentar de novo (`buscar`) | Reenvia ao tocar; botão some após `buscando` (`app/(app)/buscando.tsx:60-64`). | Bloquear toques duplicados, mostrar estado buscando e continuar oferecendo cancelar. | Duplo toque não gera duas consultas simultâneas; mesmos pontos/horário/sentido. | P/M; não; não. |

### Estados, movimento e plataformas

`[DECISÃO]` Código cobre ocioso/buscando, sucesso com/sem rotas e erro; 401 redireciona (`consulta/tipos.ts:24-33`; `app/(app)/buscando.tsx:21-65`). `[HIPÓTESE]` Ocioso deve ser só transição imperceptível, vazio precisa aviso informativo, erro de rede/tempo/servidor precisa próxima ação, sessão expirada precisa retorno. PL-12 e contrato da API PL-18 limitam garantias de offline/erro (`docs/app-map/12_pendencias_e_lacunas.md:17-18`; `docs/app-map/04_telas/TL-06_buscando_avisos.md:77-102`).

`[HIPÓTESE]` `animate/clarify`: indicador nativo existente basta; eventual entrada do aviso usa `opacity` com `Animated`, desativada em “reduzir movimento”. Não animar percentuais inexistentes. `adapt/harden`: manter cancelar alcançável no rodapé em celular pequeno, voz anuncia mudança uma vez, foco no aviso após erro. iPhone usa padrão de navegação HIG, Android oferece voltar do sistema com o mesmo cancelamento; web só testa layout/estado, não o mapa nem a sessão nativa (`components/Carregando.tsx:15-29`; `docs/app-map/07_design/acessibilidade.md:21-39,50-52`).

## 6. Fluxo ponta a ponta

| Passo | Onde a pessoa se perde hoje | Guia proposto `[HIPÓTESE]` e prova |
|---|---|---|
| TL-04 → escolha de origem | O campo parece só um botão que abre mapa, sem explicar métodos (`app/(app)/planejar.tsx:43-48`). | Dica inicial + folha de opções; foco no título da folha; ao fechar, voltar ao campo. Prova: pessoa encontra mapa, GPS e exemplo em um toque. |
| TL-05 → TL-04 | GPS já move câmera e põe marcador, mas “Confirmar” e “Ponto escolhido no mapa” não deixam claro o que voltará (`app/(app)/escolher-ponto.tsx:51-70`). | Mostrar marcador/rótulo e “Usar este ponto”; após retorno, campo de origem nomeado, indicador discreto “Origem definida”. Prova: sem coordenadas, campo certo preenchido. |
| TL-04 → destino → TL-04 | A mesma etiqueta genérica faz os dois campos parecerem iguais (`app/(app)/planejar.tsx:45,52`). | Destino visualmente o próximo passo; nomes por método; inverter com confirmação textual. Prova: origem/destino distintos são distinguíveis antes de enviar. |
| TL-04 → TL-06 | Erro de campo não recebe foco e a busca começa sem explicar duração/resultado possível (`app/(app)/planejar.tsx:19-23`; `app/(app)/buscando.tsx:51-55`). | Foco no primeiro erro; após envio, resumo sentido+saída e “Buscando alternativas…”. Prova: erro impede envio; sucesso exibe progresso sem percentual falso. |
| TL-06 → TL-07 | Sucesso substitui tela; falha dá retry, mas cancelar pode deixar resposta tardia (`app/(app)/buscando.tsx:21-29,60-65`). | Anunciar resultado; cancelar invalida requisição e preserva campos; voltar da TL-07 retorna ao planejamento. Prova: resposta tardia não aparece depois de cancelar. TL-07 fica fora deste plano. |

`[DECISÃO]` Esse encadeamento respeita a pilha especificada: TL-04 → TL-05 como modal; TL-04 → TL-06; sucesso substitui TL-06 por TL-07 (`docs/app-map/05_navegacao.md:77-84`).

## 7. Conflitos e riscos

1. `[DECISÃO]` D-02/US-19 AC3 proíbem busca de endereço externa e envio da consulta a serviço de mapas. Uma busca local embarcada seria outra decisão de produto, não parte automática do redesign (`docs/app-map/01_decisoes.md:9`; `docs/10_backlog_produto.md`, US-19 AC3).
2. `[EM ABERTO]` PL-03/PL-25: tiles externos podem revelar região visualizada; atribuição OSM prevista não corresponde automaticamente ao Google/Apple do Expo Go. Escolher provedor e aviso antes de mexer em créditos (`docs/app-map/12_pendencias_e_lacunas.md:11,25`).
3. `[EM ABERTO]` PL-09/PL-11: sem geocodificação não há endereço; sem polígono validado não há bloqueio local confiável do município. Não mascarar a lacuna com nome ou limite inventado (`docs/app-map/12_pendencias_e_lacunas.md:15,17`; `consulta/validacao.ts:3-9`).
4. `[EM ABERTO]` D-24/FN-13: recentes e locais salvos devem ficar no aparelho, mas armazenamento definitivo não foi decidido após retirada de SQLite. Evitar UI que prometa salvar até decisão (`docs/app-map/01_decisoes.md:31`; `docs/HANDOFF_mobile.md:65-67`).
5. `[HIPÓTESE]` PL-19/D-06: paleta e mockup são referência provisória; ciano só informa dados/confiança, dourado não sinaliza “segurança”. Fonte Atkinson não está carregada e requer `expo-font` ou outra solução futura; manter fonte do sistema nesta fase (`docs/app-map/01_decisoes.md:13,24`; `theme/tokens.ts:31-71`; `src/mobile-app/package.json:5-22`).
6. `[DECISÃO]` `docs/05_regras_linguagem_etica.md:16-46` tem prioridade: dizer “exposição estimada” somente quando houver comparação; não usar rótulo territorial, nota, semáforo ou promessa de proteção. Textos novos passam pelo catálogo `docs/app-map/08_microcopy.md:97-147` e `src/mobile-app/src/textos/`.
7. `[DECISÃO]` US-19 AC2 impede coordenadas, endereços e conta em logs; rótulos/estado de ponto são locais. GPS só sob demanda neste fluxo (`docs/app-map/03_fluxogramas/FL-05_escolher_ponto.md:64-70`).
8. `[HIPÓTESE]` O guia sugere Reanimated/Reacticx, mas os pacotes não constam de `package.json:5-22`; instalar Reanimated, Gesture Handler, SVG, Skia, NativeWind, Unistyles, expo-font ou expo-haptics adicionaria risco antes de 18/11. As propostas prioritárias usam RN e tokens existentes; nunca colar DOM/CSS web em telas nativas (`docs/redesign/00_guia_original.md:17-35,115-124`).

## 8. Perguntas para o Lucas

1. `[EM ABERTO]` **PL-19:** aprova a direção visual do mockup para estas três telas? **Recomendação:** aprovar primeiro hierarquia, tipografia do sistema e espaçamento; adiar fonte customizada.
2. `[EM ABERTO]` **PL-09/FN-13:** o ponto do mapa deve aparecer apenas como “Ponto escolhido no mapa” ou receber nome local opcional? **Recomendação:** manter rótulo genérico no MVP e nomear só quando armazenamento local estiver definido.
3. `[EM ABERTO]` **PL-11:** qual limite municipal validado e fonte devem ser embarcados? **Recomendação:** decidir fonte antes de prometer bloqueio no aparelho; tratar 422 da API enquanto isso.
4. `[EM ABERTO]` **PL-25/PL-03:** manter base Google/Apple no Expo Go ou usar tiles OSM, e qual aviso/crédito? **Recomendação:** escolher base nativa para o prazo, com atribuição e aviso corretos após validação.
5. `[EM ABERTO]` **PL-12:** quando estiver sem rede, desabilitar “Ver alternativas” preventivamente ou permitir envio e tratar erro? **Recomendação:** permitir e explicar falha, pois detecção de conectividade pode falhar.
6. `[EM ABERTO]` **D-02:** a falta de busca de endereço local atrapalha a escolha? **Recomendação:** avaliar depois uma lista embarcada e limitada de pontos públicos, sem serviço externo nem autocomplete remoto; não incluir antes da entrega.
7. `[HIPÓTESE]` Aprova a folha de métodos em TL-04 e a TL-05 concentrada no mapa? **Recomendação:** sim; ela reduz a dúvida “como escolher” sem criar outra tela.

## 9. Ordem de implementação

| Ordem | Entrega proposta `[HIPÓTESE]` | Esforço | Até a noite de 18/11? | Dependência nova |
|---|---|---|---|---|
| 1 | Corrigir cancelamento real da busca e coerência do sentido ida/volta; preservar campos | M + M | **Sim, prioridade máxima** | Não |
| 2 | Orientar campos de origem/destino, rótulos por método e folha simples de escolha | M + M | **Sim**, se houver revisão de Lucas | Não |
| 3 | TL-05: “Usar este ponto”, estado sem mapa/web, GPS/erro perto da ação, reduzir movimento na câmera | P + M | **Sim** | Não |
| 4 | TL-06: vazio informativo, foco/retorno ao horário, avisos e anúncios de estado | M | **Sim** | Não |
| 5 | Ajustar erro de hora, foco do primeiro campo, texto 200% e checagem iPhone/Android no Expo Go | M + M | **Sim**, reservar aparelho e tempo de correção | Não; seletor nativo opcional pode exigir pacote |
| 6 | Polígono municipal, locais salvos/recentes, nome próprio, mudança de tiles/fonte | G + G | **Não prometer até 18/11**: dependem de PL-11, FN-13, PL-25, PL-19 | A decidir |

`[HIPÓTESE]` O pacote prioritário soma **8 itens P/M** na tabela; a capacidade disponível da equipe até 18/11 é `[EM ABERTO]`. Portanto, o conjunto completo não está garantido: combinar escopo e validação rápida no aparelho. Como o prazo é rígido (entrega 19/11, 23h55), se faltar tempo, executar 1, 3 e 4 antes de 2 e 5. O plano é análise; nenhum teste foi rodado nesta tarefa (`docs/01_gs_briefing.md`; `docs/HANDOFF_mobile.md:55-60`).

STATUS: DONE_WITH_CONCERNS

SUMMARY: Cinco oportunidades: orientar escolha dos pontos; mostrar rótulo real do método; tornar confirmação e mapa acessíveis; cancelar consulta pendente de verdade; diferenciar busca, vazio e erro. Perguntas urgentes: aprovar folha/visual PL-19, resolver limite municipal PL-11 e mapa/atribuição PL-25; nomeação/armazenamento FN-13 pode esperar.
