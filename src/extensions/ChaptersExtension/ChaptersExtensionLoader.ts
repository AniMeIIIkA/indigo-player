import { ModuleLoaderTypes, IModuleLoader } from '../../types';
import { IInstance } from '../../types/IInstance';
import { ChaptersExtension } from './ChaptersExtension';

export const ChaptersExtensionLoader = {
  type: ModuleLoaderTypes.EXTENSION,

  create: (instance: IInstance) => new ChaptersExtension(instance),

  // Always on: a player created without chapters still takes them later through `setChapters` (the admin preview updates live
  // while the chapters are being edited). Holding an empty list costs nothing.
  isSupported: (): boolean => true,
} as IModuleLoader<ChaptersExtension>;
