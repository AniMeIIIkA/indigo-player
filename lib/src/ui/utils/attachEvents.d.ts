interface EventDefinition {
    element: HTMLElement;
    events: string[];
    callback: any;
    passive?: boolean;
}
export declare type EventUnsubscribeFn = () => void;
export declare function attachEvents(defs: EventDefinition[]): EventUnsubscribeFn;
export {};
