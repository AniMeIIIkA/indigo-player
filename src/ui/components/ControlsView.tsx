import * as React from 'react';
import { SKIP_CURRENTTIME_OFFSET } from '../../extensions/KeyboardNavigationExtension/KeyboardNavigationExtension';
import { IInfo, SettingsTabs } from '../types';
import { withState } from '../withState';
import { Button } from './Button';
import { Center } from './Center';
import { ChaptersPanel } from './ChaptersPanel';
import { ChapterTitle } from './ChapterTitle';
import { Nod } from './Nod';
import { Rebuffer } from './Rebuffer';
import { Seekbar } from './Seekbar';
import { Settings } from './Settings';
import { TimeStat } from './TimeStat';
import { VolumeButton } from './VolumeButton';
import { Title } from './Title';
import { Watermark } from './Watermark';
import { WatermarkConfig } from '../../types';

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
  showTitle: boolean;
  title: string;
  watermark: WatermarkConfig;
  playOrPause();
  seekToBackward();
  seekToForward();
  toggleActiveSubtitle();
  togglePip();
  toggleSettings();
  toggleFullscreen();
}

/**
 * The player chrome, laid out the way YouTube's is: the progress bar across the whole width, and under it one row of controls —
 * play, the skips, volume, the time and the current chapter on the left; subtitles, settings, the miniplayer and full screen on
 * the right.
 */
export const ControlsView = withState((props: ControlsViewProps) => {
  return (
    <>
      {props.showTitle && <Title />}
      <Nod />
      <Settings />
      <ChaptersPanel />
      {props.isCenterClickAllowed && <Center />}
      {props.showRebuffer && <Rebuffer />}
      <div className="igui_container_controls">
        <div className="igui_container_controls_seekbar">
          <Seekbar />
        </div>
        <div className="igui_container_controls_row">
          <div className="igui_container_controls_left">
            <Button
              name="play"
              icon={props.playIcon}
              onClick={props.playOrPause}
              tooltip={props.playTooltipText}
            />
            <Button
              name="backward"
              icon={props.seekToBackwardIcon}
              onClick={props.seekToBackward}
              tooltip={props.seekToBackwardTooltipText}
            />
            <Button
              name="forward"
              icon={props.seekToForwardIcon}
              onClick={props.seekToForward}
              tooltip={props.seekToForwardTooltipText}
            />
            <VolumeButton />
            <TimeStat />
            <ChapterTitle />
          </div>
          <div className="igui_container_controls_right">
            {props.showSubtitlesToggle && (
              <Button
                name="subtitle"
                icon="cc"
                onClick={props.toggleActiveSubtitle}
                active={props.isSubtitleActive}
                tooltip={props.subtitleToggleTooltipText}
              />
            )}
            <Button
              name="settings"
              icon="settings"
              onClick={() => props.toggleSettings()}
              tooltip={props.settingsTooltipText}
              active={props.isSettingsTabActive}
            />
            {props.showPip && (
              <Button
                name="pip"
                icon="pip"
                onClick={props.togglePip}
                tooltip={props.pipTooltipText}
              />
            )}
            <Button
              name="fullscreen"
              icon={props.fullscreenIcon}
              onClick={props.toggleFullscreen}
              tooltip={props.fullscreenTooltipText}
              disabled={!props.isFullscreenSupported}
            />
          </div>
        </div>
      </div>
      {props.watermark?.enabled && <Watermark />}
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
    isSettingsTabActive: info.data.settingsTab !== SettingsTabs.NONE && info.data.settingsTab !== null,
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
    showTitle: info.data.showTitle,
    title: info.data.title,
    watermark: info.data.watermark
  };
}
