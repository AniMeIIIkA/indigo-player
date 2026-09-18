import { PlayerError } from '../../PlayerError';
import { ErrorCodes, SourceRefreshReason, SourceRefreshResult } from '../../types';
import { Media } from '../Media';
import { SourceFailure, SourceRecovery } from '../SourceRecovery';
import { watchVisibility } from '../visibility';

/** `MediaError.code` values (the constants are not on every engine's `MediaError`). */
const MEDIA_ERR_ABORTED = 1;
const MEDIA_ERR_NETWORK = 2;
const MEDIA_ERR_DECODE = 3;
const MEDIA_ERR_SRC_NOT_SUPPORTED = 4;

/**
 * The media element plays the url itself: a plain file everywhere, and HLS on Safari / iOS, where
 * `HlsMediaLoader` steps aside on purpose (see the package guide).
 *
 * With `config.sourceRefresh` it recovers an expiring source the way `HlsMedia` does — a play past the
 * grant's end, a stall or an `error` on a dead url swaps in a fresh url at the same position — but on
 * the element alone, since there is no hls.js pipeline here. Native controls are the norm on iOS, so
 * the element's own `play` event is watched, not only the API's `play()`.
 */
export class BaseMedia extends Media {
  public name: string = 'BaseMedia';

  private recovery: SourceRecovery;
  private mediaElement: HTMLMediaElement | null = null;
  private listeners: Array<[string, EventListener]> = [];
  private stopWatchingVisibility: (() => void) | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private rebuilding = false;
  private unloaded = false;

  public async load() {
    await super.load();

    this.recovery = new SourceRecovery(this.instance.config.sourceRefresh);
    this.mediaElement = (this.instance.getModule('HTML5Player') as any)?.mediaElement ?? null;

    if (this.instance.format?.src)
      this.instance.player?.setSource(this.instance.format?.src);

    if (this.recovery.canRefresh && this.mediaElement) {
      this.listen('error', this.onError);
      this.listen('play', this.onPlay);
      this.listen('waiting', this.onStall);
      this.listen('stalled', this.onStall);
      this.stopWatchingVisibility = watchVisibility(() => {
        void this.recovery.prefetchIfDue(this.isPlaying());
      });
    }
  }

  public play() {
    if (this.mediaElement && this.recovery.shouldRefreshBeforePlay()) {
      void this.rebuild('expired', true);
      return;
    }
    super.play();
  }

  public unload() {
    this.unloaded = true;
    if (this.stopWatchingVisibility) {
      this.stopWatchingVisibility();
      this.stopWatchingVisibility = null;
    }
    if (this.retryTimer != null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    const element = this.mediaElement;
    if (element) {
      this.listeners.forEach(([name, listener]) => element.removeEventListener(name, listener));
    }
    this.listeners = [];
  }

  private listen(name: string, listener: EventListener) {
    this.mediaElement!.addEventListener(name, listener);
    this.listeners.push([name, listener]);
  }

  /** Native controls press play on the element directly — the API's `play()` never sees it. */
  private onPlay = () => {
    if (this.rebuilding || !this.recovery.shouldRefreshBeforePlay()) return;
    void this.rebuild('expired', true);
  };

  /** A native HLS player on dead segments may only stall, never error: a stall past the grant is the signal. */
  private onStall = () => {
    if (this.rebuilding || !this.isPlaying() || !this.recovery.isExpired()) return;
    void this.rebuild('expired', true);
  };

  private onError = () => {
    const error = this.mediaElement?.error;
    // MEDIA_ERR_ABORTED (1) is the element reporting a fetch WE cancelled by changing the source.
    if (!error || error.code === MEDIA_ERR_ABORTED) return;
    const action = this.recovery.classify(this.toFailure(error.code));
    switch (action.type) {
      case 'ignore':
        return;
      case 'recoverMedia':
      case 'retry':
        this.retryTimer = setTimeout(() => {
          this.retryTimer = null;
          void this.rebuild(null, this.isPlaying());
        }, action.type === 'retry' ? action.delayMs : 0);
        return;
      case 'refresh':
        void this.rebuild(action.reason, this.isPlaying());
        return;
      case 'fail':
        this.fail(error);
        return;
    }
  };

  private toFailure(code: number): SourceFailure {
    const kind: SourceFailure['kind'] =
      code === MEDIA_ERR_NETWORK || code === MEDIA_ERR_SRC_NOT_SUPPORTED ? 'network' :
      code === MEDIA_ERR_DECODE ? 'media' : 'other';
    // The element never reports an HTTP status; a network failure on a signed url is read as "dead url".
    return { kind, fatal: true, httpStatus: null, detail: `MediaError ${code}` };
  }

  /**
   * Loads the element again — on a fresh url when `reason` is given, on the same one otherwise — at
   * the position the viewer is at, with their rate, and resumes playback when asked.
   */
  private async rebuild(reason: SourceRefreshReason | null, resume: boolean) {
    const element = this.mediaElement;
    if (this.rebuilding || this.unloaded || !element) return;
    this.rebuilding = true;
    try {
      const position = element.currentTime;
      const rate = element.playbackRate;

      let src = this.instance.format?.src;
      if (reason) {
        const fresh = await this.recovery.refreshSource(reason);
        if (this.unloaded) return;
        if (!fresh) {
          this.fail();
          return;
        }
        this.applyFreshSource(fresh);
        src = fresh.src;
      }
      if (!src) return;

      // The position and the rate can only be set once the new source's metadata is in; on iOS that
      // fetch may itself wait for the tap — which is why `play()` goes out right away, not after it.
      const onLoadedMetadata = () => {
        element.removeEventListener('loadedmetadata', onLoadedMetadata);
        if (this.unloaded) return;
        if (position > 0) element.currentTime = position;
        element.defaultPlaybackRate = rate;
        element.playbackRate = rate;
        this.recovery.markRecovered();
      };
      element.addEventListener('loadedmetadata', onLoadedMetadata);
      // Setting `src` runs the element's load algorithm: it pauses the element and resets the rate.
      this.instance.player?.setSource(src);
      if (resume) super.play();
    } finally {
      this.rebuilding = false;
    }
  }

  private applyFreshSource(fresh: SourceRefreshResult) {
    if (this.instance.format) this.instance.format.src = fresh.src;
    if (fresh.subtitles) this.instance.config.subtitles = fresh.subtitles;
  }

  private isPlaying(): boolean {
    return !!this.mediaElement && !this.mediaElement.paused && !this.mediaElement.ended;
  }

  private fail(error?: MediaError) {
    if (this.unloaded) return;
    this.instance.setError(
      new PlayerError(ErrorCodes.MEDIA_SOURCE_ERROR, this.recovery.failedMessage ?? error),
    );
  }
}
