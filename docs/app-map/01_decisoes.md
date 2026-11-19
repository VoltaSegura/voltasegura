# Decisões do mapeamento do app

Decisões tomadas por Lucas Simidu na Fase 0 do plano (`docs/plano_app.md` §2.3), em 13/11/2026. Cada uma tem a opção escolhida, o que muda e onde foi refletida. Não apagar decisões antigas: se uma mudar, acrescentar uma linha nova e marcar a anterior como revista.

| ID | Tema (achado do plano) | Decisão | Status |
|---|---|---|---|
| D-00 | Escopo do mapeamento | A base são **só os documentos** (`docs/01` a `10`, `TODO.md`, `design/`). Código de C#, SOA e de outras disciplinas não é lido nem alterado neste plano. Onde o app depender de backend, `docs/app-map/` descreve só o **contrato esperado** e registra a pendência. | `[DECISÃO — 13/11/2026]` |
| D-01 | Tela de resultado e estados (B) | Ver detalhamento abaixo. | `[DECISÃO — 13/11/2026]` |
| D-02 | Escolha de origem e destino (C) | **Tocar no mapa**, **usar minha localização** (GPS sob demanda, US-05) ou escolher um **local salvo no aparelho** / **ponto de exemplo** da demo (rotulado como exemplo, RNF-08). **Sem busca de endereço** em serviço externo (US-19 AC3). *Revista pela D-29 (14/11/2026): busca por texto liberada, só pelo geocodificador do sistema; sem pontos de exemplo na interface.* | `[DECISÃO — 13/11/2026]` |
| D-03 | Conta e login (D) | Cadastro, login e exclusão por **endpoints do backend**. O mapeamento descreve o contrato que o app espera (`06_funcionalidades.md`, `09_dados_por_tela.md`); a implementação é pendência do backend, fora deste plano (PL-05). **Revista em 14/11/2026:** contas e login pelo Neon Auth (D-24) e exclusão de conta fora do MVP por ora (D-25). | `[DECISÃO — 13/11/2026]` |
| D-04 | Passo a passo, F2.4 (E) | **Entra no MVP** como lista **só de leitura** dos trechos em ordem, com embarque e desembarque, dentro do container de detalhes da alternativa (D-01). Sem navegação ao vivo. *Revista pela D-34 (18/11/2026): a navegação ao vivo entra no MVP como Seguir rota (F2.6, US-23); o passo a passo de leitura segue valendo.* | `[DECISÃO — 13/11/2026]` · revista |
| D-05 | Fora do município, US-06 AC3 (F) | Se origem ou destino estiver fora do município de São Paulo, o app **não envia a consulta** e informa que está **fora da área atendida (município de São Paulo)**. | `[DECISÃO — 13/11/2026]` |
| D-06 | Logo e paleta (G) | Usar a marca **v10** registrada em `TODO.md` T15 e `docs/06` §3: dourado `#FFC53D`, azul-marinho `#0D1B2A`, off-white `#F8F9FA`; ciano `#4ECDC4` como cor funcional de dados e confiança (`docs/06` §3, paleta v7). A aprovação formal do fechamento v8–v10 pelo grupo segue pendente, então o uso no app é provisório. | `[HIPÓTESE]` até a aprovação do grupo (T15) |
| D-07 | Cópia de `docs/app-map/` para o espelho do app (`docs/plano_app.md` §7) | **Decidir depois**, quando o app existir. Por ora a pasta fica só no monorepo (PL-10). | `[DECISÃO — 13/11/2026]` |
| D-08 | Conteúdo do "Por que esta rota?" (PL-01) | No MVP o botão aparece **só nos trechos a pé**, que são os únicos contados pela regra do `docs/08`. Mostra que o trecho entra na conta, a faixa do dia usada, os números da **alternativa inteira** (N, L, D; nunca por trecho), o indicativo curto e o link para "Sobre os dados". Trechos de ônibus, metrô e trem ficam sem o botão. **Revisa o item 4 da D-01** ("cada trecho tem um botão"). | `[DECISÃO — 13/11/2026]` |
| D-09 | "Sobre os dados" sempre visível (PL-02) | **Linha fixa no container**, sempre visível junto da comparação (ex.: "Dados: SSP-SP, jan–set/2026 · Sobre os dados ›"). Ela abre o bloco completo, que também é acessível pelo "Por que esta rota?". Atende ao F4.1 AC1 e ao RNF-04 sem expor a regra. | `[DECISÃO — 13/11/2026]` |
| D-10 | Ordem dos cards e rota inicial no mapa (PL-04) | Cards **sempre ordenados por tempo total**, com o rótulo "ordenadas por tempo"; o mapa abre na primeira e as demais aparecem em traço claro. Com o foco de exposição presente, a ordem não muda: só o rótulo marca a rota. **Revista pela D-23** (prioridade da menor exposição estimada). | `[DECISÃO — 13/11/2026]` · revista |
| D-11 | Caso "indicadores mistos" (PL-08) | No app, **mistos e "sem diferença clara" usam o mesmo indicativo** (os registros não mostram diferença clara entre as alternativas). Os números de cada alternativa continuam visíveis no "Por que esta rota?". Nos dois casos não há foco de exposição. | `[DECISÃO — 13/11/2026]` |
| D-12 | Mais de duas alternativas (PL-13) | Ver detalhamento abaixo: **até 3 rotas por consulta, cada uma com um foco**. | `[DECISÃO — 13/11/2026]` |
| D-13 | Alternativa sem trecho a pé, `L = 0` (PL-14) | Quando alguma rota candidata tem `L = 0`, **nenhuma rota recebe o foco de exposição** naquela consulta. Os detalhes explicam que a rota não tem trecho a pé contado, e D aparece como "não aplicável" (US-10 AC5, RNF-03). | `[DECISÃO — 13/11/2026]` |
| D-15 | Candidatas aos focos (PL-16) | Entram como candidatas **até 5 alternativas** devolvidas pelo roteamento para a consulta. Os focos e a regra de exposição ("vencer cada uma das outras") consideram as 5; só as vencedoras de algum foco são exibidas (no máximo 3). | `[DECISÃO — 13/11/2026]` |
| D-16 | Consulta com uma rota só (PL-17) | Se, havendo duas ou mais candidatas, os focos resultarem numa rota só, o app mostra também a **segunda rota mais rápida**, sem rótulo de foco, marcada como **"outra opção"**. Assim a usuária sempre tem com o que comparar quando existe mais de uma alternativa. | `[DECISÃO — 13/11/2026]` |
| D-17 | Aprovação da Fase 2 | Lucas aprovou as especificações TL-01 a TL-13, a navegação, o catálogo de funcionalidades e os dados por tela. Status passa a `pronta`, e a Frente 2 pode implementar. O contrato da API continua `[HIPÓTESE]` até a conciliação com o backend (PL-18). | `[DECISÃO — 13/11/2026]` |
| D-18 | Validação da arquitetura e escopo da Fase 4 | Lucas validou o mapeamento das Fases 0 a 3 (decisões, story map, fluxos, telas, design e textos) como base do app. Quer **rever alguns pontos de design** depois (PL-19). O **roteiro do vídeo** (`11_roteiro_demo.md`) fica **adiado**; a Fase 4 fecha só com a rastreabilidade e o fechamento. | `[DECISÃO — 13/11/2026]` |
| D-19 | Compartilhar trajeto e localização (feature nativa) | A usuária pode **compartilhar com um contato a rota escolhida** (trechos, horários previstos, chegada estimada) **e a localização ao vivo** durante a viagem. É funcionalidade **nativa e gratuita**, fora do premium. A sessão começa quando ela toca em compartilhar e termina na chegada, quando ela parar ou ao fim de um tempo máximo. Antecipa o P-02 (antes Fase 2). | `[DECISÃO — 13/11/2026]` |
| D-20 | GPS durante o compartilhamento | **Exceção ao US-05 AC3:** o app lê a localização **em segundo plano só enquanto houver uma sessão de compartilhamento ativa**, com indicador sempre visível, botão de parar e encerramento automático na chegada ou ao fim do tempo máximo. Fora da sessão, a regra atual continua (GPS só sob demanda, sem rastreamento contínuo). | `[DECISÃO — 13/11/2026]` |
| D-21 | Como o contato recebe | O app gera um **link temporário** que **só abre no app VoltaSegura**: o contato precisa ter o app instalado. O link expira ao fim da sessão. **Exceção à DT-08 só para esse caso:** o servidor guarda **temporariamente** o trajeto e a última posição da sessão, apaga tudo ao encerrar, e os logs continuam sem coordenadas. | `[DECISÃO — 13/11/2026]` |
| D-22 | Prazo do compartilhamento | Planejado agora e previsto para o MVP com a marca **"Depende do tempo"**: se o prazo de 19/11 apertar, a construção é cancelada e fica para depois, sem afetar o resto do app. | `[DECISÃO — 13/11/2026]` |
| D-23 | Prioridade no resultado (revê a D-10) | **A prioridade do app é a menor exposição estimada.** Quando uma rota recebe esse foco (caso CONCLUSIVO, D-12), ela (1) aparece **em primeiro lugar**, (2) vem **já selecionada**: o mapa abre no trajeto dela e o card ganha o destaque de seleção, e (3) tem o **rótulo em destaque visual** (preenchido com a cor de ação, com ◆). As demais seguem por tempo total, e o rótulo da lista diz "menor exposição estimada primeiro". **Sem esse foco** (sem diferença clara, mistos, dados insuficientes, `L = 0`, uma rota só), a ordem continua por tempo, com "ordenadas por tempo", porque não há resultado de exposição para priorizar. O app **continua sem escolher pela usuária**: todas as rotas ficam visíveis e selecionáveis, sem "recomendada" nem nota (US-11 AC5). | `[DECISÃO — 13/11/2026]` |
| D-14 | Totais de Furto, Roubo e Trânsito (PL-15) | Totais **por alternativa**, na mesma área de N (corredor de ±100 m dos trechos a pé), na tela **"Dados considerados"**, aberta pelo "Por que esta rota?" e por "Sobre os dados". A tela principal fica sem números de ocorrência. Ajusta a redação do US-15 AC1. | `[DECISÃO — 13/11/2026]` |
| D-24 | Banco de dados e contas na nuvem (revê em parte a D-03) | **O Neon (Postgres + Neon Auth) é o banco principal, na nuvem** (projeto `dark-bread-31601140`, `neon.ts` em `src/mobile-app/`), para a usuária poder usar o app longe da máquina de desenvolvimento. **O app nunca conecta direto no Postgres:** ele só fala com a URL pública do Neon Auth (contas e sessão, sem segredo no pacote) e, quando houver, com uma API que consulta o banco. O `DATABASE_URL` fica só em `.env.local`, fora do git. Cadastro e login passam a usar o **Neon Auth** (`EXPO_PUBLIC_NEON_AUTH_URL`), no lugar dos endpoints `/api/conta` e `/api/sessao` previstos na D-03. **O SQLite local sai do app:** a rubrica diz "salvar em banco de dados", sem exigir banco no aparelho (`docs/02` §5). Limites verificados na branch `dev` em 14/11/2026: a sessão é um cookie assinado de 7 dias; todo POST exige o cabeçalho `Origin` de um domínio confiável; o aceite do aviso de privacidade não é gravado no servidor; não há exclusão de conta (D-25). **`[EM ABERTO]`:** onde ficam o **histórico e os locais salvos** (FN-13). A US-04 AC4 e a DT-08 pedem que fiquem **só no aparelho**, por terem coordenadas, e o SQLite saiu: a decisão está pendente (o `expo-sqlite` continua instalado até lá). Também pendentes: quem cuida da API que grava no Neon e a conciliação do contrato da consulta (PL-05, PL-18). | `[DECISÃO — 14/11/2026]` (exceto o `[EM ABERTO]` indicado) |
| D-25 | Exclusão de conta fora do MVP por ora (US-03, FN-03, FL-12) | **Não será implementada por enquanto.** O Neon Auth gerenciado não oferece a exclusão (`POST /delete-user` responde 404), então ela exigiria um endpoint próprio. Os documentos da funcionalidade ficam preservados, marcados como `adiado`. No código, `excluirConta` falha de forma explícita (`EXCLUSAO_NAO_SUPORTADA`) e nada é dado como excluído. Efeito: US-03 AC1 a AC3 e o botão de excluir da TL-12 saem do MVP. Reabrir se sobrar prazo ou se o backend passar a oferecer o endpoint. | `[DECISÃO — 14/11/2026]` |
| D-26 | Redesign do app aprovado | O Lucas **aprovou o redesign** descrito em `docs/app-map/redesign/06_sintese_e_prioridades.md`, com as recomendações das 12 decisões da síntese: aprova a hierarquia e os tokens já usados (PL-19, parcial: halo, selos coloridos e cena animada ficam para depois); **nenhuma dependência nova** antes de 18/11; **fonte do sistema** (a Atkinson fica como meta); animação só como feedback curto com o `Animated` do React Native, respeitando "reduzir movimento"; mapa base Google/Apple (PL-25); sem rede, deixar tentar e explicar a falha (PL-12); D-02 mantida; **sem commit** sem pedido dele. Os textos novos continuam `[HIPÓTESE]` até a revisão final. Implementação por workers, por grupo de telas. | `[DECISÃO — 14/11/2026]` |
| D-27 | Escopo: só Mobile; dados reais pelo próprio app | O trabalho desta etapa é **só da matéria de Mobile**: o backend C#/SOA e o que é de outras disciplinas ficam **fora** (não leem, não dependem). Os dados reais (roteamento e exposição estimada) precisam chegar ao app por **componentes do próprio app e serviços ligados a ele** (Neon, OTP2 próprio, dados públicos do repositório), em vez da conciliação com o backend C# (PL-18 perde a premissa). O plano está em `docs/dados-reais/`. | `[DECISÃO — 14/11/2026]` |

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
5. **Ordem:** ~~por tempo total, com o rótulo "ordenadas por tempo" (D-10).~~ Revista pela **D-23**: a rota com o foco de exposição vem primeiro e já selecionada; as demais, por tempo. Sem esse foco, tudo por tempo.
6. **O app continua sem escolher pela usuária** e sem misturar tempo e registros numa nota (US-11 AC5): cada foco é um critério separado e explícito.

**Consequência a observar:** como o foco de exposição é raro, a maioria das consultas vai mostrar duas rotas (menor tempo e menos caminhada, ou a vencedora dos dois focos + "outra opção"). As candidatas são até 5 (D-15); a consulta nunca fica com uma rota só quando há mais de uma candidata (D-16).

**Reflexo:** `docs/08` (regra para três ou mais candidatas, `L = 0`, mistos) e `docs/10` v1.3 (F2.3 AC5, F3.2 AC6, F4.1, F4.2 AC1).

## D-28 (14/11/2026): redesign premium (revoga partes da D-26)

`[DECISÃO]` O Lucas pediu o **Modo Premium** do `guia-redesign-app-react-native.md` (seção 5B) e autorizou arquitetar e implementar sem nova permissão. Efeitos:

- **Dependências novas liberadas** só as do guia, via `npx expo install` e compatíveis com o Expo Go: `react-native-reanimated`, `expo-haptics`, `expo-linear-gradient`, `expo-font` + pacote(s) `@expo-google-fonts`. Mais nada sem registrar aqui. A D-26 ("nenhuma dependência", "fonte do sistema", "só `Animated`") fica **revogada nesses pontos**; "sem commit sem o Lucas pedir" continua valendo.
- **Referências visuais (P1) não existem** (`referencias/` estava vazia). Como o Lucas mandou seguir sem parar, a direção foi escolhida a partir do próprio produto e registrada em `docs/app-map/redesign/07_premium_arquitetura.md`; é `[HIPÓTESE]` e reversível pelos tokens.
- **Não muda:** `docs/05` (linguagem e cor sem semântica de segurança), contraste e toque mínimo, "reduzir movimento", marca D-06, lógica e dados.
- Backup de segurança antes de mexer: `volta-segura/backup-pre-premium-2026-11-14` (fora do repo).

## D-29 (14/11/2026): home sem Ida/Volta, mapa com busca, lugares salvos e imagens (revê D-02 e parte de D-26/D-28)

`[DECISÃO]` Pedido do Lucas após testar o premium no celular. Planejamento completo em `docs/app-map/redesign/08_home_busca_locais_arquitetura.md`.

1. **Sem seletor Ida/Volta na home.** Um só fluxo (origem, destino, inverter, hora). "Planejar a volta" no resultado continua e só inverte os pontos.
2. **Um único jeito de escolher o ponto: o mapa em tela cheia**, com busca por texto, botão de localização e lugares salvos. **Saem os pontos de exemplo da interface** (RNF-08 segue valendo para os dados de exemplo do resultado, que continuam rotulados EXEMPLO).
3. **Busca de endereço por texto** (revê a D-02, "sem busca de endereço", e a US-19 AC3). Geocodificador do sistema (`expo-location`); só ao tocar em Buscar; mínimo de 3 letras; limitada a São Paulo; nada em log. O texto buscado sai do aparelho para o serviço de mapas do sistema: `[HIPÓTESE]` acrescentar isso ao aviso de privacidade (TL-13); revisão do texto pendente.
4. **Lugares salvos** (decide a parte de locais da FN-13, que estava `[EM ABERTO]`): nome + tipo, até 10, só no aparelho, no `expo-secure-store` (cifrado); apagar em Configurações. Histórico de trajetos segue `[EM ABERTO]`.
5. **Imagens com reserva:** `theme/imagens.ts` + `ImagemPlaceholder`; o Lucas informa as imagens depois.
6. **Dependências novas liberadas** (complementa a D-28): `@expo/vector-icons` e `expo-asset`.
7. **Não muda:** `docs/05`, contraste, toque mínimo, "reduzir movimento", marca D-06, dados. "Sem commit sem pedir" continua.

## D-30 (15/11/2026): endereço exato dos pontos e marcador por toque (revê a D-29 no mapa)

`[DECISÃO]` Pedido do Lucas após testar a Onda 3: (1) os lugares "nunca mostram o endereço" (marcou "C6 Bank" e não vê onde é); (2) o pino fixo no centro, que se move junto com o mapa, incomoda.

1. **Endereço legível.** Ao marcar um ponto, o app mostra o **endereço exato** (rua, número, bairro) obtido pela **geocodificação reversa do sistema** (`expo-location` `reverseGeocodeAsync`), sem servidor nem chave nossos. O endereço é mostrado no painel do mapa, vira o rótulo de origem e destino na home e é **guardado com o lugar salvo** (campo `endereco`, até 140 caracteres, só no aparelho, no `expo-secure-store`).
2. **Marcador por toque.** Tocar no mapa coloca o marcador onde se tocou; mover ou dar zoom no mapa **não** move o marcador; tocar em outro lugar o move e atualiza o endereço; o marcador também pode ser arrastado. Sai o pino fixo no centro (a regra "ponto = centro do mapa" da D-29 e os 60 m do rótulo deixam de existir).
3. **Privacidade (revê o item 3 da D-29).** Além do texto da busca, a **posição do ponto marcado** é enviada ao serviço de mapas do sistema (no Android, o do Google) para obter o endereço: a cada toque, fim de arrasto do marcador, resultado de busca ou localização; nunca ao mover o mapa. Nada é guardado pelo VoltaSegura além do endereço dos lugares que a pessoa salva, e nada vai a log. O Aviso de privacidade (TL-13) foi atualizado `[HIPÓTESE]`; revisão do texto pendente.
4. **Falha do geocodificador:** o ponto continua utilizável com o rótulo "Ponto escolhido no mapa" e "Endereço indisponível".
5. Registros de lugares antigos (sem `endereco`) continuam válidos.
Plano e andamento: `docs/app-map/redesign/10_onda3_evidencia_e_proximos_passos.md` §6.

## D-31 (15/11/2026): VoltaSegura+ entra no MVP em versão mínima (rotina e aviso local)

`[DECISÃO]` Onda de perguntas do roteiro do pitch (`TODO.md` T23, PT-13 e PT-14), resposta do Lucas Simidu:

1. **Escopo mínimo:** a usuária cadastra uma **rotina** (trajetos fixos, com dias e horário de saída) e recebe um **aviso antes de sair**. O texto exato do aviso e o que ele informa (horário de saída, mudança no resultado) estão `[EM ABERTO]`; sem dados de tempo real, o aviso é só um lembrete do horário.
2. **Só no aparelho:** a rotina fica no armazenamento local, como histórico e lugares salvos (D-29), com **notificação local**. Nada vai ao servidor nem se vincula à conta (DT-08, `docs/03` §6).
3. **Cobrança:** modelo freemium é `[HIPÓTESE]` (`docs/03` §8). No MVP **não há pagamento**: a tela identifica o VoltaSegura+ como recurso em validação, sem preço.
4. **Prazo:** previsto para 19/11 com a marca "Depende do tempo", como o compartilhamento (D-22), depois das telas essenciais. Se apertar, vira roadmap sem afetar o resto.
5. **Linguagem:** o aviso não promete segurança nem fala em "rota segura" (`docs/05`).
6. **Pendente de mapeamento (resolvido em 15/11/2026, item 7):** fluxo, tela, funcionalidade e critérios no `docs/app-map/`; hoje só existe o backlog (`docs/10` F7.1/US-22).
7. **Mapeamento e gatilho (15/11/2026):** `[DECISÃO]` o aviso é um **lembrete local por horário**: notificação N minutos antes do horário de saída (padrão 15), nos dias da rotina, **sem tempo real e sem servidor**. Texto neutro: "Hora de sair: sua rotina de {dia} às {hora}. Compare os caminhos antes de sair." Não informa mudança no resultado. A permissão de notificações só é pedida ao ativar a primeira rotina; negada, a rotina fica salva com aviso. Tocar no lembrete abre a TL-04 com origem, destino e saída da rotina. Mapeado em FL-17, TL-16, TL-17 e FN-17. Fora do que Lucas decidiu e `[HIPÓTESE]`: até 5 rotinas; antecedência de 5, 10, 15 ou 30 min; origem e destino só entre lugares salvos.

## D-32 (17/11/2026): variações de caminhada para haver o que comparar (B-58)

`[DECISÃO]` do Lucas Simidu, em 17/11/2026, depois de medir com dados reais (OTP2 local + `dev` do Neon, `proxy_pontos`, 22h30):

- **Problema medido:** com as alternativas do OTP2, **0 de 30** trajetos deram CONCLUSIVO. As alternativas ou têm a **mesma caminhada** (muda só a linha; o par empata e vira MISTOS) ou caminhadas de **tamanhos muito diferentes** (a mais curta tem N menor e D maior: MISTOS). Com caminhadas de tamanho parecido por ruas diferentes, 22 de 40 pares deram CONCLUSIVO: o gargalo é a geração de alternativas.
1. **Variações em todos os trechos a pé:** para cada alternativa do roteador (por tempo), o app gera até **2 variações** (desvio por um ponto à esquerda e outro à direita da reta de cada trecho a pé de pelo menos 250 m), usando o próprio OTP2 só a pé. A variação mantém a condução.
2. **Tolerância:** cada trecho variado pode ter **até +30%** do comprimento original e precisa ser outro caminho de fato (menos de 70% dos vértices a até 30 m do original). Numa baldeação, só vale se ainda der tempo de pegar a próxima condução.
3. **Gêmeas:** rotas com a mesma caminhada são comparadas uma vez (mesma exposição estimada). Se o grupo vencer, o destaque fica na **mais rápida do grupo**; as outras mostram os mesmos números, sem o selo.
4. **Limite:** até 5 caminhadas distintas na comparação (o mesmo limite da função `comparar_exposicao`; o SQL não mudou).
5. **Linguagem:** a variação aparece como "Mesma condução, caminhada por outro caminho" (texto `[HIPÓTESE]`); a comparação segue "entre as alternativas avaliadas" (docs/05, docs/08). Não se usam ocorrências no custo do roteamento (isso classificaria áreas).
6. **D-23 no modo `otp2`:** a rota de menor exposição estimada passa a vir de fato em primeiro. Antes, a ordem por tempo do OTP2 era mantida e o destaque podia não ser a primeira opção.
- **Resultado medido (17/11):** 3 de 24 trajetos de 1,5 a 3 km numa grade do centro expandido deram CONCLUSIVO, sempre numa variação (ex.: 46 min, 3,6 km, N=129, D=36/km contra 37 min, 2,9 km, N=221, D=76/km). Entre praças, 0 de 9 (5 MISTOS, 4 SEM_DIFERENCA). Evidência e cenários de demonstração em `src/mobile-app/scripts/e2e-exposicao-real.mjs`.

## D-33 (17/11/2026): os dados da SSP-SP desenham o caminho a pé e ele tem prioridade (B-59; revê a D-32 e o destaque da D-12/D-23)

`[DECISÃO]` do Lucas Simidu, em 17/11/2026: "o ponto do app é literal esse: indicar que o caminho X tem menor exposição; quero que os dados da SSP decidam e desenhem trajetos e que ele seja prioritário; é o nosso diferencial". Escolhas feitas na mesma conversa:

1. **Motor: busca guiada pelos dados.** Para cada trecho a pé (≥ 250 m) das **2 alternativas mais rápidas** do roteador, o app gera até 10 caminhos candidatos pelo OTP2 (desvios dos dois lados, em distâncias e posições diferentes), a função `comparar_exposicao` mede os registros perto de cada um e fica o de **menos registros**. A rota resultante aparece como "Caminho a pé escolhido pelos registros da SSP-SP" `[HIPÓTESE]` de texto. Substitui as variações geométricas da D-32 (o código delas segue como base do motor).
2. **Cobertura mínima:** um caminho só pode ser escolhido, e uma rota só pode receber o destaque, com cobertura dos dados ≥ 80% (docs/08). Menos registros por falta de cobertura não ganha (docs/05: ausência de registro ≠ lugar seguro).
3. **Limite de desvio:** +30% do comprimento de cada trecho (D-32); baldeação sem folga descarta o caminho.
4. **Destaque + confiança (revê a regra de destaque do docs/08):** a rota com **menos registros perto dos trechos a pé**, entre as elegíveis e com caminhada diferente das demais, recebe "◆ Menor exposição estimada", vem **em primeiro e já selecionada** (D-23), sempre com a confiança ao lado: **"Diferença clara nos registros"** quando a comparação estatística do docs/08 conclui a favor dela (CONCLUSIVO) ou **"Diferença pequena nos registros"** nos outros casos. Sem rival elegível, empate, rota sem trecho a pé (D-12) ou "só roteamento": sem destaque.
5. **O que não muda:** nenhum rótulo de rua, trecho ou área; sem "rota segura"; a comparação estatística e os casos do docs/08 continuam calculados e exibidos ("Sobre os dados", "Por que esta rota?"); os dados não entram no custo do roteador de transporte.
- **Medido (17/11, `scripts/e2e-exposicao-real.mjs`, saída 22h30, `proxy_pontos`):** 15 trajetos; 2 erros de tempo do OTP2; dos 13 restantes, **10 com destaque** (3 "diferença clara", 7 "diferença pequena") e 3 sem destaque (as duas opções do roteador tinham a mesma caminhada, curta demais para variar). Em 7 dos 10, a rota em destaque foi a desenhada pelos dados (ex.: 42 min, 3,3 km, N=128 contra 37 min, 2,9 km, N=221). Antes (D-32): 3 de 24.
- **Riscos assumidos:** o destaque com diferença pequena pode refletir acaso; por isso a confiança fica sempre visível e a frase acima dos cards pede para comparar também tempo e caminhada. Latência maior (até 10 consultas a pé por trecho; limite de 20 s para o motor).

## D-34 (18/11/2026): Seguir rota, navegação no trajeto (revê a D-04 e a US-05 AC3)

`[DECISÃO — 18/11/2026]` Registro a partir do pedido de 18/11/2026. Cria a funcionalidade **Seguir rota** (TL-18, FL-18, F2.6, US-23): o app acompanha a posição da pessoa no trajeto escolhido, com o próximo passo.

1. **Revisa a D-04.** A navegação ao vivo (acompanhar a posição durante o trajeto) deixa de estar fora do escopo. O passo a passo de leitura (D-04) continua valendo como base.
2. **Revisa a US-05 AC3.** Além do toque em "usar minha localização" e da sessão de compartilhamento (D-20), a posição também é lida durante uma **Seguir rota iniciada pela pessoa**. Na Fase 1, só com a tela ligada e o app aberto. Em segundo plano, só com a sessão de Seguir rota ativa, com o mesmo regime da D-20.
3. **Segue o precedente da D-20:** indicador sempre visível, botão **Parar**, encerramento ao chegar ao destino ou por toque em **Encerrar** (sem tempo máximo, item 7), e **sem histórico**: o trajeto percorrido e as posições não são guardados no aparelho nem enviados ao servidor. O texto da D-20 não diz "sem histórico" de forma literal; essa regra vem deste registro e é aplicada também à Seguir rota.
4. **Mantém a D-21.** A posição lida pela Seguir rota fica só no aparelho. Ela sai do aparelho apenas se a pessoa estiver compartilhando a viagem (F2.5, opt-in).
5. **Fases e status:**
   - **Fase 1, primeiro plano: feita** no código (`src/mobile-app/src/seguir/`, `src/mobile-app/src/services/seguirRota.ts`, tela `src/mobile-app/src/app/(app)/seguir/[rotaId].tsx`). A leitura começa só depois de a pessoa tocar em "Começar". Validação no aparelho pendente. `[DECISÃO]`
   - **Fase 2, recálculo ao desviar: implementada no código e coberta por testes** (18/11/2026), sem validação no aparelho. `[DECISÃO — 18/11/2026]` O recálculo só aceita rota com a **mesma sequência de modos** e que **leve ao mesmo lugar** (fim a até 100 m do fim anterior). Se aceito, a resposta do recálculo **substitui** a anterior na consulta. Sem candidata válida, a rota anterior é mantida e a pessoa pode tocar em "Tentar de novo".
   - **Fase 3, segundo plano com sessão ativa: implementada no código e coberta por testes** (18/11/2026), sem validação no aparelho. `[HIPÓTESE]` Depende do GPS em segundo plano no Expo Go (PL-24) e pode exigir build de desenvolvimento (PL-27).
6. `[DECISÃO — 18/11/2026]` **Exceção à D-21 para o recálculo.** Durante uma Seguir rota ativa, o recálculo envia a posição atual ao roteador do projeto (OpenTripPlanner) como origem da consulta, quando a pessoa sai do trajeto. Limites: a posição vai só nessa consulta; o app não a guarda nem a registra em histórico; não é enviada a nenhum outro serviço; fora de uma Seguir rota ativa não há recálculo. `[EM ABERTO]` Verificar se o servidor de roteamento mantém logs de requisição e por quanto tempo (infraestrutura do projeto).
7. `[DECISÃO — 18/11/2026]` **Sem tempo máximo na Seguir rota.** O acompanhamento termina quando a pessoa toca em **Encerrar** ou quando chega ao destino. Não há encerramento automático por tempo. O raio que conta como chegada é de **100 m** (PL-22). O tempo máximo da D-20 (compartilhamento) não muda.
8. **`[EM ABERTO]` Nome do botão.** A D-20 usa "Parar"; o texto atual do app usa "Encerrar" (`src/mobile-app/src/textos/seguir.ts`). Alinhar antes da revisão de textos.
9. **Linguagem (`docs/05`).** A navegação mostra onde a pessoa está no trajeto. Não diz "rota segura", não promete proteção e não julga o caminho nem o lugar.

## D-35 (18/11/2026): horário de saída por folha com rodas, sem teclado (revisão de implementação da TL-04)

`[DECISÃO — 18/11/2026]` Registro a partir do pedido de Lucas Simidu no redesign T25. Revisa o campo de texto HH:mm da TL-04 (regra "Digita a hora · valida HH:mm ao sair do campo").

1. **Sem teclado para o horário.** A saída é escolhida por atalhos (agora, +15, +30, +1 h), ajuste ±15 min ou pela folha com rodas HH:MM, aberta em "Alterar". Motivo: o `TextInput` anterior perdia a digitação ao atualizar o contexto no `onBlur` e abria/fechava o teclado (causa em `SeletorHorario`: remount por `key` + `autoFocus`).
2. **Rodas.** Horas de 00 a 23; minutos de 00 a 59 (1 em 1). Os minutos de 5 em 5 do plano foram descartados: arredondariam em silêncio uma saída como 17:09 para 17:10.
3. **Dia preservado.** Confirmar troca só a hora; o dia da consulta (hoje ou o escolhido) é mantido.
4. **Acessibilidade.** Cada roda é ajustável (incrementar/decrementar pelo leitor de tela) e aceita toque direto num valor.
5. **Escopo.** Vale para a TL-04 (saída de ida e da volta). A tela de Rotina (`rotina/editar.tsx`) ainda usa campo de texto HH:mm; a migração fica para o worker da Rotina (`[EM ABERTO]`).
6. **Não muda:** a validação das consultas (FN-05) e a linguagem da tela. `[HIPÓTESE]` a folha ainda não foi validada no aparelho (Expo Go, fonte 200%).


## D-36 (19/11/2026): VoltaSegura+ em simulação sem cobrança, telas de exemplo e abas (T25; revê o item 3 da D-31)

`[DECISÃO]` Decisões do Lucas Simidu no redesign pelos 16 mockups (`docs/app-map/redesign/12_plano_redesign_novas_telas.md`):

1. **Simulação sem cobrança (revê o item 3 da D-31).** Planos (TL-19), confirmação do teste (TL-20) e gerenciar assinatura (TL-25) mostram preço e teste de 7 dias, mas **não cobram**, não pedem dados de pagamento, não guardam nenhum valor e não enviam nada. Todas as telas com esse conteúdo mostram o selo "Demonstração: nenhuma cobrança real". A D-31 dizia "sem preço"; o preço passa a aparecer só como simulação.
2. **Exemplos sem backend.** Radar (TL-23), resumo (TL-24) e os números e horários da volta pronta (TL-22) usam dados fixos com selo EXEMPLO. Nenhuma tela desta decisão consulta o servidor.
3. **Rotina continua só no aparelho (D-31).** A home do VoltaSegura+ (TL-21) lê a rotina salva; não altera nem envia.
4. **Barra com cinco abas:** Planejar, Locais, Contatos, Plus e Perfil. A aba Perfil reaproveita a TL-12.
5. **Horário sem teclado (decisão D-35, de 18/11, do worker Planejar):** o horário de saída é escolhido numa folha com rodas HH:MM (`SeletorHorario`), na rotina e na home. A saída padrão é a hora atual.
6. **Contatos:** só nome, no aparelho, até 10. A lista não envia nada sozinha. `[EM ABERTO]` como um contato entra no compartilhamento (PL-34).
7. **Não implementado nesta versão:** nome da rotina e "Quem recebe sua localização" (mockup 11), por falta de decisão sobre envio (PL-34). O botão "Compartilhar com um toque" da volta pronta fica desabilitado (PL-37).
8. **Texto do radar:** o mockup 13 diz "ocorrência recente"; o texto do app diz "aviso" e "obra recente", para não sugerir marcador de ocorrência no trajeto (docs/05; PL-36).

Resultado no código: `src/mobile-app/src/app/(app)/plus/`, `locais.tsx`, `contatos.tsx`, `perfil.tsx`, `src/contatos/`, `src/plus/`, textos `plus.ts` e `abas.ts`. Revisão do Lucas pendente.

## D-37 (19/11/2026): horário de saída em cartão grande, sem atalhos (revê a D-35, item 1 dos atalhos)

`[DECISÃO — 19/11/2026]` Pedido de Lucas Simidu no redesign T25-B (Frente B, item 10). Revê a D-35 no que diz respeito aos atalhos de horário.

1. **Sai o `AtalhosHorario`.** Os atalhos Agora / +15 min / +30 min / +1 h e os ajustes −15/+15 min deixam a TL-04. A saída passa a ser escolhida só no cartão de horário.
2. **Cartão grande no lugar da linha.** O `SeletorHorario` vira um cartão tocável com ícone de relógio, rótulo (Saída ou Saída da volta), hora em destaque e dia ("hoje, 15 de novembro"). Tocar abre a folha de rodas HH:MM da D-35, que segue valendo: horas 00–23, minutos 00–59, Confirmar grava mantendo o dia, Cancelar descarta, sem teclado.
3. **Mantém a D-35 nos demais pontos** (ordem de rodas, dia preservado, acessibilidade ajustável nas rodas). `[EM ABERTO]` o chip "Agora" selecionado do mockup 01 não foi implementado, porque os atalhos saíram.
4. **Consequência para o mockup 01.** A seção Saída do mockup mostra os atalhos; o app deixa de seguir esse trecho do mockup por decisão desta revisão.
5. `[HIPÓTESE]` O cartão e a folha ainda não foram validados no aparelho (Expo Go, fonte a 200%).


## D-38 (19/11/2026): sem Configurações; Perfil, tema, assinatura simulada guardada e portão na aba Plus (T25-B, Frente A; revê a D-36 itens 1 e 4)

`[DECISÃO]` Decisões do plano T25-B (Frente A), aprovadas pelo Lucas:

1. **Configurações removida.** A rota `/(app)/configuracoes` sai. O botão de configurações do cabeçalho de Planejar também. A aba Perfil passa a ter conta, status do VoltaSegura+, atalho da rotina, tema, privacidade e sair. Renomear e apagar lugares vão para a aba Locais, com desfazer de 5 s.
2. **Tema claro ou escuro escolhido pela pessoa** (Sistema, Claro ou Escuro), gravado no aparelho e aplicado a todo o app. O padrão continua seguindo o sistema.
3. **Assinatura simulada guardada no aparelho** (revê a D-36 item 1 quanto ao "nada guardado"): plano e data de início, sem valor e sem pagamento. Cancelar é real na simulação: apaga o registro e volta à aba Plus. A aba Plus mostra a home do VoltaSegura+ quando há assinatura, e os planos quando não há.
4. **Home do VoltaSegura+ lista todas as rotinas** (até 5), não só uma (revê a D-36 item 3, que falava em uma rotina).
5. **Continua simulação**: selo "Demonstração: nenhuma cobrança real" nas telas de plano, confirmação e assinatura. Nada é cobrado.

Resultado no código: `src/mobile-app/src/app/(app)/(abas)/perfil.tsx`, `locais.tsx`, `plus.tsx`; `src/mobile-app/src/theme/ModoTemaProvider.tsx`; `src/mobile-app/src/plus/AssinaturaContext.tsx`, `PlusHomeConteudo.tsx`. Ligação nos layouts (lead): `AssinaturaProvider` no (app)/_layout e `ModoTemaProvider` no app/_layout.

## D-39 (19/11/2026): resultado mais curto; volta e compartilhamento fora do resultado (T25-B itens 6 e 7)

`[DECISÃO — 19/11/2026]` Pedido de Lucas Simidu após teste no aparelho. Numerada D-39 em 19/11 (antes registrada por engano como uma segunda D-36).

1. **A folha de alternativas abre em meia altura** (nível inicial 1: 45%, 68% e 90% da tela). Os cartões ficam mais compactos: linha de números "duração · km a pé · trocas", sem o horário de saída. O horário fica no cabeçalho da folha.
2. **"Planejar a volta" e "Planejar a ida" saem da tela de resultado** (fim da lista). A entrada pela volta fica `[EM ABERTO]` (FL-08), até o Lucas decidir o novo caminho.
3. **A linha de fonte ("Dados: SSP-SP, jan–set/2026") vira um link:** "Entenda de onde vem nossos dados e fontes", que abre a TL-10. A fonte e o período continuam na TL-10.
4. **O detalhe da rota (TL-08) termina em "Seguir rota".** Saem "Compartilhar minha volta" e "Planejar a volta". O compartilhamento passa a ser oferecido na tela Seguir (`seguir/[rotaId]`, cartão de acompanhamento), integração do lead. Revê o item de entrada da D-19 (TL-08 → TL-14).

Revisões de tela e de fluxo: TL-07, TL-08, FL-06, FL-07, FL-08, FL-15, FL-18 (só o trecho de compartilhamento), `08_microcopy.md`.
