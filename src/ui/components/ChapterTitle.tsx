import cx from 'classnames';
import React from 'react';
import { IInfo } from '../types';
import { withState } from '../withState';

interface ChapterTitleProps {
  title: string | null;
  panelOpen: boolean;
  tooltip: string;
  toggleChaptersPanel();
}

/**
 * The chapter playing now, beside the time — «• Intro ›» — the way YouTube shows it. A click opens the chapters panel. Renders
 * nothing without chapters.
 */
export const ChapterTitle = withState((props: ChapterTitleProps) => {
  if (!props.title) {
    return null;
  }

  return (
    <button
      type='button'
      className={cx('igui_chapter_title', {
        'igui_chapter_title_state-open': props.panelOpen,
      })}
      onClick={props.toggleChaptersPanel}
      title={props.tooltip}
    >
      <span className='igui_chapter_title_dot'>•</span>
      <span className='igui_chapter_title_text'>{props.title}</span>
      <span className='igui_chapter_title_chevron' aria-hidden='true'>›</span>
    </button>
  );
}, mapProps);

function mapProps(info: IInfo): ChapterTitleProps {
  return {
    title: info.data.activeChapterTitle,
    panelOpen: info.data.chaptersPanelOpen,
    tooltip: info.data.getTranslation('Chapters'),
    toggleChaptersPanel: info.actions.toggleChaptersPanel,
  };
}
