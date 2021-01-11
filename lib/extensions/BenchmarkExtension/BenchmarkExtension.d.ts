import { Module } from "../../Module";
import { IInstance } from "../../types/IInstance";
export declare class BenchmarkExtension extends Module {
    name: string;
    startupTimeExtension: number;
    startupTimePlayer: number;
    startupTimeInstance: number;
    startupTimeWithAutoplay: number;
    constructor(instance: IInstance);
}
