/**
 * @jest-environment node
 *
 * Node, not jsdom: the package's jsdom needs the optional `canvas` native module, which has no prebuilt binary for Node 22 (see
 * client/CLAUDE.md) — and the chapter math has no DOM anyway.
 */
import {
  CHAPTER_GAP_PX,
  chapterIndexAt,
  layoutSegments,
  nextChapterTime,
  positionToTime,
  previousChapterTime,
  resolveChapters,
  segmentFill,
  timeToPosition,
} from '../src/extensions/ChaptersExtension/chapters';

/**
 * YouTube-style chapters, the pure half. The facts it pins: a chapter lasts until the next one starts and the first starts at 0; a
 * single chapter is no chapters; and the pointer-to-time mapping of the cut seekbar agrees with what the browser draws (flex +
 * gap), so a click lands where the viewer pointed and the scrubber sits where the video is.
 */

const raw = [
  { title: 'Intro', startSec: 0 },
  { title: 'Setup', startSec: 30 },
  { title: 'Demo', startSec: 60 },
];

describe('resolveChapters', () => {
  test('each chapter ends where the next begins, the last at the duration', () => {
    const chapters = resolveChapters(raw, 100);
    expect(chapters).toEqual([
      { index: 0, title: 'Intro', start: 0, end: 30 },
      { index: 1, title: 'Setup', start: 30, end: 60 },
      { index: 2, title: 'Demo', start: 60, end: 100 },
    ]);
  });

  test('sorts, pulls the first chapter to 0 and trims titles', () => {
    const chapters = resolveChapters(
      [
        { title: ' Demo ', startSec: 60 },
        { title: 'Intro', startSec: 5 },
        { title: 'Setup', startSec: 30 },
      ],
      100,
    );
    expect(chapters.map(c => [c.title, c.start, c.end])).toEqual([
      ['Intro', 0, 30],
      ['Setup', 30, 60],
      ['Demo', 60, 100],
    ]);
  });

  test('drops chapters past the end, invalid ones and duplicates of a start', () => {
    const chapters = resolveChapters(
      [
        { title: 'Intro', startSec: 0 },
        { title: 'Same start', startSec: 0 },
        { title: '', startSec: 10 },
        { title: 'NaN', startSec: NaN },
        { title: 'Negative', startSec: -5 },
        { title: 'Middle', startSec: 50 },
        { title: 'At the end', startSec: 100 },
        { title: 'Past the end', startSec: 150 },
      ] as any,
      100,
    );
    expect(chapters.map(c => c.title)).toEqual(['Intro', 'Middle']);
  });

  test('fewer than two chapters is no chapters', () => {
    expect(resolveChapters([{ title: 'Only', startSec: 0 }], 100)).toEqual([]);
    expect(resolveChapters([{ title: 'Intro', startSec: 0 }, { title: 'Late', startSec: 200 }], 100)).toEqual([]);
  });

  test('nothing can be placed before the duration is known', () => {
    expect(resolveChapters(raw, 0)).toEqual([]);
    expect(resolveChapters(raw, NaN)).toEqual([]);
    expect(resolveChapters(null, 100)).toEqual([]);
  });
});

describe('chapterIndexAt / previous / next', () => {
  const chapters = resolveChapters(raw, 100);

  test('finds the chapter playing at a moment', () => {
    expect(chapterIndexAt(chapters, 0)).toBe(0);
    expect(chapterIndexAt(chapters, 29.9)).toBe(0);
    expect(chapterIndexAt(chapters, 30)).toBe(1);
    expect(chapterIndexAt(chapters, 99)).toBe(2);
    expect(chapterIndexAt([], 10)).toBe(-1);
  });

  test('previous restarts the current chapter when well into it, else goes one back', () => {
    expect(previousChapterTime(chapters, 45)).toBe(30);
    expect(previousChapterTime(chapters, 31)).toBe(0);
    expect(previousChapterTime(chapters, 2)).toBe(0);
    expect(previousChapterTime([], 10)).toBeNull();
  });

  test('next goes to the next start, and nowhere from the last chapter', () => {
    expect(nextChapterTime(chapters, 10)).toBe(30);
    expect(nextChapterTime(chapters, 30)).toBe(60);
    expect(nextChapterTime(chapters, 70)).toBeNull();
  });
});

describe('the cut seekbar', () => {
  const chapters = resolveChapters(raw, 100);
  // 204 px: two 2px gaps leave 200 px shared 30 : 30 : 40.
  const width = 200 + 2 * CHAPTER_GAP_PX;
  const segments = layoutSegments(chapters, 100, width);

  test('lays segments out like flex-grow with a gap', () => {
    expect(segments.map(s => [s.left, s.width])).toEqual([
      [0, 60],
      [62, 60],
      [124, 80],
    ]);
    const last = segments[segments.length - 1];
    expect(last.left + last.width).toBe(width);
  });

  test('maps a pointer inside a segment linearly to time', () => {
    expect(positionToTime(segments, 0, 100)).toBe(0);
    expect(positionToTime(segments, 30, 100)).toBe(15);
    expect(positionToTime(segments, 92, 100)).toBe(45);
    expect(positionToTime(segments, 164, 100)).toBe(80);
    expect(positionToTime(segments, width, 100)).toBe(100);
  });

  test('a pointer in a gap reads as the start of the next chapter', () => {
    expect(positionToTime(segments, 61, 100)).toBe(30);
    expect(positionToTime(segments, 123, 100)).toBe(60);
  });

  test('time and position are inverse inside the segments', () => {
    [0, 10, 29.5, 30, 45, 60, 75, 100].forEach(time => {
      expect(positionToTime(segments, timeToPosition(segments, time), 100)).toBeCloseTo(time, 6);
    });
  });

  test('the scrubber sits past the gaps it has crossed', () => {
    expect(timeToPosition(segments, 30)).toBe(62);
    expect(timeToPosition(segments, 60)).toBe(124);
    expect(timeToPosition(segments, 100)).toBe(width);
  });

  test('nothing to lay out without width, duration or chapters', () => {
    expect(layoutSegments(chapters, 100, 0)).toEqual([]);
    expect(layoutSegments(chapters, 0, 200)).toEqual([]);
    expect(layoutSegments([], 100, 200)).toEqual([]);
  });

  test('segment fill is the share of the chapter a moment has covered', () => {
    const [, setup] = chapters;
    expect(segmentFill(setup, 10)).toBe(0);
    expect(segmentFill(setup, 45)).toBe(0.5);
    expect(segmentFill(setup, 90)).toBe(1);
  });
});
