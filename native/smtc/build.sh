#!/usr/bin/env bash
# ============================================================================
# build.sh — Compila el sidecar SMTC (espejo-smtc.exe) para win-x64.
#
# Requisitos: .NET 8 SDK (https://dotnet.microsoft.com).
# Produce: native/smtc/dist/espejo-smtc.exe (+ dlls, framework-dependent).
# La app lo autodetecta en native/smtc/dist; o apunta a él con SMTC_SIDECAR.
#
# Uso (desde la raíz del repo):  ./native/smtc/build.sh
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")"

CONFIG="${1:-Release}"
RUNTIME="${2:-win-x64}"

echo "[smtc] dotnet publish -c $CONFIG -r $RUNTIME --self-contained false -o dist"
dotnet publish -c "$CONFIG" -r "$RUNTIME" --self-contained false -o dist

EXE="./dist/espejo-smtc.exe"
if [[ -f "$EXE" ]]; then
  echo "[smtc] OK: $(pwd)/$EXE"
  echo "[smtc] La app lo autodetecta en native/smtc/dist (o usa SMTC_SIDECAR)."
else
  echo "[smtc] ERROR: no se generó $EXE. Revisa el .csproj." >&2
  exit 1
fi