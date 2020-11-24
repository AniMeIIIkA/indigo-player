import { BaseControllerLoader } from './controller/BaseController/BaseControllerLoader';
import { BenchmarkExtensionLoader } from './extensions/BenchmarkExtension/BenchmarkExtensionLoader';
import { ContextMenuExtensionLoader } from './extensions/ContextMenuExtension/ContextMenuExtensionLoader';
import { FreeWheelExtensionLoader } from './extensions/FreeWheelExtension/FreeWheelExtensionLoader';
import { FullscreenExtensionLoader } from './extensions/FullscreenExtension/FullscreenExtensionLoader';
import { GoogleIMAExtensionLoader } from './extensions/GoogleIMAExtension/GoogleIMAExtensionLoader';
import { KeyboardNavigationExtensionLoader } from './extensions/KeyboardNavigationExtension/KeyboardNavigationExtensionLoader';
import { PipExtensionLoader } from './extensions/PipExtension/PipExtensionLoader';
import { StateExtensionLoader } from './extensions/StateExtension/StateExtensionLoader';
import { SubtitlesExtensionLoader } from './extensions/SubtitlesExtension/SubtitlesExtensionLoader';
import { ThumbnailsExtensionLoader } from './extensions/ThumbnailsExtension/ThumbnailsExtensionLoader';
import { DimensionsExtensionLoader } from './extensions/DimensionsExtension/DimensionsExtensionLoader';
import { BaseMediaLoader } from './media/BaseMedia/BaseMediaLoader';
import { DashMediaLoader } from './media/DashMedia/DashMediaLoader';
import { HlsMediaLoader } from './media/HlsMedia/HlsMediaLoader';
import { HTML5PlayerLoader } from './player/HTML5Player/HTML5PlayerLoader';
import {
  IModule,
  IModuleLoader,
  ModuleLoaderTypes,
} from './types';
import { UiExtensionLoader } from './ui/UiExtensionLoader';
import find from 'lodash/find';
import { IInstance } from './types/IInstance';

const modules: Array<IModuleLoader<IModule>> = [
  BaseControllerLoader,

  DashMediaLoader,
  HlsMediaLoader,
  BaseMediaLoader,

  HTML5PlayerLoader,

  PipExtensionLoader,
  UiExtensionLoader,
  StateExtensionLoader,
  BenchmarkExtensionLoader,
  FreeWheelExtensionLoader,
  FullscreenExtensionLoader,
  SubtitlesExtensionLoader,
  GoogleIMAExtensionLoader,
  ThumbnailsExtensionLoader,
  KeyboardNavigationExtensionLoader,
  ContextMenuExtensionLoader,
  DimensionsExtensionLoader,
];

export async function createFirstSupported<T>(
  type: ModuleLoaderTypes,
  instance: IInstance,
  isSupportedArgs?: any,
): Promise<T | null> {
  const items = modules.filter(item => item.type === type);

  for (const loader of items) {
    if (await loader.isSupported(instance, isSupportedArgs)) {
      return ((await loader.create(instance)) as unknown) as T;
    }
  }

  return null;
}

export async function createAllSupported<T>(
  type: ModuleLoaderTypes,
  instance: IInstance,
  isSupportedArgs?: any,
): Promise<T[]> {
  const items = modules.filter(item => item.type === type);

  const instances: T[] = [];

  for (const loader of items) {
    if (await loader.isSupported(instance, isSupportedArgs)) {
      instances.push(((await loader.create(instance)) as unknown) as T);
    }
  }

  return instances;
}

export function addModuleLoader(mod: IModuleLoader<IModule>) {
  modules.push(mod);
}
