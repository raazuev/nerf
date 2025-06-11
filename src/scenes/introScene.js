// src/scenes/IntroScene.js
import * as PIXI from "pixi.js";
import { BaseScene } from "../core/baseScene";
import { gsap } from "gsap";
import { ButtonGame } from "../utils/textButton";

export class IntroScene extends BaseScene {
  #bg;
  #buttons = [];
  #gunsSprite = [];
  #logoSprite;
  #titleText;
  images = [];
  #rawTitle =
    "Choose your blaster then shoot as many targets as you can within";

  constructor(manager) {
    super(manager);
  }

  init() {
    // фон
    const resBg = PIXI.Loader.shared.resources.main_bg;
    if (resBg && resBg.texture) {
      this.#bg = new PIXI.Sprite(resBg.texture);
      this.#bg.anchor.set(0.5);
      this.addChild(this.#bg);
    }

    // логотип
    const resLogo = PIXI.Loader.shared.resources.logo_primary;
    if (resLogo && resLogo.texture) {
      this.#logoSprite = new PIXI.Sprite(resLogo.texture);
      this.#logoSprite.anchor.set(0, 0.5);
      this.addChild(this.#logoSprite);
    }

    // заголовок
    const rawText = this.#rawTitle;
    this.#titleText = new PIXI.Text(rawText.toUpperCase(), {
      fill: "#ffffff",
      fontFamily: "Arial",
      fontSize: 48,
      align: "center",
      wordWrap: true,
      wordWrapWidth: 600,
    });
    this.#titleText.anchor.set(1, 0.5);
    this.addChild(this.#titleText);

    PIXI.Loader.shared.resources.some_img;
    const resImg = PIXI.Loader.shared.resources.Volt;
    if (resImg && resImg.texture) {
      const imgSprite = new PIXI.Sprite(resImg.texture);
      imgSprite.anchor.set(0.5);
      this.#gunsSprite.push(imgSprite);
      this.addChild(imgSprite);
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

  }


  onResize(rw, rh) {
    // обновляем фон
    if (this.#bg) {
      const tex = this.#bg.texture;
      const scale = Math.max(rw / tex.width, rh / tex.height);
      this.#bg.scale.set(scale);
      this.#bg.x = rw / 2;
      this.#bg.y = rh / 2;
    }

    // позиционирование лого
    if (this.#logoSprite) {
      // Анимация появления можно запустить один раз:
      if (!this._logoAnimated) {
        this._logoAnimated = true;
        this.#logoSprite.alpha = 0;
        gsap.to(this.#logoSprite, {
          alpha: 1,
          duration: 1,
          ease: "power2.out",
        });
      }
      const logoTex = this.#logoSprite.texture;
      // Задаём ширину логотипа как процент от ширины экрана, с min/max
      const maxLogoWidth = rw * 0.5; // например максимум 30% ширины
      const minLogoWidth = 100; // минимум
      let logoW = rw * 0.4; // базовый 20% ширины
      logoW = Math.min(maxLogoWidth, Math.max(minLogoWidth, logoW));
      const aspectLogo = logoTex.width / logoTex.height;
      const logoH = logoW / aspectLogo;
      this.#logoSprite.width = logoW;
      this.#logoSprite.height = logoH;
      // Позиция: X = marginLeft, Y = верхняя часть + logoH/2 + marginTop
      const marginLeft = 20;
      const marginTop = 20;
      this.#logoSprite.x = marginLeft;
      this.#logoSprite.y = marginTop + logoH / 2;
    }

    // 3) Заголовок справа
    if (this.#titleText) {
      // Обновляем текст в uppercase (если raw меняется):
      this.#titleText.text = this.#rawTitle.toUpperCase();

      // Корректируем fontSize пропорционально rw, с ограничениями
      const maxFontSize = 40;
      const minFontSize = 16;
      let fontSize = Math.round(rw * 0.035); // 3.5% ширины
      fontSize = Math.min(maxFontSize, Math.max(minFontSize, fontSize));
      this.#titleText.style.fontSize = fontSize;
      // Word wrap: чтобы текст переносился на новой строке, задаём ширину области
      const wrapWidth = rw * 0.6; // область 40% ширины экрана
      this.#titleText.style.wordWrapWidth = wrapWidth;

      // Позиция: X = rw - marginRight, Y = под верхней границей, примерно как логотип
      const marginRight = 20;
      const marginTop = 20;

      let titleY;
      if (this.#logoSprite) {
        titleY = this.#logoSprite.y; // выровнять по середине логотипа
      } else {
        titleY = marginTop + fontSize / 2;
      }
      this.#titleText.x = rw - marginRight;
      this.#titleText.y = titleY;
    }

    const maxBtnWidth = 700; // максимальная ширина на больших экранах
    const minBtnWidth = 170; // минимальная ширина на очень мелких экранах
    const btnWidth = Math.min(maxBtnWidth, Math.max(minBtnWidth, rw * 0.4));
    // Высоту можно задать пропорционально, например, фиксированную или зависящую от ширины:
    const aspect = 900 / 150; // если базово кнопка 700x100, aspect = 7
    const btnHeight = btnWidth / aspect; // сохраняем пропорцию


    // Вычисляем позиции двух колонок:
    const marginX = 0;
    const leftX = marginX + btnWidth / 2;
    const rightX = rw - marginX - btnWidth / 2;
    // Вертикаль: от нижнего края вверх:
    const offsetY = 100; // отступ от низа до центра первой строки
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
    } 

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
