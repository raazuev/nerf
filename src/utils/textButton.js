import * as PIXI from "pixi.js";
import { SoundManager } from "./soundManager.js";

export class ButtonGame extends PIXI.Container {
  #background;
  #label;
  #width;
  #height;
  #paddingX;
  #paddingY;
  #style;
  #cornerRadius;
  #colors;

  constructor(text, options = {}) {
    super();

    this.#paddingX = options.paddingX ?? 20;
    this.#paddingY = options.paddingY ?? 10;
    this.#style = options.style ?? {
      fill: "#ffffff",
      fontSize: 40,
      fontFamily: "EurostileBold",
    };
    this.#colors = {
      background: options.colors?.background ?? 0x09d1e1,
      hover: options.colors?.hover ?? 0xf47921,
      active: options.colors?.active ?? 0xf47921,
      text: options.colors?.text ?? "#02132a",
    };
    this.#cornerRadius = options.cornerRadius ?? 1;

    this.#label = new PIXI.Text(text, {
      ...this.#style,
      fill: this.#colors.text,
    });
    this.addChild(this.#label);

    const textBounds = this.#label.getLocalBounds();
    const txtW = textBounds.width;
    const txtH = textBounds.height;

    if (options.width) {
      this.#width = options.width;
    } else {
      this.#width = Math.ceil(txtW + this.#paddingX * 2);
    }
    if (options.height) {
      this.#height = options.height;
    } else {
      this.#height = Math.ceil(txtH + this.#paddingY * 2);
    }

    this.#background = new PIXI.Graphics();
    this.#drawBackground(this.#colors.background);
    this.addChildAt(this.#background, 0);

    this.#background.x = -this.#width / 2;
    this.#background.y = -this.#height / 2;
    this.#label.anchor.set(0.5);
    this.#label.x = 0;
    this.#label.y = 0;
    this.interactive = true;
    this.buttonMode = true;

    this.on("pointerover", () => {
      this.#drawBackground(this.#colors.hover);
    });
    this.on("pointerout", () => {
      this.#drawBackground(this.#colors.background);
    });
    this.on("pointerdown", () => {
      this.#drawBackground(this.#colors.active);
    });
    this.on("pointerup", () => {
      this.#drawBackground(this.#colors.hover);
    });

    this.#drawBackground(this.#colors.background);
    this._adaptTextScale();
  }

  #drawBackground(color) {
    const g = this.#background;
    g.clear();
    g.beginFill(color);
    g.drawRoundedRect(0, 0, this.#width, this.#height, this.#cornerRadius);
    g.endFill();
  }

  _adaptTextScale() {
    if (!this.#label) return;
    this.#label.scale.set(1);

    const textBounds = this.#label.getLocalBounds();
    const textW = textBounds.width;
    const textH = textBounds.height;

    const availW = this.#width - 2 * this.#paddingX;
    const availH = this.#height - 2 * this.#paddingY;

    if (textW <= 0 || textH <= 0 || availW <= 0 || availH <= 0) {
      return;
    }
    const scaleX = availW / textW;
    const scaleY = availH / textH;
    const scaleFactor = Math.min(scaleX, scaleY, 1);
    this.#label.scale.set(scaleFactor);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  onClick(callback) {
    this.on("pointertap", (e) => {
      SoundManager.play("button_click");
      callback(e);
    });
  }

  setSize(width, height) {
    this.#width = width;
    this.#height = height;
    this.#drawBackground(this.#colors.background);
    this.#background.x = -this.#width / 2;
    this.#background.y = -this.#height / 2;
    this._adaptTextScale();
  }
}
