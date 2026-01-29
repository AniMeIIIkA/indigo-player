
import * as sfDefault from 'screenfull';
import { Module } from '../../Module';
import { IEventData, Events } from '../../types';
import { IInstance } from '../../types/IInstance';

// Handle ESM/CommonJS: real API may be on .default
const screenfull = (sfDefault as any).default ?? sfDefault;

interface IFullscreenEventData extends IEventData {
  fullscreen: boolean;
}

/** Cross-browser fullscreen element check (fallback when screenfull.isFullscreen is undefined). */
function getFullscreenElement(): Element | null {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    msFullscreenElement?: Element | null;
  };
  return (
    document.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.msFullscreenElement ??
    null
  );
}

export class FullscreenExtension extends Module {
  public name: string = 'FullscreenExtension';

  private documentPos: {
    x: number;
    y: number;
  } | null;

  constructor(instance: IInstance) {
    super(instance);

    if (screenfull.isEnabled) {
      this.emit(Events.FULLSCREEN_SUPPORTED);

      screenfull.on('change', () => {
        const fullscreen: boolean =
          screenfull.isFullscreen ?? Boolean(getFullscreenElement());

        this.handleDocumentPos(fullscreen);

        this.emit(Events.FULLSCREEN_CHANGE, {
          fullscreen,
        } as IFullscreenEventData);
      });
    }
  }

  public toggleFullscreen() {
    if (screenfull.isEnabled) {
      screenfull.toggle(this.instance.container);
    }
  }

  // Code below evades the following Chromium bug:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=142427.
  private handleDocumentPos(isFullscreen: boolean) {
    if (isFullscreen) {
      const x = window.pageXOffset;
      const y = window.pageYOffset;
      if (x || y) {
        this.documentPos = {
          x: x || 0,
          y: y || 0,
        };
      }
    } else {
      if (!this.documentPos) {
        return;
      }

      window.scrollTo(this.documentPos.x, this.documentPos.y);
      this.documentPos = null;
    }
  }
}
