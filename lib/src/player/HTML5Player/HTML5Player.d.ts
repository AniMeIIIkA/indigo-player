import { Player } from '../Player';
export declare class HTML5Player extends Player {
    name: string;
    mediaElement: HTMLVideoElement;
    load(): void;
    unload(): void;
    setSource(src: string): void;
    play(): void;
    pause(): void;
    seekTo(time: number): void;
    setVolume(volume: number): void;
    setPlaybackRate(playbackRate: number): void;
    private monitorProgress;
}
