import { Module } from "../../Module";
import { KeyboardNavigationPurpose, Events, IKeyboardNavigationKeyDownEventData } from "../../types";
import { IInstance } from "../../types/IInstance";
import { FullscreenExtension } from "../FullscreenExtension/FullscreenExtension";
import { StateExtension } from "../StateExtension/StateExtension";

enum KeyCodes {
  SPACEBAR = 32,
  K = 75,
  LEFT_ARROW = 37,
  RIGHT_ARROW = 39,
  UP_ARROW = 38,
  DOWN_ARROW = 40,
  M = 77,
  F = 70,
  C = 67,
  I = 73,
}

export const SKIP_CURRENTTIME_OFFSET: number = 15;

export const SKIP_VOLUME_OFFSET: number = 0.1;

export class KeyboardNavigationExtension extends Module {
  public name: string = 'KeyboardNavigationExtension';

  private hasFocus: boolean;

  constructor(instance: IInstance) {
    super(instance);

    (window as any).addEventListener('keydown', this.onKeyDown);
    (window as any).addEventListener('mousedown', this.onMouseDown);
  }

  public triggerFocus() {
    this.hasFocus = true;
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (this.instance.config.keyboardNavigation === 'focus' && !this.hasFocus) {
      return;
    }

    const currentTime = this.getState().currentTime || 0;
    const duration = this.getState().duration || 0;

    switch (event.which || event.keyCode) {
      // Toggles play and pause.
      case KeyCodes.SPACEBAR:
      case KeyCodes.K:
        if (this.getState().playRequested) {
          this.instance.pause();
          this.emitPurpose(KeyboardNavigationPurpose.PAUSE);
        } else {
          this.instance.play();
          this.emitPurpose(KeyboardNavigationPurpose.PLAY);
        }
        event.preventDefault();
        break;

      // Seeks back x seconds.
      case KeyCodes.LEFT_ARROW:
        let prevTime = currentTime - SKIP_CURRENTTIME_OFFSET;
        if (prevTime < 0) {
          prevTime = 0;
        }
        this.instance.seekTo(prevTime);
        this.emitPurpose(KeyboardNavigationPurpose.PREV_SEEK);
        event.preventDefault();
        break;

      // Seeks forward x seconds.
      case KeyCodes.RIGHT_ARROW:
        let nextTime = currentTime + SKIP_CURRENTTIME_OFFSET;
        if (nextTime > duration) {
          nextTime = duration;
        }
        this.instance.seekTo(nextTime);
        this.emitPurpose(KeyboardNavigationPurpose.NEXT_SEEK);
        event.preventDefault();
        break;

      // Increases the volume.
      case KeyCodes.UP_ARROW:
        let nextVolume = this.getState().volume + SKIP_VOLUME_OFFSET;
        if (nextVolume > 1) {
          nextVolume = 1;
        }
        this.instance.setVolume(nextVolume);
        this.emitPurpose(KeyboardNavigationPurpose.VOLUME_UP);
        event.preventDefault();
        break;

      // Decreases the volume.
      case KeyCodes.DOWN_ARROW:
        let prevVolume = this.getState().volume - SKIP_VOLUME_OFFSET;
        if (prevVolume < 0) {
          prevVolume = 0;
        }
        this.instance.setVolume(prevVolume);
        this.emitPurpose(KeyboardNavigationPurpose.VOLUME_DOWN);
        event.preventDefault();
        break;

      // Toggles mute.
      case KeyCodes.M:
        if (this.getState().volume > 0) {
          this.instance.setVolume(0);
          this.emitPurpose(KeyboardNavigationPurpose.VOLUME_MUTED);
        } else {
          this.instance.setVolume(1);
          this.emitPurpose(KeyboardNavigationPurpose.VOLUME_UNMUTED);
        }
        event.preventDefault();
        break;

      // Toggles fullscreen.
      case KeyCodes.F:
        const fullscreenExtension: FullscreenExtension = this.instance.getModule(
          'FullscreenExtension',
        ) as FullscreenExtension;
        if (fullscreenExtension) {
          fullscreenExtension.toggleFullscreen();
          this.emitPurpose(KeyboardNavigationPurpose.TOGGLE_FULLSCREEN);
          event.preventDefault();
        }
        break;

      case KeyCodes.C:
        this.emitPurpose(KeyboardNavigationPurpose.REQUEST_TOGGLE_SUBTITLES);
        event.preventDefault();
        break;

      case KeyCodes.I:
        this.emitPurpose(KeyboardNavigationPurpose.REQUEST_TOGGLE_MINIPLAYER);
        event.preventDefault();
        break;
    }
  };

  private onMouseDown = (event: MouseEvent) => {
    this.hasFocus = this.instance.container.contains(event.target as Node);
  };

  private getState() {
    return (this.instance.getModule(
      'StateExtension',
    ) as StateExtension).getState();
  }

  private emitPurpose(purpose: KeyboardNavigationPurpose) {
    this.instance.emit(Events.KEYBOARDNAVIGATION_KEYDOWN, {
      purpose,
    } as IKeyboardNavigationKeyDownEventData);
  }
}
