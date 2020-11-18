import { Controller } from './controller/Controller';
import { createAPI } from './createAPI';
import { Instance } from './Instance';
import { Media } from './media/Media';
import { Module } from './Module';
import { addModuleLoader } from './ModuleLoader';
import { Player } from './player/Player';
import { Config, ErrorCodes, Events, ModuleLoaderTypes } from './types';
import { setConsoleLogs } from './utils/log';

export default {
  setConsoleLogs,
  init(element: HTMLElement | string, config: Config) {
    const instance = new Instance(element, config);
    return createAPI(instance);
  },
  addModuleLoader,

  // Export enums
  Events,
  ErrorCodes,
  ModuleLoaderTypes,

  // Export class constructors
  Module,
  Controller,
  Media,
  Player,
};
