import { ModuleLoaderTypes, Config, IModuleLoader } from "../../types";
import { IInstance } from "../../types/IInstance";
import { ContextMenuExtension } from "./ContextMenuExtension";


export const ContextMenuExtensionLoader = {
  type: ModuleLoaderTypes.EXTENSION,

  create: (instance: IInstance) => new ContextMenuExtension(instance),

  isSupported: ({ config }: { config: Config }): boolean => true,
} as IModuleLoader<ContextMenuExtension>;
