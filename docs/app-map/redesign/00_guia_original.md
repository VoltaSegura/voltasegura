# Guia: redesign de app React Native (mobile + web) com skills de IA

> **Para quem:** Lucas, iniciante em design e front-end, com um app em **React Native que também roda na web** (provavelmente Expo + React Native Web).
> **Complementa:** `guia-design-sites-ia.md`, o guia de sites (Taste Skill, Transitions.dev, React Bits).
> **Pesquisa feita em:** 13/11/2026. Skills mudam a cada poucas semanas, então confira os links oficiais (seção 10) se algum comando falhar.

---

## 0. Para a IA que receber este arquivo

1. O Lucas é **iniciante**. Conduza **uma etapa por vez** (seção 5) e explique o que cada comando faz antes de pedir que ele rode.
2. **Antes de mexer em qualquer tela**, confirme que existe um commit/branch de segurança (Etapa 2).
3. Descubra primeiro a stack real do app (Etapa 3): Expo ou React Native puro, Expo Router, biblioteca de estilos, versão do Reanimated. Adapte o guia ao que encontrar.
4. Respeite a tabela de compatibilidade (seção 1). **Não** cole componentes de React Bits ou Transitions.dev direto em telas React Native: eles usam DOM/CSS e não funcionam no celular.
5. Redesign é **tela por tela**, começando pela mais importante. Nada de refazer o app inteiro de uma vez.
6. A regra do primeiro guia continua valendo: as ferramentas dão a base, mas o critério é do Lucas. Pergunte e mostre opções antes de decisões grandes de estilo.

---

## 1. O que funciona (e o que não funciona) em React Native

React Native **não é web**. No celular, ele desenha componentes nativos (`View`, `Text`), não HTML/CSS. Por isso parte das ferramentas do primeiro guia **não serve** para as telas do app.

| Ferramenta | Funciona no app RN? | Como usar neste projeto |
|---|---|---|
| **Impeccable** | ✅ Sim | **Ferramenta principal do redesign.** Com `Platform: adaptive`, segue as regras da Apple (HIG) e do Android (Material 3). |
| **UI/UX Pro Max** | ✅ Sim | **Define o design system** (cores, fontes, estilo). React Native está entre as stacks suportadas. |
| **Expo skills** (oficiais) | ✅ Sim (se o app usa Expo) | Ensinam a IA a fazer UI com cara de nativa: navegação, abas, modais, animações. |
| **React Native Best Practices** (Callstack) | ✅ Sim | Performance: animações travando, listas lentas, app pesado. |
| **Taste Skill** | ⚠️ Só na web | Feita para HTML/CSS e não trata apps nativos. Use **só** para a landing page/site do app (Etapa 11). |
| **Transitions.dev** | ⚠️ Como referência | As receitas são CSS/React web. No app, peça à IA para **traduzir o comportamento** (tempo, curva, efeito) para Reanimated. |
| **React Bits** | ❌ Não nas telas nativas | Componentes DOM/WebGL. Use **só** no site/landing page. Equivalente para RN: **Reacticx** (seção 2.6). |

> **Exceção avançada:** o Expo tem "DOM components" (`'use dom'`), que rodam código web dentro do app via WebView. Dá para encaixar um componente web numa tela, mas fica mais lento e com limitações. **Não use no começo.**

---

## 2. O kit de ferramentas

### 2.1 Impeccable: o "designer sênior" do redesign ⭐

- **Site:** https://impeccable.style · **GitHub:** https://github.com/pbakaus/impeccable
- **O que é:** um vocabulário de design para agentes de IA. São comandos para guiar e revisar a interface, mais um detector de padrões genéricos de "cara de IA".
- **Por que é a principal:** trabalha **em cima do código que já existe**, que é exatamente o que um redesign precisa. Criada por Paul Bakaus (ex-Google, criador do jQuery UI). Licença Apache 2.0, gratuita.
- **Suporte a React Native:** no arquivo `PRODUCT.md`, a seção `## Platform` aceita `ios`, `android` ou `adaptive`. **`adaptive` é o seu caso:** um único código React Native que segue as convenções de cada sistema. Os comandos `audit` e `adapt` têm versões nativas que leem código React Native.
- **Limitação:** o detector automático, o modo `live` (editar no navegador) e o hook de edição funcionam **só na web**.

**Comandos (use sempre `/impeccable <comando> <alvo>`):**

| Grupo | Comando | O que faz |
|---|---|---|
| Preparar | `init` | Cria o `PRODUCT.md` (contexto do produto). **Rode primeiro, uma vez.** |
| | `shape` | Planeja a UX **antes** de escrever código |
| | `document` | Gera o `DESIGN.md` (regras visuais do app) |
| | `extract` | Junta padrões repetidos num design system |
| Revisar | `critique` | Revisão de UX com nota |
| | `audit` | Relatório técnico: acessibilidade, performance, responsividade |
| Direcionar | `bolder` | Dá força a um design sem graça |
| | `quieter` | Acalma um design exagerado |
| | `distill` | Remove o que é desnecessário |
| | `colorize` | Adiciona cor a telas cinzentas |
| | `typeset` | Arruma fontes, hierarquia e tamanhos |
| | `layout` | Arruma espaçamento e ritmo |
| | `animate` | Adiciona transições e feedback |
| | `delight` | Adiciona personalidade |
| | `overdrive` | Efeitos avançados (física de mola, scroll). Use com moderação. |
| Finalizar | `polish` | Passe final antes de publicar |
| | `harden` | Erros, textos longos, idiomas, casos extremos |
| | `clarify` | Reescreve textos confusos |
| | `adapt` | Ajusta para tamanhos de tela e dispositivos |
| | `optimize` | Performance de carregamento e renderização |
| | `onboard` | Primeiro acesso e telas vazias |
| Iterar (web) | `live` / `generate` | Variações ao vivo no navegador (não funciona no Expo/Metro) |

### 2.2 UI/UX Pro Max: o "banco de dados" de design

- **GitHub:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill · **Site:** https://uupm.cc
- **O que é:** a skill de design da comunidade mais popular, com 67 estilos de interface, 161 paletas e 57 pares de fontes. Escolhe o estilo pelo tipo de produto (ex.: "app de finanças" → paleta e fontes adequadas).
- **Uso neste projeto:** gerar e **salvar** o design system do app (`design-system/<app>/MASTER.md`), que vira a referência de todas as telas.
- **Ponto fraco:** devolve recomendações em texto, não telas prontas. Às vezes a busca traz resultado irrelevante. Por isso você combina com a Impeccable.
- **Requisito extra:** Python 3.
- Licença MIT, gratuita (existe versão Premium com identidade de marca e logo).

### 2.3 Expo skills: UI com cara de nativa (oficial)

- **GitHub:** https://github.com/expo/skills
- **`building-native-ui`:** guia completo de UI em Expo com Expo Router. Cobre abas nativas, navegação em pilha, modais, sheets, animações, áreas seguras (notch) e padrões responsivos, seguindo as regras da Apple.
- Prefere **Reanimated** para animações sérias, no lugar da API `Animated` antiga.
- Avisa o que exige build customizado, ou seja, o que **não roda no Expo Go**.
- **Atenção:** é focada no visual nativo. Para design system muito compartilhado com a web, use junto com a Impeccable.

### 2.4 React Native Best Practices: performance

- **Callstack** (consultoria referência em RN): https://github.com/callstackincubator/agent-skills
- Baseada no "Ultimate Guide to React Native Optimization". Resolve animação travando, app pesado, listas lentas, re-renderizações.
- **Alternativa:** `react-native-skills`, da Vercel (performance de listas, animações, padrões de UI).

### 2.5 Taste Skill e Transitions.dev: papel reduzido

- **Taste Skill:** só para a **landing page/site** do app (veja o primeiro guia).
- **Transitions.dev:** use a biblioteca (https://transitions.dev/library.html) como **catálogo de comportamentos** (dropdown, toast, check de sucesso, skeleton) e peça à IA para recriar no Reanimated.

### 2.6 Componentes animados para React Native (o "React Bits do mobile")

- **Reacticx:** https://www.reacticx.com. Mais de 60 componentes React Native para copiar e colar, compatíveis com Expo, feitos com Reanimated 4 e Skia.
- Outras opções do mesmo estilo copiar-e-colar: **AniUI** (https://github.com/anishlp7/aniui, inspirada no shadcn, usa NativeWind) e **CraftReactNative** (https://github.com/craftreactnative/ui, usa Unistyles).
- **Regra:** escolha a que combina com a biblioteca de estilos que seu app **já usa**.

---

## 3. Mini-glossário de React Native

| Termo | Significado |
|---|---|
| **Expo** | Conjunto de ferramentas que facilita criar e rodar apps React Native. |
| **Expo Go** | App de celular (App Store / Play Store) para testar seu app escaneando um QR code. |
| **Expo Router** | Sistema de navegação baseado em pastas e arquivos (`app/`). |
| **Metro** | O "empacotador" do React Native, que roda quando você dá `npx expo start`. |
| **React Native Web** | Faz o mesmo código React Native rodar no navegador. |
| **Reanimated** | Biblioteca padrão para animações fluidas (60/120 fps) em RN. |
| **Gesture Handler** | Biblioteca para gestos (arrastar, deslizar, pinçar). |
| **NativeWind / Unistyles** | Jeitos de estilizar em RN (NativeWind = estilo Tailwind). |
| **HIG** | Human Interface Guidelines, as regras de design da Apple (iOS). |
| **Material 3** | As regras de design do Google (Android). |
| **Design system** | O conjunto de cores, fontes, espaçamentos e componentes padrão do app. |
| **Design tokens** | Os valores do design system em código (ex.: `colors.primary = '#...'`). |
| **Branch (git)** | Uma "cópia paralela" do projeto onde você testa sem estragar o original. |

---

## 4. A ordem do processo (visão geral)

```
1. Segurança (git)        → 2. Diagnóstico da stack
3. Instalar skills        → 4. Contexto (PRODUCT.md)
5. Revisão do "antes"     → 6. Design system
7. Redesign tela por tela → 8. Animações
9. Acabamento             → 10. Testes (iOS, Android, web)
11. (Opcional) Landing page web
```

---

## 5. Passo a passo

### Etapa 1: pré-requisitos

- [ ] **Node.js 22+** → https://nodejs.org/en/download. Confira com `node -v`.
- [ ] **Python 3** (para a UI/UX Pro Max) → https://www.python.org/downloads. Confira com `python3 --version` (no Windows: `python --version`).
- [ ] **Git** → https://git-scm.com/downloads
- [ ] **Claude Code** (ou outro agente). Instruções no primeiro guia ou em https://code.claude.com/docs/en/overview
- [ ] **Expo Go** no celular (App Store / Play Store), se o app usa Expo.
- [ ] **Chrome** (para testar a versão web e rodar o detector da Impeccable).

### Etapa 2: rede de segurança (não pule!)

Redesign mexe em muitos arquivos. Crie um ponto de retorno antes:

```bash
cd caminho/do/seu-app
git status                      # veja se há mudanças não salvas
git add -A && git commit -m "estado antes do redesign"
git checkout -b redesign        # cria e entra na branch de redesign
```

Se tudo der errado: `git checkout main` volta ao original (o nome pode ser `master` em projetos antigos).

### Etapa 3: diagnóstico da stack

Abra o agente na pasta do app (`claude`) e cole o **Prompt 1** (seção 6). Anote as respostas, porque elas decidem quais skills instalar:

- [ ] Usa Expo? (`expo` aparece no `package.json`) → se sim, instale as Expo skills.
- [ ] Usa Expo Router? (existe a pasta `app/`)
- [ ] Biblioteca de estilos: StyleSheet, NativeWind, Unistyles, Tamagui...?
- [ ] Tem Reanimated instalado? Qual versão?
- [ ] Como roda a versão web? (normalmente `npx expo start` e depois a tecla `w`)

### Etapa 4: instalar as skills

Rode na **raiz do projeto** (ou peça ao agente para rodar):

```bash
# 1) Impeccable (principal)
npx impeccable install

# 2) UI/UX Pro Max (design system)
npm install -g ui-ux-pro-max-cli
uipro init --ai claude

# 3) Expo skills (só se o app usa Expo)
npx skills add expo/skills --skill building-native-ui

# 4) Performance React Native
npx skills add callstackincubator/agent-skills --skill react-native-best-practices
```

**Alternativas dentro do Claude Code:**
```
/plugin marketplace add pbakaus/impeccable          # depois abra /plugin e instale a Impeccable
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

Depois de instalar, **feche e abra o Claude Code de novo** para as skills carregarem.

### Etapa 5: dar contexto ao Impeccable

- [ ] No Claude Code:
  ```
  /impeccable init
  ```
- [ ] Responda às perguntas com **fatos reais** do app: para quem é, que problema resolve, qual a tarefa mais comum, tom da marca.
- [ ] Abra o `PRODUCT.md` gerado e confirme que existe:
  ```markdown
  ## Platform
  adaptive
  ```
  Isso faz a Impeccable seguir as regras da Apple no iPhone e do Material 3 no Android.

### Etapa 6: revisar o "antes"

- [ ] Liste as telas do app e escolha **as 3 mais importantes** (ex.: Home, tela da tarefa principal, Perfil).
- [ ] Para cada uma, rode:
  ```
  /impeccable critique a tela [Home]
  /impeccable audit a tela [Home]
  ```
- [ ] **Na versão web** (opcional), rode o detector com o app aberto no navegador:
  ```bash
  npx impeccable detect http://localhost:8081
  ```
  O detector analisa páginas renderizadas, então **pode** funcionar na versão web do RN. Não é garantido.
- [ ] Tire **prints** do antes (celular e web) para comparar depois.

### Etapa 7: criar o design system

- [ ] Peça à UI/UX Pro Max um design system para o tipo de produto (**Prompt 3**). Ela salva em `design-system/<seu-app>/MASTER.md`.
  - Comando direto (o agente costuma rodar sozinho):
    ```bash
    python3 .claude/skills/ui-ux-pro-max/scripts/search.py "[tipo do app, ex.: personal finance app]" --design-system --persist -p "[NomeDoApp]"
    ```
- [ ] **Você decide:** leia o MASTER.md e aprove ou peça ajustes (cores da marca, fontes).
- [ ] Peça para transformar o design system em **tokens no código**, ou seja, um arquivo único de tema (**Prompt 4**).
- [ ] Rode `/impeccable document` para gerar o `DESIGN.md` alinhado.

### Etapa 8: redesign tela por tela

Para **cada tela**, nesta ordem:

1. `/impeccable shape a tela [X]`: planeja a UX antes do código.
2. Peça a implementação com o **Prompt 5** (usa design system + Impeccable + building-native-ui).
3. Teste no celular (Expo Go) **e** na web.
4. Ajuste com os comandos de direção: `typeset`, `layout`, `colorize`, `bolder`/`quieter`, `distill`.
5. Commit: `git add -A && git commit -m "redesign: tela X"`.

> Comece pela tela mais usada. Ela define o padrão das outras.

### Etapa 9: animações e micro-interações

- [ ] `/impeccable animate a tela [X]` para transições e feedback com propósito.
- [ ] Para comportamentos específicos, abra a biblioteca do Transitions.dev (https://transitions.dev/library.html), escolha o efeito e use o **Prompt 6** para recriar no Reanimated.
- [ ] Componente animado pronto? Pegue no **Reacticx** (https://www.reacticx.com) e use o **Prompt 7**.
- [ ] **Regras de ouro:**
  - Anime só `transform` e `opacity` (mais leve).
  - Animação serve para dar **feedback** e **orientar**, não para enfeitar.
  - Respeite a opção "reduzir movimento" do sistema.

### Etapa 10: acabamento

Rode em cada tela redesenhada:

```
/impeccable harden a tela [X]     # erros, textos longos, casos extremos
/impeccable onboard               # primeiro acesso e telas vazias
/impeccable clarify a tela [X]    # textos mais claros
/impeccable adapt a tela [X]      # celular pequeno, grande, tablet, web
/impeccable polish a tela [X]     # passe final
```

- [ ] Se algo ficou travando, use o **Prompt 8** (skill de performance).

### Etapa 11: testar nas 3 plataformas

```bash
npx expo start
```
- **iPhone/Android:** escaneie o QR code com o Expo Go.
- **Web:** aperte `w` no terminal.

- [ ] Compare com os prints do "antes".
- [ ] Rode `/impeccable critique` de novo nas 3 telas principais e compare as notas.
- [ ] Faça o checklist da seção 8.
- [ ] Se gostou: junte na branch principal (`git checkout main && git merge redesign`).

### Etapa 12 (opcional): landing page web do app

Para o **site de divulgação** do app (não o app em si), volte ao primeiro guia: Taste Skill + Transitions.dev + React Bits. Passe o `DESIGN.md` e o `MASTER.md` para manter a mesma identidade visual.

---

## 6. Modelos de prompt

> Troque o que está entre `[colchetes]`. Apague linhas sem informação.

### Prompt 1: diagnóstico (não altera nada)

```
Analise este projeto sem alterar nenhum arquivo e me responda em linguagem simples:
1. É Expo ou React Native puro? Qual versão do SDK?
2. Usa Expo Router? Liste as telas/rotas principais.
3. Qual biblioteca de estilos usa (StyleSheet, NativeWind, Unistyles, outra)?
4. Tem react-native-reanimated e gesture-handler? Quais versões?
5. Como rodo a versão web?
6. Existe algum arquivo de tema/cores centralizado?
7. Quais as 3 telas mais importantes para o usuário, na sua leitura?
```

### Prompt 2: preencher o init com contexto

```
/impeccable init
Contexto do app:
- Nome: [nome]
- Para quem: [público]
- Problema que resolve: [problema]
- Tarefa mais comum: [ex.: registrar um gasto]
- Tom da marca: [ex.: confiável e calmo]
- Plataforma: React Native com Expo, rodando em iOS, Android e web → Platform: adaptive
```

### Prompt 3: design system

```
Use a skill ui-ux-pro-max para gerar e salvar (--persist) o design system de um [tipo de app, ex.: app de finanças pessoais] chamado [Nome].
Stack: React Native + Expo (mobile e web).
Restrições: manter a cor da marca [#...]; fontes legíveis em telas pequenas; modo escuro [sim/não].
Me mostre 2 opções de estilo antes de salvar, com prós e contras.
```

### Prompt 4: tokens no código

```
Transforme o design-system/[nome]/MASTER.md em um arquivo de tema único para React Native
(cores, tipografia, espaçamentos, raios, sombras), compatível com [StyleSheet / NativeWind / Unistyles].
Não altere nenhuma tela ainda. Mostre o arquivo e onde ele foi criado.
```

### Prompt 5: redesign de uma tela

```
Redesenhe a tela [X] seguindo:
- o tema/tokens em [caminho do arquivo de tema]
- o PRODUCT.md e o DESIGN.md (Impeccable, Platform: adaptive)
- as convenções da skill building-native-ui (Expo)
Mantenha toda a lógica, dados e navegação. Mude só a apresentação.
Precisa funcionar em iOS, Android e web. Use Reanimated se houver animação.
Antes de editar, me diga em 5 tópicos o que vai mudar.
```

### Prompt 6: recriar um efeito do Transitions.dev em RN

```
Quero no meu app React Native o comportamento desta transição: [link do transitions.dev ou nome, ex.: "success check"].
Não copie o CSS. Recrie com react-native-reanimated, mantendo duração, curva e sensação parecidas.
Aplique em [componente/tela] e respeite a configuração de "reduzir movimento" do sistema.
```

### Prompt 7: componente do Reacticx

```
Quero adicionar este componente do Reacticx: [link].
Adapte às cores e fontes do nosso tema [caminho], instale só as dependências necessárias com "npx expo install",
e confirme se ele funciona também na versão web. Se não funcionar na web, crie um fallback simples.
```

### Prompt 8: performance

```
Use a skill react-native-best-practices para analisar a tela [X]: animações travando, re-renderizações e listas.
Liste os problemas por impacto (alto, médio, baixo) e corrija só os de impacto alto.
```

---

## 7. Plano mínimo (se o tempo for curto)

1. Etapa 2 (git), 3 (diagnóstico), 4 (instalar **só** a Impeccable)
2. `/impeccable init` (Platform: adaptive)
3. Na tela principal: `critique` → `typeset` → `layout` → `polish`
4. Testar no celular e na web

---

## 8. Checklist de qualidade

- [ ] Cores, fontes e espaçamentos vêm **do tema central**, sem valores soltos espalhados
- [ ] Cada tela tem **um objetivo claro** e o elemento principal se destaca
- [ ] Botões e áreas de toque são **grandes o suficiente** para o dedo
- [ ] Respeita as **áreas seguras** (notch, barra inferior do iPhone)
- [ ] Fica bom em celular pequeno, celular grande e na **web**
- [ ] Tem estados de **carregando, vazio e erro**
- [ ] Animações fluidas, com propósito, e respeitando "reduzir movimento"
- [ ] Contraste de texto legível (inclusive no modo escuro, se houver)
- [ ] Toda a lógica e a navegação continuam funcionando
- [ ] Testado em **iOS, Android e web**

---

## 9. Problemas comuns

| Problema | Solução |
|---|---|
| Skill não aparece depois de instalar | Feche e reabra o Claude Code. Cite o nome da skill no prompt. |
| `uipro` não é reconhecido | Rode `npm install -g ui-ux-pro-max-cli` de novo e abra um terminal novo. Pacotes antigos `uipro-cli` estão desatualizados. |
| Erro de Python na UI/UX Pro Max | Instale o Python 3 e confira com `python3 --version`. |
| A Impeccable deu regras de site, não de app | Confira `## Platform: adaptive` no `PRODUCT.md`. |
| `/impeccable live` não funciona | Esperado: o modo live suporta Vite/Next/etc., não Expo/Metro. Use os comandos normais. |
| Componente funciona na web mas quebra no celular | Provavelmente é componente web (React Bits/DOM). Troque por um equivalente RN (Reacticx) ou recrie com Reanimated. |
| Funciona no celular mas quebra na web | Peça à IA uma versão `.web.tsx` ou um fallback para web. |
| "Não roda no Expo Go" | O recurso exige build customizado. Peça uma alternativa compatível com o Expo Go ou siga a orientação da skill `building-native-ui`. |
| Animação travando | Prompt 8. Anime só transform e opacity. |
| Estragou tudo | `git checkout main` volta ao original (Etapa 2). |

---

## 10. Fontes e links

**Impeccable**
- Site: https://impeccable.style
- GitHub: https://github.com/pbakaus/impeccable

**UI/UX Pro Max**
- GitHub: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Site: https://uupm.cc
- CLI (npm): https://www.npmjs.com/package/ui-ux-pro-max-cli

**Expo**
- Skills oficiais: https://github.com/expo/skills
- DOM components (avançado): https://docs.expo.dev/guides/dom-components/
- Expo Go e documentação: https://docs.expo.dev

**React Native**
- Callstack agent skills: https://github.com/callstackincubator/agent-skills
- Vercel agent skills (react-native-skills): https://github.com/vercel-labs/agent-skills
- Reanimated: https://docs.swmansion.com/react-native-reanimated/

**Componentes RN para copiar e colar**
- Reacticx: https://www.reacticx.com
- AniUI: https://github.com/anishlp7/aniui
- CraftReactNative: https://github.com/craftreactnative/ui

**Do primeiro guia (uso na web/landing page)**
- Taste Skill: https://www.tasteskill.dev · modo app: https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/references/app-screens.md
- Transitions.dev: https://transitions.dev · biblioteca: https://transitions.dev/library.html
- React Bits: https://reactbits.dev

**Comparativos consultados**
- Superdesign, "Design Skills Reviewed (2026)": https://superdesign.dev/blog/design-skills-reviewed (o autor vende uma ferramenta concorrente)
- Claude Codex, stack de design: https://claude-codex.fr/en/content/stack-design-claude-code/
- Diretório de skills: https://skills.sh
