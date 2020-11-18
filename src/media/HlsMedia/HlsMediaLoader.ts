
import { isSupported } from 'hls.js/src/is-supported';
import { ModuleLoaderTypes, IInstance, Format, FormatTypes, IModuleLoader } from '../../types';
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

    if (!isSupported()) {
      return false;
    }

    return true;
  },
} as IModuleLoader<HlsMedia>;
