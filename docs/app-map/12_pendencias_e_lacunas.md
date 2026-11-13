# Pendências, lacunas e divergências do mapeamento

Tudo o que o backlog (`docs/10`) não cobre, o que os documentos dizem de formas diferentes e o que precisa de resposta antes de fechar uma tela. A Frente 2 (construção) também anexa linhas aqui (`docs/plano_app.md` §1). **Não resolver em silêncio:** cada item fica aberto até ter decisão registrada em `01_decisoes.md`.

**Status:** `ABERTA` · `RESOLVIDA` (com data e decisão) · `PROPOSTA` (há sugestão `[HIPÓTESE]` aguardando o Lucas)

## Abertas

| ID | Tipo | Descrição | Afeta | Proposta | Status |
|---|---|---|---|---|---|
| PL-03 | Limitação | **Mapa base (tiles) é requisição externa.** O app não envia origem e destino a serviços de mapas (US-19 AC3), mas carregar o mapa revela ao provedor a região visualizada. | Telas com mapa, FL-05 | `[HIPÓTESE]` Registrar como limitação conhecida no aviso de privacidade (minuta) e manter a atribuição "© OpenStreetMap contributors" (US-16). | ABERTA |
| PL-05 | Dependência externa | **Endpoints de conta no backend** (D-03): cadastro, login, sessão, exclusão. Não existem nos documentos. | FL-02, FL-03, FL-12 | Contrato esperado descrito em `06_funcionalidades.md` (Fase 2). A implementação cabe a quem cuida do backend. Enquanto não existir, o modo mock do app simula as respostas. | ABERTA |
| PL-06 | Lacuna | **"Entrar com Google" (US-01 AC5)** costuma exigir configuração OAuth e build de desenvolvimento, fora do Expo Go. | FL-02, FL-03 | `[HIPÓTESE]` Desenhar o botão e o fluxo; na demo, mostrar só e-mail e senha se o OAuth não estiver pronto. | ABERTA |
| PL-07 | Em aberto no backlog | **Regras de senha** (US-01, `[EM ABERTO]`). | FL-02 | Manter em aberto; o fluxo valida só "senha vazia" (US-01 AC4). | ABERTA |
| PL-09 | Lacuna | **Nome exibido de um ponto escolhido no mapa.** Sem geocodificação externa (D-02), o app não sabe o endereço. | FL-04, FL-05 | `[HIPÓTESE]` Mostrar "Ponto escolhido no mapa" e permitir que a usuária dê um nome ao salvar o local no aparelho. | ABERTA |
| PL-10 | Decisão adiada | **Cópia de `docs/app-map/` para o espelho** (D-07). | Entrega Mobile | Decidir quando o app existir. | ABERTA |
| PL-11 | Lacuna | **Verificação de "fora do município" sem serviço externo** (D-05). | FL-04 | `[HIPÓTESE]` Conferir no próprio aparelho se o ponto está dentro do limite do município (polígono do município embarcado no app, dado aberto). Fonte do polígono a confirmar. | ABERTA |
| PL-18 | Dependência externa | **Contrato da API esperado pelo app** (`06_funcionalidades.md`, FN-01 a FN-03 e FN-07). Foi escrito sem olhar o código do backend (D-00). Antes de integrar, quem cuida do backend precisa confirmar ou ajustar rotas, campos e códigos. Destaque: a API devolve focos, caso e motivo prontos; o app não calcula. | FN-01 a FN-03, FN-07, `09_dados_por_tela.md` | Usar o contrato no modo mock; registrar aqui cada divergência que aparecer na integração (Frente 2). | ABERTA |
| PL-19 | Revisão | **Pontos de design a rever** com o Lucas (D-18). Os itens ainda não foram listados. Os candidatos naturais são as escolhas `[HIPÓTESE]` de `07_design/tokens.md`: tema escuro padrão, fonte do sistema e ícones. | `07_design/`, mockups | Fazer uma rodada de revisão antes de a Frente 2 começar as telas. Infraestrutura, serviços e banco local não dependem dela. | ABERTA |
| PL-12 | Lacuna | **Comportamento sem rede.** O backlog não define o que acontece offline. | FL-13 | `[HIPÓTESE]` Sem rede, o app não consulta e avisa; locais salvos e histórico local continuam acessíveis. | ABERTA |

## Resolvidas

| ID | Descrição | Decisão | Data |
|---|---|---|---|
| PL-01 | Conteúdo do "Por que esta rota?" por trecho | D-08: botão só nos trechos a pé no MVP; números da alternativa inteira, nunca por trecho | 13/11/2026 |
| PL-02 | "Sobre os dados" sempre visível × motivos no "Por que esta rota?" | D-09: linha fixa no container, abrindo o bloco completo | 13/11/2026 |
| PL-04 | Qual alternativa o mapa mostra primeiro | D-10: ordem por tempo com o rótulo "ordenadas por tempo"; o mapa abre na primeira | 13/11/2026 |
| PL-08 | Estados internos do resultado ("indicadores mistos") | D-11: mistos usam o mesmo indicativo de "sem diferença clara" no app; quatro casos continuam distintos na regra | 13/11/2026 |
| PL-13 | Mais de duas alternativas | D-12: até 3 rotas com foco (menor tempo, menos caminhada, menor exposição estimada); a exposição exige vencer cada uma das outras; mesma rota em dois focos aparece uma vez com os dois rótulos | 13/11/2026 |
| PL-14 | Alternativa sem trecho a pé (`L = 0`) | D-13: nenhum foco de exposição na consulta; D "não aplicável" com explicação | 13/11/2026 |
| PL-15 | Totais por categoria: área e lugar na tela | D-14: por alternativa, no corredor de ±100 m, em "Dados considerados"; tela principal sem números | 13/11/2026 |
| PL-16 | Quais alternativas são candidatas aos focos | D-15: até 5 alternativas devolvidas pelo roteamento | 13/11/2026 |
| PL-17 | Consulta que termina com uma rota só | D-16: mostra também a segunda mais rápida, sem foco, como "outra opção" | 13/11/2026 |

## Histórico

| Data | Mudança | Responsável |
|---|---|---|
| 13/11/2026 | Criação com PL-01 a PL-15 na Fase 0 e na Fase 1 do mapeamento | Lucas Simidu + assistente |
| 13/11/2026 | Rodada de decisões: PL-01, PL-02, PL-04, PL-08, PL-13, PL-14 e PL-15 resolvidas (D-08 a D-14); criadas PL-16 e PL-17, consequências da D-12 | Lucas Simidu + assistente |
| 13/11/2026 | PL-16 e PL-17 resolvidas (D-15, D-16) | Lucas Simidu + assistente |
| 13/11/2026 | Fase 2: criada PL-18 (conciliar o contrato da API esperado pelo app) | assistente |
| 13/11/2026 | Fase 4: criada PL-19 (pontos de design a rever, D-18) | Lucas Simidu + assistente |
