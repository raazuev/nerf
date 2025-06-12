import * as PIXI from "pixi.js";
import { BaseScene } from "../core/baseScene";
import { ButtonGame } from "../utils/textButton";
import { VideoPlayer } from "../utils/videoPlayer";

export class GameOverScene extends BaseScene {
  #score;
  #weaponKey;
  #sprite;
  #scoreText;
  #backButton;
  #playAgainButton;
  _videoPlayer;

  constructor(manager, params = {}) {
    super(manager);
    this.#score = params.score || 0;
    this.#weaponKey = params.weaponKey;
  }

  init() {
    const rw = this._manager.rendererWidth;
    const rh = this._manager.rendererHeight;

    if (this.#weaponKey) {
      const res = PIXI.Loader.shared.resources[this.#weaponKey];
      if (res && res.texture) {
        this.#sprite = new PIXI.Sprite(res.texture);
        this.#sprite.anchor.set(0.5);
        this.addChild(this.#sprite);
      }
    }
    this.#scoreText = new PIXI.Text(`Your Score: ${this.#score}`, {
      fontFamily: "EurostileBold",
      fontSize: 36,
      fill: "#ffffff",
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

    setTimeout(() => {
      this._playPromoVideo();
    }, 500);
  }

  onResize(rw, rh) {
    if (this.#sprite) {
      const maxW = rw * 0.3;
      const minW = 100;
      let w = Math.min(maxW, Math.max(minW, maxW));
      const aspect = this.#sprite.texture.width / this.#sprite.texture.height;
      const h = w / aspect;
      this.#sprite.width = w;
      this.#sprite.height = h;
      this.#sprite.x = rw / 2;
      this.#sprite.y = rh * 0.25;
    }
    if (this.#scoreText) {
      const fontSize = Math.min(Math.max(Math.round(rw * 0.04), 24), 48);
      this.#scoreText.style.fontSize = fontSize;
      this.#scoreText.x = rw / 2;
      this.#scoreText.y = this.#sprite
        ? this.#sprite.y + this.#sprite.height / 2 + 20 + fontSize / 2
        : rh * 0.3;
    }
    const btnW = Math.min(300, rw * 0.4);
    const btnH = btnW / 4;
    if (this.#playAgainButton) {
      this.#playAgainButton.setSize(btnW, btnH);
      this.#playAgainButton.x = rw / 2;
      this.#playAgainButton.y = rh * 0.6;
    }
    if (this.#backButton) {
      this.#backButton.setSize(btnW, btnH);
      this.#backButton.x = rw / 2;
      this.#backButton.y = rh * 0.7;
    }
  }

  _onPlayAgain() {
    this._manager.changeScene("game", { weaponKey: this.#weaponKey });
  }
  _onBackToMenu() {
    this._manager.changeScene("intro");
  }

  _playPromoVideo() {
    const videoUrl = "/videos/promo.mp4";
    this.interactiveChildren = false;
    this._videoPlayer = new VideoPlayer(videoUrl, {
      onEnd: () => {
        this.interactiveChildren = true;
      },
      style: { backgroundColor: "rgba(0,0,0,0.8)", zIndex: "2000" },
      videoStyle: {
        width: "70vw",
        maxHeight: "70vh",
        containerBackgroundColor: "black",
        closeColor: "#fff",
        closeBgColor: "rgba(0,0,0,0.6)",
        closeFontSize: "28px",
        containerStyle: { borderRadius: "8px", overflow: "hidden" },
      },
    });
    this._videoPlayer.play();
  }
}
