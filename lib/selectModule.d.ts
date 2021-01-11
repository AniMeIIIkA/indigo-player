import { Format, IController, IMedia, IModule, IPlayer } from './types';
import { IInstance } from './types/IInstance';
export declare function selectMedia(instance: IInstance): Promise<[Format | null, IMedia | null]>;
export declare function selectPlayer(instance: IInstance): Promise<IPlayer | null>;
export declare function selectExtensions(instance: IInstance): Promise<IModule[]>;
export declare function selectController(instance: IInstance): Promise<IController | null>;
