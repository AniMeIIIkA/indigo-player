import { Media } from "../Media";
export declare class BaseMedia extends Media {
    name: string;
    load(): Promise<void>;
}
