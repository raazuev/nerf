import { IntroScene } from "../scenes/introScene";

export class SceneManager {
  #app;
  #currentScene = null;

  constructor(app) {
    this.#app = app;
    this.stage = app.stage;
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
  }

  update(delta) {
    this.#currentScene?.update(delta);
  }
}
