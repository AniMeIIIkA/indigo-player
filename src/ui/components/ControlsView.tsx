
import * as React from 'react';
import { SKIP_CURRENTTIME_OFFSET } from '../../extensions/KeyboardNavigationExtension/KeyboardNavigationExtension';
import { IInfo, SettingsTabs } from '../types';
import { withState } from '../withState';
import { Button } from './Button';
import { Center } from './Center';
import { Nod } from './Nod';
import { Rebuffer } from './Rebuffer';
import { Seekbar } from './Seekbar';
import { Settings } from './Settings';
import { TimeStat } from './TimeStat';
import { VolumeButton } from './VolumeButton';

interface ControlsViewProps {
  isCenterClickAllowed: boolean;
  showRebuffer: boolean;
  playIcon: string;
  playTooltipText: string;
  seekToBackwardIcon: string;
  seekToBackwardTooltipText: string;
  seekToForwardIcon: string;
  seekToForwardTooltipText: string;
  showSubtitlesToggle: boolean;
  isSubtitleActive: boolean;
  subtitleToggleTooltipText: string;
  showPip: boolean;
  pipTooltipText: string;
  settingsTooltipText: string;
  fullscreenIcon: string;
  isFullscreenSupported: boolean;
  fullscreenTooltipText: string;
  isSettingsTabActive: boolean;
  playOrPause();
  seekToBackward();
  seekToForward();
  toggleActiveSubtitle();
  togglePip();
  toggleSettings();
  toggleFullscreen();
}

export const ControlsView = withState((props: ControlsViewProps) => {  
  return (
    <>
      <Nod />
      <Settings />
      {props.isCenterClickAllowed && <Center />}
      {props.showRebuffer && <Rebuffer />}
      <div className="igui_container_controls">
        <Button
          name="backward"
          icon={props.seekToBackwardIcon}
          onClick={props.seekToBackward}
          tooltip={props.seekToBackwardTooltipText}
        />
        <Button
          name="play"
          icon={props.playIcon}
          onClick={props.playOrPause}
          tooltip={props.playTooltipText}
        />
        <Button
          name="forward"
          icon={props.seekToForwardIcon}
          onClick={props.seekToForward}
          tooltip={props.seekToForwardTooltipText}
        />
        <VolumeButton />
        <TimeStat />
        <div className="igui_container_controls_seekbar">
          <Seekbar />
        </div>
        {props.showSubtitlesToggle && (
          <Button
            name="subtitle"
            icon="cc"
            onClick={props.toggleActiveSubtitle}
            active={props.isSubtitleActive}
            tooltip={props.subtitleToggleTooltipText}
          />
        )}
        {props.showPip && (
          <Button
            name="pip"
            icon="pip"
            onClick={props.togglePip}
            tooltip={props.pipTooltipText}
          />
        )}
        <Button
          name="settings"
          icon="settings"
          onClick={() => props.toggleSettings()}
          tooltip={props.settingsTooltipText}
          active={props.isSettingsTabActive}
        />
        <Button
          name="fullscreen"
          icon={props.fullscreenIcon}
          onClick={props.toggleFullscreen}
          tooltip={props.fullscreenTooltipText}
          disabled={!props.isFullscreenSupported}
        />
      </div>
    </>
  );
}, mapProps);

function mapProps(info: IInfo): ControlsViewProps {
  const createTooltipText = (text: string, shortcut?: string) => {
    return `${info.data.getTranslation(text)} ${shortcut ? `(${shortcut})` : ''
      }`.trim();
  };

  return {
    isCenterClickAllowed: info.data.isCenterClickAllowed,
    isSettingsTabActive: info.data.settingsTab !== SettingsTabs.NONE,
    showRebuffer: info.data.rebuffering,
    playIcon: info.data.playRequested ? 'pause' : 'play',
    playOrPause: info.actions.playOrPause,
    seekToBackwardIcon: 'backward',
    seekToBackwardTooltipText: createTooltipText('Seek to backward', '←'),
    seekToForwardIcon: 'forward',
    seekToForwardTooltipText: createTooltipText('Seek to forward', '→'),
    seekToBackward: () => info.actions.seekToBackward(SKIP_CURRENTTIME_OFFSET),
    seekToForward: () => info.actions.seekToForward(SKIP_CURRENTTIME_OFFSET),
    playTooltipText: createTooltipText(
      info.data.playRequested ? 'Pause' : 'Play',
      'k',
    ),    
    showSubtitlesToggle: !!info.data.subtitles.length,
    isSubtitleActive: !!info.data.activeSubtitle,
    toggleActiveSubtitle: info.actions.toggleActiveSubtitle,
    subtitleToggleTooltipText: createTooltipText(
      !!info.data.activeSubtitle ? 'Disable subtitles' : 'Enable subtitles',
      'c',
    ),
    showPip: info.data.pipSupported && !info.data.pip,
    togglePip: info.actions.togglePip,
    pipTooltipText: createTooltipText('Miniplayer', 'i'),
    toggleSettings: info.actions.toggleSettings,
    settingsTooltipText: createTooltipText('Settings'),
    fullscreenIcon: !info.data.isFullscreen ? 'fullscreen' : 'fullscreen-exit',
    toggleFullscreen: info.actions.toggleFullscreen,
    isFullscreenSupported: info.data.fullscreenSupported,
    fullscreenTooltipText: createTooltipText(
      info.data.isFullscreen ? 'Exit full screen' : 'Full screen',
      'f',
    ),
  };
}
