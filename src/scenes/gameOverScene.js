import * as PIXI from "pixi.js";
import { BaseScene } from "../core/baseScene";
import { ButtonGame } from "../utils/textButton";

export class GameOverScene extends BaseScene {
  #score;
  #weaponKey;
  _logoSprite;
  _titleText;
  _videoSprite;
  _videoEl;
  #spriteWeapon;
  #scoreText;
  #backButton;
  #playAgainButton;

  constructor(manager, params = {}) {
    super(manager);
    this.#score = params.score || 0;
    this.#weaponKey = params.weaponKey;
  }

  init() {
    const rw = this._manager.rendererWidth;
    const rh = this._manager.rendererHeight;

    this._createHeader();

    if (this.#weaponKey) {
      const res = PIXI.Loader.shared.resources[this.#weaponKey];
      if (res && res.texture) {
        this.#spriteWeapon = new PIXI.Sprite(res.texture);
        this.#spriteWeapon.anchor.set(0.5);
        this.addChild(this.#spriteWeapon);
      }
    }
    this.#scoreText = new PIXI.Text(`Your Score: ${this.#score}`, {
      fontFamily: "EurostileBold",
      fontSize: 36,
      fill: "#ffffff",
      align: "center",
    });
    this.#scoreText.anchor.set(0.5);
    this.addChild(this.#scoreText);

    this.#playAgainButton = new ButtonGame("PLAY AGAIN", {
      fontFamily: "EurostileBold",
      fontSize: 24,
    });
    this.#playAgainButton.onClick(() => this._onPlayAgain());
    this.addChild(this.#playAgainButton);

    this.#backButton = new ButtonGame("BACK TO MENU", {
      fontFamily: "EurostileBold",
      fontSize: 24,
    });
    this.#backButton.onClick(() => this._onBackToMenu());
    this.addChild(this.#backButton);

    this._createBackgroundVideo();

    this.onResize(rw, rh);
  }

  _createHeader() {
    const resLogo = PIXI.Loader.shared.resources.logo_primary;
    if (resLogo && resLogo.texture) {
      this._logoSprite = new PIXI.Sprite(resLogo.texture);
      this._logoSprite.anchor.set(1, 0.5);
      this.addChild(this._logoSprite);
    }
    this._titleText = new PIXI.Text("GAME OVER", {
      fontFamily: "EurostileBold",
      fontSize: 32,
      fill: "#ffffff",
      align: "left",
    });
    this._titleText.anchor.set(0, 0.5);
    this.addChild(this._titleText);
  }

  _createBackgroundVideo() {
    const videoUrl = "/assets/videos/nerf_video.mp4";
    const videoEl = document.createElement("video");
    videoEl.src = videoUrl;
    videoEl.loop = true;
    videoEl.muted = false;
    videoEl.playsInline = true;
    videoEl.autoplay = true;
    videoEl.style.display = "none";
    videoEl.preload = "auto";

    document.body.appendChild(videoEl);
    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("GameOverScene: video autoplay error:", err);
      });
    }
    const texture = PIXI.Texture.from(videoEl);
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);

    this._videoEl = videoEl;
    this._videoSprite = sprite;

    this.addChildAt(sprite, 0);
  }

  onResize(rw, rh) {
    if (this._videoSprite) {
      const tex = this._videoSprite.texture.baseTexture.resource.source;

      const videoEl = this._videoEl;

      const vw = videoEl.videoWidth || rw;
      const vh = videoEl.videoHeight || rh;
      if (vw && vh) {
        const scale = Math.max(rw / vw, rh / vh);
        this._videoSprite.width = vw * scale;
        this._videoSprite.height = vh * scale;
      } else {
        this._videoSprite.width = rw;
        this._videoSprite.height = rh;
      }
      this._videoSprite.x = rw / 2;
      this._videoSprite.y = rh / 2;
      this._videoSprite.alpha = 0.4;
    }

    if (this._logoSprite) {
      const logoMaxW = Math.min(rw * 0.15, 120);
      const aspect =
        this._logoSprite.texture.width / this._logoSprite.texture.height;
      this._logoSprite.width = logoMaxW;
      this._logoSprite.height = logoMaxW / aspect;
      this._logoSprite.x = rw - 20;
      this._logoSprite.y = 20 + this._logoSprite.height / 2;
    }
    if (this._titleText) {
      const fontSize = Math.min(Math.max(Math.round(rw * 0.04), 20), 48);
      this._titleText.style.fontSize = fontSize;
      if (this._logoSprite) {
        const logoLeft = this._logoSprite.x - this._logoSprite.width / 2;
        const maxTextX = logoLeft - 20;
        this._titleText.y = this._logoSprite.y;
        this._titleText.x = 20;
        this._titleText.style.wordWrap = true;
        this._titleText.style.wordWrapWidth = Math.max(50, maxTextX - 20);
      } else {
        this._titleText.x = rw / 2;
        this._titleText.y = 20 + fontSize / 2;
        this._titleText.anchor.set(0.5, 0.5);
      }
    }

    const isMobile = rw < 600;

    if (this.#spriteWeapon) {
      if (isMobile) {
        const maxW = rw * 0.5;
        const aspect =
          this.#spriteWeapon.texture.width / this.#spriteWeapon.texture.height;
        const w = Math.min(maxW, this.#spriteWeapon.texture.width);
        const h = w / aspect;
        this.#spriteWeapon.width = w;
        this.#spriteWeapon.height = h;
        this.#spriteWeapon.x = rw / 2;
        let topY = 20 + (this._titleText ? this._titleText.height : 0) + 20;
        this.#spriteWeapon.y = topY + h / 2;
      } else {
        const maxW = rw * 0.3;
        const aspect =
          this.#spriteWeapon.texture.width / this.#spriteWeapon.texture.height;
        let w = Math.min(maxW, this.#spriteWeapon.texture.width);
        const h = w / aspect;
        this.#spriteWeapon.width = w;
        this.#spriteWeapon.height = h;
        this.#spriteWeapon.x = rw * 0.25;
        this.#spriteWeapon.y = rh * 0.3;
      }
    }
    if (this.#scoreText) {
      const fontSize = Math.min(Math.max(Math.round(rw * 0.04), 20), 48);
      this.#scoreText.style.fontSize = fontSize;
      if (this.#spriteWeapon) {
        this.#scoreText.x = this.#spriteWeapon.x;
        this.#scoreText.y =
          this.#spriteWeapon.y +
          this.#spriteWeapon.height / 2 +
          20 +
          fontSize / 2;
      } else {
        this.#scoreText.x = rw / 2;
        this.#scoreText.y = rh * 0.3;
      }
      this.#scoreText.anchor.set(0.5, 0.5);
    }

    const btnW = Math.min(300, rw * (isMobile ? 0.8 : 0.3));
    const btnH = btnW / 4;
    if (isMobile) {
      let startY = rh - 20 - btnH / 2;
      if (this.#backButton) {
        this.#backButton.setSize(btnW, btnH);
        this.#backButton.x = rw / 2;
        this.#backButton.y = startY;
        startY -= btnH + 15;
      }
      if (this.#playAgainButton) {
        this.#playAgainButton.setSize(btnW, btnH);
        this.#playAgainButton.x = rw / 2;
        this.#playAgainButton.y = startY;
      }
    } else {
      if (this.#backButton) {
        this.#backButton.setSize(btnW, btnH);
        this.#backButton.x = 20 + btnW / 2;
        this.#backButton.y = rh - 20 - btnH / 2;
      }
      if (this.#playAgainButton) {
        this.#playAgainButton.setSize(btnW, btnH);
        this.#playAgainButton.x = rw - 20 - btnW / 2;
        this.#playAgainButton.y = rh - 20 - btnH / 2;
      }
    }
  }

  _onPlayAgain() {
    this._stopVideo();
    this._manager.changeScene("game", { weaponKey: this.#weaponKey });
  }
  _onBackToMenu() {
    this._stopVideo();
    this._manager.changeScene("intro");
  }

  _stopVideo() {
    if (this._videoSprite) {
      this.removeChild(this._videoSprite);
      this._videoSprite.texture.baseTexture.resource.source.pause();
      if (this._videoEl && this._videoEl.parentNode) {
        this._videoEl.pause();
        this._videoEl.src = "";
        this._videoEl.parentNode.removeChild(this._videoEl);
      }
      this._videoSprite.destroy();
      this._videoSprite = null;
      this._videoEl = null;
    }
  }

  destroy(options) {
    this._stopVideo();
    super.destroy(options);
  }
}
