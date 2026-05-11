param(
  [string]$HostAddress = "0.0.0.0",
  [int]$Port = 8011,
  [switch]$EnableLlm,
  [string]$LmModel = "acestep-5Hz-lm-1.7B"
)

$ErrorActionPreference = "Stop"

Write-Host "NOOS ACE-Step Worker launcher" -ForegroundColor Cyan
Write-Host "Host: $HostAddress"
Write-Host "Port: $Port"

if (-not (Test-Path "pyproject.toml")) {
  Write-Host "This script must be run from the ACE-Step-1.5 repository root." -ForegroundColor Red
  Write-Host "Example:"
  Write-Host "  cd C:\path\to\ACE-Step-1.5"
  exit 1
}

$uv = Get-Command uv -ErrorAction SilentlyContinue
if (-not $uv) {
  Write-Host "uv is not installed. Install it first:" -ForegroundColor Yellow
  Write-Host 'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"'
  exit 1
}

if (-not (Test-Path ".venv")) {
  Write-Host "Virtual environment not found. Running uv sync..."
  uv sync
}

try {
  $existing = Get-NetFirewallRule -DisplayName "ACE-Step API 8011" -ErrorAction SilentlyContinue
  if (-not $existing) {
    Write-Host "Adding Windows firewall rule for TCP $Port. If this fails, rerun PowerShell as Administrator." -ForegroundColor Yellow
    New-NetFirewallRule -DisplayName "ACE-Step API 8011" -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow | Out-Null
  }
} catch {
  Write-Host "Could not add firewall rule automatically. Open TCP $Port manually if Mac cannot connect." -ForegroundColor Yellow
}

$env:ACESTEP_NO_INIT = "true"
$env:TOKENIZERS_PARALLELISM = "false"

if ($EnableLlm) {
  $env:ACESTEP_INIT_LLM = "true"
  Write-Host "LM enabled: $LmModel" -ForegroundColor Yellow
  uv run acestep-api --host $HostAddress --port $Port --lm-model-path $LmModel
} else {
  $env:ACESTEP_INIT_LLM = "false"
  Write-Host "LM disabled. Running DiT-only default mode." -ForegroundColor Green
  uv run acestep-api --host $HostAddress --port $Port
}

