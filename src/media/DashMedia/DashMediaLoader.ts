import { ModuleLoaderTypes, Format, FormatTypes, IModuleLoader } from "../../types";
import { IInstance } from "../../types/IInstance";
import { getDrmSupport } from "../../utils/getDrmSupport";
import { DashMedia } from "./DashMedia";
import { isBrowserSupported, isBrowserSupportedDRM } from "./isBrowserSupported";


export const DashMediaLoader = {
  type: ModuleLoaderTypes.MEDIA,

  create: (instance: IInstance) => new DashMedia(instance),

  isSupported: async (
    instance: IInstance,
    format: Format,
  ): Promise<boolean> => {
    if (instance.player?.name !== 'HTML5Player') {
      return false;
    }

    if (format.type !== FormatTypes.DASH) {
      return false;
    }

    if (!isBrowserSupported()) {
      return false;
    }

    if (format.drm) {
      if (!isBrowserSupportedDRM()) {
        return false;
      }

      const support: any = await getDrmSupport();
      if (!support.drmSupport.widevine && !support.drmSupport.playready) {
        return false;
      }
    }

    return true;
  },
} as IModuleLoader<DashMedia>;
