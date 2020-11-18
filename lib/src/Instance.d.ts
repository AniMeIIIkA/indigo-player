import './styles.scss';
import { Config, EventCallback, Format, IController, IEnv, IEventData, IInstance, IMedia, IModule, IPlayer, IPlayerError, ITrack } from './types';
import { log } from './utils/log';
import EventEmitter from 'eventemitter3';
export declare class Instance implements IInstance {
    /**
     * The initial player config.
     * @type {Config}
     */
    config: Config;
    /**
     * The root container.
     * @type {HTMLElement}
     */
    container: HTMLElement;
    /**
     * Container specifically for the video element.
     * @type {HTMLElement}
     */
    playerContainer: HTMLElement;
    adsContainer: HTMLElement;
    uiContainer: HTMLElement;
    env: IEnv;
    controller: IController | null;
    player: IPlayer | null;
    media: IMedia | null;
    format: Format | null;
    extensions: IModule[];
    log: typeof log;
    storage: {
        set: (key: string, value: any) => void;
        get: (key: string, defaultValue: any) => any;
    };
    /**
     * Allow the instance to emit and listen to events.
     * @type {EventEmitter}
     */
    private emitter;
    constructor(element: HTMLElement | string, config: Config);
    on: (name: string, callback: EventCallback) => EventEmitter<string | symbol>;
    once: (name: string, callback: EventCallback) => EventEmitter<string | symbol>;
    removeListener: (name: string, callback: EventCallback) => EventEmitter<string | symbol>;
    emit: (name: string, eventData?: IEventData | undefined) => boolean;
    play(): void;
    pause(): void;
    seekTo(time: number): void;
    setVolume(volume: number): void;
    selectTrack(track: ITrack): void;
    selectAudioLanguage(language: string): void;
    setPlaybackRate(playbackRate: number): void;
    setError(error: IPlayerError): void;
    canAutoplay(): boolean;
    destroy(): void;
    getStats(): {
        config: Config;
        controller: (string | IController | null | undefined)[];
        media: (string | IMedia | null | undefined)[];
        player: (string | IPlayer | null | undefined)[];
        extensions: (string | IModule)[][];
    };
    getModule(name: string): IModule | null;
    private createContainers;
    private init;
}
