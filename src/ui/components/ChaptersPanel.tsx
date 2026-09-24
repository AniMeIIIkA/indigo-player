import cx from 'classnames';
import React, { useEffect, useRef } from 'react';
import { ResolvedChapter } from '../../extensions/ChaptersExtension/chapters';
import { IInfo } from '../types';
import { secondsToHMS } from '../utils/secondsToHMS';
import { withState } from '../withState';
import { Icon } from './Icon';

interface ChaptersPanelProps {
  open: boolean;
  chapters: ResolvedChapter[];
  activeIndex: number;
  title: string;
  closeLabel: string;
  seekToChapter(index: number);
  closeChaptersPanel();
}

/**
 * The list of chapters over the right side of the video — the panel YouTube's embedded player opens from the chapter title. A click
 * plays from that chapter and closes the panel (it lies over the picture); the chapter playing now is marked and scrolled into view.
 */
export const ChaptersPanel = withState((props: ChaptersPanelProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!props.open || !listRef.current) {
      return;
    }
    const active = listRef.current.querySelector('.igui_chapters_item-active') as HTMLElement | null;
    if (active && typeof active.scrollIntoView === 'function') {
      active.scrollIntoView({ block: 'nearest' });
    }
  }, [props.open]);

  if (!props.open || !props.chapters.length) {
    return null;
  }

  return (
    <div className='igui_chapters' role='dialog' aria-label={props.title}>
      <div className='igui_chapters_header'>
        <span className='igui_chapters_title'>{props.title}</span>
        <button
          type='button'
          className='igui_chapters_close'
          onClick={props.closeChaptersPanel}
          aria-label={props.closeLabel}
          title={props.closeLabel}
        >
          <Icon icon='close' />
        </button>
      </div>
      <div className='igui_chapters_list' ref={listRef}>
        {props.chapters.map(chapter => (
          <button
            type='button'
            key={chapter.index}
            className={cx('igui_chapters_item', {
              'igui_chapters_item-active': chapter.index === props.activeIndex,
            })}
            onClick={() => props.seekToChapter(chapter.index)}
          >
            <span className='igui_chapters_item_index'>{chapter.index + 1}</span>
            <span className='igui_chapters_item_body'>
              <span className='igui_chapters_item_title'>{chapter.title}</span>
              <span className='igui_chapters_item_time'>{secondsToHMS(chapter.start)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}, mapProps);

function mapProps(info: IInfo): ChaptersPanelProps {
  return {
    open: info.data.chaptersPanelOpen,
    chapters: info.data.chapters,
    activeIndex: info.data.activeChapterIndex,
    title: info.data.getTranslation('Chapters'),
    closeLabel: info.data.getTranslation('Close'),
    seekToChapter: info.actions.seekToChapter,
    closeChaptersPanel: info.actions.closeChaptersPanel,
  };
}
