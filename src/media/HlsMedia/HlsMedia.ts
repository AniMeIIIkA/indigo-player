
import HlsJs from 'axl-hls.js';
import { PlayerError } from '../../PlayerError';
import { Events, ITracksEventData, ITrackChangeEventData, ErrorCodes, ITrack } from '../../types';
import { Media } from '../Media';

export class HlsMedia extends Media {
  public name: string = 'HlsMedia';

  public player: HlsJs;
  public isSourceLoaded: boolean;

  public async load() {
    await super.load();

    this.player = new HlsJs(this.instance.config.hlsConfig ?? {
      autoStartLoad: false,
      enableWorker: false
    });
    this.isSourceLoaded = false;

    const mediaElement: HTMLMediaElement = (this.instance.getModule(
      'HTML5Player',
    ) as any).mediaElement;

    this.player.attachMedia(mediaElement);

    this.player.on(HlsJs.Events.MANIFEST_PARSED, (event, data) => {
      const tracks = data.levels
        .map(this.formatTrack)
        .sort((a, b) => b.bandwidth - a.bandwidth);

      this.emit(Events.MEDIA_STATE_TRACKS, {
        tracks,
      } as ITracksEventData);
    });

    this.player.on(HlsJs.Events.LEVEL_SWITCHED, (event, data) => {
      const level = data.level;

      this.emit(Events.MEDIA_STATE_TRACKCHANGE, {
        track: this.formatTrack(this.player.levels[level], level),
        auto: this.player.autoLevelEnabled,
      } as ITrackChangeEventData);
    });

    this.player.on(HlsJs.Events.ERROR, (event, data) => {
      if (!data.fatal && data.details != 'fragParsingError') {
        return;
      }

      if (data.type === HlsJs.ErrorTypes.NETWORK_ERROR) {
        this.player.startLoad();
      } else if (data.type === HlsJs.ErrorTypes.MEDIA_ERROR) {
        if (data.details == 'fragParsingError') {
          if (this.player.media != null && data.frag != null) {
            this.player.media.currentTime = data.frag.start + data.frag.duration + 1.0;
            this.player.startLoad(this.player.media.currentTime);
          }          
        } else {
          this.player.recoverMediaError();
        }        
      } else {
        this.instance.setError(
          new PlayerError(ErrorCodes.HLSJS_CRITICAL_ERROR, data),
        );
      }
    });
  }

  public async play() {
    if (!this.instance.format?.src) {
      return;
    }

    if (!this.isSourceLoaded) {
      this.isSourceLoaded = true;
      this.player.loadSource(this.instance.format!.src);
      this.player.startLoad();
    }

    const playTimeout = setTimeout(() => {
      super.play();
      clearTimeout(playTimeout);
    }, 200);
  }

  public seekTo(time: number) {
    if (time === Infinity) {
      if (this.player.liveSyncPosition)
        this.instance.player?.seekTo(this.player.liveSyncPosition!);
      return;
    }
    super.seekTo(time);
  }

  public unload() {
    if (this.player) {
      this.player.destroy();
    }
  }

  public selectTrack(track: ITrack | string) {
    if (track === 'auto') {
      this.player.currentLevel = -1;
    } else {
      this.player.currentLevel = (track as ITrack).id;
    }
  }

  private formatTrack = (track: any, id: number): ITrack => ({
    id,
    width: track.width,
    height: track.height,
    bandwidth: track.bitrate,
  });
}
