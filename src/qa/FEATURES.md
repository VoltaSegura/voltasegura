# Features do VoltaSegura para o Azure Boards

> **Rascunho gerado em 16/11/2026 a partir de `docs/10_backlog_produto.md` (v1.10), seção 6.** Os critérios de aceite estão copiados como estão no backlog (fonte da verdade). Se o backlog mudar, regerar este arquivo e não editar à mão.
>
> **Como levar ao Azure Boards** (`docs/10` §11): 1 Feature = 1 item abaixo; título = ID + nome; descrição = a história (`US`) e o status; critérios de aceite = os `AC`. Os Test Cases ficam em [`TEST_CASES.md`](TEST_CASES.md).

## Resumo

| Feature | Épico | Fase | Observação |
|---|---|---|---|
| F1.1 — Cadastro com consentimento | E1 Conta e privacidade | MVP |  |
| F1.2 — Login e sessão | E1 Conta e privacidade | MVP |  |
| F1.3 — Exclusão da conta pelo app | E1 Conta e privacidade | Adiada | **Fora do MVP por ora (D-25).** Não cadastrar como Feature do sprint; critérios preservados. |
| F1.4 — Histórico de trajetos só no aparelho | E1 Conta e privacidade | MVP |  |
| F1.5 — Localização atual opcional | E1 Conta e privacidade | MVP |  |
| F2.1 — Informar origem, destino e horário | E2 Planejamento do trajeto | MVP |  |
| F2.2 — Planejar ida e volta separadamente | E2 Planejamento do trajeto | MVP |  |
| F2.3 — Receber alternativas multimodais | E2 Planejamento do trajeto | MVP |  |
| F2.4 — Orientação passo a passo | E2 Planejamento do trajeto | MVP |  |
| F2.5 — Compartilhar trajeto e localização ao vivo | E2 Planejamento do trajeto | MVP | Depende do tempo; protótipo com mock (sem backend real nem GPS em segundo plano). |
| F2.6 — Seguir rota (navegação no trajeto) | E2 Planejamento do trajeto | MVP | Incluída em 18/11 (D-34); fases 2 e 3 em andamento. |
| F3.1 — Calcular N, L e D por alternativa | E3 Comparação de exposição estimada | MVP |  |
| F3.2 — Regra de destaque | E3 Comparação de exposição estimada | MVP |  |
| F3.3 — Resultado "dados insuficientes" | E3 Comparação de exposição estimada | MVP |  |
| F3.4 — Tela de comparação | E3 Comparação de exposição estimada | MVP |  |
| F4.1 — Bloco "Sobre os dados" | E4 Transparência dos dados | MVP |  |
| F4.2 — Categorias de ocorrências e detalhes | E4 Transparência dos dados | MVP |  |
| F4.3 — Atribuição das fontes | E4 Transparência dos dados | MVP |  |
| F5.1 — Relatório automático de cobertura por região | E5 Qualidade dos dados e vieses (backend) | MVP | Backend/ML (sem tela). Verificação por evidência de script. |
| F5.2 — Atualização das bases | E5 Qualidade dos dados e vieses (backend) | MVP | Backend (sem tela). Verificação por evidência de script. |
| F6.1 — Consultas não armazenadas | E6 Segurança e proteção de dados | MVP |  |
| F6.2 — Nada de registros individuais no app | E6 Segurança e proteção de dados | MVP |  |
| F7.1 — Rotina e aviso antes de sair | E7 VoltaSegura+ | MVP | Depende do tempo; versão mínima, sem pagamento; rotina só no aparelho. |

**Itens que não viram Feature do MVP** (`docs/10` §9): roadmap do pitch (relatos de infraestrutura, agente de replanejamento, integrações), tempo real, indicadores adicionais. **Requisitos não funcionais** (`docs/10` §7) viram critérios transversais e têm Test Cases próprios (RNF-01 a RNF-09).

---

## F1.1 — Cadastro com consentimento · MVP · Mobile, SOA, Cyber · `[DECISÃO]` (DT-08)

**Épico:** E1 — Conta e privacidade

**US-01.** Como Ágatha, quero criar uma conta informando só e-mail e senha, para usar o app sem entregar dados pessoais além do necessário.

- **AC1.** Dado a tela de cadastro, então os únicos dados pedidos são e-mail e senha; não há campos de nome completo, telefone ou endereço.
- **AC2.** Dado o cadastro preenchido, quando o usuário não aceitar o aviso de privacidade, então a conta não é criada e o motivo é exibido.
- **AC3.** Dado um e-mail já cadastrado, quando tentar criar outra conta com ele, então o cadastro é recusado com mensagem clara.
- **AC4.** Dado um e-mail em formato inválido ou senha vazia, quando enviar, então o cadastro é recusado e o campo com problema é indicado.
- **AC5.** Dado a opção "Entrar com Google", quando o usuário autorizar, então a conta é criada só com e-mail e identificador do Google, sem nome nem foto. `[DECISÃO — 11/11/2026]`
- **AC6.** O aviso de privacidade do protótipo se apresenta como minuta acadêmica, sem revisão jurídica, e não afirma conformidade com a LGPD. `[DECISÃO — 11/11/2026]`
- `[EM ABERTO]` Regras de senha; base legal. Revisão jurídica só antes de uso real.

---

## F1.2 — Login e sessão · MVP · Mobile, SOA

**Épico:** E1 — Conta e privacidade

**US-02.** Como Ágatha, quero entrar na minha conta, para consultar trajetos.

- **AC1.** Dado e-mail e senha corretos, quando entrar, então o app abre a tela de planejamento.
- **AC2.** Dado senha incorreta ou e-mail inexistente, quando entrar, então o acesso é negado com mensagem genérica, sem revelar qual dos dois está errado.
- **AC3.** Dado um usuário sem sessão, quando tentar consultar trajetos, então o app pede login (conta obrigatória).

---

## F1.3 — Exclusão da conta pelo app · MVP (adiada, D-25) · Mobile, SOA, Cyber

**Épico:** E1 — Conta e privacidade

**US-03.** Como Ágatha, quero excluir minha conta pelo próprio app, para que o servidor não guarde mais nada sobre mim.

> **Adiada por ora pela D-25 (14/11/2026):** fora do MVP; critérios preservados para retomada.

- **AC1.** Dado um usuário logado, quando escolher excluir a conta e confirmar, então e-mail e identificador são apagados do servidor e a sessão é encerrada.
- **AC2.** Dado uma conta excluída, quando tentar entrar com o mesmo e-mail e senha, então o acesso é negado.
- **AC3.** Dado o pedido de exclusão, quando o usuário cancelar a confirmação, então nada é apagado.

---

## F1.4 — Histórico de trajetos só no aparelho · MVP · Mobile

**Épico:** E1 — Conta e privacidade

**US-04.** Como Ágatha, quero guardar meus trajetos frequentes no celular, se eu quiser, para não digitar tudo de novo, sem que fiquem no servidor.

- **AC1.** Dado o histórico desativado (padrão), quando fizer uma consulta, então nada é salvo no aparelho.
- **AC2.** Dado o histórico ativado, quando fizer uma consulta, então o trajeto é salvo só no armazenamento local do aparelho.
- **AC3.** Dado trajetos salvos, quando o usuário apagar um ou todos, então eles somem do aparelho.
- **AC4.** Em nenhum caso o histórico é enviado ao servidor ou vinculado à conta.
- **AC5.** `[DECISÃO — 13/11/2026]` (`docs/app-map/01_decisoes.md`, D-02) Locais salvos pela usuária (ex.: "Faculdade", "Casa") seguem as mesmas regras do histórico: ficam só no armazenamento local do aparelho, nunca vão ao servidor e podem ser renomeados ou apagados.

---

## F1.5 — Localização atual opcional · MVP · Mobile

**Épico:** E1 — Conta e privacidade

**US-05.** Como Ágatha, quero usar minha localização atual como origem só quando eu pedir, para não ser rastreada.

- **AC1.** Dado o campo de origem, quando tocar em "usar minha localização", então o app pede permissão de GPS (se ainda não concedida) e preenche a origem.
- **AC2.** Dado a permissão negada, então o usuário consegue escolher a origem normalmente, no mapa, num local salvo ou num ponto de exemplo. *(13/11/2026: antes "digitar a origem"; revisto pela D-02, que não prevê busca de endereço.)*
- **AC3.** O app não lê a localização em segundo plano nem fora dessa ação. **Exceção** `[DECISÃO — 13/11/2026]` (D-20): durante uma sessão de compartilhamento ativa (F2.5), com indicador visível e botão de parar.

---

## F2.1 — Informar origem, destino e horário · MVP · Mobile, SOA · `[DECISÃO]` (`docs/03` §4)

**Épico:** E2 — Planejamento do trajeto

**US-06.** Como Ágatha, quero informar origem, destino e horário de saída, para ver as alternativas daquele horário.

- **AC1.** Dado origem, destino e horário preenchidos, quando pedir as alternativas, então o app envia a consulta e exibe o resultado.
- **AC2.** Dado origem ou destino vazio, quando pedir as alternativas, então a consulta não é enviada e o campo faltante é indicado.
- **AC3.** Dado um ponto fora do município de São Paulo, quando pedir as alternativas, então o app não envia a consulta e informa que está fora da área atendida (município de São Paulo). `[DECISÃO — 13/11/2026]` (`docs/app-map/01_decisoes.md`, D-05; antes `[EM ABERTO]`). Como verificar o limite sem serviço externo: `docs/app-map` PL-11.
- **AC4.** Dado origem igual ao destino, então o app informa que não há trajeto a calcular.
- **AC5.** `[DECISÃO — 13/11/2026]` (D-02) Origem e destino são escolhidos tocando no mapa, usando a localização atual (US-05), num local salvo no aparelho (US-04 AC5) ou num ponto de exemplo, rotulado como exemplo (RNF-08). Não há busca de endereço em serviço externo (US-19 AC3).

---

## F2.2 — Planejar ida e volta separadamente · MVP · Mobile · `[DECISÃO]`

**Épico:** E2 — Planejamento do trajeto

**US-07.** Como Ágatha, quero planejar a volta com o horário em que saio da faculdade, separada da ida, porque as condições mudam conforme a hora.

- **AC1.** Dado um trajeto de ida planejado, quando escolher planejar a volta, então origem e destino são invertidos e o horário da volta pode ser definido à parte.
- **AC2.** A comparação da volta usa o período da SSP do horário da volta, não o da ida.

---

## F2.3 — Receber alternativas multimodais · MVP · Mobile, SOA · `[DECISÃO]` (DT-01, DT-02)

**Épico:** E2 — Planejamento do trajeto

**US-08.** Como Ágatha, quero ver as alternativas de trajeto com ônibus, metrô, trem e caminhada, para comparar opções reais.

- **AC1.** Dado uma consulta válida, então cada alternativa mostra duração total, distância a pé, número de baldeações e os trechos (modo, linha, horário previsto).
- **AC2.** Dado que o roteamento não encontra alternativa no horário (sem serviço), então o app informa que não há alternativa de transporte público e não exibe comparação.
- **AC3.** Os horários exibidos são programados (GTFS) e o app os identifica como previstos, não em tempo real.
- **AC4.** Com só uma alternativa disponível, o app a exibe sem comparação de exposição estimada.
- **AC5.** `[DECISÃO — 13/11/2026]` (`docs/app-map/01_decisoes.md`, D-10 e D-12) O app exibe **até 3 rotas**, cada uma a melhor das candidatas em pelo menos um foco: **menor tempo total**, **menos caminhada** e, só quando a regra do `docs/08` conclui (F3.2 AC6), **menor exposição estimada entre as alternativas avaliadas**. Uma rota que vence dois focos aparece uma vez, com os dois rótulos. **Prioridade da menor exposição estimada (D-23):** quando existir, a rota com esse foco aparece **primeiro**, já selecionada no mapa e com o rótulo em destaque; as demais seguem por tempo total, com o rótulo "menor exposição estimada primeiro". Sem esse foco, os cards ficam ordenados por tempo total, com o rótulo "ordenadas por tempo". *(13/11/2026: antes "sempre por tempo", D-10.)* O rótulo "por segurança" é proibido (`docs/05`). Entram como candidatas até 5 alternativas devolvidas pelo roteamento (D-15). Se os focos resultarem numa rota só, havendo duas ou mais candidatas, a segunda mais rápida aparece sem foco como "outra opção" (D-16).

---

## F2.4 — Orientação passo a passo · MVP · Mobile · `[DECISÃO — 13/11/2026]` (`docs/app-map/01_decisoes.md`, D-04; antes "MVP a confirmar", `[HIPÓTESE]`)

**Épico:** E2 — Planejamento do trajeto

**US-09.** Como Ágatha, quero ver o passo a passo da alternativa escolhida, para seguir o trajeto.

- **AC1.** Dado uma alternativa escolhida, então o app lista os trechos em ordem, com pontos de embarque e desembarque.
- ~~`[EM ABERTO]` Confirmar se entra no protótipo da GS.~~ `[DECISÃO — 13/11/2026]` Entra no MVP como lista **só de leitura**, dentro do container de detalhes da alternativa (F3.4 AC5), sem navegação ao vivo.

---

## F2.5 — Compartilhar trajeto e localização ao vivo · MVP **(Depende do tempo)** · Mobile, SOA, Cyber · `[DECISÃO — 13/11/2026]` (`docs/app-map/01_decisoes.md`, D-19 a D-22; antecipa o P-02)

**Épico:** E2 — Planejamento do trajeto

> **Status (15/11/2026): protótipo com mock.** Telas, indicador global e deep link existem no app, com serviço de exemplo em memória (sem backend real e sem GPS em segundo plano; PL-18 e PL-24 seguem abertos).
>
> **Depende do tempo (D-22):** previsto para o protótipo de 19/11. Se o prazo apertar, a construção é cancelada e fica para depois, sem afetar as demais features. É **nativa e gratuita** (não entra no premium).

**US-21.** Como Ágatha, quero compartilhar minha rota e minha localização com uma pessoa de confiança durante a volta, para que ela acompanhe minha viagem até eu chegar.

- **AC1.** Dado uma rota escolhida, quando tocar em "Compartilhar minha volta" e confirmar, então o app inicia uma sessão e gera um **link temporário** para enviar ao contato.
- **AC2.** Antes de iniciar, o app informa o que o contato verá (trajeto, posição atual, chegada estimada) e quando o compartilhamento termina.
- **AC3.** Durante a sessão, um indicador fica sempre visível, com o botão "Parar". Ao parar, a posição deixa de ser enviada e o link expira.
- **AC4.** A sessão termina sozinha na chegada ao destino ou ao fim de um tempo máximo.
- **AC5.** O GPS em segundo plano só é usado com a sessão ativa (exceção ao US-05 AC3, D-20). Com a permissão de localização negada, o app compartilha só o trajeto, sem posição ao vivo `[HIPÓTESE]`.
- **AC6.** O link **só abre no app VoltaSegura** (D-21). Sem o app, a pessoa recebe a orientação para instalar. No app, o contato vê o trajeto, a última posição com o horário da atualização, a chegada estimada e o estado da sessão (em andamento, chegou, encerrada).
- **AC7.** Quando a sessão termina, o servidor apaga trajeto e posições e o link deixa de funcionar.
- **AC8.** O contato não vê dados da conta de quem compartilha nem os números da comparação de exposição `[HIPÓTESE]`.
- **AC9.** Nenhum texto apresenta o compartilhamento como garantia de segurança nem transfere responsabilidade a quem acompanha (RNF-01, RNF-06).
- `[EM ABERTO]` Tempo máximo da sessão, frequência de atualização da posição, critério de chegada e se o contato precisa estar logado para abrir o link (`docs/app-map/12_pendencias_e_lacunas.md`, PL-20 a PL-23).

---

## F2.6 — Seguir rota (navegação no trajeto) · MVP · Mobile · `[DECISÃO — 18/11/2026]` (D-34; revista a US-05 AC3)

**Épico:** E2 — Planejamento do trajeto

> **Status (19/11/2026):** Fase 1 (primeiro plano, com a tela ligada) implementada no código e nos testes de unidade; validação no aparelho pendente. Fases 2 (recálculo) e 3 (segundo plano) implementadas no código, sem validação no aparelho. Itens em aberto: PL-22, PL-24 e PL-28 a PL-32.

**US-23.** Como Ágatha, quero acompanhar minha posição no trajeto escolhido enquanto caminho ou sigo de transporte, para saber o próximo passo sem conferir o mapa a cada trecho.
- **AC1.** Dado uma rota escolhida, quando tocar em "Seguir esta rota" e depois em "Começar", então o app pede a permissão de localização (se ainda não concedida), mostra a posição no trajeto, o trecho atual e o próximo passo. Antes desse toque, o app não lê a posição.
- **AC2.** Antes de começar, o app informa que a posição fica neste aparelho, a não ser que a pessoa esteja compartilhando a viagem (D-21, F2.5), e que ela pode encerrar a qualquer momento.
- **AC3.** Durante a sessão, um indicador fica visível, com o botão "Parar" (alvo de pelo menos 48 dp). O indicador não pode ser ocultado (D-20). `[EM ABERTO]` Rótulo do botão: o app usa "Encerrar" hoje (D-34, item 8).
- **AC4.** A sessão termina sozinha ao chegar ao destino ou ao fim de um tempo máximo `[EM ABERTO]` (valor do tempo máximo e raio de chegada, D-34, item 7).
- **AC5.** Sem histórico: o trajeto percorrido e as posições não são guardados no aparelho nem enviados ao servidor. Ao encerrar, nada da sessão permanece (D-20, D-21).
- **AC6.** Com a sessão ativa e a tela desligada ou o app em segundo plano (Fase 3), a leitura continua só enquanto a sessão durar e com o indicador visível. `[HIPÓTESE]` Depende do GPS em segundo plano no Expo Go (PL-24).
- **AC7.** Ao sair do trajeto, o app avisa e oferece voltar ao resultado. O recálculo a partir da posição atual (Fase 2) fica `[EM ABERTO]`: a posição não pode ir a um serviço fora do aparelho sem decisão, por causa da D-21 (D-34, item 6).
- **AC8.** Nenhum texto apresenta a navegação como garantia de segurança nem diz que o trajeto é "seguro" (`docs/05`, RNF-01).

---

## F3.1 — Calcular N, L e D por alternativa · MVP · SOA, C# · `[DECISÃO]` (DT-03 a DT-06)

**Épico:** E3 — Comparação de exposição estimada

**US-10.** Como Ágatha, quero ver quantos registros de furto e roubo existem perto dos trechos a pé de cada alternativa, para entender a diferença entre elas.

- **AC1.** Para cada alternativa, o sistema calcula `N` (boletins distintos de `FURTO - OUTROS` e `ROUBO - OUTROS` no corredor de ±100 m dos trechos a pé, no período e na faixa do dia corretos), `L` (km a pé) e `D = N/L`.
- **AC2.** Um boletim dentro de corredores sobrepostos da mesma alternativa conta uma vez.
- **AC3.** Um boletim com uma linha de furto e outra de roubo conta uma vez.
- **AC4.** Registros de outras naturezas (carga, veículo, latrocínio, trânsito, homicídio, violência sexual) não alteram `N`.
- **AC5.** Alternativa sem trecho a pé (`L = 0`): o indicador aparece como "não aplicável", nunca como zero.
- **AC6.** Registros sem coordenada válida ou sem período ficam fora da conta e reduzem a cobertura informada.

---

## F3.2 — Regra de destaque · MVP · SOA, C# · `[DECISÃO]` (DT-07)

**Épico:** E3 — Comparação de exposição estimada

**US-11.** Como Ágatha, quero que o app só destaque uma alternativa quando a diferença for clara, para não decidir com base em acaso.

- **AC1.** Dado as duas alternativas com cobertura ≥ 80%, diferença de cobertura ≤ 10 p.p., `N_X + N_Y ≥ 10`, X com `N` e `D` menores e `p < 0,05` nas três larguras, então X aparece como "menor exposição estimada entre as alternativas avaliadas".
- **AC2.** Dado `N` menor em X e `D` menor em Y, então nenhuma é destacada e aparece "indicadores mistos; não há conclusão por ocorrências registradas", com os números. *(13/11/2026: no app, este caso usa o mesmo indicativo de "sem diferença clara", dentro de "Por que esta rota?"; D-11.)*
- **AC3.** Dado `p ≥ 0,05` em qualquer largura, então aparece "sem diferença clara entre os registros", com `N`, `D` e `L`.
- **AC4.** Dado que a alternativa favorecida muda com a largura do corredor, então nenhuma é destacada.
- **AC5.** O app nunca escolhe a rota pelo usuário e não mistura tempo e registros numa nota única.
- **AC6.** `[DECISÃO — 13/11/2026]` (D-12, D-13; `docs/08`) Dado três ou mais candidatas, uma só é apontada como de menor exposição estimada se a regra do AC1 sair a favor dela **contra cada uma das outras**. Dado que alguma candidata tem `L = 0`, nenhuma é apontada naquela consulta.

---

## F3.3 — Resultado "dados insuficientes" · MVP · SOA, Mobile · `[DECISÃO]`

**Épico:** E3 — Comparação de exposição estimada

**US-12.** Como Ágatha, quero saber quando não há dados suficientes para comparar, para não confundir falta de dado com vantagem.

- **AC1.** Dado `N_X + N_Y < 10`, então o resultado é "dados insuficientes", com o motivo "menos de 10 registros no total". *(13/11/2026: essa é a regra no servidor. No app, o motivo aparece sem o limiar, como "poucos registros no total" (D-01; `docs/app-map/08_microcopy.md`, `motivo.amostra`).)*
- **AC2.** Dado cobertura < 80% em alguma alternativa ou diferença > 10 p.p., então "dados insuficientes", com o motivo de cobertura.
- **AC3.** Dado zero registro numa alternativa, o app não a apresenta como vantajosa por isso.

---

## F3.4 — Tela de comparação · MVP · Mobile · `[DECISÃO]`

**Épico:** E3 — Comparação de exposição estimada

**US-13.** Como Ágatha, quero ver lado a lado o tempo e a exposição estimada de cada alternativa, para decidir eu mesma.

- **AC1.** A tela mostra tempo, caminhada e baldeações separados da exposição estimada.
- **AC2.** Há três estados de resultado distintos: "menor exposição estimada entre as alternativas avaliadas", "sem diferença clara entre os registros" e "dados insuficientes".
- **AC3.** Nenhum texto usa "rota segura", "rua perigosa", "área de risco" ou equivalentes (RNF-01).
- **AC4.** As mensagens são redação proposta, não validada com usuários (`docs/08`); a metodologia do teste de compreensão fica registrada para fase posterior.
- **AC5.** `[DECISÃO — 13/11/2026]` (`docs/app-map/01_decisoes.md`, D-01) A tela mostra um **mapa com o trajeto inteiro** da alternativa selecionada e, embaixo, um **container** com as alternativas. Cada alternativa se divide em trechos (ex.: a pé → metrô → a pé → ônibus → a pé), e cada **trecho a pé** tem um botão **"Por que esta rota?"** com os motivos e os dados usados. *(13/11/2026: antes "cada trecho"; restrito aos trechos a pé pela D-08.)*
- **AC6.** `[DECISÃO — 13/11/2026]` (D-01) As frases de situação do `docs/08` **não aparecem na tela principal**, porque expõem a lógica. Um indicativo curto, sem detalhar a regra, aparece dentro do "Por que esta rota?". Os estados do AC2 continuam distintos: o caso conclusivo aparece como **rótulo de foco** "Menor exposição estimada" na rota vencedora (F2.3 AC5), e os demais, como ausência desse rótulo + indicativo. Resolvido em 13/11/2026: conteúdo do botão (só trechos a pé, números da rota inteira, D-08), "Sobre os dados" como linha fixa no container (D-09) e "mistos" com o indicativo de "sem diferença clara" (D-11). Textos propostos em `docs/app-map/08_microcopy.md`.

---

## F4.1 — Bloco "Sobre os dados" · MVP · Mobile · `[DECISÃO]` (`docs/08`)

**Épico:** E4 — Transparência dos dados

**US-14.** Como Ágatha, quero ver de onde vêm os dados e suas limitações, para saber o quanto confiar na comparação.

- **AC1.** O bloco fica sempre visível junto da comparação, separado da exposição estimada, sem nota, escala ou níveis. *(13/11/2026: no app, "sempre visível" é uma linha fixa no container que abre o bloco completo; D-09.)*
- **AC2.** Mostra fonte e período (ex.: "SSP-SP, boletins de jan–set/2026 (9 meses)") e a data de atualização da base.
- **AC3.** Mostra a cobertura de cada alternativa em percentual.
- **AC4.** Mostra a situação da comparação numa das três frases fixas, com o motivo quando faltar dado. *(13/11/2026: no app, como indicativo curto, sem detalhar a regra; D-01, D-11.)*
- **AC5.** Mostra as limitações fixas: subnotificação (zero registro não é ausência de ocorrência); coordenadas podem ser pontos de referência; contagem inclui todos os tipos de local; só furtos e roubos "outros"; horários programados que podem não refletir mudanças recentes.

---

## F4.2 — Categorias de ocorrências e detalhes · MVP · Mobile · `[DECISÃO]` (`docs/07`)

**Épico:** E4 — Transparência dos dados

**US-15.** Como Ágatha, quero ver os totais de furto, roubo e ocorrências de trânsito com detalhes, para entender o contexto.

- **AC1.** ~~A tela principal mostra Furto, Roubo e Ocorrências de trânsito; "Ver detalhes" abre as parcelas de cada grupo.~~ `[DECISÃO — 13/11/2026]` (D-14) A tela **"Dados considerados"**, aberta pelo "Por que esta rota?" e por "Sobre os dados", mostra Furto, Roubo e Ocorrências de trânsito **de cada rota**, no corredor de ±100 m dos trechos a pé (a mesma área de `N`); "Ver detalhes" abre as parcelas de cada grupo. A tela principal não mostra números de ocorrência.
- **AC2.** O app informa que só `FURTO - OUTROS` e `ROUBO - OUTROS` entram na comparação; os totais dos grupos não são apresentados como o valor comparado.
- **AC3.** Homicídio doloso, tentativa de homicídio e violência sexual aparecem só em "Dados considerados / Detalhes", como total do município, com aviso de que não descrevem a rua nem o trajeto.
- **AC4.** Não há marcadores de ocorrências individuais no mapa nem filtros que reduzam o panorama a rua, endereço ou data exata.

---

## F4.3 — Atribuição das fontes · MVP · Mobile · `[DECISÃO]`

**Épico:** E4 — Transparência dos dados

**US-16.** Como Ágatha, quero ver o crédito das fontes de dados abertos, para saber quem as produz.

- **AC1.** O app credita SSP-SP (CC-BY 4.0), SPTrans (GTFS) e "© OpenStreetMap contributors" (ODbL) nas telas de mapa ou em "Sobre os dados".
- **AC2.** Se a camada de iluminação do GeoSampa for usada, crédito e licença CC-BY-SA 4.0 aparecem.

---

## F5.1 — Relatório automático de cobertura por região · MVP · ML, SOA · `[DECISÃO]` (DT-09)

**Épico:** E5 — Qualidade dos dados e vieses (backend)

**US-17.** Como equipe do VoltaSegura, queremos medir a cobertura dos dados por região a cada atualização, para não oferecer, sem avisar, um serviço pior a quem mora onde há menos dados.

- **AC1.** O script calcula, por circunscrição e por subprefeitura, a fração de boletins elegíveis com coordenada e período válidos.
- **AC2.** O relatório é gerado antes do piloto e a cada atualização da base e é publicado com a metodologia.
- **AC3.** O script não altera pesos nem limites; o efeito sobre o app é só o bloqueio por "dados insuficientes" (F3.3).
- `[HIPÓTESE]` Interromper a atualização se a base mudar de formato (colunas ausentes, queda brusca de cobertura, circunscrição sumida).

---

## F5.2 — Atualização das bases · MVP · SOA · `[DECISÃO]`

**Épico:** E5 — Qualidade dos dados e vieses (backend)

**US-18.** Como equipe, queremos atualizar GTFS e SSP-SP de forma reprodutível, para manter as alternativas e a contagem atuais.

- **AC1.** O download do GTFS é feito por script; a cada novo arquivo, conferir as janelas das linhas Metrô 6 e 17.
- **AC2.** A base SSP-SP usada (arquivo e SHA256) fica registrada em `src/ml/dados/README.md`.
- **AC3.** O app mostra a data de atualização de cada base (F4.1).

---

## F6.1 — Consultas não armazenadas · MVP · SOA, Cyber · `[DECISÃO]` (DT-08)

**Épico:** E6 — Segurança e proteção de dados

**US-19.** Como Ágatha, quero que minhas origens e destinos não fiquem guardados, para que ninguém descubra onde moro ou minha rotina.

- **AC1.** O servidor usa origem, destino e horário só para calcular a resposta e não os grava em banco.
- **AC2.** Os logs técnicos não contêm coordenadas, endereços nem o identificador da conta.
- **AC3.** O roteamento roda em servidor próprio; a consulta não é enviada a serviços externos de mapas.
- **AC4.** `[DECISÃO — 13/11/2026]` (D-21) A única exceção ao AC1 é a sessão de compartilhamento (F2.5): o trajeto compartilhado e a última posição ficam no servidor **só enquanto a sessão durar** e são apagados ao encerrar; os logs continuam sem coordenadas (AC2).

---

## F6.2 — Nada de registros individuais no app · MVP · SOA, Cyber · `[DECISÃO]` (`docs/08`)

**Épico:** E6 — Segurança e proteção de dados

**US-20.** Como cidadão, quero que o app não exponha boletins individuais, para que vítimas não sejam identificáveis.

- **AC1.** A API devolve só resultados agregados (`N`, `D`, `L`, cobertura); nunca coordenadas ou dados de boletins individuais.
- **AC2.** Recortes que permitam identificar pessoas não são exibidos.

---

## F7.1 — Rotina e aviso antes de sair · MVP **(Depende do tempo)** · Mobile · `[DECISÃO — 15/11/2026]` (gatilho decidido, ver AC2) (`docs/app-map/01_decisoes.md`, D-31)

**Épico:** E7 — VoltaSegura+

> Versão mínima, sem pagamento. Se o prazo de 19/11 apertar, fica para depois, sem afetar as demais features.

**US-22.** Como Ágatha, quero cadastrar minha rotina de volta e receber um aviso antes de sair, para me planejar sem repetir a busca.

- **AC1.** Dado a tela da rotina, quando a usuária cadastrar um trajeto fixo (origem, destino, dias e horário de saída), então ele fica salvo **só no aparelho**.
- **AC2.** Dado uma rotina ativa, quando chegar o horário do aviso, então o app envia uma notificação local antes da saída. `[DECISÃO — 15/11/2026]` (D-31) O gatilho é um **lembrete por horário**: N minutos antes da saída (padrão 15), nos dias da rotina, **sem tempo real e sem servidor**. Texto: "Hora de sair: sua rotina de {dia} às {hora}. Compare os caminhos antes de sair." Tocar na notificação abre a tela inicial com origem, destino e saída da rotina. `[HIPÓTESE]` antecedência de 5, 10, 15 ou 30 min; até 5 rotinas; origem e destino entre os lugares salvos.
- **AC3.** A rotina pode ser editada, desativada e apagada, e nunca é enviada ao servidor nem vinculada à conta (DT-08).
- **AC4.** Dado a permissão de notificações negada, então o app informa que o aviso não será enviado e a rotina continua salva.
- **AC5.** Nenhum texto promete segurança ou usa "rota segura" (RNF-01); a tela identifica o VoltaSegura+ como recurso em validação, sem preço.
- `[DECISÃO — 15/11/2026]` O aviso **não** informa mudança no resultado: só o horário (sem tempo real).
- `[EM ABERTO]` Cobrança real; aviso com dados em tempo real (roadmap, P-08).

---
