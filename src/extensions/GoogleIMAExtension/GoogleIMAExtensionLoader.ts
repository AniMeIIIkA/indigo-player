import { ModuleLoaderTypes, Config, IModuleLoader } from "../../types";
import { IInstance } from "../../types/IInstance";
import { GoogleIMAExtension } from "./GoogleIMAExtension";


export const GoogleIMAExtensionLoader = {
  type: ModuleLoaderTypes.EXTENSION,

  create: (instance: IInstance) => new GoogleIMAExtension(instance),

  isSupported: ({ config }: { config: Config }): boolean => {
    return !!config.googleIMA;
  },
} as IModuleLoader<GoogleIMAExtension>;
