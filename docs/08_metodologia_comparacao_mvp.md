---
titulo: Regra inicial de comparação de trajetos — MVP
projeto: VoltaSegura
atualizado: 2026-11-11
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

`[EM ABERTO]` Quem assume o papel de **responsável pela metodologia** (executar e publicar a revisão): a indicar pelo grupo.

## Apresentação da confiança dos dados

`[DECISÃO — 11/11/2026]` A confiança dos dados aparece em um bloco **"Sobre os dados"**, sempre visível junto da comparação e separado da exposição estimada. **Não há nota, escala nem níveis** (alta/média/baixa): os limites entre níveis seriam arbitrários, e uma escala tende a ser lida como nota de segurança. O bloco traz:

1. **Fonte e período**: por exemplo, "SSP-SP, boletins de ocorrência de jan–set/2026 (9 meses)", com a data de atualização da base.
2. **Cobertura de cada alternativa**: percentual de boletins elegíveis com localização e período nas circunscrições atravessadas pelos trechos a pé.
3. **Situação da comparação**, em uma de três frases fixas:
   - "Dados suficientes para comparar". Só então pode aparecer "menor exposição estimada entre as alternativas avaliadas", e apenas se o teste também apontar diferença.
   - "Sem diferença clara entre os registros", com `N`, `D` e `L` visíveis.
   - "Dados insuficientes", sempre com o motivo: menos de 10 registros no total; cobertura abaixo de 80% ou diferença de cobertura acima de 10 p.p.; ou resultado que muda com a largura do corredor.
4. **Limitações fixas**: subnotificação (zero registro não significa ausência de ocorrência); coordenadas que podem ser pontos de referência; contagem que inclui todos os tipos de local; apenas furtos e roubos "outros" considerados (`docs/07`).

`[EM ABERTO]` Redação final e teste de compreensão das frases com usuários (item correspondente em `docs/06`).

`[DECISÃO]` Para avaliar o piloto municipal, testar trajetos de diferentes regiões e fazer auditoria de cobertura na cidade inteira. A presença de registros em São Paulo não comprova qualidade homogênea em seus bairros ou horários.
