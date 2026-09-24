
import cx from 'classnames';
import * as React from 'react';
import { ViewTypes, IInfo } from '../types';
import { withState } from '../withState';
import { ControlsView } from './ControlsView';
import { ErrorView } from './ErrorView';
import { LoadingView } from './LoadingView';
import { StartView } from './StartView';

/** Below this width the control row cannot hold every button (px). */
const SMALL_PLAYER_WIDTH = 560;
/** Below this the current chapter's title has no room left beside the time either. */
const TINY_PLAYER_WIDTH = 400;

interface MainProps {
  view: ViewTypes;
  isMobile: boolean;
  playerWidth: number;
  visibleControls: boolean;
  isPip: boolean;
  isFullscreen: boolean;
  getTranslation(text: string): string;
}

export const Main = withState(
  (props: MainProps) => (
    <div
      className={cx('igui', {
        'igui_state-active': props.visibleControls,
        'igui_state-mobile': props.isMobile,
        'igui_state-pip': props.isPip,
        'igui_state-fullscreen': props.isFullscreen,
        // A narrow player: the row drops the skips and the miniplayer, a tiny one the chapter title too (see view-controls.scss).
        'igui_size-small': props.playerWidth > 0 && props.playerWidth < SMALL_PLAYER_WIDTH,
        'igui_size-tiny': props.playerWidth > 0 && props.playerWidth < TINY_PLAYER_WIDTH,
      })}
    >
      {props.view === ViewTypes.ERROR && <ErrorView />}
      {props.view === ViewTypes.LOADING && <LoadingView />}
      {props.view === ViewTypes.START && <StartView />}
      {props.view === ViewTypes.CONTROLS && <ControlsView />}
    </div>
  ),
  mapProps,
);

function mapProps(info: IInfo): MainProps {
  return {
    view: info.data.view,
    isMobile: info.data.isMobile,
    playerWidth: info.data.playerWidth,
    visibleControls: info.data.visibleControls,
    isPip: info.data.pip,
    isFullscreen: info.data.isFullscreen,
    getTranslation: info.data.getTranslation,
  };
}
