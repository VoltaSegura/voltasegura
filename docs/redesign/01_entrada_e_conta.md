# Plano de redesign — entrada e conta (TL-01, TL-02, TL-03, TL-13)

> [HIPÓTESE] Plano de análise, sem alteração do app. Leitura do código e dos documentos em 14/11/2026; nenhuma tela foi executada neste trabalho. `arquivo:linha` abaixo é referência verificável na raiz do monorepo. P = pequeno, M = médio, G = grande; são estimativas relativas, não prazos prometidos. O mockup HTML é referência visual ainda sem aprovação do Lucas (PL-19).

## 1. Resumo em 5 linhas

1. [DECISÃO] A entrada deve deixar claras as ações "Criar conta" e "Entrar"; hoje há apenas título, frase e controles em sequência, sem a cena proposta (`src/mobile-app/src/app/(auth)/index.tsx:10`; `docs/app-map/07_design/mockups/index.html:261`).
2. [HIPÓTESE] Uma hierarquia com marca, frase e uma única ação dourada por vez tornará o primeiro passo mais fácil de reconhecer, sem prometer um resultado para o trajeto (`docs/app-map/07_design/tokens.md:46`).
3. [DECISÃO] Cadastro e login já validam e exibem erros, mas falta levar o foco ao campo com problema e distinguir melhor as respostas do servidor (`src/mobile-app/src/app/(auth)/criar-conta.tsx:23`; `src/mobile-app/src/app/(auth)/entrar.tsx:21`).
4. [EM ABERTO] O aviso declara como atual a exclusão de conta e a guarda local de histórico, enquanto a exclusão foi adiada e o armazenamento local está pendente (`src/mobile-app/src/textos/aviso.ts:11`; `docs/app-map/01_decisoes.md:31`).
5. [HIPÓTESE] O maior ganho até 18/11 é polir a entrada, a leitura dos formulários e o retorno de erros; cena animada, fonte Atkinson e mudanças jurídicas ficam condicionadas a aprovação e viabilidade (`docs/HANDOFF_mobile.md:65`).

## 2. Rubrica do guia, seção 8

Legenda: ✅ evidência no código; ⚠️ parcial, previsto ou sem teste em aparelho; ❌ ausente ou divergente. A tabela avalia a implementação atual, não o mockup. Cada célula traz uma referência; `guia` = `docs/redesign/00_guia_original.md`.

| Item do checklist | TL-01 | TL-02 | TL-03 | TL-13 |
|---|---|---|---|---|
| Tema central, sem valores soltos | ✅ `src/mobile-app/src/components/Tela.tsx:49` | ✅ `src/mobile-app/src/components/CampoTexto.tsx:103` | ✅ `src/mobile-app/src/theme/tokens.ts:63` | ✅ `src/mobile-app/src/components/Aviso.tsx:62` |
| Um objetivo e elemento principal | ⚠️ `src/mobile-app/src/app/(auth)/index.tsx:12` | ✅ `src/mobile-app/src/app/(auth)/criar-conta.tsx:86` | ✅ `src/mobile-app/src/app/(auth)/entrar.tsx:73` | ✅ `src/mobile-app/src/app/aviso-privacidade.tsx:20` |
| Toques grandes | ✅ `src/mobile-app/src/components/Botao.tsx:78` | ⚠️ `src/mobile-app/src/components/Caixa.tsx:63` | ✅ `src/mobile-app/src/components/Link.tsx:41` | ⚠️ `src/mobile-app/src/app/_layout.tsx:55` |
| Áreas seguras | ✅ `src/mobile-app/src/components/Tela.tsx:36` | ✅ `src/mobile-app/src/components/Tela.tsx:36` | ✅ `src/mobile-app/src/components/Tela.tsx:36` | ⚠️ `src/mobile-app/src/app/_layout.tsx:55` |
| Pequeno, grande e web | ⚠️ `src/mobile-app/src/components/Tela.tsx:50` | ⚠️ `src/mobile-app/src/components/Tela.tsx:37` | ⚠️ `src/mobile-app/src/components/Tela.tsx:37` | ⚠️ `src/mobile-app/src/components/Tela.tsx:24` |
| Carregando, vazio e erro | ❌ `src/mobile-app/src/sessao/SessaoContext.tsx:91` | ⚠️ `src/mobile-app/src/app/(auth)/criar-conta.tsx:85` | ⚠️ `src/mobile-app/src/app/(auth)/entrar.tsx:72` | ✅ `docs/app-map/04_telas/TL-13_aviso_privacidade.md:73` |
| Animação com propósito e reduzir movimento | ❌ `src/mobile-app/src/app/(auth)/index.tsx:9` | ⚠️ `src/mobile-app/src/components/Botao.tsx:56` | ⚠️ `src/mobile-app/src/components/Botao.tsx:56` | ✅ `src/mobile-app/src/app/aviso-privacidade.tsx:16` |
| Contraste, inclusive tema escuro | ⚠️ `src/mobile-app/src/theme/tokens.ts:31` | ⚠️ `src/mobile-app/src/theme/tokens.ts:31` | ⚠️ `src/mobile-app/src/theme/tokens.ts:47` | ⚠️ `src/mobile-app/src/theme/tokens.ts:47` |
| Lógica e navegação preservadas | ✅ `src/mobile-app/src/app/(auth)/index.tsx:14` | ⚠️ `src/mobile-app/src/app/(auth)/criar-conta.tsx:35` | ⚠️ `src/mobile-app/src/app/(auth)/entrar.tsx:34` | ⚠️ `src/mobile-app/src/app/aviso-privacidade.tsx:18` |
| Testado em iOS, Android e web | ❌ `docs/HANDOFF_mobile.md:57` | ❌ `docs/HANDOFF_mobile.md:49` | ❌ `docs/HANDOFF_mobile.md:50` | ⚠️ `docs/app-map/07_design/acessibilidade.md:59` |

[EM ABERTO] Os ✅ de implementação não substituem teste manual: contraste calculado nos tokens não garante legibilidade de cada estado, e a checklist de acessibilidade das quatro telas ainda está desmarcada (`docs/app-map/07_design/acessibilidade.md:45`). Para TL-13, "vazio" e "erro de rede" não se aplicam ao texto fixo; a ausência de internet deve manter a página acessível (`docs/app-map/04_telas/TL-13_aviso_privacidade.md:73`).

## 3. TL-01 — Abertura

### Objetivo, diagnóstico e direção

[DECISÃO] Sem sessão, apresentar o VoltaSegura e oferecer criar conta ou entrar; o botão principal é **Criar conta** (`docs/app-map/04_telas/TL-01_abertura.md:3`, `:44`). O aviso é acesso secundário. O código atual exibe título, frase, dois botões e link (`src/mobile-app/src/app/(auth)/index.tsx:10`), mas não tem logo v10, cena da rota acesa nem separação visual entre cena e ações do mockup (`docs/app-map/07_design/mockups/index.html:261`). O mockup usa SVG e `stroke-dashoffset` (`:263`); isso é HTML/CSS, não implementação nativa. O código já usa `Tela` com área segura, rolagem e largura máxima (`src/mobile-app/src/components/Tela.tsx:35`).

### Função por função

| Capacidade / função no código | Atual e problema | Proposta de apresentação ou fluxo | Aceite verificável | Esforço; dependência nova; texto novo |
|---|---|---|---|---|
| `Abertura()` e `useRouter()` (`index.tsx:6`) | Renderiza o mesmo fluxo de conteúdo em toda altura; o título também é passado a `Stack.Screen`, embora o cabeçalho da abertura esteja oculto (`(auth)/_layout.tsx:16`). | `shape`/`layout`/`typeset`: organizar cena, título, frase e ações em blocos, com botão primário como único destaque; manter rolagem em fonte 200%. | Em 320 dp e 200% de fonte, frase e três ações são alcançáveis, sem sobreposição. | M; não; não. |
| "Criar conta" / `router.push('/criar-conta')` (`index.tsx:14`) | Navega; já usa botão ≥48 dp (`Botao.tsx:78`). | Preservar rota, aumentar clareza do espaço antes do segundo botão; manter dourado de ação. | Um toque abre TL-02 e Voltar retorna à TL-01. | P; não; não. |
| "Entrar" / `router.push('/entrar')` (`index.tsx:15`) | Navega em botão secundário. | Manter a hierarquia secundária, largura e alinhamento iguais ao primário. | Um toque abre TL-03; botão não compete visualmente com "Criar conta". | P; não; não. |
| "Aviso de privacidade" / `router.push('/aviso-privacidade')` (`index.tsx:16`) | Abre TL-13; link recebe área ≥48 dp (`Link.tsx:40`). | Centralizar após as ações e garantir foco/retorno ao link ao voltar. | TL-13 abre sem conta e Voltar devolve à TL-01. | P; não; não. |
| Verificação de sessão, feita por `SessaoProvider` e guarda da pilha (`SessaoContext.tsx:48`, `app/_layout.tsx:46`) | Enquanto lê a sessão, o provider retorna `null` (`SessaoContext.tsx:91`); não há o estado "Carregando…" previsto em TL-01:34. | Mostrar `Carregando` já existente, com nome do produto e indicador, até decidir a rota; não acrescentar etapa. | Com sessão válida, TL-04 aparece sem piscar a abertura; sem sessão, aparece TL-01; leitor anuncia carregamento. | M; não; não (`textos.comuns.carregando`). |
| Sessão expirada / conta excluída (`TL-01_abertura.md:70`) | A tela não recebe nem mostra o motivo; `abertura.sessaoExpirada` existe (`textos/abertura.ts:9`). Exclusão saiu do MVP. | Para expiração, aviso textual anunciado quando o fluxo tiver motivo; não simular exclusão. | No caminho de expiração, motivo legível e TL-03 alcançável; nenhum aviso falso de exclusão. | M; não; não. |
| Marca e cena do mockup (`mockups/index.html:261`) | Ausentes. | `bolder`/`quieter`/`delight`: considerar versão **estática** simples feita com `View`/`Text` e tokens, somente se Lucas aprovar; logo v10 como ativo existente apenas após checagem de formato nativo. Animação da rota fica em fase posterior: traçar caminho exige solução nativa de desenho ou `react-native-svg` (nova dependência), e `stroke-dashoffset` não respeita a regra deste plano de animar só `transform`/`opacity`. | Cena decorativa não é lida como instrução; em modo claro/escuro o texto continua legível; sem cena aprovada, a abertura continua completa. | M estática / G animada; estática não, traçado exige `react-native-svg`; não. |

**Estados.** [DECISÃO] Inicial e redirecionamento por sessão existem; verificação visual e mensagem de expiração faltam (`SessaoContext.tsx:91`, `TL-01_abertura.md:64`). "Vazio" e "sem rede" não exigem tela vazia ou erro aqui: a abertura é texto fixo e deve abrir offline. Conta excluída é estado adiado pela D-25 (`docs/app-map/01_decisoes.md:32`). [HIPÓTESE] `animate` pode dar entrada discreta ao bloco de ações com `Animated` do RN, **somente opacity/transform**, uma vez; `AccessibilityInfo.isReduceMotionEnabled` desliga o movimento. Sem dependência nova; `LayoutAnimation` é dispensável e pode mover layout. A cena do HTML não deve ser copiada como SVG/DOM (`guia:15`; `mockups/index.html:167`).

**Plataformas.** [HIPÓTESE] iPhone: respeitar área do notch e gesto de voltar; Android: botão físico retorna da TL-02/03/13 e tipografia segue Roboto; web: manter coluna com largura máxima, navegação por teclado e foco visível. A página HTML é referência, não componente a colar no Expo (`Tela.tsx:36`, `docs/app-map/05_navegacao.md:90`).

## 4. TL-02 — Criar conta

### Objetivo, diagnóstico e direção

[DECISÃO] Pedir só e-mail e senha, aceite do aviso e enviar ao Neon Auth; CTA principal é **Criar conta** (`TL-02_criar_conta.md:4`, `docs/app-map/01_decisoes.md:31`). A tela atual já tem campos, aceite, link, erros e carregamento (`criar-conta.tsx:51`). O mockup junta aceite e "Ler o aviso" no mesmo bloco e inclui Google (`mockups/index.html:268`); o código separa os controles e omite Google, coerente com PL-06 (`criar-conta.tsx:77`, `docs/app-map/12_pendencias_e_lacunas.md:13`). A separação atual evita dois alvos interativos aninhados, mas precisa parecer um único assunto visual.

### Função por função

| Capacidade / função no código | Atual e problema | Proposta de apresentação ou fluxo | Aceite verificável | Esforço; dependência nova; texto novo |
|---|---|---|---|---|
| `CriarConta()`, `useState` e apoio (`criar-conta.tsx:11`) | Formulário rola com `Tela`; título está no cabeçalho nativo, apoio é texto secundário. | `layout`/`typeset`: manter apoio junto dos campos e CTA visível após rolar; alinhar campos e botões ao mockup sem valores soltos. | A 200% e teclado aberto, CTA e "Já tenho conta" continuam alcançáveis. | M; não; não. |
| Editar e-mail / `setEmail`, `setErroEmail(undefined)` (`:55`) | Teclado de e-mail e sem autocorreção; erro some ao editar. | Manter; `harden`: após envio inválido, foco no e-mail quando for o primeiro erro. | E-mail inválido aponta o campo, é anunciado e recebe foco; corrigir apaga só seu erro. | M; não; não. |
| Editar senha / `setSenha`, `setErroSenha(undefined)` (`:66`) | Campo oculto; erro de senha curta/longa vindo do Neon vira "Informe uma senha" (`:41`), que é incorreto quando há conteúdo. | Manter valor digitado e indicar o erro real sem revelar senha; texto específico precisa de aprovação e regra PL-07. | Senha preenchida recusada pelo servidor nunca recebe a mensagem de campo vazio. | M; não; sim: [HIPÓTESE] mensagem de senha fora da regra; aprovar no catálogo. |
| Mostrar/ocultar senha / `CampoTexto` (`CampoTexto.tsx:38`, `:80`) | Botão textual alterna `secureTextEntry`; rótulos acessíveis existem, mas texto dentro do campo pode comprimir a entrada. | `polish`: reservar espaço para o controle, manter alvo ≥48 dp e leitura "Mostrar/Ocultar senha"; não trocar por ícone sem nome. | Toque alterna visibilidade e leitor anuncia o estado; campo não corta o controle em 320 dp/200%. | M; não; não. |
| Aceitar aviso / `setAceiteAviso`, `setErroAceite(undefined)` (`criar-conta.tsx:77`) | `Caixa` tem alvo inteiro e estado acessível (`Caixa.tsx:23`); aceite só é checado no envio (`:29`). | Agrupar visualmente caixa e link, mantendo alvos separados; erro fica junto da caixa. | Sem aceite não há chamada; erro aparece e é anunciado; toque no texto alterna a marca. | P; não; não. |
| Ler aviso / `router.push('/aviso-privacidade')` (`:84`) | Abre TL-13; especificação pede preservar campos na volta (`TL-02_criar_conta.md:115`). | `onboard`: link claro próximo à caixa, sem ambiguidade de que ler não aceita automaticamente. Checar persistência ao voltar no iPhone/Android. | Voltar do aviso mantém e-mail, senha e estado da caixa; aceite continua desmarcado se não foi marcado. | P; não; não. |
| `cadastrar()` e validação local (`criar-conta.tsx:23`) | Testa formato, senha não vazia, aceite; bloqueia envio inválido; não move foco ao primeiro erro como pede a especificação (`TL-02_criar_conta.md:132`). | `clarify`/`harden`: focar o primeiro campo inválido em ordem visual e anunciar a causa, sem alterar regras. | Um envio com três falhas foca e-mail; corrigido e reenviado, foca senha; depois, aceite. | M; não; não. |
| Envio / `servicos.conta.cadastrar`, `abrirSessao`, `carregando` (`:33`) | Botão mostra "Criando…" e impede duplo envio; demais controles desabilitados (`:64`, `:82`, `:93`). | Preservar dados na tela durante espera, mostrar atividade sem mudar largura do botão, anunciar "Criando…". | Um toque gera um envio; sucesso abre TL-04; falha mantém dados e reabilita ações. | P; não; não. |
| `catch` de `EMAIL_EXISTENTE` (`:39`) | Aviso geral tem só texto; especificação sugere caminho para Entrar (`TL-02_criar_conta.md:67`). | Usar ação "Entrar" no `Aviso` existente ou aproximar link já existente; sem duplicar conta. | E-mail repetido mostra motivo e caminho visível para TL-03; campos continuam até a navegação. | P; não; não (usar rótulo já catalogado). |
| `catch` de `ACEITE`, `SENHA_CURTA/LONGA`, `SEM_REDE`, `VALIDACAO`, demais (`:40`) | `ACEITE` e rede têm mensagens; senha curta/longa e validação genérica são mapeadas a erros possivelmente errados. | Prioridade: apresentar sem rede como erro recuperável, com "Tentar de novo" acionando `cadastrar()` após conferência local; para senha/validação, texto fiel ao retorno aprovado pelo Lucas. | Cada classe de erro tem mensagem correta, sem perder dados; nova tentativa é explícita. | M; não; sim para senha/validação: [HIPÓTESE] texto a aprovar. |
| Ir a Entrar / `router.replace('/entrar')` (`:93`) | Link existe e troca a rota; navegação difere do `push` inicial. | Manter passagem direta; alinhar posição visual ao mockup, mas conservar o rótulo do catálogo até aprovação. | Link abre TL-03 sem criar conta e o botão físico não cai em um formulário duplicado. | P; não; não. |
| Google e separador "ou" (não há handler) (`textos/criarConta.ts:13`) | Texto catalogado, UI omitida; PL-06 aberta. | Não adicionar botão inerte nem separador sem segunda opção. Só propor após OAuth e demonstração no Expo Go decididos. | Na entrega atual não aparece caminho Google não funcional. | G se retomado; OAuth/configuração a decidir; não. |

**Estados.** [DECISÃO] Inicial, campo inválido, aceite ausente, e-mail existente, envio, sem rede e erro geral já têm suporte parcial (`criar-conta.tsx:14`, `:85`). "Vazio" é formulário sem preenchimento, não uma tela separada. [EM ABERTO] Regra de senha é PL-07 e o Neon Auth não grava o aceite (`docs/app-map/01_decisoes.md:31`); a apresentação não pode afirmar registro desse aceite. [HIPÓTESE] `animate`: fade curto do erro via `Animated` (opacity) e feedback de toque por transform; sem dependência nova e sem movimento com redução ativa. `LayoutAnimation` não é necessária. **Plataformas:** iPhone usa teclado de e-mail e evitar teclado em `Tela`; Android deve aceitar Voltar físico ao sair do aviso e tecla de envio sem enviar duas vezes; web recebe foco visível e navegação por Tab. Validar em aparelho, pois o Neon Auth ainda não foi exercitado no celular (`docs/HANDOFF_mobile.md:49`).

## 5. TL-03 — Entrar

### Objetivo, diagnóstico e direção

[DECISÃO] Abrir sessão por e-mail e senha; CTA é **Entrar** (`TL-03_entrar.md:4`). A tela já possui os dois campos, botão, aviso de erro e link para cadastro (`entrar.tsx:47`). No mockup, o aviso de acesso negado está acima dos campos e Google aparece abaixo de "ou" (`mockups/index.html:277`); o código mostra aviso depois dos campos e omite Google, conforme PL-06. Priorizar a correção do foco e a distinção entre credencial recusada e indisponibilidade, sem expor se o e-mail existe (`TL-03_entrar.md:92`).

### Função por função

| Capacidade / função no código | Atual e problema | Proposta de apresentação ou fluxo | Aceite verificável | Esforço; dependência nova; texto novo |
|---|---|---|---|---|
| `Entrar()` e estado dos campos (`entrar.tsx:11`) | Formulário simples com título no `Stack`; falta apoio para retorno após expiração. | `shape`/`layout`: campos, aviso e CTA em uma coluna curta; se houver motivo de expiração recebido pelo fluxo, exibir aviso catalogado. | Abrir sem sessão mostra formulário; após expiração, motivo é anunciado antes de entrar de novo. | M; não; não (`abertura.sessaoExpirada`). |
| Editar e-mail / `setEmail`, limpar erro (`:50`) | Configuração de teclado correta; apaga erro do campo. | Manter; no erro local ou de credenciais, devolver foco ao e-mail, conforme TL-03. | E-mail vazio/inválido recebe foco e motivo; correção preserva senha digitada. | M; não; não. |
| Editar senha / `setSenha`, limpar erro (`:61`) | Campo oculto e erro local; `CampoTexto` tem alternância visível. | Manter rótulo do controle e tamanho do toque; testar a 200% para evitar compressão. | Senha vazia mostra mensagem junto ao campo; mostrar/ocultar funciona com leitor de tela. | P; não; não. |
| `entrar()` / formato e vazio (`:21`) | Valida localmente ambos, bloqueia envio se há erro; não foca o primeiro erro. | `harden`: foco sequencial no primeiro erro; sem ampliar regra de negócio. | Com os dois vazios, e-mail foca primeiro; com e-mail preenchido, senha foca. | M; não; não. |
| Envio / `servicos.conta.entrar`, `abrirSessao`, `carregando` (`:32`) | Mostra "Entrando…" e desabilita controles. | Manter feedback dentro do botão, sem salto de layout; anunciar progresso e liberar ao falhar. | Um toque gera uma tentativa; sucesso segue guarda para TL-04 ou retorno previsto pela rota; erro preserva os campos. | P; não; não. |
| `catch`: `SEM_REDE` (`:38`) | Usa aviso "Sem conexão. Nada foi enviado." | Acrescentar ação de tentar de novo junto do aviso, sem disparo automático. | Sem rede, formulário fica editável e novo toque refaz tentativa. | P; não; não (`textos.comuns.tentarDeNovo`). |
| `catch`: `INDISPONIVEL` e inesperado (`:39`, `:41`) | Usa mensagem geral; no navegador, `SEM_COOKIE` cai aqui, mesmo quando a conta foi criada no servidor (`docs/HANDOFF_mobile.md:49`). | `clarify`: não sugerir erro de senha; mostrar falha de conclusão e permitir nova tentativa. Tratar o defeito web como pendência técnica de autenticação, sem prometer correção visual. | Aviso não afirma credencial errada; dados permanecem. | P de UI; não; não. |
| `catch`: demais erros de serviço (`:40`) | Mensagem genérica para credenciais, inclusive conta inexistente; evita enumeração. | Preservar a mesma frase para senha errada/e-mail inexistente; mover foco ao e-mail e anunciar. | Mesma frase nos dois casos; leitor anuncia; foco no e-mail. | M; não; não. |
| Criar conta / `router.replace('/criar-conta')` (`:80`) | Navega para TL-02. | Manter link sob o CTA, sem separador "ou" enquanto Google estiver fora. | Link abre TL-02 e não deixa cópia do login na pilha. | P; não; não. |
| Google (não há handler) (`TL-03_entrar.md:70`) | Ausente. | Permanecer fora da demo até PL-06; não expor botão sem ação. | Nenhum caminho Google quebrado no Expo Go. | G se retomado; OAuth/configuração a decidir; não. |

**Estados.** [DECISÃO] Inicial, vazio, enviando, negado, sem rede/erro de servidor e sucesso estão modelados (`entrar.tsx:14`, `:72`). Falta foco no erro e aviso de sessão expirada no caminho real. [EM ABERTO] O retorno à tela anterior à expiração está especificado (`docs/app-map/05_navegacao.md:88`), mas não aparece na TL-03; verificar a navegação sem alterar a autenticação neste plano. [HIPÓTESE] `animate`: fade do aviso via `Animated` com opacity, sem deslocar os campos; desligar com reduzir movimento. `LayoutAnimation` não é necessária. **Plataformas:** iPhone e Android usam seus teclados/autofill nativos; Android Voltar segue a pilha; web exige Tab e foco visível, e tem limitação conhecida de cookie no Neon Auth (`docs/HANDOFF_mobile.md:49`).

## 6. TL-13 — Aviso de privacidade

### Objetivo, diagnóstico e direção

[DECISÃO] Exibir a **minuta acadêmica** acessível com ou sem sessão; o primeiro elemento principal é o aviso "Minuta acadêmica, sem revisão jurídica" (`TL-13_aviso_privacidade.md:3`, `:94`). O código já põe esse aviso antes de seções com títulos acessíveis (`aviso-privacidade.tsx:18`). O mockup compacta as seções e omite "Excluir a conta" (`mockups/index.html:281`), enquanto o código a mostra por texto (`textos/aviso.ts:20`). A D-25 removeu exclusão do MVP; é conflito de conteúdo, não ajuste de espaçamento.

### Função por função

| Capacidade / função no código | Atual e problema | Proposta de apresentação ou fluxo | Aceite verificável | Esforço; dependência nova; texto novo |
|---|---|---|---|---|
| `AvisoPrivacidade()` / `Tela` / `Stack.Screen` (`aviso-privacidade.tsx:16`) | Página rolável e cabeçalho nativo; `Stack.Screen` define o título. | `typeset`/`distill`: título e minuta no topo, seções curtas com espaço estável; manter rolagem para 200%. | Minuta visível antes das seções; todo texto alcançável no aparelho pequeno. | P; não; não. |
| `secoes.map` (`:7`, `:21`) | Seis seções geradas de `textos.aviso`; `Texto` de seção tem `accessibilityRole="header"` (`:23`). | Preservar cabeçalhos e ordem lógica; conferir que o leitor percorre título, minuta e seções. | VoiceOver/TalkBack navegam seção a seção; nenhum texto está em imagem. | P; não; não. |
| "O que pedimos" (`textos/aviso.ts:5`) | Diz e-mail/senha ou identificador Google, mas Google não está na demo. | Manter como proposta de produto só se Lucas quiser descrever o fluxo futuro; para MVP, propor redação coerente com e-mail/senha, marcada como hipótese. | Texto descreve apenas coleta implementada no MVP ou diferencia explicitamente o futuro. | P; não; sim: [HIPÓTESE] revisão para aprovar. |
| "O que não guardamos" (`:7`) | Declara descarte das consultas. | Não alterar antes de conferir contrato real; apresentação em parágrafo legível. | Texto aprovado corresponde ao comportamento observado do serviço. | P; não; não. |
| "O que fica só no celular" (`:10`) | Afirma histórico/locais salvos condicionais; D-24 deixou armazenamento em aberto. | Sinalizar à decisão de Lucas; não apresentar recurso ainda não demonstrado como ativo. | Aviso corresponde à implementação real do histórico/local. | M; não; sim: [HIPÓTESE] texto condicionado à decisão FN-13. |
| "Localização" e "Compartilhar minha volta" (`:12`, `:15`) | Textos descrevem GPS durante compartilhamento e apagamento; compartilhamento depende do tempo (`docs/HANDOFF_mobile.md:63`). | Manter se o recurso for entregue e validado; caso contrário, proposta de redação que diferencia função futura, sem prometer armazenamento/apagamento não verificado. | O aviso não afirma uso de GPS em segundo plano se TL-14/15 não estiverem operantes. | M; não; sim: [HIPÓTESE] texto a aprovar. |
| "Mapa" (`:18`) | Diz que serviço externo vê região exibida; provedor segue aberto. | Manter cautela e conferir quando o mapa base for definido; nenhuma afirmação de privacidade absoluta. | Redação corresponde ao provedor escolhido e à atribuição. | P; não; não ou [HIPÓTESE] ajuste futuro. |
| "Excluir a conta" (`:20`) | Informa caminho inexistente no MVP, contrariando D-25 (`docs/app-map/01_decisoes.md:32`). | `harden`/`clarify`: Lucas deve aprovar retirada ou texto honesto de indisponibilidade; não sugerir botão que não existe. | Nenhum caminho de exclusão inexistente é anunciado como disponível. | P; não; sim: [HIPÓTESE] texto substituto/retirada para aprovação. |
| Voltar, fornecido pela pilha (`app/_layout.tsx:55`) | Tela não tem handler próprio; origem é preservada pela navegação em pilha. | Verificar botão de cabeçalho, gesto iOS e Voltar físico Android; ao fechar, foco retorna ao link acionador e campos de TL-02 persistem. | Retorna à TL-01/TL-02/Configurações conforme origem, inclusive sem rede; no cadastro, campos intactos. | M; não; não. |

**Estados.** [DECISÃO] Há só conteúdo fixo: sem carregamento, vazio nem erro de rede (`TL-13_aviso_privacidade.md:73`). A tela deve abrir offline. [EM ABERTO] O conteúdo de exclusão, histórico e compartilhamento precisa ser conciliado com D-24/D-25 antes de publicar. [HIPÓTESE] `animate` não traz ganho aqui; usar rolagem nativa, sem animação própria. **Plataformas:** iPhone usa voltar no cabeçalho/gesto e área segura; Android oferece Voltar físico; web usa cabeçalho navegável por teclado, coluna legível e foco no título ao abrir. Nenhuma dependência nova.

## 7. Primeira vez / `onboard`

[DECISÃO] Ao abrir sem sessão, a pessoa vê TL-01 com nome, frase, "Criar conta", "Entrar" e aviso; para consultar, precisa de conta (`TL-01_abertura.md:4`, `docs/app-map/03_fluxogramas/FL-01_visao_geral.md:14`). Após cadastro, a guarda abre TL-04 (`src/mobile-app/src/app/_layout.tsx:46`). [HIPÓTESE] Melhorar a primeira experiência com a frase já catalogada, uma ação principal visível, opção de entrar e link do aviso no mesmo campo visual; não criar carrossel, tutorial, permissão antecipada de GPS ou promessa de resultado. A indicação de minuta deve aparecer antes do aceite, e ler o aviso não deve marcá-lo automaticamente (`TL-02_criar_conta.md:29`, `criar-conta.tsx:77`). Em retorno com sessão, ir direto ao planejamento após um estado breve de verificação; sem sessão por expiração, explicar o motivo usando texto existente (`TL-01_abertura.md:68`).

## 8. Conflitos e riscos

| Regra e evidência | Risco | Prevenção no redesign |
|---|---|---|
| [DECISÃO] Linguagem de `docs/05_regras_linguagem_etica.md:18` e `:28` | Cena dourada ou frase nova pode insinuar garantia ou classificar lugar. | Dourado marca ação/seleção; sem rótulo de segurança, nota, semáforo ou escala. Se um texto de comparação for usado, apenas "exposição estimada", contextualizada e com confiança dos dados separada. |
| [HIPÓTESE] Marca D-06 e revisão PL-19 (`docs/app-map/01_decisoes.md:13`, `docs/app-map/12_pendencias_e_lacunas.md:19`) | Implementar mockup como design aprovado. | Mostrar proposta ao Lucas; manter tokens existentes até decisão. Fonte Atkinson requer `expo-font` ou pacote de fontes e aprovação; sistema é reserva (`docs/app-map/07_design/tokens.md:125`). |
| [DECISÃO] D-24 Neon Auth (`docs/app-map/01_decisoes.md:31`) | Tratar falha web de cookie como erro de senha ou supor fluxo testado em celular. | Mensagem de indisponibilidade, teste real no Expo Go antes de demonstrar, sem segredo no app. `docs/HANDOFF_mobile.md:49` registra o defeito web. |
| [DECISÃO] D-25 (`docs/app-map/01_decisoes.md:32`) versus aviso (`src/mobile-app/src/textos/aviso.ts:20`) | Dizer que há exclusão de conta quando não há. | Revisar a minuta com Lucas antes da entrega; não inventar canal alternativo. |
| [EM ABERTO] PL-07 e aceite não armazenado (`docs/app-map/12_pendencias_e_lacunas.md:14`, `docs/app-map/01_decisoes.md:31`) | Mensagem "Informe uma senha" para senha preenchida; inferir prova de consentimento. | Propor texto de erro exato como [HIPÓTESE], não prometer registro do aceite; confirmação jurídica/operacional fora do escopo visual. |
| [DECISÃO] Guia: só `transform`/`opacity`, reduzir movimento e RN nativo (`docs/redesign/00_guia_original.md:264`, `:14`) | Copiar `stroke-dashoffset`/SVG/DOM do mockup (`mockups/index.html:167`). | Versão estática sem dependência; animação de traçado só se houver decisão técnica posterior. `Animated` basta para fade/transform; checar reduzir movimento. |
| [DECISÃO] Entrega 19/11 23h55 (`docs/01_gs_briefing.md:36`) e congelamento 18/11 informado no pedido | Redesign amplo sem validação no celular. | Até 18/11: clareza, erros, foco, conteúdo aprovado e testes manuais. Adiar fonte/cena animada/OAuth. |

## 9. Perguntas para o Lucas

1. **[EM ABERTO] Aprova o visual PL-19 da entrada e dos formulários?** Recomendo aprovar a hierarquia e os tokens já usados, mas manter a cena estática nesta entrega; referência `docs/app-map/07_design/mockups/index.html:261`.
2. **[EM ABERTO] Qual texto do aviso deve substituir a instrução de exclusão que saiu do MVP?** Recomendo retirar a instrução de menu antes da demonstração e aprovar uma minuta fiel ao recurso disponível; D-25 em `docs/app-map/01_decisoes.md:32`.
3. **[EM ABERTO] Qual regra e mensagem para senha curta/longa no Neon Auth?** Recomendo mensagem específica para o erro real, sem anunciar comprimento até confirmar PL-07; `criar-conta.tsx:41`.
4. **[EM ABERTO] O aviso deve mencionar Google, histórico local e compartilhamento nesta entrega?** Recomendo citar só capacidades efetivamente demonstradas, ou distingui-las claramente como futuras; `docs/HANDOFF_mobile.md:65`.
5. **[EM ABERTO] Quer aprovar uma dependência para a cena desenhada e outra para a fonte Atkinson após o MVP?** Recomendo nenhuma antes de 18/11; `react-native-svg` seria necessária para caminho vetorial nativo, `expo-font` para carregar fonte; `docs/app-map/07_design/tokens.md:37`.

## 10. Ordem de implementação sugerida

| Ordem | Entrega verificável | Esforço relativo | Janela |
|---|---|---|---|
| 1 | [HIPÓTESE] Validar conteúdo de TL-13 com D-24/D-25 e aprovar textos de senha; nenhum caminho inexistente na minuta. | M | **Cabe até 18/11**, depende de resposta do Lucas. |
| 2 | [HIPÓTESE] `harden`/`clarify` TL-02 e TL-03: foco no primeiro erro, mensagem fiel para cada retorno, tentativa explícita após sem rede. | G | **Cabe até 18/11**, se a autenticação móvel for verificada. |
| 3 | [HIPÓTESE] `shape`/`typeset`/`layout` TL-01, TL-02, TL-03: blocos, hierarquia, CTA, formulário a 200%, tema claro/escuro; sem conteúdo novo. | M | **Cabe até 18/11**. |
| 4 | [HIPÓTESE] `onboard`/`adapt`/`polish`: carregamento de sessão visível, volta do aviso com campos preservados; revisar 320 dp, 200%, iPhone, Android e web. | M | **Cabe até 18/11**, teste no Expo Go é obrigatório para fechar. |
| 5 | [HIPÓTESE] Cena estática aprovada, se houver ativo nativo e tempo; animação por opacity/transform apenas. | M | Condicional até 18/11. |
| 6 | [HIPÓTESE] Traçado vetorial animado, Atkinson, Google OAuth e correção de autenticação web. | G + dependências/decisões | **Depois de 18/11**; não bloquear entrega móvel. |

**Esforço total sugerido:** [HIPÓTESE] 3 M + 1 G no núcleo até 18/11, mais 1 M condicional; fase posterior G. A ordem é de entrega, não estimativa de horas. [EM ABERTO] A qualidade visual final depende de aprovação do Lucas e de validação em aparelho; o handoff registra que Neon Auth no celular ainda não foi testado (`docs/HANDOFF_mobile.md:57`).

**STATUS:** DONE_WITH_CONCERNS  
**SUMMARY:** As cinco oportunidades são: hierarquia da abertura; foco e leitura dos erros; mensagem correta para senha/servidor; aviso coerente com D-24/D-25; verificação de sessão visível. Perguntas urgentes: aprovação visual PL-19, texto da exclusão no aviso, regra/mensagem de senha e conteúdo do aviso para recursos ainda não demonstrados.
