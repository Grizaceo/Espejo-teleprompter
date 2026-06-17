import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'espejo.highContrast';

// Default ON: el objetivo es que la letra sea legible sobre cualquier fondo sin
// que el usuario tenga que hacer nada (Capa 1 de legibilidad garantizada).
function load(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === '0') return false;
    if (stored === '1') return true;
  } catch {
    /* localStorage no disponible */
  }
  return true;
}

/** Modo alto contraste (halo/contorno + scrim reforzado), persistido. */
export function useHighContrast(): [boolean, () => void] {
  const [on, setOn] = useState<boolean>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [on]);

  const toggle = useCallback(() => setOn((v) => !v), []);
  return [on, toggle];
}
