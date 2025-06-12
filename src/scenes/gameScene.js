import * as PIXI from "pixi.js";
import { BaseScene } from "../core/baseScene";
import { gsap } from "gsap";

export class GameScene extends BaseScene {
  #weaponKey;
  #data;
  _score = 0;
  _scoreText;
  _timerText;
  _timeLeft = 20;
  _spawnInterval = 1000;
  _lastSpawnTime = 0;
  _targets = [];
  _timerTickerFunction;
  _startTime = 0;

  constructor(manager, params = {}) {
    super(manager);
    this.#weaponKey = params.weaponKey;
    this.#data = this.#weaponKey
      ? PIXI.Loader.shared.resources[this.#weaponKey] && params
      : null;
  }

  init() {
    this._score = 0;
    this._timeLeft = 20;
    this._scoreText = new PIXI.Text("Score: 0", {
      fontFamily: "EurostileBold",
      fontSize: 24,
      fill: "#ffffff",
    });
    this._scoreText.anchor.set(0, 0);
    this.addChild(this._scoreText);

    this._timerText = new PIXI.Text("Time: 20", {
      fontFamily: "EurostileBold",
      fontSize: 24,
      fill: "#ffffff",
    });
    this._timerText.anchor.set(1, 0);
    this.addChild(this._timerText);

    this._startTime = performance.now();
    this._lastSpawnTime = performance.now();

    this._scoreText.alpha = 0;
    this._timerText.alpha = 0;
    gsap.to(this._scoreText, { alpha: 1, duration: 0.5 });
    gsap.to(this._timerText, { alpha: 1, duration: 0.5, delay: 0.2 });
  }

  onResize(rw, rh) {
    if (this._scoreText) {
      this._scoreText.style.fontSize = Math.round(rw * 0.03);
      this._scoreText.x = 20;
      this._scoreText.y = 20;
    }
    if (this._timerText) {
      this._timerText.style.fontSize = Math.round(rw * 0.03);
      this._timerText.x = rw - 20;
      this._timerText.y = 20;
    }
  }

  update(delta) {
    const now = performance.now();
    const elapsed = (now - this._startTime) / 1000;
    const timeLeft = Math.max(0, 20 - elapsed);
    if (Math.floor(this._timeLeft) !== Math.floor(timeLeft)) {
      this._timeLeft = timeLeft;
      this._timerText.text = `Time: ${Math.ceil(timeLeft)}`;
    }
    if (now - this._lastSpawnTime > this._spawnInterval) {
      this._spawnTarget();
      this._lastSpawnTime = now;
    }

    const toRemove = [];
    this._targets.forEach((t) => {
      const dt = delta / PIXI.Ticker.shared.FPS;
      t.velocity.x += t.acceleration.x * dt;
      t.velocity.y += t.acceleration.y * dt;
      t.sprite.x += t.velocity.x * dt;
      t.sprite.y += t.velocity.y * dt;
      const buffer = 50;
      if (
        t.sprite.x < -buffer ||
        t.sprite.x > this._manager.rendererWidth + buffer ||
        t.sprite.y < -buffer ||
        t.sprite.y > this._manager.rendererHeight + buffer
      ) {
        toRemove.push(t);
      }
    });
    toRemove.forEach((t) => this._destroyTarget(t));

    if (timeLeft <= 0) {
      this._targets.forEach((t) => this._destroyTarget(t));
      this._targets = [];
      const finalScore = this._score;
      this._onGameOver(finalScore);
    }
  }

  _spawnTarget() {
    const rw = this._manager.rendererWidth;
    const rh = this._manager.rendererHeight;
    const x0 = Math.random() * rw;
    const y0 = 20 + Math.random() * (rh - 60 - 20);
    const cx = rw / 2,
      cy = rh / 2;
    let dx = x0 - cx,
      dy = y0 - cy;
    if (Math.hypot(dx, dy) < 10) {
      const angle = Math.random() * Math.PI * 2;
      dx = Math.cos(angle);
      dy = Math.sin(angle);
    }
    const len = Math.hypot(dx, dy);
    const dirX = dx / len,
      dirY = dy / len;
    const minV = 100;
    const maxV = 300;
    const speed = minV + Math.random() * (maxV - minV);
    const points = Math.max(1, Math.floor(speed / 50));
    const accMag = 20;
    const ax = dirX * accMag;
    const ay = dirY * accMag;
    const radius = 30;
    const circle = new PIXI.Graphics();
    circle.beginFill(0xff0000);
    circle.drawCircle(0, 0, radius);
    circle.endFill();
    circle.x = x0;
    circle.y = y0;
    circle.interactive = true;
    circle.buttonMode = true;
    const text = new PIXI.Text(String(points), {
      fontFamily: "EurostileBold",
      fontSize: 20,
      fill: "#ffffff",
    });
    text.anchor.set(0.5);
    circle.addChild(text);

    const targetObj = {
      sprite: circle,
      velocity: { x: dirX * speed, y: dirY * speed },
      acceleration: { x: ax, y: ay },
      points,
    };
    circle.on("pointertap", () => {
      this._score += points;
      this._scoreText.text = `Score: ${this._score}`;
      this._destroyTarget(targetObj);
    });
    this.addChild(circle);
    this._targets.push(targetObj);
  }

  _destroyTarget(t) {
    if (t.sprite) {
      t.sprite.removeAllListeners();
      this.removeChild(t.sprite);
      t.sprite.destroy();
    }
    const idx = this._targets.indexOf(t);
    if (idx >= 0) this._targets.splice(idx, 1);
  }

  _onGameOver(finalScore) {
    this._manager.changeScene("game-over", {
      score: finalScore,
      weaponKey: this.#weaponKey,
    });
  }
}
