// src/scenes/weaponScene.js
import * as PIXI from "pixi.js";
import { BaseScene } from "../core/baseScene";
import { gsap } from "gsap";
import { ButtonGame } from "../utils/textButton";
import { weaponsData } from "../data/weaponsData";

export class WeaponScene extends BaseScene {
  #bg;
  #weaponKey;
  #data;
  #sprite;
  #textContainer;
  #titleText;
  #descText;
  #statTexts = [];
  #backButton;
  #visitSiteButton;
  #keys;
  #currentIndex;
  _prevBtn;
  _nextBtn;
  _animated = false; 

  static SITE_URL = "https://your-static-url.example.com"; 

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
      this.#data = null;
    }
  }

  init() {
    const resBg = PIXI.Loader.shared.resources.weapon_bg;
    if (resBg && resBg.texture) {
      this.#bg = new PIXI.Sprite(resBg.texture);
      this.#bg.anchor.set(0.5);
      this.addChildAt(this.#bg, 0);
    } else {
      console.warn("WeaponScene: resource 'weapon_bg' not found");
    }

    this.#sprite = null;
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

    this.#titleText = null;
    this.#descText = null;
    this.#statTexts = [];
    if (this.#data) {
      const title = new PIXI.Text(this.#data.displayName.toUpperCase(), {
        fill: "#09d1e1",
        fontFamily: "Arial",
        fontSize: 36,
        align: "left",
      });
      title.anchor.set(0, 0);
      this.#textContainer.addChild(title);
      this.#titleText = title;

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
      this.#descText = desc;

      const stats = this.#data.stats || {};
      Object.entries(stats).forEach(([statName, statValue]) => {
        const statText = new PIXI.Text(`${statName}: ${statValue}`, {
          fill: "#ffffff",
          fontFamily: "Arial",
          fontSize: 18,
          align: "left",
        });
        statText.anchor.set(0, 0);
        this.#textContainer.addChild(statText);
        this.#statTexts.push(statText);
      });
    }

    this.#backButton = new ButtonGame("BACK");
    this.#backButton.onClick(() => this._manager.changeScene("intro"));
    this.addChild(this.#backButton);

    this.#visitSiteButton = new ButtonGame("VISIT SITE");
    this.#visitSiteButton.onClick(() => {
      window.open(WeaponScene.SITE_URL, "_blank");
    });
    this.addChild(this.#visitSiteButton);

    this._prevBtn = new ButtonGame("PREV");
    this._nextBtn = new ButtonGame("NEXT");
    this._prevBtn.onClick(() => this._goToPrevious());
    this._nextBtn.onClick(() => this._goToNext());
    this.addChild(this._prevBtn, this._nextBtn);
  }

  onResize(rw, rh) {
    if (this.#bg) {
      const tex = this.#bg.texture;
      const scale = Math.max(rw / tex.width, rh / tex.height);
      this.#bg.scale.set(scale);
      this.#bg.x = rw / 2;
      this.#bg.y = rh / 2;
    }

    if (this.#sprite) {
      const maxW = rw * 0.4;
      const minW = 150;
      let w = Math.min(maxW, Math.max(minW, maxW));
      const aspect = this.#sprite.texture.width / this.#sprite.texture.height;
      const h = w / aspect;
      this.#sprite.width = w;
      this.#sprite.height = h;
      const marginLeft = 180;
      this.#sprite.x = marginLeft + w / 2;
      this.#sprite.y = rh / 2.2;
    }

    if (this.#textContainer) {
      const marginLeft = 40;
      const textX = this.#sprite
        ? this.#sprite.x + this.#sprite.width / 2 + marginLeft
        : marginLeft;
      const marginRight = 20;
      const availW = rw - textX - marginRight;
      this.#textContainer.x = textX;

      if (this.#titleText) {
        this.#titleText.style.fontSize = Math.round(rw * 0.03);
      }
      if (this.#descText) {
        this.#descText.style.fontSize = Math.round(rw * 0.02);
        this.#descText.style.wordWrapWidth = availW;
      }
      this.#statTexts.forEach((statText) => {
        statText.style.fontSize = Math.round(rw * 0.018);
      });

      let currentY = 0;
      if (this.#titleText) {
        this.#titleText.x = 0;
        this.#titleText.y = currentY;
        currentY += this.#titleText.height + 10;
      }
      if (this.#descText) {
        this.#descText.x = 0;
        this.#descText.y = currentY;
        currentY += this.#descText.height + 15;
      }
      this.#statTexts.forEach((statText) => {
        statText.x = 0;
        statText.y = currentY;
        currentY += statText.height + 8;
      });

      const bounds = this.#textContainer.getLocalBounds();
      this.#textContainer.y = (rh - bounds.height) / 2 - bounds.y;
    }

    if (this.#backButton) {
      const btnW = 150;
      const btnH = 50;
      this.#backButton.setSize(btnW, btnH);
      const marginBottom = 20;
      this.#backButton.x = marginBottom + btnW / 2;
      this.#backButton.y = rh - marginBottom - btnH / 2;
    }

    if (this.#visitSiteButton) {
      const btnW = 200;
      const btnH = 50;
      this.#visitSiteButton.setSize(btnW, btnH);
      const marginBottom = 20;
      this.#visitSiteButton.x = rw - marginBottom - btnW / 2;
      this.#visitSiteButton.y = rh - marginBottom - btnH / 2;
    }

    const navBtnW = 100;
    const navBtnH = 40;
    const sideMargin = 20;
    if (this._prevBtn) {
      this._prevBtn.setSize(navBtnW, navBtnH);
      this._prevBtn.x = sideMargin + navBtnW / 2;
      this._prevBtn.y = rh / 2;
    }
    if (this._nextBtn) {
      this._nextBtn.setSize(navBtnW, navBtnH);
      this._nextBtn.x = rw - sideMargin - navBtnW / 2;
      this._nextBtn.y = rh / 2;
    }

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
      if (this.#visitSiteButton) {
        this.#visitSiteButton.alpha = 0;
        gsap.to(this.#visitSiteButton, { alpha: 1, duration: 0.5, delay: 0.6 });
      }
      if (this._prevBtn) {
        this._prevBtn.alpha = 0;
        gsap.to(this._prevBtn, { alpha: 1, duration: 0.5, delay: 0.7 });
      }
      if (this._nextBtn) {
        this._nextBtn.alpha = 0;
        gsap.to(this._nextBtn, { alpha: 1, duration: 0.5, delay: 0.7 });
      }
    }
  }

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
    this.#data = weaponsData[this.#weaponKey];

    if (this.#sprite) {
      this.removeChild(this.#sprite);
      this.#sprite.destroy();
      this.#sprite = null;
    }
    if (this.#data && this.#data.imageResource) {
      const res = PIXI.Loader.shared.resources[this.#data.imageResource];
      if (res && res.texture) {
        this.#sprite = new PIXI.Sprite(res.texture);
        this.#sprite.anchor.set(0.5);
        this.addChild(this.#sprite);
      }
    }

    if (this.#textContainer) {
      this.removeChild(this.#textContainer);
      this.#textContainer.destroy({ children: true });
      this.#textContainer = null;
    }
    this.#textContainer = new PIXI.Container();
    this.addChild(this.#textContainer);

    this.#titleText = null;
    this.#descText = null;
    this.#statTexts = [];
    if (this.#data) {
      const title = new PIXI.Text(this.#data.displayName.toUpperCase(), {
        fill: "#09d1e1",
        fontFamily: "Arial",
        fontSize: 36,
        align: "left",
      });
      title.anchor.set(0, 0);
      this.#textContainer.addChild(title);
      this.#titleText = title;

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
      this.#descText = desc;

      const stats = this.#data.stats || {};
      Object.entries(stats).forEach(([statName, statValue]) => {
        const statText = new PIXI.Text(`${statName}: ${statValue}`, {
          fill: "#ffffff",
          fontFamily: "Arial",
          fontSize: 18,
          align: "left",
        });
        statText.anchor.set(0, 0);
        this.#textContainer.addChild(statText);
        this.#statTexts.push(statText);
      });
    }

    const rw = this._manager.rendererWidth;
    const rh = this._manager.rendererHeight;
    this.onResize(rw, rh);
  }
}
