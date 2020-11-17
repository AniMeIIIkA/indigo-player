import { Format, IController, IInstance, IMedia, IModule, IPlayer } from '@src/types';
export declare function selectMedia(instance: IInstance): Promise<[Format, IMedia]>;
export declare function selectPlayer(instance: IInstance): Promise<IPlayer>;
export declare function selectExtensions(instance: IInstance): Promise<IModule[]>;
export declare function selectController(instance: IInstance): Promise<IController>;
