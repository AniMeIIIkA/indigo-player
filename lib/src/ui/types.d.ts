import { PlayerError } from "../PlayerError";
import { ITrack, Subtitle, IThumbnail } from "../types";
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
    getTranslation(text: string): string;
}
export interface IActions {
    playOrPause(origin?: string): any;
    startSeeking(): any;
    seekToPercentage(percentage: number): any;
    setVolume(volume: number): any;
    setVolumeControlsOpen(isVolumeControlsOpen: boolean): any;
    startVolumebarSeeking(): any;
    stopVolumebarSeeking(): any;
    toggleMute(): any;
    toggleFullscreen(): any;
    setSeekbarState(state: any): any;
    setVolumebarState(state: any): any;
    selectTrack(track: ITrack): any;
    setSettingsTab(tab: SettingsTabs): any;
    toggleSettings(): any;
    selectSubtitle(subtitle: Subtitle): any;
    setPlaybackRate(playbackRate: number): any;
    togglePip(): any;
    toggleActiveSubtitle(): any;
}
export interface IInfo {
    data: IData;
    actions: IActions;
}
export declare enum ViewTypes {
    ERROR = "error",
    LOADING = "loading",
    START = "start",
    CONTROLS = "controls"
}
export declare enum SettingsTabs {
    NONE = 0,
    OPTIONS = 1,
    TRACKS = 2,
    SUBTITLES = 3,
    PLAYBACKRATES = 4
}
export interface IStateStore {
    showControls(): any;
}
