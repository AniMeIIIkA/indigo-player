
import cx from 'classnames';
import React, { useEffect } from 'react';
import { IThumbnail } from '../../types';
import { seekbarRef, seekbarThumbnailRef, seekbarTooltipRef } from '../State';
import { IInfo } from '../types';
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
  progressPercentage: number;
  bufferedPercentage: number;
  seekbarPercentage: number;
  showSeekAhead: boolean;
  showCuepoints: boolean;
  cuePoints: number[];
  setSeekbarState(state: any);
}

export const Seekbar = withState((props: SeekbarProps) => {
  useSlider(seekbarRef.current as HTMLElement, props.setSeekbarState);

  return (
    <div
      className={cx('igui_seekbar', {
        'igui_seekbar_state-active': props.isActive,
        'igui_seekbar_state-playingad': !!props.adBreakData,
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
        className='igui_seekbar_tooltip'
        style={{ left: `${props.seekbarTooltipPercentage * 100}%` }}
      >
        {props.seekbarTooltipText}
      </div>
      <div
        className='igui_seekbar_scrubber'
        style={{ left: `${props.progressPercentage * 100}%` }}
      />
      <div className='igui_seekbar_bars'>
        <div
          className='igui_seekbar_buffered'
          style={{ transform: `scaleX(${props.bufferedPercentage})` }}
        />
        <div
          className='igui_seekbar_progress'
          style={{ transform: `scaleX(${props.progressPercentage})` }}
        />
        {props.showSeekAhead && (
          <div
            className='igui_seekbar_ahead'
            style={{ transform: `scaleX(${props.seekbarPercentage})` }}
          />
        )}
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
    progressPercentage: info.data.progressPercentage,
    activeThumbnail: info.data.activeThumbnail,
    bufferedPercentage: info.data.bufferedPercentage,
    seekbarPercentage: info.data.seekbarPercentage,
    showSeekAhead: info.data.isSeekbarHover && !info.data.isSeekbarSeeking,
    showCuepoints: !info.data.adBreakData && !!info.data.cuePoints.length,
    cuePoints: info.data.cuePoints,
  };
}
