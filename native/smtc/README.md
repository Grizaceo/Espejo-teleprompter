# Espejo SMTC sidecar (Capa b)

Sidecar nativo (C# / .NET 8) que lee la sesión de medios de Windows
(`GlobalSystemMediaTransportControls`) y emite eventos JSON por **stdout**, uno
por línea, para que el proceso main de Electron los consuma
(`apps/desktop/electron/services/smtc/smtcReader.ts`).

Con esto el reproductor del SO (Spotify, YouTube/YT Music en navegador, etc.)
actúa como **reloj maestro**: metadata + playhead real + play/pausa con eventos,
sin capturar audio ni gastar llamadas a AudD. AudD queda como *fallback*.

## Protocolo (stdout, una línea JSON por evento)

```json
{"type":"track","title":"...","artist":"...","album":"...","durationMs":210000,"positionMs":0,"playing":true}
{"type":"position","positionMs":12345,"playing":true}
{"type":"playback","playing":false}
```

## Build (en Windows, con .NET 8 SDK)

Desde la raíz del repo (el script baja a `native/smtc/` solo):

```powershell
./native/smtc/build.ps1
# o, a mano:
# cd native/smtc ; dotnet publish -c Release -r win-x64 --self-contained false -o dist
```

Genera `native/smtc/dist/espejo-smtc.exe` (framework-dependent: requiere el
runtime de .NET 8 instalado en la máquina que lo ejecute).

> El sidecar es **win-x64**; compílalo en Windows (o donde tengas el SDK de
> .NET 8 con el workload de Windows). No se compila desde WSL/Linux.

## Conectar con la app

La app resuelve la ruta del sidecar en este orden (`smtcPath.ts`):

1. Variable de entorno `SMTC_SIDECAR` (ruta explícita, se respeta tal cual):
   ```powershell
   $env:SMTC_SIDECAR="C:\ruta\a\native\smtc\dist\espejo-smtc.exe"
   ```
2. **Autodetección**: si la env no está, busca `native/smtc/dist/espejo-smtc.exe`
   bajo el repo (cwd / app path / `__dirname` relativo / recursos empaquetados).
   Si compilaste con el script, la app lo encuentra **sin** tocar la env.
3. Si ninguna existe, SMTC queda deshabilitado y la app sigue con AudD
   (sistema/micrófono). Fuera de Windows el reader es no-op.

## Equivalentes para portar a futuro
- **Linux:** MPRIS (D-Bus `org.mpris.MediaPlayer2`).
- **macOS:** MediaRemote (framework privado) / `nowplaying`.
