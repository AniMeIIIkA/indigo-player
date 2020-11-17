import { Module } from '@src/Module';
import { IInstance } from '@src/types';
export declare class BenchmarkExtension extends Module {
    name: string;
    startupTimeExtension: number;
    startupTimePlayer: number;
    startupTimeInstance: number;
    startupTimeWithAutoplay: number;
    constructor(instance: IInstance);
}
