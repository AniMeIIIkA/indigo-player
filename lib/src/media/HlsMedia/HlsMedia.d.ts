import { ITrack } from '../../types';
import { Media } from '../Media';
export declare class HlsMedia extends Media {
    name: string;
    player: any;
    load(): Promise<void>;
    seekTo(time: number): void;
    unload(): void;
    selectTrack(track: ITrack | string): void;
    private formatTrack;
}