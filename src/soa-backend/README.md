# VoltaSegura — Backend (SOA / Web Services)

API REST de planejamento e comparação de trajetos (ida e volta) com indicação de **exposição estimada** e **confiança dos dados**.

> A implementação vive na solution .NET em [`src/csharp-backend`](../csharp-backend) (decisão do grupo, item 37: **mesma solution, módulos distintos**). Este módulo corresponde ao projeto `VoltaSegura.Servicos` + `VoltaSegura.Domain`/`Infrastructure` compartilhados.

## Rubrica

| Critério | Pontos | Onde está |
|---|---|---|
| Estruturação do domínio | 3,0 | `VoltaSegura.Domain` — entidades + regras de comparação como código (itens 11/12/16) |
| Conexão com banco de dados | 3,0 | `VoltaSegura.Infrastructure` — EF Core sobre o mesmo banco das duas APIs |
| Migrações | 1,5 | `VoltaSegura.Infrastructure/Migrations/` (versionadas) |
| Documentação automática (Swagger) | 1,5 | `VoltaSegura.Servicos` — `/swagger` |
| Testes automatizados | 1,0 | `VoltaSegura.Tests` (14 testes do núcleo estatístico) |

## Serviços orquestrados (SOA real)

- **Roteamento**: OpenTripPlanner 2 em servidor próprio (item 14) via interface `IRoteador` + adaptador `Otp2Roteador`; mock determinístico enquanto o OTP2 não está ativo (item 22).
- **Exposição estimada**: contagem N no corredor caminhado (Haversine, raio ±50/±100/±150 m), D = N/km, teste binomial exato bilateral a 5%.
- **Estabilidade**: resultado que muda com a largura do corredor → dados insuficientes (item 16).
- **Auditoria**: `RegistroConsulta` sem coordenadas nem identificadores (item 23).

## Como executar

```bash
cd src/csharp-backend
dotnet build
dotnet ef database update --project VoltaSegura.Infrastructure --startup-project VoltaSegura.Api
dotnet run --project VoltaSegura.Servicos   # Swagger em /swagger
dotnet test                                  # testes automatizados
```

## Entregáveis (PDF FIAP, p. 27)

- Repositório GitHub com o código completo (solution espelhada via `scripts/sync_mirrors.sh`);
- README com instruções de execução, descrição da solução e **nomes dos integrantes**;
- Documentação dos endpoints (Swagger ou equivalente);
- **Evidências da aplicação** (prints/execução).
- Entrega no Teams: **link do GitHub**, por um integrante.

## Integrantes

- (preencher)
