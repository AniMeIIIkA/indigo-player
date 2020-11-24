import { ModuleLoaderTypes, Config, IModuleLoader } from "../../types";
import { IInstance } from "../../types/IInstance";
import { SubtitlesExtension } from "./SubtitlesExtension";

export const SubtitlesExtensionLoader = {
  type: ModuleLoaderTypes.EXTENSION,

  create: (instance: IInstance) => new SubtitlesExtension(instance),

  isSupported: ({ config }: { config: Config }): boolean => {
    return config.subtitles && config.subtitles.length > 0;
  },
} as IModuleLoader<SubtitlesExtension>;
