# Espejo Teleprompter

Teleprompter de escritorio (letra sincronizada con karaoke por palabra) para
cantar/rapear mostrando la original + furigana/romaji. App activa:
**[`apps/desktop`](apps/desktop)** — Electron + React 19 + TypeScript.

## Estructura

- **apps/desktop/**: la app. Proceso main (Electron) + renderer (React 19).
  - `electron/core`: sync engine, timing, state store.
  - `electron/services`: SMTC (Windows), wakeword, letras/caché, settings.
  - `src`: renderer (Teleprompter, controles, hooks).
- **native/smtc/**: sidecar C# (.NET 8) que lee el reproductor del SO (SMTC).
- **native/wakeword/**: referencia para el sidecar opt-in de palabra wake.
- **tests/**: raíz; los tests de la app viven en `apps/desktop/tests`.
- **legacy/**: código archivado (Python `libs/`, `apps/device_daemon`,
  `apps/ui_kiosk`, `tools/simulator`) superado por `apps/desktop`. Ver
  [`legacy/README.md`](legacy/README.md). No se mantiene ni compila.

## Puesta en marcha

```bash
cd apps/desktop
npm install
# Dev (Electron + Vite):
npm run dev:electron
```

En Windows, para sincronización precisa vía el reproductor del SO, compila el
sidecar SMTC: `./native/smtc/build.ps1` (ver `WINDOWS.md`). Sin él, la app usa
AudD como fallback.

Variables de entorno (ver `apps/desktop/.env.example`): `AUDD_API_TOKEN`,
`SMTC_SIDECAR` (autodetectado), `WAKEWORD_SIDECAR` (opt-in).