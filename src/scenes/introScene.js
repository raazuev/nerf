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
  images = [];
  #rawTitle =
    "Choose your blaster then shoot as many targets as you can within";
  #previewContainer;
  #previewItems = [];
  _logoAnimated = false;
  _buttonsAnimated = false;
  _previewAnimated = false;
  _videoPlayer = null;

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
      fontFamily: "EurostileBold",
      fontSize: 48,
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
        "https://www.blasterparts.com/fr/c/categories-de-produits/nerf-dartblaster",
        "_blank"
      );
    });
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
      const maxLogoWidth = rw * 0.5;
      const minLogoWidth = 100;
      let logoW = rw * 0.4;
      logoW = Math.min(maxLogoWidth, Math.max(minLogoWidth, logoW));
      const aspectLogo = logoTex.width / logoTex.height;
      const logoH = logoW / aspectLogo;
      this.#logoSprite.width = logoW;
      this.#logoSprite.height = logoH;
      const marginLeft = 20;
      const marginTop = 20;
      this.#logoSprite.x = marginLeft;
      this.#logoSprite.y = marginTop + logoH / 2;
    }

    if (this.#titleText) {
      this.#titleText.text = this.#rawTitle.toUpperCase();

      const maxFontSize = 40;
      const minFontSize = 16;
      let fontSize = Math.round(rw * 0.035);
      fontSize = Math.min(maxFontSize, Math.max(minFontSize, fontSize));
      this.#titleText.style.fontSize = fontSize;
      const wrapWidth = rw * 0.6;
      this.#titleText.style.wordWrapWidth = wrapWidth;

      const marginRight = 20;
      const marginTop = 20;

      let titleY;
      if (this.#logoSprite) {
        titleY = this.#logoSprite.y;
      } else {
        titleY = marginTop + fontSize / 2;
      }
      this.#titleText.x = rw - marginRight;
      this.#titleText.y = titleY;
    }

    if (this.#previewContainer && this.#previewItems.length > 0) {
      const totalItems = this.#previewItems.length;
      const gap = 20;
      const maxItemWidth = rw * 0.25;
      const minItemWidth = 80;

      let itemWidth = Math.min(
        maxItemWidth,
        (rw - gap * (totalItems - 1) - 40) / totalItems
      );
      itemWidth = Math.max(minItemWidth, itemWidth);

      this.#previewContainer.removeChildren();

      const fullWidth = totalItems * itemWidth + (totalItems - 1) * gap;
      const startX = (rw - fullWidth) / 2;
      const centerY = rh * 0.45;
      this.#previewItems.forEach((item, index) => {
        const sprite = item.children.find((ch) => ch instanceof PIXI.Sprite);
        let aspect = 1;
        if (sprite && sprite.texture) {
          aspect = sprite.texture.width / sprite.texture.height;
        }
        const itemHeight = itemWidth / aspect;
        this.#previewContainer.addChild(item);
        item.setSize(itemWidth, itemHeight);
        const x = startX + index * (itemWidth + gap) + itemWidth / 2;
        item.setPosition(x, centerY);
      });
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

    this.#buttons.forEach((btn) => {
      btn.setSize(btnWidth, btnHeight);
    });

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

  _onWatchVideoClick() {
    this.interactiveChildren = false;

    const videoUrl = "/assets/videos/nerf_video.mp4";

    this._videoPlayer = new VideoPlayer(videoUrl, {
      onEnd: () => {
        this.interactiveChildren = true;
        console.log("Video ended, интерактивность возвращена");
      },
      loop: false,
      muted: false,
      controls: false,
    });
    this._videoPlayer.play();
  }
}
