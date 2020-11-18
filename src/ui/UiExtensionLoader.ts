import { Instance } from "../Instance";
import { ModuleLoaderTypes, Config, IModuleLoader } from "../types";
import { UiExtension } from "./UiExtension";

export const UiExtensionLoader = {
  type: ModuleLoaderTypes.EXTENSION,

  create: (instance: Instance) => new UiExtension(instance),

  isSupported: ({ config }: { config: Config }): boolean =>
    config.ui && config.ui.enabled,
} as IModuleLoader<UiExtension>;
