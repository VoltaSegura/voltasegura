# Plano em duas frentes: do backlog do VoltaSegura ao app mobile

Instruções para o Claude Code do repositório `voltasegura` (monorepo). Base: leitura de `docs/10_backlog_produto.md`, `AGENTS.md`, `docs/01`, `02`, `03`, `05`, `07`, `src/mobile-app/README.md`, `src/csharp-backend/README.md` e `scripts/sync_mirrors.sh`, em 12/11/2026. **Confirme tudo isto no repositório antes de agir; se algo divergir, vale o repositório.**

O trabalho tem duas frentes:

1. **Frente 1, Mapeamento:** transformar o backlog em fluxogramas, fluxos, telas, funcionalidades e design. Tudo em uma pasta de destaque: **`docs/app-map/`**.
2. **Frente 2, Construção:** construir o app em `src/mobile-app/` seguindo o que a Frente 1 mapeou.

Tudo é desenvolvido e fechado no repositório `voltasegura`. Só depois de maduro vai para o repositório do app (seção 7).

---

## 0. Restrições que valem para tudo

1. **Prazo:** entrega Mobile em **19/11/2026, 23h55**. A partir de 13/11 restam 7 dias. A Frente 1 precisa fechar o essencial até sábado 14/11, porque o que a rubrica avalia é o app rodando (seção 6).
2. **Hierarquia de fontes** (`AGENTS.md`): `docs/05` > `docs/01` > `docs/03` > `docs/04`. O backlog (`docs/10`) é a base, mas não pode contradizer `docs/05`.
3. **Status obrigatório** em toda afirmação nova: `[DECISÃO]`, `[HIPÓTESE]` ou `[EM ABERTO]`. Nada novo entra como `[DECISÃO]` sem o Lucas ter decidido. Propostas suas entram como `[HIPÓTESE]` ou `[EM ABERTO]`.
4. **Não inventar** métricas, fontes, pesos nem funcionalidades fora do backlog. Se um fluxo exigir algo que o backlog não cobre, registrar em `docs/app-map/12_pendencias_e_lacunas.md`, não preencher em silêncio.
5. **IDs do backlog são estáveis: não renumerar.** Itens novos ganham IDs novos (ex.: `F2.5`, `UX-01`). Cumprir o que o `AGENTS.md` exige: `TODO.md` (T07), `docs/06`, `prompts.md`.
6. **Linguagem (RNF-01):** "exposição estimada", sempre comparativa. Proibido: "rota segura", "rua/bairro perigoso", "área de risco", "garantimos segurança", "prevemos crimes". Os tempos 32/38 min do mockup são exemplo visual (RNF-08). Todo dado de exemplo em telas e mockups leva aviso de exemplo.
7. **Privacidade (DT-08, US-19, US-20):** sem coordenadas no servidor nem em logs, histórico só no aparelho, GPS só sob demanda, sem registros individuais de boletim no app, sem marcadores de ocorrência no mapa.

---

## 1. Como as duas frentes se ligam

| | Frente 1: Mapeamento | Frente 2: Construção |
|---|---|---|
| Onde trabalha | `docs/app-map/` (nada fora dela, exceto atualizações exigidas pelo `AGENTS.md`) | `src/mobile-app/` |
| Produz | Fluxogramas, fluxos, telas, funcionalidades, navegação, design, textos, rastreabilidade, roteiro de demo | App Expo, arquitetura técnica, testes, README do app |
| Começa | Sexta 13/11 | Sexta 13/11 (esqueleto, sem depender dos fluxos finais) |
| Termina | Sábado 14/11 à noite (essencial); ajustes depois só por pendência | Quinta 19/11 |

Regras de ligação:
- **A Frente 2 só implementa uma tela depois de a especificação dela em `docs/app-map/04_telas/` estar com `status: pronta`.** Antes disso, ela faz só infraestrutura (projeto, navegação vazia, camada de serviços, banco local, contrato da API).
- **A Frente 2 não altera `docs/app-map/` por conta própria.** Se descobrir que algo é inviável ou contraditório (a API não entrega um dado, a tela não cabe), anexa uma linha em `docs/app-map/12_pendencias_e_lacunas.md` e continua no que não depende disso. A Frente 1 resolve e atualiza a especificação.
- **Rastreabilidade é o contrato:** cada critério de aceite (AC) do backlog aponta para um fluxo, uma tela e (depois) um teste.

---

## 2. Diagnóstico e decisões abertas (resolver na Fase 0)

### 2.1 O que o backlog já tem (não refazer)
6 épicos, 20 features e 20 histórias com AC em Dado/Quando/Então; regras da comparação (DT-03 a DT-07); privacidade (DT-08); RNF-01 a RNF-09; fora do escopo e roadmap. Backend .NET 8 com regra de comparação, mock de roteamento e dados SSP-SP reais. **Gerar user stories novas não ajuda**: o backlog já está nesse nível e histórias novas arriscam inventar escopo.

### 2.2 O que falta (a Frente 1 entrega)
Fluxos ponta a ponta com erro/vazio/offline; inventário e especificação de cada tela; catálogo de funcionalidades; navegação; design (tokens, componentes, mockups); catálogo de textos; mapa de dados por tela; matriz de rastreabilidade; roteiro de demo.

### 2.3 Achados que exigem decisão do Lucas
Confirme cada um no código/docs e **pergunte ao Lucas com opções fechadas** antes de desenhar o que depende disso (`AskUserQuestion`, no máximo 4 perguntas por vez).

**A. Resultado conclusivo será raro.** O README do backend mostra "dados insuficientes — resultado muda com a largura do corredor" nos dois exemplos reais, e diz que o destaque será raro. A UX deve tratar os estados sem conclusão como caso normal e útil, não como erro. A demo precisa de um cenário conclusivo **rotulado como exemplo**.

**B. Estados do resultado inconsistentes entre documentos.**
- `F3.4 AC2` lista 3 estados: "menor exposição estimada entre as alternativas avaliadas", "sem diferença clara entre os registros", "dados insuficientes".
- `US-11 AC2` acrescenta um quarto: "indicadores mistos; não há conclusão por ocorrências registradas".
- `US-11 AC4` (favorecida muda com a largura do corredor) não tem texto; o README do backend rotula como "Dados insuficientes".
- O backend usa "Dados suficientes para comparar" para o caso conclusivo, diferente do backlog.
Decisão: lista final de estados e frases fixas, iguais no app, na API e em `docs/08`.

**C. Escolha de origem e destino sem violar a privacidade.** `US-19 AC3`: a consulta não vai a serviços externos de mapas. Autocomplete de endereço (Google Places etc.) violaria isso, e o backlog não define a busca. Opções: tocar no mapa, GPS (`US-05`), pontos de exemplo/locais salvos no aparelho, geocoder próprio (custo, `[EM ABERTO]`). Tiles do mapa também são requisição externa (revelam a região vista, não origem/destino exatos).

**D. Conta e login sem backend visível.** Pela listagem, há `OcorrenciasController`, `TrajetosController`, `ComparacoesController` e `DadosController`, sem autenticação. `US-01`, `US-02`, `US-03` precisam de endpoints ou de mock local. **Verifique nos controllers.** "Entrar com Google" (`US-01 AC5`) costuma exigir configuração OAuth e build de desenvolvimento fora do Expo Go; propor como opcional.

**E. Passo a passo (`F2.4`) está `[EM ABERTO]`.** Os dados dos trechos já vêm da alternativa (`US-08 AC1`); uma lista só de leitura custa pouco. Propor incluir.

**F. Fora do município (`US-06 AC3`) está `[EM ABERTO]`:** mensagem e bloqueio.

**G. Logo e paleta finais:** há 10 versões em `design/`. Descobrir a final (`design/ledger.jsonl`, README, `Claude outputs/`). Se não estiver registrada, perguntar.

---

## 3. Skills (uso opcional, com cuidado)

As skills ajudam em duas etapas e **não substituem** o contexto do projeto. Nenhuma conhece `docs/05`.

| Skill | Uso |
|---|---|
| `journey` (ghaida/intent) | **Principal.** Fluxos com onboarding, erro e recuperação; pode gerar diagrama HTML |
| `user-story-mapping` (deanpeters/Product-Manager-Skills) | Reorganizar as histórias em atividades → passos → tarefas |
| `draft-ia` (jeremylongshore) | Só se precisar de sitemap; sobrepõe `journey` |
| Skills de "criar user stories" | **Não usar**: duplicam o backlog e inventam escopo |

- **Skill própria recomendada:** `voltasegura-guardrails`, de uma página: termos proibidos e substitutos de `docs/05`, checklist de entrega, estados e frases fixas do resultado (após 2.3-B), regras de privacidade e a regra de status. Faz qualquer skill genérica obedecer ao projeto. Ofereça criá-la ao Lucas.
- **Ao instalar skill da comunidade:** ler o `SKILL.md` inteiro antes, instalar só no projeto, fixar commit, no máximo 2 ou 3. Sem skills, este arquivo e os prompts abaixo bastam.

---

## 4. FRENTE 1: Mapeamento (`docs/app-map/`)

### 4.1 Estrutura da pasta

```
docs/app-map/
├── 00_LEIA-ME.md                  índice, como ler, legenda de status, estado de cada arquivo
├── 01_decisoes.md                 decisões do Lucas (2.3) com data e opção escolhida
├── 02_story_map.md                atividades → passos → tarefas → fatias MVP/Posterior
├── 03_fluxogramas/
│   ├── 00_indice.md               mapa geral e links
│   └── FL-01_... a FL-12_...md    um arquivo por fluxo (template 4.2)
├── 04_telas/
│   ├── 00_indice.md               lista de telas, status (rascunho|pronta), US/AC
│   └── TL-01_... a TL-nn_...md    um arquivo por tela (template 4.3)
├── 05_navegacao.md                árvore de rotas Expo Router, transições, voltar, estados globais
├── 06_funcionalidades.md          catálogo: cada funcionalidade → telas, regras, dados, AC, testes
├── 07_design/
│   ├── tokens.md                  cor, tipografia, espaçamento, raio, elevação, ícones
│   ├── componentes.md             biblioteca de componentes com variantes e estados
│   ├── acessibilidade.md          regras concretas e checklist por tela
│   └── mockups/                   mockups visuais (4.5)
├── 08_microcopy.md                catálogo de textos por tela + resultado da varredura de termos proibidos
├── 09_dados_por_tela.md           por tela: campo exibido → origem (API/local/fixo) → regra de formatação
├── 10_rastreabilidade.md          matriz US/AC → fluxo → tela → componente → teste previsto
├── 11_roteiro_demo.md             roteiro do vídeo de 3 min e lista de prints
└── 12_pendencias_e_lacunas.md     lacunas, divergências, perguntas (a Frente 2 também anexa aqui)
```

### 4.2 Fluxogramas e fluxos

Usar **Mermaid** em Markdown (renderiza no GitHub e no VS Code). Um arquivo por fluxo, com este template:

```
# FL-nn · Nome do fluxo
- Status: rascunho | pronta   · Status das regras: [DECISÃO]/[HIPÓTESE]/[EM ABERTO]
- Ator e gatilho · Pré-condições · Pós-condições
- US/AC cobertos: US-xx AC1..n
- Telas envolvidas: TL-xx → TL-yy
## Diagrama (Mermaid flowchart, com decisões e todos os ramos de erro)
## Passos (tabela: nº | ação do usuário | resposta do app | tela | dado/serviço)
## Caminho feliz
## Caminhos alternativos
## Erros e exceções (campo inválido, sem rede, timeout, sem serviço no horário, permissão negada, fora do município)
## Regras de negócio e privacidade aplicáveis (DT-xx, RNF-xx)
```

Fluxos mínimos (ajustar após a Fase 1):

| ID | Fluxo | Origem |
|---|---|---|
| FL-01 | Visão geral da jornada: Planejar → Analisar → Comparar → Decidir → Revisar | `docs/03` §4 |
| FL-02 | Cadastro com aviso de privacidade (minuta acadêmica) | US-01 |
| FL-03 | Login e sessão (com e sem sessão) | US-02 |
| FL-04 | Planejar ida: origem, destino, horário, validações | US-06 |
| FL-05 | Escolha de ponto (GPS, mapa, locais salvos) conforme 2.3-C | US-05, US-06 |
| FL-06 | Alternativas multimodais (1, 2 ou mais; sem serviço) | US-08 |
| FL-07 | Comparação: árvore de decisão dos estados do resultado | US-10 a US-13 |
| FL-08 | Planejar volta (inversão e novo horário) | US-07 |
| FL-09 | "Sobre os dados", fontes e atribuições | US-14, US-16 |
| FL-10 | Detalhes de ocorrências por categoria | US-15 |
| FL-11 | Histórico local: ligar, usar, apagar | US-04 |
| FL-12 | Excluir conta | US-03 |
| FL-13 | Erros globais e offline | RNF |
| FL-14 | Passo a passo, se 2.3-E for aprovado | US-09 |

O FL-07 é o mais importante: um diagrama que cubra **todas** as linhas da matriz de estados (seção 4.4) e leve cada uma a uma variante da tela de comparação.

### 4.3 Especificação de cada tela (`04_telas/TL-nn_nome.md`)

Cada tela com este template completo:

```
# TL-nn · Nome da tela
- Status: rascunho | pronta   · Rota Expo Router prevista: /(grupo)/nome
- Objetivo da tela e momento da jornada
- US/AC e funcionalidades cobertas · RNF aplicáveis
- Entradas (de onde chega, parâmetros) e saídas (para onde vai, o que leva)
## Wireframe (ASCII, tamanho de celular, uma versão por estado relevante)
## Estrutura e componentes (de cima para baixo, com componente da biblioteca e variante)
## Conteúdo e dados (campo → origem → formato; remeter a 09_dados_por_tela.md)
## Ações do usuário (gesto/toque → resultado → próxima tela)
## Estados: inicial | carregando | vazio | sucesso | erro | sem rede | permissão negada | (variantes do resultado)
## Validações e mensagens de erro (por campo)
## Textos (chaves de microcopy, remeter a 08_microcopy.md)
## Acessibilidade (ordem de foco, rótulos, alvo de toque, contraste, leitor de tela, texto escalável)
## Privacidade e linguagem (o que NÃO pode aparecer nesta tela)
## Critérios de pronto da tela (AC verificáveis)
```

Inventário inicial proposto (`[HIPÓTESE]`, ~12 telas, a validar):
1. Abertura · 2. Criar conta · 3. Entrar · 4. Planejar (origem, destino, horário, ida/volta) · 5. Escolher ponto no mapa (se 2.3-C adotar) · 6. Buscando/sem serviço/fora da área · 7. Alternativas · 8. Comparação (com variantes de estado) · 9. Passo a passo (opcional) · 10. Sobre os dados e fontes · 11. Dados considerados / detalhes por categoria · 12. Configurações (histórico local, excluir conta, aviso de privacidade).

### 4.4 Matriz de estados do resultado (fechar em 2.3-B)

| Situação (regra) | Texto proposto no backlog | Mostra N, D, L? | Destaca? |
|---|---|---|---|
| Cobertura ≥80%, dif. ≤10 p.p., N_X+N_Y ≥10, N e D menores em X, p<0,05 nas 3 larguras | "Menor exposição estimada entre as alternativas avaliadas" | sim | sim, só X |
| N menor em X e D menor em Y | "Indicadores mistos; não há conclusão por ocorrências registradas" | sim | não |
| p ≥ 0,05 em alguma largura | "Sem diferença clara entre os registros" | sim | não |
| Favorecida muda com a largura | `[EM ABERTO]` (backend: dados insuficientes) | a definir | não |
| N_X+N_Y <10, cobertura <80% ou dif. >10 p.p. | "Dados insuficientes" + motivo | motivo, sem ranking | não |
| Uma só alternativa | sem comparação (US-08 AC4) | não | não |
| Sem trecho a pé (L=0) | "não aplicável" (US-10 AC5) | D não aplicável | não |

Cada linha vira uma variante desenhada da tela de comparação, com mockup.

### 4.5 Design das telas (em níveis, do obrigatório ao desejável)

1. **Obrigatório, wireframes ASCII** dentro de cada `TL-nn`, um por estado.
2. **Obrigatório, tokens e componentes** (`07_design/tokens.md`, `componentes.md`): cores com contraste verificado, tipografia, espaçamento, alvo de toque mínimo, ícones, e a biblioteca (campo de ponto, seletor de horário, card de alternativa, selo de estado do resultado, bloco "Sobre os dados", botão, aviso, estado vazio). Usar a logo final e a paleta de `design/`. Regras de design deste produto: comparativo e com confiança separada; **sem semáforo, sem nota, sem escala de gravidade, sem verde/vermelho de "seguro/perigoso"**; a cor nunca carrega sozinha o significado do estado.
3. **Desejável, mockups visuais** em `07_design/mockups/`: HTML/CSS estático usando os tokens, uma página `index.html` com todas as telas lado a lado em moldura de celular, abrível por duplo clique. Inclui todas as variantes do resultado. Dados de exemplo com aviso (RNF-08). Servem de referência visual, não de código do app.
4. **Opcional, protótipo clicável** do fluxo principal em HTML usando fixtures, só se sobrar tempo e depois de os itens 1 a 3 estarem prontos.

### 4.6 Fases e prompts da Frente 1

Cada fase termina com um **portão**. Se exigir resposta do Lucas, parar e perguntar; não seguir com suposição.

**Fase 0: Ler e confirmar (30 min).** Ler `AGENTS.md`, `TODO.md`, `docs/01` a `10`, `src/mobile-app/README.md`, controllers e DTOs de `src/csharp-backend/`, `design/ledger.jsonl`. Saída: resumo de 15 linhas e confirmação/refutação de 2.3 (A a G) com arquivo e linha. **Portão:** Lucas responde B, C, D, E, F, G; resposta registrada em `01_decisoes.md`.

**Fase 1: Story map e fluxos.**
> Com `docs/10` como única fonte de funcionalidades, crie `docs/app-map/02_story_map.md` e os fluxos em `03_fluxogramas/` usando o template 4.2, com diagramas Mermaid que cubram caminho feliz, alternativos e todos os erros. Cada fluxo cita as US/AC que implementa. Não crie funcionalidade fora do backlog; lacunas vão para `12_pendencias_e_lacunas.md`. Respeite `docs/05`.

Portão: todo AC marcado MVP aparece em pelo menos um fluxo; todos os diagramas Mermaid renderizam sem erro de sintaxe (validar com `mermaid-cli`, se disponível, ou conferir a sintaxe).

**Fase 2: Telas, navegação e funcionalidades.**
> A partir dos fluxos, crie uma especificação por tela em `04_telas/` (template 4.3), `05_navegacao.md`, `06_funcionalidades.md` e `09_dados_por_tela.md`. Cada estado de cada tela tem wireframe ASCII. Nenhum marcador de ocorrência individual, nenhum rótulo de bairro, bloco "Sobre os dados" sempre junto da comparação.

Portão: toda tela com todos os estados e com `status: pronta`; cada variante do resultado (4.4) tem tela; cada campo exibido tem origem em `09`.

**Fase 3: Design e textos.**
> Crie `07_design/` (tokens, componentes, acessibilidade, mockups HTML) e `08_microcopy.md`, e rode a varredura de termos proibidos de `docs/05` em tudo o que está em `docs/app-map/`.

Portão: varredura sem ocorrências; mockups cobrem todas as telas e variantes.

**Fase 4: Fechamento.** `10_rastreabilidade.md`, `11_roteiro_demo.md`, `00_LEIA-ME.md`; atualizar `docs/10` (v1.2, IDs novos, histórico), `docs/06`, `TODO.md` (T07) e `prompts.md`. Portão: lista de verificação da seção 8.

---

## 5. FRENTE 2: Construção (`src/mobile-app/`)

### 5.1 O que fazer antes de os fluxos estarem prontos (sexta e sábado)
- Projeto Expo + TypeScript + Expo Router, estrutura de pastas, lint, testes.
- Camada `services/` com interface única e **modo `mock|api`** por `EXPO_PUBLIC_API_MODE`; fixtures para cada estado do resultado, com aviso de exemplo.
- Banco local (SQLite) e armazenamento de sessão.
- **Contrato da API extraído dos controllers reais** (rotas, DTOs, erros, exemplos). Hoje existe `POST /api/comparacoes/trajetos`. Confirmar se a API já devolve o bloco "Sobre os dados" pronto (o README do backend diz que sim). **O app não recalcula estatística: exibe o que a API devolve.** Divergência entre o backlog e a API vai para `12_pendencias_e_lacunas.md`.
- Documentar em `src/mobile-app/ARQUITETURA.md` (vai junto ao espelho): estrutura de pastas, camada de serviços, contrato, modelo do banco local, tratamento de erro/timeout, estratégia de testes, como rodar.
- Deixar o app rodando no celular com navegação vazia.

### 5.2 Tecnologia recomendada (verificar versões na documentação atual do Expo)

| Necessidade | Recomendação | Observação |
|---|---|---|
| Base | Expo + TypeScript + Expo Router (`DT-11`) | Rodar no Expo Go; evitar módulos que exijam build próprio |
| Banco local (rubrica) | `expo-sqlite` | Histórico opcional (`US-04`) e cache; nada de coordenadas no servidor |
| Sessão | `expo-secure-store` | Token/identificador |
| Localização | `expo-location`, só em primeiro plano e sob demanda (`US-05`) | Sem leitura em segundo plano |
| Mapa | `react-native-maps` (compatível com Expo Go) | Sem pins de ocorrência; atribuição "© OpenStreetMap contributors" (`US-16`) |
| API | `fetch` + camada de serviços | Modo mock garante demo sem OTP2 ativo |
| Estado | React state/context | Biblioteca extra só se necessário |
| Formulários | `react-hook-form` + `zod` (opcional) | Erros por campo (`US-01`, `US-06`) |
| Testes | `jest-expo` + React Native Testing Library; lint de acessibilidade | Um teste que varre as strings do app contra termos proibidos |
| Rede em dev | Backend em `localhost` não é acessível do celular | IP da máquina na rede local; emulador Android `10.0.2.2` |

### 5.3 Construção por fatias verticais (depois de as telas estarem `pronta`)
Cada fatia entrega uma jornada funcionando de ponta a ponta, com as telas conforme `docs/app-map/04_telas/`, e termina com os critérios de pronto da tela cumpridos.

1. **Fatia 1:** entrar/criar conta → planejar → alternativas (com mock).
2. **Fatia 2:** comparação com todas as variantes do resultado + "Sobre os dados" + detalhes de ocorrências + fontes.
3. **Fatia 3:** histórico local (SQLite), configurações, excluir conta, GPS/escolha de ponto, ida e volta; integração com a API real.
4. **Fatia 4:** acessibilidade, varredura de termos, testes, README (Ficha copiada no corpo, instruções, prints, link do vídeo de 3 min).

Prompt-base da Frente 2:
> Implemente a fatia N do app em `src/mobile-app/` seguindo exatamente as especificações `status: pronta` em `docs/app-map/04_telas/`, os componentes de `07_design/` e os textos de `08_microcopy.md`. Não implemente tela sem especificação pronta. Se encontrar divergência ou inviabilidade, anexe a `12_pendencias_e_lacunas.md` e siga no que não depende dela. Rode lint e testes antes de encerrar.

---

## 6. Cronograma e rubrica

Rubrica de Mobile (`docs/02` §5): telas e navegação, consumo de dados, banco de dados, acessibilidade, aderência ao problema, documentação. Entregáveis: repositório, README com Ficha copiada no corpo + instruções + prints, vídeo de até 3 min.

| Dia | Frente 1 | Frente 2 |
|---|---|---|
| Sex 13/11 | Fase 0 (decisões) e Fase 1 | Esqueleto, serviços mock, contrato da API |
| Sáb 14/11 | Fases 2 e 3 (essencial: telas centrais e variantes do resultado); fecha à noite | Banco local, `ARQUITETURA.md`, app vazio rodando no celular |
| Dom 15/11 | Ajustes por pendência; Fase 4 | Fatia 1 |
| Seg 16/11 | Pendências | Fatia 2 |
| Ter 17/11 | Pendências | Fatia 3 (integração com API real) |
| Qua 18/11 | Roteiro de demo final | Fatia 4; **congelar código à noite** |
| Qui 19/11 | (encerrada) | Prints, README, vídeo, envio com folga antes de 23h55 |

Se a Frente 1 atrasar além de sábado, **cortar escopo dela, não da construção**: mantenha wireframes ASCII, tokens, componentes e textos das telas centrais; deixe mockups HTML e protótipo clicável para depois.

Mapa da rubrica: telas e navegação (`04_telas`, `05_navegacao`), consumo de dados (`09_dados_por_tela`, fatias 1 a 3), banco (SQLite), acessibilidade (`07_design/acessibilidade` + Fatia 4), aderência (`10_rastreabilidade`), documentação (README + prints + `ARQUITETURA.md`).

---

## 7. Do monorepo para o repositório do app (espelho)

`D:\...\volta-segura\mobile-app` é espelho de entrega. `scripts/sync_mirrors.sh`: copia `docs/NN_*.md` (só arquivos numerados na raiz de `docs/`) e `.gitignore`; replica `src/mobile-app/` com `rsync --delete` em `src/mobile-app/` do espelho; **regenera o `README.md`** da raiz (Ficha + `src/mobile-app/README.md`); não toca em `AGENTS.md` e `prompts.md`; faz `git push`. A fonte da verdade é sempre o monorepo.

- **Construir em `src/mobile-app/`** (projeto Expo na raiz dessa pasta) e sincronizar no fim: `DRY_RUN=1 bash scripts/sync_mirrors.sh mobile-app` e, se estiver certo, sem `DRY_RUN`.
- **A pasta `docs/app-map/` é subpasta e o script atual não a copia.** Perguntar ao Lucas: (a) acrescentar uma linha `rsync` ao script para copiar `docs/app-map/` ao espelho (recomendado, se o Claude Code do espelho precisar dela); ou (b) deixar a pasta só no monorepo e referenciá-la no README do app. Não editar o script sem a resposta.
- Documentação do app deve ficar em `src/mobile-app/README.md` e `ARQUITETURA.md` (o README da raiz do espelho é regenerado).
- Fazer um **`DRY_RUN` já no sábado**, com o esqueleto, para descobrir cedo qualquer problema de acesso ao espelho; a sincronização final fica para a quarta à noite ou quinta.

---

## 8. Definição de pronto

**Frente 1**
- [ ] Todo AC MVP do backlog → fluxo → tela, sem órfãos (`10_rastreabilidade.md`).
- [ ] Estados do resultado e frases fixas decididos e iguais em app, API e `docs/08`.
- [ ] Cada tela com especificação completa, todos os estados com wireframe, `status: pronta`.
- [ ] Todos os diagramas Mermaid renderizam.
- [ ] Varredura de termos proibidos (`docs/05`) limpa em `docs/app-map/`.
- [ ] Nenhuma tela com pin de ocorrência, rótulo de bairro, nota, escala ou semáforo de segurança; nenhum texto afirma conformidade com a LGPD (RNF-09).
- [ ] Itens novos com ID novo e status; `docs/10`, `docs/06`, `TODO.md`, `prompts.md` atualizados.
- [ ] Roteiro do vídeo de 3 min e lista de prints.

**Frente 2**
- [ ] App roda no celular; navegação e telas conforme as especificações.
- [ ] Consome a API real e tem modo mock com fixtures rotuladas como exemplo.
- [ ] Banco local em uso (histórico opcional, apagável).
- [ ] Acessibilidade verificada (rótulos, contraste, alvo de toque, texto escalável).
- [ ] Varredura de termos proibidos nas strings do app; testes passando.
- [ ] README com Ficha copiada no corpo, instruções, prints e link do vídeo; `ARQUITETURA.md`.
- [ ] Sincronização com o espelho conferida (`DRY_RUN` e real).
