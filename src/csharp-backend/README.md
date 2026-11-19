# VoltaSegura — backend C#/.NET

[DECISÃO] Solution .NET 8 compartilhada entre C# Software Development e SOA. Este README apresenta a entrega C#; a API SOA está documentada em [SOA](../soa-backend/README.md).

**Demonstração acadêmica:** banco SQLite real, migrações EF Core, serviços REST e testes automatizados. A carga padrão contém **80 registros sintéticos** e o roteamento é **mock**. As respostas identificam os exemplos; eles não são dados criminais reais nem resultados validados de mobilidade.

## Integrantes

| RM | Nome completo |
|---|---|
| 565065 | Augusto Barcelos Barros |
| 556197 | Caio Felipe de Lima Bezerra |
| 555541 | Juan Francisco Alves Muradas |
| 555931 | Lucas Derenze Simidu |
| 554873 | Sofia Fernandes |

## Executar no Windows

Requisitos: SDK .NET 8 (ou SDK posterior compatível com `net8.0`, com runtime .NET 8 instalado), PowerShell e internet para restaurar pacotes NuGet. SQLite vem com o projeto; não precisa instalar servidor de banco, Python ou OTP para a demonstração.

A partir da raiz do repositório clonado:

```powershell
cd src/csharp-backend
powershell -ExecutionPolicy Bypass -File scripts/preparar-demo.ps1
powershell -ExecutionPolicy Bypass -File scripts/iniciar-csharp.ps1
```

Abra [Swagger C#](http://localhost:5032/swagger). A política Bypass vale apenas para esse processo PowerShell. O primeiro script restaura/compila a solution, executa os testes, aplica as duas migrações e cria a carga fictícia em `dados/voltasegura-demo.db`. É idempotente para esse acervo; recusa misturar demonstração com outra carga. Encerre a API com Ctrl+C.

Em outro terminal, na mesma pasta, a SOA pode usar o mesmo banco:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/iniciar-soa.ps1
```

[Swagger SOA](http://localhost:5031/swagger). Para Linux/macOS ou execução manual, veja [os comandos sem scripts](../soa-backend/README.md#execução-manual).

## Arquitetura e rubrica C#

| Projeto / critério | Evidência no código |
|---|---|
| POO — 3,0 | `VoltaSegura.Domain`: entidades `Ocorrencia`, `Trajeto`, `Trecho`, `Acervo`; serviços de comparação; interfaces `IRoteador` e `IOcorrenciaRepositorio` |
| Web API — 2,5 | `VoltaSegura.Api`: consulta agregada de ocorrências; `VoltaSegura.Servicos`: comparação e auditoria; respostas HTTP e Swagger |
| EF Core + LINQ — 1,5 | `VoltaSegura.Infrastructure`: SQLite, projeções, filtros, agrupamento, migrações e índice único por boletim |
| Async/Await — 1,0 | Controllers, repositório, carga de demonstração e adaptador HTTP assíncronos com cancelamento |
| Qualidade — 2,0 | Separação de responsabilidades, injeção de dependência, validação, testes e identificação de dados sintéticos |

## Endpoints C#

- `GET /api/ocorrencias`: resumo agregado, fonte, período e indicador de exemplo; filtros opcionais `bairro`, `natureza`, `rubrica`, `faixa` (1–4). Não retorna BOs individuais.
- `GET/POST /api/trajetos`: endpoints históricos de demonstração, **desativados por padrão (403)**. O produto determina que histórico pessoal fique apenas no aparelho. O recurso legado só pode ser habilitado para exemplos fictícios por `Demonstracao__PersistirTrajetos=true`; não é necessário para executar a entrega.

## Banco, migrações e testes

```powershell
dotnet tool restore
dotnet ef migrations list --project VoltaSegura.Infrastructure --startup-project VoltaSegura.Servicos
# Para aplicar em um banco escolhido:
$env:VOLTASEGURA_DB = Join-Path (Get-Location) 'dados/voltasegura-demo.db'
dotnet ef database update --project VoltaSegura.Infrastructure --startup-project VoltaSegura.Servicos
dotnet test VoltaSegura.sln
```

A ferramenta EF 8.0.11 está fixada em `.config/dotnet-tools.json`. A migração inicial preserva o schema original; a segunda adiciona proveniência do acervo. **46 testes passaram na regularização**, incluindo integração HTTP, migrações reais em SQLite, geometria, cobertura, comparação de cinco alternativas, dados insuficientes e contrato OTP controlado.

As [evidências da execução](../soa-backend/evidencias/README.md) incluem build, testes, duas APIs, migrações, acervo fictício e persistência após reinício. Para gerar novamente, com Python 3 instalado: `python scripts/verificar_entrega.py`.

## Limitações e dados reais

[EM ABERTO] Integração com o aplicativo completo, autenticação, servidor OTP2 real e nova carga SSP não foram validados nesta regularização. O servidor não deve ser anunciado como backend completo do app ou serviço público pronto. O modelo do produto permanece nos documentos do monorepo.

A comparação usa apenas caminhadas, separa exposição estimada de cobertura e retorna dados insuficientes quando necessário. Não garante segurança, não prevê crimes e não classifica bairros. Cobertura por circunscrição é aproximada a partir dos BOs próximos.

[Como obter a SSP e conectar um OTP opcional](DADOS_REAIS.md). O [histórico anterior](HISTORICO_BACKEND.md) preserva as cargas de 12/11/2026; essas contagens não são a carga fictícia desta entrega.

## Publicação

O pacote deve conter **toda a solution**, testes, migrações, scripts e evidências. Os espelhos de SOA e C# são preparados a partir do monorepo; não alterar somente o espelho. O registro de IA está em [prompts.md](../../prompts.md). Enviar o link do repositório da disciplina e garantir acesso do professor até 19/11/2026, 23h55.
