import { ModuleLoaderTypes, IInstance, Config, IModuleLoader } from "../../types";
import { DimensionsExtension } from "./DimensionsExtension";

export const DimensionsExtensionLoader = {
  type: ModuleLoaderTypes.EXTENSION,

  create: (instance: IInstance) => new DimensionsExtension(instance),

  isSupported: ({ config }: { config: Config }): boolean => true,
} as IModuleLoader<DimensionsExtension>;
