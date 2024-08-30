import { Config, IEnv, IController, IPlayer, IMedia, Format, IModule, LogFunction, ITrack, EventCallback, IEventData, IPlayerError, WatermarkConfig } from "./index";


export interface IInstance {
  config: Config;
  container: HTMLElement;
  playerContainer: HTMLElement;
  uiContainer: HTMLElement;
  adsContainer: HTMLElement;

  env: IEnv;
  controller: IController | null;
  player: IPlayer | null;
  media: IMedia | null;
  format: Format | null;
  extensions: IModule[];

  storage: any; // TODO: Proper type
  log(namespace: string): LogFunction;

  // Methods
  play(): any;
  pause(): any;
  seekTo(time: number): any;
  setVolume(volume: number): any;
  selectTrack(track: ITrack): any;
  selectAudioLanguage(language: string): any;
  setPlaybackRate(playbackRate: number): any;
  setWatermark(config: Partial<WatermarkConfig>): any;
  destroy: any;

  on(name: string, callback: EventCallback): any;
  once(name: string, callback: EventCallback): any;
  removeListener(name: string, callback: EventCallback): any;
  emit(name: string, eventData?: IEventData): any;

  setError(error: IPlayerError): any;
  canAutoplay(): boolean;

  getModule(name: string): IModule | null;
  getStats(): any;
}
