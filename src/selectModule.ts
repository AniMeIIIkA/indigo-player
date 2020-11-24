import { createAllSupported, createFirstSupported } from './ModuleLoader';
import {
  Format,
  IController,
  IMedia,
  IModule,
  IPlayer,
  ModuleLoaderTypes,
} from './types';
import { IInstance } from './types/IInstance';

export async function selectMedia(
  instance: IInstance,
): Promise<[Format | null, IMedia | null]> {
  const sources: Format[] = instance.config.sources;

  for (const format of sources) {
    const media = await createFirstSupported<IMedia>(
      ModuleLoaderTypes.MEDIA,
      instance,
      format,
    );
    if (media) {
      return [format, media];
    }
  }

  return [null, null];
}

export async function selectPlayer(instance: IInstance): Promise<IPlayer | null> {
  return createFirstSupported<IPlayer>(ModuleLoaderTypes.PLAYER, instance);
}

export async function selectExtensions(
  instance: IInstance,
): Promise<IModule[]> {
  return createAllSupported<IModule>(ModuleLoaderTypes.EXTENSION, instance);
}

export async function selectController(instance: IInstance): Promise<IController | null> {
  return createFirstSupported<IController>(
    ModuleLoaderTypes.CONTROLLER,
    instance,
  );
}
