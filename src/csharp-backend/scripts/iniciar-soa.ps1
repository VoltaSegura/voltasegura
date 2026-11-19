$ErrorActionPreference = 'Stop'
$backend = Split-Path $PSScriptRoot -Parent
$env:VOLTASEGURA_DB = Join-Path $backend 'dados/voltasegura-demo.db'
$env:Roteamento__Modo = 'mock'
Push-Location $backend
try { dotnet run --no-build --project VoltaSegura.Servicos --launch-profile http }
finally { Pop-Location }
