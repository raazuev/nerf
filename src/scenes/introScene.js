import * as PIXI from "pixi.js";
import { BaseScene } from "../core/baseScene";
import { gsap } from "gsap";
import { ButtonGame } from "../utils/textButton";

export class IntroScene extends BaseScene {
  #startBtn;
  #videoBtn;
  #viewRangeBtn;
  #visitNerfBth;

  init() {
    const bg = new PIXI.Sprite(PIXI.Loader.shared.resources.main_bg.texture);
    console.log("BG texture:", bg.texture.width, bg.texture.height);

    const scale = Math.max(
      this._manager.rendererWidth / bg.texture.width,
      this._manager.rendererHeight / bg.texture.height
    );

    bg.anchor.set(0.5);
    bg.scale.set(scale);
    bg.x = this._manager.rendererWidth / 2;
    bg.y = this._manager.rendererHeight / 2;
    this.addChild(bg);

    this.#startBtn = new ButtonGame("PLAY MINIGAME");
    this.#videoBtn = new ButtonGame("START");
    this.#viewRangeBtn = new ButtonGame("VIEW RANGE");
    this.#visitNerfBth = new ButtonGame("VISIT NERF");

    this.#startBtn.setPosition(
      this._manager.rendererWidth / 2,
      this._manager.rendererHeight - 300
    );
    this.#videoBtn.setPosition(
      this._manager.rendererHeight / 2,
      this._manager.rendererHeight - 300
    );

    this.#viewRangeBtn.setPosition(
      this._manager.rendererHeight / 2,
      this._manager.rendererHeight - 350
    );

    this.#visitNerfBth.setPosition(
      this._manager.rendererHeight / 2,
      this._manager.rendererHeight - 250
    );

    this.addChild(
      this.#startBtn,
      this.#videoBtn,
      this.#viewRangeBtn,
      this.#visitNerfBth
    );

    this.#startBtn.onClick(() => this._manager.changeScene("weapon-select"));
    this.#videoBtn.onClick(() => this._manager.changeScene("weapon-select"));
    this.#viewRangeBtn.onClick(() =>
      this._manager.changeScene("weapon-select")
    );
    this.#visitNerfBth.onClick(() =>
      this._manager.changeScene("weapon-select")
    );

    gsap.from([this.#startBtn, this.#videoBtn], {
      alpha: 0,
      y: "+=50",
      duration: 1,
      stagger: 0.2,
    });
  }
}

// init() {
//   const bg = new PIXI.Sprite(PIXI.Loader.shared.resources.main_bg.texture);
//   this.addChild(bg);

//   this.#startBtn = new PIXI.Text("PLAY MINIGAME", {
//     fill: "#fff",
//     fontSize: 48,
//   });
//   this.#videoBtn = new PIXI.Text("WATCH VIDEO", {
//     fill: "#fff",
//     fontSize: 48,
//   });
//   this.#videoBtn.interactive = true;
//   this.#videoBtn.buttonMode = true;
//   this.#videoBtn.x = (bg.width - this.#startBtn.width) / 2;
//   this.#videoBtn.y = bg.height - 100;
//   this.addChild(this.#videoBtn);
//   //
//   this.#startBtn.interactive = true;
//   this.#startBtn.buttonMode = true;
//   this.#startBtn.x = (bg.width - this.#startBtn.width) / 2;
//   this.#startBtn.y = bg.height - 300;
//   this.addChild(this.#startBtn);

//   this.#startBtn.on("pointerdown", () => {
//     this._manager.changeScene("weapon-select");
//   });
//   this.#videoBtn.on("pointerdown", () => {
//     this._manager.changeScene("weapon-select");
//   });

//   gsap.from(this.#startBtn, {
//     alpha: 0,
//     y: this.#startBtn.y + 50,
//     duration: 1,
//   });

//   gsap.from(this.#videoBtn, {
//     alpha: 0,
//     y: this.#startBtn.y + 50,
//     duration: 1,
//   });
// }
