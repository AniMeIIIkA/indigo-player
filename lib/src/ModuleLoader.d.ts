import { IInstance, IModule, IModuleLoader, ModuleLoaderTypes } from './types';
export declare function createFirstSupported<T>(type: ModuleLoaderTypes, instance: IInstance, isSupportedArgs?: any): Promise<T | null>;
export declare function createAllSupported<T>(type: ModuleLoaderTypes, instance: IInstance, isSupportedArgs?: any): Promise<T[]>;
export declare function addModuleLoader(mod: IModuleLoader<IModule>): void;
