import { EventCallback, IEventData, IModule } from './types';
import type { IInstance } from './types/IInstance';
export declare class Module implements IModule {
    name: string;
    hooks: any;
    instance: IInstance;
    constructor(instance: IInstance);
    on(name: string, callback: EventCallback): void;
    once(name: string, callback: EventCallback): void;
    emit(name: string, eventData?: IEventData): void;
}
