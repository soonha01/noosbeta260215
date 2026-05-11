param(
  [string]$BaseUrl = "http://127.0.0.1:8011",
  [switch]$Prewarm
)

$ErrorActionPreference = "Stop"

Write-Host "Checking ACE-Step worker: $BaseUrl" -ForegroundColor Cyan

$health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get
$health | ConvertTo-Json -Depth 8

if ($Prewarm) {
  Write-Host "Prewarming acestep-v15-turbo..." -ForegroundColor Yellow
  $body = @{
    model = "acestep-v15-turbo"
    slot = 1
    init_llm = $false
  } | ConvertTo-Json

  $result = Invoke-RestMethod -Uri "$BaseUrl/v1/init" -Method Post -ContentType "application/json" -Body $body
  $result | ConvertTo-Json -Depth 8
}

Write-Host "Done." -ForegroundColor Green

