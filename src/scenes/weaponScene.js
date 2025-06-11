// src/scenes/weaponScene.js
import * as PIXI from "pixi.js";
import { BaseScene } from "../core/baseScene";
import { gsap } from "gsap";
import { ButtonGame } from "../utils/textButton";
import { weaponsData } from "../data/weaponsData";

export class WeaponScene extends BaseScene {
  #weaponKey;
  #data;
  #sprite;
  #textContainer;
  #backButton;
  #keys;
  #currentIndex;
  // Навигация:
  _prevBtn;
  _nextBtn;
  _animated = false;

  constructor(manager, params = {}) {
    super(manager);
    this.#keys = Object.keys(weaponsData);
    this.#weaponKey = params.weaponKey || this.#keys[0];
    const idx = this.#keys.indexOf(this.#weaponKey);
    this.#currentIndex = idx >= 0 ? idx : 0;
    this.#weaponKey = this.#keys[this.#currentIndex];
    this.#data = weaponsData[this.#weaponKey];
    if (!this.#data) {
      console.warn(`WeaponScene: data for key "${this.#weaponKey}" not found`);
    }
  }

  init() {
    // 1) Спрайт оружия
    if (this.#data && this.#data.imageResource) {
      const res = PIXI.Loader.shared.resources[this.#data.imageResource];
      if (res && res.texture) {
        this.#sprite = new PIXI.Sprite(res.texture);
        this.#sprite.anchor.set(0.5);
        this.addChild(this.#sprite);
      }
    }
    // 2) Текст
    this.#textContainer = new PIXI.Container();
    this.addChild(this.#textContainer);
    if (this.#data) {
      const title = new PIXI.Text(this.#data.displayName.toUpperCase(), {
        fill: "#ffffff",
        fontFamily: "Arial",
        fontSize: 36,
        align: "left",
      });
      title.anchor.set(0, 0);
      this.#textContainer.addChild(title);
      const desc = new PIXI.Text(this.#data.description || "", {
        fill: "#ffffff",
        fontFamily: "Arial",
        fontSize: 20,
        wordWrap: true,
        wordWrapWidth: 400,
        align: "left",
      });
      desc.anchor.set(0, 0);
      this.#textContainer.addChild(desc);
      this._titleText = title;
      this._descText = desc;
      let offsetY = title.height + 20;
      const stats = this.#data.stats || {};
      Object.entries(stats).forEach(([statName, statValue]) => {
        const statText = new PIXI.Text(`${statName}: ${statValue}`, {
          fill: "#ffffff",
          fontFamily: "Arial",
          fontSize: 18,
          align: "left",
        });
        statText.anchor.set(0, 0);
        statText.y = offsetY;
        this.#textContainer.addChild(statText);
        offsetY += statText.height + 10;
      });
    }
    // 3) BACK
    this.#backButton = new ButtonGame("BACK");
    this.#backButton.onClick(() => this._manager.changeScene("intro"));
    this.addChild(this.#backButton);

    // 4) Навигация Prev/Next (если нужно):
    // this._prevBtn = new ButtonGame("PREV");
    // this._nextBtn = new ButtonGame("NEXT");
    // this._prevBtn.onClick(() => this._goToPrevious());
    // this._nextBtn.onClick(() => this._goToNext());
    // this.addChild(this._prevBtn, this._nextBtn);
  }

  onResize(rw, rh) {
    // 1) Спрайт
    if (this.#sprite) {
      const maxW = rw * 0.4;
      const minW = 150;
      let w = Math.min(maxW, Math.max(minW, maxW));
      const aspect = this.#sprite.texture.width / this.#sprite.texture.height;
      const h = w / aspect;
      this.#sprite.width = w;
      this.#sprite.height = h;
      const marginLeft = 20;
      this.#sprite.x = marginLeft + w / 2;
      this.#sprite.y = rh / 2;
    }
    // 2) Текст
    if (this.#textContainer) {
      const marginLeft = 20;
      const textX = this.#sprite
        ? this.#sprite.x + this.#sprite.width / 2 + marginLeft
        : marginLeft;
      const marginRight = 20;
      const availW = rw - textX - marginRight;
      this.#textContainer.x = textX;
      if (this._titleText) {
        this._titleText.style.fontSize = Math.round(rw * 0.03);
      }
      if (this._descText) {
        this._descText.style.wordWrapWidth = availW;
      }
      const bounds = this.#textContainer.getLocalBounds();
      this.#textContainer.y = (rh - bounds.height) / 2 - bounds.y;
    }
    // 3) BACK
    if (this.#backButton) {
      const btnW = 100;
      const btnH = 40;
      this.#backButton.setSize(btnW, btnH);
      const marginBottom = 20;
      this.#backButton.x = marginBottom + btnW / 2;
      this.#backButton.y = rh - marginBottom - btnH / 2;
    }
    // 4) Prev/Next
    // if (this._prevBtn) { /* разместить рядом со спрайтом */ }
    // if (this._nextBtn) { /* разместить */ }

    // 5) Анимация
    if (!this._animated) {
      this._animated = true;
      if (this.#sprite) {
        this.#sprite.alpha = 0;
        gsap.to(this.#sprite, { alpha: 1, duration: 0.5 });
      }
      if (this.#textContainer) {
        this.#textContainer.alpha = 0;
        gsap.to(this.#textContainer, { alpha: 1, duration: 0.5, delay: 0.3 });
      }
      if (this.#backButton) {
        this.#backButton.alpha = 0;
        gsap.to(this.#backButton, { alpha: 1, duration: 0.5, delay: 0.5 });
      }
      // Prev/Next анимация аналогично
    }
  }

  // Навигация (раскомментируйте, если нужно):
  _goToPrevious() {
    const len = this.#keys.length;
    this.#currentIndex = (this.#currentIndex - 1 + len) % len;
    this.#weaponKey = this.#keys[this.#currentIndex];
    this._reloadDataAndUI();
  }
  _goToNext() {
    const len = this.#keys.length;
    this.#currentIndex = (this.#currentIndex + 1) % len;
    this.#weaponKey = this.#keys[this.#currentIndex];
    this._reloadDataAndUI();
  }
  _reloadDataAndUI() {
    // Удаляем старые
    if (this.#sprite) {
      this.removeChild(this.#sprite);
      this.#sprite.destroy();
      this.#sprite = null;
    }
    if (this.#textContainer) {
      this.removeChild(this.#textContainer);
      this.#textContainer.destroy({ children: true });
      this.#textContainer = null;
    }
    // Повторяем init-логику для нового weaponKey
    this.#data = weaponsData[this.#weaponKey];
    if (this.#data && this.#data.imageResource) {
      const res = PIXI.Loader.shared.resources[this.#data.imageResource];
      if (res && res.texture) {
        this.#sprite = new PIXI.Sprite(res.texture);
        this.#sprite.anchor.set(0.5);
        this.addChild(this.#sprite);
      }
    }
    this.#textContainer = new PIXI.Container();
    this.addChild(this.#textContainer);
    if (this.#data) {
      const title = new PIXI.Text(this.#data.displayName.toUpperCase(), {
        fill: "#ffffff", fontFamily: "Arial", fontSize: 36, align: "left",
      });
      title.anchor.set(0, 0);
      this.#textContainer.addChild(title);
      const desc = new PIXI.Text(this.#data.description || "", {
        fill: "#ffffff", fontFamily: "Arial", fontSize: 20,
        wordWrap: true, wordWrapWidth: 400, align: "left",
      });
      desc.anchor.set(0, 0);
      this.#textContainer.addChild(desc);
      this._titleText = title;
      this._descText = desc;
      let offsetY = title.height + 20;
      const stats = this.#data.stats || {};
      Object.entries(stats).forEach(([statName, statValue]) => {
        const statText = new PIXI.Text(`${statName}: ${statValue}`, {
          fill: "#ffffff", fontFamily: "Arial", fontSize: 18, align: "left",
        });
        statText.anchor.set(0, 0);
        statText.y = offsetY;
        this.#textContainer.addChild(statText);
        offsetY += statText.height + 10;
      });
    }
    // Снова адаптировать размещение:
    const rw = this._manager.rendererWidth;
    const rh = this._manager.rendererHeight;
    this._animated = false; // сбросим, чтобы анимация снова сработала
    this.onResize(rw, rh);
  }
}
