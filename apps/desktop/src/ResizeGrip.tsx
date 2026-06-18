import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import type { DesktopApi } from './types';
import './ResizeGrip.css';

interface Props {
  api: DesktopApi | undefined;
}

/**
 * Grip discreto en la esquina inferior derecha. Arrastrarlo redimensiona la
 * ventana del overlay vía IPC (api.setSize). Usa coordenadas de pantalla para
 * que el delta sea estable aunque la ventana se mueva, y rAF para no saturar
 * el canal IPC. Los presets S/M/L siguen disponibles en WindowControls.
 */
export function ResizeGrip({ api }: Props) {
  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef<{ w: number; h: number } | null>(null);

  const flush = useCallback(() => {
    frameRef.current = null;
    const next = pendingRef.current;
    if (next && api?.setSize) {
      void api.setSize(next.w, next.h);
    }
  }, [api]);

  const onPointerDown = useCallback(
    async (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!api?.getSize || !api?.setSize) return;
      e.preventDefault();
      e.stopPropagation();

      const start = await api.getSize();
      if (!start.ok) return;

      const startX = e.screenX;
      const startY = e.screenY;
      const startW = start.width;
      const startH = start.height;

      const onMove = (ev: PointerEvent) => {
        pendingRef.current = {
          w: Math.round(startW + (ev.screenX - startX)),
          h: Math.round(startH + (ev.screenY - startY)),
        };
        if (frameRef.current == null) {
          frameRef.current = window.requestAnimationFrame(flush);
        }
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (frameRef.current != null) {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        if (pendingRef.current && api.setSize) {
          void api.setSize(pendingRef.current.w, pendingRef.current.h);
          pendingRef.current = null;
        }
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [api, flush],
  );

  if (!api) return null;

  return (
    <div
      className="resize-grip"
      onPointerDown={onPointerDown}
      title="Arrastra para redimensionar"
      aria-label="Redimensionar ventana"
      role="separator"
    >
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
        <path d="M11 4 L4 11 M11 8 L8 11" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
