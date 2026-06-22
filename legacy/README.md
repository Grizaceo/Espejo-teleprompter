# legacy/

Código **archivado** del monorepo, superado por la app activa
[`apps/desktop`](../apps/desktop) (Electron + React 19). Se conserva aquí por
historia y como referencia de los portes fieles a TypeScript; **no se mantiene
ni compila**.

## Qué hay aquí

| Antes | Ahora | Qué era |
|---|---|---|
| `libs/` | `legacy/libs/` | Librerías Python (audio, recognition, lyrics, sync, common). Porteadas a TS en `apps/desktop/electron/core` y `apps/desktop/src`. |
| `apps/device_daemon/` | `legacy/apps/device_daemon/` | Servicio Python (orquestador, audio, sync). Sustituido por el proceso main de Electron. |
| `apps/ui_kiosk/` | `legacy/apps/ui_kiosk/` | Frontend React+Vite (Display) previo. Sustituido por `apps/desktop` (renderer). |
| `tools/simulator/` | `legacy/tools/simulator/` | Simulador de desarrollo. |
| `tests/test_sync_engine.py` | `legacy/tests/test_sync_engine.py` | Test Python del `SyncEngine` (portaado a `apps/desktop/tests/syncEngine.test.ts`). |

## Nota

Los comentarios en `apps/desktop` citan `libs/...` como **origen del porte**
(p. ej. `syncEngine.ts` → "porte fiel de libs/sync/engine.py"). Esos `libs/`
se refieren a este archivo archivado; el código vivo es el porte en TypeScript.