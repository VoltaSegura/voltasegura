# Dados reais e roteamento opcional

`[DECISÃO — escopo da demonstração acadêmica]` Os scripts `preparar-demo.ps1` e `iniciar-soa.ps1` funcionam sem SSP e sem OTP2. A carga contém 80 registros sintéticos e o roteador produz exemplos; isso aparece em `fontes.exemplo`, `fontes.acervo` e `fontes.roteamento`. A demonstração não valida a exposição estimada em trajetos reais.

`[EM ABERTO]` Nesta regularização não houve acesso à planilha real nem ao servidor do grupo. O importador SSP e o adaptador OTP são caminhos opcionais; o contrato GraphQL foi testado com respostas controladas, não com servidor real.

## Obter a planilha SSP

1. Acessar o [portal oficial de Consultas SSP-SP](https://www.ssp.sp.gov.br/estatistica/consultas).
2. No bloco **SP Dados — RES 160 — RES 516**, escolher **Dados criminais → 2026**. O arquivo esperado é `SPDadosCriminais_2026.xlsx`.
3. Alternativamente, pedir ao grupo a versão já auditada. Uma versão mais recente pode ter contagens diferentes; registrar o SHA256, a origem e o período efetivos. Não reutilizar os números históricos do projeto como se fossem uma nova medição.
4. Guardar fora do Git. O importador recebe `--arquivo` e não depende de uma pasta particular do autor.

Na pasta `src/csharp-backend`, para um banco separado do sintético:

```powershell
$env:VOLTASEGURA_DB = Join-Path (Get-Location) 'dados/voltasegura-ssp.db'
dotnet run --project VoltaSegura.Servicos -- --migrar
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r scripts/requirements-etl.txt
.\.venv\Scripts\python.exe scripts/carga_ocorrencias.py --arquivo 'C:\caminho\SPDadosCriminais_2026.xlsx' --banco $env:VOLTASEGURA_DB
dotnet run --project VoltaSegura.Servicos --launch-profile http
```

O importador usa somente a capital, janela jan–set/2026, naturezas acordadas e deduplicação por boletim. Grava a proveniência e o SHA256 na tabela `acervo`; não mistura silenciosamente uma carga sintética com SSP. `--force` substitui explicitamente o acervo e só deve ser usado quando essa substituição for desejada.

A janela alvo continua sendo 12 meses no produto; o recorte de nove meses é a limitação do MVP documentada em `docs/08`. A cobertura é uma aproximação por circunscrições inferidas dos BOs próximos, sem polígonos oficiais.

## Conectar um OTP2 existente

O repositório registra que Lucas Derenze Simidu montou um servidor local. Para usá-lo, ele precisa iniciar o OTP e fornecer o endereço acessível da máquina. `localhost` em outra máquina não aponta para o notebook dele. A URL deve ser acessível na rede utilizada e o GTFS precisa cobrir a data consultada.

Na pasta `src/csharp-backend`, mantendo a variável do banco escolhido:

```powershell
$env:Roteamento__Modo = 'otp2'
$env:Otp2__BaseUrl = 'http://ENDERECO-DO-SERVIDOR:8080'
dotnet run --project VoltaSegura.Servicos --launch-profile http
```

O adaptador usa `POST /otp/gtfs/v1`, `planConnection`, horário de saída com fuso e até cinco alternativas. Não usa a API REST legada, removida no OTP 2.8 ([changelog oficial](https://docs.opentripplanner.org/en/v2.10.0/Changelog/#280-2025-09-10)). Falhas devolvem 503/504 sem cair silenciosamente no mock.

Para montar um servidor novo, o monorepo contém o roteiro em `scripts/otp2/README.md` (Java, GTFS, OpenStreetMap e montagem do grafo). Isso não é pré-requisito dos scripts de demonstração SOA.
