import { ModuleLoaderTypes, Config, IModuleLoader } from "../../types";
import { IInstance } from "../../IInstance";
import { ThumbnailsExtension } from "./ThumbnailsExtension";


export const ThumbnailsExtensionLoader = {
  type: ModuleLoaderTypes.EXTENSION,

  create: (instance: IInstance) => new ThumbnailsExtension(instance),

  isSupported: ({ config }: { config: Config }): boolean => {
    if (!config.thumbnails || !config.thumbnails.src) {
      return false;
    }

    const ext = config.thumbnails.src.split('.').pop();
    if (ext !== 'vtt' && ext !== 'bif') {
      return false;
    }

    return true;
  },
} as IModuleLoader<ThumbnailsExtension>;
