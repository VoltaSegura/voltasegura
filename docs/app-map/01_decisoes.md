# Decisões do mapeamento do app

Decisões tomadas por Lucas Simidu na Fase 0 do plano (`docs/plano_app.md` §2.3), em 13/11/2026. Cada uma tem a opção escolhida, o que muda e onde foi refletida. Não apagar decisões antigas: se uma mudar, acrescentar uma linha nova e marcar a anterior como revista.

| ID | Tema (achado do plano) | Decisão | Status |
|---|---|---|---|
| D-00 | Escopo do mapeamento | A base são **só os documentos** (`docs/01` a `10`, `TODO.md`, `design/`). Código de C#, SOA e de outras disciplinas não é lido nem alterado neste plano. Onde o app depender de backend, `docs/app-map/` descreve só o **contrato esperado** e registra a pendência. | `[DECISÃO — 13/11/2026]` |
| D-01 | Tela de resultado e estados (B) | Ver detalhamento abaixo. | `[DECISÃO — 13/11/2026]` |
| D-02 | Escolha de origem e destino (C) | **Tocar no mapa**, **usar minha localização** (GPS sob demanda, US-05) ou escolher um **local salvo no aparelho** / **ponto de exemplo** da demo (rotulado como exemplo, RNF-08). **Sem busca de endereço** em serviço externo (US-19 AC3). | `[DECISÃO — 13/11/2026]` |
| D-03 | Conta e login (D) | Cadastro, login e exclusão por **endpoints do backend**. O mapeamento descreve o contrato que o app espera (`06_funcionalidades.md`, `09_dados_por_tela.md`); a implementação é pendência do backend, fora deste plano (PL-05). | `[DECISÃO — 13/11/2026]` |
| D-04 | Passo a passo, F2.4 (E) | **Entra no MVP** como lista **só de leitura** dos trechos em ordem, com embarque e desembarque, dentro do container de detalhes da alternativa (D-01). Sem navegação ao vivo. | `[DECISÃO — 13/11/2026]` |
| D-05 | Fora do município, US-06 AC3 (F) | Se origem ou destino estiver fora do município de São Paulo, o app **não envia a consulta** e informa que está **fora da área atendida (município de São Paulo)**. | `[DECISÃO — 13/11/2026]` |
| D-06 | Logo e paleta (G) | Usar a marca **v10** registrada em `TODO.md` T15 e `docs/06` §3: dourado `#FFC53D`, azul-marinho `#0D1B2A`, off-white `#F8F9FA`; ciano `#4ECDC4` como cor funcional de dados e confiança (`docs/06` §3, paleta v7). A aprovação formal do fechamento v8–v10 pelo grupo segue pendente, então o uso no app é provisório. | `[HIPÓTESE]` até a aprovação do grupo (T15) |
| D-07 | Cópia de `docs/app-map/` para o espelho do app (`docs/plano_app.md` §7) | **Decidir depois**, quando o app existir. Por ora a pasta fica só no monorepo (PL-10). | `[DECISÃO — 13/11/2026]` |
| D-08 | Conteúdo do "Por que esta rota?" (PL-01) | No MVP o botão aparece **só nos trechos a pé**, que são os únicos contados pela regra do `docs/08`. Mostra que o trecho entra na conta, a faixa do dia usada, os números da **alternativa inteira** (N, L, D; nunca por trecho), o indicativo curto e o link para "Sobre os dados". Trechos de ônibus, metrô e trem ficam sem o botão. **Revisa o item 4 da D-01** ("cada trecho tem um botão"). | `[DECISÃO — 13/11/2026]` |
| D-09 | "Sobre os dados" sempre visível (PL-02) | **Linha fixa no container**, sempre visível junto da comparação (ex.: "Dados: SSP-SP, jan–set/2026 · Sobre os dados ›"). Ela abre o bloco completo, que também é acessível pelo "Por que esta rota?". Atende ao F4.1 AC1 e ao RNF-04 sem expor a regra. | `[DECISÃO — 13/11/2026]` |
| D-10 | Ordem dos cards e rota inicial no mapa (PL-04) | Cards **sempre ordenados por tempo total**, com o rótulo "ordenadas por tempo"; o mapa abre na primeira e as demais aparecem em traço claro. Com o foco de exposição presente, a ordem não muda: só o rótulo marca a rota. | `[DECISÃO — 13/11/2026]` |
| D-11 | Caso "indicadores mistos" (PL-08) | No app, **mistos e "sem diferença clara" usam o mesmo indicativo** (os registros não mostram diferença clara entre as alternativas). Os números de cada alternativa continuam visíveis no "Por que esta rota?". Nos dois casos não há foco de exposição. | `[DECISÃO — 13/11/2026]` |
| D-12 | Mais de duas alternativas (PL-13) | Ver detalhamento abaixo: **até 3 rotas por consulta, cada uma com um foco**. | `[DECISÃO — 13/11/2026]` |
| D-13 | Alternativa sem trecho a pé, `L = 0` (PL-14) | Quando alguma rota candidata tem `L = 0`, **nenhuma rota recebe o foco de exposição** naquela consulta. Os detalhes explicam que a rota não tem trecho a pé contado, e D aparece como "não aplicável" (US-10 AC5, RNF-03). | `[DECISÃO — 13/11/2026]` |
| D-15 | Candidatas aos focos (PL-16) | Entram como candidatas **até 5 alternativas** devolvidas pelo roteamento para a consulta. Os focos e a regra de exposição ("vencer cada uma das outras") consideram as 5; só as vencedoras de algum foco são exibidas (no máximo 3). | `[DECISÃO — 13/11/2026]` |
| D-16 | Consulta com uma rota só (PL-17) | Se, havendo duas ou mais candidatas, os focos resultarem numa rota só, o app mostra também a **segunda rota mais rápida**, sem rótulo de foco, marcada como **"outra opção"**. Assim a usuária sempre tem com o que comparar quando existe mais de uma alternativa. | `[DECISÃO — 13/11/2026]` |
| D-17 | Aprovação da Fase 2 | Lucas aprovou as especificações TL-01 a TL-13, a navegação, o catálogo de funcionalidades e os dados por tela. Status passa a `pronta`, e a Frente 2 pode implementar. O contrato da API continua `[HIPÓTESE]` até a conciliação com o backend (PL-18). | `[DECISÃO — 13/11/2026]` |
| D-18 | Validação da arquitetura e escopo da Fase 4 | Lucas validou o mapeamento das Fases 0 a 3 (decisões, story map, fluxos, telas, design e textos) como base do app. Quer **rever alguns pontos de design** depois (PL-19). O **roteiro do vídeo** (`11_roteiro_demo.md`) fica **adiado**; a Fase 4 fecha só com a rastreabilidade e o fechamento. | `[DECISÃO — 13/11/2026]` |
| D-14 | Totais de Furto, Roubo e Trânsito (PL-15) | Totais **por alternativa**, na mesma área de N (corredor de ±100 m dos trechos a pé), na tela **"Dados considerados"**, aberta pelo "Por que esta rota?" e por "Sobre os dados". A tela principal fica sem números de ocorrência. Ajusta a redação do US-15 AC1. | `[DECISÃO — 13/11/2026]` |

## D-01 — Tela de resultado (detalhamento)

Opção escolhida: **"Destaque + Por que esta rota?"**, com o desenho descrito por Lucas:

1. O app lista as **alternativas de trajeto** com tempo total, caminhada, transporte público (modos e linhas), horários previstos e baldeações (US-08 AC1).
2. Um **mapa mostra o trajeto inteiro** da alternativa selecionada, do início ao fim, no estilo da primeira tela de escolha de rotas de apps de mobilidade (ex.: Uber, Google Maps).
3. Embaixo do mapa fica um **container de detalhes**. Nele, a alternativa aparece **dividida por trechos** (ex.: rua → metrô → rua → ônibus → casa), o que também atende ao passo a passo (D-04).
4. Cada trecho tem um botão **"Por que esta rota?"**. É **lá** que aparecem os motivos e os dados usados (fonte, período, cobertura, o que foi contado).
5. As frases de situação do `docs/08` ("Dados suficientes para comparar", "Sem diferença clara entre os registros", "Dados insuficientes" + motivo) **não aparecem na tela principal**, porque expõem a lógica. Um indicativo curto, inspirado nelas e sem detalhar a regra, pode aparecer **dentro** do "Por que esta rota?".
6. Só quando a regra do `docs/08` conclui é que uma alternativa recebe o destaque **"menor exposição estimada entre as alternativas avaliadas"** (`docs/05`). Sem conclusão, nenhuma alternativa é destacada.
7. **O app não escolhe pela usuária** (`docs/08:49`, US-11 AC5): todas as alternativas ficam disponíveis, e a decisão é dela.

**Por que esta opção:** atende ao pedido de não expor a lógica na tela principal sem contrariar as regras de prioridade máxima (`docs/05`: exposição e confiança separadas, "dados insuficientes" como saída válida; `docs/08:49`: o app não escolhe a rota).

**Ficou em aberto e foi para `12_pendencias_e_lacunas.md`:** o conteúdo do "Por que esta rota?" por trecho (PL-01); como fica a exigência de "Sobre os dados" sempre visível (PL-02); qual alternativa o mapa mostra primeiro (PL-04).

**Reflexo no backlog:** `docs/10` v1.2 (F2.1 AC3, F2.4, F3.4 AC5–AC6, seção 10).

**Revisões posteriores (13/11/2026):** o item 4 foi revisto pela D-08 (botão só nos trechos a pé). As pendências PL-01, PL-02, PL-04 e PL-08 foram fechadas pelas D-08 a D-11.

## D-12 — Rotas com foco (detalhamento)

Pedido do Lucas: no máximo 3 rotas, cada uma com o seu foco destacado. Se duas rotas tiverem o mesmo motivo, aparece só a melhor naquele motivo.

1. **Até 3 rotas por consulta.** Cada rota exibida é a melhor das alternativas candidatas em pelo menos um **foco**:
   - **Menor tempo total**: a de menor duração total (US-08 AC1).
   - **Menos caminhada**: a de menos km a pé (US-08 AC1).
   - **Menor exposição estimada entre as alternativas avaliadas**: só quando a regra conclui (item 3).
2. **Rótulo do foco de exposição:** "Menor exposição estimada entre as alternativas avaliadas", o mesmo texto do selo, aprovado no `docs/05`. No card, pode ser abreviado para "Menor exposição estimada". **"Por segurança" é proibido** (regra de ouro do `docs/05`).
3. **Regra com três ou mais candidatas:** uma rota só recebe o foco de exposição se **passar na regra do `docs/08` contra cada uma das outras**, ou seja, se todas as comparações em par saírem a favor dela. Basta um par não concluir para o foco não aparecer.
4. **Mesma rota em dois focos:** aparece **uma vez, com os dois rótulos** (ex.: "Menor tempo · Menos caminhada"). A consulta pode acabar com menos de 3 rotas.
5. **Ordem:** por tempo total, com o rótulo "ordenadas por tempo" (D-10).
6. **O app continua sem escolher pela usuária** e sem misturar tempo e registros numa nota (US-11 AC5): cada foco é um critério separado e explícito.

**Consequência a observar:** como o foco de exposição é raro, a maioria das consultas vai mostrar duas rotas (menor tempo e menos caminhada, ou a vencedora dos dois focos + "outra opção"). As candidatas são até 5 (D-15); a consulta nunca fica com uma rota só quando há mais de uma candidata (D-16).

**Reflexo:** `docs/08` (regra para três ou mais candidatas, `L = 0`, mistos) e `docs/10` v1.3 (F2.3 AC5, F3.2 AC6, F4.1, F4.2 AC1).
