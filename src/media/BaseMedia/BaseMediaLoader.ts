import { ModuleLoaderTypes, IInstance, Format, FormatTypes, IModuleLoader } from "../../types";
import { BaseMedia } from "./BaseMedia";

export const BaseMediaLoader = {
  type: ModuleLoaderTypes.MEDIA,

  create: (instance: IInstance) => new BaseMedia(instance),

  isSupported: (instance: IInstance, format: Format): boolean => {
    if (
      format.type === FormatTypes.MP4 ||
      format.type === FormatTypes.MOV ||
      format.type === FormatTypes.WEBM
    ) {
      return true;
    }

    if (
      format.type === FormatTypes.HLS &&
      (instance.env.isSafari || instance.env.isIOS)
    ) {
      return true;
    }

    return false;
  },
} as IModuleLoader<BaseMedia>;
