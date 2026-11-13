# Catálogo de funcionalidades

- **Status:** rascunho (Fase 2, 13/11/2026)
- **Fonte:** `docs/10` (US/AC) + decisões D-00 a D-16. Cada funcionalidade (FN) liga telas, regras, dados, AC e testes previstos. Os testes ficam detalhados no `10_rastreabilidade.md` (Fase 4).
- **Contrato da API:** é o que o **app espera** receber. Por D-00, foi escrito **sem olhar o código do backend**, então todo ele é `[HIPÓTESE]` e precisa ser conciliado com a API real antes da integração (PL-18). Enquanto isso, o modo mock do app segue este contrato.

## Resumo

| FN | Funcionalidade | Telas | US / AC | Depende de |
|---|---|---|---|---|
| FN-01 | Cadastro com aviso de privacidade | TL-02, TL-13 | US-01 AC1–AC6 | Endpoint de conta (PL-05) |
| FN-02 | Login, sessão e saída | TL-01, TL-03, TL-12 | US-02 AC1–AC3 | Endpoint de sessão (PL-05) |
| FN-03 | Excluir conta | TL-12 | US-03 AC1–AC3 | Endpoint de conta (PL-05) |
| FN-04 | Escolher ponto (GPS, mapa, local salvo, exemplo) | TL-04, TL-05 | US-05 AC1–AC3, US-06 | GPS, mapa base (PL-03) |
| FN-05 | Planejar e validar a consulta | TL-04 | US-06 AC1–AC4 | Limite do município (PL-11) |
| FN-06 | Planejar a volta | TL-04, TL-07, TL-08 | US-07 AC1–AC2 | FN-05 |
| FN-07 | Buscar alternativas e focos | TL-06, TL-07 | US-08 AC1–AC4, US-11, D-12, D-15, D-16 | Endpoint de consulta |
| FN-08 | Exibir o resultado (mapa + container) | TL-07 | US-08, US-11 AC5, US-13, D-01, D-09, D-10 | FN-07 |
| FN-09 | Detalhes da rota (passo a passo) | TL-08 | US-09 AC1, D-04 | FN-07 |
| FN-10 | Por que esta rota? | TL-09 | US-10, US-11 AC1–AC4, US-12, D-08, D-11, D-13 | FN-07 |
| FN-11 | Sobre os dados e Dados considerados | TL-10, TL-11 | US-14, US-15, US-16, US-18 AC3, D-14 | FN-07 |
| FN-12 | Aviso de privacidade | TL-13 | US-01 AC6, RNF-09 | — |
| FN-13 | Histórico local e locais salvos | TL-04, TL-05, TL-12 | US-04 AC1–AC4 | Banco local |
| FN-14 | Erros globais e sem rede | TL-02, TL-03, TL-04, TL-06, TL-12 | FL-13, PL-12 | — |

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

## FN-03 · Excluir conta

- **Regras:** confirmação obrigatória (AC1, AC3); o servidor apaga e-mail e identificador (AC1); localmente, o app apaga sessão, histórico e locais `[HIPÓTESE]`.
- **Contrato esperado `[HIPÓTESE]`:** `DELETE /api/conta` (com token) → `204` · `401`. Erro de rede: nada é dado como excluído.
- **Testes previstos:** positivo (excluir e tentar entrar: negado); negativo (cancelar: nada apagado).

## FN-04 · Escolher ponto

- **Regras:** GPS só na ação, em primeiro plano (US-05 AC1, AC3); permissão negada não bloqueia (AC2); sem busca de endereço externa (D-02); ponto do mapa sem nome, nomeável ao salvar (PL-09); pontos de exemplo rotulados (RNF-08).
- **Dados:** coordenada `{lat, lon}` só na memória da consulta ou no banco local, se salva.
- **Testes previstos:** positivo (GPS concedido preenche a origem); negativo (permissão negada mantém as outras opções); ponto do mapa preenche o campo certo.

## FN-05 · Planejar e validar a consulta

- **Regras:** campos obrigatórios (US-06 AC2); origem ≠ destino (AC4); dentro do município, checado no aparelho (AC3, D-05, PL-11); horário padrão = agora.
- **Testes previstos:** positivo (consulta válida enviada); negativos (destino vazio, origem = destino, ponto fora do município: nada enviado).

## FN-06 · Planejar a volta

- **Regras:** inverte origem e destino (US-07 AC1); horário próprio, e a faixa do dia é a do horário da volta (AC2, DT-05; calculado pela API).
- **Testes previstos:** positivo (volta com pontos invertidos e horário 23h usa a faixa "noite" na TL-09); a ida e a volta não se misturam.

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

- **Regras:** mapa com o trajeto inteiro da rota selecionada (D-01); cards por tempo com o rótulo (D-10); linha fixa "Sobre os dados" (D-09); nada de números de ocorrência (D-14); foco não depende de cor (RNF-07); uma rota só: sem comparação (US-08 AC4).
- **Testes previstos:** a ordem é sempre por tempo; o foco de exposição só aparece com `caso = CONCLUSIVO`; a linha de dados está sempre presente; varredura de termos proibidos.

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

## FN-13 · Histórico local e locais salvos

- **Regras:** desligado por padrão (US-04 AC1); só no aparelho (AC2, AC4); apagar um ou todos (AC3); locais salvos idem.
- **Modelo do banco local `[HIPÓTESE]`** (SQLite no aparelho; nada é sincronizado):

| Tabela | Colunas |
|---|---|
| `preferencias` | `chave` (ex.: `historico_ligado`), `valor` |
| `locais_salvos` | `id`, `nome`, `lat`, `lon`, `criado_em` |
| `historico` | `id`, `origem_nome`, `origem_lat`, `origem_lon`, `destino_nome`, `destino_lat`, `destino_lon`, `sentido`, `horario`, `criado_em` |

A sessão (token) fica no armazenamento seguro, não nesse banco.
- **Testes previstos:** desligado não grava; ligado grava; apagar remove; nenhuma chamada de rede leva esses dados.

## FN-14 · Erros globais e sem rede

- **Regras:** FL-13. Mensagens sem código técnico nem culpa (RNF-06); dados digitados preservados; sem resultado antigo como se fosse atual.
- **Testes previstos:** sem rede, nada é enviado e o aviso aparece; tempo esgotado e erro do servidor têm "Tentar de novo"; sessão expirada leva ao login e retorna.
