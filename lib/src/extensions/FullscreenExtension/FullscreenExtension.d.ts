import { Module } from '../../Module';
import { IInstance } from '../../types';
export declare class FullscreenExtension extends Module {
    name: string;
    private documentPos;
    constructor(instance: IInstance);
    toggleFullscreen(): void;
    private handleDocumentPos;
}
