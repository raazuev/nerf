import * as PIXI from "pixi.js";
import { BaseScene } from "../core/baseScene";
import { gsap } from "gsap";

export class GameScene extends BaseScene {
  #weaponKey;
  #data;
  _score = 0;
  _scoreText;
  _timerText;
  _duration = 20;
  _startTime = 0;
  _endTime = 0;
  _gameOverTriggered = false;
  _spawnInterval = 1000;
  _lastSpawnTime = 0;
  _targets = [];
  _hudContainer;
  _logoSprite;
  _titleText;

  constructor(manager, params = {}) {
    super(manager);
    this.#weaponKey = params.weaponKey;
    this.#data = this.#weaponKey
      ? PIXI.Loader.shared.resources[this.#weaponKey]
      : null;
  }

  init() {
    this._hudContainer = new PIXI.Container();
    this.addChild(this._hudContainer);

    const resLogo = PIXI.Loader.shared.resources.logo_primary;
    if (resLogo && resLogo.texture) {
      this._logoSprite = new PIXI.Sprite(resLogo.texture);
      this._logoSprite.anchor.set(0, 0.5);
      this._hudContainer.addChild(this._logoSprite);
    }
    this._titleText = new PIXI.Text("GAME", {
      fontFamily: "EurostileBold",
      fontSize: 28,
      fill: "#ffffff",
      align: "center",
    });
    this._titleText.anchor.set(0.5, 0.5);
    this._hudContainer.addChild(this._titleText);
    this._timerText = new PIXI.Text("Time: 20", {
      fontFamily: "EurostileBold",
      fontSize: 24,
      fill: "#ffffff",
      align: "right",
    });
    this._timerText.anchor.set(1, 0);
    this._hudContainer.addChild(this._timerText);
    this._scoreText = new PIXI.Text("Score: 0", {
      fontFamily: "EurostileBold",
      fontSize: 24,
      fill: "#ffffff",
      align: "right",
    });
    this._scoreText.anchor.set(1, 0);
    this._hudContainer.addChild(this._scoreText);

    this._score = 0;
    this._scoreText.text = `Score: ${this._score}`;
    this._startTime = performance.now();
    this._duration = 20;
    this._endTime = this._startTime + this._duration * 1000;
    this._gameOverTriggered = false;
    this._lastSpawnTime = performance.now();

    this._hudContainer.alpha = 0;
    gsap.to(this._hudContainer, { alpha: 1, duration: 0.5 });
  }

  onResize(rw, rh) {
    if (this._hudContainer) {
      if (this._logoSprite) {
        const logoW = Math.min(rw * 0.1, 100);
        const aspect =
          this._logoSprite.texture.width / this._logoSprite.texture.height;
        this._logoSprite.width = logoW;
        this._logoSprite.height = logoW / aspect;
        this._logoSprite.x = 20;
        this._logoSprite.y = 20 + this._logoSprite.height / 2;
      }

      if (this._titleText) {
        const fontSize = Math.min(Math.max(Math.round(rw * 0.04), 20), 36);
        this._titleText.style.fontSize = fontSize;
        this._titleText.x = rw / 2;
        this._titleText.y = 20 + fontSize / 2;
      }

      if (this._timerText) {
        const fontSize = Math.min(Math.max(Math.round(rw * 0.03), 18), 30);
        this._timerText.style.fontSize = fontSize;
        this._timerText.x = rw - 20;
        this._timerText.y = 20;
      }
      if (this._scoreText) {
        const fontSize = Math.min(Math.max(Math.round(rw * 0.03), 18), 30);
        this._scoreText.style.fontSize = fontSize;
        this._scoreText.x = rw - 20;
        this._scoreText.y = this._timerText
          ? this._timerText.y + this._timerText.height + 5
          : 20 + fontSize + 5;
      }
    }
  }

  update(delta) {
    const now = performance.now();

    const timeLeftSec = Math.max(0, (this._endTime - now) / 1000);
    if (this._timerText) {
      const newText = `Time: ${Math.ceil(timeLeftSec)}`;
      if (this._timerText.text !== newText) {
        this._timerText.text = newText;
      }
    }

    if (now >= this._endTime && !this._gameOverTriggered) {
      this._gameOverTriggered = true;
      this._targets.forEach((t) => this._destroyTarget(t));
      this._targets = [];
      const finalScore = this._score;
      this._onGameOver(finalScore);
      return;
    }
    if (!this._gameOverTriggered) {
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
    const minV = 100,
      maxV = 300;
    const speed = minV + Math.random() * (maxV - minV);
    const points = Math.max(1, Math.floor(speed / 50));
    const accMag = 20;
    const ax = dirX * accMag,
      ay = dirY * accMag;
    const maxPoints = Math.floor(maxV / 50);
    const maxRadius = 40;
    const minRadius = 15;
    const deltaR = (maxRadius - minRadius) / Math.max(1, maxPoints - 1);
    const radius = Math.max(minRadius, maxRadius - (points - 1) * deltaR);
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
      fontSize: Math.max(12, Math.round(radius * 0.6)),
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
      if (this._scoreText) this._scoreText.text = `Score: ${this._score}`;
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
