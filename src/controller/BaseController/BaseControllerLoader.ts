import { ModuleLoaderTypes, IInstance, Config, IModuleLoader } from "../../types";
import { BaseController } from "./BaseController";


export const BaseControllerLoader = {
  type: ModuleLoaderTypes.CONTROLLER,

  create: (instance: IInstance) => new BaseController(instance),

  isSupported: ({ config }: { config: Config }): boolean => {
    return config.sources.length > 0;
  },
} as IModuleLoader<BaseController>;
