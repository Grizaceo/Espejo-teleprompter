import { useCallback, useEffect, useState } from 'react';
import type { DesktopApi } from './types';
import './WindowControls.css';

interface WindowControlsProps {
  api: DesktopApi | undefined;
}

export function WindowControls({ api }: WindowControlsProps) {
  const [width, setWidth] = useState(520);
  const [height, setHeight] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  // Obtener tamaño inicial
  useEffect(() => {
    if (!api?.getSize) return;
    api.getSize().then((result) => {
      if (result.ok) {
        setWidth(result.width);
        setHeight(result.height);
      }
    });
  }, [api]);

  const handleMinimize = useCallback(async () => {
    if (!api?.minimize) return;
    await api.minimize();
  }, [api]);

  const handleClose = useCallback(async () => {
    if (!api?.close) return;
    await api.close();
  }, [api]);

  const handleResize = useCallback(async (w: number, h: number) => {
    if (!api?.setSize) return;
    const result = await api.setSize(w, h);
    if (result.ok) {
      setWidth(w);
      setHeight(h);
    }
  }, [api]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const w = parseInt(e.target.value, 10);
    if (!isNaN(w) && w >= 320) setWidth(w);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = parseInt(e.target.value, 10);
    if (!isNaN(h) && h >= 200) setHeight(h);
  };

  const applyResize = () => {
    handleResize(width, height);
    setIsResizing(false);
  };

  if (!api) return null;

  return (
    <div className="window-controls">
      <div className="window-controls-row">
        <button
          type="button"
          className="win-btn minimize"
          onClick={handleMinimize}
          title="Minimizar"
          aria-label="Minimizar"
        >
          −
        </button>
        <button
          type="button"
          className="win-btn close"
          onClick={handleClose}
          title="Cerrar"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>

      <div className="window-controls-row resize-row">
        <label className="resize-input">
          <span>W</span>
          <input
            type="number"
            min="320"
            value={width}
            onChange={handleWidthChange}
            onKeyDown={(e) => e.key === 'Enter' && applyResize()}
            onBlur={applyResize}
            aria-label="Ancho"
          />
        </label>
        <label className="resize-input">
          <span>H</span>
          <input
            type="number"
            min="200"
            value={height}
            onChange={handleHeightChange}
            onKeyDown={(e) => e.key === 'Enter' && applyResize()}
            onBlur={applyResize}
            aria-label="Alto"
          />
        </label>
        <button
          type="button"
          className="win-btn apply"
          onClick={applyResize}
          disabled={isResizing}
        >
          {isResizing ? '…' : 'Aplicar'}
        </button>
      </div>
    </div>
  );
}