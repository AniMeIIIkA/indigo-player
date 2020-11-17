import { Media } from '@src/media/Media';
export declare class BaseMedia extends Media {
    name: string;
    load(): Promise<void>;
}
