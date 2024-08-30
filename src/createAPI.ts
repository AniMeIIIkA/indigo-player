import { PlayerError } from "./PlayerError";
import { EventCallback, IEventData, ITrack, WatermarkConfig } from "./types";
import { IInstance } from "./types/IInstance";
import { createFunctionFn } from "./utils/defineProperty";

export type IndigoPlayerApi = {
  on: (event: string, cb: () => any) => void;
  once: (event: string, cb: () => any) => void;
  removeListener: (event: string) => void;
  destroy: () => void;
  setError: (error: PlayerError) => void;
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  selectTrack: (track: ITrack) => void;
  selectAudioLanguage: (language: string) => void;
  setPlaybackRate: (playbackRate: number) => void;
  setWatermark: (config: Partial<WatermarkConfig>) => void;
}

/**
 * Defines the public API, this is the return value of init().
 * @param  {IInstance} instance
 * @return {Object}   External API.
 */
export function createAPI(instance: IInstance): IndigoPlayerApi {
  const api: any = {};

  const createFunction = createFunctionFn(api);

  [
    // Bind listeners continuously
    [
      'on',
      (name: string, callback: EventCallback) => instance.on(name, callback),
    ],

    // Bind listeners once
    [
      'once',
      (name: string, callback: EventCallback) => instance.once(name, callback),
    ],

    // Remove a listener
    [
      'removeListener',
      (name: string, callback: EventCallback) =>
        instance.removeListener(name, callback),
    ],

    // Emit an event on the listeners
    [
      'emit',
      (name: string, eventData?: IEventData) => instance.emit(name, eventData),
    ],

    // Play
    ['play', () => instance.play()],

    // Pause
    ['pause', () => instance.pause()],

    // Seek to a time
    ['seekTo', (time: number) => instance.seekTo(time)],

    // Set the volume
    ['setVolume', (volume: number) => instance.setVolume(volume)],

    // Select a track
    ['selectTrack', (track: ITrack) => instance.selectTrack(track)],

    // Select an audio language
    [
      'selectAudioLanguage',
      (language: string) => instance.selectAudioLanguage(language),
    ],

    // Select playback rate
    [
      'setPlaybackRate',
      (playbackRate: number) => instance.setPlaybackRate(playbackRate),
    ],

    // Set a fatal error
    ['setError', (error: PlayerError) => instance.setError(error)],

    // Destroy the player
    ['destroy', () => instance.destroy()],

    // Get stats
    ['getStats', () => instance.getStats()],

    // Get a specific module by name
    ['getModule', (name: string) => instance.getModule(name)],

    // Set watermark
    ['setWatermark', (config: Partial<WatermarkConfig>) => instance.setWatermark(config)],
  ].forEach(tuple => createFunction(tuple[0], tuple[1]));

  api._getInstanceForDev = () => instance;

  return api;
}
