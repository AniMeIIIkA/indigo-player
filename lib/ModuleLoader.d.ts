import { IModule, IModuleLoader, ModuleLoaderTypes } from './types';
import { IInstance } from './types/IInstance';
export declare function createFirstSupported<T>(type: ModuleLoaderTypes, instance: IInstance, isSupportedArgs?: any): Promise<T | null>;
export declare function createAllSupported<T>(type: ModuleLoaderTypes, instance: IInstance, isSupportedArgs?: any): Promise<T[]>;
export declare function addModuleLoader(mod: IModuleLoader<IModule>): void;
