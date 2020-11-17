import { ErrorCodes, IPlayerError } from '@src/types';
export declare class PlayerError extends Error implements IPlayerError {
    code: ErrorCodes;
    underlyingError: any;
    constructor(input: ErrorCodes | string, error?: any);
}
