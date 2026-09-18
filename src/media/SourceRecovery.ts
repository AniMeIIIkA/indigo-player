import {
  SourceRefreshConfig,
  SourceRefreshReason,
  SourceRefreshResult,
} from '../types';

/**
 * What a media module knows about a failure before deciding what to do about it. The hls.js error
 * object and a `<video>` MediaError are both mapped onto this shape by the caller, so the policy
 * below never depends on either library.
 */
export interface SourceFailure {
  kind: 'network' | 'media' | 'other';
  fatal: boolean;
  /** HTTP status of the failed request; 0 for a request that never got an answer (offline, CORS). */
  httpStatus?: number | null;
  /** Free-form detail for logging (`levelLoadError`, `MEDIA_ERR_NETWORK`, ...). */
  detail?: string;
}

export type FailureAction =
  /** Not fatal, nothing to do. */
  | { type: 'ignore' }
  /** hls.js `recoverMediaError()`. */
  | { type: 'recoverMedia' }
  /** Load the SAME url again after a pause — a transient network failure. */
  | { type: 'retry'; delayMs: number }
  /** Ask the host for a fresh url and rebuild the pipeline on it. */
  | { type: 'refresh'; reason: SourceRefreshReason }
  /** Give up: show the error, stop every request. */
  | { type: 'fail' };

/** HTTP answers that say "this url is dead" rather than "try again". */
const DEFINITIVE_STATUSES = [400, 401, 403, 404, 410];

/**
 * A grant this close to its end is treated as expired when playback is REQUESTED: the very first
 * playlist request of the resume would otherwise land after the edge.
 */
const EXPIRY_LEAD_MS = 60_000;

const DEFAULT_MAX_RELOADS = 2;
const MAX_DEFINITIVE_RETRIES = 2;
const MAX_MEDIA_RECOVERIES = 3;
const REFRESH_RETRY_DELAYS_MS = [1_500, 4_000];
const RETRY_BASE_DELAY_MS = 1_000;
const RETRY_MAX_DELAY_MS = 30_000;

export const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * The retry / refresh policy of a media module, with no DOM and no player library in it.
 *
 * Two problems it exists for (both measured on the platform's own HLS in production, 2026-09-17):
 *
 * 1. A signed playback url stops working after its grant expires — a student who pauses a lesson
 *    for longer than the grant and presses play gets 404 on every playlist and 403 on every segment.
 *    When the host hands in `SourceRefreshConfig.refresh`, the policy answers `refresh` and the media
 *    module rebuilds its pipeline on the fresh url at the same position. When the host also says when
 *    the grant ends (`expiresAt`), a play request past that moment refreshes BEFORE loading anything,
 *    so the failure never happens at all.
 * 2. The old error handler called `startLoad()` on every fatal network error, without a counter and
 *    without looking at the status: one tab kept asking for a dead url every few seconds for hours. A
 *    definitive status (4xx) is now retried a bounded number of times, and a reload budget caps how
 *    many rebuilds may fail in a row before the player shows its error and stops.
 *
 * Everything is counted per "incident": `markRecovered()` — the first fragment buffered after a
 * rebuild — resets the counters, so a video that plays for an hour and then stalls once gets the full
 * budget again.
 */
export class SourceRecovery {
  private expiresAt: number | null;
  private pending: SourceRefreshResult | null = null;
  private inFlight: Promise<SourceRefreshResult | null> | null = null;
  private reloads = 0;
  private retries = 0;
  private mediaRecoveries = 0;
  private gaveUp = false;

  constructor(
    private readonly config: SourceRefreshConfig | undefined,
    private readonly now: () => number = () => Date.now(),
    private readonly sleep: (ms: number) => Promise<void> = wait,
  ) {
    this.expiresAt = config?.expiresAt ?? null;
  }

  /** True when the host can hand out a fresh url and the budget is not spent. */
  public get canRefresh(): boolean {
    return !!this.config?.refresh && !this.gaveUp;
  }

  public get hasGivenUp(): boolean {
    return this.gaveUp;
  }

  /** The message the host wants shown when recovery is exhausted, if it gave one. */
  public get failedMessage(): string | undefined {
    return this.config?.failedMessage;
  }

  /** When the current url stops working, if the host told us. */
  public get expiry(): number | null {
    return this.expiresAt;
  }

  /** The grant is over, or about to be: a play request must not start on this url. */
  public isExpired(at: number = this.now()): boolean {
    return this.expiresAt != null && at + EXPIRY_LEAD_MS >= this.expiresAt;
  }

  /** A fresh url was fetched ahead of time (see `prefetchIfDue`) and waits to be applied. */
  public get hasPending(): boolean {
    return this.pending != null;
  }

  /** Whether a play request should rebuild on a fresh url before loading anything. */
  public shouldRefreshBeforePlay(at: number = this.now()): boolean {
    return this.canRefresh && (this.pending != null || this.isExpired(at));
  }

  /** Decides what a media module does about a failure. */
  public classify(failure: SourceFailure): FailureAction {
    if (!failure.fatal) return { type: 'ignore' };
    if (this.gaveUp) return { type: 'fail' };

    if (failure.kind === 'media') {
      if (this.mediaRecoveries >= MAX_MEDIA_RECOVERIES) return { type: 'fail' };
      this.mediaRecoveries += 1;
      return { type: 'recoverMedia' };
    }
    if (failure.kind !== 'network') return { type: 'fail' };

    const status = failure.httpStatus ?? 0;
    const offline = status === 0 && typeof navigator !== 'undefined' && navigator.onLine === false;
    if (offline) return this.retry();

    const definitive = DEFINITIVE_STATUSES.indexOf(status) !== -1;
    if (this.canRefresh && (definitive || status === 0 || this.isExpired())) {
      if (this.reloads >= this.maxReloads) return this.giveUp();
      this.reloads += 1;
      return { type: 'refresh', reason: this.isExpired() ? 'expired' : 'error' };
    }
    if (definitive) {
      if (this.retries >= MAX_DEFINITIVE_RETRIES) return this.giveUp();
      return this.retry();
    }
    // A 5xx or a timeout: the server may come back, so keep asking, but paced.
    return this.retry();
  }

  /**
   * A fresh url from the host: the prefetched one when there is one, else `refresh()` — retried a
   * couple of times on a rejection (a transient failure), never on `null` (the host says the source
   * cannot be had at all). Concurrent callers share one request. Null means the player must give up.
   */
  public refreshSource(reason: SourceRefreshReason): Promise<SourceRefreshResult | null> {
    if (this.pending) {
      const result = this.pending;
      this.pending = null;
      return Promise.resolve(result);
    }
    if (this.inFlight) return this.inFlight;
    return this.share(this.fetchFresh(reason, /* giveUpOnFailure */ true));
  }

  /**
   * Fetches a fresh url ahead of time — meant for the moment a tab becomes visible again: the grant
   * has expired while the student was away, playback is not running, and by the time they press play
   * the url is already there. Best effort: a network failure here (the laptop just woke up) is NOT
   * counted against the budget — the on-demand path retries; only an explicit `null` from the host
   * ("the source cannot be had") is final.
   */
  public async prefetchIfDue(playing: boolean, at: number = this.now()): Promise<boolean> {
    if (playing || !this.canRefresh || this.pending || this.inFlight || !this.isExpired(at)) return false;
    const result = await this.share(this.fetchFresh('proactive', /* giveUpOnFailure */ false));
    if (result) this.pending = result;
    return !!result;
  }

  /** One request at a time: concurrent callers get the same promise (the callers check `inFlight` first). */
  private share(request: Promise<SourceRefreshResult | null>): Promise<SourceRefreshResult | null> {
    this.inFlight = request;
    const release = () => {
      if (this.inFlight === request) this.inFlight = null;
    };
    request.then(release, release);
    return request;
  }

  /** The first fragment played after a rebuild: the incident is over, every counter starts afresh. */
  public markRecovered() {
    this.reloads = 0;
    this.retries = 0;
    this.mediaRecoveries = 0;
  }

  private get maxReloads(): number {
    return this.config?.maxAttempts ?? DEFAULT_MAX_RELOADS;
  }

  private retry(): FailureAction {
    const delayMs = Math.min(RETRY_MAX_DELAY_MS, RETRY_BASE_DELAY_MS * Math.pow(2, this.retries));
    this.retries += 1;
    return { type: 'retry', delayMs };
  }

  private giveUp(): FailureAction {
    this.gaveUp = true;
    return { type: 'fail' };
  }

  /**
   * `null` from the host is final either way. A rejection is retried with short pauses when the
   * caller is waiting on the answer (`giveUpOnFailure`), and merely reported when it is a prefetch.
   */
  private async fetchFresh(reason: SourceRefreshReason, giveUpOnFailure: boolean): Promise<SourceRefreshResult | null> {
    const refresh = this.config?.refresh;
    if (!refresh || this.gaveUp) return null;
    for (let attempt = 0; ; attempt += 1) {
      try {
        const raw = await refresh(reason);
        if (raw == null) return this.refused();
        const result: SourceRefreshResult = typeof raw === 'string' ? { src: raw } : raw;
        if (!result.src) return this.refused();
        this.expiresAt = result.expiresAt ?? null;
        return result;
      } catch (error) {
        if (!giveUpOnFailure) return null;
        const delay = REFRESH_RETRY_DELAYS_MS[attempt];
        if (delay == null) return this.refused();
        await this.sleep(delay);
      }
    }
  }

  private refused(): null {
    this.gaveUp = true;
    return null;
  }
}
