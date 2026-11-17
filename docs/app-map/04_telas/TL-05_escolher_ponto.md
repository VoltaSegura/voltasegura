# TL-05 · Escolher ponto no mapa

- **Status:** pronta; revisão de implementação em 15/11/2026 por D-30 (endereço exato) e pedido de Lucas (marcador por toque). Textos novos `[HIPÓTESE]`, sem validação com usuários.
- **Rota:** `/(app)/escolher-ponto?campo=origem|destino`.
- **Objetivo:** escolher um ponto por toque no mapa, busca por texto, localização atual ou lugar salvo, e opcionalmente salvá-lo.
- **Referências:** US-05, US-06 AC5, US-04 AC5, US-16 AC1; FN-04, FN-13; RNF-02, RNF-07.

## Wireframe

```text
┌───────────────────────────────────┐
│ [Voltar] [Buscar rua ou lugar]     │
│ [Busca usa o serviço...]*          │
│ [Escolher origem/destino]          │
│                                   │
│          mapa em tela cheia        │
│   toque → 📍 marcador arrastável   │
│                                   │
│             [Minha localização]    │
│ ╭───────────────────────────────╮ │
│ │ ━━                            │ │
│ │ Ponto escolhido               │ │
│ │ Rua X, 123 - Bairro           │ │
│ │ [Salvar este lugar]           │ │
│ │ Lugares salvos [Casa] [...]   │ │
│ │ [Usar este ponto]             │ │
│ ╰───────────────────────────────╯ │
└───────────────────────────────────┘
* Só com foco ou texto; aviso em pílula com fundo.
```

**Modo compacto ao salvar (R1):** sem alça ou linha principal “Ponto escolhido”; o endereço fica numa linha de apoio. Ordem: campo de nome com foco automático → Cancelar e Salvar → quatro tipos numa linha. Com teclado aberto, a ajuda da busca e “Minha localização” desaparecem, e o painel sobe pela altura do teclado. `[EM ABERTO]` Confirmar em aparelho, inclusive fonte a 130% e 200%; o teste automatizado não mede a área visível real.

## Comportamento

1. `[DECISÃO]` A câmera abre no ponto do campo, no outro campo, na última posição já autorizada ou no centro padrão. Não pede permissão nem liga o GPS nessa abertura. Nenhum marcador é criado automaticamente.
2. `[DECISÃO]` Tocar no mapa coloca o marcador exatamente no toque. Outro toque o move. Arrastar o marcador atualiza o ponto no fim do gesto. Mover ou aproximar o mapa não muda o ponto; tocar não recentra a câmera. “Usar este ponto” habilita quando há marcador (R3, resolvido pelo marcador por toque).
3. `[DECISÃO]` Busca, “Minha localização” e chip de lugar salvo movem a câmera e colocam o marcador no resultado. A busca textual consulta somente após “Buscar”, com pelo menos três caracteres.
4. `[DECISÃO]` Toda mudança de ponto consulta o endereço pelo geocodificador reverso do sistema (`expo-location`), salvo quando o chip já contém `endereco`. O painel mostra “Buscando endereço…” e depois até duas linhas do endereço; erro ou timeout mostra “Endereço indisponível” com “Ponto escolhido no mapa” como apoio. Respostas antigas são descartadas. A falha não impede confirmar.
5. `[DECISÃO]` O rótulo gravado na consulta usa o endereço quando disponível, limitado a 60 caracteres com reticências. “Minha localização” e lugar salvo preservam seu rótulo; a busca usa endereço quando disponível e texto digitado como fallback. Toque ou arrasto do marcador substituem qualquer rótulo anterior.
6. `[DECISÃO]` Salvar lugar guarda nome, tipo, ponto e endereço atual (quando disponível) no aparelho. O formulário mostra o endereço como apoio; o chip com endereço guardado dispensa nova consulta.
7. Fora do município, o aviso permanece e a confirmação fica desabilitada (PL-11). Web sem mapa permite busca, localização e lugares salvos.

## Estados e acessibilidade

Sem ponto · marcador escolhido · buscando endereço · endereço indisponível · busca textual · obtendo localização · salvando · fora da área · mapa indisponível. O marcador tem rótulo de acessibilidade e é arrastável; todos os botões de ícone têm rótulo. O endereço usa anúncio `polite`. Alvos de toque têm pelo menos 48 pt; texto escala até 200%. “Reduzir movimento” desliga a animação da câmera.

## Privacidade e linguagem

`[DECISÃO]` D-30: as coordenadas do ponto marcado são enviadas ao serviço de mapas do celular pela geocodificação reversa do sistema; não são registradas em log nem enviadas a servidor do projeto. A busca textual também usa o serviço do sistema somente ao confirmar a busca. Lugares salvos ficam no aparelho. O mapa não usa cores como indicação de segurança e não mostra ocorrências individuais.

## Evidência e pendências

- `[DECISÃO]` R1: formulário compacto implementado; validação visual com teclado no aparelho ainda pendente.
- `[DECISÃO]` R2: aviso da busca em pílula com fundo e visível só com foco ou texto.
- `[DECISÃO]` R3: sem pino fixo; botão habilitado ao colocar marcador por toque.
- Testes automatizados: `escolher-ponto.test.tsx`, `MapaPonto.native.test.tsx` e `enderecoDoPonto.test.ts`. `[EM ABERTO]` Verificação física do teclado, tela pequena e fontes ampliadas.
