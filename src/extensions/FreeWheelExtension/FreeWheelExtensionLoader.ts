import { ModuleLoaderTypes, IInstance, Config, IModuleLoader } from "../../types";
import { FreeWheelExtension } from "./FreeWheelExtension";


export const FreeWheelExtensionLoader = {
  type: ModuleLoaderTypes.EXTENSION,

  create: (instance: IInstance) => new FreeWheelExtension(instance),

  isSupported: ({ config }: { config: Config }): boolean => {
    return (config.freewheel && config.freewheel?.clientSide) || false;
  },
} as IModuleLoader<FreeWheelExtension>;
