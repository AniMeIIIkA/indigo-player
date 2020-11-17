import { Module } from '@src/Module';
import { IInstance } from '@src/types';
export declare class DimensionsExtension extends Module {
    name: string;
    private observer;
    constructor(instance: IInstance);
    destroy(): void;
    onInstanceInitialized(): void;
    onResizeContainer(): void;
}
