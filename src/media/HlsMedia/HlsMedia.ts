
import HlsJs, { ErrorData, Events as HlsEvents } from 'hls.js';
import { PlayerError } from '../../PlayerError';
import { Events, ITracksEventData, ITrackChangeEventData, ErrorCodes, ITrack, SourceRefreshReason, SourceRefreshResult } from '../../types';
import { Media } from '../Media';
import { SourceFailure, SourceRecovery } from '../SourceRecovery';
import { watchVisibility } from '../visibility';

/** The delay the original `play()` gave hls.js between `startLoad()` and the element's `play()`. */
const PLAY_DELAY_MS = 200;

export class HlsMedia extends Media {
  public name: string = 'HlsMedia';

  public player: HlsJs;
  public isSourceLoaded: boolean;

  /**
   * Retry / refresh policy (see `media/SourceRecovery`). Without `config.sourceRefresh` it only bounds
   * the retries; with it, a dead url is replaced by a fresh one from the host and playback resumes at
   * the same position, quality and rate.
   */
  private recovery: SourceRecovery;
  private mediaElement: HTMLMediaElement;
  /** The height of the quality the viewer picked by hand (null = automatic), reapplied after a rebuild. */
  private manualHeight: number | null = null;
  private stopWatchingVisibility: (() => void) | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private rebuilding = false;
  private unloaded = false;

  public async load() {
    await super.load();

    this.mediaElement = (this.instance.getModule('HTML5Player') as any).mediaElement;
    this.recovery = new SourceRecovery(this.instance.config.sourceRefresh);
    this.isSourceLoaded = false;
    this.createPlayer();

    if (this.recovery.canRefresh) {
      // A grant that ran out while the student was away is replaced the moment they come back to the
      // tab, so pressing play afterwards costs no extra round trip. Nothing runs in a hidden tab.
      this.stopWatchingVisibility = watchVisibility(() => {
        void this.recovery.prefetchIfDue(this.isPlaying());
      });
    }
  }

  public async play() {
    if (!this.instance.format?.src || this.unloaded) {
      return;
    }

    if (!this.isSourceLoaded) {
      // First start. A grant that expired while the page sat open (a lesson read for an hour before
      // the video is played) is swapped in BEFORE anything is fetched — nothing to rebuild yet.
      if (this.recovery.shouldRefreshBeforePlay()) {
        const fresh = await this.recovery.refreshSource('expired');
        if (this.unloaded) return;
        if (!fresh) {
          this.fail();
          return;
        }
        this.applyFreshSource(fresh);
      }
      this.isSourceLoaded = true;
      this.player.loadSource(this.instance.format.src);
      this.player.startLoad();
      this.startPlayback();
      return;
    }

    if (this.recovery.shouldRefreshBeforePlay()) {
      // Resuming after a pause longer than the grant: the playlists and segments this pipeline knows
      // are dead, so it is rebuilt on a fresh url at the paused position instead of hitting 404s.
      void this.rebuild('expired', true);
      return;
    }

    this.startPlayback();
  }

  public seekTo(time: number) {
    if (time === Infinity) {
      if (this.player.liveSyncPosition)
        this.instance.player?.seekTo(this.player.liveSyncPosition!);
      return;
    }
    super.seekTo(time);
  }

  public unload() {
    this.unloaded = true;
    if (this.stopWatchingVisibility) {
      this.stopWatchingVisibility();
      this.stopWatchingVisibility = null;
    }
    this.clearRetryTimer();
    this.destroyPlayer();
  }

  public selectTrack(track: ITrack | string) {
    if (track === 'auto') {
      this.manualHeight = null;
      this.player.currentLevel = -1;
    } else {
      this.manualHeight = (track as ITrack).height ?? null;
      this.player.currentLevel = (track as ITrack).id;
    }
  }

  /** Builds the hls.js instance on the (kept) media element and binds every handler. */
  private createPlayer() {
    this.player = new HlsJs(this.instance.config.hlsConfig ?? {
      autoStartLoad: false,
      enableWorker: false
    });
    this.player.attachMedia(this.mediaElement);

    this.player.on(HlsJs.Events.MANIFEST_PARSED, (event, data) => {
      const tracks = data.levels
        .map(this.formatTrack)
        .sort((a, b) => b.bandwidth - a.bandwidth);

      this.emit(Events.MEDIA_STATE_TRACKS, {
        tracks,
      } as ITracksEventData);
    });

    this.player.on(HlsJs.Events.LEVEL_SWITCHED, (event, data) => {
      const level = data.level;

      this.emit(Events.MEDIA_STATE_TRACKCHANGE, {
        track: this.formatTrack(this.player.levels[level], level),
        auto: this.player.autoLevelEnabled,
      } as ITrackChangeEventData);
    });

    // A fragment in the buffer means the url works: the incident (if any) is over.
    this.player.on(HlsJs.Events.FRAG_BUFFERED, () => this.recovery.markRecovered());

    this.player.on(HlsJs.Events.ERROR, this.onError);
  }

  private destroyPlayer() {
    if (this.player) {
      this.player.off(HlsJs.Events.ERROR, this.onError);
      this.player.destroy();
    }
  }

  private onError = (_event: HlsEvents.ERROR, data: ErrorData) => {
    if (!data.fatal && data.details !== 'fragParsingError') {
      return;
    }

    // An unparsable fragment is skipped, exactly as before.
    if (data.details === 'fragParsingError') {
      if (this.player.media != null && data.frag != null) {
        this.player.media.currentTime = data.frag.start + data.frag.duration + 1.0;
        this.player.startLoad(this.player.media.currentTime);
      }
      return;
    }

    const action = this.recovery.classify(this.toFailure(data));
    switch (action.type) {
      case 'ignore':
        return;
      case 'recoverMedia':
        this.player.recoverMediaError();
        return;
      case 'retry':
        this.retryLoad(action.delayMs);
        return;
      case 'refresh':
        // Whether the element was running is read BEFORE the rebuild: the load algorithm pauses it.
        void this.rebuild(action.reason, this.isPlaying());
        return;
      case 'fail':
        this.fail(data);
        return;
    }
  };

  private toFailure(data: ErrorData): SourceFailure {
    const kind: SourceFailure['kind'] =
      data.type === HlsJs.ErrorTypes.NETWORK_ERROR ? 'network' :
      data.type === HlsJs.ErrorTypes.MEDIA_ERROR ? 'media' : 'other';
    const status = data.response?.code ?? (data.networkDetails as any)?.status ?? null;
    return { kind, fatal: !!data.fatal, httpStatus: typeof status === 'number' ? status : null, detail: data.details };
  }

  /** The old unconditional `startLoad()` on a fatal network error, now paced by the policy. */
  private retryLoad(delayMs: number) {
    this.clearRetryTimer();
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (!this.unloaded) this.player.startLoad();
    }, delayMs);
  }

  private clearRetryTimer() {
    if (this.retryTimer != null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  /**
   * Replaces the whole hls.js pipeline with one on a fresh url, at the position the viewer is at,
   * with the quality they picked and the rate they set; `resume` restarts playback afterwards.
   *
   * A new instance rather than `loadSource` on the old one: a fatal error leaves hls.js with banned
   * levels, error counters and a stopped stream controller, and starting clean is the one state that
   * is known to be good. The media element is kept — the UI, the volume and every listener stay.
   */
  private async rebuild(reason: SourceRefreshReason, resume: boolean) {
    if (this.rebuilding || this.unloaded) return;
    this.rebuilding = true;
    try {
      const position = this.mediaElement.currentTime;
      const rate = this.mediaElement.playbackRate;

      const fresh = await this.recovery.refreshSource(reason);
      if (this.unloaded) return;
      if (!fresh) {
        this.fail();
        return;
      }
      this.applyFreshSource(fresh);
      this.clearRetryTimer();
      this.destroyPlayer();
      this.createPlayer();
      this.isSourceLoaded = true;
      this.restoreQualityOnParse();
      this.player.loadSource(fresh.src);
      this.player.startLoad(position);
      // Attaching a new MediaSource runs the element's load algorithm, which resets the rate.
      this.mediaElement.defaultPlaybackRate = rate;
      this.mediaElement.playbackRate = rate;
      if (resume) super.play();
    } finally {
      this.rebuilding = false;
    }
  }

  /** The fresh url becomes THE source of the instance, and signed subtitle tracks are replaced too. */
  private applyFreshSource(fresh: SourceRefreshResult) {
    if (this.instance.format) this.instance.format.src = fresh.src;
    if (fresh.subtitles) this.instance.config.subtitles = fresh.subtitles;
  }

  /** A hand-picked quality is matched by HEIGHT — the level index may differ after a re-encode. */
  private restoreQualityOnParse() {
    const height = this.manualHeight;
    if (height == null) return;
    this.player.once(HlsJs.Events.MANIFEST_PARSED, () => {
      const levels = this.player.levels;
      for (let i = 0; i < levels.length; i += 1) {
        if (levels[i].height === height) {
          this.player.currentLevel = i;
          return;
        }
      }
    });
  }

  private startPlayback() {
    const playTimeout = setTimeout(() => {
      if (!this.unloaded) super.play();
      clearTimeout(playTimeout);
    }, PLAY_DELAY_MS);
  }

  private isPlaying(): boolean {
    return !!this.mediaElement && !this.mediaElement.paused && !this.mediaElement.ended;
  }

  /** Recovery exhausted: the error view, and — through the controller's unload — not one more request. */
  private fail(data?: ErrorData) {
    if (this.unloaded) return;
    this.instance.setError(
      new PlayerError(ErrorCodes.HLSJS_CRITICAL_ERROR, this.recovery.failedMessage ?? data),
    );
  }

  private formatTrack = (track: any, id: number): ITrack => ({
    id,
    width: track.width,
    height: track.height,
    bandwidth: track.bitrate,
  });
}
