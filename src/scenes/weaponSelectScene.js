import * as PIXI from "pixi.js";
import { BaseScene } from "../core/baseScene";
import { gsap } from "gsap";
import { ButtonGame } from "../utils/textButton";
import { WeaponItem } from "../utils/weaponItem";
import { weaponsData } from "../data/weaponsData";

export class WeaponSelectScene extends BaseScene {
  #bg;
  #logoSprite;
  #headerText;
  #container;
  #currentItem;
  #keys;
  #currentIndex = 0;
  #infoBox;
  #nameText;
  #descText;
  _infoBorder;
  #backButton;
  #playButton;
  _prevArrow;
  _nextArrow;
  _animatedInitial = false;
  _isDragging = false;
  _dragStartX = 0;
  _dragThreshold = 50;

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
      this.#logoSprite.anchor.set(0.5);
      this.addChild(this.#logoSprite);
    }

    this.#headerText = new PIXI.Text("Select Weapon", {
      fill: "#ffffff",
      fontFamily: "EurostileBold",
      fontSize: 32,
      align: "center",
      wordWrap: true,
      wordWrapWidth: 400,
    });
    this.#headerText.anchor.set(0.5, 0.5);
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

    this.#infoBox = new PIXI.Container();
    this.addChild(this.#infoBox);
    this.#nameText = new PIXI.Text("", {
      fontFamily: "EurostileBold",
      fontSize: 24,
      fill: "#ffffff",
      align: "center",
      wordWrap: true,
    });
    this.#nameText.anchor.set(0.5, 0);
    this.#infoBox.addChild(this.#nameText);

    this.#descText = new PIXI.Text("", {
      fontFamily: "EurostileBold",
      fontSize: 18,
      fill: "#cccccc",
      align: "center",
      wordWrap: true,
    });
    this.#descText.anchor.set(0.5, 0);
    this.#infoBox.addChild(this.#descText);

    this._infoBorder = new PIXI.Graphics();
    this.#infoBox.addChildAt(this._infoBorder, 0);
    this._updateInfo();

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
    item.interactive = true;
    item.on("pointerdown", (e) => this._onDragStart(e));
    item.on("pointermove", (e) => this._onDragMove(e));
    item.on("pointerup", (e) => this._onDragEnd(e));
    item.on("pointerupoutside", (e) => this._onDragEnd(e));

    this.#currentItem = item;
    this.#container.addChild(item);

    this._updateInfo();
  }

  _updateInfo() {
    const key = this.#keys[this.#currentIndex];
    const data = weaponsData[key] || {};
    const name = data.displayName || key;
    const desc = data.description || "";
    if (this.#nameText) {
      this.#nameText.text = name.toUpperCase();
    }
    if (this.#descText) {
      this.#descText.text = desc;
    }
  }

  _onDragStart(e) {
    this._isDragging = true;
    this._dragStartX = e.data.global.x;
  }
  _onDragMove(e) {}
  _onDragEnd(e) {
    if (!this._isDragging) return;
    this._isDragging = false;
    const dragEndX = e.data.global.x;
    const dx = dragEndX - this._dragStartX;
    if (dx > this._dragThreshold) {
      this._goToPrevious();
    } else if (dx < -this._dragThreshold) {
      this._goToNext();
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

    const isMobile = rw < 768;
    const margin = 20;
    const contentMargin = 30;

    if (this.#logoSprite) {
      const logoMaxW = isMobile ? rw * 0.3 : rw * 0.15;
      const logoMin = 60;
      const logoW = Math.min(logoMaxW, Math.max(logoMin, logoMaxW));
      const aspectLogo =
        this.#logoSprite.texture.width / this.#logoSprite.texture.height;
      const logoH = logoW / aspectLogo;
      this.#logoSprite.width = logoW;
      this.#logoSprite.height = logoH;
      if (isMobile) {
        this.#logoSprite.x = rw / 2;
        this.#logoSprite.y = margin + logoH / 2;
        if (!this._animatedInitial) {
          this.#logoSprite.alpha = 0;
          gsap.to(this.#logoSprite, { alpha: 1, duration: 0.6, delay: 0.2 });
        }
      } else {
        this.#logoSprite.x = margin + logoW / 2;
        this.#logoSprite.y = margin + logoH / 2;
        if (!this._animatedInitial) {
          this.#logoSprite.alpha = 0;
          gsap.to(this.#logoSprite, { alpha: 1, duration: 0.6, delay: 0.2 });
        }
      }
    }

    if (this.#headerText) {
      const fontSize = Math.min(
        Math.max(Math.round(rw * (isMobile ? 0.06 : 0.04)), 16),
        32
      );
      this.#headerText.style.fontSize = fontSize;
      this.#headerText.style.wordWrapWidth = isMobile ? rw * 0.8 : rw * 0.4;
      if (isMobile) {
        let y = this.#logoSprite
          ? this.#logoSprite.y + this.#logoSprite.height / 2 + 10
          : margin + fontSize / 2;
        this.#headerText.x = rw / 2;
        this.#headerText.y = y;
        if (!this._animatedInitial) {
          this.#headerText.alpha = 0;
          gsap.to(this.#headerText, { alpha: 1, duration: 0.6, delay: 0.3 });
        }
      } else {
        const logoRight = this.#logoSprite
          ? this.#logoSprite.x + this.#logoSprite.width / 2 + 20
          : margin;
        const availW = rw - logoRight - margin;
        this.#headerText.x = logoRight + availW / 2;
        this.#headerText.y = margin + this.#headerText.height / 2;
        if (!this._animatedInitial) {
          this.#headerText.alpha = 0;
          gsap.to(this.#headerText, { alpha: 1, duration: 0.6, delay: 0.3 });
        }
      }
    }

    if (this.#container && this.#currentItem) {
      let itemW;
      if (isMobile) {
        itemW = Math.min(rw * 0.6, 300);
        itemW = Math.max(itemW, 100);
      } else {
        itemW = Math.min(rw * 0.3, 400);
        itemW = Math.max(itemW, 120);
      }
      const sprite = this.#currentItem.children.find(
        (ch) => ch instanceof PIXI.Sprite
      );
      let aspect = 1;
      if (sprite && sprite.texture) {
        aspect = sprite.texture.width / sprite.texture.height;
      }
      const itemH = itemW / aspect;

      if (isMobile) {
        let startY = this.#headerText
          ? this.#headerText.y + this.#headerText.height / 2 + contentMargin
          : margin + contentMargin;
        startY += 20;
        this.#currentItem.setSize(itemW, itemH);
        this.#currentItem.x = rw / 2;
        this.#currentItem.y = startY + itemH / 2;
        if (!this._animatedInitial) {
          this.#currentItem.scale.set(0.5);
          gsap.to(this.#currentItem.scale, {
            x: 1,
            y: 1,
            duration: 0.8,
            ease: "back.out(1.7)",
            delay: 0.4,
          });
          gsap.to(this.#currentItem.scale, {
            x: 1.05,
            y: 1.05,
            duration: 1.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 1.2,
          });
        }
      } else {
        const centerY = rh * 0.4;
        this.#currentItem.setSize(itemW, itemH);
        this.#currentItem.x = rw / 2;
        this.#currentItem.y = centerY;
        if (!this._animatedInitial) {
          this.#currentItem.scale.set(0.5);
          gsap.to(this.#currentItem.scale, {
            x: 1,
            y: 1,
            duration: 0.8,
            ease: "back.out(1.7)",
            delay: 0.4,
          });
          gsap.to(this.#currentItem.scale, {
            x: 1.05,
            y: 1.05,
            duration: 1.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 1.2,
          });
        }
      }
    }

    if (this.#infoBox && this.#nameText && this.#descText) {
      let boxW;
      if (isMobile) {
        boxW = rw * 0.8;
      } else {
        const btnArea = Math.min(rw * 0.22, 300);
        const edgeMargin = 20;
        boxW = rw - 2 * (edgeMargin + btnArea) - 40;
        if (boxW < 100) boxW = rw * 0.4;
      }
      let nameFontSize = Math.min(
        Math.max(Math.round(boxW * (isMobile ? 0.06 : 0.05)), 18),
        32
      );
      this.#nameText.style.fontSize = nameFontSize;
      this.#nameText.style.wordWrapWidth = boxW;
      let descFontSize = Math.min(
        Math.max(Math.round(boxW * (isMobile ? 0.035 : 0.03)), 14),
        isMobile ? 20 : 24
      );
      this.#descText.style.fontSize = descFontSize;
      this.#descText.style.wordWrapWidth = boxW;

      this._infoBorder.clear();

      const paddingX = 20;
      const paddingY = 10;

      let totalTextHeight = 0;
      totalTextHeight += this.#nameText.height;
      totalTextHeight += 10;
      totalTextHeight += this.#descText.height;
      const boxH = totalTextHeight + paddingY * 2;
      const boxWidth = boxW + paddingX * 2;
      this._infoBorder.lineStyle(2, 0x09d1e1);
      this._infoBorder.drawRoundedRect(-boxWidth / 2, 0, boxWidth, boxH, 8);

      if (isMobile) {
        const spriteY =
          this.#currentItem &&
          this.#currentItem.children.find((ch) => ch instanceof PIXI.Sprite)
            ? this.#currentItem.y +
              this.#currentItem.children.find((ch) => ch instanceof PIXI.Sprite)
                .height /
                2
            : rh * 0.5;
        const yPos = spriteY + 15;
        this.#infoBox.x = rw / 2;
        this.#infoBox.y = yPos;
        this.#nameText.x = 0;
        this.#nameText.y = 10;
        this.#descText.x = 0;
        this.#descText.y = this.#nameText.y + this.#nameText.height + 10;
        if (!this._animatedInitial) {
          this.#infoBox.alpha = 0;
          gsap.to(this.#infoBox, { alpha: 1, duration: 0.6, delay: 0.7 });
        }
      } else {
        const edgeMargin = 20;
        const btnArea = Math.min(rw * 0.22, 300);
        const yPos = rh - edgeMargin - btnArea / 2 - boxH / 2 - 10;
        this.#infoBox.x = rw / 2;
        this.#infoBox.y = yPos;
        this.#nameText.x = 0;
        this.#nameText.y = 10;
        this.#descText.x = 0;
        this.#descText.y = this.#nameText.y + this.#nameText.height + 10;
        if (!this._animatedInitial) {
          this.#infoBox.alpha = 0;
          gsap.to(this.#infoBox, { alpha: 1, duration: 0.6, delay: 0.7 });
        }
      }
    }

    if (isMobile) {
      const btnW = Math.min(rw * 0.6, 300);
      const btnH = Math.max(btnW / 6, 50);
      let btnY = rh - margin - btnH / 2;
      if (this.#playButton) {
        this.#playButton.setSize(btnW, btnH);
        this.#playButton.x = rw / 2;
        this.#playButton.y = btnY;
        if (!this._animatedInitial) {
          this.#playButton.alpha = 0;
          gsap.to(this.#playButton, { alpha: 1, duration: 0.6, delay: 0.8 });
        }
        btnY -= btnH + 10;
      }
      if (this.#backButton) {
        this.#backButton.setSize(btnW, btnH);
        this.#backButton.x = rw / 2;
        this.#backButton.y = btnY;
        if (!this._animatedInitial) {
          this.#backButton.alpha = 0;
          gsap.to(this.#backButton, { alpha: 1, duration: 0.6, delay: 0.9 });
        }
      }
      if (this._prevArrow) this._prevArrow.visible = false;
      if (this._nextArrow) this._nextArrow.visible = false;
    } else {
      const btnW = Math.min(rw * 0.22, 300);
      const btnH = Math.max(btnW / 4.5, 60);
      const edgeMargin = 20;
      if (this.#backButton) {
        this.#backButton.setSize(btnW, btnH);
        this.#backButton.x = edgeMargin + btnW / 2;
        this.#backButton.y = rh - edgeMargin - btnH / 2;
        if (!this._animatedInitial) {
          this.#backButton.alpha = 0;
          gsap.to(this.#backButton, { alpha: 1, duration: 0.6, delay: 0.8 });
        }
      }
      if (this.#playButton) {
        this.#playButton.setSize(btnW, btnH);
        this.#playButton.x = rw - edgeMargin - btnW / 2;
        this.#playButton.y = rh - edgeMargin - btnH / 2;
        if (!this._animatedInitial) {
          this.#playButton.alpha = 0;
          gsap.to(this.#playButton, { alpha: 1, duration: 0.6, delay: 0.8 });
        }
      }
      if (this._prevArrow && this._nextArrow) {
        const arrowSize = Math.min(rw * 0.04, 50);
        const centerY = (this.#currentItem && this.#currentItem.y) || rh * 0.4;
        this._prevArrow.width = arrowSize;
        this._prevArrow.height = arrowSize;
        this._prevArrow.x = rw * 0.2;
        this._prevArrow.y = centerY;
        this._prevArrow.visible = true;
        if (!this._animatedInitial) {
          this._prevArrow.alpha = 0;
          gsap.to(this._prevArrow, { alpha: 1, duration: 0.6, delay: 0.5 });
        }
        this._nextArrow.width = arrowSize;
        this._nextArrow.height = arrowSize;
        this._nextArrow.x = rw - rw * 0.2;
        this._nextArrow.y = centerY;
        this._nextArrow.visible = true;
        if (!this._animatedInitial) {
          this._nextArrow.alpha = 0;
          gsap.to(this._nextArrow, { alpha: 1, duration: 0.6, delay: 0.5 });
        }
      }
    }

    this._animatedInitial = true;
  }

  _goToPrevious() {
    const len = this.#keys.length;
    this.#currentIndex = (this.#currentIndex - 1 + len) % len;
    this.#createCurrentItem();

    this._animatedInitial = false;
    this.onResize(this._manager.rendererWidth, this._manager.rendererHeight);
  }
  _goToNext() {
    const len = this.#keys.length;
    this.#currentIndex = (this.#currentIndex + 1) % len;
    this.#createCurrentItem();
    this._animatedInitial = false;
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
