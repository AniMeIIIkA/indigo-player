import { Media } from '@src/media/Media';
import { IInstance, ITrack } from '@src/types';
export declare class DashMedia extends Media {
    name: string;
    player: any;
    private track;
    constructor(instance: IInstance);
    formatTrack: (track: any) => ITrack;
    load(): Promise<void>;
    unload(): void;
    selectTrack(track: ITrack | string): void;
    selectAudioLanguage(language: string): void;
    private emitTrackChange;
    private onErrorEvent;
    private onError;
    private onAdaptationEvent;
}
