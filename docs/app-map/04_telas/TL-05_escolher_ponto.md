# TL-05 · Escolher ponto no mapa

- **Status:** pronta, **revista pela D-29 (14/11/2026)**; correções B1, B3, B4 e melhorias U1, U2, U3, U5 previstas na Onda 3 (`docs/redesign/09_onda2_evidencia_e_plano_onda3.md`) · **Rota:** `/(app)/escolher-ponto` (modal; parâmetro `campo=origem|destino`)
- **Objetivo:** escolher origem ou destino em um mapa de tela cheia, com busca por texto, localização atual e lugares salvos; opcionalmente salvar o ponto como lugar.
- **US/AC e funcionalidades cobertas:** US-05, US-06 AC5 (revisto), US-04 AC5, US-16 AC1 · FN-04, FN-13 · **RNF:** RNF-02, RNF-07
- **Entradas:** TL-04 (tocar em De onde, Para onde ou Adicionar lugar). **Saídas:** TL-04 com o campo preenchido; fechar volta sem mudar.

## Wireframe
```
┌──────────────────────────────┐
│ (←) [🔍 Rua, avenida ou... Buscar]│
│ [Escolher origem]            │
│                              │
│          mapa em tela cheia  │
│              📍 (pino fixo)   │
│                         (⌖)  │   ⌖ localização
│╭────────────────────────────╮│
││ ━━                          ││
││ 📍 Ponto escolhido          ││
││    Av. Nove de Julho  [Salvar este lugar]│
││ Lugares salvos              ││
││ (Casa) (Trabalho)           ││
││ [      Usar este ponto    ] ││
│╰────────────────────────────╯│
└──────────────────────────────┘
```
**Salvar este lugar:** o painel mostra tipo (Casa, Trabalho, Estudo, Outro), nome (até 30 letras) e Salvar/Cancelar. **Bug conhecido (B1):** o teclado cobre este formulário; correção na Onda 3A.

## Comportamento
1. O mapa abre no centro de São Paulo (U1 prevê abrir na localização ou no ponto existente) com o pino no centro. Arrastar o mapa ou tocar define o ponto; o botão "Usar este ponto" só habilita depois de um ponto escolhido.
2. **Busca por texto (D-29):** só ao tocar em Buscar ou na tecla de busca; mínimo de 3 letras; o texto leva ", São Paulo, SP, Brasil"; usa o geocodificador do sistema; só o primeiro resultado (U3 prevê lista); o mapa vai até o resultado e a pessoa ajusta o pino.
3. **Localização:** botão de alvo; pede a permissão na hora, lê uma vez. Negada: aviso e o resto segue. (B3: ficar com texto "Minha localização".)
4. **Lugares salvos:** chips; um toque leva o mapa ao lugar e o escolhe com o nome dele.
5. **Salvar este lugar:** nome + tipo, até 10 lugares, só no aparelho (SecureStore).
6. **Sem pontos de exemplo.** Fora do município (PL-11): aviso e "Usar este ponto" desabilitado.
7. Sem mapa (web): mensagem e o resto (busca, localização) segue.

## Estados
sem ponto · ponto escolhido (mapa, busca, localização ou lugar) · buscando · busca sem resultado · busca indisponível · obtendo localização · permissão negada · falha da localização · salvando · erro de nome · limite de 10 lugares · fora da área · mapa indisponível.

## Textos
`escolher_ponto.*` e, em revisão, `textos/hipotesesMapa.ts` (busca, salvar lugar, tipos). Catálogo em `08_microcopy.md`.

## Acessibilidade
Busca com rótulo "Buscar endereço ou lugar"; botões de ícone com rótulo; tipos de lugar como grupo de opções; avisos de erro anunciados; título da tela como cabeçalho; o mapa é um recurso visual (a busca e os lugares salvos são o caminho acessível).

## Privacidade e linguagem
- A busca envia **só o texto digitado** ao serviço de mapas do sistema, apenas ao tocar em Buscar; nada é guardado nem registrado em log (US-19 AC2). Citado no aviso de privacidade (TL-13) `[HIPÓTESE]`.
- GPS só nesta ação, em primeiro plano (US-05 AC3). Lugares salvos só no aparelho (US-04 AC4–AC5).
- Mapa sem marcadores de ocorrência e sem rótulo de risco (US-15 AC4, RNF-02); atribuição do mapa visível (US-16 AC1, PL-25).

## Critérios de pronto
- [x] Tocar ou arrastar escolhe o ponto; confirmar grava no campo certo.
- [x] Busca por texto leva o mapa ao lugar; texto curto e a cada tecla não consultam.
- [x] Lugar salvo vira ponto com o nome; salvar guarda nome, tipo e ponto.
- [ ] Teclado não cobre o formulário de salvar (B1).
- [ ] Botão de localização visível e com texto (B3).
- [ ] Nome do ponto não se perde ao arrastar um pouco (B4).
