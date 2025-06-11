import * as PIXI from "pixi.js";

export class WeaponItem extends PIXI.Container {
  #sprite;
  #label;
  #key;
  #onClick;

  constructor(key, options = {}) {
    super();
    this.#key = key;
    this.interactive = true;
    this.buttonMode = true;

    // спрайт с оружием
    const res = PIXI.Loader.shared.resources[key];
    this.#sprite = new PIXI.Sprite(res.texture);
    this.#sprite.anchor.set(0.5);
    this.addChild(this.#sprite);

    // Hover/active эффекты
    this.on("pointerover", () => {
      this.scale.set(1.05);
    });
    this.on("pointerout", () => {
      this.scale.set(1);
    });

    // Сохранить callback
    this.#onClick = options.onClick;
    this.on("pointertap", () => {
      if (typeof this.#onClick === "function") {
        this.#onClick(this.#key);
      }
    });
  }

  setSize(width, height, labelOffsetY = 10) {
    if (this.#sprite) {
      this.#sprite.width = width;
      this.#sprite.height = height;
    }
    if (this.#label) {
      // label позиционируем под спрайтом: X=0, Y=height/2 + labelOffsetY
      this.#label.x = 0;
      this.#label.y = height / 2 + labelOffsetY;
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  getKey() {
    return this.#key;
  }
}
