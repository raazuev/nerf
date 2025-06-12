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
  #logoSprite;
  #headerText;
  #headerContainer;
  #contentContainer;
  #textContainer;
  #titleText;
  #descText;
  #statTexts = [];
  #backButton;
  #visitSiteButton;
  #keys;
  #currentIndex;
  _prevArrow;
  _nextArrow;
  _animated = false;
  _isDragging = false;
  _dragStartX = 0;
  _dragThreshold = 50;

  static SITE_URL =
    "https://www.blasterparts.com/fr/c/categories-de-produits/nerf-dartblaster";

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

    this.#headerContainer = new PIXI.Container();
    this.addChild(this.#headerContainer);

    const resLogo = PIXI.Loader.shared.resources.logo_primary;
    if (resLogo && resLogo.texture) {
      this.#logoSprite = new PIXI.Sprite(resLogo.texture);
      this.#logoSprite.anchor.set(0.5);
      this.#headerContainer.addChild(this.#logoSprite);
    } else {
      console.warn("WeaponScene: logo_primary not loaded");
    }

    this.#headerText = new PIXI.Text(this.#rawTitleText(), {
      fill: "#ffffff",
      fontFamily: "EurostileBold",
      fontSize: 32,
      align: "center",
      wordWrap: true,
      wordWrapWidth: 400,
    });
    this.#headerText.anchor.set(0.5);
    this.#headerContainer.addChild(this.#headerText);

    this.#contentContainer = new PIXI.Container();
    this.addChild(this.#contentContainer);

    this.#sprite = null;
    if (this.#data && this.#data.imageResource) {
      const res = PIXI.Loader.shared.resources[this.#data.imageResource];
      if (res && res.texture) {
        this.#sprite = new PIXI.Sprite(res.texture);
        this.#sprite.anchor.set(0.5);
        this.#contentContainer.addChild(this.#sprite);
        this.#sprite.interactive = true;
        this.#sprite.on("pointerdown", (e) => this._onDragStart(e));
        this.#sprite.on("pointermove", (e) => this._onDragMove(e));
        this.#sprite.on("pointerup", (e) => this._onDragEnd(e));
        this.#sprite.on("pointerupoutside", (e) => this._onDragEnd(e));
      }
    }

    this.#textContainer = new PIXI.Container();
    this.#contentContainer.addChild(this.#textContainer);

    this._buildTextContent();

    this.#backButton = new ButtonGame("GO BACK", {
      fontFamily: "EurostileBold",
      fontSize: 20,
    });
    this.#backButton.onClick(() => this._manager.changeScene("intro"));
    this.addChild(this.#backButton);

    this.#visitSiteButton = new ButtonGame("VISIT NERF", {
      fontFamily: "EurostileBold",
      fontSize: 20,
    });
    this.#visitSiteButton.onClick(() => {
      window.open(WeaponScene.SITE_URL, "_blank");
    });
    this.addChild(this.#visitSiteButton);

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
  }

  #rawTitle = "Swipe left and right to view the range!";
  #rawTitleText() {
    return this.#rawTitle.toUpperCase();
  }

  _buildTextContent() {
    if (this.#textContainer) {
      this.#textContainer.removeChildren();
    }
    this.#titleText = null;
    this.#descText = null;
    this.#statTexts = [];

    if (this.#data) {
      const title = new PIXI.Text(this.#data.displayName.toUpperCase(), {
        fill: "#09d1e1",
        fontFamily: "EurostileBold",
        fontSize: 36,
        align: "left",
        wordWrap: true,
        wordWrapWidth: 400,
      });
      title.anchor.set(0, 0);
      this.#textContainer.addChild(title);
      this.#titleText = title;

      const desc = new PIXI.Text(this.#data.description || "", {
        fill: "#ffffff",
        fontFamily: "EurostileBold",
        fontSize: 28,
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
          fontFamily: "EurostileBold",
          fontSize: 20,
          align: "left",
          wordWrap: true,
          wordWrapWidth: 400,
        });
        statText.anchor.set(0, 0);
        this.#textContainer.addChild(statText);
        this.#statTexts.push(statText);
      });
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
    const headerMargin = 20;
    const contentMargin = 30;

    if (this.#headerContainer) {
      this.#headerContainer.x = 0;
      this.#headerContainer.y = 0;

      if (isMobile) {
        this._playSpriteAppearAnimation();
        let currentY = headerMargin;
        if (this.#logoSprite) {
          const logoSize = Math.min(rw * 0.25, 80);
          const aspect =
            this.#logoSprite.texture.width / this.#logoSprite.texture.height;
          this.#logoSprite.width = logoSize;
          this.#logoSprite.height = logoSize / aspect;
          this.#logoSprite.x = rw / 2;
          this.#logoSprite.y = currentY + this.#logoSprite.height / 2;
          currentY += this.#logoSprite.height + 15;
        }
        if (this.#headerText) {
          const fontSize = Math.min(Math.max(Math.round(rw * 0.04), 16), 28);
          this.#headerText.style.fontSize = fontSize;
          this.#headerText.style.wordWrapWidth = rw * 0.85;
          this.#headerText.x = rw / 2;
          this.#headerText.y = currentY + fontSize / 2;
          this.#headerText.anchor.set(0.5, 0.5);
        }
      } else {
        this._playSpriteAppearAnimation();
        if (this.#logoSprite) {
          const logoSize = Math.min(rw * 0.2, 240);
          const aspect =
            this.#logoSprite.texture.width / this.#logoSprite.texture.height;
          this.#logoSprite.width = logoSize;
          this.#logoSprite.height = logoSize / aspect;
          this.#logoSprite.x = headerMargin + this.#logoSprite.width / 2;
          this.#logoSprite.y = headerMargin + this.#logoSprite.height / 2;
        }
        if (this.#headerText) {
          const fontSize = Math.min(Math.max(Math.round(rw * 0.025), 20), 32);
          this.#headerText.style.fontSize = fontSize;
          const logoRight = this.#logoSprite
            ? this.#logoSprite.x + this.#logoSprite.width / 2 + 30
            : headerMargin;
          const availableWidth = rw - logoRight - headerMargin;
          this.#headerText.style.wordWrapWidth = availableWidth;
          this.#headerText.anchor.set(0, 0.5);
          this.#headerText.x = logoRight;
          this.#headerText.y = headerMargin + fontSize / 1;
        }
      }
    }

    let headerBottom = headerMargin;
    if (isMobile) {
      let headerHeight = headerMargin;
      if (this.#logoSprite) headerHeight += this.#logoSprite.height + 15;
      if (this.#headerText) headerHeight += this.#headerText.height;
      headerBottom = headerHeight + contentMargin;
    } else {
      const headerHeight = Math.max(
        this.#logoSprite ? this.#logoSprite.height : 0,
        this.#headerText ? this.#headerText.height : 0
      );
      headerBottom = headerMargin + headerHeight + contentMargin;
    }

    if (this.#contentContainer) {
      this.#contentContainer.x = 0;
      this.#contentContainer.y = 0;

      if (isMobile) {
        let currentY = headerBottom;
        if (this.#sprite) {
          const maxWidth = rw * 0.8;
          const aspect =
            this.#sprite.texture.width / this.#sprite.texture.height;
          const spriteWidth = Math.min(maxWidth, 300);
          const spriteHeight = spriteWidth / aspect;
          this.#sprite.width = spriteWidth;
          this.#sprite.height = spriteHeight;
          this.#sprite.x = rw / 2;
          this.#sprite.y = currentY + spriteHeight / 2;
          currentY += spriteHeight + 25;
        }
        if (this.#textContainer) {
          this.#textContainer.x = headerMargin;
          this._layoutTextContentMobile(rw * 0.85, currentY);
        }
      } else {
        const availableHeight = rh - headerBottom - 10;
        if (this.#sprite) {
          const maxWidth = rw * 0.3;
          const maxHeight = availableHeight * 0.4;
          const aspect =
            this.#sprite.texture.width / this.#sprite.texture.height;
          let spriteWidth = maxWidth;
          let spriteHeight = spriteWidth / aspect;
          if (spriteHeight > maxHeight) {
            spriteHeight = maxHeight;
            spriteWidth = spriteHeight * aspect;
          }
          this.#sprite.width = spriteWidth;
          this.#sprite.height = spriteHeight;
          this.#sprite.x = rw * 0.32;
          const raiseOffset = 0.04 * availableHeight * 1;
          this.#sprite.y = headerBottom + spriteHeight / 1 - raiseOffset;
        }
        if (this.#textContainer) {
          const textStartX = rw * 0.6;
          const textWidth = rw - textStartX - contentMargin;
          this.#textContainer.x = textStartX;
          this._layoutTextContentDesktop(
            textWidth,
            headerBottom,
            availableHeight
          );
        }
      }
    }

    const buttonMargin = 20;
    const buttonSpacing = 15;
    if (isMobile) {
      const btnWidth = Math.min(rw * 0.8, 300);
      const btnHeight = Math.max(btnWidth / 6, 50);
      let buttonY = rh - buttonMargin - btnHeight / 2;
      if (this.#visitSiteButton) {
        this.#visitSiteButton.setSize(btnWidth, btnHeight);
        this.#visitSiteButton.x = rw / 2;
        this.#visitSiteButton.y = buttonY;
        buttonY -= btnHeight + buttonSpacing;
      }
      if (this.#backButton) {
        this.#backButton.setSize(btnWidth, btnHeight);
        this.#backButton.x = rw / 2;
        this.#backButton.y = buttonY;
      }
    } else {
      const btnWidth = Math.min(320, rw * 0.22);
      const btnHeight = Math.max(btnWidth / 4.5, 60);
      const edgeMargin = 20;
      if (this.#backButton) {
        this.#backButton.setSize(btnWidth, btnHeight);
        this.#backButton.x = edgeMargin + btnWidth / 2;
        this.#backButton.y = rh - edgeMargin - btnHeight / 2;
      }
      if (this.#visitSiteButton) {
        this.#visitSiteButton.setSize(btnWidth, btnHeight);
        this.#visitSiteButton.x = rw - edgeMargin - btnWidth / 2;
        this.#visitSiteButton.y = rh - edgeMargin - btnHeight / 2;
      }
    }

    if (!isMobile && this._prevArrow && this._nextArrow) {
      const arrowSize = Math.min(rw * 0.03, 50);
      const arrowMargin = 40;
      this._prevArrow.width = arrowSize;
      this._prevArrow.height = arrowSize;
      this._prevArrow.x = arrowMargin;
      this._prevArrow.y = rh / 2;
      this._prevArrow.visible = true;
      this._nextArrow.width = arrowSize;
      this._nextArrow.height = arrowSize;
      this._nextArrow.x = rw - arrowMargin;
      this._nextArrow.y = rh / 2;
      this._nextArrow.visible = true;
      if (!this._animated) {
        this._prevArrow.alpha = 0;
        this._nextArrow.alpha = 0;
        gsap.to([this._prevArrow, this._nextArrow], {
          alpha: 1,
          duration: 0.5,
          delay: 0.7,
        });
      }
    } else {
      if (this._prevArrow) this._prevArrow.visible = false;
      if (this._nextArrow) this._nextArrow.visible = false;
    }

    if (!this._animated) {
      this._animated = true;
      this._playInitialAnimation(isMobile);
    }
  }

  _layoutTextContentMobile(maxWidth, startY) {
    if (!this.#textContainer) return;
    let currentY = startY;
    const textSpacing = 15;
    if (this.#titleText) {
      const fontSize = Math.min(Math.max(Math.round(maxWidth * 0.06), 20), 32);
      this.#titleText.style.fontSize = fontSize;
      this.#titleText.style.wordWrapWidth = maxWidth;
      this.#titleText.anchor.set(0.5, 0);
      this.#titleText.x = 0;
      this.#titleText.y = 0;
      currentY += this.#titleText.height + textSpacing;
    }
    if (this.#descText) {
      const fontSize = Math.min(Math.max(Math.round(maxWidth * 0.05), 14), 24);
      this.#descText.style.fontSize = fontSize;
      this.#descText.style.wordWrapWidth = maxWidth;
      this.#descText.anchor.set(0.5, 0);
      this.#descText.x = 0;
      this.#descText.y = currentY - startY;
      currentY += this.#descText.height + textSpacing;
    }
    this.#statTexts.forEach((statText) => {
      const fontSize = Math.min(Math.max(Math.round(maxWidth * 0.04), 12), 18);
      statText.style.fontSize = fontSize;
      statText.style.wordWrapWidth = maxWidth;
      statText.anchor.set(0.5, 0);
      statText.x = 0;
      statText.y = currentY - startY;
      currentY += statText.height + textSpacing * 0.7;
    });
    this.#textContainer.x = (this._manager.rendererWidth - 0) / 2;
    this.#textContainer.y = startY;
  }

  _layoutTextContentDesktop(textWidth, headerBottom, availableHeight) {
    if (!this.#textContainer) return;
    let currentY = headerBottom + 20;
    const textSpacing = 12;
    if (this.#titleText) {
      const fontSize = Math.min(Math.max(Math.round(textWidth * 0.06), 24), 36);
      this.#titleText.style.fontSize = fontSize;
      this.#titleText.style.wordWrapWidth = textWidth;
      this.#titleText.anchor.set(0, 0);
      this.#titleText.x = 0;
      this.#titleText.y = currentY;
      currentY += this.#titleText.height + textSpacing;
    }
    if (this.#descText) {
      const fontSize = Math.min(Math.max(Math.round(textWidth * 0.05), 18), 28);
      this.#descText.style.fontSize = fontSize;
      this.#descText.style.wordWrapWidth = textWidth;
      this.#descText.anchor.set(0, 0);
      this.#descText.x = 0;
      this.#descText.y = currentY;
      currentY += this.#descText.height + textSpacing;
    }
    this.#statTexts.forEach((statText) => {
      const fontSize = Math.min(Math.max(Math.round(textWidth * 0.04), 14), 20);
      statText.style.fontSize = fontSize;
      statText.style.wordWrapWidth = textWidth;
      statText.anchor.set(0, 0);
      statText.x = 0;
      statText.y = currentY;
      currentY += statText.height + textSpacing * 0.7;
    });
    this.#textContainer.x = textWidth ? this._manager.rendererWidth * 0.55 : 0;
    this.#textContainer.y = headerBottom + 20;
  }

  _playSpriteAppearAnimation() {
    if (!this.#sprite) return;

    this.#sprite.scale.set(0);
    this.#sprite.rotation = -Math.PI / 6;
    this.#sprite.alpha = 0;

    const tl = gsap.timeline();

    tl.to(this.#sprite, {
      alpha: 1,
      duration: 0.2,
      ease: "power1.out",
    });

    tl.to(
      this.#sprite,
      {
        scaleX: 1.2,
        scaleY: 1.2,
        rotation: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
      },
      "<"
    );

    tl.to(this.#sprite.scale, {
      x: 1,
      y: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  _goToPrevious() {
    const len = this.#keys.length;
    this.#currentIndex = (this.#currentIndex - 1 + len) % len;
    this.#weaponKey = this.#keys[this.#currentIndex];
    this._reloadSpriteAndDescription();
  }

  _goToNext() {
    const len = this.#keys.length;
    this.#currentIndex = (this.#currentIndex + 1) % len;
    this.#weaponKey = this.#keys[this.#currentIndex];
    this._reloadSpriteAndDescription();
  }

  _reloadSpriteAndDescription() {
    this.#data = weaponsData[this.#weaponKey];

    if (this.#sprite) {
      this.#contentContainer.removeChild(this.#sprite);
      this.#sprite.destroy();
      this.#sprite = null;
    }
    if (this.#data && this.#data.imageResource) {
      const res = PIXI.Loader.shared.resources[this.#data.imageResource];
      if (res && res.texture) {
        this.#sprite = new PIXI.Sprite(res.texture);
        this.#sprite.anchor.set(0.5);
        this.#contentContainer.addChild(this.#sprite);
        this.#sprite.interactive = true;
        this.#sprite.on("pointerdown", (e) => this._onDragStart(e));
        this.#sprite.on("pointermove", (e) => this._onDragMove(e));
        this.#sprite.on("pointerup", (e) => this._onDragEnd(e));
        this.#sprite.on("pointerupoutside", (e) => this._onDragEnd(e));
      }
    }

    if (this.#textContainer) {
      this._buildTextContent();
    }
    this._animated = false;
    this.onResize(this._manager.rendererWidth, this._manager.rendererHeight);
  }
}
