import { Module } from "../Module";
import { IController, ITrack } from "../types";

export class Controller extends Module implements IController {
 
  public async load() { }

  public unload() { }

  public play() { }

  public pause() { }

  public seekTo(time: number) { }

  public setVolume(volume: number) { }

  public selectTrack(track: ITrack) { }

  public selectAudioLanguage(language: string) { }
  
  public setWatermark(value: string) { }

  public setPlaybackRate(playbackRate: number) { }
}
