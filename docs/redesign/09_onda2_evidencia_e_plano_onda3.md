# Onda 2: evidência em vídeo, conclusões e plano da Onda 3

**Data:** 15/11/2026 · **Status:** conclusões do lead sobre o vídeo `evidencia-redesign-vs/onda2/onda2-redesign-evidencia-video.mp4` (100 s, celular Android, Expo Go) + relato do Lucas. Itens de decisão marcados `[HIPÓTESE]` até o Lucas aprovar.
**Como o vídeo foi analisado:** não há player; extraí um quadro a cada 2 s (50 quadros) e ampliei os trechos críticos (38 a 42 s). O que afirmo abaixo vem de quadros que vi; o que não deu para confirmar está marcado.

## 1. O que o vídeo confirma (funciona)
| Tempo | O que se vê | Conclusão |
|---|---|---|
| 0 s | Entrar com e-mail e senha; mais tarde Configurações mostra o e-mail da conta | **O login do Neon Auth funciona no celular** (estava como "nunca testado") |
| 2 a 4 s | Home com cartão De onde / Para onde, atalhos de horário, Lugares salvos com "Adicionar lugar" | Home clara, sem Ida/Volta; atalhos de horário cabem numa linha |
| 6 a 34 s | Mapa em tela cheia, busca "FIAP Paulista" e "C6 Bank" encontram o lugar e o mapa vai até lá | **A busca por texto funciona** (geocodificador do Android) |
| 36 a 42 s | Salvar lugar com tipo e nome; "Casa" e "Trabalho" viram chips | Fluxo de salvar funciona; **mas o teclado cobre o formulário** (ver B1) |
| 44 a 48 s | Home com origem "Ponto escolhido no mapa" e destino "Casa" (lugar salvo) | Lugar salvo preenche o campo com um toque |
| 52 a 78 s | Resultado com mapa, 3 opções, "40 min" em destaque, trechos, "Dados: SSP-SP" | O visual premium está de pé; os dados continuam de exemplo (selo EXEMPLO) |
| 80 a 94 s | Por que esta rota, detalhes, volta à home | Navegação sem quebras |
| 96 s | Configurações com perfil, lugares com lixeira, privacidade, Sair | Agrupamento funciona |

## 2. Problemas encontrados (com evidência)
**B1 · Teclado cobre o formulário de salvar (relato do Lucas + vídeo, 39,5 a 40,5 s).** Ao tocar no campo do nome, o painel inferior fica atrás do teclado: o campo e os botões Salvar/Cancelar não aparecem acima dele, e a pessoa digita às cegas. Causa provável: o painel é posicionado de forma absoluta no rodapé e não reage ao teclado (no Android com tela de borda a borda a janela não redimensiona sozinha).

**B2 · Hora errada no resultado (achado novo).** A home mostra a saída `05:11`, e o resultado mostra "Saída às 08:11" (vídeo, 54 a 58 s). O mesmo havia aparecido nos prints de ontem (saída 11:46, resultado 14:46): é sempre **+3 h**. Causa: `resultado/index.tsx` e `resultado/[rotaId].tsx` fazem `data.slice(11, 16)` no texto ISO, e o app envia `toISOString()` (UTC). A tela de busca (`toLocaleTimeString`) está certa e a do resultado errada. Os horários dos trechos ("Sai às 23:00 (previsto)") são fixos da fixture.

**B3 · Botão "usar minha localização" no mapa parece ter sumido (relato do Lucas).** Ele existe, mas só como um ícone de alvo sem texto, sem fundo contrastante sobre um mapa escuro, à direita (quadros de 14 s em diante). Na prática ficou invisível, e antes era um botão com texto. Conclusão: foi uma regressão de descoberta, não de função.

**B4 · O nome do ponto se perde.** Depois de buscar "C6 Bank", o painel mostra "C6 Bank", mas, ao arrastar um pouco, vira "Ponto escolhido no mapa" (39 s) e é isso que volta para a home. Além disso o painel trunca em "Ponto escolhido n…" porque o botão "Salvar este lugar" divide a linha.

## 3. Conclusões adicionais (o que eu melhoraria)
**Mapa e escolha de ponto**
- **U1 · Abrir perto de quem usa.** O mapa abre mostrando "São Paulo" inteiro. Deveria abrir na localização (se a permissão já foi dada), no último ponto ou na origem já escolhida, com zoom de bairro. Hoje o primeiro gesto é sempre dar zoom.
- **U2 · Nome legível do ponto `[HIPÓTESE]`.** Ao confirmar, buscar o endereço do ponto (geocodificação reversa do sistema) para rotular como "Av. Nove de Julho, 100". Substitui "Ponto escolhido no mapa" na home, no resultado e nos lugares salvos. Exige uma decisão de privacidade (as coordenadas vão ao geocodificador do sistema, só ao confirmar).
- **U3 · Mais de um resultado na busca `[HIPÓTESE]`.** Hoje usamos só o primeiro. O geocodificador devolve vários: listar até 5 candidatos com endereço (precisa do mesmo passo do U2).
- **U4 · Aviso de privacidade da busca.** O texto "O texto buscado é enviado…" aparece em cada foco e cobre o mapa. Mostrar uma linha curta e discreta, ou só nas primeiras vezes (o texto completo já está no Aviso de privacidade).
- **U5 · Mover o "Salvar este lugar".** Tirar da linha do ponto (causa a truncagem) e pôr como ação própria abaixo; depois de salvar, mostrar confirmação ("Salvo como Trabalho") e ainda usar o ponto.

**Resultado (TL-07)**
- **U6 · Cabeçalho da folha longo.** "3 opções, com a de menor exposição estimada primeiro" + "Expandir lista" + horário + "Horários previstos (GTFS)" + "Planejar a volta" + a dica "Toque na opção…" ocupam quase metade da folha antes do primeiro cartão (52 s). Proposta: "3 opções" (uma linha) com chip "Menor exposição estimada primeiro"; dica só na primeira vez; "Planejar a volta" vira ação secundária (ícone ou no fim); "Horários previstos (GTFS)" vai para "Sobre os dados".
- **U7 · Câmera do mapa.** Pinos de origem e destino ficam cortados na borda (60 a 70 s) e o traço atravessa a tela. Ajustar a câmera para caber a rota inteira acima da folha (`fitToCoordinates` com margem do tamanho da folha).
- **U8 · Folha com três alturas** (recolhida, meia, cheia) em vez de só "Expandir lista", como na referência de rastreio.
- **U9 · "Por que esta rota?" com duas saídas** (seta de voltar e "Fechar", 82 s): manter só uma.

**Home e configurações**
- **U10 · Lugar duplicado em Configurações:** "Casa / Casa" (nome e tipo iguais). Mostrar o tipo só quando o nome é diferente; permitir **renomear** (hoje só apagar).
- **U11 · Campo de hora.** Continua digitado (05:11); com os atalhos já cobre o caso comum. Um seletor nativo exigiria dependência nova; fica opcional.
- **U12 · Tela "Buscando":** num quadro (50 s) o corpo apareceu vazio; pode ser só a animação de entrada no instante da captura. **Não confirmado**: conferir no aparelho com a consulta lenta.

**Qualidade geral**
- **Botão cinza do Expo Go** continua sobre as telas (não é do app; some na versão instalada).
- Imagens ainda são placeholders: o ícone fantasma de cadeado em Entrar e o degradê dos cartões cumprem o papel, mas a primeira impressão melhora muito com as fotos reais.

## 4. Os dados mockados e o traçado no mapa (Plano B)
O Lucas notou corretamente: o traçado **não** segue ruas, e os pontos de origem/destino escolhidos **não alteram** o resultado (as fixtures são as mesmas para qualquer par de pontos, com linha e paradas fixas). Isso é esperado no modo mock e é exatamente o que o Plano B resolve (`docs/dados-reais/00_plano.md`):
1. **Roteamento real (OTP2)** devolve trechos e **geometria** por rota; o adaptador `otp2.ts` já existe e está testado com fixture sintética, **mas não está ligado**.
2. **Exposição real (SSP no Neon)** calculada num serviço, não no app.
3. Até o OTP2 existir, o app deve **dizer** que a rota é de exemplo (selo EXEMPLO já existe) e **não** fingir que o traçado depende dos pontos.
O que o vídeo acrescenta ao Plano B: (a) o horário exibido precisa vir do servidor em um formato com fuso (B2); (b) o mapa do resultado precisa receber a geometria por trecho (a pé x ônibus) para o traço acompanhar as ruas; (c) com dados reais o selo EXEMPLO some e o aviso "dados" muda (casos `INDISPONIVEL` e "só roteamento" do plano).

## 5. Plano da Onda 3
**Prazo:** hoje 15/11; código congelado na noite de 18/11; entrega 19/11 23h55.
| Bloco | Itens | Esforço | Depende de |
|---|---|---|---|
| **3A · Correções (hoje)** | B1 teclado; B2 fuso da hora; B3 botão "Minha localização" com texto; B4 nome do ponto + layout do painel (U5); U9; U10 (renomear e duplicado) | pequeno | nada |
| **3B · Mapa e resultado** | U1 abrir perto; U6 cabeçalho; U7 câmera; U8 folha em três alturas; U4 aviso discreto | médio | nada (usa mock) |
| **3C · Plano B** | ligar `otp2.ts` (seleção de fonte em `config/ambiente.ts`); geometria por trecho no mapa; casos "só roteamento"; SQL e carga da SSP (se Lucas liberar o Neon) | grande | **Lucas:** servidor OTP2 (Java 25), PostGIS e Data API no Neon `dev` |
| **3D · Nomes de ponto (decisão)** | U2 e U3: geocodificação reversa e lista de candidatos | médio | **Decisão D-30** de privacidade |
| **3E · Fechamento** | imagens reais; revisão dos textos `[HIPÓTESE]`; acessibilidade (200%, leitor de tela); prints e vídeo; `DRY_RUN` do sync; Teams | médio | Lucas (imagens, prints) |
**Corte (do plano B):** sem geometria até 16/11 ou sem adaptador no aparelho até 17/11 → congela em EXEMPLO e entrega 3A, 3B, 3D, 3E.
**Decisão pedida (D-30 proposta):** liberar a geocodificação reversa ao confirmar o ponto e a lista de candidatos na busca, com aviso no TL-13 e sem log. Alternativa: manter só o primeiro resultado e o rótulo "Ponto escolhido no mapa" (pior leitura, zero envio adicional).

## 6. Documentação atualizada nesta rodada
Fluxos e telas alterados desde a D-29 foram reescritos: TL-04, TL-05, FL-04, FL-05, FL-08, FL-11 (nota), FN-04, FN-06, FN-13, microcopy, dados por tela, story map, navegação, índices. Regra permanente criada em `src/mobile-app/AGENTS.md` ("Mudou o fluxo, mudou a documentação").
