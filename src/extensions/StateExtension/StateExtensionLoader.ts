import { Instance } from "../../Instance";
import { ModuleLoaderTypes, Config, IModuleLoader } from "../../types";
import { StateExtension } from "./StateExtension";


export const StateExtensionLoader = {
  type: ModuleLoaderTypes.EXTENSION,

  create: (instance: Instance) => new StateExtension(instance),

  isSupported: ({ config }: { config: Config }): boolean => true,
} as IModuleLoader<StateExtension>;
