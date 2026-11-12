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

## Acervo carregado (11/11/2026)

Recorte real carregado no banco a partir de `utils/ssp/SPDadosCriminais_2026.xlsx` (SSP-SP, dados públicos):

| Métrica | Valor |
|---|---|
| Boletins distintos (NUM_BO+ANO_BO+delegacia) | **278.961** |
| Furto (art. 155) | 200.181 |
| Roubo (art. 157) | 68.478 |
| Trânsito (Art. 302/303) | 10.302 |
| Sem faixa do dia (`DESC_PERIODO` vazio/"em hora incerta") | 155.921 (55,9% — preservado como NULL) |
| Sem coordenadas (não entram em corredor) | 6.862 |
| Período | jan–set/2026, capital (S.PAULO) |

## Achado do teste com dados reais (honestidade do item 16)

Nas comparações ponta a ponta (corredores centrais e de periferia, rotas do mock), o resultado
**muda com a largura do corredor** (±50/±100/±150 m) em quase todos os casos → o serviço retorna
**"dados insuficientes"** com o motivo explícito, **sem** inventar preferência. Auditoria no banco
confirmou que a contagem está correta (ex.: R1 = 166/556/1.064 BOs a 50/100/150 m): a
instabilidade vem dos dados, não de bug. É o comportamento acordado no item 16 — o teste de
integração (`ComparacaoPontaAPontaTests`) prova o caminho "Conclusiva" com corredores de fato
distintos. Com rotas reais do OTP2 (item 22), que caminham ruas diferentes entre alternativas,
espera-se mais resultados conclusivos/divergentes.

## Decisões incorporadas (itens do grupo, 11/11/2026)

- **Recorte SSP-SP** (item 8): Furto, Roubo e Trânsito; só `FURTO - OUTROS`/`ROUBO - OUTROS` na comparação.
- **Regra de comparação** (itens 11/12): só trechos caminhados; N = boletins distintos (`NUM_BO`+`ANO_BO`+delegacia); D = N/km; destaque só se a mesma rota tem N e D menores; divergente não gera preferência.
- **Estabilidade** (item 16): corredor testado em ±50/±100/±150 m — resultado que muda = dados insuficientes.
- **Roteamento** (item 14): `IRoteador` com adaptador OTP2 (GTFS SPTrans + OSM); mock determinístico enquanto o OTP2 não está ativo (item 22).
- **Privacidade** (item 23): auditoria de consultas **sem** coordenadas, endereços ou identificadores.
- **Linguagem** (`docs/05`): "exposição estimada", nunca "rota segura"; bloco "Sobre os dados" em toda resposta; banco vazio → dados insuficientes, nunca silêncio.

## Próximos passos

- [x] ETL para carga das ocorrências SSP-SP no banco (`scripts/carga_ocorrencias.py`) — **278.961 boletins distintos** em `dados/voltasegura.db`.
- [ ] Ativar `Otp2Roteador` (item 22) e trocar o registro de DI no `Program.cs`.
- [ ] Evidências da aplicação (prints) para o README de entrega.
- [ ] Preencher os nomes dos integrantes abaixo.

## Integrantes

> Preencher com os nomes da equipe (exigência do PDF FIAP, p. 27/30).

- (preencher)
