
import uniqBy from 'lodash/uniqBy';
import React, { RefObject } from 'react';
import { Subtitle, IThumbnail, KeyboardNavigationPurpose, Events, ITrack, AdBreakType, WatermarkConfig, IWatermarkChangeEventData, IChaptersChangeEventData, Chapter, IDimensionsChangeEventData } from '../types';
import {
  chapterIndexAt,
  ChapterSegment,
  layoutSegments,
  positionToTime,
  resolveChapters,
  ResolvedChapter,
  segmentFill,
  timeToPosition,
} from '../extensions/ChaptersExtension/chapters';
import { IInstance } from '../types/IInstance';
import { getTranslation } from './i18n';
import { ISubtitleStyle } from './types';

const SUBTITLE_STYLE_KEY = 'igui_subtitle_style';
const DEFAULT_SUBTITLE_STYLE: ISubtitleStyle = { color: 'white', background: 'shadow', size: 'normal' };
const loadSubtitleStyle = (): ISubtitleStyle => {
  try {
    const raw = window.localStorage && window.localStorage.getItem(SUBTITLE_STYLE_KEY);
    return raw ? { ...DEFAULT_SUBTITLE_STYLE, ...JSON.parse(raw) } : DEFAULT_SUBTITLE_STYLE;
  } catch (e) {
    return DEFAULT_SUBTITLE_STYLE;
  }
};
const saveSubtitleStyle = (style: ISubtitleStyle) => {
  try {
    window.localStorage && window.localStorage.setItem(SUBTITLE_STYLE_KEY, JSON.stringify(style));
  } catch (e) {
    // private mode / storage disabled — the choice lives for this page only
  }
};

import { triggerEvent } from './triggerEvent';
import { SettingsTabs, IStateStore, IData, ViewTypes, IActions } from './types';
import { EventUnsubscribeFn, attachEvents } from './utils/attachEvents';
import { secondsToHMS } from './utils/secondsToHMS';

export const StateContext = React.createContext({});

interface StateStoreProps {
  instance: IInstance;
  player: any;
  children?: React.ReactNode;
}

interface StateStoreState {
  subtitleStyle: ISubtitleStyle;
  visibleControls: boolean;

  // Seekbar
  isSeekbarHover: boolean;
  isSeekbarSeeking: boolean;
  seekbarPercentage: number;

  // Volume
  isVolumeControlsOpen: boolean;
  isVolumebarSeeking: boolean;

  // Settings
  settingsTab: SettingsTabs | null;

  lastActiveSubtitle: Subtitle | null;
  activeThumbnail: IThumbnail | null;

  // Watermark
  watermark: WatermarkConfig | null;

  // Chapters (2026-09-24)
  chapters: Chapter[];
  chaptersPanelOpen: boolean;

  // The player's width, px: a narrow player drops the less important buttons so the row fits.
  playerWidth: number;

  nodPurpose: KeyboardNavigationPurpose | any;

  children?: React.ReactNode;
}

export const seekbarRef: RefObject<HTMLDivElement> = React.createRef();

export const seekbarTooltipRef: RefObject<HTMLDivElement> = React.createRef();

export const seekbarThumbnailRef: RefObject<HTMLDivElement> = React.createRef();

export class StateStore
  extends React.Component<StateStoreProps, StateStoreState>
  implements IStateStore {
  private activeTimer: number;

  private nodTimer: number | null;

  private unsubscribe: EventUnsubscribeFn;

  private prevData: IData;

  constructor(props) {
    super(props);

    this.state = {
      visibleControls: false,
      subtitleStyle: loadSubtitleStyle(),

      // Seekbar
      isSeekbarHover: false,
      isSeekbarSeeking: false,
      seekbarPercentage: 0,

      // Volume
      isVolumeControlsOpen: false,
      isVolumebarSeeking: false,

      // Settings
      settingsTab: null,

      lastActiveSubtitle: null,
      activeThumbnail: null,

      nodPurpose: null,

      // Watermark
      watermark: this.props.instance.config.ui.watermark || null,

      // Chapters
      chapters: this.props.instance.config.chapters || [],
      chaptersPanelOpen: false,

      playerWidth: this.props.instance.container
        ? this.props.instance.container.getBoundingClientRect().width
        : 0,
    };

    this.unsubscribe = attachEvents([
      {
        element: this.props.instance.container,
        events: ['mouseenter', 'mousemove', 'mousedown'],
        callback: this.showControls,
      },
      {
        element: this.props.instance.container,
        events: ['mouseleave'],
        callback: this.hideControls,
      },
      {
        element: window as any,
        events: ['mousedown'],
        callback: this.closeSettings,
      },
    ]);

    this.props.instance.on(Events.KEYBOARDNAVIGATION_KEYDOWN, data => {
      this.showControls();
      this.triggerNod(data.purpose);

      if (data.purpose === KeyboardNavigationPurpose.REQUEST_TOGGLE_SUBTITLES) {
        this.toggleActiveSubtitle();
      }
      if (
        data.purpose === KeyboardNavigationPurpose.REQUEST_TOGGLE_MINIPLAYER
      ) {
        this.togglePip();
      }
    });

    this.props.instance.on(Events.UI_WATERMARK_CHANGE, ({ config }: IWatermarkChangeEventData) => {
      this.updateWatermark(config);
    });

    this.props.instance.on(Events.DIMENSIONS_CHANGE, ({ width }: IDimensionsChangeEventData) => {
      this.setState({ playerWidth: width || 0 });
    });

    this.props.instance.on(Events.UI_CHAPTERS_CHANGE, ({ chapters }: IChaptersChangeEventData) => {
      this.setState({
        chapters: chapters || [],
        chaptersPanelOpen: this.state.chaptersPanelOpen && !!(chapters && chapters.length),
      });
    });
  }

  public componentWillUnmount() {
    this.unsubscribe();
  }

  public componentDidUpdate() {
    const data = this.createData();
    triggerEvent(this.props.instance, data, this.prevData);
    this.prevData = data;
  }

  public render() {
    const data = this.createData();
    const actions = this.createActions();

    return (
      //@ts-ignore
      <StateContext.Provider value={{ data, actions }}>
        {this.props.children}
      </StateContext.Provider>
    );
  }

  public showControls = () => {
    clearTimeout(this.activeTimer);

    this.setState({ visibleControls: true });

    this.activeTimer = (window as any).setTimeout(() => {
      this.setState({ visibleControls: false });
    }, 2000);
  };

  private hideControls = () => {
    clearTimeout(this.activeTimer);
    this.setState({ visibleControls: false });
  };

  public updateWatermark = (config: Partial<WatermarkConfig>) => {
    this.setState({
      watermark: {
        ...this.state.watermark,
        ...config
      } as any
    });
  };

  private triggerNod = (purpose: KeyboardNavigationPurpose) => {
    this.setState({ nodPurpose: null }, () => {
      if (this.nodTimer) {
        clearTimeout(this.nodTimer);
        this.nodTimer = null;
      }
      this.setState({ nodPurpose: purpose }, () => {
        this.nodTimer = (window as any).setTimeout(() => {
          this.setState({ nodPurpose: null });
          this.nodTimer = null;
        }, 500);
      });
    });
  };

  private setVolumeControlsOpen = (isVolumeControlsOpen: boolean) => {
    if (!this.props.instance.env.isMobile) {
      this.setState({ isVolumeControlsOpen });
    }
  };

  private setSeekbarState = (state, prevState) => {
    let activeThumbnail = null;
    const thumbnailsExtension: any = this.props.instance.getModule(
      'ThumbnailsExtension',
    );
    // The pointer's place on the bar is not a share of the duration when the bar is cut into chapter segments (the gaps take
    // pixels, not seconds) — so the moment it points at goes through the chapter layout.
    const time = this.seekbarTime(state.percentage);
    if ((state.hover || state.seeking) && thumbnailsExtension) {
      activeThumbnail = thumbnailsExtension.getThumbnail(time);
    }

    this.setState({
      isSeekbarHover: state.hover,
      isSeekbarSeeking: state.seeking,
      seekbarPercentage: state.percentage,
      activeThumbnail,
    });

    if (!state.seeking && prevState.seeking) {
      this.showControls();
      this.props.instance.seekTo(time);
    }
  };

  /** The chapters on the current duration and their segments on the bar as it is drawn now; both empty without chapters. */
  private chapterLayout(): { chapters: ResolvedChapter[]; segments: ChapterSegment[]; width: number } {
    const duration = this.props.player.duration || 0;
    const chapters = resolveChapters(this.state.chapters, duration);
    const width = chapters.length && seekbarRef.current
      ? (seekbarRef.current as HTMLElement).getBoundingClientRect().width
      : 0;
    return { chapters, segments: layoutSegments(chapters, duration, width), width };
  }

  /** The moment of the video a place on the seekbar (0..1 of its width) stands for. */
  private seekbarTime(percentage: number): number {
    const duration = this.props.player.duration || 0;
    const { segments, width } = this.chapterLayout();
    return segments.length
      ? positionToTime(segments, percentage * width, duration)
      : percentage * duration;
  }

  private toggleChaptersPanel = () => {
    this.setState(prevState => ({
      chaptersPanelOpen: !prevState.chaptersPanelOpen,
      settingsTab: SettingsTabs.NONE,
    }));
  };

  private closeChaptersPanel = () => {
    this.setState({ chaptersPanelOpen: false });
  };

  /** Plays from the start of a chapter picked in the panel; the panel closes — it lies over the video. */
  private seekToChapter = (index: number) => {
    const { chapters } = this.chapterLayout();
    const chapter = chapters[index];
    if (!chapter) {
      return;
    }
    this.props.instance.seekTo(chapter.start);
    this.setState({ chaptersPanelOpen: false });
    this.showControls();
  };

  private setVolumebarState = (state, prevState) => {
    this.setState({
      isVolumebarSeeking: state.seeking,
    });

    if (!state.seeking && prevState.seeking) {
      this.showControls();
    }

    if (state.seeking) {
      const volume = state.percentage;
      this.props.instance.setVolume(volume);
    }
  };

  private toggleMute = () => {
    if (this.props.player.volume) {
      this.props.instance.setVolume(0);
    } else {
      this.props.instance.setVolume(1);
    }
  };

  private playOrPause = (origin?: string) => {
    if (!this.props.player.playRequested) {
      this.props.instance.play();
      if (origin === 'center') {
        this.triggerNod(KeyboardNavigationPurpose.PLAY);
      }
    } else {
      this.props.instance.pause();
      if (origin === 'center') {
        this.triggerNod(KeyboardNavigationPurpose.PAUSE);
      }
    }
  };

  private seekToBackward = (seconds: number) => {
    this.props.instance.seekTo(this.props.player.currentTime + (seconds * -1));
    this.triggerNod(KeyboardNavigationPurpose.PREV_SEEK);
  };

  private seekToForward = (seconds: number) => {
    this.props.instance.seekTo(this.props.player.currentTime + seconds);
    this.triggerNod(KeyboardNavigationPurpose.NEXT_SEEK);
  };

  private toggleFullscreen = () => {
    (this.props.instance.getModule(
      'FullscreenExtension',
    ) as any).toggleFullscreen();
  };

  private selectTrack = (track: ITrack) => {
    this.props.instance.selectTrack(track);
  };

  private setPlaybackRate = (playbackRate: number) => {
    this.props.instance.setPlaybackRate(playbackRate);
  };

  private closeSettings = (event: MouseEvent) => {
    const isOver = (className: string) => {
      const target: EventTarget | null = event.target;
      const container = this.props.instance.container.querySelector(className);
      return (
        container &&
        (container === target || container.contains(target as Node))
      );
    };

    if (
      this.state.chaptersPanelOpen &&
      !isOver('.igui_chapters') &&
      !isOver('.igui_chapter_title')
    ) {
      this.setState({ chaptersPanelOpen: false });
    }

    if (isOver('.igui_settings') || isOver('.igui_button_name-settings')) {
      return;
    }

    this.setState({ settingsTab: SettingsTabs.NONE });
  };

  private toggleSettings = () => {
    this.setState(prevState => ({
      settingsTab: prevState.settingsTab
        ? SettingsTabs.NONE
        : SettingsTabs.OPTIONS,
    }));
  };

  private setSettingsTab = (settingsTab: SettingsTabs) => {
    this.setState({ settingsTab });
  };

  private setSubtitleStyle = (style: Partial<ISubtitleStyle>) => {
    const subtitleStyle = { ...this.state.subtitleStyle, ...style };
    saveSubtitleStyle(subtitleStyle);
    this.setState({ subtitleStyle });
  };

  /** The style is CSS variables on the player root (the subtitles container sits beside the player, inside the same root). */
  private applySubtitleStyle() {
    const root = this.props.instance.container as HTMLElement;
    if (!root || !root.style) return;
    const s = this.state.subtitleStyle || loadSubtitleStyle();
    const colors = { white: '#ffffff', yellow: '#ffe14d', cyan: '#7fe3ff', green: '#8dff8d' };
    root.style.setProperty('--ig-sub-color', colors[s.color] || colors.white);
    root.style.setProperty('--ig-sub-bg', s.background === 'box' ? 'rgba(0, 0, 0, 0.75)' : 'transparent');
    root.style.setProperty('--ig-sub-shadow', s.background === 'none' ? 'none' : '#000000 0px 0px 7px');
    root.style.setProperty('--ig-sub-padding', s.background === 'box' ? '4px 10px' : '0');
    root.style.setProperty('--ig-sub-size', s.size === 'large' ? '24px' : '17px');
  }

  private selectSubtitle = (subtitle: Subtitle | null) => {
    if (subtitle) {
      this.setState({ lastActiveSubtitle: subtitle });
    }

    (this.props.instance.getModule('SubtitlesExtension') as any).setSubtitle(
      subtitle ? subtitle.srclang : null,
    );
  };

  private toggleActiveSubtitle = () => {
    let subtitle: Subtitle | null = this.state.lastActiveSubtitle;
    if (!subtitle) {
      subtitle = this.props.instance.config.subtitles[0];
    }

    this.selectSubtitle(this.props.player.subtitle ? null : subtitle);
  };

  private togglePip = () => {
    (this.props.instance.getModule('PipExtension') as any).togglePip();
  };

  private getTranslation = (text: string): string => {
    return getTranslation(this.props.instance.config.ui.locale)(text);
  };

  /**
   * Create a state snapshot for the player.
   * @return {IData} The snapshot data
   */
  private createData(): IData {
    // Figure out which view to show.
    let view = ViewTypes.LOADING;
    if (this.props.player.ready && this.props.player.waitingForUser) {
      view = ViewTypes.START;
    }
    if (this.props.player.videoSessionStarted) {
      view = ViewTypes.CONTROLS;
    }
    if (this.props.player.playRequested && !this.props.player.started) {
      view = ViewTypes.LOADING;
    }
    if (this.props.player.error) {
      view = ViewTypes.ERROR;
    }

    // Do we need to show the controls?
    let visibleControls = this.state.visibleControls;
    if (!this.props.instance.config.ui.showControls) {
      visibleControls = false;
    } else if (this.state.isSeekbarSeeking ||
      this.state.isVolumebarSeeking ||
      !!this.state.settingsTab ||
      this.state.chaptersPanelOpen
    ) {
      // If we're seeking, either by video position or volume, keep the controls visible.
      visibleControls = true;
    }


    // Do we need to open the volume bar?
    let isVolumeControlsOpen = this.state.isVolumeControlsOpen;
    if (this.state.isVolumebarSeeking) {
      // If we're seeking volume, keep the volume bar open.
      isVolumeControlsOpen = true;
    }

    // Create a data object for the currently playing ad.
    let adBreakData;
    if (this.props.player.adBreak) {
      adBreakData = {
        progressPercentage:
          this.props.player.adBreakCurrentTime /
          this.props.player.adBreak.duration,
      };
    }

    // Chapters: the segments as drawn now, and the moment the pointer stands for (not the pointer's share of the width — the gaps
    // between segments are pixels, not seconds).
    const duration = this.props.player.duration || 0;
    const { chapters, segments, width: seekbarWidth } = this.chapterLayout();
    const pointerTime = segments.length
      ? positionToTime(segments, this.state.seekbarPercentage * seekbarWidth, duration)
      : this.state.seekbarPercentage * duration;
    const pointerPercentage = duration ? pointerTime / duration : 0;

    // Calculate the current progress percentage.
    // TODO: Do not calculate progressPercentage if controls are not visible for x-ms (animation time)
    //       and with smooth seeking on.
    let progressPercentage = 0;
    if (this.props.player.duration) {
      progressPercentage =
        this.props.player.currentTime / this.props.player.duration;
    }
    if (this.state.isSeekbarSeeking) {
      // If we're seeking with the seekbar, no longer show the current video progress
      // but use the seekbar percentage.
      progressPercentage = pointerPercentage;
    }
    if (adBreakData) {
      // If we're playing an ad, the progress bar displays the progress of the adbreak.
      progressPercentage = adBreakData.progressPercentage;
    }

    // Create a percentages list of the cuepoints.
    let cuePoints = [];
    if (this.props.player.duration && this.props.player.adBreaks.length) {
      cuePoints = this.props.player.adBreaks
        .filter(
          adBreak =>
            adBreak.type === AdBreakType.MIDROLL && !adBreak.hasBeenWatched,
        )
        .map(adBreak => adBreak.startsAt / this.props.player.duration);
    }

    // Create a proper time stat ((HH)/MM/SS).
    let timeStatDuration = '';
    if (this.props.player.duration) {
      timeStatDuration = secondsToHMS(this.props.player.duration);
    }
    const timeStatPosition = secondsToHMS(this.props.player.currentTime);

    // Pass an error if we have one.
    let error;
    if (this.props.player.error) {
      error = this.props.player.error;
    }

    // Allowing a center click will result in a play or a pause.
    let isCenterClickAllowed = true;
    if (adBreakData || this.props.instance.env.isMobile) {
      // If you click an ad, we don't want to pause but perform an ad clickthrough.
      // Also, on mobile this doesn't make sense because we'll use a tap to show the UI instead.
      isCenterClickAllowed = false;
    }

    // The seekbar tooltip is the current time ((HH)/MM/SS).
    let seekbarTooltipText;
    if (this.props.player.duration) {
      seekbarTooltipText = secondsToHMS(pointerTime);
    }

    // What the chapter UI draws: one segment per chapter with its own fills, the chapter under the pointer (named above the time
    // in the tooltip, drawn thicker), the chapter playing now (named beside the time), and where the scrubber sits on the cut bar.
    const isPointing = this.state.isSeekbarHover || this.state.isSeekbarSeeking;
    const progressTime = progressPercentage * duration;
    const bufferedTime = (this.props.player.bufferedPercentage || 0) * duration;
    const showSeekAhead = this.state.isSeekbarHover && !this.state.isSeekbarSeeking;
    const hoverChapterIndex = isPointing && !adBreakData ? chapterIndexAt(chapters, pointerTime) : -1;
    const activeChapterIndex = chapterIndexAt(chapters, progressTime);
    const chapterSegments = adBreakData ? [] : chapters.map(chapter => ({
      index: chapter.index,
      length: chapter.end - chapter.start,
      progress: segmentFill(chapter, progressTime),
      buffered: segmentFill(chapter, bufferedTime),
      ahead: showSeekAhead ? segmentFill(chapter, pointerTime) : 0,
      hovered: chapter.index === hoverChapterIndex,
    }));
    const scrubberPercentage = segments.length && seekbarWidth > 0 && !adBreakData
      ? timeToPosition(segments, progressTime) / seekbarWidth
      : progressPercentage;

    // Calculate the seekbar tooltip percentage for placement.
    let seekbarTooltipPercentage = this.state.seekbarPercentage;
    if (seekbarRef.current && seekbarTooltipRef.current) {
      // The tooltip is placed in the center, we don't want it to go out of bounds.
      // Calculate and adjust the correct placement so it'll stick on the sides (eg, moving mouse to 00:00).
      const seekbarWidth = (seekbarRef.current as HTMLElement).getBoundingClientRect()
        .width;
      const tooltipWidth = (seekbarTooltipRef.current as HTMLElement).getBoundingClientRect()
        .width;
      const offset = tooltipWidth / 2 / seekbarWidth;
      if (seekbarTooltipPercentage < offset) {
        seekbarTooltipPercentage = offset;
      } else if (seekbarTooltipPercentage > 1 - offset) {
        seekbarTooltipPercentage = 1 - offset;
      }
    }

    // Calculate the seekbar thumbnail percentage for placement.
    let seekbarThumbnailPercentage = this.state.seekbarPercentage;
    if (seekbarRef.current && seekbarThumbnailRef.current) {
      // The tooltip is placed in the center, we don't want it to go out of bounds.
      // Calculate and adjust the correct placement so it'll stick on the sides (eg, moving mouse to 00:00).
      const seekbarWidth = (seekbarRef.current as HTMLElement).getBoundingClientRect()
        .width;
      const thumbnailWidth = (seekbarThumbnailRef.current as HTMLElement).getBoundingClientRect()
        .width;
      const offset = thumbnailWidth / 2 / seekbarWidth;
      if (seekbarThumbnailPercentage < offset) {
        seekbarThumbnailPercentage = offset;
      } else if (seekbarThumbnailPercentage > 1 - offset) {
        seekbarThumbnailPercentage = 1 - offset;
      }
    }

    const tracks = uniqBy<ITrack>(
      this.props.player.tracks.sort(
        (a, b) => Number(b.height) - Number(a.height),
      ),
      'height',
    );

    let activeTrack: any | null = null;
    if (this.props.player.track) {
      activeTrack = tracks.find(
        track => track.id === this.props.player.track.id,
      );
    }

    let selectedTrack: string = activeTrack;
    if (this.props.player.trackAutoSwitch) {
      selectedTrack = 'auto';
    }
    const visibleSettingsTabs: SettingsTabs[] = [];
    const playbackRate = this.props.instance.config.ui.playbackRate;
    if (playbackRate) {
      visibleSettingsTabs.push(SettingsTabs.PLAYBACKRATES);
    }

    const subtitles = this.props.instance.config.subtitles || [];

    const activeSubtitle = this.props.player.subtitle;

    if (subtitles.length) {
      visibleSettingsTabs.push(SettingsTabs.SUBTITLES);
      visibleSettingsTabs.push(SettingsTabs.SUBTITLE_STYLE);
    }
    this.applySubtitleStyle();
    if (tracks.length) {
      visibleSettingsTabs.push(SettingsTabs.TRACKS);
    }

    let pipSupported = false;
    if (this.props.instance.config.ui.pip) {
      pipSupported = true;
    }

    const nodIcon = {
      [KeyboardNavigationPurpose.PLAY]: 'play',
      [KeyboardNavigationPurpose.PAUSE]: 'pause',
      [KeyboardNavigationPurpose.PREV_SEEK]: 'backward',
      [KeyboardNavigationPurpose.NEXT_SEEK]: 'forward',
      [KeyboardNavigationPurpose.VOLUME_UP]: 'volume-2',
      [KeyboardNavigationPurpose.VOLUME_DOWN]: 'volume-1',
      [KeyboardNavigationPurpose.VOLUME_MUTED]: 'volume-off',
      [KeyboardNavigationPurpose.VOLUME_UNMUTED]: 'volume-2',
      [KeyboardNavigationPurpose.REQUEST_TOGGLE_SUBTITLES]: 'cc',
    }[this.state.nodPurpose];

    return {
      // UI specific state
      view,
      visibleControls,
      isCenterClickAllowed,
      settingsTab: this.state.settingsTab,
      visibleSettingsTabs,
      isMobile: this.props.instance.env.isMobile,
      playerWidth: this.state.playerWidth,
      image: this.props.instance.config.ui.image,
      nodIcon,

      // Player
      playRequested: this.props.player.playRequested,
      paused: this.props.player.paused,
      rebuffering: this.props.player.buffering,
      tracks,
      activeTrack,
      selectedTrack,
      error,
      cuePoints,
      timeStatPosition,
      timeStatDuration,
      playbackRate: this.props.player.playbackRate,
      pip: this.props.player.pip,
      pipSupported,

      // Progress bar
      progressPercentage,
      bufferedPercentage: this.props.player.bufferedPercentage,
      isSeekbarHover: this.state.isSeekbarHover,
      isSeekbarSeeking: this.state.isSeekbarSeeking,
      seekbarPercentage: this.state.seekbarPercentage,
      seekbarTooltipText,
      seekbarTooltipPercentage,
      seekbarThumbnailPercentage,
      scrubberPercentage,

      // Chapters
      chapters,
      chapterSegments,
      activeChapterIndex,
      activeChapterTitle: activeChapterIndex >= 0 ? chapters[activeChapterIndex].title : null,
      seekbarTooltipChapter: hoverChapterIndex >= 0 ? chapters[hoverChapterIndex].title : null,
      chaptersPanelOpen: this.state.chaptersPanelOpen && chapters.length > 0,

      // Fullscreen
      fullscreenSupported: this.props.player.fullscreenSupported,
      isFullscreen: this.props.player.fullscreen,

      // Ads
      adBreakData,

      // Volume button & volume bar
      isVolumeControlsOpen,
      volumeBarPercentage: this.props.player.volume,

      // Subtitles
      subtitles,
      activeSubtitle,
      subtitleStyle: this.state.subtitleStyle,
      activeThumbnail: this.state.activeThumbnail,

      // Title
      showTitle: this.props.instance.config.ui.showTitle,
      title: this.props.instance.config.ui.title,

      // Watermark
      watermark: this.state.watermark,

      // i18n
      getTranslation: this.getTranslation,
    } as IData;
  }

  /**
   * Create actions for the UI to interact with.
   * @return {IActions} The actions
   */
  private createActions(): IActions {
    return {
      playOrPause: this.playOrPause,
      seekToBackward: this.seekToBackward,
      seekToForward: this.seekToForward,
      toggleFullscreen: this.toggleFullscreen,
      setVolumeControlsOpen: this.setVolumeControlsOpen,
      toggleMute: this.toggleMute,
      setSeekbarState: this.setSeekbarState,
      setVolumebarState: this.setVolumebarState,
      selectTrack: this.selectTrack,
      setSettingsTab: this.setSettingsTab,
      toggleSettings: this.toggleSettings,
      selectSubtitle: this.selectSubtitle,
      setSubtitleStyle: this.setSubtitleStyle,
      toggleActiveSubtitle: this.toggleActiveSubtitle,
      setPlaybackRate: this.setPlaybackRate,
      togglePip: this.togglePip,
      toggleChaptersPanel: this.toggleChaptersPanel,
      closeChaptersPanel: this.closeChaptersPanel,
      seekToChapter: this.seekToChapter,
    } as IActions;
  }
}
