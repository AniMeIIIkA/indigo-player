import { Media } from "../Media";


export class BaseMedia extends Media {
  public name: string = 'BaseMedia';

  public async load() {
    await super.load();

    if (this.instance.format?.src)
      this.instance.player?.setSource(this.instance.format?.src);
  }
}
