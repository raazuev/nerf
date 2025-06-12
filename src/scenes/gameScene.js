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
  _crosshair;

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

    this._timerText = new PIXI.Text("Time: 0", {
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

    const resCross = PIXI.Loader.shared.resources["target"];
    if (resCross && resCross.texture) {
      this._crosshair = new PIXI.Sprite(resCross.texture);
      this._crosshair.anchor.set(0.5);
      this._crosshair.width = 40;
      this._crosshair.height = 40;
      this._crosshair.alpha = 0;
      this.addChild(this._crosshair);
    }

    this.interactive = true;
    this.on("pointermove", this._onPointerMove, this);
    this.on("pointerdown", this._onPointerDown, this);
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

    if (this._crosshair && this._crosshair.alpha === 0) {
      this._crosshair.x = -100;
      this._crosshair.y = -100;
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
      const isMobile = this._manager.rendererWidth < 768;
      const spawnInterval = isMobile ? 1200 : this._spawnInterval;
      if (now - this._lastSpawnTime > spawnInterval) {
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

  _onPointerMove(event) {
    const pos = event.data.global;
    if (this._crosshair) {
      this._crosshair.alpha = 1;
      this._crosshair.x = pos.x;
      this._crosshair.y = pos.y;
    }
  }

  _onPointerDown(event) {
    if (this._crosshair) {
      gsap.killTweensOf(this._crosshair.scale);
      gsap.fromTo(
        this._crosshair.scale,
        { x: 0.5, y: 0.5 },
        {
          x: 0.2,
          y: 0.2,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power1.out",
        }
      );
      const origY = this._crosshair.y;
      gsap.to(this._crosshair, {
        y: origY + 5,
        duration: 0.05,
        yoyo: true,
        repeat: 1,
        ease: "power1.out",
      });
    }
  }

  _spawnTarget() {
    const rw = this._manager.rendererWidth;
    const rh = this._manager.rendererHeight;
    const pointsArr = [10, 20, 30, 50, 100];
    const points = pointsArr[Math.floor(Math.random() * pointsArr.length)];
    const maxRadius = 60;
    const minRadius = 25;
    const idx = pointsArr.indexOf(points);
    const maxIdx = pointsArr.length - 1;
    const radius = maxRadius - ((maxRadius - minRadius) * idx) / maxIdx;

    const minV = 80;
    const maxV = 200;
    const speed = minV + ((maxV - minV) * idx) / maxIdx;

    const topOffset = 60;
    const x0 = Math.random() * rw;
    const y0 = topOffset + Math.random() * (rh - topOffset - 20);

    const angle = Math.random() * Math.PI * 2;
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);

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
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      points,
      radius,
    };

    circle.on("pointertap", () => {
      circle.interactive = false;
      gsap.killTweensOf(circle);
      gsap.to(circle.scale, {
        x: 1.5,
        y: 1.5,
        duration: 0.3,
        ease: "power1.out",
      });
      gsap.to(circle, {
        alpha: 0,
        duration: 0.4,
        delay: 0.2,
        onComplete: () => {
          this._score += points;
          if (this._scoreText) this._scoreText.text = `Score: ${this._score}`;
          this._destroyTarget(targetObj);
          if (this._crosshair) {
            gsap.killTweensOf(this._crosshair.scale);
            gsap.fromTo(
              this._crosshair.scale,
              { x: 1.0, y: 1.0 },
              {
                x: 1.6,
                y: 1.6,
                duration: 0.2,
                yoyo: true,
                repeat: 1,
                ease: "power1.out",
              }
            );
          }
        },
      });
    });

    this.addChild(circle);
    this._targets.push(targetObj);

    const delayMs = 300 + Math.random() * 200;
    setTimeout(() => {
      if (!this._targets.includes(targetObj)) return;
      targetObj.velocity.x = dirX * speed;
      targetObj.velocity.y = dirY * speed;
      targetObj.acceleration.x = 0;
      targetObj.acceleration.y = 0;
    }, delayMs);
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
