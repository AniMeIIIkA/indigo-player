import { Controller } from '@src/controller/Controller';
import { ITrack } from '@src/types';
export declare class BaseController extends Controller {
    name: string;
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
