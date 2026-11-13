# Mapeamento do app VoltaSegura (`docs/app-map/`)

Esta pasta transforma o backlog (`docs/10_backlog_produto.md`, v1.6) em fluxos, telas, funcionalidades e design do app mobile. Ela é a **Frente 1** do plano `docs/plano_app.md`. A **Frente 2**, que é a construção do app, fica em `src/mobile-app/` e implementa as telas com `status: pronta`.

**Situação em 13/11/2026:** Frente 1 **fechada** (Fases 0 a 4), validada por Lucas Simidu (D-17, D-18). Seguem duas ressalvas:
- uma rodada de **revisão de design** (PL-19);
- o **roteiro do vídeo**, adiado por decisão do Lucas.

**Acréscimo de 13/11/2026:** **compartilhar trajeto e localização ao vivo** (D-19 a D-22). É feature nativa e gratuita, marcada **"Depende do tempo"**: entra no MVP se o prazo permitir. Ela gerou FL-15, FL-16, TL-14, TL-15, FN-15, FN-16 e a US-21. As telas novas aguardam revisão do Lucas.

## Regras desta pasta

- **Fonte única de funcionalidades:** `docs/10`. Nada é inventado aqui: tudo o que o backlog não cobre vai para `12_pendencias_e_lacunas.md`.
- **Prioridade:** `docs/05` > `docs/01` > `docs/03` > `docs/04` (`AGENTS.md`).
- **Status de toda afirmação nova:** `[DECISÃO]` só com decisão do Lucas (registrada em `01_decisoes.md`); propostas do assistente entram como `[HIPÓTESE]` ou `[EM ABERTO]`.
- **Escopo (D-00):** só documentos. Código de C#, SOA e de outras disciplinas não é usado como fonte.
- **IDs estáveis:** fluxos `FL-nn`, telas `TL-nn`, funcionalidades `FN-nn`, decisões `D-nn`, pendências `PL-nn`, testes `T-xx.y`. Não renumerar.
- **Mudanças depois do fechamento:** registrar a decisão em `01_decisoes.md`, refletir em `docs/10` e na tela afetada, e rodar de novo as checagens (diagramas, varredura, cobertura).

## Como ler

1. `01_decisoes.md`: o que o Lucas decidiu (D-00 a D-22). **Comece por aqui.**
2. `02_story_map.md`: a jornada da Ágatha em atividades, passos e tarefas.
3. `03_fluxogramas/`: 16 fluxos com diagrama Mermaid, caminho feliz, alternativos e erros.
4. `04_telas/`: 15 especificações de tela com wireframes por estado.
5. `05_navegacao.md`, `06_funcionalidades.md` (com o contrato esperado da API) e `09_dados_por_tela.md`.
6. `07_design/` (tokens, componentes, acessibilidade, **`mockups/index.html`**, que abre com duplo clique) e `08_microcopy.md`.
7. `10_rastreabilidade.md`: AC → fluxo → tela → teste. É a base dos Test Cases da QA (T10).
8. `12_pendencias_e_lacunas.md`: o que ainda precisa de resposta.

## Legenda de status dos arquivos

`rascunho` (em elaboração) · `pronta` (revisada, a Frente 2 pode implementar) · `validada` (aprovada como base, com revisão pendente) · `adiado` (fora desta etapa por decisão)

## Estado de cada arquivo

| Arquivo | Fase | Status |
|---|---|---|
| `00_LEIA-ME.md` | 4 | pronta |
| `01_decisoes.md` | 0 | pronta (D-00 a D-22) |
| `02_story_map.md` | 1 | validada (D-18) |
| `03_fluxogramas/` (FL-01 a FL-16) | 1 | FL-01 a FL-14 validados (D-18); FL-15 e FL-16 novos, aguardando revisão |
| `04_telas/` (TL-01 a TL-15) | 2 | TL-01 a TL-13 pronta (D-17; TL-08 e TL-13 com acréscimos do compartilhamento); TL-14 e TL-15 rascunho |
| `05_navegacao.md` | 2 | pronta (D-17) |
| `06_funcionalidades.md` (FN-01 a FN-16, com o contrato esperado da API) | 2 | pronta (D-17); contrato a conciliar (PL-18) |
| `07_design/` (tokens, componentes, acessibilidade, `mockups/index.html` com 32 telas) | 3 | validada (D-18); pontos de design a rever (PL-19) |
| `08_microcopy.md` (catálogo + varredura: 0 termos proibidos em 894 linhas) | 3 | validada (D-18) |
| `09_dados_por_tela.md` | 2 | pronta (D-17) |
| `10_rastreabilidade.md` (86 AC + 9 RNF) | 4 | pronta |
| `11_roteiro_demo.md` | 4 | **adiado** (D-18), arquivo não criado |
| `12_pendencias_e_lacunas.md` | contínuo | 15 abertas, 9 resolvidas (PL-01 a PL-24) |

## Definição de pronto da Frente 1 (`docs/plano_app.md` §8)

| Item | Situação | Evidência |
|---|---|---|
| Todo AC MVP do backlog → fluxo → tela, sem órfãos | ✅ | `10_rastreabilidade.md`: 86/86 AC por script; 74 AC com tela verificados nas especificações |
| Estados do resultado e frases fixas decididos e iguais em app, API e `docs/08` | ✅ app e `docs/08` · ⏳ API | Casos e indicativos em FN-10 e `08_microcopy.md`; `docs/08` anotado (D-11 a D-13, D-15); API real a conciliar (PL-18) |
| Cada tela com especificação completa, todos os estados com wireframe, `status: pronta` | ✅ | `04_telas/` (D-17); seções do template conferidas por script |
| Todos os diagramas Mermaid renderizam | ✅ | 21 blocos validados com o parser do mermaid 10.9.1 |
| Varredura de termos proibidos (`docs/05`) limpa em `docs/app-map/` | ✅ | 0 ocorrências em 894 linhas de texto de tela + mockups; termos só aparecem nas regras que os proíbem |
| Nenhuma tela com pin de ocorrência, rótulo de bairro, nota, escala ou semáforo; nenhum texto afirma conformidade com a LGPD | ✅ | Regras em cada tela, em `componentes.md` (proibições) e na varredura |
| Itens novos com ID novo e status; `docs/10`, `docs/06`, `TODO.md`, `prompts.md` atualizados | ✅ | `docs/10` v1.6, `docs/06` até 1.41, `TODO.md` T07, `prompts.md` |
| Roteiro do vídeo de 3 min e lista de prints | ⏸ adiado | D-18 |

## O que a Frente 2 pode começar já

- **Infraestrutura:** projeto Expo + TypeScript + Expo Router com a árvore de `05_navegacao.md`, camada de serviços no modo `mock|api` com as fixtures da FN-07, banco local da FN-13 e textos de `08_microcopy.md`.
- **Telas:** todas as 13 estão `pronta`. Recomendação: fazer a revisão de design (PL-19) antes de estilizar, para não refazer a parte visual.
- **Integração com a API real:** depende da conciliação do contrato (PL-18).
- **Compartilhamento (Depende do tempo):** construir por último. Antes, conferir o GPS em segundo plano no Expo Go (PL-24); se o prazo apertar, cancela sem afetar o resto (D-22).
