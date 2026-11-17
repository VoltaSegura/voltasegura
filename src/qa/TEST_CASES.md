# Test Cases do VoltaSegura para o Azure Boards

> **Rascunho de 16/11/2026**, derivado de `docs/10_backlog_produto.md` (v1.10) e da matriz `docs/app-map/10_rastreabilidade.md` (os `T-xx.y` da matriz foram reaproveitados e ampliados com preparação, inputs, passos e saída esperada). Caixa-preta, para aceitação e homologação (`docs/02` §8).
>
> **Tipo:** **+** positivo · **−** negativo. Cada Feature do MVP tem pelo menos um caso de cada tipo. Os cenários com `fixture` usam os casos de teste do mock do app (`conclusivo`, `sem_diferenca`, `mistos`, `insuficiente_amostra`, `insuficiente_cobertura`, `insuficiente_largura`, `nao_aplicavel`, `uma_rota`, `sem_servico`).
>
> **Antes de cadastrar no Azure:** conferir cada caso rodando o app (nada aqui foi executado; os casos são especificações). Os de "Backend" ficam com quem cuida do servidor. **F1.3 (exclusão de conta) está adiada (D-25)** e não tem Test Cases neste lote; os casos T-03.1 a T-03.3 estão na matriz.

## Cobertura por Feature

| Feature | Casos | Positivo | Negativo |
|---|---|---|---|
| F1.1 | TC-01.1, TC-01.2, TC-01.3, TC-01.4, TC-01.6 | 2 | 3 |
| F1.2 | TC-02.1, TC-02.2, TC-02.3 | 1 | 2 |
| F1.4 | TC-04.1, TC-04.2, TC-04.3 | 1 | 2 |
| F1.5 | TC-05.1, TC-05.2 | 1 | 1 |
| F2.1 | TC-06.1, TC-06.2, TC-06.3, TC-06.4 | 1 | 3 |
| F2.2 | TC-07.1, TC-07.2, TC-07.3 | 2 | 1 |
| F2.3 | TC-08.1, TC-08.2, TC-08.3, TC-08.4 | 2 | 2 |
| F2.4 | TC-09.1, TC-09.2 | 1 | 1 |
| F2.5 | TC-10.1, TC-10.2, TC-10.3, TC-10.4 | 2 | 2 |
| F3.1 | TC-11.1, TC-11.2, TC-11.3 | 1 | 2 |
| F3.2 | TC-12.1, TC-12.2, TC-12.3, TC-12.4 | 1 | 3 |
| F3.3 | TC-13.1, TC-13.2, TC-13.3, TC-13.4 | 1 | 3 |
| F3.4 | TC-14.1, TC-14.2, TC-14.3 | 2 | 1 |
| F4.1 | TC-15.1, TC-15.2, TC-15.3 | 2 | 1 |
| F4.2 | TC-16.1, TC-16.2 | 1 | 1 |
| F4.3 | TC-17.1, TC-17.2 | 1 | 1 |
| F5.1 | TC-18.1, TC-18.2 | 1 | 1 |
| F5.2 | TC-19.1, TC-19.2, TC-19.3 | 2 | 1 |
| F6.1 | TC-20.1, TC-20.2, TC-20.3, TC-20.4 | 1 | 3 |
| F6.2 | TC-21.1, TC-21.2, TC-21.3 | 1 | 2 |
| F7.1 | TC-22.1, TC-22.2, TC-22.3, TC-22.4 | 2 | 2 |
| RNF-01, RNF-02, RNF-06 | TC-RNF-01 | 0 | 1 |
| RNF-03, RNF-04 | TC-RNF-03 | 0 | 1 |
| RNF-07 | TC-RNF-07 | 1 | 0 |
| RNF-08, RNF-09 | TC-RNF-08 | 0 | 1 |

**Total: 71 Test Cases.**

---

### TC-01.1 — Confirmar que o cadastro pede só e-mail e senha.

| Campo | Conteúdo |
|---|---|
| Feature | F1.1 |
| Critério | US-01 AC1 |
| Tipo | Positivo |
| Objetivo | Confirmar que o cadastro pede só e-mail e senha. |
| Preparação | App aberto, sem sessão, na tela de cadastro (TL-02). |
| Inputs | Nenhum. |
| Resultado esperado | Só os campos e-mail e senha (mais o aceite do aviso); sem nome completo, telefone ou endereço. |

**Passos:**
1. Abrir a tela de cadastro.
2. Listar os campos exibidos.

### TC-01.2 — Recusar o cadastro sem aceite do aviso de privacidade.

| Campo | Conteúdo |
|---|---|
| Feature | F1.1 |
| Critério | US-01 AC2 |
| Tipo | Negativo |
| Objetivo | Recusar o cadastro sem aceite do aviso de privacidade. |
| Preparação | Tela de cadastro; e-mail ainda não cadastrado. |
| Inputs | E-mail válido novo; senha válida; aviso **não** marcado. |
| Resultado esperado | Conta não criada; o motivo (falta aceitar o aviso) é exibido. |

**Passos:**
1. Preencher e-mail e senha.
2. Deixar o aviso desmarcado.
3. Tocar em criar conta.

### TC-01.3 — Recusar e-mail já cadastrado.

| Campo | Conteúdo |
|---|---|
| Feature | F1.1 |
| Critério | US-01 AC3 |
| Tipo | Negativo |
| Objetivo | Recusar e-mail já cadastrado. |
| Preparação | Existe conta com o e-mail usado. |
| Inputs | E-mail já existente; senha válida; aviso marcado. |
| Resultado esperado | Cadastro recusado com mensagem clara; nenhuma conta nova. |

**Passos:**
1. Preencher os campos.
2. Marcar o aviso.
3. Enviar.

### TC-01.4 — Recusar e-mail em formato inválido e senha vazia.

| Campo | Conteúdo |
|---|---|
| Feature | F1.1 |
| Critério | US-01 AC4 |
| Tipo | Negativo |
| Objetivo | Recusar e-mail em formato inválido e senha vazia. |
| Preparação | Tela de cadastro. |
| Inputs | E-mail `agatha@exemplo`; senha vazia. |
| Resultado esperado | Cadastro recusado; os dois campos com problema são indicados. |

**Passos:**
1. Digitar o e-mail inválido.
2. Deixar a senha vazia.
3. Enviar.

### TC-01.6 — Conferir que o aviso é minuta acadêmica e não afirma conformidade com a LGPD.

| Campo | Conteúdo |
|---|---|
| Feature | F1.1 |
| Critério | US-01 AC6 |
| Tipo | Positivo |
| Objetivo | Conferir que o aviso é minuta acadêmica e não afirma conformidade com a LGPD. |
| Preparação | Tela de cadastro. |
| Inputs | Nenhum. |
| Resultado esperado | Aparece "Minuta acadêmica, sem revisão jurídica"; nenhum trecho afirma estar em conformidade com a LGPD. |

**Passos:**
1. Abrir o aviso de privacidade (TL-13).
2. Ler o texto.

### TC-02.1 — Entrar com credenciais corretas.

| Campo | Conteúdo |
|---|---|
| Feature | F1.2 |
| Critério | US-02 AC1 |
| Tipo | Positivo |
| Objetivo | Entrar com credenciais corretas. |
| Preparação | Conta existente. |
| Inputs | E-mail e senha corretos. |
| Resultado esperado | O app abre a tela de planejamento (TL-04). |

**Passos:**
1. Abrir a tela de login.
2. Informar as credenciais.
3. Entrar.

### TC-02.2 — Negar acesso com mensagem genérica.

| Campo | Conteúdo |
|---|---|
| Feature | F1.2 |
| Critério | US-02 AC2 |
| Tipo | Negativo |
| Objetivo | Negar acesso com mensagem genérica. |
| Preparação | Conta existente; e-mail inexistente conhecido. |
| Inputs | (a) e-mail certo e senha errada; (b) e-mail inexistente. |
| Resultado esperado | Acesso negado nos dois casos, com a **mesma** mensagem, sem revelar qual dado está errado. |

**Passos:**
1. Tentar o caso (a).
2. Anotar a mensagem.
3. Tentar o caso (b).
4. Comparar as mensagens.

### TC-02.3 — Exigir login para consultar trajetos.

| Campo | Conteúdo |
|---|---|
| Feature | F1.2 |
| Critério | US-02 AC3 |
| Tipo | Negativo |
| Objetivo | Exigir login para consultar trajetos. |
| Preparação | App sem sessão. |
| Inputs | Abrir diretamente uma rota interna (ex.: planejamento). |
| Resultado esperado | O app leva à tela de abertura/login; a consulta não é permitida. |

**Passos:**
1. Abrir o app sem entrar.
2. Tentar chegar ao planejamento.

### TC-04.1 — Não gravar histórico com a opção desligada (padrão).

| Campo | Conteúdo |
|---|---|
| Feature | F1.4 |
| Critério | US-04 AC1 |
| Tipo | Negativo |
| Objetivo | Não gravar histórico com a opção desligada (padrão). |
| Preparação | Sessão ativa; histórico desligado. |
| Inputs | Uma consulta válida. |
| Resultado esperado | Nada é salvo no aparelho; "Recentes" vazio. |

**Passos:**
1. Confirmar que o histórico está desligado.
2. Fazer uma consulta.
3. Abrir "Recentes".

### TC-04.2 — Salvar, listar e apagar trajetos no aparelho.

| Campo | Conteúdo |
|---|---|
| Feature | F1.4 |
| Critério | US-04 AC2 e AC3 |
| Tipo | Positivo |
| Objetivo | Salvar, listar e apagar trajetos no aparelho. |
| Preparação | Sessão ativa; histórico ligado. |
| Inputs | Duas consultas válidas. |
| Resultado esperado | As consultas aparecem em "Recentes"; ao apagar, somem da lista e do aparelho. |

**Passos:**
1. Ligar o histórico.
2. Fazer duas consultas.
3. Conferir "Recentes".
4. Apagar um item e depois todos.

### TC-04.3 — Garantir que histórico e locais salvos não saem do aparelho.

| Campo | Conteúdo |
|---|---|
| Feature | F1.4 |
| Critério | US-04 AC4 |
| Tipo | Negativo |
| Objetivo | Garantir que histórico e locais salvos não saem do aparelho. |
| Preparação | Histórico ligado; ferramenta para observar as chamadas de rede. |
| Inputs | Salvar um local "Faculdade" e fazer uma consulta. |
| Resultado esperado | Nenhuma chamada leva o histórico ou os locais salvos ao servidor. |

**Passos:**
1. Salvar o local e fazer a consulta.
2. Observar o tráfego do app.

### TC-05.1 — Usar a localização atual como origem só por ação da pessoa.

| Campo | Conteúdo |
|---|---|
| Feature | F1.5 |
| Critério | US-05 AC1 |
| Tipo | Positivo |
| Objetivo | Usar a localização atual como origem só por ação da pessoa. |
| Preparação | Permissão de GPS ainda não concedida. |
| Inputs | Toque em "usar minha localização". |
| Resultado esperado | O app pede a permissão e preenche a origem. |

**Passos:**
1. Tocar em "usar minha localização".
2. Conceder a permissão.

### TC-05.2 — Seguir funcionando com a permissão negada.

| Campo | Conteúdo |
|---|---|
| Feature | F1.5 |
| Critério | US-05 AC2 |
| Tipo | Negativo |
| Objetivo | Seguir funcionando com a permissão negada. |
| Preparação | Permissão de GPS negada. |
| Inputs | Escolher a origem no mapa ou num local salvo. |
| Resultado esperado | A pessoa consegue escolher a origem normalmente; o app não insiste nem trava. |

**Passos:**
1. Negar a permissão.
2. Escolher a origem pelo mapa.
3. Escolher por um local salvo.

### TC-06.1 — Consultar alternativas com origem, destino e horário válidos.

| Campo | Conteúdo |
|---|---|
| Feature | F2.1 |
| Critério | US-06 AC1 |
| Tipo | Positivo |
| Objetivo | Consultar alternativas com origem, destino e horário válidos. |
| Preparação | Sessão ativa; pontos dentro do município de São Paulo. |
| Inputs | Origem e destino válidos; horário 22h30. |
| Resultado esperado | A consulta é enviada e o resultado (mapa + container) é exibido. |

**Passos:**
1. Escolher origem e destino.
2. Definir o horário.
3. Pedir as alternativas.

### TC-06.2 — Impedir consulta com destino vazio.

| Campo | Conteúdo |
|---|---|
| Feature | F2.1 |
| Critério | US-06 AC2 |
| Tipo | Negativo |
| Objetivo | Impedir consulta com destino vazio. |
| Preparação | Planejamento aberto. |
| Inputs | Origem preenchida; destino vazio. |
| Resultado esperado | A consulta não é enviada e o campo faltante é indicado. |

**Passos:**
1. Preencher só a origem.
2. Pedir as alternativas.

### TC-06.3 — Recusar ponto fora do município.

| Campo | Conteúdo |
|---|---|
| Feature | F2.1 |
| Critério | US-06 AC3 |
| Tipo | Negativo |
| Objetivo | Recusar ponto fora do município. |
| Preparação | Planejamento aberto. |
| Inputs | Destino fora de São Paulo (ex.: outro município). |
| Resultado esperado | O app informa que está fora da área atendida e não envia a consulta. |

**Passos:**
1. Escolher um ponto fora do município.
2. Pedir as alternativas.

### TC-06.4 — Recusar origem igual ao destino.

| Campo | Conteúdo |
|---|---|
| Feature | F2.1 |
| Critério | US-06 AC4 |
| Tipo | Negativo |
| Objetivo | Recusar origem igual ao destino. |
| Preparação | Planejamento aberto. |
| Inputs | Mesmo ponto nos dois campos. |
| Resultado esperado | O app informa que não há trajeto a calcular. |

**Passos:**
1. Escolher o mesmo ponto nos dois campos.
2. Pedir as alternativas.

### TC-07.1 — Planejar a volta invertendo origem e destino.

| Campo | Conteúdo |
|---|---|
| Feature | F2.2 |
| Critério | US-07 AC1 |
| Tipo | Positivo |
| Objetivo | Planejar a volta invertendo origem e destino. |
| Preparação | Ida já planejada (resultado aberto). |
| Inputs | Horário da volta diferente da ida. |
| Resultado esperado | Origem e destino aparecem invertidos e o horário da volta pode ser definido à parte. |

**Passos:**
1. Tocar em planejar a volta.
2. Conferir origem e destino.
3. Definir outro horário.

### TC-07.2 — Usar o período da SSP do horário da volta.

| Campo | Conteúdo |
|---|---|
| Feature | F2.2 |
| Critério | US-07 AC2 |
| Tipo | Positivo |
| Objetivo | Usar o período da SSP do horário da volta. |
| Preparação | Ida às 18h e volta às 23h, mesmo par de pontos. |
| Inputs | Consultas de ida (18h) e de volta (23h). |
| Resultado esperado | A volta mostra o período "noite (18h–23h)" conforme o horário da volta, não o da ida. |

**Passos:**
1. Consultar a ida e abrir "Por que esta rota?".
2. Consultar a volta e abrir "Por que esta rota?".

### TC-08.1 — Exibir os dados de cada alternativa e marcar horários como previstos.

| Campo | Conteúdo |
|---|---|
| Feature | F2.3 |
| Critério | US-08 AC1 e AC3 |
| Tipo | Positivo |
| Objetivo | Exibir os dados de cada alternativa e marcar horários como previstos. |
| Preparação | Consulta válida com várias alternativas. |
| Inputs | Qualquer consulta válida. |
| Resultado esperado | Cada alternativa mostra duração, km a pé, baldeações, modos, linhas e horário; todo horário vem como "previsto" ou com o aviso de horários previstos (GTFS). |

**Passos:**
1. Consultar.
2. Ler cada card de alternativa.

### TC-08.2 — Informar a falta de transporte público no horário.

| Campo | Conteúdo |
|---|---|
| Feature | F2.3 |
| Critério | US-08 AC2 |
| Tipo | Negativo |
| Objetivo | Informar a falta de transporte público no horário. |
| Preparação | Cenário sem serviço (fixture `sem_servico`, ou horário/trajeto sem alternativa). |
| Inputs | Consulta sem alternativa de transporte. |
| Resultado esperado | Aviso de que não há alternativa de transporte público; nenhuma comparação é exibida. |

**Passos:**
1. Consultar o cenário sem serviço.

### TC-08.3 — Não comparar exposição com uma só alternativa.

| Campo | Conteúdo |
|---|---|
| Feature | F2.3 |
| Critério | US-08 AC4 |
| Tipo | Negativo |
| Objetivo | Não comparar exposição com uma só alternativa. |
| Preparação | Cenário com uma única alternativa (fixture `uma_rota`). |
| Inputs | Consulta que devolve uma rota. |
| Resultado esperado | A rota é exibida sem foco de exposição e com o aviso de que não há comparação. |

**Passos:**
1. Consultar o cenário de uma rota.

### TC-08.4 — Mostrar até 3 rotas, com a de menor exposição primeiro quando houver.

| Campo | Conteúdo |
|---|---|
| Feature | F2.3 |
| Critério | US-08 AC5 |
| Tipo | Positivo |
| Objetivo | Mostrar até 3 rotas, com a de menor exposição primeiro quando houver. |
| Preparação | Cenário conclusivo (fixture `conclusivo`). |
| Inputs | Consulta com várias candidatas. |
| Resultado esperado | No máximo 3 rotas; a de menor exposição estimada vem primeiro, selecionada e com o rótulo em destaque; nenhum rótulo "por segurança". |

**Passos:**
1. Consultar.
2. Contar as rotas e ver a ordem e os rótulos.

### TC-09.1 — Listar o passo a passo em ordem.

| Campo | Conteúdo |
|---|---|
| Feature | F2.4 |
| Critério | US-09 AC1 |
| Tipo | Positivo |
| Objetivo | Listar o passo a passo em ordem. |
| Preparação | Alternativa escolhida no resultado. |
| Inputs | Abrir os detalhes da rota. |
| Resultado esperado | Trechos em ordem, com pontos de embarque e desembarque; apenas leitura. |

**Passos:**
1. Selecionar uma alternativa.
2. Abrir os detalhes (TL-08).

### TC-09.2 — Garantir que não há navegação ao vivo.

| Campo | Conteúdo |
|---|---|
| Feature | F2.4 |
| Critério | Decisão D-04 |
| Tipo | Negativo |
| Objetivo | Garantir que não há navegação ao vivo. |
| Preparação | Detalhes da rota abertos. |
| Inputs | Nenhum. |
| Resultado esperado | Não existe navegação ao vivo; o passo a passo é só de leitura. |

**Passos:**
1. Procurar botão ou comportamento de iniciar navegação ou seguir a posição.

### TC-10.1 — Iniciar um compartilhamento e informar o que o contato verá. *(protótipo com mock)*

| Campo | Conteúdo |
|---|---|
| Feature | F2.5 |
| Critério | US-21 AC1 e AC2 |
| Tipo | Positivo |
| Objetivo | Iniciar um compartilhamento e informar o que o contato verá. *(protótipo com mock)* |
| Preparação | Sessão ativa; rota escolhida; Feature em protótipo. |
| Inputs | Rota escolhida; confirmar. |
| Resultado esperado | A confirmação lista trajeto, posição e chegada estimada e quando termina; a sessão é criada e o link é gerado. |

**Passos:**
1. Tocar em "Compartilhar minha volta".
2. Ler a confirmação.
3. Confirmar.

### TC-10.2 — Parar o compartilhamento e invalidar o link.

| Campo | Conteúdo |
|---|---|
| Feature | F2.5 |
| Critério | US-21 AC3 e AC7 |
| Tipo | Positivo |
| Objetivo | Parar o compartilhamento e invalidar o link. |
| Preparação | Sessão de compartilhamento ativa. |
| Inputs | Toque em "Parar". |
| Resultado esperado | O indicador some, a posição deixa de ser enviada e o link mostra que a viagem terminou, sem dados. |

**Passos:**
1. Verificar o indicador visível.
2. Tocar em Parar.
3. Abrir o link de acompanhamento.

### TC-10.3 — Compartilhar só o trajeto se a localização em segundo plano for negada.

| Campo | Conteúdo |
|---|---|
| Feature | F2.5 |
| Critério | US-21 AC5 |
| Tipo | Negativo |
| Objetivo | Compartilhar só o trajeto se a localização em segundo plano for negada. |
| Preparação | Sessão ativa; permissão de segundo plano negada. |
| Inputs | Iniciar o compartilhamento. |
| Resultado esperado | Compartilha só o trajeto, sem posição ao vivo; fora da sessão, nenhuma leitura em segundo plano. |

**Passos:**
1. Negar a permissão de segundo plano.
2. Iniciar o compartilhamento.

### TC-10.4 — Garantir que o contato não vê dados da conta nem números de exposição, e que não há promessa de segurança.

| Campo | Conteúdo |
|---|---|
| Feature | F2.5 |
| Critério | US-21 AC8 e AC9 |
| Tipo | Negativo |
| Objetivo | Garantir que o contato não vê dados da conta nem números de exposição, e que não há promessa de segurança. |
| Preparação | Sessão ativa e link aberto no app do contato. |
| Inputs | Abrir o acompanhamento (TL-15). |
| Resultado esperado | Sem e-mail da conta nem números de exposição; nenhum texto promete segurança ou transfere responsabilidade ao contato. |

**Passos:**
1. Abrir o link como contato.
2. Ler a tela e a resposta.

### TC-11.1 — Calcular N, L e D por alternativa, contando uma vez o boletim em corredores sobrepostos.

| Campo | Conteúdo |
|---|---|
| Feature | F3.1 |
| Critério | US-10 AC1 e AC2 |
| Tipo | Positivo |
| Objetivo | Calcular N, L e D por alternativa, contando uma vez o boletim em corredores sobrepostos. |
| Preparação | Servidor com base de teste conhecida; trajeto de teste com resultado calculado à mão. |
| Inputs | Trajeto de teste com um boletim no cruzamento de dois trechos a pé. |
| Resultado esperado | N, L e D batem com o esperado; o boletim do cruzamento conta 1. O app exibe os valores da resposta sem recalcular. |

**Passos:**
1. Consultar o trajeto de teste.
2. Comparar N, L e D da resposta com o esperado.

### TC-11.2 — Garantir que outras naturezas não alteram N.

| Campo | Conteúdo |
|---|---|
| Feature | F3.1 |
| Critério | US-10 AC4 |
| Tipo | Negativo |
| Objetivo | Garantir que outras naturezas não alteram N. |
| Preparação | Base de teste com registros de carga, veículo, latrocínio, trânsito e homicídio no corredor. |
| Inputs | Trajeto de teste. |
| Resultado esperado | N considera só `FURTO - OUTROS` e `ROUBO - OUTROS`; as demais naturezas não mudam o valor. |

**Passos:**
1. Consultar o trajeto.
2. Conferir N.

### TC-11.3 — Mostrar "não aplicável" quando não há trecho a pé.

| Campo | Conteúdo |
|---|---|
| Feature | F3.1 |
| Critério | US-10 AC5 |
| Tipo | Negativo |
| Objetivo | Mostrar "não aplicável" quando não há trecho a pé. |
| Preparação | Alternativa sem trecho a pé (`L = 0`), fixture `nao_aplicavel`. |
| Inputs | Consulta com rota sem caminhada. |
| Resultado esperado | Aparece "não aplicável", nunca zero; não há botão "Por que esta rota?" na rota sem trecho a pé. |

**Passos:**
1. Consultar.
2. Ver o indicador dessa rota.

### TC-12.1 — Destacar a menor exposição só quando a regra conclui.

| Campo | Conteúdo |
|---|---|
| Feature | F3.2 |
| Critério | US-11 AC1 |
| Tipo | Positivo |
| Objetivo | Destacar a menor exposição só quando a regra conclui. |
| Preparação | Fixture `conclusivo`. |
| Inputs | Consulta conclusiva. |
| Resultado esperado | Só a rota vencedora recebe o rótulo "menor exposição estimada"; o indicativo está no "Por que esta rota?". |

**Passos:**
1. Consultar.
2. Conferir o rótulo e o "Por que esta rota?".

### TC-12.2 — Não destacar quando os indicadores são mistos.

| Campo | Conteúdo |
|---|---|
| Feature | F3.2 |
| Critério | US-11 AC2 |
| Tipo | Negativo |
| Objetivo | Não destacar quando os indicadores são mistos. |
| Preparação | Fixture `mistos`. |
| Inputs | Consulta com N menor em uma rota e D menor em outra. |
| Resultado esperado | Nenhuma rota recebe o foco de exposição; o indicativo é o de "sem diferença clara". |

**Passos:**
1. Consultar.
2. Conferir rótulos e indicativo.

### TC-12.3 — Não destacar sem diferença clara nem quando a largura muda o resultado.

| Campo | Conteúdo |
|---|---|
| Feature | F3.2 |
| Critério | US-11 AC3 e AC4 |
| Tipo | Negativo |
| Objetivo | Não destacar sem diferença clara nem quando a largura muda o resultado. |
| Preparação | Fixtures `sem_diferenca` e `insuficiente_largura`. |
| Inputs | As duas consultas. |
| Resultado esperado | Sem foco de exposição em ambas; `sem_diferenca` mostra N, D e L; a outra mostra o motivo em linguagem simples. |

**Passos:**
1. Consultar `sem_diferenca`.
2. Consultar `insuficiente_largura`.

### TC-12.4 — Garantir que o app não elege a rota nem cria nota única.

| Campo | Conteúdo |
|---|---|
| Feature | F3.2 |
| Critério | US-11 AC5 |
| Tipo | Negativo |
| Objetivo | Garantir que o app não elege a rota nem cria nota única. |
| Preparação | Qualquer resultado. |
| Inputs | Percorrer todas as fixtures. |
| Resultado esperado | Nenhuma tela mostra nota ou "recomendada"; todas as rotas continuam visíveis e selecionáveis. |

**Passos:**
1. Percorrer as fixtures.
2. Procurar nota, estrela, escala, "recomendada".

### TC-13.1 — Informar "dados insuficientes" por amostra pequena.

| Campo | Conteúdo |
|---|---|
| Feature | F3.3 |
| Critério | US-12 AC1 |
| Tipo | Negativo |
| Objetivo | Informar "dados insuficientes" por amostra pequena. |
| Preparação | Fixture `insuficiente_amostra`. |
| Inputs | Consulta com poucos registros no total. |
| Resultado esperado | "Dados insuficientes" com o motivo "poucos registros no total"; sem ordenar por exposição e sem mostrar o limiar "10". |

**Passos:**
1. Consultar.
2. Ler o motivo.

### TC-13.2 — Informar "dados insuficientes" por cobertura baixa.

| Campo | Conteúdo |
|---|---|
| Feature | F3.3 |
| Critério | US-12 AC2 |
| Tipo | Negativo |
| Objetivo | Informar "dados insuficientes" por cobertura baixa. |
| Preparação | Fixture `insuficiente_cobertura`. |
| Inputs | Consulta com cobertura < 80% ou diferença > 10 p.p. |
| Resultado esperado | "Dados insuficientes" com o motivo de cobertura, sem qualificar a região. |

**Passos:**
1. Consultar.
2. Ler o motivo.

### TC-13.3 — Não tratar zero registro como vantagem.

| Campo | Conteúdo |
|---|---|
| Feature | F3.3 |
| Critério | US-12 AC3 |
| Tipo | Negativo |
| Objetivo | Não tratar zero registro como vantagem. |
| Preparação | Rota com 0 registros em caso não conclusivo. |
| Inputs | Consulta correspondente. |
| Resultado esperado | A rota não recebe foco por ter 0 registros; a frase de limitação (subnotificação) está visível. |

**Passos:**
1. Consultar.
2. Ver rótulos da rota com 0 registros.

### TC-14.1 — Exibir mapa com o trajeto inteiro e container separado da exposição.

| Campo | Conteúdo |
|---|---|
| Feature | F3.4 |
| Critério | US-13 AC1 e AC5 |
| Tipo | Positivo |
| Objetivo | Exibir mapa com o trajeto inteiro e container separado da exposição. |
| Preparação | Resultado aberto. |
| Inputs | Trocar de rota nos cards. |
| Resultado esperado | O mapa mostra a rota inteira e troca o traço com o card; o card não mostra números de registro; o botão aparece só em trecho a pé. |

**Passos:**
1. Consultar.
2. Ver o card (tempo, a pé, trocas).
3. Trocar o card selecionado.

### TC-14.2 — Distinguir os três estados de resultado.

| Campo | Conteúdo |
|---|---|
| Feature | F3.4 |
| Critério | US-13 AC2 |
| Tipo | Positivo |
| Objetivo | Distinguir os três estados de resultado. |
| Preparação | Fixtures conclusiva, `sem_diferenca` e insuficientes. |
| Inputs | Percorrer as fixtures. |
| Resultado esperado | Cada caso tem tela/indicativo próprio: menor exposição estimada, sem diferença clara e dados insuficientes. |

**Passos:**
1. Consultar cada fixture.
2. Anotar o que a tela mostra.

### TC-14.3 — Garantir que a tela principal não expõe a lógica.

| Campo | Conteúdo |
|---|---|
| Feature | F3.4 |
| Critério | US-13 AC6 |
| Tipo | Negativo |
| Objetivo | Garantir que a tela principal não expõe a lógica. |
| Preparação | Resultado aberto e "Por que esta rota?". |
| Inputs | Nenhum. |
| Resultado esperado | Nenhuma frase de situação na tela principal; nenhum desses termos no "Por que esta rota?". |

**Passos:**
1. Procurar as frases de situação na tela principal.
2. Procurar "80%", "10 p.p.", "p <" e "corredor" no "Por que esta rota?".

### TC-15.1 — Mostrar fonte, período, cobertura e situação em "Sobre os dados".

| Campo | Conteúdo |
|---|---|
| Feature | F4.1 |
| Critério | US-14 AC1 a AC4 |
| Tipo | Positivo |
| Objetivo | Mostrar fonte, período, cobertura e situação em "Sobre os dados". |
| Preparação | Resultado aberto. |
| Inputs | Abrir "Sobre os dados" a partir do container. |
| Resultado esperado | Fonte e período (ex.: SSP-SP, jan–set/2026), datas de atualização, cobertura em % por rota e a situação com motivo; sem nota, escala ou níveis. |

**Passos:**
1. Ver a linha fixa "Dados: …".
2. Abrir o bloco.
3. Conferir fonte, período, atualização, cobertura e situação.

### TC-15.2 — Mostrar as cinco limitações fixas.

| Campo | Conteúdo |
|---|---|
| Feature | F4.1 |
| Critério | US-14 AC5 |
| Tipo | Positivo |
| Objetivo | Mostrar as cinco limitações fixas. |
| Preparação | "Sobre os dados" aberto. |
| Inputs | Nenhum. |
| Resultado esperado | Aparecem: subnotificação, coordenadas como referência, todos os tipos de local, só furtos e roubos "outros", horários programados. |

**Passos:**
1. Ler as limitações.

### TC-16.1 — Mostrar furto, roubo e trânsito por rota em "Dados considerados".

| Campo | Conteúdo |
|---|---|
| Feature | F4.2 |
| Critério | US-15 AC1 e AC2 |
| Tipo | Positivo |
| Objetivo | Mostrar furto, roubo e trânsito por rota em "Dados considerados". |
| Preparação | Resultado aberto. |
| Inputs | Abrir "Dados considerados". |
| Resultado esperado | Abas por rota com Furto, Roubo e Trânsito e as parcelas; aviso de recorte; a parcela comparada identificada em texto; a tela principal sem números. |

**Passos:**
1. Abrir a tela pelo "Por que esta rota?".
2. Alternar as abas de cada rota.
3. Abrir "Ver detalhes".

### TC-16.2 — Garantir que não há marcadores individuais nem filtros por rua ou data.

| Campo | Conteúdo |
|---|---|
| Feature | F4.2 |
| Critério | US-15 AC3 e AC4 |
| Tipo | Negativo |
| Objetivo | Garantir que não há marcadores individuais nem filtros por rua ou data. |
| Preparação | Mapa e "Dados considerados" abertos. |
| Inputs | Nenhum. |
| Resultado esperado | Nenhum marcador nem filtro; o panorama só abre por ação deliberada, como total do município, com aviso de que não descreve a rua nem o trajeto. |

**Passos:**
1. Procurar marcadores de ocorrência no mapa.
2. Procurar filtro por rua, endereço ou data.
3. Abrir o panorama do município (homicídio, violência sexual).

### TC-17.1 — Creditar as fontes de dados abertos.

| Campo | Conteúdo |
|---|---|
| Feature | F4.3 |
| Critério | US-16 AC1 |
| Tipo | Positivo |
| Objetivo | Creditar as fontes de dados abertos. |
| Preparação | Mapa e "Sobre os dados" abertos. |
| Inputs | Nenhum. |
| Resultado esperado | Créditos a SSP-SP (CC-BY 4.0), SPTrans (GTFS) e "© OpenStreetMap contributors" (ODbL). |

**Passos:**
1. Procurar os créditos no mapa.
2. Procurar em "Sobre os dados".

### TC-17.2 — Não creditar a iluminação enquanto ela não for usada.

| Campo | Conteúdo |
|---|---|
| Feature | F4.3 |
| Critério | US-16 AC2 |
| Tipo | Negativo |
| Objetivo | Não creditar a iluminação enquanto ela não for usada. |
| Preparação | App do MVP. |
| Inputs | Nenhum. |
| Resultado esperado | Não há camada de iluminação nem o crédito dela (fica para a fase 3). |

**Passos:**
1. Procurar camada ou crédito de iluminação do GeoSampa.

### TC-18.1 — Gerar o relatório de cobertura por região. *(Backend)*

| Campo | Conteúdo |
|---|---|
| Feature | F5.1 |
| Critério | US-17 AC1 e AC2 |
| Tipo | Positivo |
| Objetivo | Gerar o relatório de cobertura por região. *(Backend)* |
| Preparação | Base SSP-SP carregada; script de cobertura disponível (T21). |
| Inputs | Rodar o script. |
| Resultado esperado | Relatório com a fração de boletins elegíveis por circunscrição e por subprefeitura, publicado com a metodologia. |

**Passos:**
1. Executar o script.
2. Abrir o relatório.

### TC-18.2 — Garantir que o script não altera pesos nem limites. *(Backend)*

| Campo | Conteúdo |
|---|---|
| Feature | F5.1 |
| Critério | US-17 AC3 |
| Tipo | Negativo |
| Objetivo | Garantir que o script não altera pesos nem limites. *(Backend)* |
| Preparação | Configuração da regra versionada. |
| Inputs | Rodar o script duas vezes. |
| Resultado esperado | Os limites e pesos permanecem iguais; o único efeito é o bloqueio por "dados insuficientes". |

**Passos:**
1. Registrar os limites antes.
2. Rodar o script.
3. Comparar os limites depois.

### TC-19.1 — Atualizar as bases de forma reprodutível. *(Backend)*

| Campo | Conteúdo |
|---|---|
| Feature | F5.2 |
| Critério | US-18 AC1 e AC2 |
| Tipo | Positivo |
| Objetivo | Atualizar as bases de forma reprodutível. *(Backend)* |
| Preparação | Ambiente com os scripts. |
| Inputs | Rodar o download do GTFS. |
| Resultado esperado | O GTFS é baixado por script; o arquivo e o SHA256 da base SSP-SP estão registrados em `src/ml/dados/README.md`. |

**Passos:**
1. Executar o download.
2. Conferir as janelas das linhas Metrô 6 e 17.
3. Ler `src/ml/dados/README.md`.

### TC-19.2 — Mostrar a data de atualização de cada base no app.

| Campo | Conteúdo |
|---|---|
| Feature | F5.2 |
| Critério | US-18 AC3 |
| Tipo | Positivo |
| Objetivo | Mostrar a data de atualização de cada base no app. |
| Preparação | "Sobre os dados" aberto. |
| Inputs | Nenhum. |
| Resultado esperado | Há data de atualização para a base de ocorrências e para a de transporte. |

**Passos:**
1. Ler as datas de atualização.

### TC-20.1 — Garantir que a consulta não fica guardada. *(Backend + App)*

| Campo | Conteúdo |
|---|---|
| Feature | F6.1 |
| Critério | US-19 AC1 e AC2 |
| Tipo | Negativo |
| Objetivo | Garantir que a consulta não fica guardada. *(Backend + App)* |
| Preparação | Servidor de teste com acesso ao banco e aos logs. |
| Inputs | Uma consulta com origem, destino e horário conhecidos. |
| Resultado esperado | Nada da consulta no banco; logs sem coordenadas, endereços nem identificador da conta. |

**Passos:**
1. Consultar.
2. Procurar origem e destino no banco.
3. Procurar coordenadas, endereços e e-mail nos logs do servidor e do app.

### TC-20.2 — Garantir que a consulta não vai a serviços externos de mapas. *(Backend + App)*

| Campo | Conteúdo |
|---|---|
| Feature | F6.1 |
| Critério | US-19 AC3 |
| Tipo | Negativo |
| Objetivo | Garantir que a consulta não vai a serviços externos de mapas. *(Backend + App)* |
| Preparação | Ferramenta de captura de rede. |
| Inputs | Uma consulta. |
| Resultado esperado | Nenhuma chamada com origem ou destino a terceiros; o roteamento roda em servidor próprio. |

**Passos:**
1. Consultar.
2. Listar os destinos das chamadas.

### TC-20.3 — Garantir que a sessão de compartilhamento não deixa rastro depois de encerrada.

| Campo | Conteúdo |
|---|---|
| Feature | F6.1 |
| Critério | US-19 AC4 |
| Tipo | Negativo |
| Objetivo | Garantir que a sessão de compartilhamento não deixa rastro depois de encerrada. |
| Preparação | Sessão de compartilhamento encerrada. |
| Inputs | Verificar o banco do servidor. |
| Resultado esperado | Nada da sessão no banco depois de encerrar. |

**Passos:**
1. Encerrar a sessão.
2. Procurar trajeto e posições dessa sessão.

### TC-21.1 — Garantir que a API devolve só agregados.

| Campo | Conteúdo |
|---|---|
| Feature | F6.2 |
| Critério | US-20 AC1 |
| Tipo | Negativo |
| Objetivo | Garantir que a API devolve só agregados. |
| Preparação | Servidor de teste. |
| Inputs | Uma consulta à API. |
| Resultado esperado | A resposta tem só N, D, L e cobertura; sem coordenadas nem campos de boletins individuais. |

**Passos:**
1. Chamar a API.
2. Inspecionar a resposta.

### TC-21.2 — Exibir "dados insuficientes" para contagem nula, nunca 0.

| Campo | Conteúdo |
|---|---|
| Feature | F6.2 |
| Critério | US-20 AC2 |
| Tipo | Negativo |
| Objetivo | Exibir "dados insuficientes" para contagem nula, nunca 0. |
| Preparação | Resposta da API com contagem `null`. |
| Inputs | Consulta que gera `null`. |
| Resultado esperado | O app exibe "dados insuficientes", nunca 0. |

**Passos:**
1. Forçar a contagem `null`.
2. Ver a tela.

### TC-22.1 — Cadastrar, editar e apagar a rotina só no aparelho.

| Campo | Conteúdo |
|---|---|
| Feature | F7.1 |
| Critério | US-22 AC1 e AC3 |
| Tipo | Positivo |
| Objetivo | Cadastrar, editar e apagar a rotina só no aparelho. |
| Preparação | Sessão ativa; locais salvos existentes; Feature em protótipo. |
| Inputs | Rotina: origem, destino, dias e horário de saída. |
| Resultado esperado | A rotina persiste só no aparelho, pode ser editada, desativada e apagada, e nada é enviado ao servidor nem vinculado à conta. |

**Passos:**
1. Cadastrar a rotina.
2. Fechar e reabrir o app.
3. Editar, desativar e apagar a rotina.
4. Observar o tráfego de rede.

### TC-22.2 — Programar o lembrete antes da saída. *(disparo real só no aparelho)*

| Campo | Conteúdo |
|---|---|
| Feature | F7.1 |
| Critério | US-22 AC2 |
| Tipo | Positivo |
| Objetivo | Programar o lembrete antes da saída. *(disparo real só no aparelho)* |
| Preparação | Permissão de notificações concedida; rotina ativa. |
| Inputs | Antecedência de 15 min. |
| Resultado esperado | Notificação local com o texto neutro da rotina, 15 min antes; tocar abre a tela inicial com origem, destino e saída da rotina; o aviso não informa mudança no resultado. |

**Passos:**
1. Salvar a rotina ativa.
2. Aguardar o horário do aviso (ou simular).
3. Tocar na notificação.

### TC-22.3 — Manter a rotina salva com a permissão de notificações negada.

| Campo | Conteúdo |
|---|---|
| Feature | F7.1 |
| Critério | US-22 AC4 |
| Tipo | Negativo |
| Objetivo | Manter a rotina salva com a permissão de notificações negada. |
| Preparação | Permissão de notificações negada. |
| Inputs | Salvar uma rotina. |
| Resultado esperado | O app informa que o aviso não será enviado; a rotina continua salva. |

**Passos:**
1. Negar a permissão.
2. Salvar a rotina.

### TC-22.4 — Garantir a linguagem do VoltaSegura+.

| Campo | Conteúdo |
|---|---|
| Feature | F7.1 |
| Critério | US-22 AC5 |
| Tipo | Negativo |
| Objetivo | Garantir a linguagem do VoltaSegura+. |
| Preparação | Telas e textos da rotina. |
| Inputs | Varredura dos textos. |
| Resultado esperado | Nenhum termo proibido ("rota segura" etc.); a tela identifica o VoltaSegura+ como recurso em validação, sem preço. |

**Passos:**
1. Varrer os textos da rotina contra a lista de termos proibidos.

### TC-07.3 — Garantir que mudar o horário da volta não altera a ida.

| Campo | Conteúdo |
|---|---|
| Feature | F2.2 |
| Critério | US-07 AC1 |
| Tipo | Negativo |
| Objetivo | Garantir que mudar o horário da volta não altera a ida. |
| Preparação | Ida planejada e volta aberta. |
| Inputs | Horário da volta alterado. |
| Resultado esperado | A ida mantém origem, destino e horário originais; só a volta muda. |

**Passos:**
1. Planejar a volta.
2. Alterar só o horário da volta.
3. Voltar à ida.

### TC-13.4 — Não bloquear quando amostra e cobertura são suficientes.

| Campo | Conteúdo |
|---|---|
| Feature | F3.3 |
| Critério | US-12 AC1 e AC2 |
| Tipo | Positivo |
| Objetivo | Não bloquear quando amostra e cobertura são suficientes. |
| Preparação | Fixture `conclusivo` (cobertura ≥ 80%, diferença ≤ 10 p.p., N total ≥ 10). |
| Inputs | Consulta conclusiva. |
| Resultado esperado | Não aparece "dados insuficientes"; a comparação segue as regras da F3.2. |

**Passos:**
1. Consultar.
2. Procurar a mensagem de "dados insuficientes".

### TC-15.3 — Garantir que "Sobre os dados" não traz nota, escala ou níveis.

| Campo | Conteúdo |
|---|---|
| Feature | F4.1 |
| Critério | US-14 AC1 |
| Tipo | Negativo |
| Objetivo | Garantir que "Sobre os dados" não traz nota, escala ou níveis. |
| Preparação | "Sobre os dados" aberto em todas as fixtures. |
| Inputs | Percorrer as fixtures. |
| Resultado esperado | Nenhuma nota, escala ou nível; a confiança dos dados fica separada da exposição estimada. |

**Passos:**
1. Abrir o bloco em cada fixture.
2. Procurar nota, escala, estrelas ou níveis.

### TC-19.3 — Sinalizar GTFS novo com janela inconsistente das linhas 6 e 17. *(Backend)*

| Campo | Conteúdo |
|---|---|
| Feature | F5.2 |
| Critério | US-18 AC1 |
| Tipo | Negativo |
| Objetivo | Sinalizar GTFS novo com janela inconsistente das linhas 6 e 17. *(Backend)* |
| Preparação | GTFS novo disponível. |
| Inputs | Arquivo GTFS com a janela de uma dessas linhas fora do esperado. |
| Resultado esperado | A defasagem é identificada e aparece nas limitações, sem editar o GTFS. |

**Passos:**
1. Baixar o novo GTFS.
2. Conferir as janelas das linhas Metrô 6 e 17.

### TC-20.4 — Devolver o resultado sem guardar a consulta. *(Backend + App)*

| Campo | Conteúdo |
|---|---|
| Feature | F6.1 |
| Critério | US-19 AC1 |
| Tipo | Positivo |
| Objetivo | Devolver o resultado sem guardar a consulta. *(Backend + App)* |
| Preparação | Servidor de teste. |
| Inputs | Consulta válida. |
| Resultado esperado | O resultado é exibido normalmente e o servidor usa a consulta só para calcular. |

**Passos:**
1. Consultar.
2. Ver o resultado no app.

### TC-21.3 — Exibir só resultados agregados.

| Campo | Conteúdo |
|---|---|
| Feature | F6.2 |
| Critério | US-20 AC1 |
| Tipo | Positivo |
| Objetivo | Exibir só resultados agregados. |
| Preparação | Resultado aberto. |
| Inputs | Consulta válida. |
| Resultado esperado | As telas mostram N, D, L, cobertura e totais por grupo; nenhum boletim individual. |

**Passos:**
1. Consultar.
2. Abrir "Por que esta rota?" e "Dados considerados".

### TC-RNF-01 — Varrer todos os textos do app, do pitch e dos slides em busca de termos proibidos.

| Campo | Conteúdo |
|---|---|
| Feature | RNF-01, RNF-02, RNF-06 |
| Critério | — |
| Tipo | Negativo |
| Objetivo | Varrer todos os textos do app, do pitch e dos slides em busca de termos proibidos. |
| Preparação | Arquivos de texto do app (`src/textos/`) e documentos públicos. |
| Inputs | Lista do `docs/05`: "rota segura", "por segurança", "rua perigosa", "bairro perigoso", "área de risco", "garantimos segurança", "prevemos crimes". |
| Resultado esperado | 0 ocorrências; nenhum rótulo de bairro; nenhuma frase transfere responsabilidade ao usuário. |

**Passos:**
1. Buscar cada termo nos textos.
2. Verificar que nenhuma tela ou endpoint rotula bairro.
3. Verificar que nenhum texto culpa o usuário.

### TC-RNF-03 — Garantir que ausência de registro não vira vantagem e que a confiança dos dados fica separada.

| Campo | Conteúdo |
|---|---|
| Feature | RNF-03, RNF-04 |
| Critério | — |
| Tipo | Negativo |
| Objetivo | Garantir que ausência de registro não vira vantagem e que a confiança dos dados fica separada. |
| Preparação | Casos com `N = 0`. |
| Inputs | Consulta com `N = 0` numa rota. |
| Resultado esperado | `N = 0` não gera destaque por si só; o bloco "Sobre os dados" aparece em toda comparação, separado da exposição. |

**Passos:**
1. Consultar.
2. Ver rótulos.
3. Conferir que "Sobre os dados" está presente.

### TC-RNF-07 — Conferir a acessibilidade básica das telas do fluxo.

| Campo | Conteúdo |
|---|---|
| Feature | RNF-07 |
| Critério | — |
| Tipo | Positivo |
| Objetivo | Conferir a acessibilidade básica das telas do fluxo. |
| Preparação | App com leitor de tela (TalkBack/VoiceOver) e fonte a 200%. |
| Inputs | Fluxo do planejamento ao "Por que esta rota?". |
| Resultado esperado | Elementos com rótulo, alvos de toque adequados, texto legível a 200% e contraste conforme os tokens do design. |

**Passos:**
1. Percorrer as telas com o leitor de tela.
2. Aumentar a fonte para 200%.
3. Conferir alvos de toque e contraste.

### TC-RNF-08 — Garantir que dados de exemplo estão identificados e que nada afirma conformidade com a LGPD.

| Campo | Conteúdo |
|---|---|
| Feature | RNF-08, RNF-09 |
| Critério | — |
| Tipo | Negativo |
| Objetivo | Garantir que dados de exemplo estão identificados e que nada afirma conformidade com a LGPD. |
| Preparação | App, README, pitch e slides. |
| Inputs | Telas com dados de exemplo; busca por "LGPD". |
| Resultado esperado | Dados de exemplo rotulados como tal; nenhum texto diz "em conformidade com a LGPD". |

**Passos:**
1. Percorrer telas com dados de exemplo.
2. Buscar "LGPD" nos textos públicos.
