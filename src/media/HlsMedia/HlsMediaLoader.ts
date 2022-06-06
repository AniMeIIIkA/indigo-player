import Hls from 'axl-hls.js';
import { ModuleLoaderTypes, Format, FormatTypes, IModuleLoader } from '../../types';
import { IInstance } from '../../types/IInstance';
import { HlsMedia } from './HlsMedia';

export const HlsMediaLoader = {
  type: ModuleLoaderTypes.MEDIA,

  create: (instance: IInstance) => new HlsMedia(instance),

  isSupported: (instance: IInstance, format: Format): boolean => {
    if (instance.player?.name !== 'HTML5Player') {
      return false;
    }

    if (format.type !== FormatTypes.HLS) {
      return false;
    }

    if (instance.env.isSafari || instance.env.isIOS) {
      return false;
    }

    if (!Hls.isSupported()) {
      return false;
    }

    return true;
  },
} as IModuleLoader<HlsMedia>;
