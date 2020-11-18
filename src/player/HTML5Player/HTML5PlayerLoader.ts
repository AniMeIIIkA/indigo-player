import { ModuleLoaderTypes, IInstance, Config, IModuleLoader } from "../../types";
import { HTML5Player } from "./HTML5Player";


export const HTML5PlayerLoader = {
  type: ModuleLoaderTypes.PLAYER,

  create: (instance: IInstance) => new HTML5Player(instance),

  isSupported: ({ config }: { config: Config }): boolean => true,
} as IModuleLoader<HTML5Player>;
