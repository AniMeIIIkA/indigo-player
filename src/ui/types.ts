import { PlayerError } from "../PlayerError";
import { ITrack, Subtitle, IThumbnail, WatermarkConfig } from "../types";


export interface IData {
  paused: boolean;
  view: ViewTypes;
  visibleControls: boolean;
  progressPercentage: number;
  bufferedPercentage: number;
  volumeBarPercentage: number;
  isVolumeControlsOpen: boolean;
  isFullscreen: boolean;
  fullscreenSupported: boolean;
  playRequested: boolean;
  adBreakData?: {
    progressPercentage: number;
  };
  cuePoints: number[];
  rebuffering: boolean;
  timeStatPosition: string;
  timeStatDuration: string;
  error?: PlayerError;
  isCenterClickAllowed: boolean;
  isSeekbarHover: boolean;
  isSeekbarSeeking: boolean;
  seekbarPercentage: number;
  seekbarTooltipText: string;
  seekbarTooltipPercentage: number;
  seekbarThumbnailPercentage: number;
  tracks: ITrack[];
  activeTrack: ITrack;
  selectedTrack: ITrack | string;
  settingsTab: SettingsTabs;
  visibleSettingsTabs: SettingsTabs[];
  subtitles: Subtitle[];
  activeSubtitle: Subtitle;
  playbackRate: number;
  pip: boolean;
  pipSupported: boolean;
  activeThumbnail: IThumbnail;
  isMobile: boolean;
  image: string;
  nodIcon: string;
  showTitle: boolean;
  title: string;
  watermark: WatermarkConfig;
  getTranslation(text: string): string;
}

export interface IActions {
  playOrPause(origin?: string);
  startSeeking();
  seekToPercentage(percentage: number);
  seekToBackward(seconds: number);
  seekToForward(seconds: number);
  setVolume(volume: number);
  setVolumeControlsOpen(isVolumeControlsOpen: boolean);
  startVolumebarSeeking();
  stopVolumebarSeeking();
  toggleMute();
  toggleFullscreen();
  setSeekbarState(state: any);
  setVolumebarState(state: any);
  selectTrack(track: ITrack);
  setSettingsTab(tab: SettingsTabs);
  toggleSettings();
  selectSubtitle(subtitle: Subtitle);
  setPlaybackRate(playbackRate: number);
  togglePip();
  toggleActiveSubtitle();
}

export interface IInfo {
  data: IData;
  actions: IActions;
}

export enum ViewTypes {
  ERROR = 'error',
  LOADING = 'loading',
  START = 'start',
  CONTROLS = 'controls',
}

export enum SettingsTabs {
  NONE,
  OPTIONS,
  TRACKS,
  SUBTITLES,
  PLAYBACKRATES,
}

export interface IStateStore {
  showControls();
}