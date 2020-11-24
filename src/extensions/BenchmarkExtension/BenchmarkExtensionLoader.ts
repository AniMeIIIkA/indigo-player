import { ModuleLoaderTypes, Config, IModuleLoader } from "../../types";
import { IInstance } from "../../IInstance";
import { BenchmarkExtension } from "./BenchmarkExtension";


export const BenchmarkExtensionLoader = {
  type: ModuleLoaderTypes.EXTENSION,

  create: (instance: IInstance) => new BenchmarkExtension(instance),

  isSupported: ({ config }: { config: Config }): boolean => true,
} as IModuleLoader<BenchmarkExtension>;
