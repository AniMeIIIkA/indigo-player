import { Module } from '../../Module';
import { PlayerError } from '../../PlayerError';
import { ITrack, Subtitle, IInstance } from '../../types';
export interface IState {
    ready: boolean;
    videoSessionStarted: boolean;
    waitingForUser: boolean;
    playRequested: boolean;
    playing: boolean;
    paused: boolean;
    buffering: boolean;
    started: boolean;
    contentStarted: boolean;
    contentEnded: boolean;
    ended: boolean;
    currentTime: number | null;
    duration: number | null;
    adBreaks: any;
    adBreak: any;
    adBreakCurrentTime: number | null;
    ad: any;
    error: PlayerError | null;
    bufferedPercentage: number;
    volume: number;
    fullscreenSupported: boolean;
    fullscreen: boolean;
    pip: boolean;
    tracks: ITrack[];
    track: ITrack | null;
    trackAutoSwitch: boolean;
    subtitle: Subtitle | null;
    subtitleText: string | null;
    playbackRate: number;
    audioLanguages: string[];
    width: number | null;
    height: number | null;
}
export declare class StateExtension extends Module {
    name: string;
    private state;
    constructor(instance: IInstance);
    getState(): IState;
    dispatch: (fn: any) => (data?: any) => void;
}
