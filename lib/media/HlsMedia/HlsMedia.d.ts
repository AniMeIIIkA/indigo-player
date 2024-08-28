import HlsJs from 'hls.js';
import { ITrack } from '../../types';
import { Media } from '../Media';
export declare class HlsMedia extends Media {
    name: string;
    player: HlsJs;
    isSourceLoaded: boolean;
    load(): Promise<void>;
    play(): Promise<void>;
    seekTo(time: number): void;
    unload(): void;
    selectTrack(track: ITrack | string): void;
    private formatTrack;
}
