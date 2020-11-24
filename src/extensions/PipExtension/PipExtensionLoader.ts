import { ModuleLoaderTypes, Config, IModuleLoader } from "../../types";
import { IInstance } from "../../types/IInstance";
import { PipExtension } from "./PipExtension";


export const PipExtensionLoader = {
  type: ModuleLoaderTypes.EXTENSION,

  create: (instance: IInstance) => new PipExtension(instance),

  isSupported: ({ config }: { config: Config }): boolean => true,
} as IModuleLoader<PipExtension>;
