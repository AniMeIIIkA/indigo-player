import { ModuleLoaderTypes, Config, IModuleLoader } from "../../types";
import { IInstance } from "../../IInstance";
import { KeyboardNavigationExtension } from "./KeyboardNavigationExtension";


export const KeyboardNavigationExtensionLoader = {
  type: ModuleLoaderTypes.EXTENSION,

  create: (instance: IInstance) =>
    new KeyboardNavigationExtension(instance),

  isSupported: ({ config }: { config: Config }): boolean =>
    !!config.keyboardNavigation,
} as IModuleLoader<KeyboardNavigationExtension>;
