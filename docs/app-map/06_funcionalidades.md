# Catálogo de funcionalidades

- **Status:** rascunho (Fase 2, 13/11/2026)
- **Fonte:** `docs/10` (US/AC) + decisões D-00 a D-16. Cada funcionalidade (FN) liga telas, regras, dados, AC e testes previstos. Os testes ficam detalhados no `10_rastreabilidade.md` (Fase 4).
- **Contrato da API:** é o que o **app espera** receber. Por D-00, foi escrito **sem olhar o código do backend**, então todo ele é `[HIPÓTESE]` e precisa ser conciliado com a API real antes da integração (PL-18). Enquanto isso, o modo mock do app segue este contrato.

## Resumo

| FN | Funcionalidade | Telas | US / AC | Depende de |
|---|---|---|---|---|
| FN-01 | Cadastro com aviso de privacidade | TL-02, TL-13 | US-01 AC1–AC6 | Endpoint de conta (PL-05) |
| FN-02 | Login, sessão e saída | TL-01, TL-03, TL-12 | US-02 AC1–AC3 | Endpoint de sessão (PL-05) |
| FN-03 | Excluir conta — **adiado (D-25)** | TL-12 | US-03 AC1–AC3 | Endpoint de conta (PL-05) |
| FN-04 | Escolher ponto (mapa, busca por texto, GPS, lugar salvo) | TL-04, TL-05 | US-05 AC1–AC3, US-06 | GPS, mapa base (PL-03) |
| FN-05 | Planejar e validar a consulta | TL-04 | US-06 AC1–AC4 | Limite do município (PL-11) |
| FN-06 | Planejar a volta | TL-04, TL-07, TL-08 | US-07 AC1–AC2 | FN-05 |
| FN-07 | Buscar alternativas e focos | TL-06, TL-07 | US-08 AC1–AC4, US-11, D-12, D-15, D-16 | Endpoint de consulta |
| FN-08 | Exibir o resultado (mapa + container) | TL-07 | US-08, US-11 AC5, US-13, D-01, D-09, D-23 | FN-07 |
| FN-09 | Detalhes da rota (passo a passo) | TL-08 | US-09 AC1, D-04 | FN-07 |
| FN-10 | Por que esta rota? | TL-09 | US-10, US-11 AC1–AC4, US-12, D-08, D-11, D-13 | FN-07 |
| FN-11 | Sobre os dados e Dados considerados | TL-10, TL-11 | US-14, US-15, US-16, US-18 AC3, D-14 | FN-07 |
| FN-12 | Aviso de privacidade | TL-13 | US-01 AC6, RNF-09 | — |
| FN-13 | Histórico local e locais salvos | TL-04, TL-05, TL-12 | US-04 AC1–AC4 | Banco local |
| FN-14 | Erros globais e sem rede | TL-02, TL-03, TL-04, TL-06, TL-12 | FL-13, PL-12 | — |
| FN-15 | Compartilhar minha volta (**Depende do tempo**) | TL-08, TL-14, indicador global | US-21 AC1–AC5, AC7, AC9; US-05 AC3; US-19 AC4 | Endpoint de compartilhamento (PL-18), GPS em segundo plano (PL-24) |
| FN-16 | Acompanhar viagem (**Depende do tempo**) | TL-15 | US-21 AC6–AC8 | Endpoint de compartilhamento (PL-18), deep link |
| FN-17 | Rotina da semana e lembrete local (VoltaSegura+; **Depende do tempo**) | TL-12, TL-16, TL-17, TL-04 | US-22 AC1–AC5 | FN-13 (lugares), `expo-notifications` |

## Regras comuns

- **O app não calcula estatística** (`docs/plano_app.md` §5.1). Focos, caso, motivo, N, L, D e cobertura vêm prontos da API.
- **Modo `mock|api`** por configuração (`docs/plano_app.md` §5.1). No mock, toda resposta traz `exemplo: true`, e as telas mostram a marca `EXEMPLO` (RNF-08). Há uma fixture para cada caso da matriz do FL-07.
- **Nenhum log do app** contém coordenadas, endereços, nomes de locais ou o e-mail (US-19 AC2).
- **Autenticação:** as chamadas da sessão em diante levam `Authorization: Bearer <token>`. O token fica no armazenamento seguro do aparelho.

---

## FN-01 · Cadastro com aviso de privacidade

- **Regras:** só e-mail e senha (AC1); aceite obrigatório (AC2); e-mail único (AC3); formato de e-mail e senha não vazia (AC4); Google só com e-mail e identificador (AC5); aviso como minuta (AC6). Regras de senha em aberto (PL-07).
- **Contrato esperado `[HIPÓTESE]`:**

| Chamada | Corpo | Respostas |
|---|---|---|
| `POST /api/conta` | `{ "email": "…", "senha": "…", "aceiteAviso": true, "versaoAviso": "minuta-2026-11" }` | `201 { "token": "…", "expiraEm": "ISO-8601" }` · `409 { "erro": "EMAIL_EXISTENTE" }` · `422 { "erro": "VALIDACAO", "campos": [{ "campo": "email", "codigo": "FORMATO" }] }` |
| `POST /api/conta/google` | `{ "idToken": "…", "aceiteAviso": true, "versaoAviso": "…" }` | `201` ou `200 { "token", "expiraEm" }` · `401 { "erro": "GOOGLE_INVALIDO" }` |

- **Testes previstos:** positivo (cadastro válido); negativos (sem aceite, e-mail repetido, e-mail inválido, senha vazia); a tela não tem campos extras.

## FN-02 · Login, sessão e saída

- **Regras:** mensagem genérica no erro (AC2); conta obrigatória (AC3); conta excluída não entra (US-03 AC2).
- **Contrato esperado `[HIPÓTESE]`:**

| Chamada | Corpo | Respostas |
|---|---|---|
| `POST /api/sessao` | `{ "email": "…", "senha": "…" }` | `200 { "token", "expiraEm" }` · `401 { "erro": "CREDENCIAIS" }` (mesmo código para e-mail inexistente, senha errada e conta excluída) |
| `DELETE /api/sessao` | — | `204` |
| Qualquer chamada com token vencido | — | `401 { "erro": "SESSAO_EXPIRADA" }` → FL-13 → TL-03 |

- **Testes previstos:** positivo (login válido abre TL-04); negativos (senha errada, e-mail inexistente, conta excluída: mesma mensagem); sem sessão, consultar leva ao login.

## FN-03 · Excluir conta (adiado, D-25)

> **Adiado (D-25).** `[DECISÃO — 14/11/2026]` Fora do MVP por ora: o Neon Auth gerenciado não oferece exclusão e ela exigiria endpoint próprio. Conteúdo preservado.

- **Regras:** confirmação obrigatória (AC1, AC3); o servidor apaga e-mail e identificador (AC1); localmente, o app apaga sessão, histórico e locais `[HIPÓTESE]`.
- **Contrato esperado `[HIPÓTESE]`:** `DELETE /api/conta` (com token) → `204` · `401`. Erro de rede: nada é dado como excluído.
- **Testes previstos:** positivo (excluir e tentar entrar: negado); negativo (cancelar: nada apagado).

## FN-04 · Escolher ponto

- **Regras (revistas pela D-29):** mapa em tela cheia com pino central; **busca por texto** só ao tocar em Buscar, mínimo de 3 letras, limitada a São Paulo, pelo geocodificador do sistema (revê D-02 e US-19 AC3); GPS só na ação, em primeiro plano (US-05 AC1, AC3); permissão negada não bloqueia (AC2); lugares salvos como chips; **sem pontos de exemplo**; nome do ponto do mapa é "Ponto escolhido no mapa" (PL-09) até a Onda 3 (U2 prevê endereço legível).
- **Dados:** coordenada `{lat, lon}` na memória da consulta; o texto da busca não é guardado.
- **Testes:** tocar/arrastar e confirmar grava o campo certo; busca leva o mapa ao resultado; texto curto e a cada tecla não consultam; busca sem resultado e indisponível avisam; GPS concedido, negado e com falha; lugar salvo vira ponto; fora do município bloqueia (`escolher-ponto.test.tsx`).

## FN-05 · Planejar e validar a consulta

- **Regras:** campos obrigatórios (US-06 AC2); origem ≠ destino (AC4); dentro do município, checado no aparelho (AC3, D-05, PL-11); horário padrão = agora.
- **Testes previstos:** positivo (consulta válida enviada); negativos (destino vazio, origem = destino, ponto fora do município: nada enviado).

## FN-06 · Planejar a volta

- **Regras (D-29):** **não há seletor Ida/Volta**; "Planejar a volta" (resultado) abre a TL-04 com origem e destino invertidos e a etiqueta "Planejando a volta" (US-07 AC1); horário próprio e faixa do dia do horário da volta (AC2, DT-05; calculado pela API); "Inverter" disponível na TL-04.
- **Testes:** volta com pontos invertidos e horário 23h usa a faixa "noite" na TL-09; a ida e a volta não se misturam; a home não tem seletor de sentido.

## FN-07 · Buscar alternativas e focos

- **Regras:**
  - até 5 candidatas (D-15);
  - até 3 rotas exibidas, cada uma com foco: menor tempo, menos caminhada e menor exposição estimada, esta só se vencer cada uma das outras (D-12);
  - rota que vence dois focos aparece uma vez (D-12);
  - "outra opção" quando sobra uma rota (D-16);
  - `L = 0` sem foco de exposição (D-13);
  - sem serviço no horário: lista vazia (US-08 AC2);
  - horários previstos (AC3).

  **A seleção das rotas e dos focos é da API.**
- **Contrato esperado `[HIPÓTESE]`:**

`POST /api/consultas` (com token). O servidor não grava a consulta (US-19 AC1).

```json
{
  "origem":  { "lat": -23.0, "lon": -46.0 },
  "destino": { "lat": -23.0, "lon": -46.0 },
  "saida": "2026-11-13T23:00:00-03:00",
  "sentido": "volta"
}
```

Resposta `200`:

```json
{
  "exemplo": false,
  "caso": "CONCLUSIVO | SEM_DIFERENCA | MISTOS | INSUFICIENTE | NAO_APLICAVEL | SEM_COMPARACAO | INDISPONIVEL",
  "motivo": "AMOSTRA | COBERTURA | LARGURA | null",
  "rotas": [
    {
      "id": "r1",
      "focos": ["MENOR_TEMPO", "MENOS_CAMINHADA", "MENOR_EXPOSICAO", "OUTRA_OPCAO"],
      "duracaoMin": 32,
      "caminhadaKm": 1.4,
      "trocas": 0,
      "saidaPrevista": "2026-11-13T23:04:00-03:00",
      "chegadaPrevista": "2026-11-13T23:36:00-03:00",
      "geometria": "polyline codificada da rota inteira",
      "trechos": [
        {
          "id": "t1", "ordem": 1, "modo": "A_PE | ONIBUS | METRO | TREM",
          "linha": "L4 | 875A | null",
          "embarque": "nome da parada | null",
          "desembarque": "nome da parada | null",
          "partidaPrevista": "ISO-8601 | null",
          "duracaoMin": 4, "distanciaKm": 0.25,
          "faixaDoDia": "MADRUGADA | MANHA | TARDE | NOITE | null (só a pé)",
          "geometria": "polyline do trecho"
        }
      ],
      "exposicao": { "registros": 6, "kmAPe": 1.4, "registrosPorKm": 4.3, "cobertura": 0.88 },
      "categorias": {
        "furto":   { "total": 7, "outros": 4, "carga": 0, "veiculo": 3 },
        "roubo":   { "total": 3, "outros": 2, "carga": 0, "veiculo": 1, "latrocinio": 0 },
        "transito": { "total": 1 }
      }
    }
  ],
  "sobreOsDados": {
    "fonte": "SSP-SP",
    "periodo": { "inicio": "2026-01-01", "fim": "2026-09-30", "meses": 9 },
    "atualizacao": { "ssp": "AAAA-MM-DD", "gtfs": "AAAA-MM-DD" }
  },
  "panoramaMunicipal": {
    "periodo": { "inicio": "2026-01-01", "fim": "2026-09-30" },
    "homicidioDoloso": 0, "tentativaHomicidio": 0, "estupro": 0, "estuproVulneravel": 0
  }
}
```

- **Observações do contrato:**
  - Os valores numéricos acima são de exemplo (RNF-08). No panorama, os zeros são marcadores de lugar, não dados.
  - `registrosPorKm` é `null` quando `kmAPe = 0` (US-10 AC5).
  - Qualquer contagem pode vir `null`, que significa "dados insuficientes" ou indisponível, nunca zero (`docs/07`).
  - `exposicao` traz só agregados por rota. **Nunca** coordenadas ou dados de boletins (US-20 AC1).
  - `rotas: []` significa sem serviço no horário (US-08 AC2).
- **Erros:** `400 { "erro": "VALIDACAO" }` · `401` · `422 { "erro": "FORA_DA_AREA" }` (salvaguarda; o app já checa) · `503`/`504` → FL-13.
- **Testes previstos:**
  - uma fixture por caso: conclusivo, sem diferença, mistos, insuficiente nos 3 motivos, não aplicável, uma rota, outra opção, sem serviço;
  - em cada uma, conferir focos, ordem e ausência de foco de exposição quando não for CONCLUSIVO.

## FN-08 · Exibir o resultado

- **Regras:** mapa com o trajeto inteiro da rota selecionada (D-01); **prioridade da menor exposição estimada**: com esse foco, a rota vem primeiro, já selecionada e com rótulo em destaque, e as demais por tempo; sem ele, todas por tempo (D-23); linha fixa "Sobre os dados" (D-09); nada de números de ocorrência (D-14); foco não depende de cor (RNF-07); uma rota só: sem comparação (US-08 AC4).
- **Testes previstos:** com `MENOR_EXPOSICAO`, essa rota é a primeira, vem selecionada e o mapa abre nela; sem esse foco, a ordem é por tempo; o foco de exposição só aparece com `caso = CONCLUSIVO`; a linha de dados está sempre presente; varredura de termos proibidos.

## FN-09 · Detalhes da rota

- **Regras:** trechos em ordem com embarque e desembarque (US-09 AC1); só leitura (D-04); botão "Por que esta rota?" só em `modo = A_PE` (D-08).
- **Testes previstos:** a ordem dos trechos é igual a `ordem`; o botão só aparece em trecho a pé.

## FN-10 · Por que esta rota?

- **Regras:** indicativo por `caso`/`motivo` (D-11: `MISTOS` usa o texto de `SEM_DIFERENCA`); números da rota inteira (D-08); faixa do dia do trecho; sem limiares nem regra (D-01); limitação de subnotificação sempre visível (RNF-03).
- **Mapeamento caso → indicativo:** `CONCLUSIVO` → indicativo de menor exposição estimada (só na rota com o foco; nas outras rotas, "Entre as opções avaliadas, outra teve menor exposição estimada", com link para ela `[HIPÓTESE]`) · `SEM_DIFERENCA`, `MISTOS` → sem diferença clara · `INSUFICIENTE` + motivo → dados insuficientes + motivo · `NAO_APLICAVEL` → texto de `L = 0` · `SEM_COMPARACAO` → só uma opção · `INDISPONIVEL` → comparação indisponível.
- **Testes previstos:** cada caso mostra o indicativo certo; nenhum texto contém "80%", "10 p.p.", "p <" ou "corredor".

## FN-11 · Sobre os dados e Dados considerados

- **Regras:** US-14 AC1–AC5; US-15 AC1–AC4; US-16 AC1; D-14 (totais por rota no corredor).
- **Testes previstos:** as cinco limitações presentes; créditos presentes; o panorama municipal só por ação deliberada e com aviso; o valor `null` aparece como "dados insuficientes".

## FN-12 · Aviso de privacidade

- **Regras:** minuta acadêmica, sem afirmar conformidade (US-01 AC6, RNF-09). Texto fixo, disponível sem rede.
- **Testes previstos:** a primeira linha é a marca de minuta; varredura de "conformidade" e "LGPD" em contexto afirmativo.

## FN-13 · Locais salvos (decidido, D-29) e histórico local (`[EM ABERTO]`)

> **D-30 (15/11/2026):** `[DECISÃO]` cada local salvo pode ter `endereco?: string`, legível, aparado e limitado a 140 caracteres. O endereço fica só no aparelho, junto com nome, tipo e coordenada. Registros antigos sem `endereco` continuam válidos; um campo `endereco` que não seja string é descartado sem perder o lugar. Renomear e desfazer a exclusão preservam o endereço; `atualizarEndereco` permite preenchê-lo ou corrigi-lo.

- **Locais salvos (implementado):** nome (até 30 letras) + tipo (Casa, Trabalho, Estudo, Outro) + coordenada; até 10; **só no aparelho**, no `expo-secure-store` (cifrado), chave única `voltasegura.locais`; nunca enviados nem registrados em log (US-04 AC4–AC5). Salvar na TL-05; usar na TL-04 (cartões) e na TL-05 (chips); apagar na TL-12. **Renomear** na interface em Configurações (edição inline); apagar com **Desfazer** por 5 s (Onda 3). Na web fica só em memória.
- **Histórico de trajetos (não implementado):** desligado por padrão (US-04 AC1), só no aparelho, apagar um ou todos (AC3). O SQLite saiu (D-24); onde guardar fica em aberto.
- **Testes:** salvar persiste e relê; nome vazio e limite recusam; renomear e apagar; nenhuma coordenada vai ao console (`locais.test.tsx`).

## FN-14 · Erros globais e sem rede

- **Regras:** FL-13. Mensagens sem código técnico nem culpa (RNF-06); dados digitados preservados; sem resultado antigo como se fosse atual.
- **Testes previstos:** sem rede, nada é enviado e o aviso aparece; tempo esgotado e erro do servidor têm "Tentar de novo"; sessão expirada leva ao login e retorna.

## FN-15 · Compartilhar minha volta (Depende do tempo, D-22)

- **Status (15/11/2026): protótipo com mock.** `src/services/compartilhamento.ts` tem `compartilhamentoMock` (memória, sem servidor nem GPS) e `compartilhamentoApi` (contrato abaixo, não conciliado, PL-18 aberto). Estado da sessão em `src/compartilhamento/`. GPS em segundo plano não implementado (PL-24 aberto).

- **Regras:**
  - explicar antes o que será compartilhado e até quando (US-21 AC2);
  - GPS em segundo plano só com a sessão ativa, com indicador global e "Parar" (D-20);
  - encerramento na chegada (PL-22), em "Parar" ou no tempo máximo (PL-20);
  - sem permissão de segundo plano, compartilha só o trajeto (US-21 AC5, `[HIPÓTESE]`);
  - o servidor guarda trajeto e última posição só durante a sessão e apaga ao encerrar (D-21, US-19 AC4);
  - logs sem coordenadas (US-19 AC2).
- **Contrato esperado `[HIPÓTESE]`** (PL-18):

| Chamada | Corpo | Respostas |
|---|---|---|
| `POST /api/compartilhamentos` (com token) | `{ "trajeto": { "geometria": "polyline", "trechos": [ { "modo", "linha", "partidaPrevista" } ], "chegadaPrevista": "ISO-8601", "destino": { "lat", "lon" } }, "aoVivo": true }` | `201 { "id": "…", "link": "https://…/a/<token>", "expiraEm": "ISO-8601" }` |
| `PUT /api/compartilhamentos/{id}/posicao` | `{ "lat": …, "lon": …, "em": "ISO-8601" }` | `204` · `410` (sessão encerrada ou expirada) |
| `PATCH /api/compartilhamentos/{id}` | `{ "expiraEm": "ISO-8601" }` (estender, PL-20) | `200` |
| `DELETE /api/compartilhamentos/{id}` | — (parar ou chegou: `{ "motivo": "PAROU" \| "CHEGOU" }`) | `204`; o servidor apaga trajeto e posições |

- **Observações:**
  - O servidor guarda só a **última** posição, não o histórico do percurso `[HIPÓTESE]`.
  - O `destino` vai no trajeto para o critério de chegada (PL-22). Ele é parte do que a usuária decidiu compartilhar.
  - Envio de posição a cada 30 s ou 50 m (PL-21).
- **Testes previstos:**
  - positivo: iniciar, receber o link e parar (o link expira);
  - negativo: permissão negada leva a "só trajeto";
  - chegada encerra sozinha;
  - nenhuma leitura de GPS em segundo plano fora da sessão;
  - logs sem coordenadas.

## FN-16 · Acompanhar viagem (Depende do tempo, D-22)

- **Status (15/11/2026): protótipo com mock** (mesmo serviço da FN-15; tokens de exemplo e deep link com guarda de sessão, PL-23 `[HIPÓTESE]`).

- **Regras:** o link só abre no app (D-21); exige sessão (PL-23, `[HIPÓTESE]`); mostra trajeto, última posição com horário, chegada estimada e estado (US-21 AC6); não mostra dados da conta nem da comparação de quem compartilha (US-21 AC8); nada fica no aparelho depois do fim `[HIPÓTESE]`.
- **Contrato esperado `[HIPÓTESE]`:** `GET /api/compartilhamentos/a/{token}` (com token da conta do contato) → `200 { "estado": "ATIVO" | "CHEGOU" | "ENCERRADO", "aoVivo": true, "trajeto": { "geometria", "trechos", "chegadaPrevista" }, "posicao": { "lat", "lon", "em" } | null }` · `404`/`410` (expirado ou inexistente, sem dados). Atualização por consulta periódica (ex.: a cada 30 s) `[HIPÓTESE]`.
- **Testes previstos:** positivo (link ativo mostra a viagem e depois "Chegou"); negativos (link expirado mostra "terminou" sem dados; sem o app leva à página de instalação; sem sessão passa pelo login); a resposta não contém e-mail nem dados da comparação.

## FN-17 · Rotina da semana e lembrete local (VoltaSegura+, Depende do tempo, D-31)

- **Regras:**
  - rotina = origem e destino (de lugares salvos), dias (1 = domingo ... 7 = sábado), horário de saída `HH:MM`, antecedência e ativa; até 5 rotinas `[HIPÓTESE]`;
  - **só no aparelho** (`expo-secure-store`, chave `voltasegura.rotinas`); nunca enviada nem vinculada à conta (US-22 AC3, DT-08);
  - `[DECISÃO]` **gatilho:** notificação local semanal, N minutos antes da saída em cada dia escolhido (N = 5, 10, 15 ou 30; padrão 15). Sem tempo real, sem servidor, sem token de push. Se o aviso passa da meia-noite para trás, cai no dia anterior;
  - texto neutro: "Hora de sair: sua rotina de {dia} às {hora}. Compare os caminhos antes de sair." Sem "rota segura", sem preço e sem prometer mudança de resultado (US-22 AC5);
  - a **permissão de notificações só é pedida ao ativar uma rotina** (não na abertura do app); negada: aviso e rotina mantida (US-22 AC4);
  - a notificação leva só o id da rotina; ao tocar, o app lê a rotina do aparelho, preenche origem, destino e saída de hoje na consulta e abre a TL-04; sem rotina, só abre o app;
  - editar, desativar ou apagar cancela os lembretes antigos; "apagar todas" cancela todos;
  - na web (só desenvolvimento) não há notificações.
- **Implementação:** `src/rotina/` (tipos, armazenamento, `RotinaContext`, `AberturaPorLembrete`), `src/services/lembretes.ts`, `src/textos/rotina.ts`.
- **Testes:** `src/rotina/rotina.test.tsx` (salvar, editar, desativar, apagar, limite, validação, permissão negada, leitura corrompida), `src/services/lembretes.test.ts` (gatilhos, virada de dia, texto, agendar, cancelar, permissão) com as notificações mockadas.
- **Depende do aparelho:** o disparo real (inclusive em Expo Go no Android) e o toque no lembrete só se verificam em aparelho.
