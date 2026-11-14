# Matriz de rastreabilidade

- **Status:** rascunho (Fase 4, 13/11/2026)
- **Fonte:** `docs/10_backlog_produto.md` **v1.6** (86 AC em US-01 a US-21, mais RNF-01 a RNF-09). Atualizada em 13/11/2026 com o compartilhamento (US-21, US-19 AC4).
- **Como ler:** cada critério de aceite → fluxo → tela → funcionalidade/componente → **teste previsto**.
  - Tipo: **+** = positivo, **−** = negativo (caixa-preta, como pede a entrega de QA, `docs/02` §8).
  - Onde: **App** = testável na interface (mock ou API) · **API** = testável chamando o servidor · **Backend** = regra interna do servidor, fora do app.
- **Uso pela QA (T10):** cada ID `T-xx.y` pode virar um Test Case no Azure Boards (objetivo = coluna "Teste previsto"; preparação, inputs, passos e saída esperada saem do fluxo e da tela citados). Os de "Backend" ficam com quem cuida do servidor.
- **Fixtures do mock:** os testes de resultado usam uma fixture por caso do FL-07 (FN-07): `conclusivo`, `sem_diferenca`, `mistos`, `insuficiente_amostra`, `insuficiente_cobertura`, `insuficiente_largura`, `nao_aplicavel`, `uma_rota`, `outra_opcao`, `sem_servico`, `indisponivel`.

## E1 — Conta e privacidade

| AC | Resumo | Fluxo | Tela | FN / componente | Teste previsto | Tipo | Onde |
|---|---|---|---|---|---|---|---|
| US-01 AC1 | Só e-mail e senha | FL-02 | TL-02 | FN-01 · `CampoTexto` | T-01.1 A tela de cadastro tem só os campos e-mail e senha | + | App |
| US-01 AC2 | Sem aceite, sem conta | FL-02 | TL-02 | FN-01 · `Caixa` | T-01.2 Enviar sem aceitar o aviso: conta não criada e motivo exibido | − | App |
| US-01 AC3 | E-mail repetido recusado | FL-02 | TL-02 | FN-01 (`409`) | T-01.3 Cadastrar e-mail já existente: recusa com mensagem clara | − | App + API |
| US-01 AC4 | E-mail inválido / senha vazia | FL-02 | TL-02 | FN-01 · `CampoTexto` erro | T-01.4 E-mail "agatha@exemplo" e senha vazia: recusa com os dois campos indicados | − | App |
| US-01 AC5 | Google só com e-mail e identificador | FL-02 | TL-02 | FN-01 (`/conta/google`) | T-01.5 Cadastro com Google não pede nem guarda nome ou foto | + | App + API (depende de PL-06) |
| US-01 AC6 | Aviso como minuta | FL-02 | TL-02, TL-13 | FN-12 | T-01.6 O aviso abre com "Minuta acadêmica, sem revisão jurídica" e não afirma conformidade | + | App |
| US-02 AC1 | Login correto abre o planejamento | FL-03 | TL-03 → TL-04 | FN-02 | T-02.1 Login válido abre TL-04 | + | App + API |
| US-02 AC2 | Erro genérico | FL-03 | TL-03 | FN-02 (`401`) | T-02.2 Senha errada e e-mail inexistente mostram a mesma mensagem | − | App + API |
| US-02 AC3 | Conta obrigatória | FL-03 | TL-01/TL-03 | Guarda de rotas (`05_navegacao.md`) | T-02.3 Sem sessão, abrir uma rota de `(app)` leva à abertura | − | App |
| US-03 AC1 (adiado, D-25) | Excluir apaga e encerra | FL-12 | TL-12 → TL-01 | FN-03 · `DialogoConfirmacao` | T-03.1 (adiado, D-25) Confirmar a exclusão: sessão encerrada e aviso "conta excluída" | + | App + API |
| US-03 AC2 (adiado, D-25) | Conta excluída não entra | FL-12, FL-03 | TL-03 | FN-02, FN-03 | T-03.2 (adiado, D-25) Depois de excluir, login com o mesmo e-mail é negado | − | App + API |
| US-03 AC3 (adiado, D-25) | Cancelar não apaga | FL-12 | TL-12 | FN-03 | T-03.3 (adiado, D-25) Cancelar a confirmação: conta continua ativa | − | App |
| US-04 AC1 | Histórico desligado não grava | FL-11 | TL-12, TL-04 | FN-13 | T-04.1 Com histórico desligado (padrão), consultar não grava nada no banco local | − | App |
| US-04 AC2 | Ligado grava só no aparelho | FL-11, FL-04 | TL-12, TL-04 | FN-13 | T-04.2 Com histórico ligado, a consulta aparece em "Recentes" | + | App |
| US-04 AC3 | Apagar um ou todos | FL-11 | TL-12 | FN-13 · `DialogoConfirmacao` | T-04.3 Apagar um e depois todos: somem da lista e do banco | + | App |
| US-04 AC4 | Nunca vai ao servidor | FL-11 | TL-12 | FN-13 | T-04.4 Nenhuma chamada de rede leva histórico ou locais salvos | − | App |
| US-04 AC5 | Locais salvos só no aparelho | FL-05, FL-11 | TL-05, TL-12 | FN-04, FN-13 | T-04.5 Salvar "Faculdade" no mapa: aparece em locais salvos, pode ser renomeado e apagado, e não é enviado | + | App |
| US-05 AC1 | GPS sob demanda preenche | FL-05 | TL-04 | FN-04 | T-05.1 "Usar minha localização" pede permissão e preenche a origem | + | App |
| US-05 AC2 | Permissão negada não bloqueia | FL-05 | TL-04 | FN-04 | T-05.2 Negar a permissão: mapa e locais salvos seguem disponíveis | − | App |
| US-05 AC3 | Sem leitura em segundo plano (exceção: compartilhamento ativo, D-20) | FL-05, FL-14, FL-15 | TL-04, TL-08, TL-14 | FN-04, FN-15 | T-05.3 Sem sessão de compartilhamento, o app não lê a posição em segundo plano; a permissão de segundo plano só é pedida ao iniciar um compartilhamento | − | App |

## E2 — Planejamento do trajeto

| AC | Resumo | Fluxo | Tela | FN / componente | Teste previsto | Tipo | Onde |
|---|---|---|---|---|---|---|---|
| US-06 AC1 | Consulta válida enviada | FL-04 | TL-04 → TL-06 → TL-07 | FN-05, FN-07 | T-06.1 Origem, destino e horário válidos: alternativas exibidas | + | App |
| US-06 AC2 | Campo vazio não envia | FL-04 | TL-04 | FN-05 · `CampoPonto` erro | T-06.2 Destino vazio: nada enviado e campo indicado | − | App |
| US-06 AC3 | Fora do município bloqueado | FL-04 | TL-04, TL-05 | FN-05 (PL-11) | T-06.3 Ponto fora de São Paulo: aviso de fora da área e nada enviado | − | App |
| US-06 AC4 | Origem = destino | FL-04 | TL-04 | FN-05 | T-06.4 Mesmo ponto nos dois campos: aviso de que não há trajeto | − | App |
| US-06 AC5 | Formas de escolher, sem busca externa | FL-05 | TL-04, TL-05 | FN-04 | T-06.5 (revisto pela D-29) Existem mapa, busca por texto, localização e local salvo; não existem pontos de exemplo na interface; a busca só consulta ao tocar em Buscar e nada é registrado em log | + | App |
| US-07 AC1 | Volta inverte, horário próprio | FL-08 | TL-07 → TL-04 | FN-06 · `SeletorSentido` | T-07.1 "Planejar a volta" inverte origem e destino e permite outro horário | + | App |
| US-07 AC2 | Volta usa a faixa do horário da volta | FL-08 | TL-09 | FN-06, FN-10 | T-07.2 Ida 18h e volta 23h: o "Por que esta rota?" da volta mostra "noite (18h–23h)" conforme a resposta | + | App + API |
| US-08 AC1 | Card com duração, a pé, trocas, trechos | FL-06 | TL-07, TL-08 | FN-07, FN-08 · `CardRota` | T-08.1 Cada card mostra duração, km a pé, trocas, modos, linhas e horário previsto | + | App |
| US-08 AC2 | Sem serviço no horário | FL-06 | TL-06 | FN-07 (`rotas: []`) | T-08.2 Fixture `sem_servico`: aviso e nenhuma comparação | − | App |
| US-08 AC3 | Horários previstos | FL-06 | TL-07, TL-08 | FN-08 | T-08.3 Todo horário vem com "previsto" ou o aviso "Horários previstos (GTFS)" | + | App |
| US-08 AC4 | Uma rota, sem comparação | FL-06 | TL-07 | FN-08 | T-08.4 Fixture `uma_rota`: sem foco e com "não há comparação" | − | App |
| US-08 AC5 | Até 3 rotas com foco, prioridade da menor exposição estimada, outra opção | FL-06 | TL-07 | FN-07, FN-08 · `RotuloFoco` | T-08.5a Fixture `conclusivo`: 3 cards; o de menor exposição estimada primeiro, selecionado, mapa no trajeto dele e rótulo em destaque; demais por tempo (D-23) · T-08.5d Fixture `sem_diferenca`: ordem por tempo · T-08.5b Fixture `outra_opcao`: rota com dois rótulos + "Outra opção" · T-08.5c Nenhum card diz "por segurança" | + / − | App |
| US-09 AC1 | Passo a passo em ordem | FL-14 | TL-08 | FN-09 · `ListaTrechos` | T-09.1 Trechos na ordem de `ordem`, com embarque e desembarque | + | App |
| US-21 AC1 | Compartilhar gera link temporário | FL-15 | TL-08 → TL-14 | FN-15 | T-21.1 Confirmar o compartilhamento cria a sessão e abre a folha de compartilhar com o link | + | App + API |
| US-21 AC2 | Explica o que o contato verá e quando termina | FL-15 | TL-14 | FN-15 | T-21.2 A confirmação lista trajeto, posição, chegada estimada e o horário de término | + | App |
| US-21 AC3 | Indicador sempre visível com Parar | FL-15 | TL-14 + todas de `(app)` | FN-15 · `IndicadorCompartilhamento` | T-21.3 Com sessão ativa, o indicador aparece em todas as telas; "Parar" encerra e o link expira | + | App + API |
| US-21 AC4 | Encerra na chegada ou no tempo máximo | FL-15 | TL-14 | FN-15 (PL-20, PL-22) | T-21.4 Simular chegada ao destino e tempo máximo: a sessão encerra sozinha e avisa | + | App |
| US-21 AC5 | GPS em segundo plano só na sessão; negado → só trajeto | FL-15 | TL-14 | FN-15 | T-21.5 Negar a permissão de segundo plano: compartilha só o trajeto; fora da sessão, nenhuma leitura em segundo plano | − | App |
| US-21 AC6 | Link só abre no app; contato vê trajeto, posição, chegada e estado | FL-16 | TL-15 | FN-16 | T-21.6a Sem o app, página de instalação · T-21.6b Com o app, TL-15 mostra os quatro itens | + / − | App + API |
| US-21 AC7 | Ao encerrar, servidor apaga e link para de funcionar | FL-15, FL-16 | TL-14, TL-15 | FN-15, FN-16 | T-21.7 Depois de parar, abrir o link mostra "terminou" e a API responde 404/410 sem dados | − | App + API |
| US-21 AC8 | Contato não vê dados da conta nem da comparação | FL-16 | TL-15 | FN-16 | T-21.8 A resposta e a TL-15 não contêm e-mail nem números de exposição | − | App + API |
| US-21 AC9 | Sem promessa de proteção nem culpa de quem acompanha | FL-15, FL-16 | TL-14, TL-15 | `08_microcopy.md` | T-21.9 Varredura dos textos `compartilhar.*` e `acompanhar.*`: 0 termos proibidos | − | App |

## E3 — Comparação de exposição estimada

| AC | Resumo | Fluxo | Tela | FN / componente | Teste previsto | Tipo | Onde |
|---|---|---|---|---|---|---|---|
| US-10 AC1 | Cálculo de N, L e D | FL-07 | TL-09 (exibe) | FN-10 · `TabelaNumeros` | T-10.1 (Backend) conta conferida num trajeto de teste · T-10.1-App O app exibe N, L e D da resposta, sem recalcular | + | Backend + App |
| US-10 AC2 | Boletim em corredores sobrepostos conta uma vez | FL-07 | — | — | T-10.2 Boletim no cruzamento de dois trechos a pé conta 1 | + | Backend |
| US-10 AC3 | Furto + roubo no mesmo boletim conta uma vez | FL-07 | — | — | T-10.3 Boletim com as duas naturezas conta 1 | + | Backend |
| US-10 AC4 | Outras naturezas fora de N | FL-07 | TL-11 (aviso) | FN-11 | T-10.4 (Backend) carga/veículo/trânsito não alteram N · T-10.4-App TL-11 avisa que só os "outros" entram | − | Backend + App |
| US-10 AC5 | `L = 0` → "não aplicável" | FL-07 | TL-08, TL-09 | FN-09, FN-10 | T-10.5 Fixture `nao_aplicavel`: D aparece "não aplicável", nunca 0; sem botão na rota sem trecho a pé | − | App |
| US-10 AC6 | Sem coordenada/período fora, reduz cobertura | FL-07 | TL-10 (cobertura) | FN-11 | T-10.6 (Backend) registros sem coordenada não entram em N e reduzem a cobertura | − | Backend |
| US-11 AC1 | Destaque só com todas as condições | FL-07 | TL-07, TL-09 | FN-07, FN-10 | T-11.1 Fixture `conclusivo`: foco de exposição só na rota vencedora + indicativo | + | App (regra: Backend) |
| US-11 AC2 | Mistos sem destaque | FL-07 | TL-07, TL-09 | FN-10 (D-11) | T-11.2 Fixture `mistos`: sem foco de exposição, indicativo de "sem diferença clara" | − | App |
| US-11 AC3 | `p ≥ 0,05` sem destaque | FL-07 | TL-07, TL-09 | FN-10 | T-11.3 Fixture `sem_diferenca`: sem foco, indicativo e N, L, D visíveis | − | App |
| US-11 AC4 | Muda com a largura: sem destaque | FL-07 | TL-09 | FN-10 | T-11.4 Fixture `insuficiente_largura`: sem foco, motivo em linguagem simples | − | App |
| US-11 AC5 | App não escolhe, sem nota única | FL-07 | TL-07 | FN-08 | T-11.5 Nenhuma tela mostra nota, estrela, escala ou "recomendada"; mesmo com a prioridade da D-23, todas as rotas ficam visíveis e selecionáveis | − | App |
| US-11 AC6 | 3+ candidatas: vencer cada uma; `L = 0` sem destaque | FL-07 | TL-07 | FN-07 | T-11.6 (Backend) com 3 candidatas, sem vitória em todos os pares, nenhum foco de exposição · T-11.6-App fixture `nao_aplicavel` sem foco | − | Backend + App |
| US-12 AC1 | Menos de 10 registros: insuficiente | FL-07 | TL-09, TL-10 | FN-10 | T-12.1 Fixture `insuficiente_amostra`: "poucos registros no total", sem ordenar e sem mostrar "10" | − | App |
| US-12 AC2 | Cobertura baixa: insuficiente | FL-07 | TL-09, TL-10 | FN-10 | T-12.2 Fixture `insuficiente_cobertura`: motivo de cobertura sem qualificar a região | − | App |
| US-12 AC3 | Zero não é vantagem | FL-07 | TL-07, TL-09 | FN-08, FN-10 | T-12.3 Rota com 0 registros e caso não conclusivo não recebe foco; frase de limitação visível | − | App |
| US-13 AC1 | Tempo separado da exposição | FL-07 | TL-07 | FN-08 | T-13.1 Card só com tempo, a pé e trocas; números de registro só no "Por que esta rota?" | + | App |
| US-13 AC2 | Estados distintos | FL-07 | TL-07, TL-09 | FN-08, FN-10 | T-13.2 Percorrer todas as fixtures: cada caso tem tela/indicativo próprio | + | App |
| US-13 AC3 | Sem termos proibidos | — | Todas | `08_microcopy.md` | T-13.3 Varredura automática do arquivo de textos: 0 ocorrências | − | App |
| US-13 AC4 | Textos como proposta | — | — | `08_microcopy.md` | T-13.4 Documentação do app e README dizem que as mensagens não foram validadas com usuários | + | Documentação |
| US-13 AC5 | Mapa + container + botão nos trechos a pé | FL-06, FL-07 | TL-07, TL-08 | FN-08, FN-09 · `MapaTrajeto`, `Container`, `BotaoPorQue` | T-13.5 Mapa mostra a rota selecionada inteira; trocar de card troca o traço; botão só em trecho a pé | + | App |
| US-13 AC6 | Frases da lógica fora da tela principal | FL-07 | TL-07, TL-09 | FN-10 | T-13.6 TL-07 não mostra frases de situação; TL-09 não contém "80%", "10 p.p.", "p <" nem "corredor" | − | App |

## E4 — Transparência dos dados

| AC | Resumo | Fluxo | Tela | FN / componente | Teste previsto | Tipo | Onde |
|---|---|---|---|---|---|---|---|
| US-14 AC1 | Sempre visível, sem nota | FL-09 | TL-07, TL-08 | FN-08 · `LinhaSobreOsDados` | T-14.1 A linha "Dados: …" aparece em todas as fixtures; TL-10 sem nota ou níveis | + | App |
| US-14 AC2 | Fonte, período e atualização | FL-09 | TL-10 | FN-11 | T-14.2 TL-10 mostra fonte, período e as datas de atualização | + | App |
| US-14 AC3 | Cobertura por rota | FL-09 | TL-10 | FN-11 | T-14.3 Cobertura em % para cada rota exibida | + | App |
| US-14 AC4 | Situação com motivo | FL-09 | TL-10 | FN-11 | T-14.4 Situação corresponde ao caso; motivo presente quando insuficiente | + | App |
| US-14 AC5 | Cinco limitações fixas | FL-09 | TL-10 | FN-11 | T-14.5 As cinco limitações aparecem | + | App |
| US-15 AC1 | Totais por rota em "Dados considerados" | FL-10 | TL-11 | FN-11 · `LinhaCategoria` | T-15.1 Abas por rota com Furto, Roubo e Trânsito e parcelas; a tela principal sem números de ocorrência | + | App |
| US-15 AC2 | Só os "outros" na comparação | FL-10 | TL-11 | FN-11 | T-15.2 Aviso de recorte presente; a parcela comparada identificada em texto | + | App |
| US-15 AC3 | Panorama municipal só em detalhes | FL-10 | TL-11 | FN-11 | T-15.3 Panorama só pela ação deliberada, com aviso de que não descreve a rua | − | App |
| US-15 AC4 | Sem marcadores nem filtros finos | FL-05, FL-10 | TL-05, TL-07, TL-11 | `MapaTrajeto` | T-15.4 Nenhum marcador de ocorrência no mapa; nenhum filtro por rua, endereço ou data | − | App |
| US-16 AC1 | Créditos SSP-SP, SPTrans, OSM | FL-09 | TL-05, TL-07, TL-10 | `Atribuicao` | T-16.1 Créditos visíveis no mapa e em "Sobre os dados" | + | App |
| US-16 AC2 | Crédito do GeoSampa se usado | FL-09 | TL-10 | — | T-16.2 Sem camada de iluminação no MVP: crédito ausente (P-03) | − | App |

## E5 e E6 — Backend, dados e proteção (fora das telas)

| AC | Resumo | Reflexo no app | Teste previsto | Tipo | Onde |
|---|---|---|---|---|---|
| US-17 AC1 | Cobertura por circunscrição e subprefeitura | Cobertura na TL-10 | T-17.1 Relatório gerado com as duas unidades | + | Backend |
| US-17 AC2 | Relatório a cada atualização | — | T-17.2 Relatório publicado com a metodologia | + | Backend |
| US-17 AC3 | Script não muda pesos | "Dados insuficientes" na TL-09 | T-17.3 Rodar o script não altera limites | − | Backend |
| US-18 AC1 | GTFS por script | — | T-18.1 Download reprodutível; janelas das linhas 6 e 17 conferidas | + | Backend |
| US-18 AC2 | SHA256 registrado | — | T-18.2 Arquivo e SHA256 em `src/ml/dados/README.md` | + | Backend |
| US-18 AC3 | Data de atualização no app | TL-10 | T-18.3 = T-14.2 | + | App |
| US-19 AC1 | Consulta não gravada | TL-06 (texto de privacidade) | T-19.1 Após consultar, nada da consulta no banco do servidor | − | Backend |
| US-19 AC2 | Logs sem coordenadas nem conta | App também não loga | T-19.2 Logs do servidor e do app sem coordenadas, endereços ou e-mail | − | Backend + App |
| US-19 AC3 | Sem serviços externos de mapas | Sem busca de endereço (US-06 AC5) | T-19.3 (Backend) roteamento próprio · T-19.3-App nenhuma chamada com origem/destino a terceiros | − | Backend + App |
| US-19 AC4 | Compartilhamento: dados só durante a sessão | TL-13, TL-14 (textos de privacidade) | T-19.4 Depois de encerrar, nada da sessão no banco do servidor; o servidor guardou só a última posição | − | Backend + API |
| US-20 AC1 | Só agregados | Contrato FN-07 | T-20.1 A resposta não contém coordenadas nem campos de boletins | − | API |
| US-20 AC2 | Recortes identificáveis ocultos | TL-11 "dados insuficientes" | T-20.2 Contagem `null` exibida como "dados insuficientes", nunca 0 | − | App + API |

## Requisitos não funcionais

| RNF | Verificação no app | Teste previsto | Onde |
|---|---|---|---|
| RNF-01 Linguagem | `08_microcopy.md` + varredura | T-R01 Varredura automática dos textos (inclui "por segurança") | App |
| RNF-02 Sem rótulo de bairro | Nenhuma tela classifica território; `motivo.cobertura` fala dos dados | T-R02 Nenhum texto ou camada nomeia bairro com qualificação | App |
| RNF-03 Zero não é vantagem | D-13, US-12 AC3 | T-R03 = T-12.3 + T-10.5 | App |
| RNF-04 Confiança separada | Linha fixa + TL-10; sem cor de alerta | T-R04 = T-14.1; componentes sem cor por caso | App |
| RNF-05 Privacidade e minimização | FN-01, FN-03, FN-13, contrato | T-R05 = T-01.1, T-03.1 (adiado, D-25), T-04.4, T-19.2 | App + Backend |
| RNF-06 Sem culpa da usuária | Microcopy de erro e indicativos | T-R06 Revisão dos textos de erro e resultado | App |
| RNF-07 Acessibilidade | `07_design/acessibilidade.md` | T-R07 Checklist por tela + teste com leitor de tela no fluxo TL-04 → TL-09 | App |
| RNF-08 Dados de exemplo rotulados | `exemplo: true` → `SeloExemplo` | T-R08 Toda fixture mostra "EXEMPLO" em cards e números | App |
| RNF-09 Sem afirmar LGPD | TL-13, microcopy | T-R09 Varredura de "conformidade"/"LGPD" em contexto afirmativo | App |

## Resumo da cobertura

| Item | Total | Com fluxo | Com tela | Com teste previsto |
|---|---|---|---|---|
| AC de US-01 a US-16 e US-21 (com tela) | 74 | 74 | 72 (US-10 AC2 e AC3 são só backend) | 74 |
| AC de US-17 a US-20 (backend e proteção) | 12 | — | reflexo indicado | 12 |
| RNF | 9 | — | — | 9 |

> Nota (D-25): os 3 AC de US-03 e os testes T-03.x estão adiados e continuam contados acima, pois o backlog os preserva. Os totais não foram alterados.
