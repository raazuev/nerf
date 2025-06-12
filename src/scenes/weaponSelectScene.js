import * as PIXI from "pixi.js";
import { BaseScene } from "../core/baseScene";
import { gsap } from "gsap";
import { ButtonGame } from "../utils/textButton";
import { WeaponItem } from "../utils/weaponItem";
import { weaponsData } from "../data/weaponsData";

export class WeaponSelectScene extends BaseScene {
  #bg;
  #container;
  #currentItem;
  #keys;
  #currentIndex = 0;
  #backButton;
  #playButton;
  _prevArrow;
  _nextArrow;
  #nameBox;
  #nameText;
  #logoSprite;
  #headerText;
  _animatedInitial = false;

  constructor(manager, params = {}) {
    super(manager);
    this.#keys = Object.keys(weaponsData);
    if (params.weaponKey) {
      const idx = this.#keys.indexOf(params.weaponKey);
      if (idx >= 0) this.#currentIndex = idx;
    }
  }

  init() {
    const resBg = PIXI.Loader.shared.resources.game_weapon_bg;
    if (resBg && resBg.texture) {
      this.#bg = new PIXI.Sprite(resBg.texture);
      this.#bg.anchor.set(0.5);
      this.addChildAt(this.#bg, 0);
    }

    const resLogo = PIXI.Loader.shared.resources.logo_primary;
    if (resLogo && resLogo.texture) {
      this.#logoSprite = new PIXI.Sprite(resLogo.texture);
      this.#logoSprite.anchor.set(0, 0.5);
      this.addChild(this.#logoSprite);
    }

    this.#headerText = new PIXI.Text("Select Weapon", {
      fill: "#ffffff",
      fontFamily: "EurostileBold",
      fontSize: 32,
      align: "right",
    });
    this.#headerText.anchor.set(1, 0.5);
    this.addChild(this.#headerText);

    this.#container = new PIXI.Container();
    this.addChild(this.#container);

    this.#createCurrentItem();

    const resPrev = PIXI.Loader.shared.resources.left;
    const resNext = PIXI.Loader.shared.resources.right;
    if (resPrev && resPrev.texture) {
      this._prevArrow = new PIXI.Sprite(resPrev.texture);
      this._prevArrow.anchor.set(0.5);
      this._prevArrow.interactive = true;
      this._prevArrow.buttonMode = true;
      this._prevArrow.on("pointertap", () => this._goToPrevious());
      this.addChild(this._prevArrow);
    }
    if (resNext && resNext.texture) {
      this._nextArrow = new PIXI.Sprite(resNext.texture);
      this._nextArrow.anchor.set(0.5);
      this._nextArrow.interactive = true;
      this._nextArrow.buttonMode = true;
      this._nextArrow.on("pointertap", () => this._goToNext());
      this.addChild(this._nextArrow);
    }

    this.#nameBox = new PIXI.Container();
    this.addChild(this.#nameBox);
    this.#nameText = new PIXI.Text("", {
      fontFamily: "EurostileBold",
      fontSize: 24,
      fill: "#ffffff",
      align: "center",
    });
    this.#nameText.anchor.set(0.5);
    this.#nameBox.addChild(this.#nameText);
    this._nameBorder = new PIXI.Graphics();
    this.#nameBox.addChildAt(this._nameBorder, 0);
    this._updateName();

    this.#backButton = new ButtonGame("BACK", {
      fontFamily: "EurostileBold",
      fontSize: 20,
    });
    this.#backButton.onClick(() => this._onBack());
    this.addChild(this.#backButton);
    this.#playButton = new ButtonGame("PLAY GAME", {
      fontFamily: "EurostileBold",
      fontSize: 20,
    });
    this.#playButton.onClick(() => this._startGame());
    this.addChild(this.#playButton);

    this._animatedInitial = false;
  }

  #createCurrentItem() {
    if (this.#currentItem) {
      this.#container.removeChild(this.#currentItem);
      this.#currentItem.destroy({ children: true });
      this.#currentItem = null;
    }
    const key = this.#keys[this.#currentIndex];
    const item = new WeaponItem(key, {
      labelText: weaponsData[key].displayName || key,
      onClick: () => this._startGameWithKey(key),
    });
    this.#currentItem = item;
    this.#container.addChild(item);
    this._updateName();
  }

  _updateName() {
    const key = this.#keys[this.#currentIndex];
    const display = weaponsData[key].displayName || key;
    if (this.#nameText) {
      this.#nameText.text = display.toUpperCase();
    }
  }

  onResize(rw, rh) {
    if (this.#bg) {
      const tex = this.#bg.texture;
      const scale = Math.max(rw / tex.width, rh / tex.height);
      this.#bg.scale.set(scale);
      this.#bg.x = rw / 2;
      this.#bg.y = rh / 2;
    }
    if (this.#logoSprite) {
      const logoW = Math.min(rw * 0.15, 150);
      const aspect =
        this.#logoSprite.texture.width / this.#logoSprite.texture.height;
      this.#logoSprite.width = logoW;
      this.#logoSprite.height = logoW / aspect;
      this.#logoSprite.x = 20;
      this.#logoSprite.y = 20 + this.#logoSprite.height / 2;
      if (!this._animatedInitial) {
        this.#logoSprite.alpha = 0;
        gsap.to(this.#logoSprite, { alpha: 1, duration: 0.8, delay: 0.2 });
      }
    }
    if (this.#headerText) {
      const fontSize = Math.min(Math.max(Math.round(rw * 0.04), 16), 32);
      this.#headerText.style.fontSize = fontSize;
      this.#headerText.x = rw - 20;
      this.#headerText.y = this.#logoSprite
        ? this.#logoSprite.y
        : 20 + fontSize / 2;
      if (!this._animatedInitial) {
        this.#headerText.alpha = 0;
        gsap.to(this.#headerText, { alpha: 1, duration: 0.8, delay: 0.3 });
      }
    }
    if (this.#container && this.#currentItem) {
      let itemW = Math.min(rw * 0.4, 500);
      itemW = Math.max(itemW, 120);
      const sprite = this.#currentItem.children.find(
        (ch) => ch instanceof PIXI.Sprite
      );
      let aspect = 1;
      if (sprite && sprite.texture)
        aspect = sprite.texture.width / sprite.texture.height;
      const itemH = itemW / aspect;
      this.#currentItem.setSize(itemW, itemH);
      this.#currentItem.x = rw / 2;
      this.#currentItem.y = rh * 0.4;
      if (!this._animatedInitial) {
        this.#currentItem.alpha = 0;
        gsap.to(this.#currentItem, { alpha: 1, duration: 0.8, delay: 0.4 });
      }
    }
    const arrowSize = Math.round(rw * 0.05);
    if (this._prevArrow) {
      this._prevArrow.width = arrowSize;
      this._prevArrow.height = arrowSize;
      this._prevArrow.x = rw * 0.2;
      this._prevArrow.y = rh * 0.4;
      if (!this._animatedInitial) {
        this._prevArrow.alpha = 0;
        gsap.to(this._prevArrow, { alpha: 1, duration: 0.5, delay: 0.5 });
      }
    }
    if (this._nextArrow) {
      this._nextArrow.width = arrowSize;
      this._nextArrow.height = arrowSize;
      this._nextArrow.x = rw * 0.8;
      this._nextArrow.y = rh * 0.4;
      if (!this._animatedInitial) {
        this._nextArrow.alpha = 0;
        gsap.to(this._nextArrow, { alpha: 1, duration: 0.5, delay: 0.5 });
      }
    }
    const btnW = Math.min(300, rw * 0.3);
    const btnH = btnW / 4;
    const marginBottom = 60;
    const spacingX = 40;
    if (this.#backButton) {
      this.#backButton.setSize(btnW, btnH);
      this.#backButton.x = spacingX + btnW / 2;
      this.#backButton.y = rh - marginBottom;
      if (!this._animatedInitial) {
        this.#backButton.alpha = 0;
        gsap.to(this.#backButton, { alpha: 1, duration: 0.5, delay: 0.6 });
      }
    }
    if (this.#playButton) {
      this.#playButton.setSize(btnW, btnH);
      this.#playButton.x = rw - spacingX - btnW / 2;
      this.#playButton.y = rh - marginBottom;
      if (!this._animatedInitial) {
        this.#playButton.alpha = 0;
        gsap.to(this.#playButton, { alpha: 1, duration: 0.5, delay: 0.6 });
      }
    }
    if (this.#nameBox && this.#nameText) {
      const nameFontSize = Math.min(Math.max(Math.round(rw * 0.03), 18), 36);
      this.#nameText.style.fontSize = nameFontSize;
      const paddingX = 20;
      const paddingY = 10;
      const textWidth = this.#nameText.width;
      const textHeight = this.#nameText.height;
      const boxW = textWidth + paddingX * 2;
      const boxH = textHeight + paddingY * 2;
      this._nameBorder.clear();
      this._nameBorder.lineStyle(2, 0x09d1e1);
      this._nameBorder.drawRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
      this.#nameBox.x = rw / 2;
      this.#nameBox.y = rh - marginBottom;
      if (!this._animatedInitial) {
        this.#nameBox.alpha = 0;
        gsap.to(this.#nameBox, { alpha: 1, duration: 0.5, delay: 0.7 });
      }
    }
    this._animatedInitial = true;
  }

  _goToPrevious() {
    const len = this.#keys.length;
    this.#currentIndex = (this.#currentIndex - 1 + len) % len;
    this.#createCurrentItem();
    this.onResize(this._manager.rendererWidth, this._manager.rendererHeight);
  }
  _goToNext() {
    const len = this.#keys.length;
    this.#currentIndex = (this.#currentIndex + 1) % len;
    this.#createCurrentItem();
    this.onResize(this._manager.rendererWidth, this._manager.rendererHeight);
  }
  _startGameWithKey(key) {
    this._manager.changeScene("game", { weaponKey: key });
  }
  _startGame() {
    const key = this.#keys[this.#currentIndex];
    this._manager.changeScene("game", { weaponKey: key });
  }
  _onBack() {
    this._manager.changeScene("intro");
  }
}
