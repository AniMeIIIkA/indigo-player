import { Module } from "../../Module";
import { IInstance } from "../../types";
export declare class GoogleIMAExtension extends Module {
    name: string;
    private adContainer;
    private adDisplayContainer;
    private adsRequested;
    private adsLoader;
    private ima;
    private adsManager;
    private adBreaks;
    private currentAdBreak;
    constructor(instance: IInstance);
    private onInstanceInitialized;
    private onControllerPlay;
    private onControllerPause;
    private onControllerSetVolume;
    private onControllerSeekTo;
    private requestAds;
    private onAdsManagerLoaded;
    private onContentPauseRequested;
    private onContentResumeRequested;
    private onAdProgress;
    private onResumed;
    private onStarted;
    private onComplete;
    private updateAdBreakData;
}
