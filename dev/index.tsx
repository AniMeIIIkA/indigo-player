import * as React from 'react';
import { createRoot } from 'react-dom/client';
import IndigoPlayer from '../src';
import { FormatTypes } from '../src/types';
import type { Chapter } from '../src/types';
import '../src/ui/theme/index.scss';
import './styles.scss';

type SourceType = FormatTypes.MP4 | FormatTypes.HLS | FormatTypes.DASH;
type PreviewSize = 'desktop' | 'tablet' | 'mobile';

const DEFAULT_SOURCE =
  'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM.m3u8';
const DEFAULT_CHAPTERS: Chapter[] = [
  { title: 'Opening', startSec: 0 },
  { title: 'The story begins', startSec: 8 },
  { title: 'Key moment', startSec: 18 },
  { title: 'Finale', startSec: 28 },
];

IndigoPlayer.setConsoleLogs(true);

function formatTime(seconds: number) {
  const value = Math.max(0, Math.round(seconds || 0));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}

function Demo() {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<any>(null);
  const [sourceUrl, setSourceUrl] = React.useState(DEFAULT_SOURCE);
  const [sourceType, setSourceType] = React.useState<SourceType>(
    FormatTypes.HLS,
  );
  const [chapters, setChapters] = React.useState<Chapter[]>(DEFAULT_CHAPTERS);
  const [volume, setVolume] = React.useState(1);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [accent, setAccent] = React.useState('#1890ff');
  const [previewSize, setPreviewSize] = React.useState<PreviewSize>('desktop');
  const [status, setStatus] = React.useState('Loading demo…');
  const [playerState, setPlayerState] = React.useState<any>(null);

  const normalizeChapters = (items: Chapter[]) =>
    items
      .map((item) => ({
        title: item.title.trim(),
        startSec: Math.max(0, Number(item.startSec) || 0),
      }))
      .filter((item) => item.title)
      .sort((left, right) => left.startSec - right.startSec);

  const initializePlayer = React.useCallback(
    (options: {
      sourceUrl: string;
      sourceType: SourceType;
      chapters: Chapter[];
      volume: number;
      playbackRate: number;
    }) => {
      if (!hostRef.current || !options.sourceUrl.trim()) return;

      playerRef.current?.destroy();
      setPlayerState(null);
      setStatus('Loading video…');

      const player: any = IndigoPlayer.init(hostRef.current, {
        autoplay: false,
        aspectRatio: 16 / 9,
        enableLogs: true,
        keyboardNavigation: 'focus',
        volume: options.volume,
        playbackRate: options.playbackRate,
        ui: {
          enabled: true,
          pip: true,
          playbackRate: true,
          showControls: true,
          locale: 'en-US',
          image: '',
        },
        chapters: options.chapters,
        sources: [{ type: options.sourceType, src: options.sourceUrl.trim() }],
        subtitles: [],
      });

      player.on(IndigoPlayer.Events.STATE_CHANGE, ({ state }) =>
        setPlayerState(state),
      );
      player.on(IndigoPlayer.Events.READY, () => setStatus('Ready to test'));
      player.on(IndigoPlayer.Events.ERROR, () =>
        setStatus('Player error — inspect state'),
      );
      playerRef.current = player;
      (window as any).player = player;
    },
    [],
  );

  React.useEffect(() => {
    initializePlayer({
      sourceUrl: DEFAULT_SOURCE,
      sourceType: FormatTypes.HLS,
      chapters: DEFAULT_CHAPTERS,
      volume: 1,
      playbackRate: 1,
    });
    return () => playerRef.current?.destroy();
  }, [initializePlayer]);

  React.useEffect(() => {
    hostRef.current
      ?.querySelector<HTMLElement>('.ig-container')
      ?.style.setProperty('--igui-accent', accent);
  }, [accent, status]);

  const applyVideo = () => {
    const normalized = normalizeChapters(chapters);
    setChapters(normalized);
    initializePlayer({
      sourceUrl,
      sourceType,
      chapters: normalized,
      volume,
      playbackRate,
    });
  };

  const applyChapters = () => {
    const normalized = normalizeChapters(chapters);
    setChapters(normalized);
    playerRef.current?.setChapters(normalized);
    setStatus(`${normalized.length} chapters applied live`);
  };

  const updateChapter = (
    index: number,
    field: keyof Chapter,
    value: string,
  ) => {
    setChapters((current) =>
      current.map((chapter, chapterIndex) =>
        chapterIndex === index
          ? {
              ...chapter,
              [field]: field === 'startSec' ? Number(value) : value,
            }
          : chapter,
      ),
    );
  };

  const addChapter = () => {
    const lastStart = chapters[chapters.length - 1]?.startSec || 0;
    setChapters((current) => [
      ...current,
      {
        title: `Chapter ${current.length + 1}`,
        startSec: lastStart + 5,
      },
    ]);
  };

  return (
    <main className="demo-shell">
      <header className="demo-header">
        <div>
          <span className="eyebrow">Interactive playground</span>
          <h1>Indigo Player</h1>
          <p>
            Configure playback, edit chapters and inspect the player without
            leaving the page.
          </p>
        </div>
        <div className="status-pill">
          <span />
          {status}
        </div>
      </header>

      <div className="demo-workspace">
        <section className="preview-card">
          <div className="preview-toolbar">
            <div>
              <span className="section-kicker">Live preview</span>
              <strong>
                {sourceType.toUpperCase()} · {chapters.length} chapters
              </strong>
            </div>
            <div className="size-switcher" aria-label="Preview size">
              {(['desktop', 'tablet', 'mobile'] as PreviewSize[]).map(
                (size) => (
                  <button
                    className={previewSize === size ? 'is-active' : ''}
                    key={size}
                    onClick={() => setPreviewSize(size)}
                    type="button"
                  >
                    {size[0].toUpperCase() + size.slice(1)}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="preview-canvas">
            <div className={`player-frame player-frame--${previewSize}`}>
              <div className="player-host" ref={hostRef} />
            </div>
          </div>

          <div className="testing-hints">
            <span>
              <kbd>Ctrl</kbd>/<kbd>Alt</kbd> + <kbd>←</kbd>
              <kbd>→</kbd> chapter jump
            </span>
            <span>
              Click the current chapter title to open the chapter panel
            </span>
          </div>

          <details className="state-inspector">
            <summary>Inspect player state</summary>
            <pre>
              {playerState
                ? JSON.stringify(playerState, null, 2)
                : 'Waiting for player state…'}
            </pre>
          </details>
        </section>

        <aside className="settings-panel">
          <div className="settings-heading">
            <div>
              <span className="section-kicker">Demo controls</span>
              <h2>Player settings</h2>
            </div>
            <button
              className="icon-button"
              onClick={() => location.reload()}
              title="Reset demo"
              type="button"
            >
              ↻
            </button>
          </div>

          <section className="settings-section">
            <div className="section-title">
              <h3>Video source</h3>
              <span>Reloads player</span>
            </div>
            <label className="field-label" htmlFor="source-url">
              Source URL
            </label>
            <input
              id="source-url"
              onChange={(event) => setSourceUrl(event.target.value)}
              type="url"
              value={sourceUrl}
            />
            <div className="field-grid">
              <label>
                <span className="field-label">Format</span>
                <select
                  value={sourceType}
                  onChange={(event) =>
                    setSourceType(event.target.value as SourceType)
                  }
                >
                  <option value={FormatTypes.MP4}>MP4</option>
                  <option value={FormatTypes.HLS}>HLS</option>
                  <option value={FormatTypes.DASH}>DASH</option>
                </select>
              </label>
              <label>
                <span className="field-label">Accent</span>
                <span className="color-field">
                  <input
                    type="color"
                    value={accent}
                    onChange={(event) => setAccent(event.target.value)}
                  />
                  <code>{accent}</code>
                </span>
              </label>
            </div>
            <button
              className="primary-button full-button"
              onClick={applyVideo}
              type="button"
            >
              Apply video settings
            </button>
          </section>

          <section className="settings-section">
            <div className="section-title">
              <h3>Playback</h3>
              <span>Updates live</span>
            </div>
            <label className="range-field">
              <span>
                <span>Volume</span>
                <strong>{Math.round(volume * 100)}%</strong>
              </span>
              <input
                max="1"
                min="0"
                step="0.05"
                type="range"
                value={volume}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setVolume(next);
                  playerRef.current?.setVolume(next);
                }}
              />
            </label>
            <label className="stacked-field">
              <span className="field-label">Playback speed</span>
              <select
                value={playbackRate}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setPlaybackRate(next);
                  playerRef.current?.setPlaybackRate(next);
                }}
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}×
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="settings-section">
            <div className="section-title">
              <div>
                <h3>Chapters</h3>
                <span>Applied without reload</span>
              </div>
              <button
                className="secondary-button compact-button"
                onClick={addChapter}
                type="button"
              >
                + Add
              </button>
            </div>
            <div className="chapters-list">
              {chapters.map((chapter, index) => (
                <div className="chapter-row" key={index}>
                  <label>
                    <span>Start</span>
                    <input
                      min="0"
                      onChange={(event) =>
                        updateChapter(index, 'startSec', event.target.value)
                      }
                      type="number"
                      value={chapter.startSec}
                    />
                  </label>
                  <label>
                    <span>Title · {formatTime(chapter.startSec)}</span>
                    <input
                      onChange={(event) =>
                        updateChapter(index, 'title', event.target.value)
                      }
                      type="text"
                      value={chapter.title}
                    />
                  </label>
                  <button
                    className="remove-button"
                    disabled={chapters.length <= 2}
                    onClick={() =>
                      setChapters((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    title="Remove chapter"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="chapter-actions">
              <button
                className="secondary-button"
                onClick={() => setChapters(DEFAULT_CHAPTERS)}
                type="button"
              >
                Reset
              </button>
              <button
                className="primary-button"
                onClick={applyChapters}
                type="button"
              >
                Apply chapters
              </button>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

createRoot(document.getElementById('demoRoot') as HTMLElement).render(<Demo />);
