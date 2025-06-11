// src/scenes/IntroScene.js
import * as PIXI from "pixi.js";
import { BaseScene } from "../core/baseScene";
import { gsap } from "gsap";
import { ButtonGame } from "../utils/textButton";

export class IntroScene extends BaseScene {
  #bg; // спрайт фона
  #buttons = []; // массив ButtonGame

  constructor(manager) {
    super(manager);
  }

  init() {
    // Создание фона, сохраним в this.#bg:
    const res = PIXI.Loader.shared.resources.main_bg;
    if (!res || !res.texture) {
      console.warn("Background texture missing");
    } else {
      const tex = res.texture;
      this.#bg = new PIXI.Sprite(tex);
      this.#bg.anchor.set(0.5);
      // Начальные scale/позицию установим в onResize
      this.addChild(this.#bg);
    }

    // Создаём кнопки, фиксированного базового размера или авто:
    const labels = ["PLAY MINIGAME", "WATCH VIDEO", "VIEW RANGE", "VISIT NERF"];
    labels.forEach((text) => {
      // Можно опустить фиксированную ширину, чтобы авто-подгонка по тексту + padding:
      const btn = new ButtonGame(text, {
        // Пример: базовая ширина, но будем масштабировать в onResize:
        // width: 700, height: 100
        // или оставить авто, если хотим динамику.
      });
      this.#buttons.push(btn);
      this.addChild(btn);
    });

    // Навешиваем события кликов (далее точки назначения по кнопкам):
    this.#buttons[0].onClick(() => this._manager.changeScene("weapon-select"));
    this.#buttons[1].onClick(() => {
      /* WATCH VIDEO */
    });
    this.#buttons[2].onClick(() => {
      /* VIEW RANGE */
    });
    this.#buttons[3].onClick(() => {
      // window.open("https://nerf.example.com", "_blank");
    });

    // Анимацию появления сделаем в init, но после установки начальных позиций в onResize.
    // Поэтому анимацию запускаем в onResize при первом вызове, либо здесь, но с учётом,
    // что позиции могут быть ещё не установлены. Лучше запускать анимацию внутри onResize
    // после первого расчёта.
  }

  /**
   * onResize вызывается SceneManager при init() и при изменении размера окна.
   * Здесь пересчитываем:
   * - фон: scale и позицию
   * - кнопки: размер/scale (если нужно) и позицию (две колонки у низа экрана)
   * @param {number} rw — новая ширина renderer
   * @param {number} rh — новая высота renderer
   */
  onResize(rw, rh) {
    // 1) Обновляем фон
    if (this.#bg) {
      const tex = this.#bg.texture;
      // Сохраняем пропорции: cover-подход
      const scale = Math.max(rw / tex.width, rh / tex.height);
      this.#bg.scale.set(scale);
      this.#bg.x = rw / 2;
      this.#bg.y = rh / 2;
    }

    // 2) Обновляем размер и позицию кнопок
    // Решаем стратегию:
    //  - Базовый размер кнопки можно задавать фиксированный (например, widthBase, heightBase),
    //    но затем масштабировать в зависимости от rw.
    //  - Или пересоздавать width по-percent: e.g. width = rw * 0.4, height = width * aspectRatio.
    // Ниже пример: кнопки будут занимать, скажем, 40% ширины экрана, но не больше базового maxWidth.

    // Параметры для адаптации:
    const maxBtnWidth = 700; // максимальная ширина на больших экранах
    const minBtnWidth = 200; // минимальная ширина на очень мелких экранах
    const btnWidth = Math.min(maxBtnWidth, Math.max(minBtnWidth, rw * 0.4));
    // Высоту можно задать пропорционально, например, фиксированную или зависящую от ширины:
    const aspect = 700 / 100; // если базово кнопка 700x100, aspect = 7
    const btnHeight = btnWidth / aspect; // сохраняем пропорцию
    // Или сделать фиксированную высоту min/max:
    // const maxBtnHeight = 100, minBtnHeight = 40;
    // const btnHeight = Math.min(maxBtnHeight, Math.max(minBtnHeight, rh * 0.08));

    // Вычисляем позиции двух колонок:
    const marginX = 20;
    const leftX = marginX + btnWidth / 2;
    const rightX = rw - marginX - btnWidth / 2;
    // Вертикаль: от нижнего края вверх:
    const offsetY = 60; // отступ от низа до центра первой строки
    const spacingY = 20; // расстояние между рядами
    const firstRowY = rh - offsetY;
    const secondRowY = firstRowY - (btnHeight + spacingY);

    // Если кнопки созданы с авто-размером, нужно задать им размер:
    // у нашего ButtonGame есть метод setSize:
    this.#buttons.forEach((btn) => {
      // Устанавливаем новый размер:
      btn.setSize(btnWidth, btnHeight);
    });

    // Располагаем кнопки:
    // Предполагаем, что кнопок ровно 4:
    if (this.#buttons.length >= 4) {
      this.#buttons[0].setPosition(leftX, secondRowY);
      this.#buttons[1].setPosition(rightX, secondRowY);
      this.#buttons[2].setPosition(leftX, firstRowY);
      this.#buttons[3].setPosition(rightX, firstRowY);
    } else {
      // Если меньше кнопок, можно центровать по одной колонке или в столбец:
      // здесь добавьте логику под другой случай
    }

    // 3) Запускаем анимацию появления впервые (опционально)
    // Можно установить флаг, чтобы анимация срабатывала только при первом ресайзе:
    if (!this._animated) {
      this._animated = true;
      gsap.from(this.#buttons, {
        alpha: 0,
        y: "+=50",
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }
}

// #startBtn;
// #videoBtn;
// #viewRangeBtn;
// #visitNerfBth;

// constructor(manager) {
//   super(manager);
// }

// init() {
//   const bg = new PIXI.Sprite(PIXI.Loader.shared.resources.main_bg.texture);
//   console.log("BG texture:", bg.texture.width, bg.texture.height);

//   const scale = Math.max(
//     this._manager.rendererWidth / bg.texture.width,
//     this._manager.rendererHeight / bg.texture.height
//   );

//   bg.anchor.set(0.5);
//   bg.scale.set(scale);
//   bg.x = this._manager.rendererWidth / 2;
//   bg.y = this._manager.rendererHeight / 2;
//   this.addChild(bg);

//   this.#startBtn = new ButtonGame("PLAY MINIGAME");
//   this.#videoBtn = new ButtonGame("START");
//   this.#viewRangeBtn = new ButtonGame("VIEW RANGE");
//   this.#visitNerfBth = new ButtonGame("VISIT NERF");

//   this.#startBtn.setPosition(
//     this._manager.rendererWidth / 2,
//     this._manager.rendererHeight - 300
//   );
//   this.#videoBtn.setPosition(
//     this._manager.rendererHeight / 2,
//     this._manager.rendererHeight - 300
//   );

//   this.#viewRangeBtn.setPosition(
//     this._manager.rendererHeight / 2,
//     this._manager.rendererHeight - 350
//   );

//   this.#visitNerfBth.setPosition(
//     this._manager.rendererHeight / 2,
//     this._manager.rendererHeight - 250
//   );

//   this.addChild(
//     this.#startBtn,
//     this.#videoBtn,
//     this.#viewRangeBtn,
//     this.#visitNerfBth
//   );

//   this.#startBtn.onClick(() => this._manager.changeScene("weapon-select"));
//   this.#videoBtn.onClick(() => this._manager.changeScene("weapon-select"));
//   this.#viewRangeBtn.onClick(() =>
//     this._manager.changeScene("weapon-select")
//   );
//   this.#visitNerfBth.onClick(() =>
//     this._manager.changeScene("weapon-select")
//   );

//   gsap.from([this.#startBtn, this.#videoBtn], {
//     alpha: 0,
//     y: "+=50",
//     duration: 1,
//     stagger: 0.2,
//   });
// }
