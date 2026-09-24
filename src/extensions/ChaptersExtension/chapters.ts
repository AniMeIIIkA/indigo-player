/**
 * YouTube-style chapters, the pure half (2026-09-24): a chapter has a start and a title and lasts until the next one starts; the
 * seekbar is cut into one segment per chapter with a small gap between segments. Everything here is arithmetic — no DOM, no state —
 * so it is tested on its own (`tests/Chapters.test.ts`).
 */

/** A chapter as the host hands it over. */
export interface Chapter {
  title: string;
  startSec: number;
}

/** A chapter placed on the timeline of a known duration. */
export interface ResolvedChapter {
  index: number;
  title: string;
  start: number;
  end: number;
}

/** A chapter's segment on the seekbar, in pixels. */
export interface ChapterSegment extends ResolvedChapter {
  left: number;
  width: number;
}

/** The gap between two segments, px — the same number the stylesheet uses (`$seekbar-chapter-gap`). */
export const CHAPTER_GAP_PX = 2;

/** Fewer chapters than this is no chapters: one chapter is just the video. */
export const MIN_CHAPTERS = 2;

/** "Previous chapter" restarts the current one when this far into it, like a music player's back button. */
export const RESTART_THRESHOLD_SEC = 3;

/**
 * The chapters that fit a video of `duration` seconds: sorted, the first pulled to 0, those starting at or past the end dropped, each
 * ending where the next begins. Invalid input (no title, not a number) is skipped. Returns [] when fewer than two remain — or when the
 * duration is not known yet, since without it nothing can be placed.
 */
export function resolveChapters(
  chapters: Chapter[] | null | undefined,
  duration: number,
): ResolvedChapter[] {
  if (!chapters || !chapters.length || !(duration > 0)) {
    return [];
  }

  const sorted = chapters
    .filter(
      chapter =>
        chapter &&
        typeof chapter.title === 'string' &&
        chapter.title.trim().length > 0 &&
        typeof chapter.startSec === 'number' &&
        isFinite(chapter.startSec) &&
        chapter.startSec >= 0 &&
        chapter.startSec < duration,
    )
    .slice()
    .sort((a, b) => a.startSec - b.startSec);

  const unique: Chapter[] = [];
  sorted.forEach(chapter => {
    if (!unique.length || chapter.startSec > unique[unique.length - 1].startSec) {
      unique.push(chapter);
    }
  });

  if (unique.length < MIN_CHAPTERS) {
    return [];
  }

  return unique.map((chapter, index) => ({
    index,
    title: chapter.title.trim(),
    start: index === 0 ? 0 : chapter.startSec,
    end: index + 1 < unique.length ? unique[index + 1].startSec : duration,
  }));
}

/** The chapter playing at `time`, -1 when there are none. */
export function chapterIndexAt(chapters: ResolvedChapter[], time: number): number {
  if (!chapters.length) {
    return -1;
  }
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (time >= chapters[i].start) {
      return i;
    }
  }
  return 0;
}

/** Where "previous chapter" goes from `time`: the start of the current one when well into it, else the start of the one before. */
export function previousChapterTime(chapters: ResolvedChapter[], time: number): number | null {
  const index = chapterIndexAt(chapters, time);
  if (index < 0) {
    return null;
  }
  if (time - chapters[index].start > RESTART_THRESHOLD_SEC || index === 0) {
    return chapters[index].start;
  }
  return chapters[index - 1].start;
}

/** Where "next chapter" goes from `time`; null in the last chapter. */
export function nextChapterTime(chapters: ResolvedChapter[], time: number): number | null {
  const index = chapterIndexAt(chapters, time);
  if (index < 0 || index + 1 >= chapters.length) {
    return null;
  }
  return chapters[index + 1].start;
}

/**
 * The segments on a seekbar `width` px wide. The gaps are taken out of the width first and the rest is shared in proportion to the
 * chapters' lengths — exactly what `display: flex; gap` does with `flex-grow: <length>` — so positions computed here match the DOM.
 */
export function layoutSegments(
  chapters: ResolvedChapter[],
  duration: number,
  width: number,
  gap: number = CHAPTER_GAP_PX,
): ChapterSegment[] {
  if (!chapters.length || !(duration > 0) || !(width > 0)) {
    return [];
  }
  const usable = Math.max(0, width - gap * (chapters.length - 1));
  return chapters.map(chapter => ({
    ...chapter,
    left: (chapter.start / duration) * usable + chapter.index * gap,
    width: ((chapter.end - chapter.start) / duration) * usable,
  }));
}

/**
 * A pointer at `x` px on the seekbar as a moment of the video. Inside a segment the time runs linearly; a pointer in a gap reads as
 * the boundary itself, so a click between two chapters lands exactly on the start of the next one.
 */
export function positionToTime(segments: ChapterSegment[], x: number, duration: number): number {
  if (!segments.length) {
    return 0;
  }
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (x < segment.left) {
      return segment.start;
    }
    if (x <= segment.left + segment.width) {
      const ratio = segment.width > 0 ? (x - segment.left) / segment.width : 0;
      return segment.start + ratio * (segment.end - segment.start);
    }
  }
  return duration;
}

/** A moment of the video as a position on the seekbar, px — where the scrubber is drawn. */
export function timeToPosition(segments: ChapterSegment[], time: number): number {
  if (!segments.length) {
    return 0;
  }
  const segment = segments[Math.max(0, chapterIndexAt(segments, time))];
  const length = segment.end - segment.start;
  const ratio = length > 0 ? Math.min(Math.max((time - segment.start) / length, 0), 1) : 0;
  return segment.left + ratio * segment.width;
}

/** How much of a segment a moment has covered, 0..1 — the fill of that segment's progress / buffer / hover bar. */
export function segmentFill(chapter: ResolvedChapter, time: number): number {
  const length = chapter.end - chapter.start;
  if (!(length > 0)) {
    return 0;
  }
  return Math.min(Math.max((time - chapter.start) / length, 0), 1);
}
