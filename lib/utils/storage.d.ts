/**
 * Store a key value pair locally.
 * @param {string} key   The key
 * @param {any}    value Any serializable value
 */
declare function setLocalStorage(key: string, value: any): void;
/**
 * Get value by key locally
 * @param {string} key The key
 */
declare function getLocalStorage(key: string, defaultValue: any): any;
export declare const storage: {
    set: typeof setLocalStorage;
    get: typeof getLocalStorage;
};
export {};
