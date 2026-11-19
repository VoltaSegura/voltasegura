$ErrorActionPreference = 'Stop'
$backend = Split-Path $PSScriptRoot -Parent
$env:VOLTASEGURA_DB = Join-Path $backend 'dados/voltasegura-demo.db'
$env:ASPNETCORE_ENVIRONMENT = 'Development'
Push-Location $backend
try { dotnet run --no-build --no-launch-profile --project VoltaSegura.Api --urls http://localhost:5032 }
finally { Pop-Location }
