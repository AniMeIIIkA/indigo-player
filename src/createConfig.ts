
import merge from 'deepmerge';
import { Config } from './types';
import { deprecate } from './utils/deprecate';

export function createConfig(input: Config): Config {
  if (typeof input.ui !== 'object') {
    (input.ui as any) = {};
    deprecate(
      'Using config.ui as a boolean is deprecated, use an object with the UI specific options instead. See docs for your migration.',
    );
  }

  if (typeof (input as any).uiOptions === 'object') {
    (input as any).ui = (input as any).uiOptions;
    deprecate('Using config.uiOptions has been removed in favor of config.ui.');

    if ((input as any).uiOptions.enablePip) {
      input.ui.pip = (input as any).uiOptions.enablePip;
    }
  }

  if (typeof input.thumbnails !== 'object' && input?.thumbnails) {
    input.thumbnails = {
      src: input.thumbnails,
    };
    deprecate(
      'Using config.thumbnails as a string is deprecated, use { src: "./thumbnails.vtt" } instead.',
    );
  }

  if ((input as any).captions) {
    input.subtitles = (input as any).captions;
    deprecate('config.captions has been changed to config.subtitles');
  }

  return merge<Config>(
    {
      enableLogs: false,
      autoplay: false,
      keyboardNavigation: 'focus',
      aspectRatio: 16 / 9,
      volume: 1,
      ui: {
        enabled: true,
        showControls: true,
        locale: 'en-US',
        pip: false,
        playbackRate: true
      },
      sources: [],
      subtitles: [],
    },
    input,
  );
}
