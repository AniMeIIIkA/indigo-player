import { Module } from "../Module";
import { IMedia, ITrack } from "../types";
export declare class Media extends Module implements IMedia {
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
