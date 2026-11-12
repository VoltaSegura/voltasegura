# Fluxo de trabalho com IA

Este arquivo descreve como manter a base de conhecimento coerente. As decisões de produto continuam em `docs/03_projeto_documento_vivo.md` e `docs/06_estado_atual.md`; este fluxo não cria decisões de produto.

## Para qualquer tarefa

1. Começar por `AGENTS.md` e ler a base na ordem indicada. Aplicar a prioridade de `docs/05_regras_linguagem_etica.md` e as exigências da FIAP em `docs/01_gs_briefing.md`.
2. Conferir o estado atual em `docs/06_estado_atual.md`. Diferenciar `[DECISÃO]`, `[HIPÓTESE]` e `[EM ABERTO]`; uma regra aprovada para o MVP ainda pode exigir calibração e validação.
3. Consultar a fonte específica antes de editar: `docs/04` para dados, `docs/07` para categorias SSP-SP e `docs/08` para a comparação inicial. Citar a evidência e não criar números, pesos ou exigências legais sem fonte.
4. Fazer a alteração no documento ou código responsável, sem usar `docs/06` como substituto da especificação detalhada. Atualizar também os resumos afetados em `README.md` e `AGENTS.md`.
5. Se uma decisão, hipótese ou pendência mudou, atualizar a seção correspondente de `docs/06` e acrescentar uma linha ao histórico, preservando as versões anteriores. Registrar o uso da IA em `prompts.md`.
6. Se a decisão mudou o que o produto é ou faz, atualizar também o backlog do produto (`docs/10_backlog_produto.md`).
7. Se a alteração tocou uma tarefa da lista, atualizar `TODO.md` (status, evidência e linha em "Histórico") na mesma alteração.
8. Rodar `python scripts/check_knowledge.py` e as verificações pertinentes à entrega. Revisar o diff e informar o que foi decidido, o que permanece em aberto e como a mudança foi verificada.

## Para percorrer pontos em aberto com o grupo

Seguir a ordem da seção 3 de `docs/06_estado_atual.md`. Ignorar itens já fechados, identificar o primeiro item ainda pendente e apresentar uma pergunta de cada vez com contexto suficiente para decidir. A resposta do grupo pode gerar uma `[DECISÃO]`, uma `[HIPÓTESE]` ou manter o item `[EM ABERTO]`; registrar o resultado antes de avançar. Se um item depender de dado externo ou teste, especificar a evidência necessária em vez de fechá-lo por suposição.

## Quando acrescentar outra automação

`AGENTS.md` já é a orientação permanente para agentes. `prompts.md` é o registro obrigatório de uso de IA, não uma biblioteca de prompts. Criar uma skill ou agente especializado somente quando houver uma tarefa recorrente com entradas, saídas e critérios de verificação estáveis, que este fluxo e um script simples não resolvam. Para disciplinas, preferir instruções locais curtas e específicas quando surgirem necessidades reais; a fonte da verdade continua neste monorepo.

O script `scripts/sync_mirrors.sh` envia a base numerada aos espelhos de entrega. Ele também faz commits e pushes; sua execução é uma etapa de publicação, depois da revisão das alterações.
