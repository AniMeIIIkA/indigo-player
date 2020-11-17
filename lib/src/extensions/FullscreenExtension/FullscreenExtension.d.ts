import { Module } from '@src/Module';
import { IInstance } from '@src/types';
export declare class FullscreenExtension extends Module {
    name: string;
    private documentPos;
    constructor(instance: IInstance);
    toggleFullscreen(): void;
    private handleDocumentPos;
}
