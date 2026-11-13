---
titulo: Regra inicial de comparação de trajetos — MVP
projeto: VoltaSegura
atualizado: 2026-11-13
tipo: decisao-metodologica
fonte: "Decisão do grupo em 11/11/2026; docs/03, docs/05, docs/07 e catálogo SSP-SP 2026"
---

# Regra inicial de comparação de trajetos

> `[DECISÃO]` Esta é a **conta escolhida para o MVP**, não uma estimativa validada da probabilidade de sofrer um crime. A aplicação só deve destacar uma alternativa após testar cobertura, precisão espacial, comparabilidade e proteção contra reidentificação. A abrangência planejada é todo o município de São Paulo; uma consulta pode retornar “dados insuficientes”.

## Entradas iguais para as alternativas

1. `[DECISÃO]` Comparar alternativas para a **mesma origem, destino e horário pretendido**. O histórico de cada alternativa usa o mesmo período de datas de ocorrência, a mesma classe de dia e a mesma faixa horária. A faixa e a duração histórica serão fixadas após examinar disponibilidade e estabilidade dos dados.
   - `[DECISÃO — 11/11/2026, após auditoria]` **Faixa do dia = um dos quatro períodos da SSP**: madrugada 0–5h, manhã 6–11h, tarde 12–17h e noite 18–23h. O período vem da hora do boletim quando ela existe e, caso contrário, do campo `DESC_PERIODO`. As duas fontes coincidem em 100% das 16.077 linhas que têm ambas, e juntas cobrem 99,1% do recorte. Boletins "Em hora incerta" ou sem período ficam fora da conta e reduzem a cobertura informada. O trecho a pé é associado ao período em que será percorrido. Faixas mais finas que o período não são usadas: 32% das horas exatas são horas cheias, o que indica horário aproximado.
   - `[DECISÃO — 11/11/2026]` **Período histórico = os 12 meses mais recentes**, pela data da ocorrência (`DATA_OCORRENCIA_BO`). Isso cobre um ciclo sazonal completo sem usar dados antigos. Enquanto só houver a base de 2026, o MVP usa jan–set/2026 (9 meses) e informa isso na tela. Ocorrências anteriores à janela ficam fora. O mês mais recente está incompleto por causa de registros tardios, mas isso afeta igualmente as alternativas comparadas. Para completar os 12 meses, é preciso baixar e auditar `SPDadosCriminais_2025`.
   - `[DECISÃO — 11/11/2026]` **Sem separação por classe de dia**: dias úteis e fins de semana entram juntos, para não fragmentar uma amostra já pequena (ver auditoria §6).
2. `[DECISÃO]` Considerar somente os **trechos caminhados** nesta primeira conta criminal. Viagem dentro de ônibus, metrô ou trem, trânsito e infraestrutura urbana são dimensões separadas. O usuário vê tempo total, tempo/distância de caminhada e conexões separadamente; esta conta não mistura essas medidas com ocorrências.
3. `[DECISÃO]` Incluir apenas registros com `NATUREZA_APURADA` igual a `FURTO - OUTROS` ou `ROUBO - OUTROS`, conforme [`07_classificacao_ssp_app.md`](07_classificacao_ssp_app.md). Cada linha elegível entra no máximo uma vez por alternativa, mesmo quando corredores se sobrepõem. Antes da implementação, verificar se linhas diferentes representam o mesmo boletim/ocorrência e estabelecer deduplicação documentada. Usar data e hora da **ocorrência**, não o mês de publicação/estatística, para o recorte temporal. Registros sem hora utilizável não são atribuídos artificialmente ao período noturno; sua falta reduz a cobertura informada.
4. `[DECISÃO]` Definir em torno de cada trecho caminhado um corredor espacial de largura **igual para todas as alternativas** e compatível com a precisão real da geocodificação. Contar uma única vez cada registro elegível dentro da união dos corredores de uma alternativa. Um ponto geocodificado próximo não prova que o fato ocorreu naquela rua. A largura só será fixada depois da auditoria espacial.
   - `[DECISÃO — 11/11/2026, após auditoria]` **Corredor padrão de ±100 m** para cada lado do trecho a pé, cerca de um quarteirão. **Teste de sensibilidade obrigatório com ±50 m e ±150 m**: se a alternativa destacada mudar com qualquer dessas larguras, nenhuma é destacada. Base da escolha (1 km à noite, 9 meses): ±50 m deixa 61% dos trechos com menos de 5 boletins; ±250 m sobrepõe ruas paralelas e reduz a diferença entre rotas; ±100 m tem mediana de 7 boletins e 38% abaixo de 5.

## Conta por alternativa

Para cada rota `r`:

- `N_r` = número de registros elegíveis contados uma vez por alternativa, no mesmo período/faixa horária, dentro da união dos corredores dos trechos caminhados de `r`, após a verificação de duplicatas da fonte.
- `L_r` = soma das distâncias caminhadas de `r`, em quilômetros.
- `D_r = N_r / L_r` = **concentração histórica de registros por quilômetro caminhado**, quando `L_r > 0`.

`[DECISÃO]` Exibir `N_r`, `D_r`, `L_r`, o período/unidade espacial e a qualidade dos dados como informações **descritivas**, sem chamar `D_r` de probabilidade individual ou taxa de vitimização. Se `L_r = 0`, este indicador de caminhada é “não aplicável”, não zero. Totais de Furto/Roubo mostrados no catálogo incluem outras naturezas informativas e **não** substituem `N_r` nesta conta.

### Exemplo explicado (números fictícios, apenas ilustrativos)

> Os valores abaixo **não** vêm de trajetos calculados: servem só para mostrar a conta.

1. Para a mesma origem, destino e horário, o roteamento gera duas alternativas. **X**: 600 m a pé até o ponto, ônibus, 300 m a pé até a casa (`L_X = 0,9 km`). **Y**: 1,2 km a pé até o metrô, metrô, 200 m a pé (`L_Y = 1,4 km`).
2. Somente os trechos a pé entram na conta; o tempo dentro do ônibus/metrô é mostrado em separado.
3. Em volta de cada trecho a pé, traça-se um corredor de largura igual para as duas alternativas.
4. Contam-se os boletins elegíveis dentro da união dos corredores: natureza `FURTO - OUTROS`/`ROUBO - OUTROS`, mesmo período histórico e mesma faixa do dia, cada boletim uma única vez. Resultado hipotético: `N_X = 8`, `N_Y = 21`.
5. `D_X = 8 / 0,9 ≈ 8,9` e `D_Y = 21 / 1,4 = 15` registros por km caminhado.
6. X tem `N` **e** `D` menores, e `N_X + N_Y = 29 ≥ 10`. Falta o teste de diferença: se as taxas por km fossem iguais, X receberia em média `29 × 0,9/2,3 ≈ 11,3` dos 29 boletins. Observar 8 tem probabilidade bilateral de ≈ 0,26, acima de 0,05. **Resultado: "sem diferença clara entre os registros"**, com os números visíveis e sem destaque. Uma diferença dessa ordem ainda é compatível com o acaso. Se `N` favorecesse uma rota e `D` a outra, o app também mostraria os números sem eleger nenhuma.

`N` **não é** probabilidade de vitimização, nota da rua ou contagem de vítimas: é a quantidade de boletins registrados (sujeitos a subnotificação) perto dos trechos a pé, no recorte escolhido.

## Regra de comparação X × Y

`[DECISÃO]` Se **ambas** as alternativas passarem nas verificações de cobertura, qualidade e privacidade, a comparação criminal só aponta X como tendo **menor exposição estimada entre as alternativas avaliadas** quando `N_X < N_Y` **e** `D_X < D_Y`. Para apontar Y, usar a condição simétrica. Sem essa concordância, mostrar os dois números e “indicadores mistos; não há conclusão por ocorrências registradas”. Nenhum peso arbitrário mistura `N_r`, `D_r`, tempo ou outros fatores, e o app não escolhe a rota pelo usuário.

`[DECISÃO]` Zero registro não significa segurança. Mesmo quando as duas desigualdades ocorrerem, a frase comparativa é condicionada à suficiência dos dados e descreve apenas os registros considerados. Sem evidência suficiente ou publicação responsável, retornar “dados insuficientes”, sem atribuir vantagem à ausência de dados.

`[DECISÃO — 13/11/2026, Lucas Simidu]` **Três ou mais alternativas, alternativa sem trecho a pé e indicadores mistos** (mapeamento do app, `docs/app-map/01_decisoes.md` D-11 a D-13):

1. **Três ou mais candidatas:** a regra acima continua sendo aplicada **em pares**. Uma alternativa só é apontada como de **menor exposição estimada entre as alternativas avaliadas** se a comparação em par sair a favor dela **contra cada uma das outras** candidatas. Basta um par não concluir para nenhuma alternativa ser apontada. O app exibe até 3 rotas, cada uma com um foco (menor tempo total, menos caminhada e, só nesse caso, menor exposição estimada), sem misturar critérios numa nota.
2. **Alternativa sem trecho a pé (`L = 0`):** `N = 0` por construção e o teste binomial não se aplica. Quando alguma candidata tem `L = 0`, **nenhuma** alternativa é apontada naquela consulta, e o indicador aparece como "não aplicável" (regra de `L_r = 0` acima). Zero registro não vira vantagem.
3. **Indicadores mistos:** a regra continua tratando "mistos" como caso próprio (sem destaque, com os números). Na tela, mistos e "sem diferença clara entre os registros" usam o **mesmo indicativo**. As frases de situação não aparecem na tela principal do app, só um indicativo curto dentro de "Por que esta rota?" (D-01).

`[DECISÃO — 13/11/2026, Lucas Simidu]` Entram como candidatas **até 5 alternativas** devolvidas pelo roteamento para a consulta (`docs/app-map/01_decisoes.md` D-15). A regra de "vencer cada uma das outras" considera as 5.

## Verificações antes de exibir uma comparação

- `[DECISÃO]` Conferir proporção de registros com coordenadas, data e hora utilizáveis em cada recorte; diferenças importantes de cobertura impedem a comparação.
- `[DECISÃO]` Auditar `DESCR_TIPOLOCAL` e o significado das coordenadas para não atribuir automaticamente a uma caminhada ocorrências registradas em residências, estabelecimentos ou outros ambientes sem relação demonstrada com o percurso. Definir e publicar os tipos de local elegíveis antes do cálculo.
  - `[DECISÃO — 11/11/2026, após auditoria]` **Todos os tipos de local entram em `N`.** Via Pública representa 86,0% do recorte; Terminal/Estação, 4,7%; Residência, 1,7%; Comércio e Serviços, 1,2%. Consequência a comunicar: `N` pode incluir fatos ocorridos fora da via (residências, estabelecimentos, terminais) e não se limita a pedestres, porque a base não identifica a vítima como pedestre. A interface informa que a contagem abrange todos os tipos de local registrados.
- `[DECISÃO]` Auditar a unidade de registro da planilha (`NUM_BO`, `ANO_BO`, delegacia e natureza) antes de interpretar linhas como boletins ou ocorrências únicas; documentar a chave de deduplicação efetivamente válida.
  - `[DECISÃO — 11/11/2026, após auditoria]` **Unidade de `N` = boletim distinto**, identificado por `NUM_BO` + `ANO_BO` + `NOME_DELEGACIA`. Na base 2026 da capital, 42 boletins têm uma linha de `FURTO - OUTROS` e outra de `ROUBO - OUTROS`, com mesma coordenada e hora; cada um conta uma vez. `N` conta boletins, não vítimas. Evidência: [`AUDITORIA_CALIBRACAO_SSP_2026.md`](../src/ml/dados/AUDITORIA_CALIBRACAO_SSP_2026.md) §1.
- `[DECISÃO]` Examinar incerteza de geocodificação e sensibilidade à largura do corredor. Se a ordem das alternativas mudar com escolhas razoáveis de largura/tempo, não destacar nenhuma.
  - `[DECISÃO — 11/11/2026, após auditoria]` **Coordenadas usadas como publicadas**, inclusive os pontos repetidos (29% dos registros caem em pontos repetidos 10 vezes ou mais, como Praça da Luz, Barra Funda e Sé). Não há filtro nem redistribuição. Motivo: descartá-los exigiria presumir imprecisão em toda a base sem como medi-la. Limitação a comunicar: a coordenada pode indicar um ponto de referência do logradouro, e não o local exato do fato. Os 9,1% sem coordenada válida não entram em nenhuma conta espacial e reduzem a cobertura informada.
- `[DECISÃO]` Verificar se a amostra é suficiente para não interpretar flutuação casual como diferença entre rotas; testar estabilidade em períodos e áreas diferentes da cidade. Não transformar uma diferença mínima em conclusão automática.
- `[DECISÃO]` Não enviar ao app/API registros individuais, pontos exatos ou combinações espaciais/temporais que facilitem identificar pessoas. Proteger também origem/destino e consultas do usuário. Exibir apenas resultados agregados aprovados para publicação.
- `[DECISÃO — 11/11/2026, após auditoria]` **Cobertura mínima**: para cada alternativa, calcular a fração de boletins elegíveis com coordenada válida e período, nas circunscrições de delegacia (`NOME_DELEGACIA_CIRCUNSCRICAO`) atravessadas pelos trechos a pé. Exigir **≥ 80% em cada alternativa** e **diferença ≤ 10 pontos percentuais entre elas**; caso contrário, "dados insuficientes". Na base de 2026, a média das 94 circunscrições da capital é 90,6%, e só uma fica abaixo de 80% (65º DP Artur Alvim, 77,6%).
- `[DECISÃO — 11/11/2026]` **Amostra mínima**: se `N_X + N_Y < 10`, o resultado é "dados insuficientes".
- `[DECISÃO — 11/11/2026]` **Diferença mínima — teste estatístico**: com `n = N_X + N_Y ≥ 10`, aplicar o teste binomial exato **bilateral** condicional ao total, que compara duas taxas de Poisson. Sob igualdade de taxas por km, `N_X ~ Binomial(n, L_X / (L_X + L_Y))`. Só destacar uma alternativa se `p < 0,05` **e** ela tiver `N` e `D` menores, **nas três larguras de corredor** (±50, ±100, ±150 m). Se não, mostrar "sem diferença clara entre os registros" com os números. O nível de 5% é convenção estatística, não um valor derivado dos dados. Consequência aceita pelo grupo: destaques serão raros e só aparecerão com diferenças grandes.
- `[EM ABERTO — validação, não parâmetro]` Rodar a regra calibrada em trajetos reais de diferentes regiões, depois que o roteamento existir, para verificar com que frequência cada resultado aparece e como os usuários entendem as mensagens.
- ~~`[EM ABERTO — calibração, não regra da conta]`~~ *(superado em 11/11/2026 pelos parâmetros acima; texto original preservado)* Definir e documentar tipos de local elegíveis, largura do corredor, período histórico, faixas horárias, níveis mínimos de cobertura, amostra e diferença estável com dados reais. A LGPD orienta a proteção de dados pessoais, mas não fornece esses limiares estatísticos. Antes da calibração, a regra permanece especificada, **sem alegação de desempenho validado**.

## Revisão de vieses entre regiões

`[DECISÃO — 11/11/2026]` **No MVP, apenas a checagem de cobertura por região**: percentual de boletins elegíveis com localização e período, por circunscrição de delegacia e por subprefeitura. Ela é feita antes do piloto e a cada atualização da base da SSP-SP e é publicada junto da metodologia. Objetivo: identificar onde o app compara menos, porque regiões com cobertura menor recebem mais "dados insuficientes", o que significa um serviço pior para quem mora nelas. Na base de 2026, a cobertura vai de 77,6% (65º DP Artur Alvim) a 97,9% (auditoria §6.1). Uma diferença encontrada leva a revisão humana, não a ajuste automático de pesos ou limites.

`[EM ABERTO — fase posterior ao MVP, quando houver roteamento em lote]` Checagens propostas e adiadas:

1. **Resultado por região**: rodar a regra em lote em muitos pares de origem e destino (por exemplo, com r5py, `docs/04` §6.3) e medir, por subprefeitura, com que frequência os trechos a pé da região aparecem na alternativa *não* destacada. Uma região evitada de forma consistente indica efeito desproporcional a revisar.
2. **Acesso ao registro**: acompanhar por região a proporção de boletins pela delegacia eletrônica, como indício de subnotificação desigual. Onde registrar é mais difícil, há menos boletins, e a região pode parecer favorável sem ser.

`[EM ABERTO]` Quem assume o papel de **responsável pela metodologia** (executar e publicar a revisão): a indicar pelo grupo. *(Substituído pela decisão de 11/11/2026 abaixo: não haverá responsável humano.)*

~~`[EM ABERTO — proposta em avaliação, 11/11/2026]`~~ *Resolvida em 11/11/2026 pela opção B (decisão abaixo); texto preservado como registro.* **Proposta de Lucas Simidu: automatizar a revisão de vieses.** Origem: Lucas perguntou se não seria possível dispensar a revisão humana ("nós bateríamos nos dados e atualizaríamos os vieses do app a partir dessas atualizações") e pediu a opinião do assistente. Registrado a pedido dele, que estava sem o grupo. **O grupo ainda não avaliou esta proposta: a decisão acima continua valendo até que decida.**

Parecer do assistente sobre a pergunta:

- **O que pode ser automático:** (a) a checagem de cobertura por circunscrição, com um script que mede, a cada atualização da base, a proporção de boletins com coordenada e horário utilizáveis em cada região; (b) a consequência, porque a regra de "dados insuficientes" (cobertura abaixo de 80% ou diferença acima de 10 p.p. entre as rotas) já bloqueia a comparação sozinha, sem aprovação de ninguém; (c) o relatório a cada atualização, no modelo de `src/ml/auditar_calibracao_ssp.py`.
- **O que a automação não resolve:** (1) ela *detecta*, não *corrige* o viés: o efeito prático é bloquear a comparação ("dados insuficientes") naquela região; (2) ela só vê o que foi programado para medir, então uma mudança no formato da SSP, na geocodificação ou um padrão novo pode passar batido ou gerar alarme falso; (3) responsabilidade: os princípios de `docs/03` §6 (itens 3, 4 e 8) falam em avaliar resultados desproporcionais e sinalizar vieses, e um processo sem pessoa responsável tende a não ser feito.
- **Opinião do assistente:** automatizar a checagem e o bloqueio, mantendo apenas uma **conferência humana curta** (cerca de 5 minutos de leitura do relatório) a cada atualização da base e antes do piloto, com ação só se o relatório apontar exceção.
- **Prazo (19/11):** o script não é obrigatório. No MVP basta fazer a checagem uma vez, antes do piloto, com o relatório de auditoria que já existe; a automação a cada atualização fica como evolução.
- **Opções apresentadas ao Lucas:** **A.** checagem automática com bloqueio automático e conferência humana curta só nas atualizações (recomendada pelo assistente); **B.** totalmente automático, sem responsável (desaconselhada pelos pontos 2 e 3); **C.** manter a decisão atual, com revisão humana completa a cada atualização.
- **Impacto na decisão atual:** a opção A ou B alteraria a frase "Uma diferença encontrada leva a revisão humana, não a ajuste automático de pesos ou limites", passando a permitir o bloqueio automático por "dados insuficientes" (sem ajuste de pesos). Isso só vale depois que o grupo decidir.
- **Pendente:** escolha do grupo entre A, B e C e, se for A, o nome de quem faz a conferência (a indicar).

`[DECISÃO — 11/11/2026, Lucas Simidu pelo grupo]` **Opção B: revisão de vieses totalmente automática, sem responsável humano.** Substitui, para a revisão de vieses, a frase "Uma diferença encontrada leva a revisão humana, não a ajuste automático de pesos ou limites" da decisão acima. Como fica:

1. Um script mede a cobertura por circunscrição e por subprefeitura antes do piloto e a cada atualização da base da SSP-SP e gera o relatório publicado com a metodologia.
2. A consequência é só o bloqueio que a regra já prevê: abaixo de 80% de cobertura ou com diferença acima de 10 p.p. entre as alternativas, a comparação vira "dados insuficientes". **Pesos e limites não são ajustados automaticamente**; mudá-los continua exigindo nova decisão registrada.
3. Não há conferência humana do relatório nem responsável nomeado pela metodologia.

Riscos aceitos com esta escolha (parecer do assistente, mantido como registro): a automação só detecta o que foi programada para medir; mudanças de formato da SSP, de geocodificação ou padrões novos podem passar sem alerta; e não há quem responda pelo processo. `docs/03` §6 (princípio 8) pede avaliação periódica de resultados desproporcionais, o que o script cumpre na parte de cobertura; as checagens de resultado por região e de acesso ao registro continuam adiadas para depois do MVP.

`[HIPÓTESE — sugestão do assistente, não decidida]` Para reduzir o risco sem voltar à revisão humana, o próprio script pode **interromper a atualização** quando encontrar sinais de mudança na base: colunas ausentes ou renomeadas, queda brusca da cobertura total ou uma circunscrição que some de um mês para o outro. Nesse caso o app continuaria com a base anterior. Fica para o grupo decidir ao implementar o script (`TODO.md` T21).

## Apresentação da confiança dos dados

`[DECISÃO — 11/11/2026]` A confiança dos dados aparece em um bloco **"Sobre os dados"**, sempre visível junto da comparação e separado da exposição estimada. **Não há nota, escala nem níveis** (alta/média/baixa): os limites entre níveis seriam arbitrários, e uma escala tende a ser lida como nota de segurança. O bloco traz:

1. **Fonte e período**: por exemplo, "SSP-SP, boletins de ocorrência de jan–set/2026 (9 meses)", com a data de atualização da base.
2. **Cobertura de cada alternativa**: percentual de boletins elegíveis com localização e período nas circunscrições atravessadas pelos trechos a pé.
3. **Situação da comparação**, em uma de três frases fixas:
   - "Dados suficientes para comparar". Só então pode aparecer "menor exposição estimada entre as alternativas avaliadas", e apenas se o teste também apontar diferença.
   - "Sem diferença clara entre os registros", com `N`, `D` e `L` visíveis.
   - "Dados insuficientes", sempre com o motivo: menos de 10 registros no total; cobertura abaixo de 80% ou diferença de cobertura acima de 10 p.p.; ou resultado que muda com a largura do corredor.
4. **Limitações fixas**: subnotificação (zero registro não significa ausência de ocorrência); coordenadas que podem ser pontos de referência; contagem que inclui todos os tipos de local; apenas furtos e roubos "outros" considerados (`docs/07`).
   - `[DECISÃO — 11/11/2026]` Acrescentar: **as alternativas usam os horários programados publicados pela SPTrans, que podem não refletir mudanças recentes de operação** (exemplo verificado: Linha 17-Ouro, `docs/04` §5).

`[EM ABERTO]` Redação final e teste de compreensão das frases com usuários (item correspondente em `docs/06`). *(Teste de compreensão: ver a decisão de 11/11/2026 abaixo. A redação final continua em aberto.)*

### Teste de compreensão das mensagens (metodologia registrada, não executada)

`[DECISÃO — 11/11/2026, Lucas Simidu pelo grupo]` **O teste com usuários não será feito nesta fase** (MVP e entrega da GS). A metodologia fica registrada aqui para ser aplicada quando o produto avançar, porque é nesse tipo de teste que se encontra a maior parte dos erros de interpretação.

Consequências enquanto o teste não acontecer:

- As três frases fixas e o bloco "Sobre os dados" são **redação proposta, não validada com usuários**. Pitch, slides e entregas devem apresentá-las assim e citar o teste como próximo passo planejado, nunca como feito.
- As regras de `docs/05` continuam sendo a única proteção contra leituras como garantia ou transferência de culpa; a redação deve segui-las à risca.

Metodologia (proposta preliminar de 11/11/2026, preservada):

1. **Participantes:** 5 estudantes do período noturno, referência de testes de usabilidade de Nielsen. Alternativa discutida: 8 a 10 participantes, com mais tempo de agendamento.
2. **Material:** as três telas de resultado ("menor exposição estimada", "sem diferença clara", "dados insuficientes"), com o bloco "Sobre os dados".
3. **Roteiro:** uma pergunta aberta ("o que o app está te dizendo?") e três diretas: "se for pela rota destacada, você está segura?"; "se acontecer algo na outra rota, de quem é a responsabilidade?"; "o que significa não ter registros?".
4. **Critério:** **uma única** leitura como garantia, como transferência de culpa ou como "zero registros = seguro" obriga a reescrever a mensagem e testar de novo.
5. **Privacidade:** respostas anotadas sem nome nem dados pessoais.
6. **Pré-requisito:** protótipo com as três telas (`TODO.md` T07).

`[DECISÃO]` Para avaliar o piloto municipal, testar trajetos de diferentes regiões e fazer auditoria de cobertura na cidade inteira. A presença de registros em São Paulo não comprova qualidade homogênea em seus bairros ou horários.
