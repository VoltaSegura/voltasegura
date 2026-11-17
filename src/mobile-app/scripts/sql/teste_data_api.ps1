# B-15d: chama mobile_api.comparar_exposicao pela Data API da dev, com JWT do Neon Auth, e mede a latência.
# Só imprime status, caso, motivo e tempo. Não imprime token nem URLs. Rodar no PowerShell: .\teste_data_api.ps1
$AUTH  = (Read-Host "URL do Neon Auth").TrimEnd('/')
$DATA  = (Read-Host "URL da Data API (termina em /rest/v1)").TrimEnd('/')
$EMAIL = Read-Host "E-mail da conta de teste"
$SENHA = Read-Host "Senha da conta de teste"
if ($AUTH -notmatch '^https://' -or $AUTH -match 'postgres') { "A URL do Neon Auth deve comecar com https:// e NAO e a string do banco. Use EXPO_PUBLIC_NEON_AUTH_URL do .env.local."; return }
if ($DATA -notmatch '^https://.*/rest/v1$') { "A URL da Data API deve comecar com https:// e terminar em /rest/v1."; return }
$h = @{ Origin = "http://localhost:8081" }

$corpo = @{ email = $EMAIL; password = $SENHA } | ConvertTo-Json
Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$AUTH/sign-in/email" -Headers $h -ContentType "application/json" -Body $corpo -SessionVariable sessao | Out-Null
$JWT = (Invoke-RestMethod -Uri "$AUTH/token" -Headers $h -WebSession $sessao).token
if (-not $JWT) { "Sem token"; return }

$rotas = @(
  @{ id = "r1"; trechos_a_pe = @(@{ geometria = "byxnC~nw{GzOoKvQoK"; faixa = "NOITE" }) },
  @{ id = "r2"; trechos_a_pe = @(@{ geometria = "~wwnCvax{GvQoKvQoK"; faixa = "NOITE" }) }
)
foreach ($modo in @("poligono", "proxy_pontos")) {
  $body = @{ p_rotas = $rotas; p_modo_cobertura = $modo } | ConvertTo-Json -Depth 6
  $t = [Diagnostics.Stopwatch]::StartNew()
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$DATA/rpc/comparar_exposicao" -Headers @{ Authorization = "Bearer $JWT"; "Content-Profile" = "mobile_api" } -ContentType "application/json" -Body $body
    $t.Stop()
    $j = $r.Content | ConvertFrom-Json
    "$modo -> HTTP $($r.StatusCode) | caso=$($j.caso) motivo=$($j.motivo) | $($t.ElapsedMilliseconds) ms"
  } catch {
    $t.Stop()
    "$modo -> ERRO $($_.Exception.Response.StatusCode.value__) | $($t.ElapsedMilliseconds) ms | $($_.ErrorDetails.Message)"
  }
}
