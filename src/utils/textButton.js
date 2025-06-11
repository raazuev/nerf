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
      background: options.colors?.background ?? 0x09d1e1,
      hover: options.colors?.hover ?? 0xf47921,
      active: options.colors?.active ?? 0xf47921,
      text: options.colors?.text ?? "#02132a",
    };
    this.#cornerRadius = options.cornerRadius ?? 1;

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

    this.#drawBackground(this.#colors.background);
    this._adaptTextScale();
  }

  // Перерисовка фона с указанным цветом
  #drawBackground(color) {
    const g = this.#background;
    g.clear();
    g.beginFill(color);
    g.drawRoundedRect(0, 0, this.#width, this.#height, this.#cornerRadius);
    g.endFill();
  }

  _adaptTextScale() {
    if (!this.#label) return;
    // Сбрасываем предыдущий scale, чтобы мерить исходный размер
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
    // Не увеличиваем текст сверх исходного размера, если не нужно:
    const scaleFactor = Math.min(scaleX, scaleY, 1);
    this.#label.scale.set(scaleFactor);
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
    this._adaptTextScale();
  }
}
