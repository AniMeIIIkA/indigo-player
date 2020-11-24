import React, { RefObject } from 'react';
import { Subtitle, IThumbnail, KeyboardNavigationPurpose } from '../types';
import { IInstance } from '../types/IInstance';
import { SettingsTabs, IStateStore } from './types';
export declare const StateContext: React.Context<{}>;
interface StateStoreProps {
    instance: IInstance;
    player: any;
}
interface StateStoreState {
    visibleControls: boolean;
    isSeekbarHover: boolean;
    isSeekbarSeeking: boolean;
    seekbarPercentage: number;
    isVolumeControlsOpen: boolean;
    isVolumebarSeeking: boolean;
    settingsTab: SettingsTabs | null;
    lastActiveSubtitle: Subtitle | null;
    activeThumbnail: IThumbnail | null;
    nodPurpose: KeyboardNavigationPurpose | any;
}
export declare const seekbarRef: RefObject<HTMLDivElement>;
export declare const seekbarTooltipRef: RefObject<HTMLDivElement>;
export declare const seekbarThumbnailRef: RefObject<HTMLDivElement>;
export declare class StateStore extends React.Component<StateStoreProps, StateStoreState> implements IStateStore {
    private activeTimer;
    private nodTimer;
    private unsubscribe;
    private prevData;
    constructor(props: any);
    componentWillUnmount(): void;
    componentDidUpdate(): void;
    render(): JSX.Element;
    showControls: () => void;
    private hideControls;
    private triggerNod;
    private setVolumeControlsOpen;
    private setSeekbarState;
    private setVolumebarState;
    private toggleMute;
    private playOrPause;
    private toggleFullscreen;
    private selectTrack;
    private setPlaybackRate;
    private closeSettings;
    private toggleSettings;
    private setSettingsTab;
    private selectSubtitle;
    private toggleActiveSubtitle;
    private togglePip;
    private getTranslation;
    /**
     * Create a state snapshot for the player.
     * @return {IData} The snapshot data
     */
    private createData;
    /**
     * Create actions for the UI to interact with.
     * @return {IActions} The actions
     */
    private createActions;
}
export {};
