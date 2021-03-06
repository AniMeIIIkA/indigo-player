import { Module } from '../../Module';
import { IInstance } from '../../types/IInstance';
export declare class DimensionsExtension extends Module {
    name: string;
    private observer;
    constructor(instance: IInstance);
    destroy(): void;
    onInstanceInitialized(): void;
    onResizeContainer(): void;
}
