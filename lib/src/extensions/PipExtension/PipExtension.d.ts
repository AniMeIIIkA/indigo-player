import { Module } from '../../Module';
import { IInstance } from '../../types/IInstance';
import './pip.scss';
export declare class PipExtension extends Module {
    name: string;
    pip: boolean;
    private playerContainer;
    private playerContainerParent;
    private pipPlaceholder;
    private pipContainer;
    private moveStartX;
    private moveStartY;
    private internalMoveDragging;
    private internalStopDragging;
    constructor(instance: IInstance);
    enablePip(): void;
    disablePip(): void;
    togglePip(): void;
    private startDragging;
    private moveDragging;
    private stopDragging;
}
