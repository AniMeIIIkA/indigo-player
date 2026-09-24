import { PlayerError } from "../PlayerError";
import { ITrack, Subtitle, IThumbnail, WatermarkConfig } from "../types";
import type { ResolvedChapter } from "../extensions/ChaptersExtension/chapters";


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
  /** Where the scrubber sits, 0..1 of the bar's width — differs from progressPercentage when the bar is cut into chapters. */
  scrubberPercentage: number;
  chapters: ResolvedChapter[];
  chapterSegments: IChapterSegmentData[];
  activeChapterIndex: number;
  activeChapterTitle: string | null;
  /** The chapter under the pointer, named above the time in the seekbar tooltip. */
  seekbarTooltipChapter: string | null;
  chaptersPanelOpen: boolean;
  tracks: ITrack[];
  activeTrack: ITrack;
  selectedTrack: ITrack | string;
  settingsTab: SettingsTabs;
  visibleSettingsTabs: SettingsTabs[];
  subtitles: Subtitle[];
  activeSubtitle: Subtitle;
  subtitleStyle: ISubtitleStyle;
  playbackRate: number;
  pip: boolean;
  pipSupported: boolean;
  activeThumbnail: IThumbnail;
  isMobile: boolean;
  /** The player's width, px (0 until measured). */
  playerWidth: number;
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
  setSubtitleStyle(style: Partial<ISubtitleStyle>);
  setPlaybackRate(playbackRate: number);
  togglePip();
  toggleActiveSubtitle();
  toggleChaptersPanel();
  closeChaptersPanel();
  seekToChapter(index: number);
}

/** One chapter's segment of the seekbar: its share of the bar and how much of it is played / buffered / under the pointer. */
export interface IChapterSegmentData {
  index: number;
  length: number;
  progress: number;
  buffered: number;
  ahead: number;
  hovered: boolean;
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
  SUBTITLE_STYLE,
}

/** How subtitles are drawn — the viewer's own preference, kept in localStorage, applied as CSS variables on the player root. */
export interface ISubtitleStyle {
  color: 'white' | 'yellow' | 'cyan' | 'green';
  background: 'shadow' | 'box' | 'none';
  size: 'normal' | 'large';
}

export interface IStateStore {
  showControls();
}