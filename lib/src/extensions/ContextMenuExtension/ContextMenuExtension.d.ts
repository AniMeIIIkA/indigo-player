import { Module } from '../../Module';
import { IInstance } from '../../types';
import './context-menu.scss';
export declare class ContextMenuExtension extends Module {
    name: string;
    private contextMenu;
    constructor(instance: IInstance);
    addItem(html: string, onClick: any): void;
    private onContextMenu;
    private onClick;
}
