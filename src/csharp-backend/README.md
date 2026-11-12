# VoltaSegura — Solution .NET do Backend

Backend do VoltaSegura em C#/.NET 8: uma única solution com **domínio compartilhado** e **duas APIs** — a entrega de **C# Software Development** (esta pasta) e a de **SOA e Web Services** (documentada em [`src/soa-backend`](../soa-backend), mesma solution).

## Estrutura

| Projeto | Papel | Disciplina |
|---|---|---|
| `VoltaSegura.Domain` | Entidades, interfaces e **regras de negócio puras** (regra de comparação D = N/km, teste binomial exato bilateral, estabilidade de corredor) | C# (POO) / SOA (domínio) |
| `VoltaSegura.Infrastructure` | EF Core + SQLite, migrações versionadas, adaptador OTP2, mock de roteamento, repositório de ocorrências | ambas |
| `VoltaSegura.Api` | Web API de consultas (ocorrências agregadas, trajetos salvos) | **C#** |
| `VoltaSegura.Servicos` | API de orquestração de serviços (comparação de trajetos, situação dos dados, auditoria) | **SOA** |
| `VoltaSegura.Tests` | Testes xUnit do núcleo estatístico e das regras de comparação | ambas |

## Como executar

Requisitos: .NET SDK 8.

```bash
cd src/csharp-backend

# 1. Restaurar, compilar e criar/atualizar o banco (migrações)
dotnet build
dotnet ef database update --project VoltaSegura.Infrastructure --startup-project VoltaSegura.Api
# (o banco SQLite fica em dados/voltasegura.db — fora do git)

# 2. Carregar o recorte SSP-SP no banco (dados REAIS; requer utils/ssp/SPDadosCriminais_2026.xlsx)
uv run --with pandas,openpyxl,python-calamine,pyarrow python scripts/carga_ocorrencias.py

# 3. API de consultas (entrega C#) — Swagger em /swagger
dotnet run --project VoltaSegura.Api

# 4. Serviço de comparação (entrega SOA) — Swagger em /swagger
dotnet run --project VoltaSegura.Servicos

# 5. Testes automatizados
dotnet test
```

## Exemplo de uso

```bash
# Comparar duas alternativas de volta (banco vazio → resposta honesta "DadosInsuficientes")
curl -X POST http://localhost:5000/api/comparacoes/trajetos \
  -H "Content-Type: application/json" \
  -d '{"origem":{"latitude":-23.56,"longitude":-46.65},"destino":{"latitude":-23.55,"longitude":-46.63},"sentido":"volta"}'
```

## Acervo carregado (12/11/2026 — recorte por `NATUREZA_APURADA`, docs/07)

Recorte real carregado no banco a partir de `utils/ssp/SPDadosCriminais_2026.xlsx` (SSP-SP, dados públicos):

| Métrica | Valor |
|---|---|
| Boletins distintos (NUM_BO+ANO_BO+delegacia) | **278.687** |
| `FURTO - OUTROS` (entra em N) | 172.852 |
| `ROUBO - OUTROS` (entra em N) | 62.365 |
| `FURTO DE VEÍCULO` / `FURTO DE CARGA` (contexto) | 27.437 / 86 |
| `ROUBO DE VEÍCULO` / `ROUBO DE CARGA` / `LATROCÍNIO` (contexto) | 5.053 / 904 / 23 |
| `LESÃO CORPORAL CULPOSA POR ACIDENTE DE TRÂNSITO` (contexto) | 9.967 |
| Sem faixa do dia (hora e período ausentes → NULL) | 2.476 (0,9% — preservado como NULL) |
| Sem coordenadas (não entram em corredor) | 6.863 |
| Período | jan–set/2026, capital (S.PAULO) |

A faixa do dia é derivada da `HORA_OCORRENCIA_BO` quando existe e, caso contrário, de
`DESC_PERIODO` (docs/08 §16) — as duas fontes coincidem em 100% das linhas com ambas, e a
cobertura de faixa passa de ~44% (só `DESC_PERIODO`) para ~99,1%.

## Comparações ao vivo com dados reais (12/11/2026)

Corredor Paulista → Luz (`-23.5629,-46.6544` → `-23.5379,-46.6295`), rotas do mock, período jan–set/2026:

| Consulta | N (±100 m) | D (BO/km) | Cobertura | Situação |
|---|---|---|---|---|
| Faixa noite (`faixas:[4]`) | R1 183 · R2 97 | 108,0 · 66,9 | ~96% | **Dados insuficientes** — resultado muda com a largura do corredor |
| Sem filtro de faixa | R1 526 · R2 480 | 310,5 · 331,2 | ~96% | **Dados insuficientes** — resultado muda com a largura do corredor |

A instabilidade entre ±50/±100/±150 m persiste com as rotas do **mock** (que caminham o
mesmo corredor nas duas alternativas) — é o comportamento acordado no docs/08 §66: destaque
só aparece se for estável nas três larguras, e por isso será raro. O teste de integração
(`ComparacaoPontaAPontaTests`) prova o caminho "Conclusiva" com corredores de fato distintos.
Com rotas reais do OTP2 (docs/04 §6), que caminham ruas diferentes entre alternativas,
espera-se mais resultados conclusivos/divergentes.

## Decisões incorporadas (docs/07 e docs/08 — decisões do grupo, 11/11/2026)

- **Recorte por natureza** (docs/07): grupos Furto, Roubo e Trânsito por `NATUREZA_APURADA` literal; **só `FURTO - OUTROS`/`ROUBO - OUTROS` entram em N** (carga, veículo, latrocínio e trânsito são contexto, sem influência na comparação); `RUBRICA` conservada para auditoria.
- **Faixa do dia** (docs/08 §16): da `HORA_OCORRENCIA_BO` com fallback `DESC_PERIODO`; os 4 períodos da SSP (madrugada 0–5h, manhã 6–11h, tarde 12–17h, noite 18–23h); sem hora → NULL, nunca fabricada.
- **Regra de comparação** (docs/08 §§28–49): só trechos caminhados; N = boletins distintos (`NUM_BO`+`ANO_BO`+delegacia — §59); D = N/km; destaque só se p < 0,05 **e** a mesma rota tem N e D menores **e** o resultado é estável nas três larguras; divergente não gera preferência.
- **Cobertura** (docs/08 §64): fração de boletins elegíveis com coordenada e faixa informadas nas `NOME_DELEGACIA_CIRCUNSCRICAO` atravessadas; exige ≥ 80% por alternativa e diferença ≤ 10 p.p.
- **Amostra mínima** (docs/08 §65): N_X + N_Y < 10 → "dados insuficientes".
- **Frases fixas** (docs/08 §§99–102): "Dados suficientes para comparar" / "Sem diferença clara entre os registros" / "Dados insuficientes" (com o motivo); bloco "Sobre os dados" em toda resposta, com fonte, cobertura por alternativa e limitações fixas.
- **Roteamento** (docs/04 §6): `IRoteador` com adaptador OTP2 (GTFS SPTrans + OSM); mock determinístico enquanto o OTP2 não está ativo.
- **Privacidade** (docs/03 §6, docs/05): auditoria de consultas **sem** coordenadas, endereços ou identificadores; coordenadas de consulta não gravadas.
- **Linguagem** (docs/05): "exposição estimada", nunca "rota segura"; banco vazio → dados insuficientes, nunca silêncio.

## Próximos passos

- [x] ETL para carga das ocorrências SSP-SP no banco (`scripts/carga_ocorrencias.py`) — **278.687 boletins distintos** em `dados/voltasegura.db` (recorte por `NATUREZA_APURADA`, docs/07).
- [x] Backend alinhado ao `docs/07`/`docs/08` (12/11/2026): naturezas elegíveis, faixa pela hora, cobertura por circunscrição, frases fixas — 20 testes passando.
- [ ] Ativar `Otp2Roteador` (docs/04 §6) e trocar o registro de DI no `Program.cs`.
- [ ] Evidências da aplicação (prints) para o README de entrega.
- [ ] Preencher os nomes dos integrantes abaixo.

## Integrantes

> Preencher com os nomes da equipe (exigência do PDF FIAP, p. 27/30).

- (preencher)
