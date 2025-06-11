import { IntroScene } from "../scenes/introScene";

export class SceneManager {
  #app;
  #currentScene = null;
  stage;

  constructor(app) {
    this.#app = app;
    this.stage = app.stage;

    // Слушаем ресайз окна
    window.addEventListener("resize", () => {
      const rw = this.rendererWidth;
      const rh = this.rendererHeight;
      if (
        this.#currentScene &&
        typeof this.#currentScene.onResize === "function"
      ) {
        this.#currentScene.onResize(rw, rh);
      }
    });
  }

  get rendererWidth() {
    return this.#app.renderer.width;
  }
  get rendererHeight() {
    return this.#app.renderer.height;
  }

  changeScene(key) {
    if (this.#currentScene) {
      this.#currentScene.destroy({ children: true });
      this.stage.removeChild(this.#currentScene);
    }
    let scene;
    switch (key) {
      case "intro":
        scene = new IntroScene(this);
        break;
      default:
        throw new Error(`Unknown scene: ${key}`);
    }
    this.#currentScene = scene;
    this.stage.addChild(scene);
    scene.init();

    const rw = this.rendererWidth;
    const rh = this.rendererHeight;
    if (typeof scene.onResize === "function") {
      scene.onResize(rw, rh);
    }
  }

  update(delta) {
    this.#currentScene?.update(delta);
  }
}
