# VoltaSegura — SOA e Web Services

[DECISÃO] Entrega acadêmica da camada de backend do VoltaSegura. A implementação está na [solution compartilhada](../csharp-backend/VoltaSegura.sln), no projeto `VoltaSegura.Servicos`, com domínio e infraestrutura em C#/.NET 8.

**A demonstração funciona sem OTP2 e sem download da SSP:** utiliza banco SQLite real e **80 registros sintéticos**, com rotas mock identificadas na resposta. Demonstra os serviços, a persistência, as migrações e as regras; não representa uma comparação validada de trajetos reais.

## Integrantes

| RM | Nome completo |
|---|---|
| 565065 | Augusto Barcelos Barros |
| 556197 | Caio Felipe de Lima Bezerra |
| 555541 | Juan Francisco Alves Muradas |
| 555931 | Lucas Derenze Simidu |
| 554873 | Sofia Fernandes |

## Executar no Windows

Instalar SDK .NET 8 (ou SDK posterior compatível com `net8.0`, com runtime .NET 8). São necessários PowerShell e internet para restaurar NuGet; não é necessário instalar servidor SQLite, Python ou OTP2.

A partir da raiz do repositório clonado:

```powershell
cd src/csharp-backend
powershell -ExecutionPolicy Bypass -File scripts/preparar-demo.ps1
powershell -ExecutionPolicy Bypass -File scripts/iniciar-soa.ps1
```

Abra [Swagger SOA](http://localhost:5031/swagger). O primeiro script restaura, compila, testa, aplica migrações e gera a carga fictícia. Bypass vale só para esse processo PowerShell. O banco fica em `dados/voltasegura-demo.db`, fora do Git. Pare o serviço com Ctrl+C.

## Execução manual

Na pasta `src/csharp-backend`:

```powershell
dotnet restore VoltaSegura.sln
dotnet build VoltaSegura.sln --no-restore
dotnet test VoltaSegura.sln --no-build
$env:VOLTASEGURA_DB = Join-Path (Get-Location) 'dados/voltasegura-demo.db'
dotnet run --no-build --project VoltaSegura.Servicos -- --demonstracao
dotnet run --no-build --project VoltaSegura.Servicos --launch-profile http
```

Em Bash, substituir a atribuição da variável por `export VOLTASEGURA_DB="$PWD/dados/voltasegura-demo.db"`; os comandos `dotnet` são os mesmos. `--demonstracao` aplica migrações e carga; `--migrar` aplica apenas migrações. Nenhum dos dois inicia o servidor.

Para demonstrar a ferramenta EF separadamente:

```powershell
dotnet tool restore
dotnet ef migrations list --project VoltaSegura.Infrastructure --startup-project VoltaSegura.Servicos
dotnet ef database update --project VoltaSegura.Infrastructure --startup-project VoltaSegura.Servicos
```

## Demonstração no Swagger

1. Executar `GET /api/dados/situacao`: deve mostrar `carregado: true`, `tipoAcervo: demonstracao`, `exemplo: true` e 80 registros.
2. Executar `POST /api/comparacoes/trajetos` com o conteúdo de [comparacao.json](../csharp-backend/exemplos/comparacao.json).
3. Conferir fonte, indicador de exemplo, caminhadas, cobertura e resultado. **Dados insuficientes é uma resposta válida**, sem destaque inventado.
4. Executar `GET /api/dados/auditoria`: registro sem coordenadas nem conta.
5. Reiniciar o serviço e repetir a auditoria: os registros permanecem no SQLite.
6. Enviar [comparacao-invalida.json](../csharp-backend/exemplos/comparacao-invalida.json): resposta 400 com os erros.

`saida` é a partida da viagem em ISO 8601 com fuso. `inicio` e `fim` são a janela dos registros históricos. Os pontos do exemplo são referências públicas, não endereços de integrantes.

## Rubrica e organização

| Critério | Pontos | Implementação |
|---|---:|---|
| Estruturação do domínio | 3,0 | `VoltaSegura.Domain`: entidades, interfaces, avaliador estatístico e comparação entre alternativas |
| Conexão com banco | 3,0 | `VoltaSegura.Infrastructure`: EF Core + SQLite; leitura do acervo e gravação da auditoria |
| Migrações | 1,5 | `MigracaoInicial` e `ProvenienciaAcervo`, versionadas, testadas e reaplicáveis |
| Documentação automática | 1,5 | Swagger/OpenAPI com contratos, comentários e respostas HTTP |
| Testes automatizados | 1,0 | `VoltaSegura.Tests`: **46 testes aprovados** na regularização |

O controller orquestra `IRoteador` → `IOcorrenciaRepositorio` → comparação por pares e estabilidade → auditoria. O serviço aceita até cinco candidatas; a vencedora precisa superar cada outra nas três larguras. Uma única alternativa retorna sem comparação. Geometrias de caminhadas distintas não são ligadas sobre o transporte. Com `L = 0`, o indicador é `null` (não aplicável).

## Evidências

[Relatório e arquivos de execução](evidencias/README.md): build, testes, aplicação das migrações, acervo vazio e fictício, Swagger, comparação, validação 400, auditoria e persistência após reiniciar. O script reproduzível está em `src/csharp-backend/scripts/verificar_entrega.py` e exige Python 3 apenas para regenerar evidências.

## Limitações declaradas

- [DECISÃO — demonstração acadêmica] Mock e dados sintéticos identificados por `fontes`. Não afirmar que vieram de transporte real ou da SSP.
- [EM ABERTO] SSP real e OTP2 ao vivo não foram acessados nesta regularização. O adaptador GraphQL opcional tem teste de contrato controlado; isso não é teste de servidor real.
- [EM ABERTO] Integração completa com o app, autenticação e funcionalidades de conta/compartilhamento permanecem fora desta demonstração. A API local não exige login e não está preparada para publicação pública com dados de usuários.
- A cobertura usa circunscrições inferidas dos BOs próximos, sem polígonos oficiais. Metodologia e mensagens ainda não foram validadas com usuários.
- Exposição estimada não é garantia de segurança. Zero registro não significa ausência de ocorrência; não há classificação de bairros.

[Instruções para SSP e OTP opcionais](../csharp-backend/DADOS_REAIS.md). O [diagnóstico inicial](PLANO_ENTREGA.md) fica preservado como histórico; o estado atual é este README e o relatório de evidências.

## Entrega

[Passo a passo para testar, publicar e enviar](PUBLICACAO.md).

Enviar **link do GitHub** na tarefa de SOA até **19/11/2026, 23h55**, por um integrante. A página 27 do briefing não exige vídeo próprio de SOA nem OTP2 nominalmente. Conferir acesso do professor ao repositório privado.

O espelho precisa incluir `src/csharp-backend/` completo, além desta pasta. Os pacotes gerados pelo monorepo já levam as duas pastas. Uso de IA registrado em [prompts.md](../../prompts.md). O produto é VoltaSegura; CitizenTech é o tema da GS.
