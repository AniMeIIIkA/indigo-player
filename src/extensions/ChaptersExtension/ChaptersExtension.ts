import { Module } from '../../Module';
import { Events, IChaptersChangeEventData } from '../../types';
import { IInstance } from '../../types/IInstance';
import { StateExtension } from '../StateExtension/StateExtension';
import {
  Chapter,
  nextChapterTime,
  previousChapterTime,
  resolveChapters,
  ResolvedChapter,
} from './chapters';

/**
 * YouTube-style chapters of the current video (2026-09-24). Holds the list the host gave (`config.chapters`, replaced live through
 * `setChapters`), answers which chapter is playing and jumps to the previous / next one. The UI draws them (segmented seekbar, chapter
 * title in the controls, the chapters panel) from the `UI_CHAPTERS_CHANGE` event and from `getChapters()`.
 *
 * The list is taken as-is: filtering (switched off, past the end of this version) is the host's job — the platform's server sends
 * exactly the chapters a viewer should see. This module only drops what cannot be placed on the timeline.
 */
export class ChaptersExtension extends Module {
  public name: string = 'ChaptersExtension';

  private chapters: Chapter[];

  constructor(instance: IInstance) {
    super(instance);
    this.chapters = instance.config.chapters || [];
  }

  public setChapters(chapters: Chapter[] | null | undefined) {
    this.chapters = chapters || [];
    this.emit(Events.UI_CHAPTERS_CHANGE, {
      chapters: this.chapters,
    } as IChaptersChangeEventData);
  }

  public getRawChapters(): Chapter[] {
    return this.chapters;
  }

  /** The chapters placed on the current duration; empty until the duration is known. */
  public getChapters(): ResolvedChapter[] {
    return resolveChapters(this.chapters, this.getState().duration || 0);
  }

  public hasChapters(): boolean {
    return this.getChapters().length > 0;
  }

  /** Jumps to the previous chapter (or to the start of the current one when well into it). False when there are no chapters. */
  public seekToPrevious(): boolean {
    const time = previousChapterTime(this.getChapters(), this.getState().currentTime || 0);
    if (time === null) {
      return false;
    }
    this.instance.seekTo(time);
    return true;
  }

  /** Jumps to the next chapter. False in the last chapter or without chapters. */
  public seekToNext(): boolean {
    const time = nextChapterTime(this.getChapters(), this.getState().currentTime || 0);
    if (time === null) {
      return false;
    }
    this.instance.seekTo(time);
    return true;
  }

  private getState() {
    const state = this.instance.getModule('StateExtension') as StateExtension;
    return state ? state.getState() : ({} as any);
  }
}
