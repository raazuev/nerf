import * as PIXI from "pixi.js";
import { BaseScene } from "../core/baseScene";
import { gsap } from "gsap";
import { ButtonGame } from "../utils/textButton";
import { VideoPlayer } from "../utils/videoPlayer";
import { WeaponItem } from "../utils/weaponItem";
import { weaponsData } from "../data/weaponsData";

export class IntroScene extends BaseScene {
  #bg;
  #buttons = [];
  #logoSprite;
  #titleText;
  #previewContainer;
  #previewItems = [];
  #rawTitle =
    "Choose your blaster then shoot as many targets as you can within";
  _logoAnimated = false;
  _titleAnimated = false;
  _previewAnimated = false;
  _buttonsAnimated = false;
  _isDragging = false;
  _dragStartX = 0;
  _dragThreshold = 50;
  _currentPreviewIndex = 0;
  _videoPlayer = null;

  constructor(manager) {
    super(manager);
  }

  init() {
    const resBg = PIXI.Loader.shared.resources.main_bg;
    if (resBg && resBg.texture) {
      this.#bg = new PIXI.Sprite(resBg.texture);
      this.#bg.anchor.set(0.5);
      this.addChild(this.#bg);
    }

    const resLogo = PIXI.Loader.shared.resources.logo_primary;
    if (resLogo && resLogo.texture) {
      this.#logoSprite = new PIXI.Sprite(resLogo.texture);
      this.#logoSprite.anchor.set(0, 0.5);
      this.addChild(this.#logoSprite);
    }

    const rawText = this.#rawTitle;
    this.#titleText = new PIXI.Text(rawText.toUpperCase(), {
      fill: "#ffffff",
      fontFamily: "EurostileBold",
      fontSize: 40,
      align: "center",
      wordWrap: true,
      wordWrapWidth: 600,
    });
    this.#titleText.anchor.set(1, 0.5);
    this.addChild(this.#titleText);

    this.#previewContainer = new PIXI.Container();
    this.addChild(this.#previewContainer);

    const weaponKeys = Object.keys(weaponsData);
    weaponKeys.forEach((key) => {
      const item = new WeaponItem(key, {
        onClick: (weaponKey) => {
          console.log("WeaponItem clicked:", weaponKey);
          this._manager.changeScene("weapon", { weaponKey });
        },
      });
      this.#previewItems.push(item);
      this.#previewContainer.addChild(item);
    });

    this.#previewContainer.interactive = true;
    this.#previewContainer.on("pointerdown", (e) => this._onDragStart(e));
    this.#previewContainer.on("pointerup", (e) => this._onDragEnd(e));
    this.#previewContainer.on("pointerupoutside", (e) => this._onDragEnd(e));
    this.#previewContainer.on("pointermove", (e) => this._onDragMove(e));

    const labels = ["PLAY MINIGAME", "WATCH VIDEO", "VIEW RANGE", "VISIT NERF"];
    labels.forEach((text) => {
      const btn = new ButtonGame(text, {});
      this.#buttons.push(btn);
      this.addChild(btn);
    });

    this.#buttons[0].onClick(() => {
      this._manager.changeScene("weapon-select");
    });
    this.#buttons[1].onClick(() => this._onWatchVideoClick());
    this.#buttons[2].onClick(() => {
      this._manager.changeScene("weapon");
    });
    this.#buttons[3].onClick(() => {
      window.open(
        "https://www.blasterparts.com/fr/c/categories-de-produкты/nerf-dartblaster",
        "_blank"
      );
    });
  }

  _onDragStart(e) {
    this._isDragging = true;
    this._dragStartX = e.data.global.x;
  }
  _onDragMove(e) {
    if (!this._isDragging) return;
  }
  _onDragEnd(e) {
    if (!this._isDragging) return;
    this._isDragging = false;
    const dragEndX = e.data.global.x;
    const dx = dragEndX - this._dragStartX;
    if (dx > this._dragThreshold) {
      this._goToPreviousPreview();
    } else if (dx < -this._dragThreshold) {
      this._goToNextPreview();
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
      const maxLogoWidth = rw * 0.3;
      const minLogoWidth = 60;
      let logoW = rw * 0.3;
      logoW = Math.min(maxLogoWidth, Math.max(minLogoWidth, logoW));
      const aspectLogo = logoTex.width / logoTex.height;
      const logoH = logoW / aspectLogo;
      this.#logoSprite.width = logoW;
      this.#logoSprite.height = logoH;
      this.#logoSprite.x = 20;
      this.#logoSprite.y = 20 + logoH / 2;
    }

    if (this.#titleText) {
      if (!this._titleAnimated) {
        this._titleAnimated = true;
        this.#titleText.alpha = 0;
        gsap.to(this.#titleText, {
          alpha: 1,
          duration: 1,
          ease: "power2.out",
        });
      }
      this.#titleText.text = this.#rawTitle.toUpperCase();
      const maxFontSize = 40;
      const minFontSize = 14;
      let fontSize = Math.round(rw * 0.035);
      fontSize = Math.min(maxFontSize, Math.max(minFontSize, fontSize));
      this.#titleText.style.fontSize = fontSize;
      const wrapWidth = rw * 0.6;
      this.#titleText.style.wordWrapWidth = wrapWidth;
      const marginRight = 20;
      let titleY = 20 + fontSize / 2;
      if (this.#logoSprite) titleY = this.#logoSprite.y;
      this.#titleText.x = rw - marginRight;
      this.#titleText.y = titleY;
    }

    const isMobile = rw < 600;
    if (this.#previewContainer && this.#previewItems.length > 0) {
      this.#previewContainer.removeChildren();

      if (isMobile) {
        if (this._currentPreviewIndex == null) this._currentPreviewIndex = 0;
        const item = this.#previewItems[this._currentPreviewIndex];
        let itemW = Math.min(rw * 0.6, rw - 40);
        itemW = Math.max(itemW, 80);
        const sprite = item.children.find((ch) => ch instanceof PIXI.Sprite);
        let aspect = 1;
        if (sprite && sprite.texture)
          aspect = sprite.texture.width / sprite.texture.height;
        const itemH = itemW / aspect;
        item.setSize(itemW, itemH);
        item.x = rw / 2;
        item.y = rh * 0.45;
        this.#previewContainer.addChild(item);

        gsap.killTweensOf(item.scale);
        item.scale.set(1);
        gsap.to(item.scale, {
          x: 1.05,
          y: 1.05,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.5,
        });
      } else {
        const totalItems = this.#previewItems.length;
        const gap = 20;
        const maxItemWidth = rw * 0.25;
        const minItemWidth = 80;
        let itemWidth = Math.min(
          maxItemWidth,
          (rw - gap * (totalItems - 1) - 40) / totalItems
        );
        itemWidth = Math.max(minItemWidth, itemWidth);
        const fullWidth = totalItems * itemWidth + (totalItems - 1) * gap;
        const startX = (rw - fullWidth) / 2;
        const centerY = rh * 0.45;

        this.#previewItems.forEach((item, index) => {
          const sprite = item.children.find((ch) => ch instanceof PIXI.Sprite);
          let aspect = 1;
          if (sprite && sprite.texture)
            aspect = sprite.texture.width / sprite.texture.height;
          const itemHeight = itemWidth / aspect;
          item.setSize(itemWidth, itemHeight);
          const x = startX + index * (itemWidth + gap) + itemWidth / 2;
          item.setPosition(x, centerY);
          this.#previewContainer.addChild(item);

          gsap.killTweensOf(item.scale);
          item.scale.set(1);
          gsap.to(item.scale, {
            x: 1.05,
            y: 1.05,
            duration: 1.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 0.3 + index * 0.1,
          });
        });
      }

      if (!this._previewAnimated) {
        this._previewAnimated = true;
        gsap.from(this.#previewContainer.children, {
          alpha: 0,
          y: "+=20",
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
        });
      }
    }


    const btnCount = this.#buttons.length;
    if (isMobile) {
      const btnWidth = Math.min(300, rw * 0.8);
      const btnHeight = btnWidth / (900 / 150);
      const spacing = 20;
      const totalHeight = btnCount * btnHeight + (btnCount - 1) * spacing;
      let startY = rh - 20 - totalHeight + btnHeight / 2;
      this.#buttons.forEach((btn) => {
        btn.setSize(btnWidth, btnHeight);
        btn.x = rw / 2;
        btn.y = startY;
        startY += btnHeight + spacing;
        if (!this._buttonsAnimated) {
          btn.alpha = 0;
          gsap.to(btn, { alpha: 1, duration: 0.8, delay: 0.5 });
        }
      });
    } else {
      const maxBtnWidth = 700;
      const minBtnWidth = 170;
      const btnWidth = Math.min(maxBtnWidth, Math.max(minBtnWidth, rw * 0.4));
      const aspect = 900 / 150;
      const btnHeight = btnWidth / aspect;
      const marginX = 0;
      const leftX = marginX + btnWidth / 2;
      const rightX = rw - marginX - btnWidth / 2;
      const offsetY = 60;
      const spacingY = 20;
      const firstRowY = rh - offsetY;
      const secondRowY = firstRowY - (btnHeight + spacingY);
      this.#buttons.forEach((btn) => btn.setSize(btnWidth, btnHeight));
      if (btnCount >= 4) {
        this.#buttons[0].setPosition(leftX, secondRowY);
        this.#buttons[1].setPosition(rightX, secondRowY);
        this.#buttons[2].setPosition(leftX, firstRowY);
        this.#buttons[3].setPosition(rightX, firstRowY);
      } else {
        const startX = rw / 2;
        const startY = rh - offsetY;
        this.#buttons.forEach((btn, idx) => {
          btn.setPosition(startX, startY - idx * (btnHeight + spacingY));
        });
      }
      if (!this._buttonsAnimated) {
        this._buttonsAnimated = true;
        gsap.from(this.#buttons, {
          alpha: 0,
          y: "+=50",
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
        });
      }
    }

    this._animated = true;
  }

  _goToPreviousPreview() {
    const len = this.#previewItems.length;
    this._currentPreviewIndex = (this._currentPreviewIndex - 1 + len) % len;
    this._previewAnimated = false;
    this.onResize(this._manager.rendererWidth, this._manager.rendererHeight);
  }
  _goToNextPreview() {
    const len = this.#previewItems.length;
    this._currentPreviewIndex = (this._currentPreviewIndex + 1) % len;
    this._previewAnimated = false;
    this.onResize(this._manager.rendererWidth, this._manager.rendererHeight);
  }

  _onWatchVideoClick() {
    this.interactiveChildren = false;
    const videoUrl = "/assets/videos/nerf_video.mp4";
    this._videoPlayer = new VideoPlayer(videoUrl, {
      onEnd: () => {
        this.interactiveChildren = true;
      },
      loop: false,
      muted: false,
      controls: false,
    });
    this._videoPlayer.play();
  }
}
