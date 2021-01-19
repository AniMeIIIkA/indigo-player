
import * as React from 'react';
import { SKIP_CURRENTTIME_OFFSET } from '../../extensions/KeyboardNavigationExtension/KeyboardNavigationExtension';
import { IThumbnail } from '../../types';
import { IInfo } from '../types';
import { withState } from '../withState';
import { Sprite } from './Sprite';

interface CenterProps {
  seekingThumbnail?: IThumbnail | null;
  playOrPause();
  seekToBackward();
  seekToForward();
  toggleFullscreen();
}

let clicksCount = 0;

export const Center = withState((props: CenterProps) => {  
  const delayedClick = (event: () => void) => {    
    clicksCount++;
    const timeout = setTimeout(() => {      
      if (clicksCount == 1) {
        event();
      }      
      clearTimeout(timeout);
      clicksCount = 0;
    }, 170);
  }

  return (
    <div
      className='igui_center'
      onClick={(e) => {
        delayedClick(() => {
          props.playOrPause();
        });
      }}
      onDoubleClick={props.toggleFullscreen}
    >
      <div className='igui_center_region_backward'
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.seekToBackward();
        }}>
      </div>
      {!!props.seekingThumbnail && (
        <Sprite className='igui_center_preview' {...props.seekingThumbnail} />
      )}
      <div className='igui_center_region_forward'
          onDoubleClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            props.seekToForward();
          }}>
      </div>
    </div>
  );
}, mapProps);

function mapProps(info: IInfo): CenterProps {
  return {
    playOrPause: () => info.actions.playOrPause('center'),
    seekToBackward: () => info.actions.seekToBackward(SKIP_CURRENTTIME_OFFSET),
    seekToForward: () => info.actions.seekToForward(SKIP_CURRENTTIME_OFFSET),
    seekingThumbnail: info.data.isSeekbarSeeking
      ? info.data.activeThumbnail
      : null,
    toggleFullscreen: info.actions.toggleFullscreen,
  };
}
