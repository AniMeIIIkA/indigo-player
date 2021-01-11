
import * as React from 'react';
import { IThumbnail } from '../../types';
import { IInfo } from '../types';
import { withState } from '../withState';
import { Icon } from './Icon';
import { Sprite } from './Sprite';

interface CenterProps {
  seekingThumbnail?: IThumbnail | null;
  playOrPause();
  seekToBackward();
  seekToForward();
  toggleFullscreen();
}

export const Center = withState((props: CenterProps) => {
  return (
    <div
      className='igui_center'
      onClick={props.playOrPause}
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
    seekToBackward: () => info.actions.seekToBackward(15),
    seekToForward: () => info.actions.seekToForward(15),
    seekingThumbnail: info.data.isSeekbarSeeking
      ? info.data.activeThumbnail
      : null,
    toggleFullscreen: info.actions.toggleFullscreen,
  };
}
