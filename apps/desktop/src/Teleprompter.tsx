import React from 'react';
import type { ReadingMode, RenderLine, RenderModel } from './types';
import './Teleprompter.css';

interface Props {
    model: RenderModel;
    readingMode: ReadingMode;
    highContrast: boolean;
}

/**
 * Texto romaji con resaltado karaoke palabra-por-palabra según `progress` (0..1).
 * Divide por espacios (el romaji hepburn 'spaced' separa por palabra) y marca
 * como "cantadas" las primeras `ceil(progress * nPalabras)`. Da el flow sin
 * necesitar timings por palabra (interpola sobre la duración de la línea).
 */
const KaraokeRomaji: React.FC<{ text: string; progress: number }> = ({ text, progress }) => {
    const tokens = text.split(/(\s+)/);
    const isWord = (t: string): boolean => /\S/.test(t);
    const total = tokens.filter(isWord).length;
    const active = Math.ceil(Math.max(0, Math.min(1, progress)) * total);
    return (
        <>
            {tokens.map((tok, i) => {
                if (!isWord(tok)) return tok;
                // índice de palabra = palabras antes de este token (sin mutar estado en render).
                const wordIdx = tokens.slice(0, i).filter(isWord).length;
                return (
                    <span key={i} className={`kw${wordIdx < active ? ' kw-done' : ''}`}>
                        {tok}
                    </span>
                );
            })}
        </>
    );
};

/** Render seguro de una línea según el modo de lectura. */
const LineView: React.FC<{
    line: RenderLine;
    mode: ReadingMode;
    prominent?: boolean;
    progress?: number;
}> = ({ line, mode, prominent = false, progress }) => {
    const hasFurigana = !!line.furigana && line.furigana.length > 0;
    const hasRomaji = !!line.romaji;
    const karaoke = prominent && typeof progress === 'number' && hasRomaji;

    // Modo solo-romaji: la línea principal ES el romaji (cae a texto si no hay).
    if (mode === 'romaji') {
        return (
            <p className="line-main">
                {hasRomaji ? (
                    karaoke ? (
                        <KaraokeRomaji text={line.romaji!} progress={progress!} />
                    ) : (
                        line.romaji
                    )
                ) : (
                    line.text
                )}
            </p>
        );
    }

    const showRuby = (mode === 'furigana' || mode === 'furigana_romaji') && hasFurigana;
    // El romaji debajo se muestra solo en la línea prominente (actual) para no
    // saturar el contexto previo/siguiente.
    const showRomajiBelow = mode === 'furigana_romaji' && hasRomaji && prominent;

    return (
        <>
            <p className="line-main">
                {showRuby
                    ? line.furigana!.map((seg, i) =>
                          seg.rt ? (
                              <ruby key={i}>
                                  {seg.base}
                                  <rt>{seg.rt}</rt>
                              </ruby>
                          ) : (
                              <span key={i}>{seg.base}</span>
                          ),
                      )
                    : line.text}
            </p>
            {showRomajiBelow &&
                (karaoke ? (
                    <p className="line-romaji">
                        <KaraokeRomaji text={line.romaji!} progress={progress!} />
                    </p>
                ) : (
                    <p className="line-romaji">{line.romaji}</p>
                ))}
        </>
    );
};

export const Teleprompter: React.FC<Props> = ({ model, readingMode, highContrast }) => {
    const containerStyle: React.CSSProperties = {
        transform: model.mirror_mode ? 'scaleX(-1)' : 'none',
        opacity: model.opacity,
        textAlign: model.alignment,
    };

    const fontSize = `${4 * model.font_scale}rem`;

    const isIdle = model.status === 'IDLE';

    return (
        <div
            className={`teleprompter-container${highContrast ? ' high-contrast' : ''}`}
            style={containerStyle}
        >
            <div className="status-indicator">{model.status}</div>

            {!isIdle && (
                <div className="lyrics-panel">
                    <div className="lyrics-display">
                        <div className="lyrics-previous">
                            {model.previous_lines.map((line, i) => (
                                <LineView key={`prev-${i}`} line={line} mode={readingMode} />
                            ))}
                        </div>

                        <div className="lyrics-current" style={{ fontSize }}>
                            <LineView
                                line={model.current_line}
                                mode={readingMode}
                                prominent
                                progress={model.current_progress}
                            />
                            {typeof model.current_progress === 'number' && (
                                <div className="line-progress" aria-hidden="true">
                                    <div
                                        className="line-progress-fill"
                                        style={{ width: `${Math.round(model.current_progress * 100)}%` }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="lyrics-next">
                            {model.next_lines.map((line, i) => (
                                <LineView key={`next-${i}`} line={line} mode={readingMode} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {(model.track_title || model.track_artist) && (
                <div className="track-info">
                    <h2>{model.track_title}</h2>
                    <h3>{model.track_artist}</h3>
                </div>
            )}

            {isIdle && (
                <div className="idle-footer">{model.current_line.text}</div>
            )}
        </div>
    );
};
