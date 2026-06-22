# ============================================================================
# build.ps1 — Compila el sidecar SMTC (espejo-smtc.exe) para win-x64.
#
# Requisitos: .NET 8 SDK instalado en Windows (https://dotnet.microsoft.com).
# Produce: native/smtc/dist/espejo-smtc.exe (+ dlls, framework-dependent).
# La app lo autodetecta en native/smtc/dist; o apunta a él con SMTC_SIDECAR.
#
# Uso (PowerShell, desde la raíz del repo):
#   ./native/smtc/build.ps1
# ============================================================================
[CmdletBinding()]
param(
  [string]$Configuration = 'Release',
  [string]$Runtime = 'win-x64'
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "[smtc] dotnet publish -c $Configuration -r $Runtime --self-contained false -o dist" -ForegroundColor Cyan
dotnet publish -c $Configuration -r $Runtime --self-contained false -o dist
if ($LASTEXITCODE -ne 0) {
  Write-Error "[smtc] Falló dotnet publish (código $LASTEXITCODE). Verifica que el SDK de .NET 8 esté instalado."
  exit 1
}

$exe = Join-Path $scriptDir 'dist\espejo-smtc.exe'
if (Test-Path $exe) {
  Write-Host "[smtc] OK: $exe" -ForegroundColor Green
  Write-Host "[smtc] La app lo autodetecta en native/smtc/dist (o usa SMTC_SIDECAR)." -ForegroundColor Gray
} else {
  Write-Error "[smtc] No se generó $exe. Revisa el .csproj."
  exit 1
}