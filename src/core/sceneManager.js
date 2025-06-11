import * as PIXI from "pixi.js";
import { IntroScene } from "../scenes/introScene";
// При необходимости импортируйте другие сцены

export class SceneManager {
  #app;
  #currentScene = null;
  #bgSprite = null;
  stage;

  constructor(app) {
    this.#app = app;
    this.stage = app.stage;

    // Инициализируем фоновый спрайт, если текстура уже загружена
    this._initBackground();

    // Слушаем ресайз окна
    window.addEventListener("resize", () => {
      this._onResize();
    });
  }

  /**
   * Инициализация фонового спрайта на основе загруженной текстуры main_bg.
   * Добавляется в stage на индекс 0 (самый нижний слой).
   */
  _initBackground() {
    const res = PIXI.Loader.shared.resources.main_bg;
    if (res && res.texture) {
      this.#bgSprite = new PIXI.Sprite(res.texture);
      this.#bgSprite.anchor.set(0.5);
      // Добавляем на stage под все остальные объекты:
      this.stage.addChildAt(this.#bgSprite, 0);
      // Устанавливаем первоначальные размеры/положение:
      this._resizeBackground();
    } else {
      console.warn("SceneManager: texture 'main_bg' not found in resources.");
    }
  }

  /**
   * Масштабирует и позиционирует фоновой спрайт по текущим размерам renderer.
   * Использует стратегию cover (фон заполняет всё окно с возможной обрезкой).
   */
  _resizeBackground() {
    if (!this.#bgSprite) return;
    const rw = this.rendererWidth;
    const rh = this.rendererHeight;
    const tex = this.#bgSprite.texture;
    // Cover-поведение: фон заполняет весь экран, сохраняя пропорции,
    // обрезается по избыточной стороне.
    const scale = Math.max(rw / tex.width, rh / tex.height);
    this.#bgSprite.scale.set(scale);
    this.#bgSprite.x = rw / 2;
    this.#bgSprite.y = rh / 2;
  }

  /**
   * Обработка ресайза: сначала фон, затем текущая сцена.
   */
  _onResize() {
    // Обновляем фон
    this._resizeBackground();
    // Обновляем активную сцену
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

  /**
   * Смена сцены: удаляем предыдущую, создаём новую, добавляем поверх фонового спрайта, вызываем init и onResize.
   */
  changeScene(key) {
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
      // case "weapon-select":
      //   scene = new WeaponSelectScene(this);
      //   break;
      // Добавьте прочие сцены по ключам
      default:
        throw new Error(`Unknown scene: ${key}`);
    }
    this.#currentScene = scene;
    // Добавляем сцену поверх фонового спрайта
    this.stage.addChild(scene);
    // Инициализируем логику сцены
    scene.init();

    // Сразу подгоняем фон и сцену под текущие размеры
    this._onResize();
  }

  update(delta) {
    this.#currentScene?.update(delta);
  }
}
