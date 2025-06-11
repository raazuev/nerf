import * as PIXI from "pixi.js";

// BaseScene.js
export class BaseScene extends PIXI.Container {
  #manager;
  constructor(manager) {
    super();
    this.#manager = manager;
  }
  get _manager() {
    return this.#manager;
  }
  init() {
    /* обязателен override */
  }
  update(delta) {}
  destroy(options) {
    super.destroy(options);
  }
}
