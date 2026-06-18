import React from 'react';
import type { ReadingMode, RenderLine, RenderModel } from './types';
import './Teleprompter.css';

interface Props {
    model: RenderModel;
    readingMode: ReadingMode;
    /** Cuando true, la UI de chrome está oculta (solo letra) → header se atenúa. */
    chromeHidden?: boolean;
}

/** Nivel jerárquico de una línea: centro / subtítulo adyacente / contexto lejano. */
type Tier = 'current' | 'adjacent' | 'far';

/** Render seguro de una línea según el modo de lectura. */
const LineView: React.FC<{
    line: RenderLine;
    mode: ReadingMode;
    tier: Tier;
}> = ({ line, mode, tier }) => {
    const hasFurigana = !!line.furigana && line.furigana.length > 0;
    const hasRomaji = !!line.romaji;

    // Modo solo-romaji: la línea principal ES el romaji (cae a texto si no hay).
    if (mode === 'romaji') {
        return <p className="line-main">{hasRomaji ? line.romaji : line.text}</p>;
    }

    const showRuby = (mode === 'furigana' || mode === 'furigana_romaji') && hasFurigana;
    // El romaji debajo solo en la línea central, para no saturar el contexto.
    const showRomajiBelow = mode === 'furigana_romaji' && hasRomaji && tier === 'current';

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
            {showRomajiBelow && <p className="line-romaji">{line.romaji}</p>}
        </>
    );
};

const STATUS_LABEL: Record<string, string> = {
    IDLE: 'Esperando',
    LISTENING: 'Escuchando',
    IDENTIFYING: 'Identificando',
    FETCHING_LYRICS: 'Buscando letra',
    DISPLAYING: '',
    NO_LYRICS: 'Sin letra',
    ERROR: 'Error',
};

export const Teleprompter: React.FC<Props> = ({ model, readingMode, chromeHidden = false }) => {
    const containerStyle: React.CSSProperties = {
        transform: model.mirror_mode ? 'scaleX(-1)' : 'none',
        opacity: model.opacity,
        textAlign: model.alignment,
    };

    // Tamaños relativos al font_scale. La central manda; los subtítulos
    // adyacentes son legibles pero menores; el contexto lejano es discreto.
    const currentSize = `${4 * model.font_scale}rem`;
    const adjacentSize = `${2.1 * model.font_scale}rem`;
    const farSize = `${1.35 * model.font_scale}rem`;

    const isIdle = model.status === 'IDLE';
    const hasTrack = !!(model.track_title || model.track_artist);
    const statusLabel = STATUS_LABEL[model.status] ?? model.status;

    // Partir el contexto en "adyacente" (1 línea pegada) y "lejano" (el resto).
    const prev = model.previous_lines;
    const next = model.next_lines;
    const prevFar = prev.slice(0, Math.max(0, prev.length - 1));
    const prevAdjacent = prev.slice(Math.max(0, prev.length - 1));
    const nextAdjacent = next.slice(0, 1);
    const nextFar = next.slice(1);

    return (
        <div className="teleprompter-container" style={containerStyle}>

            {/* Header superior-centro: título + artista; estado cuando aplica */}
            <div className={`track-header${chromeHidden ? ' is-hidden' : ''}`}>
                {hasTrack ? (
                    <>
                        {model.track_title && <div className="track-header-title">{model.track_title}</div>}
                        {model.track_artist && <div className="track-header-artist">{model.track_artist}</div>}
                        {statusLabel && <div className="track-header-status">{statusLabel}</div>}
                    </>
                ) : (
                    statusLabel && <div className="track-header-status">{statusLabel}</div>
                )}
            </div>

            {!isIdle && (
                <div className="lyrics-panel">
                    <div className="lyrics-display">
                        <div className="lyrics-far" style={{ fontSize: farSize }}>
                            {prevFar.map((line, i) => (
                                <LineView key={`prev-far-${i}`} line={line} mode={readingMode} tier="far" />
                            ))}
                        </div>

                        <div className="lyrics-adjacent" style={{ fontSize: adjacentSize }}>
                            {prevAdjacent.map((line, i) => (
                                <LineView key={`prev-adj-${i}`} line={line} mode={readingMode} tier="adjacent" />
                            ))}
                        </div>

                        <div className="lyrics-current" style={{ fontSize: currentSize }}>
                            <LineView line={model.current_line} mode={readingMode} tier="current" />
                        </div>

                        <div className="lyrics-adjacent" style={{ fontSize: adjacentSize }}>
                            {nextAdjacent.map((line, i) => (
                                <LineView key={`next-adj-${i}`} line={line} mode={readingMode} tier="adjacent" />
                            ))}
                        </div>

                        <div className="lyrics-far" style={{ fontSize: farSize }}>
                            {nextFar.map((line, i) => (
                                <LineView key={`next-far-${i}`} line={line} mode={readingMode} tier="far" />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isIdle && (
                <div className={`idle-footer${chromeHidden ? ' is-hidden' : ''}`}>{model.current_line.text}</div>
            )}
        </div>
    );
};
