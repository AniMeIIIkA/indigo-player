import { Module } from '../Module';
import { IInstance } from '../types';
export declare class UiExtension extends Module {
    name: string;
    private ref;
    constructor(instance: IInstance);
    private setTheme;
    triggerMouseMove(): void;
}
