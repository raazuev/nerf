import * as PIXI from "pixi.js";

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

    // начальные настройки
    this.#paddingX = options.paddingX ?? 20;
    this.#paddingY = options.paddingY ?? 10;
    this.#style = options.style ?? {
      fill: "#ffffff",
      fontSize: 36,
      fontFamily: "Arial",
    };
    this.#colors = {
      background: options.colors?.background ?? 0x0077cc,
      hover: options.colors?.hover ?? 0xfdc301,
      active: options.colors?.active ?? 0x00457a,
      text: options.colors?.text ?? "black",
    };
    this.#cornerRadius = options.cornerRadius ?? 8;

    // создание текста
    this.#label = new PIXI.Text(text, {
      ...this.#style,
      fill: this.#colors.text,
    });
    this.addChild(this.#label);

    // Определяем размеры: если передали width/height явно — используем,
    // иначе: измеряем текст и прибавляем padding.
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

    // Создаём фон
    this.#background = new PIXI.Graphics();
    this.#drawBackground(this.#colors.background);
    // Помещаем фон под текст:
    this.addChildAt(this.#background, 0);

    // Устанавливаем anchor так, чтобы контейнер (this) был центрирован:
    // Будем располагать кнопку по её центру => anchor у background и label = 0.5
    // Для этого смещаем background и label:
    this.#background.x = -this.#width / 2;
    this.#background.y = -this.#height / 2;
    // Центрируем текст:
    this.#label.anchor.set(0.5);
    this.#label.x = 0;
    this.#label.y = 0;

    // Интеррактивность
    this.interactive = true;
    this.buttonMode = true;

    // Состояния
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
      // при отпускании возвращаем hover или обычный, если вышли мышью
      // проверка, находится ли указатель внутри: в Pixi сложно, но можно просто сбросить в hover
      this.#drawBackground(this.#colors.hover);
    });
  }

  // Перерисовка фона с указанным цветом
  #drawBackground(color) {
    const g = this.#background;
    g.clear();
    g.beginFill(color);
    g.drawRoundedRect(0, 0, this.#width, this.#height, this.#cornerRadius);
    g.endFill();
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  onClick(callback) {
    this.on("pointertap", callback);
  }

  setSize(width, height) {
    this.#width = width;
    this.#height = height;
    // Перерисовать фон:
    this.#drawBackground(this.#colors.background);
    // Скорректировать позицию background:
    this.#background.x = -this.#width / 2;
    this.#background.y = -this.#height / 2;
    // Текст остаётся центрированным (anchor уже 0.5)
  }
}

// #label;
// #width;
// #height;
// #paddingX;
// #paddingY;
// #style;
// #cornerRadius;
// #colors;

// constructor(text, style = {}) {
//   super();

//   this.#label = new PIXI.Text(text, {
//     fill: "blue",
//     fontSize: 48,
//     fontFamily: "Arial",
//     align: "center",
//     ...style,
//   });

//   this.addChild(this.#label);
//   this.#label.anchor.set(0.5);
//   this.#label.x = 0;
//   this.#label.y = 0;

//   this.interactive = true;
//   this.buttonMode = true;

//   this.on("pointerover", () => {
//     this.scale.set(1.05);
//   });
//   this.on("pointerout", () => {
//     this.scale.set(1);
//   });
// }

// setPosition(x, y) {
//   this.x = x;
//   this.y = y;
// }

// onClick(callback) {
//   this.on("pointertap", callback);
// }
