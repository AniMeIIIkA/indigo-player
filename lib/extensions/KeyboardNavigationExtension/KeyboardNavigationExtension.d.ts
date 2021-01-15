import { Module } from "../../Module";
import { IInstance } from "../../types/IInstance";
export declare const SKIP_CURRENTTIME_OFFSET: number;
export declare const SKIP_VOLUME_OFFSET: number;
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
