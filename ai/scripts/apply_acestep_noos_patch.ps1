param(
  [string]$VendorDir = ""
)

$ErrorActionPreference = "Stop"

$AiRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($VendorDir)) {
  $VendorDir = Join-Path $AiRoot "vendor\ACE-Step-1.5"
}
$PatchFile = Join-Path $AiRoot "patches\acestep-noos-idle-unload.patch"

if (-not (Test-Path (Join-Path $VendorDir ".git"))) {
  Write-Host "ACE-Step git checkout not found: $VendorDir" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path $PatchFile)) {
  Write-Host "Patch file not found: $PatchFile" -ForegroundColor Red
  exit 1
}

Push-Location $VendorDir
try {
  git apply --check $PatchFile 2>$null
  if ($LASTEXITCODE -eq 0) {
    git apply $PatchFile
    Write-Host "Applied NOOS ACE-Step patch." -ForegroundColor Green
    exit 0
  }

  git apply --reverse --check $PatchFile 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "NOOS ACE-Step patch is already applied." -ForegroundColor Green
    exit 0
  }

  Write-Host "NOOS ACE-Step patch cannot be applied cleanly. Check vendor changes in: $VendorDir" -ForegroundColor Red
  exit 1
} finally {
  Pop-Location
}
