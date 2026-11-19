# T25-B: 12 ajustes pós-teste no aparelho e correção do teclado (19/11/2026)

**Origem:** depois do redesign pelos mockups (plano em `12_plano_redesign_novas_telas.md`), o Lucas testou o app no aparelho e listou 12 bugs e melhorias. Workers #5, #6 e #7 executaram por frente; o lead fez a frente D, a integração e a correção do teclado.

**Estado:** validado no aparelho pelo Lucas em 19/11/2026. `tsc` limpo, ESLint limpo, Jest 857/857 (63 suítes). **Sem commit.**

## O que mudou

| Item | Mudança | Decisão | Onde |
|---|---|---|---|
| 1 | Configurações removida; aba Perfil assume conta, tema, status Plus, Rotina, privacidade e sair; renomear e apagar lugar (com desfazer) vão para a aba Locais | D-38 | `(abas)/perfil.tsx`, `(abas)/locais.tsx` |
| 2 | Telas de aba ganham espaço inferior com a altura da barra (`Tela abas`, `medidas.alturaBarraAbas`) | D-38 | `components/Tela.tsx`, `components/medidas.ts` |
| 3 | Tema Sistema, Claro ou Escuro, guardado no aparelho | D-38 | `theme/ModoTemaProvider.tsx`, `theme/useTema.ts` |
| 4 | Contatos sem `Stack.Screen` na aba e com formulário próprio (ver "Teclado" abaixo) | — | `(abas)/contatos.tsx`, `components/contatos/FormularioContato.tsx` |
| 5, 12 | Assinatura simulada guardada (plano e data, sem valor); aba Plus vira portão; Perfil mostra assinante | D-38 | `plus/AssinaturaContext.tsx`, `(abas)/plus.tsx` |
| 6 | Resultado: folha em meia altura, cartões compactos, link "Entenda de onde vem nossos dados e fontes" | D-39 | `resultado/index.tsx`, `components/resultado/resultado.tsx` |
| 7 | Detalhe da rota sem "Compartilhar" e "Planejar volta"; compartilhar no cartão do Seguir | D-39 | `resultado/[rotaId].tsx`, `seguir/[rotaId].tsx` |
| 8 | Aviso do Seguir com "Entendi e não mostrar de novo" (preferência só no aparelho) | — | `seguir/[rotaId].tsx`, `seguir/armazenamento.ts` |
| 9 | "Fechar" no Seguir volta direto à home (`dismissAll` + `replace('/planejar')`) | — | `seguir/[rotaId].tsx` |
| 10 | Cartão grande de horário que abre a folha de rodas; atalhos removidos | D-37 | `components/planejar/SeletorHorario.tsx` |
| 11 | Home do Plus lista todas as rotinas, com "Nova rotina" | D-38 | `plus/PlusHomeConteudo.tsx` |

## Teclado que abria e fechava

- **Sintoma:** em Locais (renomear) e Contatos, o teclado subia e descia na hora; só dava para digitar 1 caractere quando havia erro na tela. O mesmo já tinha acontecido no horário antigo e em Configurações. No login funcionava.
- **Causa:** `components/CampoTexto.tsx` acrescentava sombra (`brilho`) à caixa do campo só no foco. No Android (New Architecture, RN 0.88), ligar a sombra recria a view nativa; o `TextInput` perde o foco, a sombra sai e o teclado fecha. Com erro na tela a sombra era suprimida, por isso o campo aceitava a primeira tecla, que limpava o erro e religava a sombra. O login usa `CampoEntrada`, igual mas sem essa sombra.
- **Correção:** foco só na borda (`cor.acaoLink`, `medidas.bordaFoco`); `locais.tsx` sem rolagens disparadas no foco. Teste de regressão em `components/componentes.test.tsx`, que falha com o código antigo e passa com a correção. Regra anotada em `docs/app-map/07_design/componentes.md`.
- **Lição:** a configuração `softwareKeyboardLayoutMode: "pan"` (`app.json`) é ignorada no Expo Go; as hipóteses anteriores sobre `KeyboardAvoidingView` e `pan` não eram a causa.

## Em aberto
- Novo caminho para "Planejar a volta" (FL-08, US-07 AC1), que saiu do resultado e do detalhe (D-39).
- PL-34 a PL-37 (contatos no compartilhamento e na rotina, US da simulação, texto do radar, compartilhar na volta pronta).
- Frase do mockup 06 sobre o histórico no aparelho (D-24).
- Cabeçalho "Sua ida 15 nov" e pílula escura do mockup 03.
