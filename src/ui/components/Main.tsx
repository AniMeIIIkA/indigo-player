
import cx from 'classnames';
import * as React from 'react';
import { ViewTypes, IInfo } from '../types';
import { withState } from '../withState';
import { ControlsView } from './ControlsView';
import { ErrorView } from './ErrorView';
import { LoadingView } from './LoadingView';
import { StartView } from './StartView';

interface MainProps {
  view: ViewTypes;
  isMobile: boolean;
  visibleControls: boolean;
  isPip: boolean;
  isFullscreen: boolean;
}

export const Main = withState(
  (props: MainProps) => (
    <div
      className={cx('igui', {
        'igui_state-active': props.visibleControls,
        'igui_state-mobile': props.isMobile,
        'igui_state-pip': props.isPip,
        'igui_state-fullscreen': props.isFullscreen,
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
    visibleControls: info.data.visibleControls,
    isPip: info.data.pip,
    isFullscreen: info.data.isFullscreen,
  };
}
