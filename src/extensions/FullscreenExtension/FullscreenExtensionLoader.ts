import { ModuleLoaderTypes, Config, IModuleLoader } from "../../types";
import { IInstance } from "../../types/IInstance";
import { FullscreenExtension } from "./FullscreenExtension";


export const FullscreenExtensionLoader = {
  type: ModuleLoaderTypes.EXTENSION,

  create: (instance: IInstance) => new FullscreenExtension(instance),

  isSupported: ({ config }: { config: Config }): boolean => true,
} as IModuleLoader<FullscreenExtension>;
