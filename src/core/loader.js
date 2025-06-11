import * as PIXI from "pixi.js";

export class Loader {
  static init(loader = PIXI.Loader.shared) {
    this.loader = loader;
    return this;
  }

  static addAssets(assets) {
    assets.forEach(({ name, url }) => {
      this.loader.add(name, url);
    });
    return this;
  }

  static load(onComplete) {
    this.loader.load(onComplete);
  }
}
