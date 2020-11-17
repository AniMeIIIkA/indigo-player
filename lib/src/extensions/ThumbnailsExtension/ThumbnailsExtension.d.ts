import { Module } from '@src/Module';
import { IInstance, IThumbnail } from '@src/types';
export declare class ThumbnailsExtension extends Module {
    name: string;
    private thumbnails;
    private extension;
    private bifParser;
    constructor(instance: IInstance);
    private loadVttThumbs;
    private loadBifThumbs;
    load(): Promise<void>;
    getThumbnail(seconds: number): IThumbnail;
}
