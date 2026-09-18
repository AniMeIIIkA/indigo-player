/**
 * Calls `onVisible` every time the page comes back into view — the tab is switched to, the window
 * is focused, the page is restored from the back/forward cache. Returns the disposer.
 *
 * Used by the media modules to prefetch a fresh source url the moment a student returns to a lesson
 * whose playback grant expired while they were away: no timer runs in a hidden or idle tab.
 */
export function watchVisibility(onVisible: () => void): () => void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return () => undefined;

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') onVisible();
  };
  const onFocus = () => onVisible();
  const onPageShow = () => onVisible();

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('focus', onFocus);
  window.addEventListener('pageshow', onPageShow);

  return () => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('pageshow', onPageShow);
  };
}
