/**
 * Enable or disable logs.
 * @param {boolean} consoleLogsEnabled Enabled or not
 */
export declare function setConsoleLogs(consoleLogsEnabled: boolean): void;
/**
 * Creates a logger function for a specific namespace.
 * @param {string} namespace Namespace
 */
export declare function log(namespace: string): (first: any, ...args: any[]) => void;
