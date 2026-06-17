import type { ReadingMode } from './types';
import './ReadingControls.css';

interface Props {
  mode: ReadingMode;
  onChange: (mode: ReadingMode) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
}

const OPTIONS: { key: ReadingMode; label: string; title: string }[] = [
  { key: 'original', label: '原', title: 'Original (sin lecturas)' },
  { key: 'furigana', label: 'ふ', title: 'Furigana (kana sobre kanji)' },
  { key: 'romaji', label: 'A', title: 'Romaji' },
  { key: 'furigana_romaji', label: 'ふ+A', title: 'Furigana + romaji' },
];

/** Selector del modo de lectura + alto contraste (clave para rapear en japonés). */
export function ReadingControls({ mode, onChange, highContrast, onToggleHighContrast }: Props) {
  return (
    <div className="reading-controls" title="Modo de lectura">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className={`reading-btn${mode === opt.key ? ' active' : ''}`}
          onClick={() => onChange(opt.key)}
          title={opt.title}
          aria-label={opt.title}
          aria-pressed={mode === opt.key}
        >
          {opt.label}
        </button>
      ))}
      <span className="reading-sep" aria-hidden="true" />
      <button
        type="button"
        className={`reading-btn contrast${highContrast ? ' active' : ''}`}
        onClick={onToggleHighContrast}
        title="Alto contraste: halo + fondo para que la letra se lea sobre cualquier fondo"
        aria-label="Alto contraste"
        aria-pressed={highContrast}
      >
        ◐
      </button>
    </div>
  );
}
