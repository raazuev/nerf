// src/scenes/IntroScene.js
import * as PIXI from "pixi.js";
import { BaseScene } from "../core/baseScene";
import { gsap } from "gsap";
import { ButtonGame } from "../utils/textButton";
import { WeaponItem } from "../utils/weaponItem";
import { weaponsData } from "../data/weaponsData";

export class IntroScene extends BaseScene {
  #bg;
  #buttons = [];
  #gunsSprite = [];
  #logoSprite;
  #titleText;
  images = [];
  #rawTitle =
    "Choose your blaster then shoot as many targets as you can within";
  #previewContainer; // контейнер для превью оружия на главном экране
  #previewItems = []; // массив WeaponItem в превью
  _logoAnimated = false;
  _buttonsAnimated = false;
  _previewAnimated = false;

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

    // 1) Создаём контейнер для превью оружия
    this.#previewContainer = new PIXI.Container();
    this.addChild(this.#previewContainer);

    // 2) Получаем список ключей оружия:
    const weaponKeys = Object.keys(weaponsData); // ["Volt","Shockwave","Power","Commander"]

    // 3) Создаём WeaponItem для каждого ключа, добавляем в previewContainer
    weaponKeys.forEach((key) => {
      const item = new WeaponItem(key, {
        onClick: (weaponKey) => {
          // Переход к сцене деталей
          this._manager.changeScene("weapon", { weaponKey });
        },
      });
      this.#previewItems.push(item);
      this.#previewContainer.addChild(item);
    });

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
    this.#buttons[0].onClick(() => this._manager.changeScene("weapon"));
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

      // 3) Простая раскладка превью-оружия по горизонту, центрируем ряд
  if (this.#previewContainer && this.#previewItems.length > 0) {
    const totalItems = this.#previewItems.length;
    // Горизонтальный gap между превью
    const gap = 20;
    // Вычислим ширину каждого превью: 
    // хотим, чтобы ряд не был слишком широким: 
    // допустим, максимальная ширина каждого = rw * 0.2, но ограничиваем min/max
    const maxItemWidth = rw * 0.25; 
    const minItemWidth = 80;
    // Если ряд из N, то иногда itemWidth нужно уменьшить, чтобы весь ряд поместился:
    // Предварительный candidate:
    let itemWidth = Math.min(maxItemWidth, (rw - gap * (totalItems - 1) - 40) / totalItems);
    itemWidth = Math.max(minItemWidth, itemWidth);
    // Позиционируем каждый:
    // Сначала очистим контейнер из дочерних и заново добавим в порядке:
    this.#previewContainer.removeChildren();
    // Считаем полную ширину ряда: fullWidth = totalItems*itemWidth + (totalItems-1)*gap
    const fullWidth = totalItems * itemWidth + (totalItems - 1) * gap;
    // Начальный X: (rw - fullWidth)/2  — это левый край ряда
    const startX = (rw - fullWidth) / 2;
    // Вертикальная позиция: например, посередине экрана, но чуть выше кнопок. Пусть y = rh * 0.4
    const centerY = rh * 0.4;
    // Для каждого элемента:
    this.#previewItems.forEach((item, index) => {
      // Вычисляем высоту по aspect исходного спрайта:
      const sprite = item.children.find(ch => ch instanceof PIXI.Sprite);
      let aspect = 1;
      if (sprite && sprite.texture) {
        aspect = sprite.texture.width / sprite.texture.height;
      }
      const itemHeight = itemWidth / aspect;
      // Добавляем в контейнер:
      this.#previewContainer.addChild(item);
      // Устанавливаем размер и позицию относительно контейнера:
      item.setSize(itemWidth, itemHeight);
      // Позиция: x = startX + index*(itemWidth + gap) + itemWidth/2, y = centerY
      const x = startX + index * (itemWidth + gap) + itemWidth / 2;
      item.setPosition(x, centerY);
    });
    // Если хотим анимацию появления один раз:
    if (!this._previewAnimated) {
      this._previewAnimated = true;
      gsap.from(this.#previewItems, {
        alpha: 0,
        y: "+=20",
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
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
