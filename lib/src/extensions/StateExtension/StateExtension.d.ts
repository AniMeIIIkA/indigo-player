import { Module } from '@src/Module';
import { PlayerError } from '@src/PlayerError';
import { IInstance, ITrack, Subtitle } from '@src/types';
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
    currentTime: number;
    duration: number;
    adBreaks: any;
    adBreak: any;
    adBreakCurrentTime: number;
    ad: any;
    error: PlayerError;
    bufferedPercentage: number;
    volume: number;
    fullscreenSupported: boolean;
    fullscreen: boolean;
    pip: boolean;
    tracks: ITrack[];
    track: ITrack;
    trackAutoSwitch: boolean;
    subtitle: Subtitle;
    subtitleText: string;
    playbackRate: number;
    audioLanguages: string[];
    width: number;
    height: number;
}
export declare class StateExtension extends Module {
    name: string;
    private state;
    constructor(instance: IInstance);
    getState(): IState;
    dispatch: (fn: any) => (data?: any) => void;
}
