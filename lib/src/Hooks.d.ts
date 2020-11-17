import { IHooks, IModule, NextHook } from '@src/types';
/**
 * @Hookable
 * Decorator to let a class know that methods inside can
 * be hooked.
 */
export declare function Hookable<T extends new (...args: any[]) => {}>(constructor: T): {
    new (...args: any[]): {
        hooks: Hooks;
    };
} & T;
declare class Hooks implements IHooks {
    private module;
    private hooks;
    private origFunctions;
    constructor(module: IModule);
    create(name: string, callback: NextHook): void;
    private hookFunction;
    private hookedFunction;
}
export {};
