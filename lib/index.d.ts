import { Controller } from './controller/Controller';
import { Media } from './media/Media';
import { Module } from './Module';
import { addModuleLoader } from './ModuleLoader';
import { Player } from './player/Player';
import { Config, ErrorCodes, Events, ModuleLoaderTypes } from './types';
import { setConsoleLogs } from './utils/log';
declare const _default: {
    setConsoleLogs: typeof setConsoleLogs;
    init(element: HTMLElement | string, config: Config): any;
    addModuleLoader: typeof addModuleLoader;
    Events: typeof Events;
    ErrorCodes: typeof ErrorCodes;
    ModuleLoaderTypes: typeof ModuleLoaderTypes;
    Module: typeof Module;
    Controller: typeof Controller;
    Media: typeof Media;
    Player: typeof Player;
};
export default _default;
