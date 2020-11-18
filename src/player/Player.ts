import { Module } from "../Module";
import { IPlayer } from "../types";


export class Player extends Module implements IPlayer {
  public load() { }

  public unload() { }

  public play() { }

  public pause() { }

  public seekTo(time: number) { }

  public setVolume(volume: number) { }

  public setSource(src: string) { }

  public setPlaybackRate(playbackRate: number) { }
}
