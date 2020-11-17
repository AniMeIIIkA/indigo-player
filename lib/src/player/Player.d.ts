import { Module } from '@src/Module';
import { IPlayer } from '@src/types';
export declare class Player extends Module implements IPlayer {
    load(): void;
    unload(): void;
    play(): void;
    pause(): void;
    seekTo(time: number): void;
    setVolume(volume: number): void;
    setSource(src: string): void;
    setPlaybackRate(playbackRate: number): void;
}
