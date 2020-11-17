import { Module } from '@src/Module';
import { IInstance } from '@src/types';
import './subtitles.scss';
export declare class SubtitlesExtension extends Module {
    name: string;
    private timingsCache;
    private timings;
    private activeTiming;
    private currentTimeMs;
    private text;
    constructor(instance: IInstance);
    setSubtitle(srclang: string): Promise<void>;
    setOffset(offset: number): void;
    private onTimeUpdate;
    private onDimensionsChange;
    private selectActiveTiming;
    private setActiveTimings;
    private parseSubtitleFile;
}
