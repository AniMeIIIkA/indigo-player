export declare const BIF_INDEX_OFFSET = 64;
export declare const NUMBER_OF_BIF_IMAGES_OFFSET = 12;
export declare const VERSION_OFFSET = 8;
export declare const BIF_INDEX_ENTRY_LENGTH = 8;
export declare const MAGIC_NUMBER: Uint8Array;
/**
 * Parsing and read BIF file format.
 *
 * @param {ArrayBuffer} arrayBuffer
 */
export default class BIFParser {
    arrayBuffer: any;
    data: any;
    numberOfBIFImages: any;
    version: any;
    bifIndex: any;
    bifDimensions: any;
    constructor(arrayBuffer: any);
    /**
     * Create the BIF index
     * SEE: https://sdkdocs.roku.com/display/sdkdoc/Trick+Mode+Support#TrickModeSupport-BIFindex
     *
     * @returns {Array} bifIndex
     */
    generateBIFIndex(): any[];
    /**
     * Return image dimension data for a specific image source
     *
     * @returns {object} Promise
     */
    getInitialImageDimensions(): void;
    /**
     * Return image data for a specific frame of a movie.
     *
     * @param {number} second
     * @returns {string} imageData
     */
    getImageDataAtSecond(second: any): "data:image/jpeg;base64," | {
        start: number;
        src: string;
        x: number;
        y: number;
        width: any;
        height: any;
    };
    /**
     * Return image data for all BIF files.
     *
     * @returns {string} imageData
     */
    getImageData(): any[];
}
