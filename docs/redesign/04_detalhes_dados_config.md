# Plano de redesign — detalhes, explicação, dados e configurações (TL-08 a TL-12)

## Resumo em 5 linhas

1. `[DECISÃO]` O passo a passo é só de leitura; a pessoa precisa enxergar onde anda, onde embarca e onde desce (`docs/app-map/04_telas/TL-08_detalhes_rota.md:3-4`).
2. `[DECISÃO]` “Por que esta rota?” explica o trecho a pé, mas N, L, D e cobertura pertencem à alternativa inteira (`docs/app-map/01_decisoes.md:15`).
3. `[DECISÃO]` “Sobre os dados” separa cobertura e limitações da exposição estimada; a linha de entrada deve ficar visível junto da comparação (`docs/05_regras_linguagem_etica.md:18-23`; `docs/app-map/01_decisoes.md:16`).
4. `[DECISÃO]` Totais por categoria ficam em “Dados considerados”; panorama municipal exige ação deliberada e não descreve rua ou rota (`docs/app-map/04_telas/TL-11_dados_considerados.md:115-120`).
5. `[EM ABERTO]` O visual PL-19 aguarda aprovação; histórico e locais salvos não entram na TL-12 agora, e exclusão de conta saiu do MVP (`docs/app-map/12_pendencias_e_lacunas.md:19`; `docs/app-map/01_decisoes.md:31-32`).

**Leitura deste plano.** P/M/G são estimativas relativas de trabalho de apresentação e fluxo: P = ajuste localizado, M = um componente ou estado, G = integração entre tela, navegação e mapa. “Nova dependência?” refere-se a pacote: **não** em todos os itens priorizados. Toda frase sugerida que ainda não está no catálogo de textos é `[HIPÓTESE]` e requer aprovação do Lucas. Este é um diagnóstico de código e documentação, sem execução do app. O guia foi lido como processo e vocabulário, sem executar skills (`docs/redesign/00_guia_original.md:34-84`, `:249-274`).

## Rubrica do guia (seção 8)

Legenda: ✅ evidência no código; ⚠️ parcial/sem verificação visual; ❌ ausente. A evidência é uma linha de código ou especificação por item, não resultado de teste. Base: `docs/redesign/00_guia_original.md:396-408`.

| Item do guia | TL-08 | TL-09 | TL-10 | TL-11 | TL-12 | Evidência (`arquivo:linha`) |
|---|:---:|:---:|:---:|:---:|:---:|---|
| Tema central | ✅ | ✅ | ✅ | ✅ | ✅ | `src/mobile-app/src/theme/tokens.ts:31-78` |
| Objetivo e principal visível | ⚠️ | ⚠️ | ✅ | ⚠️ | ✅ | `src/mobile-app/src/app/(app)/resultado/[rotaId].tsx:51-67` |
| Toque adequado | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | `src/mobile-app/src/components/resultado/resultado.tsx:139-164` |
| Áreas seguras | ✅ | ✅ | ✅ | ✅ | ✅ | `src/mobile-app/src/components/Tela.tsx:35-42` |
| Pequeno, grande e web | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | `src/mobile-app/src/components/Tela.tsx:46-56` |
| Carregando, vazio e erro | ❌ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | `src/mobile-app/src/app/(app)/dados-considerados.tsx:62-102` |
| Movimento e reduzir movimento | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | `docs/app-map/07_design/tokens.md:167-173` |
| Contraste, inclusive modo escuro | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | `src/mobile-app/src/theme/useTema.ts:9-12` |
| Lógica e navegação preservadas | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | `src/mobile-app/src/app/(app)/_layout.tsx:35-44` |
| Testado iOS, Android e web | ❌ | ❌ | ❌ | ❌ | ❌ | `docs/HANDOFF_mobile.md:44-60` |

O ✅ de área segura indica uso do `SafeAreaView`, não validação em aparelhos. A fonte Atkinson desenhada no mapeamento ainda não foi carregada: usar a fonte do sistema até haver decisão e instalação de `expo-font` (`docs/app-map/07_design/acessibilidade.md:15`; `src/mobile-app/src/theme/tokens.ts:63-72`). A paleta provisória é dourado `#FFC53D`, marinho `#0D1B2A`, off-white `#F8F9FA` e ciano apenas para informação de dados; nada de cor como nota de exposição (`src/mobile-app/src/theme/tokens.ts:31-60`; `docs/app-map/07_design/componentes.md:70-76`).

## TL-08 — Detalhes da rota

### Objetivo, principal e diagnóstico

`[DECISÃO]` O elemento principal é a **lista ordenada de trechos** com embarque e desembarque, mais o mapa como apoio. O mockup propõe nós conectados, uma faixa de mapa e botão em cada trecho a pé (`docs/app-map/07_design/mockups/index.html:325-331`). O código já ordena por `ordem` e apresenta resumo, selos e lista, mas o mapa desenha a rota inteira e não recebe o trecho selecionado (`src/mobile-app/src/app/(app)/resultado/[rotaId].tsx:43-62`; `src/mobile-app/src/components/mapa/MapaResultado.native.tsx:21-43`). A tela é uma rota de pilha, embora o desenho a descreva como container expandido/recolhido; a volta da pilha precisa parecer recolhimento (`docs/app-map/05_navegacao.md:80-83`).

### Função por função (código e interação)

| Função/componente | Atual → problema | Proposta de apresentação/fluxo | Aceite verificável | Esforço; pacote; texto |
|---|---|---|---|---|
| `DetalhesRota`, parâmetro, `Redirect` | Busca `rotaId`; sem resposta ou rota redireciona para planejar, sem explicar (`resultado/[rotaId].tsx:37-41`). | Mostrar estado de perda da consulta antes de voltar; para ID inválido, aviso e ação de retorno à comparação se ela existir. | Abrir URL sem memória não exibe tela vazia nem dado antigo; com rota inválida e resposta existente há caminho claro. | M; não; `[HIPÓTESE]` aviso. |
| `Stack.Screen`, voltar | Título é “Sua ida/volta”; pilha usa título “Detalhes da rota” (`resultado/[rotaId].tsx:52`; `_layout.tsx:37`). | Usar título específico e botão de voltar com destino percebido “Alternativas”; iOS usa retorno na barra, Android botão físico. | O retorno leva à TL-07 e mantém a rota selecionada. | P; não; `[HIPÓTESE]` rótulo. |
| `MapaResultado` e toque no trecho | Mapa em 96 dp mostra a geometria inteira; `onSelecionar` vazio; `ListaTrechos` não recebe seleção (`resultado/[rotaId].tsx:53,57-62`; `MapaResultado.native.tsx:31-43`). | Ao tocar no item, marcar “Trecho N selecionado” e realçar apenas sua geometria no mapa, mantendo a rota inteira em segundo plano; texto da lista continua suficiente sem mapa. | Cada item alterna seleção, mapa mostra o mesmo trecho e leitor anuncia o estado; sem geometria, lista segue útil. | G; não, usa `Polyline` já presente; `[HIPÓTESE]` rótulo de seleção. |
| `SeloExemplo`, `RotuloFoco`, resumo | Selo aparece quando `resposta.exemplo`; foco e duração/caminhada/trocas aparecem em sequência (`resultado/[rotaId].tsx:54-56`). | Agrupar em cabeçalho de rota: foco, selo e resumo em ordem de leitura; manter o selo perto de todo bloco de números exemplificativos. | Com fixture, “EXEMPLO” é percebido antes de horários e números; com dado real, some. | P; não; não. |
| `ListaTrechos`, `ItemTrecho` | Ordem correta; nó mostra só primeira letra do modo e o resumo acessível usa “1/4”; bloco inteiro é `accessible` com botão irmão (`resultado.tsx:147-171`). | Numerar “Trecho 1 de 4” em texto, ícone decorativo; separar item selecionável do botão “Por que…” na ordem de foco. | Todos os trechos mantêm ordem da API, modo por extenso, leitura sem letra isolada e botão só após o trecho a pé. | M; não; `[HIPÓTESE]` “Trecho N de M”. |
| `SeloLinha`, embarque/desembarque | Linha é exibida; embarque junta horário previsto e nome da parada; desembarque fica sem rótulo (`resultado/[rotaId].tsx:30-34`; `resultado.tsx:158-162`). | Duas linhas com rótulos “Embarque” e “Desembarque”; horário sempre “previsto”; quando nome vier `null`, omitir o nome sem inventar parada. | Veículo com nomes mostra ambos; com parada `null` não há “null”, e hora continua prevista. | P; não; `[HIPÓTESE]` rótulo “Desembarque”. |
| `BotaoPorQue` | Criado para todos os itens, mas componente devolve `null` para veículo; `accessibilityHint` leva o contexto, rótulo é genérico (`resultado/[rotaId].tsx:58-62`; `resultado.tsx:139-145`). | Criar apenas em trecho `A_PE` e dar rótulo acessível completo “Por que esta rota? Trecho N, a pé”; manter alvo ≥48 dp. | Nenhum veículo tem botão; cada botão a pé anuncia o trecho certo. | P; não; não. |
| Rota sem caminhada | `kmAPe === 0` remove botões e mostra nota (`resultado/[rotaId].tsx:44,63`). | Manter nota junto da lista e linha de dados; sem parecer recomendação. | L=0: zero botões, nota presente e “Sobre os dados” acessível. | P; não; não. |
| Horários e `LinhaSobreOsDados` | Nota “Horários previstos” e linha de dados rolam com a tela (`resultado/[rotaId].tsx:64-65`; `Tela.tsx:23-30`). | Fixar a linha de dados no rodapé do painel, como D-09; a nota de horário fica perto dos trechos de veículo. | Em lista longa, linha de dados continua visível e não cobre último item nem barra do sistema. | M; não; não. |
| `Dados considerados` e `Planejar a volta` | Acesso direto extra aos dados e ação de inverter pontos (`resultado/[rotaId].tsx:66-67`). | Manter Dados considerados como atalho secundário se Lucas quiser; “Planejar a volta” separado das explicações e com destino evidente. | Atalho leva à TL-11 da rota atual; planejar volta inverte pontos e abre TL-04. | P; não; `[HIPÓTESE]` descrição do atalho. |
| Compartilhar | Mockup contém botão; código não o mostra (`mockups/index.html:331`; `resultado/[rotaId].tsx:65-68`). | Apenas após TL-14 existir e ser aprovada; não mostrar ação sem destino. | Se TL-14 ausente, nenhum botão; se entrar, abre sua confirmação. | G fora do corte; exige a funcionalidade TL-14, pacote a avaliar nela; não. |

### Estados, movimento e plataformas

`[DECISÃO]` Existem rota válida, sem trecho a pé e `Redirect` sem memória. `[HIPÓTESE]` Faltam estado de mapa sem geometria, lista de trechos vazia, erro de leitura da resposta e aviso de resposta perdida; o carregamento pertence à consulta anterior, mas um retorno à TL-08 sem resposta precisa de explicação. `null` em parada é omissão, nunca nome fictício; `null` em contagem não aparece nesta tela (`TL-08_detalhes_rota.md:51-55`; `resultado/[rotaId].tsx:30-41`). Para seleção de trecho, uma mudança discreta de **opacity** no traço e **transform** no marcador é suficiente com `Animated` nativo; sem seleção animada também funciona. `LayoutAnimation` pode animar a expansão da lista, mas anima layout e não atende à regra “só transform e opacity”; dispensar. Com reduzir movimento, troca instantânea (`docs/redesign/00_guia_original.md:257-263`). No iPhone, manter retorno de pilha e área segura; no Android, botão físico faz o mesmo; na web, o fallback atual só mostra erro de mapa, então a lista precisa explicar tudo sozinha (`MapaResultado.web.tsx:5-7`; `docs/app-map/07_design/acessibilidade.md:14`).

## TL-09 — Por que esta rota?

### Objetivo, principal e diagnóstico

`[DECISÃO]` O principal é a **resposta curta para o caso da comparação**, seguida de números rotulados “Nesta rota”. O mockup ordena trecho → motivo de contar → faixa → indicativo → números → limitação → links (`mockups/index.html:319-336`). O código já mapeia casos e motivos, mas coloca os focos antes do indicativo e usa texto e tabela sem separação visual forte entre “resultado” e “qualidade dos dados” (`por-que/[rotaId]/[trechoId].tsx:55-71`).

### Função por função

| Função/componente | Atual → problema | Proposta de apresentação/fluxo | Aceite verificável | Esforço; pacote; texto |
|---|---|---|---|---|
| `PorQueEstaRota`, parâmetros, guarda | Aceita somente trecho a pé; sem resposta/ID válido redireciona a planejar (`por-que/[rotaId]/[trechoId].tsx:36-41`). | Preservar guarda; se a consulta ainda existe, oferecer volta a detalhes em vez de perder contexto. | URL de veículo não exibe números; URL inválida explica destino. | M; não; `[HIPÓTESE]` aviso. |
| Modal e fechar | `presentation: modal` e título na pilha (`_layout.tsx:38-41`; `por-que/[rotaId]/[trechoId].tsx:55-57`). | Cabeçalho nativo adaptativo: fechar explícito no iPhone, retorno físico no Android; foco inicial no título e de volta ao botão que abriu. | Fechar e voltar retornam ao trecho da TL-08. | M; não; não. |
| Identificação do trecho, foco, `SeloExemplo` | Cabeçalho mostra trecho, todos os focos e selo (`por-que/[rotaId]/[trechoId].tsx:57-59`). | Manter trecho em destaque; foco da rota como contexto menor; selo encostado nos números de exemplo. | O leitor ouve primeiro “Trecho N, a pé”; valores de fixture são identificados como exemplo. | P; não; não. |
| Explicação de entrada e faixa | `conta` fixa e faixa exibida se vier; falta texto quando faixa é `null` (`por-que/[rotaId]/[trechoId].tsx:45,60-61`). | Usar duas frases curtas; se faixa ausente, “Faixa do dia: dados insuficientes” sem inferir horário. | `NOITE` mostra faixa da API; `null` nunca vira “noite” ou some sem explicação. | P; não; `[HIPÓTESE]` texto de faixa ausente. |
| `indicativo()` / `Indicativo` | Cobre conclusivo, insuficiente, não aplicável, indisponível; `MISTOS` cai em sem diferença (`por-que/[rotaId]/[trechoId].tsx:18-33`; `resultado.tsx:105-110`). | Caixa neutra, título curto do estado e frase do catálogo; sem semáforo, ícone de alerta, limiar ou jargão. | Fixtures de todos os casos produzem a frase correta; mistos = sem diferença. | M; não; `[HIPÓTESE]` título curto do estado. |
| Link da rota com foco | `vencedor` usa `router.replace` direto para detalhes, perdendo o modal de retorno (`por-que/[rotaId]/[trechoId].tsx:43-44,63`). | Descrever destino e oferecer volta à lista antes de abrir a outra rota; preservar caminho de retorno. | A pessoa consegue voltar à comparação depois de ver a outra rota. | M; não; `[HIPÓTESE]` rótulo do destino. |
| `linhas` / `TabelaNumeros` | N pode aparecer como número; N é omitido nos dois casos insuficientes; D `null` aparece como “dados insuficientes”, exceto L=0 “não aplicável” (`por-que/[rotaId]/[trechoId].tsx:47-53`; `resultado.tsx:112-121`). | Separar N/L/D (“comparação da rota”) de cobertura (“qualidade dos dados”); manter `null` como dados insuficientes e D não aplicável só com L=0. | Nenhum número é anunciado por trecho; `null` nunca é 0; tabela é lida “rótulo: valor”. | M; não; `[HIPÓTESE]` intertítulos. |
| Sem ordenação e limitação | Frase de não ordenar só em insuficiente; alerta de subnotificação sempre visível (`por-que/[rotaId]/[trechoId].tsx:68-69`). | Manter imediatamente após indicativo ou tabela; não sugerir preferência por N=0. | Zero ou poucos registros sempre têm ressalva. | P; não; não. |
| Links Sobre/Dados considerados | Dois links funcionais no fim (`por-que/[rotaId]/[trechoId].tsx:70-71`). | Ordenar “Sobre os dados” antes de “Dados considerados”; usar 48 dp, ciano só como orientação para dados; preservar rota selecionada no segundo. | Ambos retornam à origem ao voltar; TL-11 abre na rota atual. | P; não; não. |

### Estados, movimento e plataformas

`[DECISÃO]` O código contempla casos da API; a especificação distingue conclusivo com/sem foco, insuficiente por motivo, não aplicável, indisponível e uma rota (`TL-09_por_que_esta_rota.md:59-128`). `[HIPÓTESE]` Faltam resposta perdida e faixa `null` explicadas. Não há carregamento próprio se a resposta estiver em memória; abrir sem memória deve mostrar aviso/retorno antes de redirecionar. Para modal, um fade de **opacity** ou deslocamento por **transform** de 150–250 ms cabe em `Animated`; a transição nativa do Expo Router pode bastar. Desligar movimento com preferência do sistema. `LayoutAnimation` é desnecessária. No iPhone, modal com fechar visível; no Android, voltar físico fecha; na web, fechar explícito e Escape quando a navegação permitir, com largura limitada por `Tela` (`_layout.tsx:38-41`; `Tela.tsx:50-56`).

## TL-10 — Sobre os dados

### Objetivo, principal e diagnóstico

`[DECISÃO]` O elemento principal é **fonte/período e cobertura de cada opção**, em bloco separado do indicativo de exposição. O mockup mostra as seções em ordem e limitações em lista (`mockups/index.html:359-364`). A tela atual contém fonte, datas, cobertura, situação, cinco limites e créditos; a cobertura usa apenas rótulos de foco, que podem se repetir ou acumular, e a situação conclusiva devolve só o nome do foco (`sobre-os-dados.tsx:25-47,54-78`).

### Função por função

| Função/componente | Atual → problema | Proposta de apresentação/fluxo | Aceite verificável | Esforço; pacote; texto |
|---|---|---|---|---|
| Guarda `Redirect` | Sem resposta volta a planejar (`sobre-os-dados.tsx:50-52`). | Estado de consulta perdida com ação; manter limitações/créditos fixos quando só o bloco dinâmico estiver indisponível, conforme FL-09. | Abrir após reabrir app não mostra cobertura fictícia. | M; não; `[HIPÓTESE]` aviso. |
| `periodo()` e `data()` | Formata período e datas recebidas; datas ausentes podem gerar texto quebrado (`sobre-os-dados.tsx:15-23,54-62`). | Mostrar apenas valores da resposta; data ausente = “dados insuficientes” no campo, sem inventar atualização. | Fixture com campo ausente não exibe `undefined/undefined`. | P; não; `[HIPÓTESE]` rótulo de ausência. |
| `SeloExemplo`, fonte e GTFS | Selo global e fonte/datas em texto (`sobre-os-dados.tsx:58-62`). | Agrupar origem dos boletins e horários programados; selo ao lado das datas de fixture. | SSP-SP e SPTrans legíveis separadamente, período e atualização visíveis. | P; não; não. |
| `cobertura()` e `LinhaLista` | `null` já vira insuficiente; cada linha usa só o(s) foco(s) como identificação (`sobre-os-dados.tsx:44-47,63-67`). | Identificar “Opção 1/2/3” + foco(s), preservando a ordem da API; explicar que o percentual mede disponibilidade de local/horário, sem nota de confiança. | Rotas de foco duplicado continuam distinguíveis; cobertura `null` não é 0%. | M; não; `[HIPÓTESE]` “Opção N”. |
| `situacao()` | Mapeia casos, mas conclusivo pode dizer apenas “Menor exposição estimada entre as alternativas avaliadas” (`sobre-os-dados.tsx:25-41,68-69`). | Reusar indicativo contextual da TL-09 e nomear a rota com foco; sem conclusão, nenhum destaque. | Em conclusivo identifica a opção; em mistos, insuficiente, L=0 e uma rota informa o caso. | M; não; `[HIPÓTESE]` ligação com opção. |
| Limitações | As cinco frases existem como `Texto` soltos (`sobre-os-dados.tsx:70-75`). | Lista com marcadores e espaçamento por token, sem esconder a ressalva de zero registro. | Cinco limitações presentes, com leitura uma a uma em 200% de fonte. | P; não; não. |
| Link e créditos | Link para TL-11; crédito fixo a OSM (`sobre-os-dados.tsx:76-78`; `textos/sobre.ts:20`). | Link legível antes dos créditos; corrigir a atribuição do mapa base **após PL-25**, sem afirmar OSM se Google/Apple for o provedor. | Crédito combina com provedor decidido; SSP-SP e SPTrans permanecem. | M; não; `[EM ABERTO]` PL-25. |

### Estados, movimento e plataformas

`[DECISÃO]` A situação cobre conclusivo, sem diferença, insuficiente, não aplicável, uma rota e indisponível (`TL-10_sobre_os_dados.md:62-70`). `[HIPÓTESE]` Faltam estado com bloco dinâmico ausente, data `null`, rotas vazias e retorno de consulta perdida. Sem rede, a resposta em memória deve abrir igual; a tela não precisa spinner próprio (`FL-09_sobre_os_dados.md:46-48`). É uma página de leitura: sem animação automática; se houver navegação, transição nativa basta. `Animated` e `LayoutAnimation` não são necessários. iPhone/Android usam pilha e retorno nativo/físico; web precisa texto sem depender de mapa. Em todas, seções marcadas como cabeçalho e percentuais lidos por extenso (`TL-10_sobre_os_dados.md:99-101`).

## TL-11 — Dados considerados

### Objetivo, principal e diagnóstico

`[DECISÃO]` O principal são **Furto, Roubo e Ocorrências de trânsito por opção**, com as parcelas de Furto/Roubo e aviso do que entra na comparação. Panorama municipal fica recolhido por padrão (`TL-11_dados_considerados.md:82-96`). O mockup mostra seleção de rota, contexto, parcelas e panorama separado (`mockups/index.html:365-372`). O código implementa seleção, expansão e panorama; entretanto `faixa()` pega só o primeiro trecho a pé e pode sugerir que a rota inteira usa uma faixa, mesmo que os trechos atravessem faixas (`dados-considerados.tsx:25-34,95`).

### Função por função

| Função/componente | Atual → problema | Proposta de apresentação/fluxo | Aceite verificável | Esforço; pacote; texto |
|---|---|---|---|---|
| Seleção da rota e `Segmentado` | Parâmetro, seleção local, seleção da consulta ou primeira rota; abas mostram só focos (`dados-considerados.tsx:56-67,88-94`; `Segmentado.tsx:21-48`). | Identificar “Opção N” + foco, com abas roláveis ou lista quando 3 rótulos não couberem; não reorganizar rotas. | Três opções em fonte 200% continuam selecionáveis; entrada da TL-09 abre na mesma rota. | M; não; `[HIPÓTESE]` “Opção N”. |
| `periodo()`, `faixa()`, contexto | Período vem da resposta; faixa é apenas do primeiro trecho a pé (`dados-considerados.tsx:16-34,95`). | Mostrar período e área; se houver mais de uma faixa nos trechos a pé, dizer que varia por trecho, sem atribuir uma faixa à alternativa inteira. Se API não trouxer total por faixa, não inventar recorte. | Rota com noite+madrugada não é rotulada só “noite”; dados continuam os mesmos da API. | M; não; `[HIPÓTESE]` texto multifaixa. |
| `Grupo` Furto/Roubo, `LinhaLista` | Expande parcelas; `LinhaLista` não anuncia `expanded` nem “recolhido/expandido” (`dados-considerados.tsx:36-54`; `LinhaLista.tsx:54-63`). | Usar `LinhaCategoria` existente, que recebe estado de expansão, e manter parcela “entra na comparação” em texto. | Leitor anuncia estado; tocar duas vezes alterna; `null` da parcela lê “dados insuficientes”. | M; não; não. |
| Totais e Trânsito | Números por rota; Trânsito aparece como linha simples; `numero(null)` já diz insuficiente (`dados-considerados.tsx:21-23,96-99`). | Cabeçalho “Totais por categoria, nesta opção”; indicar que total de Furto/Roubo não é N e trânsito não é crime intencional. | Totais não são rotulados como “registros considerados”; `null` não vira zero. | P; não; `[HIPÓTESE]` intertítulo. |
| Aviso do recorte | Aviso diz que só “outros” entram, após totais (`dados-considerados.tsx:99`; `textos/dadosConsiderados.ts:17-18`). | Subir aviso antes das categorias, para preparar a leitura; manter texto existente. | Pessoa lê a regra antes dos totais. | P; não; não. |
| Panorama municipal | `panorama` troca o conteúdo na mesma rota, com botão “Voltar”; o botão físico do Android pode sair da TL-11 em vez de fechar panorama (`dados-considerados.tsx:60,73-85`). | Abrir subtela/modal com retorno próprio ou interceptar voltar enquanto panorama aberto; manter ação deliberada e aviso no topo. | Panorama inicia fechado; botão, Android Back e iPhone voltar retornam aos totais sem sair da TL-11. | M; não; não. |
| Quatro naturezas municipais e crédito | Homicídio, tentativa, estupro e estupro de vulnerável são mostrados só no panorama; crédito geral inclui mapa base (`dados-considerados.tsx:78-84`). | Preservar agregação municipal; usar crédito SSP-SP específico; nunca pino, filtro fino, rua ou ligação com a rota. | Fora do panorama não aparece natureza sexual; dentro, aviso municipal precede números. | P; não; não. |
| `SeloExemplo`, vazio e guarda | Selo global; sem resposta redireciona; `rotas=[]` deixa área vazia (`dados-considerados.tsx:62-75,86-102`). | Selo junto ao bloco exemplificativo; explicar ausência de opção e oferecer volta; resposta perdida com ação. | Nenhuma tela branca; fixture não parece dado real. | M; não; `[HIPÓTESE]` estados. |

### Estados, movimento e plataformas

`[DECISÃO]` Existem expansão de Furto/Roubo, panorama e `null` numérico; a especificação também exige grupo indisponível quando a resposta não o contiver (`TL-11_dados_considerados.md:76-84`; `dados-considerados.tsx:21-23`). `[HIPÓTESE]` Faltam erro de bloco de categorias, lista vazia, separação entre “dados insuficientes” e grupo ausente, faixa mista e resposta perdida. Carregamento só se a API vier a buscar essa tela em separado; hoje usa memória. Expandir parcelas pode usar `Animated` com **opacity/transform** de conteúdo; altura automática não deve ser animada. `LayoutAnimation` facilitaria altura, mas viola a regra do guia; a troca instantânea é aceitável. Reduzir movimento zera a transição. iPhone pode usar subtela de pilha para panorama; Android Back precisa primeiro fechar panorama; na web, manter botão “Voltar” explícito. Toques e estado expandido devem ser verbalizados, conforme acessibilidade (`acessibilidade.md:35-39,57`).

## TL-12 — Configurações

### Objetivo, principal e diagnóstico

`[DECISÃO]` O principal do MVP atual é **conta, aviso de privacidade e Sair**. O mockup ainda inclui histórico, locais salvos e excluir conta (`mockups/index.html:373-377`), mas D-24 deixou FN-13 `[EM ABERTO]` e D-25 adiou exclusão; o código acerta ao não mostrar essas ações (`configuracoes.tsx:30-45`; `01_decisoes.md:31-32`). Não prometer armazenamento local antes de escolher a implementação.

### Função por função

| Função/componente | Atual → problema | Proposta de apresentação/fluxo | Aceite verificável | Esforço; pacote; texto |
|---|---|---|---|---|
| `Configuracoes`, `Stack.Screen`, `Tela` | Página rolável com cabeçalho nativo, sem subtítulo (`configuracoes.tsx:30-33`). | Duas seções claras, Conta e Privacidade; `Sair` separado visualmente; todas as medidas por tokens. | Título e seções reconhecíveis em 200% de fonte; botão não fica sob a barra inferior. | P; não; não. |
| E-mail da sessão | Renderiza o e-mail, ou nada sem sessão (`configuracoes.tsx:10,33-34`). | Manter e-mail legível e com quebra; se a sessão expirar, deixar a guarda de sessão navegar ao login, sem exibir e-mail antigo. | E-mail longo não corta; depois de sair não há e-mail visível. | P; não; não. |
| `SeloExemplo` | Usa substring do token (`configuracoes.tsx:35`). | Só mostrar se o modo/conta de exemplo tiver sinal explícito; não inferir por nome de token. | Conta real nunca recebe selo; exemplo sempre recebe. | M; não; não. |
| Aviso de privacidade | `LinhaLista` abre TL-13 (`configuracoes.tsx:36-37`). | Manter acesso visível e usar texto “minuta acadêmica” na TL-13, sem alegação de conformidade legal. | Abre e volta à TL-12, inclusive sem rede se texto fixo. | P; não; não. |
| `sair()` e botão | Tenta saída remota; mesmo com falha, encerra localmente; botão tem spinner e trava toques repetidos (`configuracoes.tsx:11-27,38-44`). | Manter fluxo e anunciar “Saindo…”; ao concluir, substituir pilha para não voltar à área autenticada. | Duplo toque não dispara duas saídas; Android Back após sair não reabre TL-12. | P; não; `[HIPÓTESE]` “Saindo…”. |
| Histórico, trajetos e locais salvos | Textos existem no catálogo, mas componentes não estão na tela (`textos/config.ts:5-17`; `configuracoes.tsx:30-45`). | `[EM ABERTO]` Não acrescentar controles até Lucas decidir FN-13 e armazenamento só no aparelho; depois planejar interruptor, lista vazia e apagar com confirmação. | No MVP atual, nenhum controle promete salvar; se retomado, só após decisão documentada. | G fora do corte; depende da FN-13, possível pacote a definir; `[HIPÓTESE]` após decisão. |
| Excluir conta | Texto permanece no catálogo; não há botão, conforme D-25 (`textos/config.ts:20-28`; `configuracoes.tsx:30-45`). | Continuar oculto até existir endpoint e decisão de reabrir escopo. | Nenhuma opção de exclusão no MVP; nenhuma mensagem diz que apagou dados. | Fora do corte; depende de backend; não. |

### Estados, movimento e plataformas

`[DECISÃO]` Há estado de saída em andamento; a função conclui localmente mesmo se a chamada remota falhar (`configuracoes.tsx:13-27`). `[HIPÓTESE]` Falta anúncio específico de sucesso/falha da saída remota, se isso for relevante para a pessoa; não oferecer retry de exclusão fora do MVP. Vazio de histórico e locais não se aplica enquanto FN-13 está aberta; sessão ausente deve ser tratada pela guarda global. Nenhuma animação própria é necessária; spinner nativo já dá feedback. `Animated`/`LayoutAnimation` não acrescentam clareza. No iPhone e Android, pilha substituída ao sair; Android Back não retorna à conta. Na web, o fluxo de login real tem limitação conhecida, portanto qualquer avaliação visual nessa plataforma precisa usar mock, sem declarar que o login web funciona (`HANDOFF_mobile.md:44-51`).

## Como fazer a pessoa entender o que o app considerou

1. **`clarify` — começar pelo concreto.** `[HIPÓTESE]` Na TL-08, ler “A pé → embarque → veículo → desembarque → a pé” antes de mostrar explicações. “Por que esta rota?” fica só no trecho a pé, com a frase “Só os trechos a pé entram na contagem de registros” já prevista (`TL-08_detalhes_rota.md:23-40`; `textos/porQue.ts:5-8`).
2. **`typeset` — duas perguntas, dois blocos.** `[HIPÓTESE]` Na TL-09, primeiro “O que a comparação indicou?”; depois “Quais números da rota inteira?”; por fim “Quanto dos dados pôde ser usado?” (cobertura). Não usar N/L/D como letras na tela. Não transformar cobertura em selo de “boa/ruim” (`TL-09_por_que_esta_rota.md:158-168`; `acessibilidade.md:17`).
3. **`layout` — ordem de leitura.** `[HIPÓTESE]` TL-08: mapa complementar → resumo da rota → lista → nota dos horários → Sobre os dados. TL-09: trecho → motivo de entrar → faixa → indicativo → números da rota → ressalva → links. TL-10: fonte/período → cobertura → situação → limites → crédito. TL-11: opção → área/fonte/período → aviso de recorte → grupos/parcelas → panorama municipal recolhido (`mockups/index.html:319-336,359-372`).
4. **Exemplo didático, sem valor novo.** `[HIPÓTESE]` Usar uma sequência fictícia “a pé → ônibus → a pé” só como estrutura de leitura, com selo **EXEMPLO**. Se mostrar 4, 0,9, 4,4 ou 91%, são valores do mockup e precisam de selo; em dados reais, mostrar apenas a resposta da API. Não calcular estatística no app (`mockups/index.html:319-323`; `06_funcionalidades.md:160-164`).
5. **Comparação contextual.** `[DECISÃO]` Só mostrar foco de menor exposição estimada se a API concluir; em mistos, “sem diferença clara”; em insuficiente, motivo simples; com L=0, D “não aplicável”. A pessoa escolhe a alternativa (`FL-07_comparacao.md:65-80,105-112`). `[HIPÓTESE]` Um link “Ver esta opção” pode ajudar quando outra rota tem o foco, mas deve manter o retorno à lista.

## Conflitos e riscos a resolver

| Risco | Regra e evidência | Tratamento no redesign |
|---|---|---|
| Nome do produto sugere garantia | `docs/05_regras_linguagem_etica.md:12-18,26-34` | Usar somente “exposição estimada” com comparação e limites; nenhuma nota, semáforo, escudo ou promessa. |
| Cobertura confundida com vantagem | `docs/05_regras_linguagem_etica.md:18-23,40-43`; `componentes.md:70-76` | Bloco de cobertura separado dos números e sem cor de avaliação. |
| Zero e `null` confundidos | `docs/05_regras_linguagem_etica.md:21-23,32`; `09_dados_por_tela.md:17-18` | Ressalva sempre visível; `null` = dados insuficientes, D não aplicável só quando L=0. |
| N/L/D interpretados como dado do trecho | `01_decisoes.md:15`; `TL-09_por_que_esta_rota.md:164-168` | Título “Nesta rota, somando os trechos a pé”; nenhum número por trecho. |
| Faixa única atribuída à rota toda | `TL-09_por_que_esta_rota.md:11-15`; `dados-considerados.tsx:25-34` | Faixa por trecho quando necessária; não inferir a partir do primeiro. |
| Panorama de violência sexual parece descrever caminho | `docs/05_regras_linguagem_etica.md:47`; `TL-11_dados_considerados.md:115-120` | Só após toque deliberado, aviso municipal antes de números, sem mapa ou filtro fino. |
| Atribuição OSM com mapa base Google/Apple | `12_pendencias_e_lacunas.md:25`; `textos/sobre.ts:20` | `[EM ABERTO]` Corrigir crédito e aviso conforme decisão PL-25; não antecipar provedor. |
| Histórico/exclusão aparecendo como promessa | `01_decisoes.md:31-32`; `TL-12_configuracoes.md:4-5` | Não colocar os botões no MVP atual; texto antigo do mockup não é aprovação de implementação. |
| Visual e pacote além do prazo | `12_pendencias_e_lacunas.md:19`; `docs/redesign/00_guia_original.md:34-46,257-274` | Só tokens/componentes existentes; Reacticx exigiria Reanimated/Skia, fora do corte. |
| Afirmação jurídica indevida | `docs/10_backlog_produto.md` RNF-09; `06_funcionalidades.md:192-195` | Aviso como minuta acadêmica, sem afirmar conformidade com LGPD. |

## Perguntas para o Lucas (com recomendação)

1. **PL-19:** Aprova o visual provisório dos mockups para estas cinco telas? **Recomendação:** aprovar primeiro hierarquia/fluxo, com paleta e fonte provisórias, e só depois polir cores (`12_pendencias_e_lacunas.md:19`).
2. **TL-08:** Seleção de trecho deve realçar sua geometria no mapa ainda neste prazo? **Recomendação:** sim se a `geometria` por trecho vier pronta; caso contrário, texto de seleção e lista clara já atendem o passo a passo (`TL-08_detalhes_rota.md:49-53`; `06_funcionalidades.md:130-138`).
3. **TL-09:** O indicativo curto fica apenas em “Por que esta rota?” ou também no resultado principal? **Recomendação:** manter só na TL-09, conforme D-01, até nova decisão (`HANDOFF_mobile.md:65-68`; `01_decisoes.md:34-46`).
4. **TL-11:** Como explicar rotas cujos trechos a pé atravessam duas faixas do dia? **Recomendação:** exibir as faixas dos trechos, sem fingir um único período; confirmar que a API entrega o recorte necessário (`TL-09_por_que_esta_rota.md:13`; `dados-considerados.tsx:25-34`).
5. **PL-25:** Qual é o provedor do mapa base e seu crédito correto? **Recomendação:** decidir antes de alterar a TL-10; o código atual usa o mapa nativo Google/Apple, segundo a pendência (`12_pendencias_e_lacunas.md:25`).
6. **FN-13:** Histórico e locais salvos continuam fora da TL-12 nesta entrega? **Recomendação:** sim, até resolver armazenamento só no aparelho; não prometer o que não existe (`01_decisoes.md:31`; `HANDOFF_mobile.md:65-66`).

## Ordem de implementação e corte de prazo

`[HIPÓTESE]` Estimativa total do plano: **4 P + 9 M** no corte prioritário, mais **1 G** opcional, em blocos de trabalho; isso é tamanho relativo, não horas prometidas. Congelar código na noite de **18/11/2026** e usar 19/11 para entrega (`docs/01_gs_briefing.md:36`; prazo registrado em `docs/HANDOFF_mobile.md:3`). A ordem favorece a explicação da comparação e não depende de novos pacotes.

| Ordem | Entrega verificável | Esforço | Até 18/11? |
|---|---|---:|:---:|
| 1 | TL-09: indicativo por caso, “Nesta rota”, N/L/D/`null`, cobertura separada, links e retorno do modal | 3 M | Sim |
| 2 | TL-08: trechos numerados, embarque/desembarque rotulados, botão acessível só a pé, nota de horários e linha de dados visível | 2 P + 2 M | Sim |
| 3 | TL-10: seções e cobertura identificadas por opção, situação contextual, cinco limitações | 1 P + 1 M | Sim |
| 4 | TL-11: aviso antes dos totais, expansão acessível, faixa mista e Back do panorama | 1 P + 2 M | Sim, se a resposta suportar faixa mista |
| 5 | TL-12: polir conta/aviso/Sair e estados de saída; manter FN-13 e exclusão ausentes | 1 M | Sim |
| 6 | TL-08: destaque de geometria do trecho no mapa, com fallback textual | 1 G | Só se sobrar prazo e houver geometria |
| 7 | Aprovação visual PL-19, crédito PL-25, testes manuais iPhone/Android/web, fonte e animações | dependem de decisão/aparelho; não incluídos na soma | Antes do congelamento apenas no que for possível |

**Verificação mínima após implementação (não executada nesta análise):** checar fixtures de cada caso da TL-09; `null`, L=0 e zero; três opções em fonte 200%; ordem de leitura por VoiceOver/TalkBack; Android Back no panorama; iPhone modal e área segura; fallback web sem mapa; selo EXEMPLO; cinco limitações; retorno de navegação. `docs/app-map/07_design/acessibilidade.md:53-58` ainda marca essas telas sem teste. As sugestões `shape`, `critique`, `audit`, `typeset`, `layout`, `clarify`, `adapt`, `onboard`, `polish` e `harden` nomeiam lentes de revisão do guia, **não** skills executadas aqui (`docs/redesign/00_guia_original.md:53-84,267-274`).

**Registro de escopo:** `AGENTS.md` pede atualizar `TODO.md`, `docs/06_estado_atual.md` e `prompts.md` quando houver mudança de estado. Esta tarefa não toma decisão nem altera estado do produto; o pedido restringe a escrita a este arquivo. O registro do prompt e eventual atualização de TODO devem ser feitos por quem integrar este plano, sem marcar implementação concluída a partir desta análise (`TODO.md:7-14`; `docs/09_fluxo_trabalho_ia.md`).
