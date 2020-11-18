import { Module } from "../Module";
import { IController, ITrack } from "../types";
export declare class Controller extends Module implements IController {
    load(): Promise<void>;
    unload(): void;
    play(): void;
    pause(): void;
    seekTo(time: number): void;
    setVolume(volume: number): void;
    selectTrack(track: ITrack): void;
    selectAudioLanguage(language: string): void;
    setPlaybackRate(playbackRate: number): void;
}
