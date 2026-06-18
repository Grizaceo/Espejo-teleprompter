import { useState, useEffect, useRef } from 'react';
import { Teleprompter } from './Teleprompter';
import { DebugLyricsInput } from './DebugLyricsInput';
import { RecognitionControls } from './RecognitionControls';
import { SyncControls } from './SyncControls';
import { ReadingControls } from './ReadingControls';
import { WindowControls } from './WindowControls';
import { ResizeGrip } from './ResizeGrip';
import { useReadingMode } from './useReadingMode';
import { INITIAL_RENDER_MODEL } from './initialModel';
import type { RenderModel, DesktopApi } from './types';
import './App.css';

declare global {
  interface Window {
    api?: DesktopApi;
  }
}

/** Tiempo de inactividad del mouse tras el cual se oculta la UI (ms). */
const CHROME_IDLE_MS = 2800;

function App() {
  const [model, setModel] = useState<RenderModel>(INITIAL_RENDER_MODEL);
  const [readingMode, setReadingMode] = useReadingMode();
  const [chromeVisible, setChromeVisible] = useState(true);
  const unsubscribeRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    // Fase 0: si window.api no existe (ej. corriendo en navegador puro con
    // `npm run dev:vite`), se simula el estado inicial para no romper el UI.
    if (!window.api) {
      console.warn(
        '[App] window.api no disponible — ejecutando en modo navegador. ' +
          'Para la app completa usa `npm run dev:electron`.'
      );
      const interval = window.setInterval(() => {
        setModel((prev) => ({ ...prev }));
      }, 500);
      return () => window.clearInterval(interval);
    }

    const unsubscribe = window.api.onRenderModel((next) => {
      setModel(next);
    });
    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-ocultar la UI mientras se muestra la letra sincronizada. Cualquier
  // actividad del mouse/teclado la revela; tras un rato de inactividad se
  // esconde de nuevo dejando solo la letra. Fuera de DISPLAYING siempre visible.
  const isDisplaying = model.status === 'DISPLAYING';
  useEffect(() => {
    // Solo gestionamos la ocultación durante DISPLAYING. Fuera de ese estado
    // `chromeHidden` ya es false, así que no hace falta tocar el estado en el
    // cuerpo del efecto (evita renders en cascada).
    if (!isDisplaying) return;

    let hideTimer = window.setTimeout(() => setChromeVisible(false), CHROME_IDLE_MS);
    const reveal = () => {
      setChromeVisible(true);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setChromeVisible(false), CHROME_IDLE_MS);
    };

    window.addEventListener('mousemove', reveal);
    window.addEventListener('mousedown', reveal);
    window.addEventListener('wheel', reveal, { passive: true });
    window.addEventListener('keydown', reveal);

    return () => {
      window.clearTimeout(hideTimer);
      window.removeEventListener('mousemove', reveal);
      window.removeEventListener('mousedown', reveal);
      window.removeEventListener('wheel', reveal);
      window.removeEventListener('keydown', reveal);
      // Al salir de DISPLAYING, dejar la UI visible para la próxima vez.
      setChromeVisible(true);
    };
  }, [isDisplaying]);

  const chromeHidden = isDisplaying && !chromeVisible;

  // Detecta si las letras cargadas tienen furigana o romaji en alguna línea.
  const hasAnnotations =
    model.status === 'DISPLAYING' &&
    [...model.previous_lines, model.current_line, ...model.next_lines].some(
      (l) => l.furigana != null || l.romaji != null,
    );

  return (
    <>
      <Teleprompter model={model} readingMode={readingMode} chromeHidden={chromeHidden} />
      <div className={`app-chrome${chromeHidden ? ' chrome-hidden' : ''}`}>
        <RecognitionControls />
        <SyncControls />
        <ReadingControls mode={readingMode} onChange={setReadingMode} hasAnnotations={hasAnnotations} />
        <DebugLyricsInput />
        <WindowControls api={window.api} />
        <ResizeGrip api={window.api} />
      </div>
    </>
  );
}

export default App;
