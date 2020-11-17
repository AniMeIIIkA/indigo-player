import { Module } from '@src/Module';
import { IInstance } from '@src/types';
export declare class UiExtension extends Module {
    name: string;
    private ref;
    constructor(instance: IInstance);
    private setTheme;
    triggerMouseMove(): void;
}
