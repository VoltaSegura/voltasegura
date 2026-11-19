$ErrorActionPreference = 'Stop'
$backend = Split-Path $PSScriptRoot -Parent
Push-Location $backend
try {
    $env:VOLTASEGURA_DB = Join-Path $backend 'dados/voltasegura-demo.db'
    dotnet restore VoltaSegura.sln
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao restaurar os projetos.' }
    dotnet build VoltaSegura.sln --no-restore
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar.' }
    dotnet test VoltaSegura.sln --no-build --no-restore
    if ($LASTEXITCODE -ne 0) { throw 'Há testes com falha.' }
    dotnet run --no-build --project VoltaSegura.Servicos -- --demonstracao
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao aplicar migrações/carga sintética.' }
    Write-Host 'Demonstração pronta. Execute scripts/iniciar-soa.ps1 e abra http://localhost:5031/swagger'
} finally { Pop-Location }
