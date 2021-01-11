import { Module } from "../Module";
import { IPlayer } from "../types";
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
