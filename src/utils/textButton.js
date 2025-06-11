import * as PIXI from "pixi.js";

export class ButtonGame extends PIXI.Container {
  #label;

  constructor(text, style = {}) {
    super();

    this.#label = new PIXI.Text(text, {
      fill: "blue",
      fontSize: 48,
      fontFamily: "Arial",
      align: "center",
      ...style,
    });

    this.addChild(this.#label);
    this.#label.anchor.set(0.5);
    this.#label.x = 0;
    this.#label.y = 0;

    this.interactive = true;
    this.buttonMode = true;

    this.on("pointerover", () => {
      this.scale.set(1.05);
    });
    this.on("pointerout", () => {
      this.scale.set(1);
    });
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  onClick(callback) {
    this.on("pointertap", callback);
  }
}
