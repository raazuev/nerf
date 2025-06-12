import * as PIXI from "pixi.js";
import { BaseScene } from "../core/baseScene";
import { gsap } from "gsap";
import { ButtonGame } from "../utils/textButton";
import { WeaponItem } from "../utils/weaponItem";
import { weaponsData } from "../data/weaponsData";

export class WeaponSelectScene extends BaseScene {
  #bg;
  #previewContainer;
  #previewItems = [];
  #keys;
  #currentIndex = 0;
  #backButton;
  #playButton;

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
    } else {
      console.warn("WeaponScene: resource 'weapon_bg' not found");
    }

    const resLogo = PIXI.Loader.shared.resources.logo_primary;
    if (resLogo && resLogo.texture) {
      const logo = new PIXI.Sprite(resLogo.texture);
      logo.anchor.set(0, 0.5);
      this.addChild(logo);
      this._logoSprite = logo;
    }
    this._headerText = new PIXI.Text("Select Your Weapon", {
      fill: "#ffffff",
      fontFamily: "EurostileBold",
      fontSize: 32,
      align: "left",
    });
    this._headerText.anchor.set(0, 0.5);
    this.addChild(this._headerText);

    this.#previewContainer = new PIXI.Container();
    this.addChild(this.#previewContainer);
    this.#previewItems = [];
    this.#keys.forEach((key, idx) => {
      const item = new WeaponItem(key, {
        labelText: weaponsData[key].displayName || key,
        onClick: () => {
          this.#currentIndex = idx;
          this._updatePreviewSelection();
        },
      });
      this.#previewItems.push(item);
      this.#previewContainer.addChild(item);
    });

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

    this._animatedInitial = false;
  }

  onResize(rw, rh) {
    if (this.#bg) {
      const tex = this.#bg.texture;
      const scale = Math.max(rw / tex.width, rh / tex.height);
      this.#bg.scale.set(scale);
      this.#bg.x = rw / 2;
      this.#bg.y = rh / 2;
    }

    if (this._logoSprite) {
      const logoW = Math.min(rw * 0.15, 150);
      const aspect =
        this._logoSprite.texture.width / this._logoSprite.texture.height;
      this._logoSprite.width = logoW;
      this._logoSprite.height = logoW / aspect;
      this._logoSprite.x = 20;
      this._logoSprite.y = 20 + this._logoSprite.height / 2;
    }
    if (this._headerText) {
      const fontSize = Math.min(Math.max(Math.round(rw * 0.04), 16), 32);
      this._headerText.style.fontSize = fontSize;
      if (this._logoSprite) {
        this._headerText.x = this._logoSprite.x + this._logoSprite.width + 10;
        this._headerText.y = this._logoSprite.y;
        this._headerText.anchor.set(0, 0.5);
      } else {
        this._headerText.anchor.set(0.5, 0.5);
        this._headerText.x = rw / 2;
        this._headerText.y = 20 + fontSize / 2;
      }
    }

    const total = this.#previewItems.length;
    if (total > 0) {
      const gap = 20;
      let itemW = Math.min(rw * 0.2, (rw - 40 - gap * (total - 1)) / total);
      itemW = Math.max(itemW, 80);
      this.#previewContainer.removeChildren();
      const fullW = total * itemW + (total - 1) * gap;
      const startX = (rw - fullW) / 2;
      const centerY = rh * 0.4;
      this.#previewItems.forEach((item, idx) => {
        const sprite = item.children.find((ch) => ch instanceof PIXI.Sprite);
        let aspect = 1;
        if (sprite && sprite.texture)
          aspect = sprite.texture.width / sprite.texture.height;
        const itemH = itemW / aspect;
        item.setSize(itemW, itemH);
        const x = startX + idx * (itemW + gap) + itemW / 2;
        const y = centerY;
        item.setPosition(x, y);
        this.#previewContainer.addChild(item);
        if (idx === this.#currentIndex) {
          if (!item.selectionOutline) {
            const outline = new PIXI.Graphics();
            outline.lineStyle(4, 0x09d1e1);
            outline.drawRoundedRect(
              -itemW / 2 - 4,
              -itemH / 2 - 4,
              itemW + 8,
              itemH + 8,
              8
            );
            item.addChildAt(outline, 0);
            item.selectionOutline = outline;
          }
        } else {
          if (item.selectionOutline) {
            item.removeChild(item.selectionOutline);
            item.selectionOutline.destroy();
            delete item.selectionOutline;
          }
        }
      });
      if (!this._animatedInitial) {
        gsap.from(this.#previewItems, {
          alpha: 0,
          y: "+=20",
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
        });
      }
    }

    const arrowSize = Math.round(rw * 0.05);
    if (this._prevArrow) {
      this._prevArrow.width = arrowSize;
      this._prevArrow.height = arrowSize;
      this._prevArrow.x =
        (rw - arrowSize) / 2 -
        (this.#previewItems.length *
          Math.min(
            rw * 0.2,
            (rw - 40 - 20 * (this.#previewItems.length - 1)) /
              this.#previewItems.length
          ) +
          20 * (this.#previewItems.length - 1)) /
          2 -
        arrowSize;
      this._prevArrow.y = rh * 0.4;
      if (!this._animatedInitial) this._prevArrow.alpha = 0;
      if (!this._animatedInitial)
        gsap.to(this._prevArrow, { alpha: 1, duration: 0.5, delay: 0.5 });
    }
    if (this._nextArrow) {
      this._nextArrow.width = arrowSize;
      this._nextArrow.height = arrowSize;
      this._nextArrow.x =
        (rw + arrowSize) / 2 +
        (this.#previewItems.length *
          Math.min(
            rw * 0.2,
            (rw - 40 - 20 * (this.#previewItems.length - 1)) /
              this.#previewItems.length
          ) +
          20 * (this.#previewItems.length - 1)) /
          2 +
        arrowSize / 2;
      this._nextArrow.y = rh * 0.4;
      if (!this._animatedInitial) this._nextArrow.alpha = 0;
      if (!this._animatedInitial)
        gsap.to(this._nextArrow, { alpha: 1, duration: 0.5, delay: 0.5 });
    }

    const maxBtnW = 300,
      minBtnW = 120;
    const btnW = Math.min(maxBtnW, Math.max(minBtnW, rw * 0.3));
    const btnH = btnW / 4;
    const offsetY = 60;
    const spacingX = 40;
    if (this.#backButton) {
      this.#backButton.setSize(btnW, btnH);
      this.#backButton.x = spacingX + btnW / 2;
      this.#backButton.y = rh - offsetY;
      if (!this._animatedInitial) {
        this.#backButton.alpha = 0;
        gsap.to(this.#backButton, { alpha: 1, duration: 0.5, delay: 0.6 });
      }
    }
    if (this.#playButton) {
      this.#playButton.setSize(btnW, btnH);
      this.#playButton.x = rw - spacingX - btnW / 2;
      this.#playButton.y = rh - offsetY;
      if (!this._animatedInitial) {
        this.#playButton.alpha = 0;
        gsap.to(this.#playButton, { alpha: 1, duration: 0.5, delay: 0.6 });
      }
    }

    this._animatedInitial = true;
  }

  _goToPrevious() {
    const len = this.#keys.length;
    this.#currentIndex = (this.#currentIndex - 1 + len) % len;
    this._updatePreviewSelection();
  }

  _goToNext() {
    const len = this.#keys.length;
    this.#currentIndex = (this.#currentIndex + 1) % len;
    this._updatePreviewSelection();
  }

  _updatePreviewSelection() {
    this.onResize(this._manager.rendererWidth, this._manager.rendererHeight);
  }

  _startGame() {
    const selectedKey = this.#keys[this.#currentIndex];
    this._manager.changeScene("game", { weaponKey: selectedKey });
  }

  _onBack() {
    this._manager.changeScene("intro");
  }
}
