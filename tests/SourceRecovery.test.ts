/**
 * @jest-environment node
 *
 * Node, not jsdom: the package's jsdom needs the optional `canvas` native module, which has no
 * prebuilt binary for Node 22 (see client/CLAUDE.md) — and the policy under test has no DOM anyway.
 */
import { SourceRecovery, FailureAction } from '../src/media/SourceRecovery';
import { SourceRefreshConfig, SourceRefreshResult } from '../src/types';

/**
 * The retry / refresh policy behind HlsMedia and BaseMedia. The two production facts it pins:
 * an expired playback grant is replaced instead of hammered (the 2026-09-17 loop was one tab asking
 * for a dead playlist every few seconds for hours), and a genuinely dead source stops after a bounded
 * number of attempts.
 */

const NOW = 1_700_000_000_000;
const noSleep = () => Promise.resolve();

const network = (httpStatus: number | null, fatal = true) =>
  ({ kind: 'network', fatal, httpStatus } as const);

function recovery(config?: Partial<SourceRefreshConfig>, now = NOW) {
  const full = config ? ({ refresh: async () => 'fresh', ...config } as SourceRefreshConfig) : undefined;
  return new SourceRecovery(full, () => now, noSleep);
}

function types(actions: FailureAction[]) {
  return actions.map(a => a.type);
}

let onLine: boolean;
beforeEach(() => {
  onLine = true;
  if (typeof (global as any).navigator === 'undefined') (global as any).navigator = {};
  Object.defineProperty((global as any).navigator, 'onLine', { configurable: true, get: () => onLine });
});

describe('without a refresher (Kinescope, a plain url)', () => {
  test('a non-fatal error is ignored', () => {
    expect(recovery().classify(network(404, false))).toEqual({ type: 'ignore' });
  });

  test('a definitive status is retried twice, paced, then the player gives up', () => {
    const r = recovery();
    const actions = [1, 2, 3, 4].map(() => r.classify(network(404)));
    expect(types(actions)).toEqual(['retry', 'retry', 'fail', 'fail']);
    expect((actions[0] as any).delayMs).toBe(1000);
    expect((actions[1] as any).delayMs).toBe(2000);
    expect(r.hasGivenUp).toBe(true);
  });

  test('offline is retried forever, with the delay doubling up to 30 s', () => {
    onLine = false;
    const r = recovery();
    const delays = Array.from({ length: 8 }, () => r.classify(network(0))).map(a => (a as any).delayMs);
    expect(delays).toEqual([1000, 2000, 4000, 8000, 16000, 30000, 30000, 30000]);
    expect(r.hasGivenUp).toBe(false);
  });

  test('a 5xx is retried, paced, and never gives up', () => {
    const r = recovery();
    const actions = Array.from({ length: 5 }, () => r.classify(network(503)));
    expect(types(actions)).toEqual(['retry', 'retry', 'retry', 'retry', 'retry']);
  });

  test('a media error is recovered three times, then the player gives up', () => {
    const r = recovery();
    const actions = [1, 2, 3, 4].map(() => r.classify({ kind: 'media', fatal: true }));
    expect(types(actions)).toEqual(['recoverMedia', 'recoverMedia', 'recoverMedia', 'fail']);
  });

  test('anything else fatal fails at once', () => {
    expect(recovery().classify({ kind: 'other', fatal: true })).toEqual({ type: 'fail' });
  });

  test('a played fragment resets the budget', () => {
    const r = recovery();
    r.classify(network(404));
    r.classify(network(404));
    r.markRecovered();
    expect(types([r.classify(network(404))])).toEqual(['retry']);
  });

  test('play never waits for a refresh', () => {
    expect(recovery().shouldRefreshBeforePlay()).toBe(false);
  });
});

describe('with a refresher (the platform HLS proxy)', () => {
  test('a dead url is refreshed, twice at most, then the player gives up', () => {
    const r = recovery({});
    const actions = [1, 2, 3].map(() => r.classify(network(404)));
    expect(types(actions)).toEqual(['refresh', 'refresh', 'fail']);
    expect(r.canRefresh).toBe(false);
  });

  test('403 on a segment and 401/410 count as dead urls too', () => {
    [403, 401, 410, 400].forEach(status => {
      expect(recovery({}).classify(network(status))).toEqual({ type: 'refresh', reason: 'error' });
    });
  });

  test('a status-less failure while online is a dead url (a CORS-blocked 403 arrives as 0)', () => {
    expect(recovery({}).classify(network(0))).toEqual({ type: 'refresh', reason: 'error' });
    expect(recovery({}).classify(network(null))).toEqual({ type: 'refresh', reason: 'error' });
  });

  test('offline still retries the same url instead of spending the refresh budget', () => {
    onLine = false;
    expect(recovery({}).classify(network(0))).toEqual({ type: 'retry', delayMs: 1000 });
  });

  test('a 5xx is not refreshed — the url is fine, the server is not', () => {
    expect(recovery({}).classify(network(502))).toEqual({ type: 'retry', delayMs: 1000 });
  });

  test('the reason says "expired" once the grant is past', () => {
    const r = recovery({ expiresAt: NOW - 1 });
    expect(r.classify(network(404))).toEqual({ type: 'refresh', reason: 'expired' });
  });

  test('a played fragment restores the reload budget', () => {
    const r = recovery({});
    r.classify(network(404));
    r.classify(network(404));
    r.markRecovered();
    expect(r.classify(network(404))).toEqual({ type: 'refresh', reason: 'error' });
  });

  test('maxAttempts is the reload budget', () => {
    const r = recovery({ maxAttempts: 1 });
    expect(types([r.classify(network(404)), r.classify(network(404))])).toEqual(['refresh', 'fail']);
  });
});

describe('expiry', () => {
  test('unknown expiry never asks for a refresh before play', () => {
    expect(recovery({}).shouldRefreshBeforePlay()).toBe(false);
    expect(recovery({ expiresAt: null }).isExpired()).toBe(false);
  });

  test('a grant is treated as expired one minute before its end', () => {
    expect(recovery({ expiresAt: NOW + 61_000 }).shouldRefreshBeforePlay()).toBe(false);
    expect(recovery({ expiresAt: NOW + 59_000 }).shouldRefreshBeforePlay()).toBe(true);
    expect(recovery({ expiresAt: NOW - 3_600_000 }).shouldRefreshBeforePlay()).toBe(true);
  });

  test('a fresh url brings its own expiry', async () => {
    const r = recovery({ expiresAt: NOW - 1, refresh: async () => ({ src: 'fresh', expiresAt: NOW + 3_600_000 }) });
    expect(r.isExpired()).toBe(true);
    await r.refreshSource('expired');
    expect(r.expiry).toBe(NOW + 3_600_000);
    expect(r.isExpired()).toBe(false);
  });
});

describe('refreshSource', () => {
  test('a bare string is a source with unknown expiry', async () => {
    const r = recovery({ expiresAt: NOW - 1 });
    expect(await r.refreshSource('expired')).toEqual({ src: 'fresh' });
    expect(r.expiry).toBeNull();
  });

  test('null from the host is final: the player gives up and play no longer waits', async () => {
    const r = recovery({ expiresAt: NOW - 1, refresh: async () => null });
    expect(await r.refreshSource('expired')).toBeNull();
    expect(r.hasGivenUp).toBe(true);
    expect(r.canRefresh).toBe(false);
    expect(r.shouldRefreshBeforePlay()).toBe(false);
    expect(r.classify(network(404))).toEqual({ type: 'fail' });
  });

  test('a rejection is retried twice before giving up', async () => {
    let calls = 0;
    const r = recovery({ refresh: async () => { calls += 1; throw new Error('offline'); } });
    expect(await r.refreshSource('error')).toBeNull();
    expect(calls).toBe(3);
    expect(r.hasGivenUp).toBe(true);
  });

  test('a rejection followed by success is a success', async () => {
    let calls = 0;
    const r = recovery({ refresh: async () => { calls += 1; if (calls < 2) throw new Error('blip'); return 'fresh'; } });
    expect(await r.refreshSource('error')).toEqual({ src: 'fresh' });
    expect(r.hasGivenUp).toBe(false);
  });

  test('concurrent callers share one request', async () => {
    let calls = 0;
    let resolve: (value: SourceRefreshResult) => void = () => undefined;
    const r = recovery({ refresh: () => { calls += 1; return new Promise<SourceRefreshResult>(res => { resolve = res; }); } });
    const a = r.refreshSource('error');
    const b = r.refreshSource('error');
    resolve({ src: 'fresh' });
    expect(await a).toEqual({ src: 'fresh' });
    expect(await b).toEqual({ src: 'fresh' });
    expect(calls).toBe(1);
  });
});

describe('prefetch on becoming visible', () => {
  test('fetches only when the grant is past and nothing is playing', async () => {
    let calls = 0;
    const live = recovery({ expiresAt: NOW + 3_600_000, refresh: async () => { calls += 1; return 'fresh'; } });
    expect(await live.prefetchIfDue(false)).toBe(false);
    const expired = recovery({ expiresAt: NOW - 1, refresh: async () => { calls += 1; return 'fresh'; } });
    expect(await expired.prefetchIfDue(true)).toBe(false);
    expect(calls).toBe(0);
    expect(await expired.prefetchIfDue(false)).toBe(true);
    expect(calls).toBe(1);
    expect(expired.hasPending).toBe(true);
  });

  test('the prefetched url is handed out without a second request, and only once', async () => {
    let calls = 0;
    const r = recovery({ expiresAt: NOW - 1, refresh: async () => { calls += 1; return { src: `fresh-${calls}` }; } });
    await r.prefetchIfDue(false);
    expect(r.shouldRefreshBeforePlay()).toBe(true);
    expect(await r.refreshSource('expired')).toEqual({ src: 'fresh-1' });
    expect(r.hasPending).toBe(false);
    expect(await r.refreshSource('expired')).toEqual({ src: 'fresh-2' });
    expect(calls).toBe(2);
  });

  test('a network failure while prefetching costs nothing', async () => {
    let calls = 0;
    const r = recovery({ expiresAt: NOW - 1, refresh: async () => { calls += 1; if (calls === 1) throw new Error('waking up'); return 'fresh'; } });
    expect(await r.prefetchIfDue(false)).toBe(false);
    expect(r.hasGivenUp).toBe(false);
    expect(r.canRefresh).toBe(true);
    expect(await r.refreshSource('expired')).toEqual({ src: 'fresh' });
  });

  test('a refusal while prefetching is final', async () => {
    const r = recovery({ expiresAt: NOW - 1, refresh: async () => null });
    expect(await r.prefetchIfDue(false)).toBe(false);
    expect(r.hasGivenUp).toBe(true);
  });
});
