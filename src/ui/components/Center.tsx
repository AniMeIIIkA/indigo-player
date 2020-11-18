
import * as React from 'react';
import { IThumbnail } from '../../types';
import { IInfo } from '../types';
import { withState } from '../withState';
import { Sprite } from './Sprite';

interface CenterProps {
  seekingThumbnail?: IThumbnail | null;
  playOrPause();
  toggleFullscreen();
}

export const Center = withState((props: CenterProps) => {
  return (
    <div
      className='igui_center'
      onClick={props.playOrPause}
      onDoubleClick={props.toggleFullscreen}
    >
      {!!props.seekingThumbnail && (
        <Sprite className='igui_center_preview' {...props.seekingThumbnail} />
      )}
    </div>
  );
}, mapProps);

function mapProps(info: IInfo): CenterProps {
  return {
    playOrPause: () => info.actions.playOrPause('center'),
    seekingThumbnail: info.data.isSeekbarSeeking
      ? info.data.activeThumbnail
      : null,
    toggleFullscreen: info.actions.toggleFullscreen,
  };
}
