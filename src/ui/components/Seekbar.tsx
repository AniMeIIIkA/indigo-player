import cx from 'classnames';
import React from 'react';
import { IThumbnail } from '../../types';
import { seekbarRef, seekbarThumbnailRef, seekbarTooltipRef } from '../State';
import { IChapterSegmentData, IInfo } from '../types';
import { useSlider } from '../utils/useSlider';
import { withState } from '../withState';
import { Sprite } from './Sprite';

interface SeekbarProps {
  isActive: boolean;
  adBreakData: any;
  seekbarThumbnailPercentage: number;
  activeThumbnail?: IThumbnail;
  seekbarTooltipPercentage: number;
  seekbarTooltipText: string;
  seekbarTooltipChapter: string | null;
  progressPercentage: number;
  scrubberPercentage: number;
  bufferedPercentage: number;
  seekbarPercentage: number;
  showSeekAhead: boolean;
  showCuepoints: boolean;
  cuePoints: number[];
  chapterSegments: IChapterSegmentData[];
  setSeekbarState(state: any);
}

/**
 * The progress bar. Without chapters it is one bar; with chapters it is cut into one segment per chapter (YouTube style): a small
 * gap between segments, each with its own played / buffered / hover fill, the segment under the pointer drawn thicker and its title
 * shown above the time in the tooltip.
 */
export const Seekbar = withState((props: SeekbarProps) => {
  useSlider(seekbarRef.current as HTMLElement, props.setSeekbarState);
  const hasChapters = props.chapterSegments.length > 0;

  return (
    <div
      className={cx('igui_seekbar', {
        'igui_seekbar_state-active': props.isActive,
        'igui_seekbar_state-playingad': !!props.adBreakData,
        'igui_seekbar_state-chapters': hasChapters,
        'igui_seekbar_state-tooltipchapter': !!props.seekbarTooltipChapter,
      })}
      ref={seekbarRef}
    >
      <div
        ref={seekbarThumbnailRef}
        className='igui_seekbar_thumbnail'
        style={{ left: `${props.seekbarThumbnailPercentage * 100}%` }}
      >
        {!!props.activeThumbnail && (
          <Sprite
            className='igui_seekbar_thumbnail_sprite'
            {...props.activeThumbnail}
          />
        )}
      </div>
      <div
        ref={seekbarTooltipRef}
        className={cx('igui_seekbar_tooltip', {
          'igui_seekbar_tooltip-chapter': !!props.seekbarTooltipChapter,
        })}
        style={{ left: `${props.seekbarTooltipPercentage * 100}%` }}
      >
        {!!props.seekbarTooltipChapter && (
          <span className='igui_seekbar_tooltip_chapter'>{props.seekbarTooltipChapter}</span>
        )}
        <span className='igui_seekbar_tooltip_time'>{props.seekbarTooltipText}</span>
      </div>
      <div
        className='igui_seekbar_scrubber'
        style={{ left: `${props.scrubberPercentage * 100}%` }}
      />
      {hasChapters ? (
        <div className='igui_seekbar_chapters'>
          {props.chapterSegments.map(segment => (
            <div
              key={segment.index}
              className={cx('igui_seekbar_chapter', {
                'igui_seekbar_chapter-hover': segment.hovered,
              })}
              style={{ flexGrow: segment.length }}
            >
              <div
                className='igui_seekbar_buffered'
                style={{ transform: `scaleX(${segment.buffered})` }}
              />
              {props.showSeekAhead && segment.ahead > 0 && (
                <div
                  className='igui_seekbar_ahead'
                  style={{ transform: `scaleX(${segment.ahead})` }}
                />
              )}
              <div
                className='igui_seekbar_progress'
                style={{ transform: `scaleX(${segment.progress})` }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className='igui_seekbar_bars'>
          <div
            className='igui_seekbar_buffered'
            style={{ transform: `scaleX(${props.bufferedPercentage})` }}
          />
          {props.showSeekAhead && (
            <div
              className='igui_seekbar_ahead'
              style={{ transform: `scaleX(${props.seekbarPercentage})` }}
            />
          )}
          <div
            className='igui_seekbar_progress'
            style={{ transform: `scaleX(${props.progressPercentage})` }}
          />
          {props.showCuepoints && (
            <div className='igui_seekbar_cuepoints'>
              {props.cuePoints.map(cuePoint => (
                <div
                  key={cuePoint}
                  className='igui_seekbar_cuepoint'
                  style={{ left: `${cuePoint * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}, mapProps);

function mapProps(info: IInfo): SeekbarProps {
  return {
    setSeekbarState: info.actions.setSeekbarState,
    isActive: info.data.isSeekbarHover || info.data.isSeekbarSeeking,
    adBreakData: info.data.adBreakData,
    seekbarThumbnailPercentage: info.data.seekbarThumbnailPercentage,
    seekbarTooltipPercentage: info.data.seekbarTooltipPercentage,
    seekbarTooltipText: info.data.seekbarTooltipText,
    seekbarTooltipChapter: info.data.seekbarTooltipChapter,
    progressPercentage: info.data.progressPercentage,
    scrubberPercentage: info.data.scrubberPercentage,
    activeThumbnail: info.data.activeThumbnail,
    bufferedPercentage: info.data.bufferedPercentage,
    seekbarPercentage: info.data.seekbarPercentage,
    showSeekAhead: info.data.isSeekbarHover && !info.data.isSeekbarSeeking,
    showCuepoints: !info.data.adBreakData && !!info.data.cuePoints.length,
    cuePoints: info.data.cuePoints,
    chapterSegments: info.data.chapterSegments,
  };
}
