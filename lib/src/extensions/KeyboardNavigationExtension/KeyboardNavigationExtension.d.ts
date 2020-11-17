import { Module } from '@src/Module';
import { IInstance } from '@src/types';
export declare class KeyboardNavigationExtension extends Module {
    name: string;
    private hasFocus;
    constructor(instance: IInstance);
    triggerFocus(): void;
    private onKeyDown;
    private onMouseDown;
    private getState;
    private emitPurpose;
}
