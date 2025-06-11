import * as PIXI from "pixi.js";
import { IntroScene } from "../scenes/introScene";
import { WeaponScene } from "../scenes/weaponScene";

export class SceneManager {
  #app;
  #currentScene = null;
  #bgSprite = null;
  stage;

  constructor(app) {
    this.#app = app;
    this.stage = app.stage;

    this._initBackground();

    window.addEventListener("resize", () => {
      this._onResize();
    });
  }

  _initBackground() {
    const res = PIXI.Loader.shared.resources.main_bg;
    if (res && res.texture) {
      this.#bgSprite = new PIXI.Sprite(res.texture);
      this.#bgSprite.anchor.set(0.5);
      this.stage.addChildAt(this.#bgSprite, 0);
      this._resizeBackground();
    } else {
      console.warn("SceneManager: texture 'main_bg' not found in resources.");
    }
  }

  _resizeBackground() {
    if (!this.#bgSprite) return;
    const rw = this.rendererWidth;
    const rh = this.rendererHeight;
    const tex = this.#bgSprite.texture;
    const scale = Math.max(rw / tex.width, rh / tex.height);
    this.#bgSprite.scale.set(scale);
    this.#bgSprite.x = rw / 2;
    this.#bgSprite.y = rh / 2;
  }

  _onResize() {
    this._resizeBackground();
    if (
      this.#currentScene &&
      typeof this.#currentScene.onResize === "function"
    ) {
      this.#currentScene.onResize(this.rendererWidth, this.rendererHeight);
    }
  }

  get rendererWidth() {
    return this.#app.renderer.width;
  }
  get rendererHeight() {
    return this.#app.renderer.height;
  }

  changeScene(key, params = {}) {
    // Удаляем предыдущую сцену
    if (this.#currentScene) {
      this.#currentScene.destroy({ children: true });
      this.stage.removeChild(this.#currentScene);
    }
    // Создаём новую
    let scene;
    switch (key) {
      case "intro":
        scene = new IntroScene(this);
        break;
      case "weapon":
        scene = new WeaponScene(this, params);
        break;
      default:
        throw new Error(`Unknown scene: ${key}`);
    }
    this.#currentScene = scene;

    this.stage.addChild(scene);

    scene.init();

    this._onResize();
  }

  update(delta) {
    this.#currentScene?.update(delta);
  }
}
